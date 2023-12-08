import dotenv from 'dotenv';
dotenv.config();

const key = process.env.user;
import WebSocket from 'ws';  // 导入 WebSocket 类
import wss from '../websocket-server.js';
import { Notice, TYPE_2 } from '../mysql/notice.js';

/**
 * 提现通知客户端
 * @param {*} req 
 * @param {*} res 
 */
export const callWeb = async (req, res) => {
  try {
    const formData = req.body;
    // console.log(formData)

    //添加通知
    const notice = new Notice();
    const result = await notice.addNotice(TYPE_2);
    // console.log(result);
    const message = {
      type: TYPE_2,
      msg: '有提现订单来了，请及时处理',
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
    res.success(formData);
  } catch (error) {
    res.error(error.message);
  }
};