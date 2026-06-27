const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function applySchema() {
  const sql = fs.readFileSync(
    path.join(__dirname, '..', '..', 'db', 'schema.sql'),
    'utf8'
  );
  await pool.query(sql);
}

if (require.main === module) {
  applySchema()
    .then(() => { console.log('[migrate] schema applied'); return pool.end(); })
    .then(() => process.exit(0))
    .catch((e) => { console.error('[migrate] failed', e); process.exit(1); });
}

module.exports = { applySchema };
