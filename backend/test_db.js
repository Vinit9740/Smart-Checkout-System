const db = require('./src/config/db');
const fs = require('fs');

async function test() {
  try {
    const { rows } = await db.query('DESCRIBE payments');
    fs.writeFileSync('test_db_output.json', JSON.stringify(rows, null, 2));
  } catch(e) {
    fs.writeFileSync('test_db_output.json', JSON.stringify(e, null, 2));
  } finally {
    process.exit();
  }
}
test();
