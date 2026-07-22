const fs = require('fs');
const path = require('path');
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
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'user123',
    database: process.env.DB_NAME || 'smart_checkout',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false },
  };
}

console.log(`[DB] Connecting to ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`);

const pool = mysql.createPool(poolConfig);

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
  if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
    process.exit(-1);
  }
});

function isIgnorableSchemaError(error) {
  return [
    'ER_DUP_KEYNAME',
    'ER_DUP_KEY',
    'ER_DUP_FIELDNAME',
    'ER_TABLE_EXISTS_ERROR',
    'ER_DB_CREATE_EXISTS',
  ].includes(error.code);
}

async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    const statements = schemaSql
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean)
      .filter((statement) => !statement.startsWith('--'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (error) {
        if (isIgnorableSchemaError(error)) {
          continue;
        }
        throw error;
      }
    }

    console.log('[DB] Database schema initialized successfully.');
  } catch (error) {
    console.error('[DB] Failed to initialize database schema:', error.message);
    throw error;
  }
}

module.exports = {
  query: async (text, params) => {
    const [rows, fields] = await pool.query(text, params);
    return { rows, fields };
  },
  getConnection: () => pool.getConnection(),
  pool,
  initializeDatabase,
};

