const { query, queryOne } = require('../database/connection');
const { NotFoundError } = require('../utils/errors');
const auditService = require('./audit.service');

async function listVideos({ categoryId = null, search = null, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let where = 'WHERE v.is_active = 1 AND v.deleted_at IS NULL';
  const params = { limit, offset };

  if (categoryId) {
    where += ' AND v.category_id = :categoryId';
    params.categoryId = categoryId;
  }
  if (search) {
    where += ' AND MATCH(v.title) AGAINST(:search IN NATURAL LANGUAGE MODE)';
    params.search = search;
  }

  const videos = await query(
    `SELECT v.id, v.title, v.description, v.thumbnail_url, v.duration_seconds, v.view_count, v.category_id
     FROM videos v ${where} ORDER BY v.created_at DESC LIMIT :limit OFFSET :offset`,
    params
  );
  return { videos, page, limit };
}

async function listPodcasts({ categoryId = null, moodSlug = null, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let where = 'WHERE p.is_active = 1 AND p.deleted_at IS NULL';
  const params = { limit, offset };

  if (categoryId) {
    where += ' AND p.category_id = :categoryId';
    params.categoryId = categoryId;
  }
  if (moodSlug) {
    where += ' AND p.mood_slug = :moodSlug';
    params.moodSlug = moodSlug;
  }

  const podcasts = await query(
    `SELECT p.id, p.title, p.description, p.cover_url, p.duration_seconds, p.mood_slug, p.play_count
     FROM podcasts p ${where} ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset`,
    params
  );
  return { podcasts, page, limit };
}

async function getVideo(id) {
  const video = await queryOne(
    'SELECT * FROM videos WHERE id = :id AND deleted_at IS NULL',
    { id }
  );
  if (!video) throw new NotFoundError('Video');
  return video;
}

async function createVideo(data, uploadedBy) {
  const result = await query(
    `INSERT INTO videos (category_id, title, description, file_url, thumbnail_url, duration_seconds, uploaded_by)
     VALUES (:categoryId, :title, :description, :fileUrl, :thumbnailUrl, :duration, :uploadedBy)`,
    {
      categoryId: data.categoryId || null,
      title: data.title,
      description: data.description || null,
      fileUrl: data.fileUrl,
      thumbnailUrl: data.thumbnailUrl || null,
      duration: data.durationSeconds || null,
      uploadedBy,
    }
  );

  await auditService.log({
    userId: uploadedBy,
    action: 'video.create',
    entityType: 'video',
    entityId: result.insertId,
  });

  return getVideo(result.insertId);
}

async function createPodcast(data, uploadedBy) {
  const result = await query(
    `INSERT INTO podcasts (category_id, title, description, file_url, cover_url, duration_seconds, mood_slug, uploaded_by)
     VALUES (:categoryId, :title, :description, :fileUrl, :coverUrl, :duration, :moodSlug, :uploadedBy)`,
    {
      categoryId: data.categoryId || null,
      title: data.title,
      description: data.description || null,
      fileUrl: data.fileUrl,
      coverUrl: data.coverUrl || null,
      duration: data.durationSeconds || null,
      moodSlug: data.moodSlug || null,
      uploadedBy,
    }
  );

  await auditService.log({
    userId: uploadedBy,
    action: 'podcast.create',
    entityType: 'podcast',
    entityId: result.insertId,
  });

  return queryOne('SELECT * FROM podcasts WHERE id = :id', { id: result.insertId });
}

async function recordInteraction(userId, { contentType, contentId, interactionType, progressSeconds, durationSeconds }) {
  await query(
    `INSERT INTO content_interactions
     (user_id, content_type, content_id, interaction_type, progress_seconds, duration_seconds)
     VALUES (:userId, :type, :contentId, :interaction, :progress, :duration)`,
    {
      userId,
      type: contentType,
      contentId,
      interaction: interactionType,
      progress: progressSeconds || null,
      duration: durationSeconds || null,
    }
  );

  if (interactionType === 'view' && contentType === 'video') {
    await query('UPDATE videos SET view_count = view_count + 1 WHERE id = :id', { id: contentId });
  }
  if (interactionType === 'play' && contentType === 'podcast') {
    await query('UPDATE podcasts SET play_count = play_count + 1 WHERE id = :id', { id: contentId });
  }

  return { recorded: true };
}

async function listCategories(contentType) {
  return query(
    `SELECT * FROM content_categories WHERE content_type = :type AND is_active = 1
     ORDER BY sort_order`,
    { type: contentType }
  );
}

module.exports = {
  listVideos,
  listPodcasts,
  getVideo,
  createVideo,
  createPodcast,
  recordInteraction,
  listCategories,
};
