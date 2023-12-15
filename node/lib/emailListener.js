import Logger from './logger.js';
import Imap from 'imap';
import { notice } from './axios.js';
import cheerio from 'cheerio';
import { simpleParser } from 'mailparser';
import * as fs from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

// const moduleDir = path.dirname(new URL(import.meta.url).pathname);
// const configPath = path.join(moduleDir, '../config', `e.json`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 监听邮件的配置
 */
export const Econfig = {
    user: '',
    password: '',
    host: '',
    port: 0,
    tls: false,
    tlsOptions: {
        rejectUnauthorized: false,
    },
};

/**
 * 
 * @param config 监听邮件的配置
 */
export function readEmailListener(config ,_name) {
    const imap = new Imap(config);
    const logger = new Logger(_name);

    imap.once('ready', function() {
        imap.openBox('INBOX', true, function(err, box ) {
            if (err) throw err;
            logger.info('连接成功，等待新邮件到达...'+'当前进程 ID:'+process.pid);

            imap.on('mail', function(numNewMsgs) {
                logger.info(`收到新邮件: ${numNewMsgs} 封`);

                const f = imap.fetch(box.messages.total + ':*', { bodies: '' });

                // 当获取到邮件时
                f.on('message', (msg) => {
                    msg.on('body', (stream, info) => {
                        //解析邮件正文
                        // console.log(info)
                        parseHtml(stream,_name);
                    });
                });

                f.once('error', function(err) {
                    logger.error('获取邮件信息出错:'+err);
                });

                f.once('end', function() {
                    console.log('所有新邮件的信息已获取完毕');
                });
            });
        });
    });

    imap.once('error', function(err) {
        logger.error('IMAP 错误:'+err);
    });

    imap.once('end', function() {
        logger.error('与 IMAP 服务器的连接已关闭');
    });

    imap.connect();
}

export async function parseHtml(stream, _name) {
    const logger = new Logger(_name);
    simpleParser(stream, async (parseErr, parsed) => {
        if (parseErr) {
            logger.info('解析邮件正文错误:' + parseErr);
            console.error(parseErr);
            return;
        }

        // 获取主题
        const subject = parsed.subject;
        // 获取发件人信息
        const from = parsed.from?.text; // 添加了空值检查
        // 获取纯文本正文
        // const textBody = parsed.text;
        // console.log(parsed)
        // 获取 HTML 正文
        const htmlBody = parsed.html??'';
        // logger.info('HTML Body:'+htmlBody);
        
        //获取发件人from

        // 使用cheerio加载HTML
        if (htmlBody) {
            const $ = cheerio.load(htmlBody);
            const configFilePath = join(__dirname, '..', 'config', `${_name}.json`);
            // console.log(configFilePath)
            const conf = await readJsonFile(configFilePath);
            let money = null;
            let textOfRow = '';
            const keyword = conf.key ?? '';
            const egex = conf.egex ?? '';
            if (keyword) {
                //查询邮件关键字找出金额
                const elementsWithKeyword = $(`body span:contains("${keyword}")`);

                if (elementsWithKeyword.length > 0) {
                    // 遍历包含关键字的元素
                    elementsWithKeyword.each((index, element) => {
                        // 获取包含关键字的元素所在的行的文字
                        textOfRow = $(element).closest('span').text(); // 这里假设是在 <p> 元素中，你可以根据实际情况修改选择器
                        logger.info(textOfRow)
                        if (textOfRow != '') {
                            money = extractMoney(textOfRow,egex)
                            // console.log(money)
                        }
                        // console.log(textOfRow)
                    });
                } else {
                    logger.info(`未找到包含关键字 "${keyword}" 的元素`)
                }

                if (money != null) {
                    //提交对应金额到服务器
                    const data = {
                        id: _name,
                        amount: money,
                        content: textOfRow
                    }
                    notice(data);
                }
            }
        }
    })
}

/**
 * 读取 JSON 文件
 * @param filePath 文件路径
 * @returns 返回配置json
 */
export async function readJsonFile(filePath) {
    try {
        // 读取 JSON 文件
        const fileContent = await fs.readFile(filePath, 'utf-8');

        // 解析 JSON 内容
        const jsonData = JSON.parse(fileContent);

        return jsonData;
    } catch (error) {
        throw error;
    }
}

/**
 * 提取金额
 * @param inputString 带有金额的字符串
 * @returns 
 */
export function extractMoney(inputString, egex = 'HKD(\d+(\.\d{1,2})?)') {
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