// routes.ts
import express, { Router } from 'express';
import Listen from '../api/Listen'; //引入api控制器

const router = express.Router();

// 添加用户路由
router.post('/api/listen/list', Listen.list);
router.post('/api/listen/start', Listen.start);
router.post('/api/listen/stop', Listen.stop);
router.post('/api/listen/info', Listen.info);

export default router;
