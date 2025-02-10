import pkg from 'glob';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

const { glob } = pkg;  // 解構 glob
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加載所有 Swagger 文件
const loadSwaggerDocs = () => {
    const baseDoc = load(readFileSync(join(__dirname, '../../docs/swagger/index.yaml'), 'utf8'));
    const paths = {};
    const components = { schemas: {}, responses: {} };

    // 加載所有路徑定義
    const pathFiles = glob.sync(join(__dirname, '../../docs/swagger/paths/*.yaml'));
    pathFiles.forEach(file => {
        const doc = load(readFileSync(file, 'utf8'));
        Object.assign(paths, doc);
    });


    return {
        ...baseDoc,
        paths
    };
};

// 配置 Swagger
export const setupSwagger = (app) => {
    const swaggerDocument = loadSwaggerDocs();
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}; 