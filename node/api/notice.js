//接受通知
import { logger } from '../lib/log.js';
import { sendMessage } from '../lib/bot.js';
import GroupModel from '../model/group.js'; // 根据您的项目结构和路径导入
import { verifySign } from '../lib/utils.js';
import error from '../lib/error.js';
import dotenv from 'dotenv';
import WebSocket from 'ws';  // 导入 WebSocket 类
import wss from '../websocket-server.js';
import { check, validationResult } from 'express-validator';
import { Notice, TYPE_1 } from '../mysql/notice.js';

dotenv.config();

const key = process.env.key

const notice = async (req, res) => {
    try {
        const formData = req.body;
        // 验证签名
        const isValidSignature = verifySign(formData, key);
        if (!isValidSignature) {
            // throw error[401];
        }

        // 使用 express-validator 中间件验证请求参数
        const validationRules = [
            check('amount').notEmpty().withMessage('Amount cannot be empty').isNumeric().withMessage('Amount must be a number'),
            check('content').notEmpty().withMessage('Content cannot be empty').isString().withMessage('Content must be a string'),
        ];

        // 执行验证规则
        await Promise.all(validationRules.map(validation => validation.run(req)));

        // 检查验证结果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = { message : errors.array()[0].msg };
            throw firstError;
        }

        const { amount, content } = formData;

        //避免回调
        if (content.includes('掉单通知')) {
            throw error[406];
        }

        //插入通知
        const notice = new Notice();
        const result = await notice.addNotice(TYPE_1);
        // const total = await notice.searchSum();

        //websocket给前端发送通知
        const message = {
            type: TYPE_1,
            msg: '有掉单信息，请及时处理',
            receive_num: result.receive_num,
            lost_num: result.lost_num,
            total: result.receive_num + result.lost_num,
        };
        
        const messageString = JSON.stringify(message);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageString);
            }
        });

        // 获取可用的群，循环发送一次掉单通知
        const model = new GroupModel();
        const group = await model.select()
        // console.log(group)
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