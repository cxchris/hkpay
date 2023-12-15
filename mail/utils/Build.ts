import { Econfig } from '../utils/EmailListener';
import { writeFile } from 'fs/promises';

interface configJson {
    id: string;
    key: string;
    egex: string
}

/**
 * 编译脚本并且重启脚本
 */
export async function compileAndStart(id: string, config: Econfig) {
    try {
        const content = JSON.stringify(config, null, 4)
        const name = `${id}.js`
        const fileName = `./script/${name}`;
        const fileContent =
`"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EmailListener_1 = require("../utils/EmailListener");
const Logger_1 = __importDefault(require("../utils/Logger"));
const GetFileName_1 = __importDefault(require("../utils/GetFileName"));
const _name = (0, GetFileName_1.default)(__filename);
const logger = new Logger_1.default(_name);
const config = ${content};
// console.log('配置文件内容:', config);
try {
    (0, EmailListener_1.readEmailListener)(config, _name);
}
catch (err) {
    logger.error('运行mail listener出错:' + err);
}
`;
        // 写入 TypeScript 文件
        await writeFile(fileName, fileContent);

    } catch (error) {
        console.error(`Error creating and compiling TypeScript file: ${error}`);
        throw error;
    }
}

/**
 * 写入json文件到config目录
 * @param id 
 * @param key 
 * @param egex 
 */
export async function writeJson(id: string, key: string, egex: string) { 
    const config: configJson = {
        id,key,egex
    }

    const configFilePath = `./config/${id}.json`; // 请根据实际需求修改文件路径

    try {
        // 将 JSON 对象转换为字符串
        const configString = JSON.stringify(config, null, 2); // 2 表示缩进两个空格

        // 将字符串写入文件
        await writeFile(configFilePath, configString);

        // console.log('Config file has been written successfully.');
    } catch (error) {
        throw error;
    }
}
