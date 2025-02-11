import { DataTypes } from 'sequelize';
import { getDB } from '../utils/db.js';

const defineMask = (sequelize) => {
    const Mask = sequelize.define('Mask', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '口罩ID'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            comment: '口罩名稱'
        },
        brand: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '品牌名稱'
        },
        color: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '口罩顏色'
        },
        pieces_per_pack: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: '每包數量'
        }
    }, {
        tableName: 'masks',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Mask;
};

let MaskModel = null;

const getMaskModel = () => {
    if (!MaskModel) {
        MaskModel = defineMask(getDB());
    }
    return MaskModel;
};

export default getMaskModel; 