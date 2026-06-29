const { verifyAccessToken } = require('../services/token.service');
const { queryOne } = require('../database/connection');
const { UnauthorizedError } = require('../utils/errors');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = header.slice(7);
    const decoded = verifyAccessToken(token);

    const user = await queryOne(
      `SELECT u.id, u.username, u.school_id, u.is_active, r.slug AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = :id AND u.deleted_at IS NULL`,
      { id: decoded.sub }
    );

    if (!user || !user.is_active) {
      throw new UnauthorizedError('User inactive or not found');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      schoolId: user.school_id,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    next(err);
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  return authenticate(req, res, next);
}

module.exports = { authenticate, optionalAuth };
