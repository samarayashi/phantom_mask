import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.js';
import * as searchService from '../services/search.service.js';

// v1 控制器
export const searchV1 = async (req, res, next) => {
    try {
        const { type, keyword, limit = 10, offset = 0 } = req.query;
        
        const { results, total } = await searchService.searchV1(
            type,
            keyword,
            parseInt(limit),
            parseInt(offset)
        );
        
        res.json({
            status: 'success',
            data: results,
            meta: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        logger.error('Error in searchV1:', error);
        next(new AppError(500, 'Failed to perform search'));
    }
};

// v2 控制器
export const searchV2 = async (req, res, next) => {
    try {
        const { type, keyword, limit = 10, offset = 0 } = req.query;
        
        const { results, total } = await searchService.searchV2(
            type,
            keyword,
            parseInt(limit),
            parseInt(offset)
        );
        
        res.json({
            status: 'success',
            data: results,
            meta: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        logger.error('Error in searchV2:', error);
        next(new AppError(500, 'Failed to perform search'));
    }
}; 