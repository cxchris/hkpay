"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    static _initialize() {
        console.log(1);
    }
    static success(res, data = null, msg = 'success', code = 1) {
        const response = {
            code,
            msg,
            time: Math.floor(Date.now() / 1000),
            data,
        };
        res.json(response);
    }
    static error(res, msg = 'error', code = 400) {
        const response = {
            code,
            msg,
            time: Math.floor(Date.now() / 1000),
            data: null,
        };
        res.status(code).json(response);
    }
}
exports.default = BaseController;
