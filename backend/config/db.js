// config/db.js - MySQL Database Connection using mysql2 connection pool

const mysql = require('mysql2/promise');

// Create a connection pool for better performance and reliability
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3321,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Arun2000@',
  database: process.env.DB_NAME || 'ecommerce',
  waitForConnections: true,
  connectionLimit: 10,       // max 10 simultaneous connections
  queueLimit: 0,
  charset: 'utf8mb4',
});

// Test the connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1); // Exit if DB cannot connect
  }
};

module.exports = { pool, testConnection };
