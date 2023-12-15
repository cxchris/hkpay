import dotenv from 'dotenv';
import { verifySign,tojson,writeJson,writeScript } from '../lib/utils.js';
import { execSync, spawnSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import Logger from '../lib/logger.js';
dotenv.config();
const logger = new Logger('listen');
// logger.info('test');

let instruck;
if (process.platform === 'win32') {
    // windows
    instruck = 'pm2';
} else {
    // linux
    instruck = '/root/.nvm/versions/node/v18.14.2/bin/pm2';
}
const encod = 'utf-8'
const Vkey = process.env.key; //验签key

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const Dir = resolve(__dirname, '..');

/**
 * 获取pm2 list
 * @param {*} req 
 * @param {*} res 
 */
export const getlist = async (req, res) => {
    try {
        const command = instruck + ' list'
        // console.log(command)
        const output = execSync(command, { encoding: encod });
        // console.log(output)
        const json = tojson(output);
        const data = JSON.parse(json)
        res.success(data);
    } catch (error) {
        console.log(error.message)
        res.error(error.message);
    }
};


//start pm2
export const pmStart = async (req, res) => {
    try {
        const formData = req.body;
        const requiredFields = ['id', 'user', 'password', 'host', 'port', 'key', 'egex'];

        for (const field of requiredFields) {
            if (!formData[field]) {
                throw new Error(`${field}必传`);
            }
        }

        // 继续执行其他逻辑，因为所有必要的字段都已通过检查
        const id = formData.id;
        const user = formData.user;
        const password = formData.password;
        const host = formData.host;
        const port = formData.port;
        const key = formData.key;
        const egex = formData.egex;

        //写入配置config目录
        await writeJson(id, key, egex);
        
        //写入脚本文件
        const config = {
            user: user,
            password: password,
            host: host,
            port: Number(port),
            tls: true,
            tlsOptions: {
                rejectUnauthorized: false
            }
        }
        await writeScript(id, config);
        // 验证签名
        const isValidSignature = verifySign(formData, Vkey);
        if (!isValidSignature) {
            throw new Error('Invalid signature');
        }

        let path;
        path = Dir+'/script/';
        // // console.log(path)
        const command = instruck + ' start '+path+id+'.js --name="'+id+'"';

        const output = execSync( command , { encoding: encod });

        // console.log(output)
        // const json = tojson(output);
        const data = { id }
        res.success(data);
    } catch (error) {
        console.log(error.message)
        res.error(error.message);
    }
}

//close pm2
export const pmStop = (req, res) => {
    try {
        const formData = req.body;
        const id = formData.id; //传入的
        if (!id) {
            throw new Error('id cannot be empty');
        }

        // 验证签名
        const isValidSignature = verifySign(formData, Vkey);
        if (!isValidSignature) {
            throw new Error('Invalid signature');
        }

        const command = instruck +' stop '+id;

        // console.log(command)
        const output = execSync( command , { encoding: encod });
        // console.log(3333)
        // console.log(output)
        // const json = tojson(output);
        const data = { id }
        res.success(data);
    } catch (error) {
        console.log(error.message)
        res.error(error.message);
    }
}