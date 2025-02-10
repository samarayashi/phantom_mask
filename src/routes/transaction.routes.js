import { Router } from 'express';
import { validate } from '../middlewares/validator.js';
import * as transactionController from '../controllers/transaction.controller.js';
import * as transactionValidator from '../validators/transaction.validator.js';

const router = Router();

router.get('/top-users',
    transactionValidator.validateDateRange,
    validate,
    transactionController.getTopUsers
);

router.get('/statistics',
    transactionValidator.validateDateRange,
    validate,
    transactionController.getStatistics
);

export default router; 