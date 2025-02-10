import { query } from 'express-validator';

export const validateSearch = [
    query('type')
        .isIn(['pharmacy', 'mask'])
        .withMessage('Search type must be either pharmacy or mask'),
    query('keyword')
        .trim()
        .notEmpty()
        .withMessage('Search keyword is required')
        .isLength({ min: 2 })
        .withMessage('Search keyword must be at least 2 characters long'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative integer')
]; 