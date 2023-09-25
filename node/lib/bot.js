import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;


const bot = new TelegramBot(token, {
    polling: true,
});

export const sendMessage = (chatId,content) => {
    bot.sendMessage(chatId, content);
}

// 封装获取群组管理员列表的异步方法
export async function getChatAdmins(chatId) {
    try {
        let res = [];
        const administrators = await bot.getChatAdministrators(chatId);
        if (administrators) {
            res = administrators.reduce((userIds = [], administrator) => {
                const userId = administrator.user.id;
                if (userId) {
                    userIds.push(userId);
                }
                return userIds;
            }, [])
        }
        return res;
    } catch (error) {
        console.error('获取管理员列表失败：', error.message);
        throw error;
    }
}