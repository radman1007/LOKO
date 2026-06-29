const createApp = require('./app');
const config = require('./config');
const { createPool, closePool } = require('./database/connection');
const { connectRedis, closeRedis } = require('./database/redis');
const logger = require('./utils/logger');

async function start() {
  try {
    await createPool();
    await connectRedis();

    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`Loko API server running on port ${config.port}`, {
        env: config.env,
        version: config.apiVersion,
      });
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully`);
      server.close(async () => {
        await closePool();
        await closeRedis();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();
