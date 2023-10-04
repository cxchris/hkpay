import { logger } from '../lib/log.js';
import { sendMessage } from '../lib/bot.js';
import GroupModel from '../model/group.js'; // 根据您的项目结构和路径导入


const dbnama = './sqllitedb/database.db';
const table = 'groups';
let chatId;

export const webhook = async (req, res) => {
    try {
        const model = new GroupModel(dbnama, table);
        const formData = req.body;
        console.log(formData)

        //第一步得区分callback还是message类型
        let { chatType, text, fromid, chatInfo, callback_data, formType } = await model.getBaseMessageData(formData);
        chatId = chatInfo.id

        //类型
        // console.log({ chatType, text, fromid, chatInfo, callback_data, formType })
        //第二步根据不同的类型来执行对应方法
        if (formType == 'message') {
            await model.handleMessage(text,chatInfo,chatType,fromid);
        } else if(formType == 'callback_query'){
            await model.callbackQuery(callback_data,chatInfo.id);
        }

        res.success([]);

        // // 验证签名
        // const isValidSignature = verifySign(formData, key);
        // if (!isValidSignature) {
        //   throw error[401];
        // }
    } catch (error) {
        if (error.code == 402 || error.code == 405) {
            sendMessage(chatId,error.message);
        }
        res.error(error.message);
    }
};