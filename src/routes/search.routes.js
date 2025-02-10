import { Router } from 'express';
import { validate } from '../middlewares/validator.js';
import * as searchController from '../controllers/search.controller.js';
import * as searchValidator from '../validators/search.validator.js';

const router = Router();

router.get('/',
    searchValidator.validateSearch,
    validate,
    searchController.search
);

export default router; 