const { query, queryOne } = require('../database/connection');
const { getRedis, RedisKeys } = require('../database/redis');

const MOOD_PODCAST_MAP = {
  good: 'motivational',
  normal: 'educational',
  bad: 'calming',
};

async function getDailyPodcast(userId) {
  const today = new Date().toISOString().split('T')[0];
  const redis = getRedis();
  const cacheKey = RedisKeys.dailyPodcast(userId, today);

  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const firstMood = await queryOne(
    `SELECT m.slug AS mood_slug FROM mood_checkins mc
     JOIN moods m ON m.id = mc.mood_id
     WHERE mc.user_id = :userId AND mc.checkin_date = :today AND mc.is_first_of_day = 1
     LIMIT 1`,
    { userId, today }
  );

  if (!firstMood) {
    return { podcast: null, reason: 'no_mood_today' };
  }

  const categorySlug = MOOD_PODCAST_MAP[firstMood.mood_slug] || 'educational';

  const podcast = await queryOne(
    `SELECT p.* FROM podcasts p
     LEFT JOIN content_categories c ON c.id = p.category_id
     WHERE p.is_active = 1 AND p.deleted_at IS NULL
       AND (p.mood_slug = :mood OR c.slug = :category)
     ORDER BY RAND() LIMIT 1`,
    { mood: firstMood.mood_slug, category: categorySlug }
  );

  const result = {
    podcast,
    moodSlug: firstMood.mood_slug,
    categorySlug,
    lockedForDay: true,
  };

  await redis.setex(cacheKey, 86400, JSON.stringify(result));
  return result;
}

module.exports = { getDailyPodcast, MOOD_PODCAST_MAP };
