import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import * as fs from 'fs';

const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${logDir}/%DATE%.log`,
    datePattern: 'MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

class Logger {
    logger: any;
    constructor(filename: string) {
        /**
         * 自定义format函数
         */
        const myFormat = format.printf(({ level, message, timestamp }) => {
            return `${timestamp} - [${filename}] - [${level.toUpperCase()}] - ${message}`;
        });

        this.logger = createLogger({
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.errors({ stack: true }),
                format.splat(),
                myFormat  // 使用自定义的输出格式
            ),
            transports: [
                new transports.Console(),
                dailyRotateFileTransport,
            ],
        });
    }
    
    info(message: string) {
        this.logger.info(message);
    }

    error(message: string) {
        this.logger.error(message);
    }
}
export default Logger;