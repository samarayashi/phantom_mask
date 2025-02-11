import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dbConfig from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
    const sequelize = new Sequelize(dbConfig);
    
    try {
        console.log('開始執行數據庫遷移...');
        
        // 讀取遷移腳本
        const sqlScript = await fs.readFile(
            path.join(__dirname, 'postgresql-schema.sql'),
            'utf-8'
        );

        // 分割SQL語句
        const statements = sqlScript
            .split(';')
            .filter(statement => statement.trim());

        // 逐條執行SQL語句
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await sequelize.query(statement + ';');
                } catch (error) {
                    console.error('執行SQL語句時發生錯誤:', error);
                    console.error('問題SQL語句:', statement);
                    throw error;
                }
            }
        }
        
        console.log('數據庫遷移完成');
    } catch (error) {
        console.error('遷移失敗:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// 如果直接運行此文件則執行遷移
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runMigrations()
        .then(() => {
            console.log('遷移成功完成');
            process.exit(0);
        })
        .catch((error) => {
            console.error('遷移失敗:', error);
            process.exit(1);
        });
}

export default runMigrations; 