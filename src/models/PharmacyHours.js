import { DataTypes } from 'sequelize';
import { getDB } from '../utils/db.js';

const definePharmacyHours = (sequelize) => {
    const PharmacyHours = sequelize.define('PharmacyHours', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '營業時段ID'
        },
        pharmacy_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            comment: '藥局ID'
        },
        day_of_week: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            comment: '星期幾(1=週一, ... 7=週日)'
        },
        open_time: {
            type: DataTypes.TIME,
            allowNull: false,
            comment: '開始營業時間'
        },
        close_time: {
            type: DataTypes.TIME,
            allowNull: false,
            comment: '結束營業時間'
        },
        is_open: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: '是否營業(FALSE=休息)'
        }
    }, {
        tableName: 'pharmacy_hours',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return PharmacyHours;
};

let PharmacyHoursModel = null;

const getPharmacyHoursModel = () => {
    if (!PharmacyHoursModel) {
        PharmacyHoursModel = definePharmacyHours(getDB());
    }
    return PharmacyHoursModel;
};

export default getPharmacyHoursModel; 