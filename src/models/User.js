import { DataTypes } from 'sequelize';
import { getDB } from '../utils/db.js';

const defineUser = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '用戶ID'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            comment: '用戶名稱'
        },
        cash_balance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '現金餘額'
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return User;
};

let UserModel = null;

const getUserModel = () => {
    if (!UserModel) {
        UserModel = defineUser(getDB());
    }
    return UserModel;
};

export default getUserModel; 