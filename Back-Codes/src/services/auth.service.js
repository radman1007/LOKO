const { query, queryOne } = require('../database/connection');
const { comparePassword, hashPassword, generateSecurePassword } = require('../utils/crypto');
const { createTokenPair, validateRefreshToken, revokeRefreshToken, signAccessToken, signRefreshToken, storeRefreshToken } = require('./token.service');
const { sha256 } = require('../utils/crypto');
const { UnauthorizedError, NotFoundError } = require('../utils/errors');
const auditService = require('./audit.service');

async function findUserByUsername(username) {
  return queryOne(
    `SELECT u.*, r.slug AS role_slug, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.username = :username AND u.deleted_at IS NULL AND u.is_active = 1`,
    { username }
  );
}

async function login(username, password, meta = {}) {
  const user = await findUserByUsername(username);
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  await query('UPDATE users SET last_login_at = NOW() WHERE id = :id', { id: user.id });

  const tokens = await createTokenPair(user, meta);

  await auditService.log({
    userId: user.id,
    schoolId: user.school_id,
    action: 'user.login',
    entityType: 'user',
    entityId: user.id,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

async function refresh(refreshToken, meta = {}) {
  const { decoded, stored } = await validateRefreshToken(refreshToken);

  const user = await queryOne(
    `SELECT u.*, r.slug AS role_slug FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = :id AND u.deleted_at IS NULL AND u.is_active = 1`,
    { id: decoded.sub }
  );

  if (!user) throw new UnauthorizedError('User not found');

  const newJti = require('uuid').v4();
  await revokeRefreshToken(decoded.jti, newJti);

  const accessToken = signAccessToken({
    sub: user.id,
    username: user.username,
    role: user.role_slug,
    schoolId: user.school_id,
  });

  const { token: newRefreshToken, jti, familyId } = signRefreshToken({
    sub: user.id,
    username: user.username,
    familyId: decoded.familyId,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await storeRefreshToken(user.id, jti, familyId, sha256(newRefreshToken), expiresAt, meta);

  return { accessToken, refreshToken: newRefreshToken, expiresIn: '15m' };
}

async function logout(jti) {
  if (jti) await revokeRefreshToken(jti);
}

async function resetPassword(actorId, targetUserId, schoolId = null) {
  const target = await queryOne(
    'SELECT * FROM users WHERE id = :id AND deleted_at IS NULL',
    { id: targetUserId }
  );
  if (!target) throw new NotFoundError('User');

  if (schoolId && target.school_id !== schoolId) {
    throw new UnauthorizedError('Cannot reset password for user outside your school');
  }

  const newPassword = generateSecurePassword(10);
  const passwordHash = await hashPassword(newPassword);

  await query(
    'UPDATE users SET password_hash = :hash, plain_password = :plain WHERE id = :id',
    { hash: passwordHash, plain: newPassword, id: targetUserId }
  );

  await auditService.log({
    userId: actorId,
    schoolId: target.school_id,
    action: 'user.password_reset',
    entityType: 'user',
    entityId: targetUserId,
  });

  return { userId: targetUserId, username: target.username, password: newPassword };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role_slug,
    schoolId: user.school_id,
    avatarUrl: user.avatar_url,
  };
}

module.exports = {
  findUserByUsername,
  login,
  refresh,
  logout,
  resetPassword,
  sanitizeUser,
};
