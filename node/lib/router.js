import express from 'express';
import { callWeb } from '../api/widthdraw.js'; // 调整导入路径
import webhook from '../api/webhook.js';
import notice from '../api/notice.js';
import translate from '../api/translate.js';
import { getlist,pmStart,pmStop } from '../api/listen.js';

import bodyParser from 'body-parser';

const router = express.Router();

const list = [
  { method: 'POST', route: '/widthdraw/callWeb', handler: callWeb, type: 'urlencoded'},  //收到订单
  { method: 'POST', route: '/telegram-webhook', handler: webhook, type: 'json' },  //飞机webhook
  { method: 'POST', route: '/notice', handler: notice, type: 'urlencoded' },  //监听丢单通知并推送至飞机群bot
  { method: 'GET', route: '/translate', handler: translate, type: 'urlencoded' },  //翻译
  { method: 'POST', route: '/listen/getlist', handler: getlist, type: 'urlencoded' },  //邮件-pm2列表
  { method: 'POST', route: '/listen/pmStart', handler: pmStart, type: 'urlencoded' },  //邮件-pm2开始
  { method: 'POST', route: '/listen/pmStop', handler: pmStop, type: 'urlencoded' },  //邮件-pm2结束
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
