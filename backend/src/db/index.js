const { Pool } = require('pg');
 
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'task_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});
 
pool.on('error', (err) => {
  console.error('Unexpected error on idle DB client', err);
  process.exit(-1);
});
 
const query = (text, params) => pool.query(text, params);
 
const initDb = async () => {
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
};
 
module.exports = { query, pool, initDb };
 