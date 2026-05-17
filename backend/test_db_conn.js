const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_checkout',
    port: parseInt(process.env.DB_PORT) || 3306,
  };

  console.log('Connecting with:', { ...poolConfig, password: '***' });

  try {
    const connection = await mysql.createConnection(poolConfig);
    console.log('Connected successfully!');
    const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
    console.log('Query result:', rows[0].solution);
    await connection.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
    console.error('Error code:', err.code);
  }
}

test();
