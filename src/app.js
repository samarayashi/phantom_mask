import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger, requestLogger } from './utils/logger.js';
import { initializeModels } from './utils/db.js';
import { setupSwagger } from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 基本中間件配置
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 請求日誌中間件
app.use(requestLogger);

// 設置 Swagger 文檔
setupSwagger(app);

// 健康檢查路由
app.use('/api/health', (await import('./routes/health.routes.js')).default);

// API 路由
app.use('/api/pharmacies', (await import('./routes/pharmacy.routes.js')).default);
app.use('/api/transactions', (await import('./routes/transaction.routes.js')).default);
app.use('/api/search', (await import('./routes/search.routes.js')).default);
app.use('/api/users', (await import('./routes/user.routes.js')).default);

// 錯誤處理中間件
app.use((err, req, res, next) => {
    // 增強錯誤日誌
    logger.error('Unhandled error:', {
        error: {
            message: err.message,
            stack: err.stack,
            name: err.name,
            code: err.code
        },
        req: {
            method: req.method,
            url: req.url,
            body: req.body,
            query: req.query,
            params: req.params
        }
    });

    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
});

// 初始化數據庫和啟動服務器
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // 初始化數據庫模型
        await initializeModels();
        
        // 啟動服務器
        app.listen(PORT, () => {
            logger.info(`服務器已啟動，監聽端口 ${PORT}`);
        });
    } catch (error) {
        logger.error('服務器啟動失敗:', {
            error: {
                message: error.message,
                stack: error.stack
            }
        });
        process.exit(1);
    }
}

// 如果直接運行此文件則啟動服務器
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    startServer();
}

export default app; 