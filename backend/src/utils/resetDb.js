const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const { applySchema } = require('./migrate');

async function resetAndSeed() {
  try {
    console.log('[resetDb] Dropping schema public...');
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    
    console.log('[resetDb] Applying new schema...');
    await applySchema();
    
    console.log('[resetDb] Schema applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[resetDb] Error:', error);
    process.exit(1);
  }
}

resetAndSeed();
