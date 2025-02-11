import { getDB, getModels } from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, NotFoundError } from '../middlewares/errorHandler.js';

export const findUserById = async (userId) => {
    const { User } = getModels();
    
    try {
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw new NotFoundError('User');
        }

        return {
            id: user.id,
            name: user.name,
            cash_balance: user.cash_balance,
            created_at: user.created_at
        };
    } catch (error) {
        logger.error('Error in findUserById service:', error);
        throw error;
    }
};

export const findUserByName = async (name) => {
    const { User } = getModels();
    
    try {
        const user = await User.findOne({
            where: { name }
        });
        
        if (!user) {
            throw new NotFoundError('User');
        }

        return {
            id: user.id,
            name: user.name,
            cash_balance: user.cash_balance,
            created_at: user.created_at
        };
    } catch (error) {
        logger.error('Error in findUserByName service:', error);
        throw error;
    }
};

export const searchUsers = async (keyword, limit = 10, offset = 0) => {
    const sequelize = getDB();
    
    try {
        const sql = `
            SELECT 
                id,
                name,
                cash_balance,
                created_at
            FROM 
                Users
            WHERE 
                name LIKE :keyword
            ORDER BY 
                name ASC
            LIMIT :limit OFFSET :offset;
        `;

        const results = await sequelize.query(sql, {
            replacements: { 
                keyword: `%${keyword}%`,
                limit,
                offset
            },
            type: sequelize.QueryTypes.SELECT
        });

        // 計算總數
        const [{ total }] = await sequelize.query(
            'SELECT COUNT(*) as total FROM Users WHERE name LIKE :keyword',
            {
                replacements: { keyword: `%${keyword}%` },
                type: sequelize.QueryTypes.SELECT
            }
        );

        return {
            users: results,
            total: parseInt(total)
        };
    } catch (error) {
        logger.error('Error in searchUsers service:', error);
        throw new DatabaseError('Failed to search users');
    }
}; 