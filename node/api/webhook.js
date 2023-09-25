import { logger } from '../lib/log.js';
import { sendMessage, getChatAdmins } from '../lib/bot.js';
import error from '../lib/error.js';
const permissionId = [5256774376]; //被允许私人访问的
let chatId;

export const webhook = async (req, res) => {
    try {
        const formData = req.body;
        // console.log(formData)
        //类型
        const chatType = formData.message.chat.type; //类型，private-私聊，group-群组
        const text = formData.message.text;
        chatId = formData.message.chat.id;
        // console.log(chatType)
        // console.log(chatId)

        // 获取群组的管理员列表
        const administrators = await getChatAdmins(chatId);
        // console.log(administrators)
        // console.log(formData)
        // logger.info(JSON.stringify(formData));

        // // 验证签名
        // const isValidSignature = verifySign(formData, key);
        // if (!isValidSignature) {
        //   throw error[401];
        // }

        //首先判断是私聊还是群聊，私聊就只能指定用户才能有权限操作，群聊就判断群聊管理员，先获取管理员
        if (chatType == 'private') {
            if (!permissionId.includes(chatId)) {
                throw error[402];
            }
        } else if (chatType == 'group') {
            if (!administrators.includes(chatId)) {
                throw error[402];
            }
        } else {
            throw error[403];
        }

        //根据指令来判断操作
        
        const result = administrators;
        res.success(result);
    } catch (error) {
        if (error.code == 402) {
            sendMessage(chatId,error.message);
        }
        res.error(error.message);
    }
};