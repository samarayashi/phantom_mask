import _ from 'lodash';
import { logger } from '../utils/logger.js';
import { readJsonFile } from './utils/fileUtils.js';
import { getModels, getDB } from '../utils/db.js';

const transformPharmacyInventory = async () => {
    try {
        // 讀取藥局資料
        const pharmacies = await readJsonFile('data/pharmacies.json');
        
        // 獲取模型
        const { Pharmacy, Mask, PharmacyInventory } = getModels();
        
        // 取得所有藥局和口罩的ID對應
        const [pharmacyRecords, maskRecords] = await Promise.all([
            Pharmacy.findAll({ attributes: ['id', 'name'] }),
            Mask.findAll({ attributes: ['id', 'name'] })
        ]);
        
        const pharmacyMap = _.keyBy(pharmacyRecords, 'name');
        const maskMap = _.keyBy(maskRecords, 'name');
        
        // 轉換並整理庫存資料
        const allInventories = [];
        
        for (const pharmacy of pharmacies) {
            const pharmacyId = pharmacyMap[pharmacy.name]?.id;
            if (!pharmacyId) {
                logger.warn(`Pharmacy not found: ${pharmacy.name}`);
                continue;
            }
            
            for (const mask of pharmacy.masks) {
                const maskId = maskMap[mask.name]?.id;
                if (!maskId) {
                    logger.warn(`Mask not found: ${mask.name}`);
                    continue;
                }
                
                allInventories.push({
                    pharmacy_id: pharmacyId,
                    mask_id: maskId,
                    price: mask.price,
                    stock: 1 // 初始庫存設為1
                });
            }
        }
        
        // 批次寫入資料庫
        const transaction = await getDB().transaction();
        
        try {
            await PharmacyInventory.bulkCreate(allInventories, {
                updateOnDuplicate: ['price', 'updated_at'],
                transaction
            });
            
            await transaction.commit();
            logger.info('Bulk insert pharmacy inventory completed', {
                count: allInventories.length
            });
            
            return allInventories;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        logger.error('Error transforming pharmacy inventory', { error: error.message });
        throw error;
    }
};

export { transformPharmacyInventory }; 