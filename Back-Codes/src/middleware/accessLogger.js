const logger = require('../utils/logger');
const { query } = require('../database/connection');

function accessLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      ip: req.ip,
    });

    if (!req.originalUrl.startsWith('/health')) {
      query(
        `INSERT INTO access_logs (user_id, method, path, status_code, duration_ms, ip_address, user_agent, request_id)
         VALUES (:userId, :method, :path, :status, :duration, :ip, :ua, :requestId)`,
        {
          userId: req.user?.id || null,
          method: req.method,
          path: req.originalUrl.substring(0, 500),
          status: res.statusCode,
          duration,
          ip: req.ip,
          ua: req.headers['user-agent']?.substring(0, 500),
          requestId: req.requestId,
        }
      ).catch((err) => logger.error('Access log write failed', { error: err.message }));
    }
  });

  next();
}

module.exports = accessLogger;
