const { query, queryOne, withTransaction } = require('../database/connection');
const { hashPassword, generateSecurePassword } = require('../utils/crypto');
const { NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');
const { ROLE_IDS } = require('./user.service');
const auditService = require('./audit.service');

async function register({ firstName, lastName, phone, email, username, password }) {
  const existing = await queryOne('SELECT id FROM users WHERE username = :username', { username });
  if (existing) throw new ConflictError('نام کاربری قبلاً ثبت شده است');

  if (email) {
    const emailExists = await queryOne(
      'SELECT id FROM users WHERE email = :email AND deleted_at IS NULL',
      { email }
    );
    if (emailExists) throw new ConflictError('ایمیل قبلاً ثبت شده است');
  }

  const passwordHash = await hashPassword(password);

  const result = await query(
    `INSERT INTO users (role_id, username, password_hash, plain_password, first_name, last_name, phone, email, is_active)
     VALUES (:roleId, :username, :hash, :plain, :firstName, :lastName, :phone, :email, 1)`,
    {
      roleId: ROLE_IDS.parent,
      username,
      hash: passwordHash,
      plain: password,
      firstName,
      lastName,
      phone: phone || null,
      email: email || null,
    }
  );

  await auditService.log({
    userId: result.insertId,
    action: 'parent.self_register',
    entityType: 'user',
    entityId: result.insertId,
    newValues: { username, role: 'parent' },
  });

  return { id: result.insertId, username, firstName, lastName, role: 'parent' };
}

async function addChild(parentId, childData) {
  return withTransaction(async (conn) => {
    const { firstName, lastName, nationalCode, phone, grade } = childData;

    const baseUsername = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Date.now()}`.replace(/\s+/g, '_');
    const password = generateSecurePassword(8);
    const passwordHash = await hashPassword(password);

    const [result] = await conn.execute(
      `INSERT INTO users (role_id, username, password_hash, plain_password, first_name, last_name, national_code, phone, grade, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [ROLE_IDS.student, baseUsername, passwordHash, password, firstName, lastName, nationalCode || null, phone || null, grade || null]
    );
    const childId = result.insertId;

    await conn.execute('INSERT INTO student_profiles (user_id) VALUES (?)', [childId]);
    await conn.execute('INSERT INTO token_wallets (user_id, balance) VALUES (?, 0)', [childId]);
    await conn.execute('INSERT INTO garden_states (user_id) VALUES (?)', [childId]);

    await conn.execute(
      'INSERT INTO parent_student_relations (parent_id, student_id) VALUES (?, ?)',
      [parentId, childId]
    );

    await auditService.log({
      userId: parentId,
      action: 'parent.add_child',
      entityType: 'user',
      entityId: childId,
      newValues: { childUsername: baseUsername },
    });

    return { id: childId, username: baseUsername, password, firstName, lastName };
  });
}

async function listChildren(parentId) {
  return query(
    `SELECT u.id, u.username, u.first_name, u.last_name, u.is_active, u.grade,
            sp.total_points, sp.total_tokens, sp.garden_level
     FROM parent_student_relations psr
     JOIN users u ON u.id = psr.student_id
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     WHERE psr.parent_id = :parentId AND u.deleted_at IS NULL`,
    { parentId }
  );
}

async function getChildReport(parentId, childId) {
  const relation = await queryOne(
    'SELECT id FROM parent_student_relations WHERE parent_id = :parentId AND student_id = :childId',
    { parentId, childId }
  );
  if (!relation) throw new ForbiddenError('این دانش‌آموز در فرزندان شما نیست');

  const profile = await queryOne(
    `SELECT u.first_name, u.last_name, sp.total_points, sp.garden_level, sp.total_tokens
     FROM users u JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = :childId`,
    { childId }
  );

  const moodTrend = await query(
    `SELECT mc.checkin_date, m.slug AS mood, m.label_fa
     FROM mood_checkins mc JOIN moods m ON m.id = mc.mood_id
     WHERE mc.user_id = :childId AND mc.checkin_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     ORDER BY mc.checkin_date`,
    { childId }
  );

  const taskProgress = await queryOne(
    `SELECT COUNT(*) AS completed FROM task_completions
     WHERE user_id = :childId AND completion_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
    { childId }
  );

  const garden = await queryOne('SELECT level, experience FROM garden_states WHERE user_id = :childId', { childId });

  return {
    profile,
    garden,
    moodTrend,
    weeklyTasksCompleted: taskProgress?.completed || 0,
  };
}

async function removeChild(parentId, childId) {
  const relation = await queryOne(
    'SELECT id FROM parent_student_relations WHERE parent_id = :parentId AND student_id = :childId',
    { parentId, childId }
  );
  if (!relation) throw new ForbiddenError('این دانش‌آموز در فرزندان شما نیست');

  await query(
    'DELETE FROM parent_student_relations WHERE parent_id = :parentId AND student_id = :childId',
    { parentId, childId }
  );
  return { removed: true };
}

module.exports = { register, addChild, listChildren, getChildReport, removeChild };
