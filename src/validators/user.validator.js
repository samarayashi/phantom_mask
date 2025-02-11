import { param, query } from 'express-validator';

export const validateUserId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid user ID')
];

export const validateUserName = [
    param('name')
        .trim()
        .notEmpty()
        .withMessage('User name is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('User name must be between 2 and 255 characters')
];

export const validateUserSearch = [
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