const { query, queryOne } = require('../database/connection');
const moodEngine = require('./mood.engine');

async function checkPointBadges(userId, totalPoints) {
  const badges = await query(
    `SELECT * FROM badge_definitions
     WHERE criteria_type = 'points' AND criteria_value <= :points AND is_active = 1`,
    { points: totalPoints }
  );

  for (const badge of badges) {
    await awardBadgeIfNew(userId, badge.id);
  }
}

async function checkTaskBadges(userId) {
  const [count] = await query(
    'SELECT COUNT(*) AS cnt FROM task_completions WHERE user_id = :userId',
    { userId }
  );
  const total = count?.cnt || 0;

  const badges = await query(
    `SELECT * FROM badge_definitions
     WHERE criteria_type = 'tasks' AND criteria_value <= :total AND is_active = 1`,
    { total }
  );

  for (const badge of badges) {
    await awardBadgeIfNew(userId, badge.id);
  }
}

async function awardBadgeIfNew(userId, badgeId) {
  const existing = await queryOne(
    'SELECT id FROM user_badges WHERE user_id = :userId AND badge_id = :badgeId',
    { userId, badgeId }
  );
  if (!existing) {
    await query(
      'INSERT INTO user_badges (user_id, badge_id) VALUES (:userId, :badgeId)',
      { userId, badgeId }
    );
  }
}

module.exports = { checkPointBadges, checkTaskBadges, awardBadgeIfNew };
