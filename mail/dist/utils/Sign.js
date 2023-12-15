"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSign = void 0;
const md5_1 = __importDefault(require("md5"));
function getSign(params, key = '') {
    const sortedParams = Object.fromEntries(Object.entries(params).sort());
    let str = '';
    for (const [paramKey, paramValue] of Object.entries(sortedParams)) {
        if (paramValue !== '') {
            str += `${encodeURIComponent(paramKey)}=${encodeURIComponent(paramValue)}&`;
        }
    }
    str += `key=${key}`;
    str = decodeURIComponent(str);
    const res = (0, md5_1.default)(str).toUpperCase(); // 假设你有一个 md5 哈希函数
    return res;
}
exports.getSign = getSign;
