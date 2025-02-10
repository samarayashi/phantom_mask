import { getDB } from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../middlewares/errorHandler.js';

export const search = async (type, keyword, limit = 10, offset = 0) => {
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
            : `SELECT COUNT(*) as total FROM Masks WHERE MATCH(name) AGAINST(:keyword IN BOOLEAN MODE) OR MATCH(brand) AGAINST(:keyword IN BOOLEAN MODE)`;

        const [{ total }] = await sequelize.query(countSql, {
            replacements: { keyword: searchKeyword },
            type: sequelize.QueryTypes.SELECT
        });

        return {
            results,
            total: parseInt(total)
        };
    } catch (error) {
        logger.error('Error in search service:', error);
        throw new DatabaseError('Failed to perform search');
    }
}; 