const { Pool } = require('pg');
 
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  // Fallback for local development if DATABASE_URL is not set
  ...(connectionString ? {} : {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'task_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  })
});
 
pool.on('error', (err) => {
  console.error('Unexpected error on idle DB client', err);
  process.exit(-1);
});
 
const query = (text, params) => pool.query(text, params);
 
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id        SERIAL PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        status      VARCHAR(20) NOT NULL DEFAULT 'todo'
                      CHECK (status IN ('todo', 'in-progress', 'done')),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error('❌ Database Initialization Failed:');
    console.error(`Message: ${err.message}`);
    console.error(`Detail: ${err.detail || 'No additional detail'}`);
    console.error(`Hint: ${err.hint || 'Check if your database is running and credentials are correct.'}`);
    throw err; // Re-throw to be handled by server.js
  }
};
 
module.exports = { query, pool, initDb };
 