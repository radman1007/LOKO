const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const config = require('../config');

function createRateLimiter(options = {}) {
  const limiterOptions = {
    windowMs: options.windowMs || config.security.rateLimitWindowMs,
    max: options.max || config.security.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
    },
  };

  try {
    const { getRedis } = require('../database/redis');
    const redis = getRedis();
    if (redis && redis.status === 'ready') {
      limiterOptions.store = new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: 'rl:',
      });
    }
  } catch {
    // Redis not initialized — use default in-memory store
  }

  return rateLimit(limiterOptions);
}

const globalLimiter = () => createRateLimiter();
const authLimiter = () =>
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: config.security.authRateLimitMax,
  });

module.exports = { createRateLimiter, globalLimiter, authLimiter };
