const mysql = require('mysql2/promise');

// =========================================================================
// REPLACE THESE 5 VALUES WITH YOUR RAILWAY MYSQL VARIABLES
// =========================================================================
const DB_HOST = 'mysql.railway.internal'; // E.g. viaduct.proxy.rlwy.net
const DB_USER = 'root';
const DB_PASSWORD = 'xlizYBumxbufmWmGsuXFOpWWkSoKGkaU';
const DB_NAME = 'railway';
const DB_PORT = 3306;
// =========================================================================

(async () => {
  try {
    console.log('Connecting to Railway MySQL...');
    const c = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      ssl: { rejectUnauthorized: false }
    });

    console.log('Connected! Creating tables...');
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (id varchar(36) NOT NULL, name varchar(100) NOT NULL, email varchar(255) NOT NULL, password_hash varchar(255) NOT NULL, role varchar(20) DEFAULT 'user', created_at datetime DEFAULT CURRENT_TIMESTAMP, updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (id), UNIQUE KEY email (email))`,
      `CREATE TABLE IF NOT EXISTS products (id varchar(36) NOT NULL, name varchar(200) NOT NULL, barcode varchar(100) NOT NULL, price decimal(10,2) NOT NULL, category varchar(100) DEFAULT NULL, image_url varchar(500) DEFAULT NULL, stock_quantity int DEFAULT 0, created_at datetime DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), UNIQUE KEY barcode (barcode))`,
      `CREATE TABLE IF NOT EXISTS sessions (id varchar(36) NOT NULL, user_id varchar(36) NOT NULL, status varchar(20) DEFAULT 'active', started_at datetime DEFAULT CURRENT_TIMESTAMP, completed_at datetime DEFAULT NULL, exit_verified tinyint(1) DEFAULT 0, qr_token varchar(255) DEFAULT NULL, total_amount decimal(10,2) DEFAULT 0.00, PRIMARY KEY (id), CONSTRAINT sessions_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE)`,
      `CREATE TABLE IF NOT EXISTS cart_items (id varchar(36) NOT NULL, session_id varchar(36) NOT NULL, product_id varchar(36) NOT NULL, quantity int DEFAULT 1, price_at_scan decimal(10,2) NOT NULL, scanned_at datetime DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), UNIQUE KEY idx_cart_items_session_product (session_id,product_id), CONSTRAINT cart_items_ibfk_1 FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE, CONSTRAINT cart_items_ibfk_2 FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE)`,
      `CREATE TABLE IF NOT EXISTS payments (id varchar(36) NOT NULL, session_id varchar(36) NOT NULL, user_id varchar(36) NOT NULL, amount decimal(10,2) NOT NULL, method varchar(50) DEFAULT 'simulate', status varchar(20) DEFAULT 'pending', transaction_id varchar(255) DEFAULT NULL, paid_at datetime DEFAULT NULL, created_at datetime DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), CONSTRAINT payments_ibfk_1 FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE, CONSTRAINT payments_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE)`,
      `CREATE TABLE IF NOT EXISTS fraud_logs (id varchar(36) NOT NULL, session_id varchar(36) NOT NULL, user_id varchar(36) NOT NULL, risk_score decimal(5,2) DEFAULT 0.00, flags json DEFAULT NULL, details text, created_at datetime DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), CONSTRAINT fraud_logs_ibfk_1 FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE, CONSTRAINT fraud_logs_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE)`,
      `CREATE TABLE IF NOT EXISTS audit_logs (id varchar(36) NOT NULL, user_id varchar(36) DEFAULT NULL, action varchar(100) NOT NULL, resource varchar(100) DEFAULT NULL, resource_id varchar(255) DEFAULT NULL, ip_address varchar(45) DEFAULT NULL, details json DEFAULT NULL, created_at datetime DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), CONSTRAINT audit_logs_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL)`
    ];

    for (let t of tables) await c.query(t);

    console.log('Inserting products...');
    const products = [
      `INSERT IGNORE INTO products (id, name, barcode, price, category, image_url, stock_quantity) VALUES ("prod-1", "Whole Wheat Bread", "8901234567890", 45.00, "Bakery", NULL, 150)`,
      `INSERT IGNORE INTO products (id, name, barcode, price, category, image_url, stock_quantity) VALUES ("prod-2", "Toned Milk 1L", "8901234567891", 55.00, "Dairy", NULL, 200)`,
      `INSERT IGNORE INTO products (id, name, barcode, price, category, image_url, stock_quantity) VALUES ("prod-3", "Basmati Rice 1kg", "8901234567892", 120.00, "Grains", NULL, 300)`,
      `INSERT IGNORE INTO products (id, name, barcode, price, category, image_url, stock_quantity) VALUES ("prod-4", "Olive Oil 500ml", "8901234567893", 350.00, "Cooking", NULL, 80)`,
      `INSERT IGNORE INTO products (id, name, barcode, price, category, image_url, stock_quantity) VALUES ("prod-5", "Dark Chocolate Bar", "8901234567894", 90.00, "Snacks", NULL, 250)`
    ];

    for (let p of products) await c.query(p);

    const [rows] = await c.query('SELECT COUNT(*) as c FROM products');
    console.log('✅ Success! Database is fully set up. Products found: ' + rows[0].c);

    await c.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
