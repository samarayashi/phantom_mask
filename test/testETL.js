import { logger } from '../lib/logger.js';
import { initializeModels } from '../lib/db.js';
import { transformPharmacies } from '../etl/PharmaciesTrans.js';
import { transformMasks } from '../etl/MasksTrans.js';
import { transformPharmacyHours } from '../etl/PharmacyHoursTrans.js';
import { transformPharmacyInventory } from '../etl/PharmacyInventoryTrans.js';
import { transformUsers } from '../etl/UsersTrans.js';
import { transformPurchaseRecords } from '../etl/PurchaseRecordsTrans.js';

const testTransformation = async (name, transformFn) => {
    try {
        console.log(`Testing ${name}...`);
        const result = await transformFn();
        console.log(`${name} completed: ${result.length} records processed`);
    } catch (error) {
        console.log(`${name} failed: ${error}`);
        throw error;
    }
};

const runTest = async () => {
    try {
        // 首先初始化所有模型
        await initializeModels();

        // 按照依賴順序測試轉換
        await testTransformation('Pharmacies', transformPharmacies);
        await testTransformation('Masks', transformMasks);
        await testTransformation('PharmacyHours', transformPharmacyHours);
        await testTransformation('PharmacyInventory', transformPharmacyInventory);
        await testTransformation('Users', transformUsers);
        await testTransformation('PurchaseRecords', transformPurchaseRecords);
        
    } catch (error) {
        console.log('Test failed:', error);
    }
};

runTest(); 