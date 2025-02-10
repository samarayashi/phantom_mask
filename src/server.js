import app from './app.js';
import { logger } from './utils/logger.js';
import { initializeModels } from './utils/db.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // 初始化數據庫連接和模型
        await initializeModels();
        
        // 啟動服務器
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 