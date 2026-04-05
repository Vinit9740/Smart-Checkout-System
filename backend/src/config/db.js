const mysql = require('mysql2/promise');
const config = require('./index');

// Railway provides EITHER individual vars OR a DATABASE_URL connection string.
// We support both.
let poolConfig;

if (process.env.DATABASE_URL) {
  // Railway MySQL connection string format:
  // mysql://user:password@host:port/database
  const url = new URL(process.env.DATABASE_URL);
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
  poolConfig = {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Enable SSL for Railway/cloud environments
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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

