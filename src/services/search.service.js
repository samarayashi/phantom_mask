import { getDB } from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../middlewares/errorHandler.js';

// v1: 使用 PostgreSQL 的全文搜索實現
export const searchV1 = async (type, keyword, limit = 10, offset = 0) => {
    const sequelize = getDB();
    
    try {
        let sql;
        if (type === 'pharmacy') {
            sql = `
                SELECT 
                    id,
                    name,
                    similarity(name, :keyword) as relevance
                FROM 
                    pharmacies
                WHERE 
                    name % :keyword
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
                    greatest(
                        similarity(brand, :keyword),
                        similarity(name, :keyword)
                    ) as relevance
                FROM 
                    masks
                WHERE 
                    brand % :keyword
                    OR name % :keyword
                ORDER BY 
                    relevance DESC
                LIMIT :limit OFFSET :offset;
            `;
        }

        // 處理搜尋關鍵字
        const searchKeyword = keyword.trim();

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
            ? `SELECT COUNT(*) as total FROM pharmacies WHERE name % :keyword`
            : `SELECT COUNT(*) as total FROM masks WHERE brand % :keyword OR name % :keyword`;

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

// v2: 使用 ILIKE 的實現
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
                        WHEN name ILIKE :exactKeyword THEN 100  -- 完全匹配
                        WHEN name ILIKE :startWithKeyword THEN 80  -- 開頭匹配
                        WHEN name ILIKE :containKeyword THEN 60  -- 包含匹配
                        ELSE 40  -- 其他匹配情況
                    END as relevance
                FROM 
                    pharmacies
                WHERE 
                    name ILIKE :containKeyword
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
                        WHEN brand ILIKE :exactKeyword THEN 100  -- 完全匹配
                        WHEN brand ILIKE :startWithKeyword THEN 80  -- 開頭匹配
                        WHEN brand ILIKE :containKeyword THEN 60  -- 包含匹配
                        WHEN name ILIKE :containKeyword THEN 40  -- 名稱包含匹配
                        ELSE 20  -- 其他匹配情況
                    END as relevance
                FROM 
                    masks
                WHERE 
                    brand ILIKE :containKeyword
                    OR name ILIKE :containKeyword
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
            ? `SELECT COUNT(*) as total FROM pharmacies WHERE name ILIKE :containKeyword`
            : `SELECT COUNT(*) as total FROM masks WHERE brand ILIKE :containKeyword OR name ILIKE :containKeyword`;

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