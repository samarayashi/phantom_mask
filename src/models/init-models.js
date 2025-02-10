import getPharmacyModel from './Pharmacy.js';
import getPharmacyHoursModel from './PharmacyHours.js';
import getMaskModel from './Mask.js';
import getPharmacyInventoryModel from './PharmacyInventory.js';
import getUserModel from './User.js';
import getPurchaseRecordModel from './PurchaseRecord.js';
import { logger } from '../utils/logger.js';

export const initializeAssociations = () => {
    try {
        const Pharmacy = getPharmacyModel();
        const PharmacyHours = getPharmacyHoursModel();
        const Mask = getMaskModel();
        const PharmacyInventory = getPharmacyInventoryModel();
        const User = getUserModel();
        const PurchaseRecord = getPurchaseRecordModel();

        // Pharmacy 關聯
        Pharmacy.hasMany(PharmacyHours, {
            foreignKey: 'pharmacy_id',
            as: 'businessHours'
        });

        Pharmacy.hasMany(PharmacyInventory, {
            foreignKey: 'pharmacy_id',
            as: 'inventory'
        });

        Pharmacy.hasMany(PurchaseRecord, {
            foreignKey: 'pharmacy_id',
            as: 'transactions'
        });

        // Mask 關聯
        Mask.hasMany(PharmacyInventory, {
            foreignKey: 'mask_id',
            as: 'inventories'
        });

        // User 關聯
        User.hasMany(PurchaseRecord, {
            foreignKey: 'user_id',
            as: 'purchases'
        });

        // PharmacyHours 關聯
        PharmacyHours.belongsTo(Pharmacy, {
            foreignKey: 'pharmacy_id'
        });

        // PharmacyInventory 關聯
        PharmacyInventory.belongsTo(Pharmacy, {
            foreignKey: 'pharmacy_id'
        });

        PharmacyInventory.belongsTo(Mask, {
            foreignKey: 'mask_id'
        });

        PharmacyInventory.hasMany(PurchaseRecord, {
            foreignKey: 'pharmacy_inventory_id',
            as: 'purchaseRecords'
        });

        // PurchaseRecord 關聯
        PurchaseRecord.belongsTo(User, {
            foreignKey: 'user_id'
        });

        PurchaseRecord.belongsTo(Pharmacy, {
            foreignKey: 'pharmacy_id'
        });

        PurchaseRecord.belongsTo(PharmacyInventory, {
            foreignKey: 'pharmacy_inventory_id'
        });

        logger.info('Model associations initialized successfully');
    } catch (error) {
        logger.error('Error initializing model associations:', error);
        throw error;
    }
}; 