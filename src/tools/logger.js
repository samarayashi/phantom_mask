import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, align } = winston.format;

// 自定義日誌格式
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// 設置日誌記錄器
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        align(),
        logFormat
    ),
    transports: [
        // 錯誤日誌
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true
        }),
        // 所有日誌
        new winston.transports.DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true
        })
    ]
});

// 在非生產環境下添加控制台輸出
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize({ all: true }),
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            align(),
            logFormat
        )
    }));
}

export { logger };