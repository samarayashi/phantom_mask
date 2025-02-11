import express from 'express';
import { getDB } from '../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const sequelize = getDB();
        await sequelize.authenticate();
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

export default router; 