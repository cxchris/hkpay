"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EmailListener_1 = require("../utils/EmailListener");
const Logger_1 = __importDefault(require("../utils/Logger"));
const GetFileName_1 = __importDefault(require("../utils/GetFileName"));
const _name = (0, GetFileName_1.default)(__filename);
const logger = new Logger_1.default(_name);
const config = {
    "user": "chris1991@zohomail.com",
    "password": "4L5Q8N03ZVTV",
    "host": "imap.zoho.com",
    "port": 993,
    "tls": true,
    "tlsOptions": {
        "rejectUnauthorized": false
    }
};
// console.log('配置文件内容:', config);
try {
    (0, EmailListener_1.readEmailListener)(config, _name);
}
catch (err) {
    logger.error('运行mail listener出错:' + err);
}
