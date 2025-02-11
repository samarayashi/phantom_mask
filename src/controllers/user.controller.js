import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.js';
import * as userService from '../services/user.service.js';

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.findUserById(parseInt(id));
        
        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        logger.error('Error in getUserById:', error);
        if (error.name === 'NotFoundError') {
            return next(new AppError(404, 'User not found'));
        }
        next(new AppError(500, 'Failed to fetch user'));
    }
};

export const getUserByName = async (req, res, next) => {
    try {
        const { name } = req.params;
        const user = await userService.findUserByName(name);
        
        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        logger.error('Error in getUserByName:', error);
        if (error.name === 'NotFoundError') {
            return next(new AppError(404, 'User not found'));
        }
        next(new AppError(500, 'Failed to fetch user'));
    }
};

export const searchUsers = async (req, res, next) => {
    try {
        const { keyword, limit = 10, offset = 0 } = req.query;
        const { users, total } = await userService.searchUsers(
            keyword,
            parseInt(limit),
            parseInt(offset)
        );
        
        res.json({
            status: 'success',
            data: users,
            meta: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        logger.error('Error in searchUsers:', error);
        next(new AppError(500, 'Failed to search users'));
    }
}; 