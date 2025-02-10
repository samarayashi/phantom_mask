import { DataTypes } from 'sequelize';
import { getDB } from '../tools/db.js';
import getPharmacyModel from './Pharmacy.js';
import getMaskModel from './Mask.js';

const definePharmacyInventory = (sequelize) => {
    const PharmacyInventory = sequelize.define('PharmacyInventory', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '庫存ID'
        },
        pharmacy_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: '藥局ID'
        },
        mask_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: '口罩ID'
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '售價'
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '庫存數量'
        }
    }, {
        tableName: 'PharmacyInventory',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                name: 'uq_pharmacy_mask',
                fields: ['pharmacy_id', 'mask_id']
            },
            {
                name: 'idx_price',
                fields: ['price']
            }
        ]
    });

    const Pharmacy = getPharmacyModel();
    const Mask = getMaskModel();

    PharmacyInventory.belongsTo(Pharmacy, {
        foreignKey: 'pharmacy_id',
        onDelete: 'CASCADE'
    });

    PharmacyInventory.belongsTo(Mask, {
        foreignKey: 'mask_id',
        onDelete: 'CASCADE'
    });

    return PharmacyInventory;
};

let PharmacyInventoryModel = null;

const getPharmacyInventoryModel = () => {
    if (!PharmacyInventoryModel) {
        PharmacyInventoryModel = definePharmacyInventory(getDB());
    }
    return PharmacyInventoryModel;
};

export default getPharmacyInventoryModel; 