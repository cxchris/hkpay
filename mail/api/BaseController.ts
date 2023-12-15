import { Response } from 'express';

class BaseController {
    public static _initialize() :void {
        console.log(1)
    }
    protected static success(res: Response, data: any = null, msg: string = 'success', code: number = 1): void {
        const response = {
            code,
            msg,
            time: Math.floor(Date.now() / 1000),
            data,
        };
        res.json(response);
    }

    protected static error(res: Response, msg: string = 'error', code: number = 400): void {
        const response = {
            code,
            msg,
            time: Math.floor(Date.now() / 1000),
            data: null,
        };
        res.status(code).json(response);
    }
}

export default BaseController;