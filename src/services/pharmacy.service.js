import { getModels, getDB } from '../utils/db.js';
import { Op } from 'sequelize';
import { logger } from '../utils/logger.js';
import { AppError, NotFoundError, DatabaseError } from '../middlewares/errorHandler.js';


export const findOpenPharmacies = async (time, dayOfWeek) => {
    const sequelize = getDB();
    try {
        const pharmacies = await sequelize.query(
            `SELECT p.id, p.name, ph.day_of_week, ph.open_time, ph.close_time
            FROM Pharmacies p
            LEFT JOIN PharmacyHours ph ON p.id = ph.pharmacy_id
            WHERE ph.day_of_week = :dayOfWeek 
                AND ph.open_time <= :time AND ph.close_time > :time`,
            {
                replacements: { dayOfWeek, time },
                type: sequelize.QueryTypes.SELECT
            }
        );

        return pharmacies;
    } catch (error) {
        logger.error('Error in findOpenPharmacies service:', error);
        throw error;
    }
};

export const searchPharmacies = async (keyword, limit = 10, offset = 0) => {
    const { Pharmacy } = getModels();
    
    try {
        const result = await Pharmacy.findAndCountAll({
            where: {
                name: {
                    [Op.like]: `%${keyword}%`
                }
            },
            limit,
            offset,
            order: [
                ['name', 'ASC']
            ]
        });

        return {
            pharmacies: result.rows,
            total: result.count
        };
    } catch (error) {
        logger.error('Error in searchPharmacies service:', error);
        throw error;
    }
};

export const findPharmacyMasks = async (pharmacyId, sortBy = 'name', order = 'asc') => {
    const { Pharmacy, PharmacyInventory, Mask } = getModels();
    
    try {
        // 先檢查藥局是否存在
        const pharmacy = await Pharmacy.findByPk(pharmacyId);
        if (!pharmacy) {
            throw new NotFoundError('Pharmacy');
        }

        // 查詢藥局的口罩庫存
        const masks = await PharmacyInventory.findAll({
            where: {
                pharmacy_id: pharmacyId
            },
            include: [{
                model: Mask
            }],
            order: [
                // 動態排序
                sortBy === 'name' 
                    ? [{ model: Mask }, 'name', order]
                    : ['price', order]
            ]
        });

        return masks.map(inventory => ({
            mask_id: inventory.Mask.id,
            mask_name: inventory.Mask.name,
            mask_brand: inventory.Mask.brand,
            mask_color: inventory.Mask.color,
            mask_price: inventory.price,
            mask_stock: inventory.stock
        }));
    } catch (error) {
        logger.error('Error in findPharmacyMasks service:', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new DatabaseError('Failed to fetch pharmacy masks');
    }
};

export const filterPharmaciesByMaskCriteria = async (minPrice, maxPrice, maskCount, comparison) => {
    const sequelize = getDB();
    
    try {
        // 構建 SQL 查詢
        const sql = `
            -- 選擇藥局基本信息和統計數據
            SELECT 
                p.id,
                p.name,
                pi_tmp.total_stock as mask_count,
                pi_tmp.average_price
            FROM 
                Pharmacies p
                LEFT JOIN (
                    SELECT 
                        pi.pharmacy_id,
                        SUM(pi.stock) as total_stock,
                        ROUND(AVG(pi.price), 2) as average_price
                    FROM PharmacyInventory pi
                    WHERE pi.price BETWEEN :minPrice AND :maxPrice
                    GROUP BY pi.pharmacy_id
                ) pi_tmp ON p.id = pi_tmp.pharmacy_id
            -- 根據比較條件過濾結果
            WHERE 
                pi_tmp.total_stock ${comparison === 'more' ? '>' : '<'} :maskCount
            -- 按藥局名稱排序
            ORDER BY 
                p.name ASC;
        `;
        // 執行查詢
        const results = await sequelize.query(sql, {
            replacements: {
                minPrice,
                maxPrice,
                maskCount
            },
            type: sequelize.QueryTypes.SELECT
        });

        // 轉換結果格式
        return results.map(row => ({
            id: row.id,
            name: row.name,
            maskCount: parseInt(row.mask_count),
            averagePrice: parseFloat(row.average_price)
        }));
    } catch (error) {
        logger.error('Error in filterPharmaciesByMaskCriteria service:', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new DatabaseError('Failed to filter pharmacies');
    }
}; 