const { query, queryOne, withTransaction } = require('../database/connection');
const { generateUsername, generateSecurePassword, hashPassword } = require('../utils/crypto');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { ROLES } = require('../config/permissions');
const auditService = require('./audit.service');

// بررسی کنید که ROLE_IDS درست تعریف شده باشد
const ROLE_IDS = {
  team_admin: 1,
  school_admin: 2,
  teacher: 3,
  student: 4,
  parent: 5,
};

async function list(schoolId, { role = null, page = 1, limit = 20, includeDeleted = false } = {}) {
  const offset = (page - 1) * limit;
  let where = 'WHERE u.school_id = ?';
  const params = [schoolId];

  if (!includeDeleted) where += ' AND u.deleted_at IS NULL';
  if (role) {
    where += ' AND r.slug = ?';
    params.push(role);
  }

  const users = await query(
    `SELECT u.id, u.username, u.first_name, u.last_name, u.is_active, r.slug AS role, u.created_at
     FROM users u JOIN roles r ON r.id = u.role_id
     ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  
  const [countRow] = await query(
    `SELECT COUNT(*) AS total FROM users u JOIN roles r ON r.id = u.role_id ${where}`,
    params
  );
  
  return { users, total: countRow?.total || 0, page, limit };
}

async function getById(id, schoolId = null) {
  let sql = `SELECT u.*, r.slug AS role_slug FROM users u
             JOIN roles r ON r.id = u.role_id WHERE u.id = ? AND u.deleted_at IS NULL`;
  const user = await queryOne(sql, [id]);
  if (!user) throw new NotFoundError('User');
  if (schoolId && user.school_id !== schoolId) throw new ForbiddenError('Access denied');
  return user;
}

async function getPassword(id, schoolId, actorRole) {
  if (!['team_admin', 'school_admin'].includes(actorRole)) {
    throw new ForbiddenError('Cannot view passwords');
  }
  const user = await getById(id, schoolId);
  return { userId: user.id, username: user.username, password: user.plain_password };
}

async function create(data, schoolId, createdBy) {
  const school = await queryOne('SELECT code FROM schools WHERE id = ?', [schoolId]);
  if (!school) throw new NotFoundError('School');

  const roleId = ROLE_IDS[data.role];
  if (!roleId || data.role === ROLES.TEAM_ADMIN) {
    throw new ForbiddenError('Invalid role for school user');
  }

  return withTransaction(async (conn) => {
    let username;

    if (data.username && data.username.trim()) {
      // نام کاربری دستی و معنی‌دار
      username = data.username.trim().toLowerCase();
      if (!/^[a-z0-9_.]+$/.test(username)) {
        throw new ForbiddenError('نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، نقطه و _ باشد');
      }
      const [rows] = await conn.execute('SELECT id FROM users WHERE username = ?', [username]);
      if (rows.length > 0) throw new ForbiddenError('این نام کاربری قبلاً استفاده شده است');
    } else {
      // تولید خودکار بر اساس نام + کد مدرسه
      let sequence = 1;
      let exists = true;
      while (exists) {
        username = generateUsername(data.firstName, data.lastName, school.code, sequence);
        const [rows] = await conn.execute('SELECT id FROM users WHERE username = ?', [username]);
        exists = rows.length > 0;
        sequence++;
      }
    }

    const password = data.password && data.password.trim() ? data.password.trim() : generateSecurePassword(10);
    const passwordHash = await hashPassword(password);

    // ✅ تصحیح: استفاده از ? به جای named parameters
    const [result] = await conn.execute(
      `INSERT INTO users (school_id, role_id, username, password_hash, plain_password, first_name, last_name, national_code, phone, email, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [schoolId, roleId, username, passwordHash, password, data.firstName, data.lastName,
        data.nationalCode || null, data.phone || null, data.email || null, createdBy]
    );
    const userId = result.insertId;

    if (data.role === ROLES.STUDENT) {
      await conn.execute('INSERT INTO student_profiles (user_id) VALUES (?)', [userId]);
      await conn.execute('INSERT INTO token_wallets (user_id, balance) VALUES (?, 0)', [userId]);
      await conn.execute('INSERT INTO garden_states (user_id) VALUES (?)', [userId]);
      if (data.classId) {
        await conn.execute('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)', [data.classId, userId]);
      }
    }

    await auditService.log({
      userId: createdBy,
      schoolId,
      action: 'user.create',
      entityType: 'user',
      entityId: userId,
      newValues: { username, role: data.role },
    });

    return { id: userId, username, password, role: data.role };
  });
}

// ویرایش کاربر (نام، نام‌کاربری دستی، تماس)
async function update(id, data, schoolId, actorId) {
  const user = await getById(id, schoolId);

  if (data.username && data.username.trim().toLowerCase() !== user.username) {
    const newUsername = data.username.trim().toLowerCase();
    if (!/^[a-z0-9_.]+$/.test(newUsername)) {
      throw new ForbiddenError('نام کاربری نامعتبر است');
    }
    const existing = await queryOne('SELECT id FROM users WHERE username = ? AND id <> ?', [newUsername, id]);
    if (existing) throw new ForbiddenError('این نام کاربری قبلاً استفاده شده است');
    await query('UPDATE users SET username = ? WHERE id = ?', [newUsername, id]);
  }

  await query(
    `UPDATE users SET first_name = ?, last_name = ?, national_code = ?, phone = ?, email = ?,
       is_active = ?, updated_at = NOW() WHERE id = ?`,
    [
      data.firstName != null ? data.firstName : user.first_name,
      data.lastName != null ? data.lastName : user.last_name,
      data.nationalCode != null ? data.nationalCode : user.national_code,
      data.phone != null ? data.phone : user.phone,
      data.email != null ? data.email : user.email,
      data.isActive != null ? (data.isActive ? 1 : 0) : user.is_active,
      id,
    ]
  );

  await auditService.log({
    userId: actorId,
    schoolId,
    action: 'user.update',
    entityType: 'user',
    entityId: id,
  });

  return getById(id, schoolId);
}

async function softDeleteStudent(studentId, schoolId, actorId) {
  const student = await getById(studentId, schoolId);
  if (student.role_slug !== ROLES.STUDENT) {
    throw new ForbiddenError('Only students can be soft-deleted this way');
  }

  await query('UPDATE users SET deleted_at = NOW(), is_active = 0 WHERE id = ?', [studentId]);
  await query(
    'UPDATE class_students SET is_visible = 0, deleted_at = NOW() WHERE student_id = ?',
    [studentId]
  );

  await auditService.log({
    userId: actorId,
    schoolId,
    action: 'user.soft_delete',
    entityType: 'user',
    entityId: studentId,
  });
}

module.exports = { list, getById, getPassword, create, update, softDeleteStudent, ROLE_IDS };