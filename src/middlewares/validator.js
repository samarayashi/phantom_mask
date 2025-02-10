import { validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation error', { errors: errors.array() });
        return res.status(400).json({
            status: 'error',
            errors: errors.array()
        });
    }
    next();
}; 