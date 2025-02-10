import { DataTypes } from 'sequelize';
import { getDB } from '../tools/db.js';

const definePharmacy = (sequelize) => {
    const Pharmacy = sequelize.define('Pharmacy', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '藥局ID'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            comment: '藥局名稱'
        },
        cash_balance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '現金餘額'
        }
    }, {
        tableName: 'Pharmacies',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Pharmacy;
};

let PharmacyModel = null;

const getPharmacyModel = () => {
    if (!PharmacyModel) {
        PharmacyModel = definePharmacy(getDB());
    }
    return PharmacyModel;
};

export default getPharmacyModel; 