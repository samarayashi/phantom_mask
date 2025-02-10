import { Router } from 'express';
import { validate } from '../middlewares/validator.js';
import * as pharmacyController from '../controllers/pharmacy.controller.js';
import * as pharmacyValidator from '../validators/pharmacy.validator.js';

const router = Router();

router.get('/open', 
    pharmacyValidator.validateOpenPharmacyQuery,
    validate,
    pharmacyController.getOpenPharmacies
);

router.get('/search',
    pharmacyValidator.validateSearchPharmacyQuery,
    validate,
    pharmacyController.searchPharmacies
);

router.get('/:id/masks',
    pharmacyValidator.validateGetPharmacyMasks,
    validate,
    pharmacyController.getPharmacyMasks
);

router.get('/filter',
    pharmacyValidator.validateFilterPharmacies,
    validate,
    pharmacyController.filterPharmacies
);

export default router; 