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
exports.extractMoney = exports.readJsonFile = exports.parseHtml = exports.readEmailListener = void 0;
const Logger_1 = __importDefault(require("../utils/Logger"));
const imap_1 = __importDefault(require("imap"));
const Notice_1 = __importDefault(require("./Notice"));
const cheerio_1 = __importDefault(require("cheerio"));
const mailparser_1 = require("mailparser");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const moduleDir = __dirname;
const parentDir = path.resolve(moduleDir, '..');
/**
 *
 * @param config 监听邮件的配置
 */
function readEmailListener(config, _name) {
    const imap = new imap_1.default(config);
    const logger = new Logger_1.default(_name);
    imap.once('ready', function () {
        imap.openBox('INBOX', true, function (err, box) {
            if (err)
                throw err;
            logger.info('连接成功，等待新邮件到达...' + '当前进程 ID:' + process.pid);
            imap.on('mail', function (numNewMsgs) {
                logger.info(`收到新邮件: ${numNewMsgs} 封`);
                const f = imap.fetch(box.messages.total + ':*', { bodies: '' });
                // 当获取到邮件时
                f.on('message', (msg) => {
                    msg.on('body', (stream, info) => {
                        //解析邮件正文
                        // console.log(info)
                        parseHtml(stream, _name);
                    });
                });
                f.once('error', function (err) {
                    logger.error('获取邮件信息出错:' + err);
                });
                f.once('end', function () {
                    console.log('所有新邮件的信息已获取完毕');
                });
            });
        });
    });
    imap.once('error', function (err) {
        logger.error('IMAP 错误:' + err);
    });
    imap.once('end', function () {
        logger.error('与 IMAP 服务器的连接已关闭');
    });
    imap.connect();
}
exports.readEmailListener = readEmailListener;
function parseHtml(stream, _name) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = new Logger_1.default(_name);
        (0, mailparser_1.simpleParser)(stream, (parseErr, parsed) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (parseErr) {
                logger.info('解析邮件正文错误:' + parseErr);
                console.error(parseErr);
                return;
            }
            // 获取主题
            const subject = parsed.subject;
            // 获取发件人信息
            const from = (_a = parsed.from) === null || _a === void 0 ? void 0 : _a.text; // 添加了空值检查
            // 获取纯文本正文
            // const textBody = parsed.text;
            // console.log(parsed)
            // 获取 HTML 正文
            const htmlBody = (_b = parsed.html) !== null && _b !== void 0 ? _b : '';
            // logger.info('HTML Body:'+htmlBody);
            //获取发件人from
            // 使用cheerio加载HTML
            if (htmlBody) {
                const $ = cheerio_1.default.load(htmlBody);
                const configFilePath = path.join(parentDir, 'config', `${_name}.json`);
                const conf = yield readJsonFile(configFilePath);
                let money = null;
                let textOfRow = '';
                const keyword = (_c = conf.key) !== null && _c !== void 0 ? _c : '';
                const egex = (_d = conf.egex) !== null && _d !== void 0 ? _d : '';
                if (keyword) {
                    //查询邮件关键字找出金额
                    const elementsWithKeyword = $(`body span:contains("${keyword}")`);
                    if (elementsWithKeyword.length > 0) {
                        // 遍历包含关键字的元素
                        elementsWithKeyword.each((index, element) => {
                            // 获取包含关键字的元素所在的行的文字
                            textOfRow = $(element).closest('span').text(); // 这里假设是在 <p> 元素中，你可以根据实际情况修改选择器
                            logger.info(textOfRow);
                            if (textOfRow != '') {
                                money = extractMoney(textOfRow, egex);
                                // console.log(money)
                            }
                            // console.log(textOfRow)
                        });
                    }
                    else {
                        logger.info(`未找到包含关键字 "${keyword}" 的元素`);
                    }
                    if (money != null) {
                        //提交对应金额到服务器
                        const data = {
                            id: _name,
                            amount: money,
                            content: textOfRow
                        };
                        (0, Notice_1.default)(data);
                    }
                }
            }
        }));
    });
}
exports.parseHtml = parseHtml;
/**
 * 读取 JSON 文件
 * @param filePath 文件路径
 * @returns 返回配置json
 */
function readJsonFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 读取 JSON 文件
            const fileContent = yield fs.readFile(filePath, 'utf-8');
            // 解析 JSON 内容
            const jsonData = JSON.parse(fileContent);
            return jsonData;
        }
        catch (error) {
            throw error;
        }
    });
}
exports.readJsonFile = readJsonFile;
/**
 * 提取金额
 * @param inputString 带有金额的字符串
 * @returns
 */
function extractMoney(inputString, egex = 'HKD(\d+(\.\d{1,2})?)') {
    // 正则表达式模式
    const regexPattern = new RegExp(egex);
    // 在输入字符串中查找匹配
    const match = inputString.match(regexPattern);
    if (match && match[1] !== undefined) {
        // 提取匹配到的金额部分并转换为数字
        const moneyValue = match[1];
        return moneyValue;
    }
    // 如果没有匹配到金额，返回 null
    return null;
}
exports.extractMoney = extractMoney;
