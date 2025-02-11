import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, align, errors } = winston.format;

// 自定義日誌格式
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    
    // 添加錯誤堆棧（如果存在）
    if (stack) {
        msg += `\nStack Trace: ${stack}`;
    }
    
    // 添加請求信息（如果存在）
    if (metadata.req) {
        const { method, url, body, query, params } = metadata.req;
        msg += `\nRequest: ${method} ${url}`;
        if (Object.keys(body || {}).length > 0) msg += `\nBody: ${JSON.stringify(body)}`;
        if (Object.keys(query || {}).length > 0) msg += `\nQuery: ${JSON.stringify(query)}`;
        if (Object.keys(params || {}).length > 0) msg += `\nParams: ${JSON.stringify(params)}`;
    }
    
    // 添加響應信息（如果存在）
    if (metadata.res) {
        const { statusCode } = metadata.res;
        msg += `\nResponse: ${statusCode}`;
    }
    
    // 添加其他元數據
    const otherMetadata = { ...metadata };
    delete otherMetadata.req;
    delete otherMetadata.res;
    if (Object.keys(otherMetadata).length > 0) {
        msg += `\nMetadata: ${JSON.stringify(otherMetadata, null, 2)}`;
    }
    
    return msg;
});

// 設置日誌記錄器
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        errors({ stack: true }),
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

// 添加請求日誌中間件
const requestLogger = (req, res, next) => {
    // 記錄請求開始
    const startTime = Date.now();
    
    // 在響應結束時記錄完整信息
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 400 ? 'error' : 'info';
        
        logger[logLevel](`${req.method} ${req.url} ${res.statusCode} ${duration}ms`, {
            req: {
                method: req.method,
                url: req.url,
                body: req.body,
                query: req.query,
                params: req.params,
                headers: req.headers
            },
            res: {
                statusCode: res.statusCode,
                duration
            }
        });
    });
    
    next();
};

export { logger, requestLogger };