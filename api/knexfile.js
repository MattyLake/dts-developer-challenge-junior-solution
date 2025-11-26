// For local development, load environment variables from a .env file
require('dotenv').config();

module.exports = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: 'my_api_user',
        password: process.env.API_DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: './migrations',
    },
    pool: {
        min: 2,
        max: 10,
    },
};
