const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { query, queryOne } = require('../database/connection');
const { getRedis, RedisKeys } = require('../database/redis');
const { sha256 } = require('../utils/crypto');
const { UnauthorizedError } = require('../utils/errors');

function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'loko-api',
    audience: 'loko-client',
  });
}

function signRefreshToken(payload) {
  const jti = uuidv4();
  const familyId = payload.familyId || uuidv4();
  const token = jwt.sign(
    { ...payload, jti, familyId },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'loko-api',
      audience: 'loko-client',
    }
  );
  return { token, jti, familyId };
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'loko-api',
    audience: 'loko-client',
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'loko-api',
    audience: 'loko-client',
  });
}

async function storeRefreshToken(userId, jti, familyId, tokenHash, expiresAt, meta = {}) {
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, family_id, jti, expires_at, ip_address, user_agent)
     VALUES (:userId, :tokenHash, :familyId, :jti, :expiresAt, :ip, :ua)`,
    {
      userId,
      tokenHash,
      familyId,
      jti,
      expiresAt,
      ip: meta.ip || null,
      ua: meta.userAgent || null,
    }
  );

  const redis = getRedis();
  const ttl = Math.floor((new Date(expiresAt) - Date.now()) / 1000);
  await redis.setex(RedisKeys.refreshToken(jti), ttl, JSON.stringify({ userId, familyId }));
}

async function revokeRefreshToken(jti, replacedBy = null) {
  await query(
    'UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by = :replacedBy WHERE jti = :jti',
    { jti, replacedBy }
  );
  const redis = getRedis();
  await redis.del(RedisKeys.refreshToken(jti));
}

async function revokeTokenFamily(familyId) {
  await query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = :familyId AND revoked_at IS NULL',
    { familyId }
  );
}

async function validateRefreshToken(token) {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const tokenHash = sha256(token);
  const stored = await queryOne(
    `SELECT * FROM refresh_tokens
     WHERE jti = :jti AND token_hash = :tokenHash AND revoked_at IS NULL AND expires_at > NOW()`,
    { jti: decoded.jti, tokenHash }
  );

  if (!stored) {
    await revokeTokenFamily(decoded.familyId);
    throw new UnauthorizedError('Refresh token revoked or expired');
  }

  return { decoded, stored };
}

async function createTokenPair(user, meta = {}) {
  const accessPayload = {
    sub: user.id,
    username: user.username,
    role: user.role_slug,
    schoolId: user.school_id,
  };

  const accessToken = signAccessToken(accessPayload);
  const { token: refreshToken, jti, familyId } = signRefreshToken({
    sub: user.id,
    username: user.username,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await storeRefreshToken(user.id, jti, familyId, sha256(refreshToken), expiresAt, meta);

  const redis = getRedis();
  await redis.setex(
    RedisKeys.session(user.id),
    15 * 60,
    JSON.stringify({ userId: user.id, role: user.role_slug, schoolId: user.school_id })
  );

  return { accessToken, refreshToken, expiresIn: config.jwt.accessExpiresIn };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  revokeTokenFamily,
  validateRefreshToken,
  createTokenPair,
};
