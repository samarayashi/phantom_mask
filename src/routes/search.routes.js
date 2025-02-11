import { Router } from 'express';
import { validate } from '../middlewares/validator.js';
import * as searchController from '../controllers/search.controller.js';
import * as searchValidator from '../validators/search.validator.js';

const router = Router();

// v1 路由
router.get('/v1',
    searchValidator.validateSearch,
    validate,
    searchController.searchV1
);

// v2 路由
router.get('/v2',
    searchValidator.validateSearch,
    validate,
    searchController.searchV2
);

// 默認路由 (使用最新版本)
router.get('/',
    searchValidator.validateSearch,
    validate,
    searchController.searchV2
);

export default router; 