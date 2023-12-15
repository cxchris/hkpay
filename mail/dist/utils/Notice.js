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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Sign_1 = require("./Sign");
const Logger_1 = __importDefault(require("./Logger"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const url = 'https://onepayhk.com/api/upnotice/callback';
const url = 'http://127.0.0.1:88/api/upnotice/callback';
const key = 'B3iYKkRHlmUanQGaNMIJziWOkNN9dECQQD';
/**
 * 邮件监听结果通知后端
 */
function Notice(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = new Logger_1.default(data.id);
        if (!data) {
            return false;
        }
        let postData = {
            pkg: data.id,
            amount: data.amount,
            content: data.content,
            time: Date.now(),
            sign: ''
        };
        postData.sign = (0, Sign_1.getSign)(postData, key);
        logger.info('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        logger.info(`发送 url:${url}`);
        logger.info(`发送 msg:${JSON.stringify(postData)}`);
        // console.log(postData)
        try {
            const response = yield axios_1.default.post(url, postData);
            logger.info('响应 msg:' + JSON.stringify(response.data));
            logger.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
        }
        catch (error) {
            logger.error('响应error:' + error);
        }
        return true;
    });
}
exports.default = Notice;
