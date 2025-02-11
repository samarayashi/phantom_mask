import { Sequelize } from 'sequelize';
import { logger } from './logger.js';
import dbConfig from '../config/database.js';

let sequelize = null;
let models = {};

// Sequelize 日誌配置
const configureSequelizeLogging = () => {
    // 生產環境下不輸出 SQL 查詢
    if (process.env.NODE_ENV === 'production') {
        return false;
    }
    
    // 開發環境下，輸出 SQL 查詢信息
    return (msg) => {
        logger.debug(msg);
    };
};

// Raw SQL 查詢配置
const rawQueryConfig = {
    type: Sequelize.QueryTypes.SELECT,
    logging: (sql) => logger.debug('Executing raw query', { sql: sql.substring(0, 100) + '...' })
};

const executeRawQuery = async (sql, options = {}) => {
    if (!sequelize) {
        throw new Error('Database not initialized. Call initDB() first.');
    }
    return sequelize.query(sql, {
        ...rawQueryConfig,
        ...options
    });
};

const initDB = async () => {
    try {
        if (!sequelize) {
            // 使用統一的配置
            if (process.env.NODE_ENV === 'production' && dbConfig.url) {
                sequelize = new Sequelize(dbConfig.url, {
                    dialect: dbConfig.dialect,
                    dialectOptions: dbConfig.dialectOptions,
                    logging: configureSequelizeLogging(),
                    pool: dbConfig.pool
                });
            } else {
                sequelize = new Sequelize({
                    ...dbConfig,
                    logging: configureSequelizeLogging()
                });
            }

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

    // 初始化模型關聯
    const { initializeAssociations } = await import('../models/init-models.js');
    await initializeAssociations();

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

export { initDB, getDB, initializeModels, getModels, executeRawQuery }; 