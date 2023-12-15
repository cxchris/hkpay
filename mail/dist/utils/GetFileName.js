"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
/**
 * 去除后缀的文件名
 * @param currentFileUrl
 * @returns
 */
function getfilename(currentFileUrl) {
    const currentFileName = path_1.default.parse(currentFileUrl).name;
    return currentFileName;
}
exports.default = getfilename;
