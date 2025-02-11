import { getDB, getModels } from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { 
    DatabaseError, 
    InsufficientFundsError, 
    InsufficientStockError 
} from '../middlewares/errorHandler.js';

export const findTopUsers = async (startDate, endDate, limit = 10, sortBy = 'quantity') => {
    const sequelize = getDB();
    
    try {
        const sql = `
            -- 查詢特定日期範圍內購買口罩數量最多的用戶
            SELECT 
                u.id as user_id,
                u.name,
                -- 計算購買口罩總數和總金額
                SUM(pr.quantity) as total_masks,
                SUM(pr.transaction_amount) as total_amount
            FROM 
                purchase_records pr
                LEFT JOIN users u ON u.id = pr.user_id
            WHERE 
                DATE(pr.transaction_date) BETWEEN :startDate AND :endDate
            GROUP BY 
                u.id, u.name
            ORDER BY 
                ${sortBy === 'amount' ? 'total_amount' : 'total_masks'} DESC
            LIMIT :limit;
        `;

        const results = await sequelize.query(sql, {
            replacements: { startDate, endDate, limit },
            type: sequelize.QueryTypes.SELECT
        });

        return results.map(row => ({
            userId: row.user_id,
            name: row.name,
            totalMasks: parseInt(row.total_masks),
            totalAmount: parseFloat(row.total_amount)
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
                purchase_records pr
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

export const processPurchase = async (userId, pharmacyInventoryId, quantity) => {
    const sequelize = getDB();
    const { User, PharmacyInventory } = getModels();
    const transaction = await sequelize.transaction();
    
    try {
        // 1. 檢查並鎖定用戶記錄
        const user = await User.findByPk(userId, {
            attributes: ['id', 'cash_balance'],
            lock: true,
            transaction
        });

        if (!user) {
            throw new DatabaseError('User not found');
        }

        // 2. 檢查並鎖定庫存記錄
        const [inventory] = await sequelize.query(`
            SELECT 
                pi.id,
                pi.stock,
                pi.price,
                p.id as pharmacy_id,
                p.cash_balance as pharmacy_balance
            FROM 
                pharmacy_inventory pi
                INNER JOIN pharmacies p ON pi.pharmacy_id = p.id
            WHERE 
                pi.id = :pharmacyInventoryId
            FOR UPDATE
        `, {
            replacements: { pharmacyInventoryId },
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (!inventory) {
            throw new DatabaseError('Inventory not found');
        }

        // 3. 業務邏輯檢查
        if (inventory.stock < quantity) {
            throw new InsufficientStockError();
        }

        const totalAmount = inventory.price * quantity;

        if (user.cash_balance < totalAmount) {
            throw new InsufficientFundsError();
        }

        // 4. 執行交易更新
        // 4.1 更新庫存
        await PharmacyInventory.update({
            stock: inventory.stock - quantity
        }, {
            where: { id: pharmacyInventoryId },
            transaction
        });

        // 4.2 更新藥局餘額
        await sequelize.query(`
            UPDATE pharmacies 
            SET cash_balance = cash_balance + :totalAmount 
            WHERE id = :pharmacyId;
        `, {
            replacements: { 
                totalAmount, 
                pharmacyId: inventory.pharmacy_id
            },
            transaction
        });

        // 4.2 更新用戶餘額
        await sequelize.query(`
            UPDATE users 
            SET cash_balance = cash_balance - :totalAmount 
            WHERE id = :userId;
        `, {
            replacements: { 
                totalAmount, 
                userId
            },
            transaction
        });

        // 4.3 創建交易記錄
        await sequelize.query(`
            INSERT INTO purchase_records (
                user_id,
                pharmacy_id,
                pharmacy_inventory_id,
                transaction_amount,
                quantity,
                transaction_date,
                status
            ) VALUES (
                :userId,
                :pharmacyId,
                :pharmacyInventoryId,
                :totalAmount,
                :quantity,
                NOW(),
                'success'
            )
        `, {
            replacements: {
                userId,
                pharmacyId: inventory.pharmacy_id,
                pharmacyInventoryId,
                totalAmount,
                quantity
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
        });

        await transaction.commit();

        // 5. 返回交易結果
        return {
            totalAmount,
            quantity,
            status: 'success'
        };
    } catch (error) {
        await transaction.rollback();
        logger.error('Error in processPurchase service:', error);
        throw error;
    }
}; 