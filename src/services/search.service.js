import { getDB } from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../middlewares/errorHandler.js';

// v1: 使用 MATCH AGAINST 的實現
export const searchV1 = async (type, keyword, limit = 10, offset = 0) => {
    const sequelize = getDB();
    
    try {
        let sql;
        if (type === 'pharmacy') {
            sql = `
                SELECT 
                    id,
                    name,
                    MATCH(name) AGAINST(:keyword IN BOOLEAN MODE) as relevance
                FROM 
                    Pharmacies
                WHERE 
                    MATCH(name) AGAINST(:keyword IN BOOLEAN MODE)
                ORDER BY 
                    relevance DESC
                LIMIT :limit OFFSET :offset;
            `;
        } else {
            sql = `
                SELECT 
                    id,
                    name,
                    brand,
                    color,
                    MATCH(brand) AGAINST(:keyword IN BOOLEAN MODE) as relevance
                FROM 
                    Masks
                WHERE 
                    MATCH(brand) AGAINST(:keyword IN BOOLEAN MODE)
                ORDER BY 
                    relevance DESC
                LIMIT :limit OFFSET :offset;
            `;
        }

        // 處理搜尋關鍵字並消毒標點符號
        const searchKeyword = keyword
            .replace(/[^\w\s]/g, '') // 移除所有標點符號
            .split(' ')
            .filter(word => word.length > 0) // 過濾空字串
            .map(word => `+${word}*`)  // 添加前綴搜尋
            .join(' ');

        const results = await sequelize.query(sql, {
            replacements: { 
                keyword: searchKeyword,
                limit, 
                offset 
            },
            type: sequelize.QueryTypes.SELECT
        });

        // 計算總數
        const countSql = type === 'pharmacy' 
            ? `SELECT COUNT(*) as total FROM Pharmacies WHERE MATCH(name) AGAINST(:keyword IN BOOLEAN MODE)`
            : `SELECT COUNT(*) as total FROM Masks WHERE MATCH(brand) AGAINST(:keyword IN BOOLEAN MODE)`;

        const [{ total }] = await sequelize.query(countSql, {
            replacements: { keyword: searchKeyword },
            type: sequelize.QueryTypes.SELECT
        });

        return {
            results,
            total: parseInt(total)
        };
    } catch (error) {
        logger.error('Error in searchV1 service:', error);
        throw new DatabaseError('Failed to perform search');
    }
};

// v2: 使用 LIKE 的實現
export const searchV2 = async (type, keyword, limit = 10, offset = 0) => {
    const sequelize = getDB();
    
    try {
        let sql;
        if (type === 'pharmacy') {
            sql = `
                SELECT 
                    id,
                    name,
                    CASE
                        WHEN name = :exactKeyword THEN 100  -- 完全匹配
                        WHEN name LIKE :startWithKeyword THEN 80  -- 開頭匹配
                        WHEN name LIKE :containKeyword THEN 60  -- 包含匹配
                        ELSE 40  -- 其他匹配情況
                    END as relevance
                FROM 
                    Pharmacies
                WHERE 
                    name LIKE :containKeyword
                ORDER BY 
                    relevance DESC,
                    name ASC
                LIMIT :limit OFFSET :offset;
            `;
        } else {
            sql = `
                SELECT 
                    id,
                    name,
                    brand,
                    color,
                    CASE
                        WHEN brand = :exactKeyword THEN 100  -- 完全匹配
                        WHEN brand LIKE :startWithKeyword THEN 80  -- 開頭匹配
                        WHEN brand LIKE :containKeyword THEN 60  -- 包含匹配
                        WHEN name LIKE :containKeyword THEN 40  -- 名稱包含匹配
                        ELSE 20  -- 其他匹配情況
                    END as relevance
                FROM 
                    Masks
                WHERE 
                    brand LIKE :containKeyword
                    OR name LIKE :containKeyword
                ORDER BY 
                    relevance DESC,
                    brand ASC
                LIMIT :limit OFFSET :offset;
            `;
        }

        // 處理搜尋關鍵字
        const searchKeyword = keyword.trim();
        const results = await sequelize.query(sql, {
            replacements: { 
                exactKeyword: searchKeyword,
                startWithKeyword: `${searchKeyword}%`,
                containKeyword: `%${searchKeyword}%`,
                limit, 
                offset 
            },
            type: sequelize.QueryTypes.SELECT
        });

        // 計算總數
        const countSql = type === 'pharmacy' 
            ? `SELECT COUNT(*) as total FROM Pharmacies WHERE name LIKE :containKeyword`
            : `SELECT COUNT(*) as total FROM Masks WHERE brand LIKE :containKeyword OR name LIKE :containKeyword`;

        const [{ total }] = await sequelize.query(countSql, {
            replacements: { 
                containKeyword: `%${searchKeyword}%`
            },
            type: sequelize.QueryTypes.SELECT
        });

        return {
            results,
            total: parseInt(total)
        };
    } catch (error) {
        logger.error('Error in searchV2 service:', error);
        throw new DatabaseError('Failed to perform search');
    }
}; 