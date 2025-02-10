import { query, param } from 'express-validator';

export const validateOpenPharmacyQuery = [
    query('time')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Time must be in HH:mm format'),
    query('dayOfWeek')
        .isInt({ min: 1, max: 7 })
        .withMessage('Day of week must be between 1 and 7')
];

export const validateSearchPharmacyQuery = [
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

export const validateGetPharmacyMasks = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid pharmacy ID'),
    query('sortBy')
        .optional()
        .isIn(['name', 'price'])
        .withMessage('Sort field must be either name or price'),
    query('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Order must be either asc or desc')
];

export const validateFilterPharmacies = [
    query('minPrice')
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a positive number'),
    query('maxPrice')
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a positive number')
        .custom((value, { req }) => {
            if (parseFloat(value) <= parseFloat(req.query.minPrice)) {
                throw new Error('Maximum price must be greater than minimum price');
            }
            return true;
        }),
    query('maskCount')
        .isInt({ min: 0 })
        .withMessage('Mask count must be a non-negative integer'),
    query('comparison')
        .isIn(['more', 'less'])
        .withMessage('Comparison must be either more or less')
]; 