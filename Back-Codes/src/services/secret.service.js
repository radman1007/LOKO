const { query, queryOne } = require('../database/connection');
const { hashPassword, comparePassword } = require('../utils/crypto');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

// لیست راز‌ها — محتوای راز فقط در صورت نداشتن رمز برگردانده می‌شود
async function list(userId) {
  const rows = await query(
    `SELECT id, title, content, mood_tag, password_hash, created_at, updated_at
     FROM secrets WHERE user_id = :userId AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    { userId }
  );
  return rows.map((s) => {
    const locked = !!s.password_hash;
    return {
      id: s.id,
      title: s.title,
      moodTag: s.mood_tag,
      locked,
      content: locked ? null : s.content,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    };
  });
}

async function create(userId, { title, content, moodTag, secretPassword }) {
  const passwordHash = secretPassword ? await hashPassword(secretPassword) : null;
  const result = await query(
    `INSERT INTO secrets (user_id, title, content, mood_tag, password_hash)
     VALUES (:userId, :title, :content, :moodTag, :passwordHash)`,
    { userId, title: title || null, content, moodTag: moodTag || null, passwordHash }
  );
  return {
    id: result.insertId,
    title: title || null,
    moodTag: moodTag || null,
    locked: !!passwordHash,
  };
}

async function getOwned(userId, secretId) {
  const secret = await queryOne(
    'SELECT * FROM secrets WHERE id = :id AND user_id = :userId AND deleted_at IS NULL',
    { id: secretId, userId }
  );
  if (!secret) throw new NotFoundError('Secret');
  return secret;
}

async function verifySecretPassword(secret, secretPassword) {
  if (!secret.password_hash) return true; // راز بدون رمز
  if (!secretPassword) return false;
  return comparePassword(secretPassword, secret.password_hash);
}

// باز کردن یک راز با رمز همان راز
async function unlock(userId, secretId, secretPassword) {
  const secret = await getOwned(userId, secretId);
  const ok = await verifySecretPassword(secret, secretPassword);
  if (!ok) throw new ForbiddenError('رمز راز اشتباه است');
  return {
    id: secret.id,
    title: secret.title,
    content: secret.content,
    moodTag: secret.mood_tag,
    createdAt: secret.created_at,
    updatedAt: secret.updated_at,
  };
}

async function update(userId, secretId, { title, content, moodTag, secretPassword, newPassword }) {
  const secret = await getOwned(userId, secretId);
  const ok = await verifySecretPassword(secret, secretPassword);
  if (!ok) throw new ForbiddenError('رمز راز اشتباه است');

  let passwordHash = secret.password_hash;
  if (newPassword !== undefined) {
    passwordHash = newPassword ? await hashPassword(newPassword) : null;
  }

  await query(
    `UPDATE secrets SET title = :title, content = :content, mood_tag = :moodTag,
       password_hash = :passwordHash, updated_at = NOW() WHERE id = :id`,
    {
      title: title != null ? title : secret.title,
      content: content != null ? content : secret.content,
      moodTag: moodTag != null ? moodTag : secret.mood_tag,
      passwordHash,
      id: secretId,
    }
  );
  return { id: secretId, updated: true, locked: !!passwordHash };
}

async function remove(userId, secretId, secretPassword) {
  const secret = await getOwned(userId, secretId);
  const ok = await verifySecretPassword(secret, secretPassword);
  if (!ok) throw new ForbiddenError('رمز راز اشتباه است');

  await query('UPDATE secrets SET deleted_at = NOW() WHERE id = :id', { id: secretId });
  return { deleted: true };
}

module.exports = { list, create, unlock, update, remove };
