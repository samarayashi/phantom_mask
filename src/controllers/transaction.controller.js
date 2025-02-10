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

export const purchase = async (req, res, next) => {
    try {
        const { userId, pharmacyInventoryId, quantity } = req.body;
        
        const result = await transactionService.processPurchase(
            userId,
            pharmacyInventoryId,
            quantity
        );
        
        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        logger.error('Error in purchase controller:', error);
        
        if (error.name === 'InsufficientFundsError') {
            return next(new AppError(400, 'Insufficient funds'));
        }
        if (error.name === 'InsufficientStockError') {
            return next(new AppError(400, 'Insufficient stock'));
        }
        
        next(new AppError(500, 'Failed to process purchase'));
    }
}; 