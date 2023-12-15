import { Request, Response } from 'express';
import BaseController from './BaseController';
import { Econfig } from '../utils/EmailListener';
import { compileAndStart,writeJson } from '../utils/Build';
import pm2 from 'pm2';

/**
 * 邮件监听管理
 */
class Listen extends BaseController {
    /**
     * 列出脚本进程
     * @param req 
     * @param res 
     */
    public static list(req: Request, res: Response): void {

        pm2.list((err, list) => {
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
    public static start(req: Request, res: Response): void {
        // 使用 express-validator 中的 check 函数进行验证
        const id: string = req.body.id;
        const user: string = req.body.user;
        const password: string = req.body.password;
        const host: string = req.body.host;
        const port: number = req.body.port;
        const key: string = req.body.key;
        const egex: string = req.body.egex;
        if (!id) {
            return super.error(res,'id必传');
        }

        if (!user) {
            return super.error(res,'user必传');
        }

        if (!password) {
            return super.error(res,'password必传');
        }

        if (!host) {
            return super.error(res,'host必传');
        }

        if (!port) {
            return super.error(res,'port必传');
        }

        if (!key) {
            return super.error(res,'key必传');
        }

        if (!egex) {
            return super.error(res,'egex必传');
        }

        //写入配置config目录
        writeJson(id,key,egex);
        
        //pm2根据id判断是否开着的，如果开着就不重复开，如果没有开，就重新创建文件，并编译成js再pm2启动
        pm2.describe(id, async (err, processDescription) => {
            if (err) {
                return super.error(res, err.message);
            }
            // console.log(processDescription)
            if (Array.isArray(processDescription) && processDescription.length > 0) {
                // 如果已经开着，可以返回一个适当的响应
                if (processDescription[0] && processDescription[0].pm2_env) {
                    if (processDescription[0].pm2_env.status === 'online') {
                        // 如果已经开着，可以返回一个适当的响应
                        return super.success(res, true, '脚本正在运行');
                    }
                } else {
                    return super.error(res, 'pm2 命令失败');
                }
            }

            //没有开起来，重新创建文件并且编译js启动
            try {
                const config: Econfig = {
                    user: user,
                    password: password,
                    host: host,
                    port: Number(port),
                    tls: true,
                    tlsOptions: {
                        rejectUnauthorized: false
                    }
                }
                // 根据你的实际需要，编写重新创建文件和编译成 JS 的逻辑
                await compileAndStart(id, config);
                // pm2启动
                const scriptPath = `./script/${id}.js`; // 替换为你的文件路径

                pm2.start(
                    {
                        script: scriptPath,
                        name: id, // 替换为你的应用程序名称
                        exec_mode: 'fork', // 可选：'cluster' 或 'fork'
                        instances: 1, // 实例数
                    },
                    (err, apps) => {
                        pm2.disconnect(); // 断开 PM2 连接

                        if (err) {
                            console.error(err);
                            // process.exit(2);
                        }
                    }
                );

                // 最后返回成功的响应
                const data = {
                    id,
                    msg: '启动成功'
                };
                return super.success(res, data);
            } catch (compileError) {
                return super.error(res, '启动失败');
            }
        });
    }

    /**
     * 关闭某个脚本
     * @param req 
     * @param res 
     */
    public static stop(req: Request, res: Response): void { 
        const id: string = req.body.id;
        if (!id) {
            return super.error(res,'id必传');
        }

        pm2.connect((err) => {
            if (err) {
                return super.error(res, err.message);
                // process.exit(2);
            }

            // 停止应用程序
            pm2.stop(id, (err, proc) => {
                pm2.disconnect(); // 断开 PM2 连接

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
    public static info(req: Request, res: Response): void {
        const id: string = req.body.id;
        if (!id) {
            return super.error(res,'id必传');
        }

        pm2.list((err, list) => {
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
export default Listen;