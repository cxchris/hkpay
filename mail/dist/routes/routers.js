"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes.ts
const express_1 = __importDefault(require("express"));
const Listen_1 = __importDefault(require("../api/Listen")); //引入api控制器
const router = express_1.default.Router();
// 添加用户路由
router.post('/api/listen/list', Listen_1.default.list);
router.post('/api/listen/start', Listen_1.default.start);
router.post('/api/listen/stop', Listen_1.default.stop);
router.post('/api/listen/info', Listen_1.default.info);
exports.default = router;
