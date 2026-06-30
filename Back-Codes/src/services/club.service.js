const { query, queryOne, withTransaction } = require('../database/connection');
const { NotFoundError, ConflictError } = require('../utils/errors');

async function getCoins(userId) {
  const wallet = await queryOne('SELECT balance FROM token_wallets WHERE user_id = :userId', { userId });
  return { coins: wallet ? wallet.balance : 0 };
}

async function listRewards(userId) {
  const rewards = await query(
    `SELECT id, slug, title, description, icon_url, cost_coins, stock
     FROM rewards WHERE is_active = 1 ORDER BY sort_order, id`
  );
  const { coins } = await getCoins(userId);
  return rewards.map((r) => ({ ...r, affordable: coins >= r.cost_coins }));
}

async function redeemReward(userId, rewardId) {
  return withTransaction(async (conn) => {
    const [rewardRows] = await conn.execute(
      'SELECT * FROM rewards WHERE id = ? AND is_active = 1',
      [rewardId]
    );
    if (rewardRows.length === 0) throw new NotFoundError('Reward');
    const reward = rewardRows[0];

    if (reward.stock != null && reward.stock <= 0) {
      throw new ConflictError('این جایزه موجود نیست');
    }

    const [walletRows] = await conn.execute(
      'SELECT id, balance FROM token_wallets WHERE user_id = ?',
      [userId]
    );
    const wallet = walletRows[0] || { id: null, balance: 0 };
    if (wallet.balance < reward.cost_coins) {
      throw new ConflictError('سکه کافی نداری');
    }

    const newBalance = wallet.balance - reward.cost_coins;
    await conn.execute('UPDATE token_wallets SET balance = ? WHERE user_id = ?', [newBalance, userId]);
    await conn.execute(
      `INSERT INTO token_transactions (user_id, wallet_id, amount, balance_after, source_type, source_id)
       VALUES (?, ?, ?, ?, 'reward_redeem', ?)`,
      [userId, wallet.id, -reward.cost_coins, newBalance, rewardId]
    );
    await conn.execute('UPDATE student_profiles SET total_tokens = ? WHERE user_id = ?', [newBalance, userId]);

    if (reward.stock != null) {
      await conn.execute('UPDATE rewards SET stock = stock - 1 WHERE id = ?', [rewardId]);
    }

    const [result] = await conn.execute(
      `INSERT INTO reward_redemptions (user_id, reward_id, cost_coins, status)
       VALUES (?, ?, ?, 'pending')`,
      [userId, rewardId, reward.cost_coins]
    );

    return {
      redemptionId: result.insertId,
      reward: { id: reward.id, title: reward.title },
      coinBalance: newBalance,
    };
  });
}

async function getBadges(userId) {
  const all = await query(
    'SELECT id, slug, name_fa, criteria_type, criteria_value FROM badge_definitions WHERE is_active = 1'
  );
  const earned = await query(
    `SELECT badge_id, awarded_at FROM user_badges WHERE user_id = :userId`,
    { userId }
  );
  const earnedMap = new Map(earned.map((e) => [e.badge_id, e.awarded_at]));
  return all.map((b) => ({
    ...b,
    earned: earnedMap.has(b.id),
    awardedAt: earnedMap.get(b.id) || null,
  }));
}

// استریک: تعداد روزهای متوالی که حداقل یک تسک انجام شده (تا امروز/دیروز)
async function getStreak(userId) {
  const rows = await query(
    `SELECT DISTINCT completion_date FROM task_completions
     WHERE user_id = :userId
     ORDER BY completion_date DESC LIMIT 60`,
    { userId }
  );
  const dates = new Set(rows.map((r) => new Date(r.completion_date).toISOString().split('T')[0]));

  let streak = 0;
  const cursor = new Date();
  // اگر امروز انجام نشده، از دیروز بشمار
  const todayStr = cursor.toISOString().split('T')[0];
  if (!dates.has(todayStr)) cursor.setDate(cursor.getDate() - 1);

  for (let i = 0; i < 60; i++) {
    const d = cursor.toISOString().split('T')[0];
    if (dates.has(d)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // وضعیت ۷ روز اخیر برای نمایش هفتگی
  const week = [];
  const wc = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(wc);
    d.setDate(wc.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    week.push({ date: ds, done: dates.has(ds) });
  }

  return { streak, week };
}

async function getSummary(userId) {
  const [{ coins }, badges, streak] = await Promise.all([
    getCoins(userId),
    getBadges(userId),
    getStreak(userId),
  ]);
  const profile = await queryOne(
    'SELECT total_points, garden_level FROM student_profiles WHERE user_id = :userId',
    { userId }
  );
  const completedToday = await queryOne(
    `SELECT COUNT(*) AS cnt FROM task_completions
     WHERE user_id = :userId AND completion_date = CURDATE()`,
    { userId }
  );

  return {
    coins,
    points: profile?.total_points || 0,
    gardenLevel: profile?.garden_level || 1,
    streak: streak.streak,
    week: streak.week,
    badgesEarned: badges.filter((b) => b.earned).length,
    badgesTotal: badges.length,
    tasksCompletedToday: completedToday?.cnt || 0,
  };
}

module.exports = {
  getCoins, listRewards, redeemReward, getBadges, getStreak, getSummary,
};
