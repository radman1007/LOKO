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

module.exports = { recordActivity, getGardenState, ACTIVITY_REWARDS };
