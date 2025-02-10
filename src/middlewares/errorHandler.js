import { logger } from '../utils/logger.js';

// 基礎錯誤類
export class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// 特定錯誤類型
export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(404, `${resource} not found`);
    }
}

export class ValidationError extends AppError {
    constructor(message) {
        super(400, message);
    }
}

export class DatabaseError extends AppError {
    constructor(message) {
        super(500, message);
        this.isOperational = false;  // 資料庫錯誤通常不是可預期的操作錯誤
    }
}

// 錯誤處理中間件
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // 開發環境：返回詳細錯誤信息
    if (process.env.NODE_ENV === 'development') {
        logger.error('Error details:', {
            status: err.status,
            statusCode: err.statusCode,
            message: err.message,
            stack: err.stack
        });

        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // 生產環境：只返回必要信息
        logger.error('Error:', {
            status: err.status,
            statusCode: err.statusCode,
            message: err.message
        });

        if (err.isOperational) {
            // 可預期的操作錯誤
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            // 未預期的錯誤
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
}; 