import pkg from 'pg';
import { dbConfig } from '../constants.js';
const { Pool } = pkg;

const pool = new Pool({
  ...dbConfig,
    ssl: {
    rejectUnauthorized: false, // required for Neon
  },
  max: 10,           // similar to connectionLimit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const db = {
  // Basic query
  async query(sql, args) {
    try {
      const { rows } = await pool.query(sql, args);
      return rows;
    } catch (err) {
      console.error('❌ DB Query Error:', err);
      throw err;
    }
  },

  // Begin transaction
  async begin() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      return client;
    } catch (err) {
      client.release();
      throw err;
    }
  },

  // Commit transaction
  async commit(client) {
    try {
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK'); // rollback on commit error
      throw err;
    } finally {
      client.release();
    }
  },

  // Rollback transaction
  async rollback(client) {
    try {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  },

  // Close pool
  async close() {
    console.log("🔌 Closing DB pool");
    await pool.end();
  },
};

export const connectDB = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ DB connected');
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    throw err;
  }
};

export default db;