import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import fs from 'fs';

const logDir = 'logs';

// 如果日志目录不存在，则创建
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
    constructor(filename) {
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
    
    info(message) {
        this.logger.info(message);
    }

    error(message) {
        this.logger.error(message);
    }
}

export default Logger;
