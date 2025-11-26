const knex = require('knex');

const rootKnex = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_ROOT_USER,
        password: process.env.DB_ROOT_PASSWORD,
        database: process.env.DB_NAME,
    },
});

async function setupDatabase() {
    try {
        const apiUser = 'my_api_user';
        const apiPassword = process.env.API_DB_PASSWORD;

        console.log(`Checking for user ${apiUser}...`);

        // Check if user exists
        const userExists = await rootKnex.raw('SELECT 1 FROM pg_user WHERE usename = ?', [apiUser]);

        if (userExists.rowCount === 0) {
            // Create user and grant connection privileges
            console.log(`Creating user ${apiUser}...`);
            // Postgres does not accept parameter placeholders for PASSWORD in CREATE USER; embed safely-escaped literal
            const escapedPassword = apiPassword.replace(/'/g, "''");
            await rootKnex.raw(`CREATE USER ?? WITH PASSWORD '${escapedPassword}'`, [apiUser]);
            await rootKnex.raw('GRANT CONNECT ON DATABASE ?? TO ??', [process.env.DB_NAME, apiUser]);

            // Grant schema-level permissions on tables
            await rootKnex.raw('GRANT USAGE ON SCHEMA public TO ??', [apiUser]);
            await rootKnex.raw('GRANT CREATE ON SCHEMA public TO ??', [apiUser]);
            await rootKnex.raw('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ??', [apiUser]);
            await rootKnex.raw('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ??', [apiUser]);

            // For future tables created by migrations
            await rootKnex.raw('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ??', [apiUser]);
            await rootKnex.raw('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ??', [apiUser]);
        } else {
            console.log(`User ${apiUser} already exists.`);
        }

    } catch (error) {
        console.error('DB setup failed:', error);
        process.exit(1); // Exit with error if setup fails
    } finally {
        await rootKnex.destroy();
    }
}

setupDatabase();