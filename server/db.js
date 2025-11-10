// This file handles connecting to our SQL Server database
// It's like the bridge between our Node.js server and the database

import sql from "mssql";
import dotenv from "dotenv";

// Load our database credentials from the .env file (keeps passwords secret!)
dotenv.config({ path: "./DB_config/.env" });

// Database connection settings - like the address and login info for our database
const dbConfig = {
  user: process.env.DB_USER,              // Username from .env file
  password: process.env.DB_PASSWORD,      // Password from .env file  
  server: process.env.DB_SERVER,          // Server name (usually localhost)
  database: process.env.DB_DATABASE,      // Our SmartRestaurant database
  options: {
    encrypt: false,                       // Don't encrypt (turn on for production)
    trustServerCertificate: true,         // Trust the server certificate
    enableArithAbort: true,               // Recommended setting for Node.js
  },
};

// This keeps our database connection alive so we don't have to reconnect every time
let pool;

// This function connects to the database - we only want to do this once
const connectDB = async () => {
  try {
    // Only connect if we haven't already connected
    if (!pool) {
      console.log('Connecting to SQL Server...');
      pool = await sql.connect(dbConfig);
      console.log('✅ Connected to database:', process.env.DB_DATABASE);
      console.log('🔗 Ready to run queries!');
    }
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Check your database is running and credentials are correct');
    throw error;
  }
};

// Close connection
const closeDB = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

// Get connection pool
const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return pool;
};

export { connectDB, closeDB, getPool, sql };