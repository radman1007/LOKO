const { query, queryOne, withTransaction } = require('../database/connection');
const { getRedis, RedisKeys } = require('../database/redis');
const config = require('../config');

const MOOD_SLUGS = { good: 1, normal: 2, bad: 3 };

async function getMoodPromptStatus(userId) {
  const redis = getRedis();
  const cacheKey = RedisKeys.moodPrompt(userId);
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const today = new Date().toISOString().split('T')[0];
  const lastCheckin = await queryOne(
    `SELECT * FROM mood_checkins
     WHERE user_id = :userId
     ORDER BY created_at DESC LIMIT 1`,
    { userId }
  );

  const result = { shouldPrompt: true, lastMood: null, lastCheckinAt: null };

  if (!lastCheckin) {
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    return result;
  }

  result.lastMood = lastCheckin.mood_id;
  result.lastCheckinAt = lastCheckin.created_at;

  const hoursSince = (Date.now() - new Date(lastCheckin.created_at).getTime()) / (1000 * 60 * 60);
  const isFirstToday = lastCheckin.checkin_date !== today;

  result.shouldPrompt = isFirstToday || hoursSince >= config.mood.promptIntervalHours;

  await redis.setex(cacheKey, 300, JSON.stringify(result));
  return result;
}

async function recordCheckin(userId, moodSlug, note = null) {
  const moodId = MOOD_SLUGS[moodSlug];
  if (!moodId) throw new Error('Invalid mood');

  const today = new Date().toISOString().split('T')[0];
  const firstToday = await queryOne(
    `SELECT id FROM mood_checkins
     WHERE user_id = :userId AND checkin_date = :today LIMIT 1`,
    { userId, today }
  );

  const isFirstOfDay = !firstToday;

  const result = await query(
    `INSERT INTO mood_checkins (user_id, mood_id, is_first_of_day, checkin_date, note)
     VALUES (:userId, :moodId, :isFirst, :today, :note)`,
    { userId, moodId, isFirst: isFirstOfDay ? 1 : 0, today, note }
  );

  const redis = getRedis();
  await redis.del(RedisKeys.moodPrompt(userId));

  if (isFirstOfDay) {
    await redis.del(RedisKeys.dailyPodcast(userId, today));
  }

  return { id: result.insertId, isFirstOfDay, moodSlug };
}

async function getMoodHistory(userId, days = 30) {
  return query(
    `SELECT mc.*, m.slug AS mood_slug, m.label_fa
     FROM mood_checkins mc
     JOIN moods m ON m.id = mc.mood_id
     WHERE mc.user_id = :userId
       AND mc.checkin_date >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
     ORDER BY mc.created_at DESC`,
    { userId, days }
  );
}

module.exports = {
  getMoodPromptStatus,
  recordCheckin,
  getMoodHistory,
  MOOD_SLUGS,
};
