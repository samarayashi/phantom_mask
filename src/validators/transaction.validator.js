import { query } from 'express-validator';

export const validateDateRange = [
    query('startDate')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Start date must be in YYYY-MM-DD format')
        .custom((value, { req }) => {
            const startDate = new Date(value);
            const endDate = new Date(req.query.endDate);
            if (startDate > endDate) {
                throw new Error('Start date must be before or equal to end date');
            }
            return true;
        }),
    query('endDate')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('End date must be in YYYY-MM-DD format'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
]; 