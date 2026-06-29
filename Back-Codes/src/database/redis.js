const Redis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

let redisClient = null;

function createRedisClient() {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    keyPrefix: config.redis.keyPrefix,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('error', (err) => logger.error('Redis error', { error: err.message }));

  return redisClient;
}

async function connectRedis() {
  const client = createRedisClient();
  if (client.status !== 'ready') {
    await client.connect();
  }
  return client;
}

function getRedis() {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

const RedisKeys = {
  refreshToken: (jti) => `refresh:${jti}`,
  refreshFamily: (familyId) => `refresh_family:${familyId}`,
  session: (userId) => `session:${userId}`,
  rateLimit: (ip) => `rl:${ip}`,
  moodPrompt: (userId) => `mood_prompt:${userId}`,
  dailyPodcast: (userId, date) => `daily_podcast:${userId}:${date}`,
  userPermissions: (userId) => `permissions:${userId}`,
  excelImport: (jobId) => `excel_import:${jobId}`,
};

module.exports = {
  createRedisClient,
  connectRedis,
  getRedis,
  closeRedis,
  RedisKeys,
};
