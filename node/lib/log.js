import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const customFormat = format.combine(
    format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
    format.printf((i) => `---------------------------------------------------------------\n[${[i.timestamp]}]\n[${i.level}]${i.message}`),
    format.align(),
);
const defaultOptions = {
    format: customFormat,
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "14d",
};

export const logger = createLogger({
    format: customFormat,
    transports: [
        new transports.DailyRotateFile({
            filename: "logs/info-%DATE%.log",
            level: "info",
            ...defaultOptions,
        }),
        new transports.DailyRotateFile({
            filename: "logs/error-%DATE%.log",
            level: "error",
            ...defaultOptions,
        }),
    ],
});

// export const authLogger = createLogger({
//     transports: [
//         new transports.DailyRotateFile({
//             filename: "logs/authLog-%DATE%.log",
//             ...defaultOptions,
//         }),
//     ],
// });