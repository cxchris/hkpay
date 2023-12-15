"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseController_1 = __importDefault(require("./BaseController"));
const Build_1 = require("../utils/Build");
const pm2_1 = __importDefault(require("pm2"));
/**
 * 邮件监听管理
 */
class Listen extends BaseController_1.default {
    /**
     * 列出脚本进程
     * @param req
     * @param res
     */
    static list(req, res) {
        pm2_1.default.list((err, list) => {
            if (err) {
                return super.error(res, err.message);
            }
            // console.log(list)
            const newList = list.map((item) => {
                return {
                    pid: item.pid,
                    name: item.name,
                    // status: item.status,
                };
            });
            return super.success(res, newList);
        });
    }
    /**
     * 开启某个脚本
     * @param req
     * @param res
     */
    static start(req, res) {
        const _super = Object.create(null, {
            error: { get: () => super.error },
            success: { get: () => super.success }
        });
        // 使用 express-validator 中的 check 函数进行验证
        const id = req.body.id;
        const user = req.body.user;
        const password = req.body.password;
        const host = req.body.host;
        const port = req.body.port;
        const key = req.body.key;
        const egex = req.body.egex;
        if (!id) {
            return _super.error.call(this, res, 'id必传');
        }
        if (!user) {
            return _super.error.call(this, res, 'user必传');
        }
        if (!password) {
            return _super.error.call(this, res, 'password必传');
        }
        if (!host) {
            return _super.error.call(this, res, 'host必传');
        }
        if (!port) {
            return _super.error.call(this, res, 'port必传');
        }
        if (!key) {
            return _super.error.call(this, res, 'key必传');
        }
        if (!egex) {
            return _super.error.call(this, res, 'egex必传');
        }
        //写入配置config目录
        (0, Build_1.writeJson)(id, key, egex);
        //pm2根据id判断是否开着的，如果开着就不重复开，如果没有开，就重新创建文件，并编译成js再pm2启动
        pm2_1.default.describe(id, (err, processDescription) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                return _super.error.call(this, res, err.message);
            }
            // console.log(processDescription)
            if (Array.isArray(processDescription) && processDescription.length > 0) {
                // 如果已经开着，可以返回一个适当的响应
                if (processDescription[0] && processDescription[0].pm2_env) {
                    if (processDescription[0].pm2_env.status === 'online') {
                        // 如果已经开着，可以返回一个适当的响应
                        return _super.success.call(this, res, true, '脚本正在运行');
                    }
                }
                else {
                    return _super.error.call(this, res, 'pm2 命令失败');
                }
            }
            //没有开起来，重新创建文件并且编译js启动
            try {
                const config = {
                    user: user,
                    password: password,
                    host: host,
                    port: Number(port),
                    tls: true,
                    tlsOptions: {
                        rejectUnauthorized: false
                    }
                };
                // 根据你的实际需要，编写重新创建文件和编译成 JS 的逻辑
                yield (0, Build_1.compileAndStart)(id, config);
                // pm2启动
                const scriptPath = `./script/${id}.js`; // 替换为你的文件路径
                pm2_1.default.start({
                    script: scriptPath,
                    name: id, // 替换为你的应用程序名称
                    exec_mode: 'fork', // 可选：'cluster' 或 'fork'
                    instances: 1, // 实例数
                }, (err, apps) => {
                    pm2_1.default.disconnect(); // 断开 PM2 连接
                    if (err) {
                        console.error(err);
                        // process.exit(2);
                    }
                });
                // 最后返回成功的响应
                const data = {
                    id,
                    msg: '启动成功'
                };
                return _super.success.call(this, res, data);
            }
            catch (compileError) {
                return _super.error.call(this, res, '启动失败');
            }
        }));
    }
    /**
     * 关闭某个脚本
     * @param req
     * @param res
     */
    static stop(req, res) {
        const id = req.body.id;
        if (!id) {
            return super.error(res, 'id必传');
        }
        pm2_1.default.connect((err) => {
            if (err) {
                return super.error(res, err.message);
                // process.exit(2);
            }
            // 停止应用程序
            pm2_1.default.stop(id, (err, proc) => {
                pm2_1.default.disconnect(); // 断开 PM2 连接
                if (err) {
                    return super.error(res, err.message);
                    // process.exit(2);
                }
                const data = {
                    id,
                    msg: `Application ${id} stopped.`
                };
                // console.log(`Application ${id} stopped.`);
                return super.success(res, data);
            });
        });
    }
    /**
     * 查询某个脚本的信息
     * @param req
     * @param res
     */
    static info(req, res) {
        const id = req.body.id;
        if (!id) {
            return super.error(res, 'id必传');
        }
        pm2_1.default.list((err, list) => {
            if (err) {
                return super.error(res, err.message);
            }
            let result = {};
            list.forEach((item) => {
                if (item.name === id) {
                    result = {
                        pid: item.pid,
                        name: item.name,
                    };
                }
            });
            return super.success(res, result);
        });
    }
}
exports.default = Listen;
