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