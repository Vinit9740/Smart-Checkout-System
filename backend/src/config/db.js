const mysql = require('mysql2/promise');
const config = require('./index');

// Railway provides EITHER individual vars OR a DATABASE_URL / MYSQL_URL connection string.
// We support both.
let poolConfig;
const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (connectionString) {
  // Railway MySQL connection string format:
  // mysql://user:password@host:port/database
  const url = new URL(connectionString);
  poolConfig = {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    port: parseInt(url.port, 10) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }, // Required for Railway MySQL
  };
} else {
  // Ultimate Fallback: The exact Railway credentials 
  poolConfig = {
    host: process.env.DB_HOST || 'mysql.railway.internal',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'xlizYBumxbufmWmGsuXFOpWWkSoKGkaU',
    database: process.env.DB_NAME || 'railway',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Enable SSL for Railway
    ssl: { rejectUnauthorized: false },
  };
}

console.log(`[DB] Connecting to ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`);

const pool = mysql.createPool(poolConfig);

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
  process.exit(-1);
});

module.exports = {
  query: async (text, params) => {
    const [rows, fields] = await pool.query(text, params);
    return { rows, fields };
  },
  getConnection: () => pool.getConnection(),
  pool,
};

