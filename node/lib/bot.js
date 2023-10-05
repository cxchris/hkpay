import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { splitArray } from './utils.js';
dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;


const bot = new TelegramBot(token);

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

/**
 * 列出在用群组
 * @param {*} list 
 * @param {*} msg 
 */
export async function setInlineKeybord(type, list, msg) {
    let inlineKeyboard = {}
    const chatId = msg.id;
    //循环list，获取keyboard
    
    const chunkSize = 4;
    const outputArray = splitArray(list, chunkSize);
    // console.log(outputArray)

    inlineKeyboard.inline_keyboard = outputArray;
    // console.log(inlineKeyboard)

    // 创建消息对象，并包含 inline keyboard
    const messageOptions = {
        reply_markup: JSON.stringify(inlineKeyboard)
    };
    // console.log(messageOptions)
    let title = '列出在用群组：';
    if (type == 'groupdel') {
        title = '选择要删除的群组：';
    }

    bot.sendMessage(chatId, title, messageOptions);
}

// 用于获取群组名称的异步函数
export async function getGroupName(chatId) {
    try {
        const chat = await bot.getChat(chatId);
        const groupName = chat.title;
        return groupName;
        // console.log(`群组ID为 ${chatId} 的群组名称是: ${groupName}`);
    } catch (error) {
        console.error(`获取群组信息时出错：${error.message}`);
    }
}