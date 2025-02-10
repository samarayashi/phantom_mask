import fs from 'fs-extra';
import { logger } from '../../utils/logger.js';

const readJsonFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error('Error reading JSON file', { 
            filePath, 
            error: error.message 
        });
        throw error;
    }
};

export { readJsonFile }; 