import express from 'express';
import { lostOder } from '../api/data.js'; // 调整导入路径
import webhook from '../api/webhook.js'; // 调整导入路径
import notice from '../api/notice.js'; // 调整导入路径

import bodyParser from 'body-parser';

const router = express.Router();

const list = [
  { method: 'GET', route: '/data/lostOder', handler: lostOder, type: 'urlencoded'},  //test
  { method: 'POST', route: '/telegram-webhook', handler: webhook, type: 'json' },  //飞机webhook
  { method: 'POST', route: '/notice', handler: notice, type: 'urlencoded' },  //监听丢单通知并推送至飞机群bot
];


// 将 list 数组中的路由信息注册到 Express 路由中
if(list){
	list.forEach(({ method, route, handler, type }) => {
		if(method){
			// router[method.toLowerCase()](route, handler);

			router[method.toLowerCase()](route, (req, res, next) => {
				// 添加中间件根据路由选择使用不同的 bodyParser 中间件
				// console.log(type)
				if (type === 'json') {
					bodyParser.json()(req, res, next);
				} else {
					bodyParser.urlencoded({ extended: true })(req, res, next);
				}
			}, handler);
		}
	});
}

export default router;
