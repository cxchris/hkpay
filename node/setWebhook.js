import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

const webhookUrl = 'https://yourdomain.com/telegram-webhook'; // 替换为你的服务器地址
bot.setWebhook(webhookUrl);
