const { Pool } = require('pg');
require('dotenv').config();

// Fix for Supabase IPv4 Connection Pooler (PgBouncer) SSL parsing bugs in pg driver
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const isTest = process.env.NODE_ENV === 'test';
const connectionString = isTest
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    `Missing ${isTest ? 'TEST_DATABASE_URL' : 'DATABASE_URL'} in environment`
  );
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {

  console.error('[db] unexpected idle client error', err);
});

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
