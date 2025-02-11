import _ from 'lodash';
import { logger } from '../utils/logger.js';
import { transformPharmacies } from './PharmaciesTrans.js';
import { transformMasks } from './MasksTrans.js';
import { transformPharmacyHours } from './PharmacyHoursTrans.js';
import { transformPharmacyInventory } from './PharmacyInventoryTrans.js';
import { transformUsers } from './UsersTrans.js';
import { transformPurchaseRecords } from './PurchaseRecordsTrans.js';
import { initializeModels } from '../utils/db.js';

const runETL = async () => {
    try {
        // 初始化所有模型
        await initializeModels();
        
        logger.info('Starting ETL process...');
        
        // 第一階段：基礎資料表轉換
        logger.info('Phase 1: Transforming base tables...');
        
        // 轉換藥局資料
        const pharmaciesResult = await transformPharmacies();
        logger.info('Pharmacies transformation completed', { count: pharmaciesResult.length });
        
        // 轉換口罩資料
        const masksResult = await transformMasks();
        logger.info('Masks transformation completed', { count: masksResult.length });
        
        // 第二階段：關聯資料表轉換
        logger.info('Phase 2: Transforming related tables...');
        
        // 轉換藥局營業時間
        const hoursResult = await transformPharmacyHours();
        logger.info('Pharmacy hours transformation completed', { count: hoursResult.length });
        
        // 轉換藥局庫存
        const inventoryResult = await transformPharmacyInventory();
        logger.info('Pharmacy inventory transformation completed', { count: inventoryResult.length });
        
        // 第三階段：使用者相關資料轉換
        logger.info('Phase 3: Transforming user related tables...');
        
        // 轉換使用者資料
        const usersResult = await transformUsers();
        logger.info('Users transformation completed', { count: usersResult.length });
        
        // 轉換購買記錄
        const purchaseResult = await transformPurchaseRecords();
        logger.info('Purchase records transformation completed', { count: purchaseResult.length });
        
        logger.info('ETL process completed successfully');
        
    } catch (error) {
        logger.error('ETL process failed', { error: error.message });
        throw error;
    }
};

export { runETL };

// 只在直接執行時運行 ETL
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runETL().catch(error => {
        console.error('ETL process failed:', error);
        process.exit(1);
    });
}