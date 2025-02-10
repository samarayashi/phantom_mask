import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from './utils/logger.js';
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
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// 設置 Swagger 文檔
setupSwagger(app);

// API 路由
app.use('/api/pharmacies', (await import('./routes/pharmacy.routes.js')).default);
app.use('/api/transactions', (await import('./routes/transaction.routes.js')).default);
app.use('/api/search', (await import('./routes/search.routes.js')).default);

// 錯誤處理中間件
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
});

export default app; 