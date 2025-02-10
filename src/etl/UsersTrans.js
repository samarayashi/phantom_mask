import _ from 'lodash';
import { logger } from '../utils/logger.js';
import { readJsonFile } from './utils/fileUtils.js';
import { getModels, getDB } from '../utils/db.js';

const transformUsers = async () => {
    try {
        // 讀取使用者資料
        const users = await readJsonFile('data/users.json');
        
        // 獲取模型
        const { User } = getModels();
        
        // 轉換資料格式
        const transformedUsers = users.map(user => ({
            name: user.name,
            cash_balance: user.cashBalance
        }));
        
        // 批次寫入資料庫
        const transaction = await getDB().transaction();
        
        try {
            await User.bulkCreate(transformedUsers, {
                updateOnDuplicate: ['cash_balance', 'updated_at'],
                transaction
            });
            
            await transaction.commit();
            logger.info('Bulk insert users completed', {
                count: transformedUsers.length
            });
            
            return transformedUsers;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        logger.error('Error transforming users', { error: error.message });
        throw error;
    }
};

export { transformUsers }; 