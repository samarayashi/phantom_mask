import { AppError } from '../middlewares/errorHandler.js';
import * as pharmacyService from '../services/pharmacy.service.js';
import { logger } from '../utils/logger.js';

export const getOpenPharmacies = async (req, res, next) => {
    try {
        const { time, dayOfWeek } = req.query;
        const pharmacies = await pharmacyService.findOpenPharmacies(time, parseInt(dayOfWeek));
        
        res.json({
            status: 'success',
            data: pharmacies,
            meta: {
                total: pharmacies.length
            }
        });
    } catch (error) {
        logger.error('Error in getOpenPharmacies:', error);
        next(new AppError(500, 'Failed to fetch open pharmacies'));
    }
};

export const searchPharmacies = async (req, res, next) => {
    try {
        const { keyword, limit = 10, offset = 0 } = req.query;
        const { pharmacies, total } = await pharmacyService.searchPharmacies(
            keyword,
            parseInt(limit),
            parseInt(offset)
        );
        
        res.json({
            status: 'success',
            data: pharmacies,
            meta: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        logger.error('Error in searchPharmacies:', error);
        next(new AppError(500, 'Failed to search pharmacies'));
    }
};

export const getPharmacyMasks = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { sortBy = 'name', order = 'asc' } = req.query;
        
        const masks = await pharmacyService.findPharmacyMasks(
            parseInt(id),
            sortBy,
            order
        );
        
        res.json({
            status: 'success',
            data: masks,
            meta: {
                total: masks.length
            }
        });
    } catch (error) {
        if (error.statusCode === 404) {
            next(error);
        } else {
            logger.error('Error in getPharmacyMasks:', error);
            next(new AppError(500, 'Failed to fetch pharmacy masks'));
        }
    }
};

export const filterPharmacies = async (req, res, next) => {
    try {
        const { minPrice, maxPrice, maskCount, comparison } = req.query;
        
        const pharmacies = await pharmacyService.filterPharmaciesByMaskCriteria(
            parseFloat(minPrice),
            parseFloat(maxPrice),
            parseInt(maskCount),
            comparison
        );
        
        res.json({
            status: 'success',
            data: pharmacies,
            meta: {
                total: pharmacies.length
            }
        });
    } catch (error) {
        logger.error('Error in filterPharmacies:', error);
        next(new AppError(500, 'Failed to filter pharmacies'));
    }
}; 