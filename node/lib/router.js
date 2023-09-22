import express from 'express';
import { lostOder } from '../api/data.js'; // 调整导入路径
import { webhook } from '../api/webhook.js'; // 调整导入路径

const router = express.Router();


const list = [
  { method: 'GET', route: '/data/lostOder', handler: lostOder },  //监听丢单并推送至飞机群bot
  { method: 'POST', route: '/telegram-webhook', handler: webhook },  //监听丢单并推送至飞机群bot
];


// 将 list 数组中的路由信息注册到 Express 路由中
if(list){
	list.forEach(({ method, route, handler }) => {
		if(method){
			router[method.toLowerCase()](route, handler);
		}
	});
}

export default router;
