const mysql = require('mysql2/promise');
const config = require('../config');
const logger = require('../utils/logger');

let pool = null;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createPool() {
  if (pool) return pool;

  const maxRetries = 20;

  for (let i = 0; i < maxRetries; i++) {
    try {
      pool = mysql.createPool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,

        waitForConnections: true,
        connectionLimit: config.db.connectionLimit || 10,
        queueLimit: config.db.queueLimit || 0,

        enableKeepAlive: true,
        keepAliveInitialDelay: 0,

        timezone: config.db.timezone || '+00:00',
        charset: config.db.charset || 'utf8mb4',
        namedPlaceholders: true,
      });

      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();

      logger.info('MySQL connection pool established');
      return pool;

    } catch (err) {
      logger.warn(`MySQL not ready yet (${i + 1}/${maxRetries})`);

      if (pool) {
        try { await pool.end(); } catch (_) {}
        pool = null;
      }

      await sleep(2000);
    }
  }

  logger.error('MySQL connection failed permanently');
  throw new Error('MySQL connection failed after retries');
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createPool() first.');
  }
  return pool;
}

async function query(sql, params = {}) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

async function queryOne(sql, params = {}) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function withTransaction(callback) {
  const connection = await getPool().getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('MySQL connection pool closed');
  }
}

module.exports = {
  createPool,
  getPool,
  query,
  queryOne,
  withTransaction,
  closePool,
};