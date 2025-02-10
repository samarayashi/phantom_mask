import { DataTypes } from 'sequelize';
import { getDB } from '../lib/db.js';
import getUserModel from './User.js';
import getPharmacyModel from './Pharmacy.js';
import getPharmacyInventoryModel from './PharmacyInventory.js';

const definePurchaseRecord = (sequelize) => {
    const PurchaseRecord = sequelize.define('PurchaseRecord', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '交易ID'
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: '用戶ID'
        },
        pharmacy_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: '藥局ID'
        },
        pharmacy_inventory_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: '庫存ID'
        },
        transaction_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '交易金額'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '購買數量'
        },
        transaction_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: '交易日期'
        },
        status: {
            type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
            allowNull: false,
            defaultValue: 'success',
            comment: '交易狀態'
        }
    }, {
        tableName: 'PurchaseRecords',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'idx_transaction_date',
                fields: ['transaction_date']
            },
            {
                name: 'idx_user_amount',
                fields: ['user_id', 'transaction_amount']
            }
        ]
    });

    const User = getUserModel();
    const Pharmacy = getPharmacyModel();
    const PharmacyInventory = getPharmacyInventoryModel();

    PurchaseRecord.belongsTo(User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
    });

    PurchaseRecord.belongsTo(Pharmacy, {
        foreignKey: 'pharmacy_id',
        onDelete: 'CASCADE'
    });

    PurchaseRecord.belongsTo(PharmacyInventory, {
        foreignKey: 'pharmacy_inventory_id',
        onDelete: 'CASCADE'
    });

    return PurchaseRecord;
};

let PurchaseRecordModel = null;

const getPurchaseRecordModel = () => {
    if (!PurchaseRecordModel) {
        PurchaseRecordModel = definePurchaseRecord(getDB());
    }
    return PurchaseRecordModel;
};

export default getPurchaseRecordModel; 