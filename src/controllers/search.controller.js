import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.js';
import * as searchService from '../services/search.service.js';

export const search = async (req, res, next) => {
    try {
        const { type, keyword, limit = 10, offset = 0 } = req.query;
        
        const { results, total } = await searchService.search(
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
        logger.error('Error in search:', error);
        next(new AppError(500, 'Failed to perform search'));
    }
}; 