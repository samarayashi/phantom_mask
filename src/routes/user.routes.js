import { Router } from 'express';
import { validate } from '../middlewares/validator.js';
import * as userController from '../controllers/user.controller.js';
import * as userValidator from '../validators/user.validator.js';

const router = Router();

router.get('/search',
    userValidator.validateUserSearch,
    validate,
    userController.searchUsers
);

router.get('/id/:id',
    userValidator.validateUserId,
    validate,
    userController.getUserById
);

router.get('/name/:name',
    userValidator.validateUserName,
    validate,
    userController.getUserByName
);

export default router; 