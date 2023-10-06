//接受通知
import { logger } from '../lib/log.js';
import { sendMessage } from '../lib/bot.js';
import GroupModel from '../model/group.js'; // 根据您的项目结构和路径导入
import { verifySign } from '../lib/utils.js';
import error from '../lib/error.js';
import dotenv from 'dotenv';

dotenv.config();

const key = process.env.key

const notice = async (req, res) => {
    try {
        const formData = req.body;
        // 验证签名
        const isValidSignature = verifySign(formData, key);
        if (!isValidSignature) {
            throw error[401];
        }
        const amount = formData.amount
        const content = formData.content

        //避免回调
        if (content.includes('掉单通知')) {
            throw error[406];
        }

        // 获取可用的群，循环发送一次掉单通知
        const model = new GroupModel();
        const group = await model.select()
        if (group.length != 0) {
            const msg = `掉单通知❗❗❗:\n金额：${amount}\n内容：${content}`

            group.forEach(item => {
                const groupId = item.group_id;
                sendMessage(groupId,msg);
            });
        }
        res.success([]);
    } catch (error) {
        res.error(error.message);
    }
};

export default notice