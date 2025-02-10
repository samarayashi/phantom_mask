import _ from 'lodash';
import { logger } from '../tools/logger.js';
import { readJsonFile } from '../tools/fileUtils.js';
import { getModels, getDB } from '../tools/db.js';
import { parseOpeningHours } from './parser/PharmacyHoursParser.js';

const transformPharmacyHours = async () => {
    try {
        // 讀取藥局資料
        const pharmacies = await readJsonFile('data/pharmacies.json');
        
        // 獲取模型
        const { Pharmacy, PharmacyHours } = getModels();
        
        // 取得所有藥局的ID對應
        const pharmacyRecords = await Pharmacy.findAll({
            attributes: ['id', 'name']
        });
        const pharmacyMap = _.keyBy(pharmacyRecords, 'name');
        
        // 轉換並整理營業時間資料
        const allPharmacyHours = [];
        
        for (const pharmacy of pharmacies) {
            const pharmacyId = pharmacyMap[pharmacy.name]?.id;
            if (!pharmacyId) {
                logger.warn(`Pharmacy not found: ${pharmacy.name}`);
                continue;
            }
            
            const hours = parseOpeningHours(pharmacy.openingHours);
            const pharmacyHours = hours.map(hour => ({
                pharmacy_id: pharmacyId,
                ...hour
            }));
            
            allPharmacyHours.push(...pharmacyHours);
        }
        
        // 批次寫入資料庫
        const transaction = await getDB().transaction();
        
        try {
            // // 先刪除現有的營業時間記錄
            // await PharmacyHours.destroy({
            //     where: {},
            //     transaction
            // });
            
            // 批次插入新的營業時間記錄
            await PharmacyHours.bulkCreate(allPharmacyHours, {
                transaction
            });
            
            await transaction.commit();
            logger.info('Bulk insert pharmacy hours completed', {
                count: allPharmacyHours.length
            });
            
            return allPharmacyHours;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        logger.error('Error transforming pharmacy hours', { error: error.message });
        throw error;
    }
};

export { transformPharmacyHours }; 