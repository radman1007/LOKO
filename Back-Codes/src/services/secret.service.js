const { query, queryOne } = require('../database/connection');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

async function list(userId) {
  return query(
    `SELECT id, content, mood_tag, created_at, updated_at
     FROM secrets WHERE user_id = :userId AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    { userId }
  );
}

async function create(userId, { content, moodTag }) {
  const result = await query(
    `INSERT INTO secrets (user_id, content, mood_tag) VALUES (:userId, :content, :moodTag)`,
    { userId, content, moodTag: moodTag || null }
  );
  return queryOne('SELECT * FROM secrets WHERE id = :id', { id: result.insertId });
}

async function update(userId, secretId, { content, moodTag }) {
  const secret = await queryOne(
    'SELECT * FROM secrets WHERE id = :id AND user_id = :userId AND deleted_at IS NULL',
    { id: secretId, userId }
  );
  if (!secret) throw new NotFoundError('Secret');

  await query(
    'UPDATE secrets SET content = :content, mood_tag = :moodTag, updated_at = NOW() WHERE id = :id',
    { content, moodTag: moodTag || null, id: secretId }
  );
  return queryOne('SELECT * FROM secrets WHERE id = :id', { id: secretId });
}

async function remove(userId, secretId) {
  const secret = await queryOne(
    'SELECT * FROM secrets WHERE id = :id AND user_id = :userId AND deleted_at IS NULL',
    { id: secretId, userId }
  );
  if (!secret) throw new NotFoundError('Secret');

  await query('UPDATE secrets SET deleted_at = NOW() WHERE id = :id', { id: secretId });
  return { deleted: true };
}

module.exports = { list, create, update, remove };
