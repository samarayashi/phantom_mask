import _ from 'lodash';
import { logger } from '../lib/logger.js';
import { readJsonFile } from '../lib/fileUtils.js';
import getPharmacyModel from '../models/Pharmacy.js';
import { getDB } from '../lib/db.js';

const transformPharmacyData = (pharmacy) => {
    return {
        name: pharmacy.name,
        cash_balance: pharmacy.cashBalance
    };
};

const bulkInsertPharmacies = async (pharmacies) => {
    const transaction = await getDB().transaction();
    
    try {
        const Pharmacy = getPharmacyModel();
        await Pharmacy.bulkCreate(pharmacies, {
            updateOnDuplicate: ['cash_balance', 'updated_at'],
            transaction
        });
        
        await transaction.commit();
        logger.info('Bulk insert pharmacies completed');
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const transformPharmacies = async () => {
    try {
        // 讀取藥局資料
        const pharmacies = await readJsonFile('data/pharmacies.json');
        
        // 轉換資料格式
        const transformedPharmacies = pharmacies.map(transformPharmacyData);
        
        // 批次寫入資料庫
        await bulkInsertPharmacies(transformedPharmacies);
        
        return transformedPharmacies;
        
    } catch (error) {
        logger.error('Error transforming pharmacies', { error: error.message });
        throw error;
    }
};

export { transformPharmacies };
