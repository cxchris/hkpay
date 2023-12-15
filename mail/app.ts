import express, { Application } from 'express';
import routes from './routes/routers';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import getfilename from './utils/GetFileName';
dotenv.config();
const APP_HOST = process.env.APP_HOST;

class App {
    public app: Application;
    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    private config(): void {
        // this.app.use(express.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    private routes(): void {
        this.app.use(routes);
        const name = getfilename(__filename);

        this.app.listen(APP_HOST, () => {
            console.log(`${name} Server is running on port ${APP_HOST}`);
        });
    }
}

const server = new App().app;
export default server;