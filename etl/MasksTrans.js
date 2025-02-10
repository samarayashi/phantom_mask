import _ from 'lodash';
import { logger } from '../lib/logger.js';
import { readJsonFile } from '../lib/fileUtils.js';
import { getModels, getDB } from '../lib/db.js';

const parseMaskName = (maskName) => {
    // 解析口罩名稱，例如: "True Barrier (green) (3 per pack)"
    const matches = maskName.match(/^(.+?)\s*\((\w+)\)\s*\((\d+)\s*per\s*pack\)$/);
    if (!matches) {
        throw new Error(`Invalid mask name format: ${maskName}`);
    }
    
    const [, brand, color, pieces] = matches;
    return {
        name: maskName,
        brand: brand.trim(),
        color: color.trim(),
        pieces_per_pack: parseInt(pieces, 10)
    };
};

const extractUniqueMasks = (pharmacies) => {
    // 從所有藥局資料中提取不重複的口罩
    return _(pharmacies)
        .flatMap(pharmacy => pharmacy.masks)
        .map(mask => parseMaskName(mask.name))
        .uniqBy('name')
        .value();
};

const bulkInsertMasks = async (masks) => {
    const transaction = await getDB().transaction();
    
    try {
        const Mask = getModels().Mask;
        await Mask.bulkCreate(masks, {
            updateOnDuplicate: ['brand', 'color', 'pieces_per_pack', 'updated_at'],
            transaction
        });
        
        await transaction.commit();
        logger.info('Bulk insert masks completed');
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const transformMasks = async () => {
    try {
        // 讀取藥局資料
        const pharmacies = await readJsonFile('data/pharmacies.json');
        
        // 獲取模型
        const { Mask } = getModels();
        
        // 提取不重複的口罩資料
        const masks = extractUniqueMasks(pharmacies);
        
        // 批次寫入資料庫
        await bulkInsertMasks(masks);
        
        return masks;
        
    } catch (error) {
        logger.error('Error transforming masks', { error: error.message });
        throw error;
    }
};

export { transformMasks, parseMaskName }; 