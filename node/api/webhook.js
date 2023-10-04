import { logger } from '../lib/log.js';
import { sendMessage, getChatAdmins } from '../lib/bot.js';
import error from '../lib/error.js';
import GroupModel from '../model/group.js'; // 根据您的项目结构和路径导入

const permissionId = [5256774376]; //被允许私人访问的
const commandList = [
    'start',
    'grouplist',
    'groupadd'
];
const dbnama = './sqllitedb/database.db';
const table = 'groups';
let chatId;

export const webhook = async (req, res) => {
    try {
        const formData = req.body;
        console.log(formData)
        //类型
        const chatType = formData.message.chat.type; //类型，private-私聊，group-群组
        const text = formData.message.text;
        const fromid = formData.message.from.id;
        const chatInfo = formData.message.chat;
        chatId = formData.message.chat.id;


        const query = formData.callback_query;
        const data = query.data;

        // 在这里根据用户的响应执行相应的操作
        if (data === 'button1') {
            sendMessage(chatId, '你点击了按钮1');
        } else if (data === 'button2') {
            sendMessage(chatId, '你点击了按钮2');
        }


        // console.log(chatType)
        // console.log(chatId)
        // console.log(formData)
        // logger.info(JSON.stringify(formData));

        // // 验证签名
        // const isValidSignature = verifySign(formData, key);
        // if (!isValidSignature) {
        //   throw error[401];
        // }
        //处理text，获得指令
        let command = text.replace(/@.*$/, '');
        command = command.replace('/', '');
        console.log(command)

        if (command == 'start') {
            //处理开始处理完就不走后面的
            sendMessage(chatId, 'welcome!');
            res.success([]);
            return;
        }

        //首先判断是私聊还是群聊，私聊就只能指定用户才能有权限操作，群聊就判断群聊管理员，先获取管理员
        if (chatType == 'private') {
            if (!permissionId.includes(fromid)) {
                throw error[402];
            }
            //私聊不允许访问groupadd
            if (command == 'groupadd') {
                throw error[405];
            }
        } else if (chatType == 'group') {
            // 获取群组的管理员列表
            const administrators = await getChatAdmins(chatId);
            if (!administrators.includes(fromid)) {
                throw error[402];
            }
            //群聊不允许访问grouplist
            if (command == 'grouplist') {
                throw error[405];
            }
        } else {
            throw error[403];
        }

        //根据指令来判断操作
        if (commandList.includes(command)) {
            const model = new GroupModel(dbnama, table);
            if (typeof model[command] === 'function') { 
                model[command](chatInfo);
            }
        }
        
        const result = [];
        res.success(result);
    } catch (error) {
        if (error.code == 402 || error.code == 405) {
            sendMessage(chatId,error.message);
        }
        res.error(error.message);
    }
};