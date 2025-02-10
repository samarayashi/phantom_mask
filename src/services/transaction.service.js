import { getDB } from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../middlewares/errorHandler.js';

export const findTopUsers = async (startDate, endDate, limit = 10) => {
    const sequelize = getDB();
    
    try {
        const sql = `
            -- 查詢特定日期範圍內購買口罩數量最多的用戶
            SELECT 
                u.id as user_id,
                u.name,
                -- 計算購買口罩總數（主要排序依據）
                SUM(pr.quantity) as total_masks
            FROM 
                PurchaseRecords pr
                LEFT JOIN Users u ON u.id = pr.user_id
            WHERE 
                DATE(pr.transaction_date) BETWEEN :startDate AND :endDate
            GROUP BY 
                u.id, u.name
            ORDER BY 
                total_masks DESC
            LIMIT :limit;
        `;

        const results = await sequelize.query(sql, {
            replacements: { startDate, endDate, limit },
            type: sequelize.QueryTypes.SELECT
        });

        
        return results.map(row => ({
            userId: row.user_id,
            name: row.name,
            totalMasks: parseInt(row.total_masks)
        }));
    } catch (error) {
        logger.error('Error in findTopUsers service:', error);
        throw new DatabaseError('Failed to fetch top users');
    }
};

export const getTransactionStatistics = async (startDate, endDate) => {
    const sequelize = getDB();
    
    try {
        const sql = `

        SELECT 
                -- 計算總口罩數量
                SUM(pr.quantity) as total_masks,
                -- 計算總交易金額
                SUM(pr.transaction_amount) as total_amount
            FROM 
                PurchaseRecords pr
            WHERE 
                DATE(pr.transaction_date) BETWEEN :startDate AND :endDate;
        `;

        const [result] = await sequelize.query(sql, {
            replacements: { startDate, endDate },
            type: sequelize.QueryTypes.SELECT
        });

        // 修改回傳結構，只包含口罩總數和交易總額
        return {
            totalMasks: parseInt(result.total_masks) || 0,
            totalAmount: parseFloat(result.total_amount) || 0
        };
    } catch (error) {
        logger.error('Error in getTransactionStatistics service:', error);
        throw new DatabaseError('Failed to fetch transaction statistics');
    }
}; 