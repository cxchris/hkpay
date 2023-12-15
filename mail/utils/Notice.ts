import axios from 'axios';
import { getSign } from './Sign';
import Logger from './Logger';
import dotenv from 'dotenv';
dotenv.config();


// const url = 'https://onepayhk.com/api/upnotice/callback';
const url = 'http://127.0.0.1:88/api/upnotice/callback';
const key = 'B3iYKkRHlmUanQGaNMIJziWOkNN9dECQQD';

export interface PostData {
    pkg: string;
    amount: number;
    time: number;
    content: string;
    sign: string
}

/**
 * 邮件监听结果通知后端
 */
export default async function Notice(data: any) {
    const logger = new Logger(data.id);
    if (!data) {
        return false;
    }
    
    let postData: PostData = {
        pkg: data.id,
        amount: data.amount,
        content: data.content,
        time: Date.now(),
        sign: ''
    };
    postData.sign = getSign(postData,key);
    logger.info('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    logger.info(`发送 url:${url}`);
    logger.info(`发送 msg:${JSON.stringify(postData)}`);
    // console.log(postData)

    try {
        const response = await axios.post(url, postData);
        logger.info('响应 msg:'+ JSON.stringify(response.data));
        logger.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    } catch (error) {
        logger.error('响应error:'+ error);
    }

    return true;
} 