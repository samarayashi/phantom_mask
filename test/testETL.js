import { logger } from '../src/utils/logger.js';
import { initializeModels } from '../src/utils/db.js';
import { transformPharmacies } from '../src/etl/PharmaciesTrans.js';
import { transformMasks } from '../src/etl/MasksTrans.js';
import { transformPharmacyHours } from '../src/etl/PharmacyHoursTrans.js';
import { transformPharmacyInventory } from '../src/etl/PharmacyInventoryTrans.js';
import { transformUsers } from '../src/etl/UsersTrans.js';
import { transformPurchaseRecords } from '../src/etl/PurchaseRecordsTrans.js';

const testTransformation = async (name, transformFn) => {
    try {
        logger.info(`開始執行 ${name} 轉換...`);
        const result = await transformFn();
        logger.info(`${name} 轉換完成`, { recordsProcessed: result.length });
        return result;
    } catch (error) {
        logger.error(`${name} 轉換失敗`, { error: error.message, stack: error.stack });
        throw error;
    }
};

const runTest = async () => {
    try {
        logger.info('開始ETL測試流程');
        // 首先初始化所有模型
        await initializeModels();
        logger.info('數據庫模型初始化完成');

        // 按照依賴順序測試轉換
        await testTransformation('Pharmacies', transformPharmacies);
        await testTransformation('Masks', transformMasks);
        await testTransformation('PharmacyHours', transformPharmacyHours);
        await testTransformation('PharmacyInventory', transformPharmacyInventory);
        await testTransformation('Users', transformUsers);
        await testTransformation('PurchaseRecords', transformPurchaseRecords);
        
        logger.info('所有ETL測試流程完成');
    } catch (error) {
        logger.error('ETL測試流程失敗', { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

runTest(); 