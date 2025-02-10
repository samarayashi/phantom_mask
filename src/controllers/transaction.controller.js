import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.js';
import * as transactionService from '../services/transaction.service.js';

export const getTopUsers = async (req, res, next) => {
    try {
        const { startDate, endDate, limit = 10 } = req.query;
        
        const users = await transactionService.findTopUsers(
            startDate,
            endDate,
            parseInt(limit)
        );
        
        res.json({
            status: 'success',
            data: users,
            meta: {
                startDate,
                endDate
            }
        });
    } catch (error) {
        logger.error('Error in getTopUsers:', error);
        next(new AppError(500, 'Failed to fetch top users'));
    }
};

export const getStatistics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        
        const stats = await transactionService.getTransactionStatistics(
            startDate,
            endDate
        );
        
        res.json({
            status: 'success',
            data: stats,
            meta: {
                startDate,
                endDate
            }
        });
    } catch (error) {
        logger.error('Error in getStatistics:', error);
        next(new AppError(500, 'Failed to fetch transaction statistics'));
    }
}; 