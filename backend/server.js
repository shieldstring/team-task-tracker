require('dotenv').config();
const app = require('./app');
const { initDb } = require('./db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await initDb();
    console.log('✅  Database initialised');
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();