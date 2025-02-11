import dotenv from 'dotenv';

dotenv.config();

const config = {
    development: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        database: process.env.MYSQL_DATABASE || 'mask_system',
        username: process.env.MYSQL_USER || 'mask_user',
        password: process.env.MYSQL_PASSWORD || 'your_user_password',
        dialect: 'mysql',
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    production: {
        url: process.env.DATABASE_URL,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            keepAlive: true
        },
        pool: {
            max: 3,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: console.log,
        retry: {
            max: 3
        }
    }
};

export default config[process.env.NODE_ENV || 'development']; 