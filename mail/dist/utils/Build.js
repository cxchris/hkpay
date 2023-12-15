"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJson = exports.compileAndStart = void 0;
const promises_1 = require("fs/promises");
/**
 * 编译脚本并且重启脚本
 */
function compileAndStart(id, config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = JSON.stringify(config, null, 4);
            const name = `${id}.js`;
            const fileName = `./script/${name}`;
            const fileContent = `"use strict";
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
            yield (0, promises_1.writeFile)(fileName, fileContent);
        }
        catch (error) {
            console.error(`Error creating and compiling TypeScript file: ${error}`);
            throw error;
        }
    });
}
exports.compileAndStart = compileAndStart;
/**
 * 写入json文件到config目录
 * @param id
 * @param key
 * @param egex
 */
function writeJson(id, key, egex) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            id, key, egex
        };
        const configFilePath = `./config/${id}.json`; // 请根据实际需求修改文件路径
        try {
            // 将 JSON 对象转换为字符串
            const configString = JSON.stringify(config, null, 2); // 2 表示缩进两个空格
            // 将字符串写入文件
            yield (0, promises_1.writeFile)(configFilePath, configString);
            // console.log('Config file has been written successfully.');
        }
        catch (error) {
            throw error;
        }
    });
}
exports.writeJson = writeJson;
