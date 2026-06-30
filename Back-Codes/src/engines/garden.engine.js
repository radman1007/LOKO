const { query, queryOne } = require('../database/connection');

const ACTIVITY_REWARDS = {
  mood_checkin: { exp: 5, plant: null },
  task_complete: { exp: 15, plant: 'seed' },
  breathing_session: { exp: 10, plant: null },
  video_complete: { exp: 8, plant: null },
  podcast_complete: { exp: 8, plant: null },
  secret_write: { exp: 3, plant: null },
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 5000];

async function getOrCreateGarden(userId) {
  let garden = await queryOne('SELECT * FROM garden_states WHERE user_id = :userId', { userId });
  if (!garden) {
    await query('INSERT INTO garden_states (user_id) VALUES (:userId)', { userId });
    garden = await queryOne('SELECT * FROM garden_states WHERE user_id = :userId', { userId });
  }
  return garden;
}

async function recordActivity(userId, activityType) {
  const reward = ACTIVITY_REWARDS[activityType];
  if (!reward) return null;

  const garden = await getOrCreateGarden(userId);
  let newExp = garden.experience + reward.exp;
  let newLevel = garden.level;

  while (newLevel < LEVEL_THRESHOLDS.length && newExp >= LEVEL_THRESHOLDS[newLevel]) {
    newLevel++;
  }

  await query(
    'UPDATE garden_states SET experience = :exp, level = :level, updated_at = NOW() WHERE user_id = :userId',
    { exp: newExp, level: newLevel, userId }
  );

  if (reward.plant) {
    await query(
      `INSERT INTO garden_plants (user_id, plant_type, plant_slug, growth_stage)
       VALUES (:userId, :type, :slug, 0)`,
      { userId, type: reward.plant, slug: `${reward.plant}_${Date.now()}` }
    );
  }

  if (newLevel > garden.level) {
    await query(
      `INSERT INTO garden_plants (user_id, plant_type, plant_slug, growth_stage)
       VALUES (:userId, 'flower', :slug, 1)`,
      { userId, slug: `level_up_flower_${newLevel}` }
    );
  }

  return { experience: newExp, level: newLevel, plantAwarded: reward.plant };
}

async function getGardenState(userId) {
  const garden = await getOrCreateGarden(userId);
  const plants = await query(
    'SELECT * FROM garden_plants WHERE user_id = :userId ORDER BY acquired_at DESC',
    { userId }
  );
  return { ...garden, plants };
}

// نگاشت حال به امتیاز عددی
const MOOD_SCORE = { good: 100, normal: 60, bad: 25 };

// شاخص سلامت روان بر اساس حال ۱۴ روز اخیر، تمرین‌های تنفس و رشد باغ
async function getWellbeing(userId) {
  const moods = await query(
    `SELECT m.slug FROM mood_checkins mc JOIN moods m ON m.id = mc.mood_id
     WHERE mc.user_id = :userId AND mc.checkin_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)`,
    { userId }
  );
  const moodValues = moods.map((r) => MOOD_SCORE[r.slug] ?? 60);
  const moodFactor = moodValues.length
    ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
    : 60;

  const breathing = await queryOne(
    `SELECT COUNT(*) AS cnt FROM breathing_sessions
     WHERE user_id = :userId AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)`,
    { userId }
  );
  // هدف: حداقل ۱۴ جلسه در ۱۴ روز = ۱۰۰٪
  const breathingFactor = Math.min(100, ((breathing?.cnt || 0) / 14) * 100);

  const garden = await getOrCreateGarden(userId);
  const gardenFactor = Math.min(100, (garden.level / LEVEL_THRESHOLDS.length) * 100);

  // وزن‌دهی: حال ۵۰٪، تنفس ۳۰٪، باغ ۲۰٪
  const score = Math.round(moodFactor * 0.5 + breathingFactor * 0.3 + gardenFactor * 0.2);

  let label = 'متوسط';
  if (score >= 75) label = 'عالی';
  else if (score >= 55) label = 'خوب';
  else if (score < 40) label = 'نیازمند توجه';

  const today = new Date().toISOString().split('T')[0];
  await query(
    `INSERT INTO wellbeing_snapshots (user_id, score, mood_factor, breathing_factor, garden_factor, snapshot_date)
     VALUES (:userId, :score, :mood, :breath, :garden, :today)
     ON DUPLICATE KEY UPDATE score = VALUES(score), mood_factor = VALUES(mood_factor),
       breathing_factor = VALUES(breathing_factor), garden_factor = VALUES(garden_factor)`,
    { userId, score, mood: moodFactor.toFixed(2), breath: breathingFactor.toFixed(2), garden: gardenFactor.toFixed(2), today }
  );

  return {
    score,
    label,
    factors: {
      mood: Math.round(moodFactor),
      breathing: Math.round(breathingFactor),
      garden: Math.round(gardenFactor),
    },
    moodCheckins14d: moodValues.length,
    breathingSessions14d: breathing?.cnt || 0,
    gardenLevel: garden.level,
  };
}

module.exports = { recordActivity, getGardenState, getWellbeing, ACTIVITY_REWARDS };
