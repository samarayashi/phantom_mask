import _ from 'lodash';
import { logger } from '../utils/logger.js';
import { readJsonFile } from './utils/fileUtils.js';
import { getModels, getDB, executeRawQuery } from '../utils/db.js';

const transformPurchaseRecords = async () => {
    try {
        // 讀取使用者資料
        const users = await readJsonFile('data/users.json');
        
        // 獲取模型
        const { User, Pharmacy, Mask, PharmacyInventory, PurchaseRecord } = getModels();
        const sequelize = getDB();
        
        // 取得所有必要的ID對應
        const [userRecords, pharmacyRecords, maskRecords] = await Promise.all([
            User.findAll({ attributes: ['id', 'name'] }),
            Pharmacy.findAll({ attributes: ['id', 'name'] }),
            Mask.findAll({ attributes: ['id', 'name'] })
        ]);
        
        const userMap = _.keyBy(userRecords, 'name');
        const pharmacyMap = _.keyBy(pharmacyRecords, 'name');
        const maskMap = _.keyBy(maskRecords, 'name');
        
        // 使用原生 SQL 查詢取得庫存記錄
        const inventoryRecords = await executeRawQuery(`
            SELECT 
                pi.id,
                p.name as pharmacy_name,
                m.name as mask_name
            FROM PharmacyInventory pi
            JOIN Pharmacies p ON pi.pharmacy_id = p.id
            JOIN Masks m ON pi.mask_id = m.id
        `);
        
        // 建立庫存查找索引
        const inventoryMap = new Map();
        inventoryRecords.forEach(inv => {
            const key = `${inv.pharmacy_name}:${inv.mask_name}`;
            inventoryMap.set(key, inv.id);
        });
        
        // 轉換並整理購買記錄
        const allPurchaseRecords = [];
        
        for (const user of users) {
            const userId = userMap[user.name]?.id;
            if (!userId) {
                logger.warn(`User not found: ${user.name}`);
                continue;
            }
            
            for (const purchase of user.purchaseHistories || []) {
                const pharmacyId = pharmacyMap[purchase.pharmacyName]?.id;
                if (!pharmacyId) {
                    logger.warn(`Pharmacy not found: ${purchase.pharmacyName}`);
                    continue;
                }
                
                const inventoryKey = `${purchase.pharmacyName}:${purchase.maskName}`;
                const inventoryId = inventoryMap.get(inventoryKey);
                if (!inventoryId) {
                    logger.warn(`Inventory not found: ${inventoryKey}`);
                    continue;
                }
                
                allPurchaseRecords.push({
                    user_id: userId,
                    pharmacy_id: pharmacyId,
                    pharmacy_inventory_id: inventoryId,
                    transaction_amount: purchase.transactionAmount,
                    quantity: 1,
                    transaction_date: purchase.transactionDate,
                    status: 'success'
                });
            }
        }
        
        // 批次寫入資料庫
        const transaction = await sequelize.transaction();
        
        try {
            await PurchaseRecord.bulkCreate(allPurchaseRecords, {
                transaction
            });
            
            await transaction.commit();
            logger.info('Bulk insert purchase records completed', {
                count: allPurchaseRecords.length
            });
            
            return allPurchaseRecords;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        logger.error('Error transforming purchase records', { error: error.message });
        throw error;
    }
};

export { transformPurchaseRecords }; 