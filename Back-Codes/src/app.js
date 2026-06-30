const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const config = require('./config');
const requestId = require('./middleware/requestId');
const accessLogger = require('./middleware/accessLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const v1Routes = require('./routes/v1');

function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const allowedOrigins = config.security.corsOrigin;
  app.use(cors({
    origin(origin, callback) {
      // درخواست‌های same-origin / ابزارهای سرور (بدون origin) مجاز
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestId);
  app.use(accessLogger);

  // Rate limiting فقط در production فعال است
  if (config.env === 'production') {
    app.use(globalLimiter());
  }

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: config.apiVersion });
  });

  app.use('/uploads', express.static(path.resolve(config.upload.dir)));

  app.use(`/api/${config.apiVersion}`, v1Routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;