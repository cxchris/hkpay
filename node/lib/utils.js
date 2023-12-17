import md5 from 'md5';
import { writeFile } from 'fs/promises';
import path from 'path';

/**
 * 成功响应函数
 * @param {any} data - 成功时要返回的数据，可以是任意类型
 * @param {string} msg - 响应消息，可选参数，默认为 'Success' 表示成功
 * @param {number} code - 响应状态码，可选参数，默认为 200 表示成功
 * @returns {Object} - 包含成功响应信息的对象
 * @property {number} code - 响应状态码，根据传入的 code 参数或默认为 200 表示成功
 * @property {string} msg - 响应消息，根据传入的 msg 参数或默认为 'Success' 表示成功
 * @property {number} time - 当前时间戳，精确到秒
 * @property {any} data - 成功时返回的数据，可以是任意类型，默认为空数组
 */
export const success = (data,msg,code) => {
  const result = {
    code: code || 200,
    msg: msg || 'Success',
    time: Math.floor(Date.now() / 1000), // 当前时间戳，精确到秒
    data: data || []
  };

  return result;
}

/**
 * 创建一个错误信息对象。
 *
 * @param {string} msg - 错误信息文本。
 * @param {number} code - 错误码（可选，默认为0）。
 * @returns {object} - 包含错误信息的对象。
 * 
 * @example
 * const result = error('发生错误', 500);
 * console.log(result);
 * // Output:
 * // {
 * //   code: 500,
 * //   msg: '发生错误',
 * //   time: 1630486157, // 当前时间戳，精确到秒
 * //   data: []
 * // }
 */
export const error = (msg,code) => {
  const result = {
    code: code || 0,
    msg: msg || 'Error',
    time: Math.floor(Date.now() / 1000), // 当前时间戳，精确到秒
    data: []
  };

  return result;
}


// 成功数据中间件
export const successMiddleware = (req, res, next) => {
  res.success = (data, msg, code) => {
    const successResponse = success(data, msg, code);
    res.json(successResponse);
  };
  next();
};

// 错误数据中间件
export const errorMiddleware = (req, res, next) => {
  res.error = (msg, code) => {
    const errorResponse = error(msg,code);
    res.json(errorResponse);
  };
  next();
};

//获取签名
export const getSign = (params, key = '') => {
    const sortedParams = Object.fromEntries(Object.entries(params).sort());
    let str = '';
    for (let [paramKey, paramValue] of Object.entries(sortedParams)) {
        if (paramValue != '') {
            str += encodeURIComponent(paramKey) + '=' + encodeURIComponent(paramValue) + '&';
        }
    }
    str += 'key=' + key;

    str = decodeURIComponent(str);
    // console.log(str)

    const res = md5(str).toUpperCase(); // Assuming you have an md5 hashing function
    // console.log(res)
    return res;
};

/**
 * 
 * @param {*} params 参数
 * @param {*} key  key
 * @returns 
 */
export const verifySign = (params, key = '') => {
  const sign = params.sign;
  delete params.sign;

  const sys_sign = getSign(params, key);

  return sys_sign === sign;
};

//生成指定数组
export const splitArray = (arr, chunkSize) => {
  const result = [];
  
  for (let i = 0; i < arr.length; i += chunkSize) {
    const val = arr.slice(i, i + chunkSize)
    result.push(val);
  }
  
  return result;
}

//table转json
export const tojson = (input) => {
  const trimmedString = input.trim();
  const lines = trimmedString.split('\n');
  const headers = lines[1].split('│').map(header => header.trim()).filter(header => header.length > 0);
  const tableData = [];

  for (let i = 3; i < lines.length - 1; i++) {
    const cells = lines[i].split('│').map(cell => cell.trim()).filter(cell => cell.length > 0);
    const rowData = {};

    for (let j = 0; j < headers.length; j++) {
      rowData[headers[j]] = cells[j];
    }

    tableData.push(rowData);
  }

  const jsonData = JSON.stringify(tableData, null, 2);
  return jsonData;
}


/**
 * 写入json文件到config目录
 * @param {string} id 
 * @param {string} key 
 * @param {string} egex 
 */
export async function writeJson(id, key, egex, poster = '') { 
    const config = {
        id,
        key,
        egex,
        poster
    };

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

/**
 * 去除后缀的文件名
 * @param currentFileUrl 
 * @returns 
 */
export function getfilename(currentFileUrl) {
  const currentFileName = path.parse(currentFileUrl).name;
  return currentFileName;
}


/**
 * 编译脚本并且重启脚本
 */
export async function writeScript(id, config) {
    try {
        const content = JSON.stringify(config, null, 4)
        const name = `${id}.js`
        const fileName = `./script/${name}`;
        const fileContent =
`import { readEmailListener } from '../lib/emailListener.js';
import Logger from '../lib/logger.js';
import { getfilename } from '../lib/utils.js';

const currentFileUrl = import.meta.url;
const _name = getfilename(currentFileUrl);

const logger = new Logger(_name);

const config = ${content};

// console.log('配置文件内容:', config);
try {
    readEmailListener(config, _name);
} catch (err) {
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
