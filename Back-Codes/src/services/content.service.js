const { query, queryOne } = require('../database/connection');
const { NotFoundError } = require('../utils/errors');
const auditService = require('./audit.service');

// ========== ویدیوها - ساده شده ==========
async function listVideos({ categoryId = null, search = null, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let sql = 'SELECT * FROM videos';
  const params = [];
  const conditions = [];

  if (categoryId) {
    conditions.push('category_id = ?');
    params.push(categoryId);
  }
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const videos = await query(sql, params);

  let countSql = 'SELECT COUNT(*) as total FROM videos';
  if (conditions.length > 0) {
    countSql += ' WHERE ' + conditions.join(' AND ');
  }
  const countParams = params.slice(0, -2);
  const [countResult] = await query(countSql, countParams);

  return { videos, total: countResult?.total || 0, page, limit };
}

// ========== پادکست‌ها - ساده شده ==========
async function listPodcasts({ categoryId = null, moodSlug = null, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let sql = 'SELECT * FROM podcasts';
  const params = [];
  const conditions = [];

  if (categoryId) {
    conditions.push('category_id = ?');
    params.push(categoryId);
  }
  if (moodSlug) {
    conditions.push('mood_slug = ?');
    params.push(moodSlug);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const podcasts = await query(sql, params);

  let countSql = 'SELECT COUNT(*) as total FROM podcasts';
  if (conditions.length > 0) {
    countSql += ' WHERE ' + conditions.join(' AND ');
  }
  const countParams = params.slice(0, -2);
  const [countResult] = await query(countSql, countParams);

  return { podcasts, total: countResult?.total || 0, page, limit };
}

async function getVideo(id) {
  const video = await queryOne('SELECT * FROM videos WHERE id = ?', [id]);
  if (!video) throw new NotFoundError('Video not found');
  return video;
}

async function getPodcast(id) {
  const podcast = await queryOne('SELECT * FROM podcasts WHERE id = ?', [id]);
  if (!podcast) throw new NotFoundError('Podcast not found');
  return podcast;
}

// ========== ایجاد ویدیو - با ستون‌های احتمالی ==========
async function createVideo(data, uploadedBy) {
  // ابتدا بررسی می‌کنیم جدول چه ستون‌هایی داره
  // فعلاً فقط با ستون‌های اصلی
  const result = await query(
    `INSERT INTO videos (title, description, category_id, duration_seconds, uploaded_by, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [data.title, data.description || '', data.categoryId || null, data.durationSeconds || 0, uploadedBy]
  );

  await auditService.log({
    userId: uploadedBy,
    action: 'video.create',
    entityType: 'video',
    entityId: result.insertId,
  });

  return getVideo(result.insertId);
}

// ========== ایجاد پادکست ==========
async function createPodcast(data, uploadedBy) {
  const result = await query(
    `INSERT INTO podcasts (title, description, category_id, mood_slug, duration_seconds, uploaded_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [data.title, data.description || '', data.categoryId || null, data.moodSlug || null, data.durationSeconds || 0, uploadedBy]
  );

  await auditService.log({
    userId: uploadedBy,
    action: 'podcast.create',
    entityType: 'podcast',
    entityId: result.insertId,
  });

  return getPodcast(result.insertId);
}

async function recordInteraction(userId, { contentType, contentId, interactionType, progressSeconds, durationSeconds }) {
  await query(
    `INSERT INTO content_interactions
     (user_id, content_type, content_id, interaction_type, progress_seconds, duration_seconds)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, contentType, contentId, interactionType, progressSeconds || null, durationSeconds || null]
  );

  if (interactionType === 'view' && contentType === 'video') {
    await query('UPDATE videos SET view_count = view_count + 1 WHERE id = ?', [contentId]);
  }
  if (interactionType === 'play' && contentType === 'podcast') {
    await query('UPDATE podcasts SET play_count = play_count + 1 WHERE id = ?', [contentId]);
  }

  return { recorded: true };
}

async function listCategories(contentType) {
  try {
    return await query(
      'SELECT * FROM content_categories WHERE content_type = ? ORDER BY sort_order',
      [contentType]
    );
  } catch (error) {
    return [];
  }
}

async function deleteVideo(id) {
  await query('DELETE FROM videos WHERE id = ?', [id]);
  return { success: true };
}

async function deletePodcast(id) {
  await query('DELETE FROM podcasts WHERE id = ?', [id]);
  return { success: true };
}

module.exports = {
  listVideos,
  listPodcasts,
  getVideo,
  getPodcast,
  createVideo,
  createPodcast,
  recordInteraction,
  listCategories,
  deleteVideo,
  deletePodcast,
};