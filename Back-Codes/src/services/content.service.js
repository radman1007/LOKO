const { query, queryOne } = require('../database/connection');
const { NotFoundError } = require('../utils/errors');
const auditService = require('./audit.service');

// ========== ویدیوها ==========
async function listVideos({ categoryId = null, search = null, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let sql = `SELECT v.*, c.name_fa AS category_name
             FROM videos v
             LEFT JOIN content_categories c ON c.id = v.category_id`;
  const params = [];
  const conditions = [];

  if (categoryId) {
    conditions.push('v.category_id = ?');
    params.push(categoryId);
  }
  if (search) {
    conditions.push('(v.title LIKE ? OR v.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const videos = await query(sql, params);

  let countSql = 'SELECT COUNT(*) as total FROM videos v';
  if (conditions.length > 0) {
    countSql += ' WHERE ' + conditions.join(' AND ');
  }
  const countParams = params.slice(0, -2);
  const [countResult] = await query(countSql, countParams);

  return { videos, total: countResult?.total || 0, page, limit };
}

// ========== پادکست‌ها ==========
async function listPodcasts({ categoryId = null, moodSlug = null, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let sql = `SELECT p.*, c.name_fa AS category_name
             FROM podcasts p
             LEFT JOIN content_categories c ON c.id = p.category_id`;
  const params = [];
  const conditions = [];

  if (categoryId) {
    conditions.push('p.category_id = ?');
    params.push(categoryId);
  }
  if (moodSlug) {
    conditions.push('p.mood_slug = ?');
    params.push(moodSlug);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const podcasts = await query(sql, params);

  let countSql = 'SELECT COUNT(*) as total FROM podcasts p';
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
    `INSERT INTO videos (title, description, category_id, file_url, thumbnail_url, duration_seconds, uploaded_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [data.title, data.description || '', data.categoryId || null, data.fileUrl || null,
      data.thumbnailUrl || null, data.durationSeconds || 0, uploadedBy]
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
    `INSERT INTO podcasts (title, description, category_id, mood_slug, file_url, cover_url, duration_seconds, uploaded_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [data.title, data.description || '', data.categoryId || null, data.moodSlug || null,
      data.fileUrl || null, data.coverUrl || null, data.durationSeconds || 0, uploadedBy]
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

async function updateVideo(id, data) {
  await getVideo(id);
  await query(
    `UPDATE videos SET title = ?, description = ?, category_id = ?, updated_at = NOW() WHERE id = ?`,
    [data.title, data.description || '', data.categoryId || null, id]
  );
  return getVideo(id);
}

async function updatePodcast(id, data) {
  await getPodcast(id);
  await query(
    `UPDATE podcasts SET title = ?, description = ?, category_id = ?, mood_slug = ?, updated_at = NOW() WHERE id = ?`,
    [data.title, data.description || '', data.categoryId || null, data.moodSlug || null, id]
  );
  return getPodcast(id);
}

// صفحه اصلی Loko TV: حداقل یک ویدیو از هر دسته‌بندی
async function getLatestVideosByCategory(perCategory = 6) {
  const categories = await query(
    `SELECT id, slug, name_fa, name_en FROM content_categories
     WHERE content_type = 'video' AND is_active = 1 ORDER BY sort_order, id`
  );

  const groups = [];
  for (const cat of categories) {
    const videos = await query(
      `SELECT id, title, description, thumbnail_url, file_url, duration_seconds, view_count, category_id
       FROM videos WHERE category_id = ? AND is_active = 1 AND deleted_at IS NULL
       ORDER BY created_at DESC LIMIT ?`,
      [cat.id, perCategory]
    );
    if (videos.length > 0) groups.push({ category: cat, videos });
  }

  const uncategorized = await query(
    `SELECT id, title, description, thumbnail_url, file_url, duration_seconds, view_count, category_id
     FROM videos WHERE category_id IS NULL AND is_active = 1 AND deleted_at IS NULL
     ORDER BY created_at DESC LIMIT ?`,
    [perCategory]
  );
  if (uncategorized.length > 0) {
    groups.push({ category: { id: null, slug: 'general', name_fa: 'عمومی' }, videos: uncategorized });
  }

  return groups;
}

module.exports = {
  listVideos,
  listPodcasts,
  getVideo,
  getPodcast,
  createVideo,
  createPodcast,
  updateVideo,
  updatePodcast,
  recordInteraction,
  listCategories,
  deleteVideo,
  deletePodcast,
  getLatestVideosByCategory,
};