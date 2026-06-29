const { withTransaction, query, queryOne } = require('../database/connection');
const badgeEngine = require('./badge.engine');

async function completeTask(userId, taskId) {
  return withTransaction(async (conn) => {
    const task = await queryOne(
      'SELECT * FROM daily_tasks WHERE id = :id AND is_active = 1 AND deleted_at IS NULL',
      { id: taskId }
    );
    if (!task) throw new Error('Task not found');

    const today = new Date().toISOString().split('T')[0];
    const existing = await queryOne(
      `SELECT id FROM task_completions
       WHERE task_id = :taskId AND user_id = :userId AND completion_date = :today`,
      { taskId, userId, today }
    );
    if (existing) throw new Error('Task already completed today');

    await conn.execute(
      `INSERT INTO task_completions (task_id, user_id, completion_date) VALUES (?, ?, ?)`,
      [taskId, userId, today]
    );

    if (task.points_reward > 0) {
      await awardPoints(conn, userId, task.points_reward, 'task_completion', taskId);
    }
    if (task.token_reward > 0) {
      await awardTokens(conn, userId, task.token_reward, 'task_completion', taskId);
    }

    await badgeEngine.checkTaskBadges(userId);

    return { pointsAwarded: task.points_reward, tokensAwarded: task.token_reward };
  });
}

async function awardPoints(conn, userId, amount, sourceType, sourceId) {
  const profile = await queryOne(
    'SELECT total_points FROM student_profiles WHERE user_id = :userId',
    { userId }
  );
  const current = profile?.total_points || 0;
  const newBalance = current + amount;

  await conn.execute(
    'UPDATE student_profiles SET total_points = ? WHERE user_id = ?',
    [newBalance, userId]
  );
  await conn.execute(
    `INSERT INTO points_transactions (user_id, amount, balance_after, source_type, source_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, amount, newBalance, sourceType, sourceId]
  );

  await badgeEngine.checkPointBadges(userId, newBalance);
  return newBalance;
}

async function awardTokens(conn, userId, amount, sourceType, sourceId) {
  let wallet = await queryOne('SELECT * FROM token_wallets WHERE user_id = :userId', { userId });
  if (!wallet) {
    await conn.execute('INSERT INTO token_wallets (user_id, balance) VALUES (?, 0)', [userId]);
    wallet = { balance: 0 };
  }

  const newBalance = wallet.balance + amount;
  await conn.execute('UPDATE token_wallets SET balance = ? WHERE user_id = ?', [newBalance, userId]);
  const [result] = await conn.execute('SELECT id FROM token_wallets WHERE user_id = ?', [userId]);
  await conn.execute(
    `INSERT INTO token_transactions (user_id, wallet_id, amount, balance_after, source_type, source_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, result[0].id, amount, newBalance, sourceType, sourceId]
  );

  await conn.execute(
    'UPDATE student_profiles SET total_tokens = ? WHERE user_id = ?',
    [newBalance, userId]
  );

  return newBalance;
}

module.exports = { completeTask, awardPoints, awardTokens };
