import dotenv from 'dotenv';
import { runETL } from './etl/index.js';

// 載入環境變數
dotenv.config();

// 執行ETL流程
console.log('Starting ETL process...');

runETL()
    .then(() => {
        console.log('ETL process completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('ETL process failed:', error);
        process.exit(1);
    }); 