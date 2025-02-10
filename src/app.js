import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from './utils/logger.js';
import { initializeModels } from './utils/db.js';

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

// Swagger 配置
const swaggerDocument = YAML.load(join(__dirname, '../docs/swagger/openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API 路由
app.use('/api/pharmacies', (await import('./routes/pharmacy.routes.js')).default);
app.use('/api/transactions', (await import('./routes/transaction.routes.js')).default);
// app.use('/api/masks', (await import('./routes/mask.routes.js')).default);

// 錯誤處理中間件
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
});

export default app; 