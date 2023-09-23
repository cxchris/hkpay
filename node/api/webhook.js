import { logger } from '../lib/log.js';
import { sendMessage,getChatAdmins } from '../lib/bot.js';

export const webhook = async (req, res) => {
  try {
    const formData = req.body;
    //类型
    const chatType = formData.message.chat.type; //类型，private-私聊，group-群组
    const chatId = formData.message.chat.id;
    const text = formData.message.text;
    // console.log(formData)
    // logger.info(JSON.stringify(formData));

    // // 验证签名
    // const isValidSignature = verifySign(formData, key);
    // if (!isValidSignature) {
    //   throw new Error('Invalid signature');
    // }
    
    const result = formData;
    res.success(result);
  } catch (error) {
    res.error(error.message);
  }
};