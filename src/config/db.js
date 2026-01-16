const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true',
});

(async () => {
    console.log('🔌 Connecting to PostgreSQL...');
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL client connected!');
        client.release();
    } catch (err) {
        console.error('❌ PostgreSQL connection failed ' + err.message);
    }
})();

module.exports = {
    pool
};
