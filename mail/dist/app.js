"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routers_1 = __importDefault(require("./routes/routers"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const GetFileName_1 = __importDefault(require("./utils/GetFileName"));
dotenv_1.default.config();
const APP_HOST = process.env.APP_HOST;
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routes();
    }
    config() {
        // this.app.use(express.json());
        this.app.use(body_parser_1.default.urlencoded({ extended: true }));
    }
    routes() {
        this.app.use(routers_1.default);
        const name = (0, GetFileName_1.default)(__filename);
        this.app.listen(APP_HOST, () => {
            console.log(`${name} Server is running on port ${APP_HOST}`);
        });
    }
}
const server = new App().app;
exports.default = server;
