import { Sequelize } from 'sequelize';
import { logger } from './logger.js';

let sequelize = null;
let models = {};

const initDB = async () => {
    try {
        if (!sequelize) {
            sequelize = new Sequelize({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.MYSQL_PORT || 3306,
                database: process.env.MYSQL_DATABASE || 'mask_system',
                username: process.env.MYSQL_USER || 'mask_user',
                password: process.env.MYSQL_PASSWORD || 'your_user_password',
                dialect: 'mysql',
                logging: msg => logger.debug(msg),
                pool: {
                    max: 10,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            });

            await sequelize.authenticate();
            logger.info('Database connected successfully');
        }
        return sequelize;
    } catch (error) {
        logger.error('Database connection failed', { error: error.message });
        throw error;
    }
};

const getDB = () => {
    if (!sequelize) {
        throw new Error('Database not initialized. Call initDB() first.');
    }
    return sequelize;
};

// 新增一個統一的模型初始化控制
const initializeModels = async () => {
    await initDB();
    
    // 動態導入所有模型
    const [
        getMaskModel,
        getPharmacyModel,
        getPharmacyHoursModel,
        getPharmacyInventoryModel,
        getPurchaseRecordModel,
        getUserModel
    ] = await Promise.all([
        import('../models/Mask.js'),
        import('../models/Pharmacy.js'),
        import('../models/PharmacyHours.js'),
        import('../models/PharmacyInventory.js'),
        import('../models/PurchaseRecord.js'),
        import('../models/User.js')
    ]).then(modules => modules.map(m => m.default));

    // 初始化所有模型
    models.Mask = getMaskModel();
    models.Pharmacy = getPharmacyModel();
    models.PharmacyHours = getPharmacyHoursModel();
    models.PharmacyInventory = getPharmacyInventoryModel();
    models.PurchaseRecord = getPurchaseRecordModel();
    models.User = getUserModel();

    logger.info('All models initialized successfully');
    
    return models;
};

// 獲取已初始化的模型
const getModels = () => {
    if (Object.keys(models).length === 0) {
        throw new Error('Models not initialized. Call initializeModels() first.');
    }
    return models;
};

export { initDB, getDB, initializeModels, getModels }; 