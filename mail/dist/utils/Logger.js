"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
require("winston-daily-rotate-file");
const fs = __importStar(require("fs"));
const logDir = 'logs';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const dailyRotateFileTransport = new winston_1.transports.DailyRotateFile({
    filename: `${logDir}/%DATE%.log`,
    datePattern: 'MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});
class Logger {
    constructor(filename) {
        /**
         * 自定义format函数
         */
        const myFormat = winston_1.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} - [${filename}] - [${level.toUpperCase()}] - ${message}`;
        });
        this.logger = (0, winston_1.createLogger)({
            format: winston_1.format.combine(winston_1.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), myFormat // 使用自定义的输出格式
            ),
            transports: [
                new winston_1.transports.Console(),
                dailyRotateFileTransport,
            ],
        });
    }
    info(message) {
        this.logger.info(message);
    }
    error(message) {
        this.logger.error(message);
    }
}
exports.default = Logger;
