const { query, queryOne } = require('../database/connection');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const auditService = require('./audit.service');

async function list(schoolId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const classes = await query(
    `SELECT c.*, COUNT(cs.id) AS student_count
     FROM classes c
     LEFT JOIN class_students cs
       ON cs.class_id = c.id
      AND cs.is_visible = 1
     WHERE c.school_id = ?
       AND c.deleted_at IS NULL
     GROUP BY c.id
     ORDER BY c.name
     LIMIT ? OFFSET ?`,
    [schoolId, limit, offset]
  );

  return {
    classes,
    page,
    limit,
  };
}

async function getById(id, schoolId = null) {
  const cls = await queryOne(
    `SELECT * FROM classes WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );

  if (!cls) {
    throw new NotFoundError('Class');
  }

  if (schoolId && cls.school_id !== schoolId) {
    throw new ForbiddenError('Access denied');
  }

  const students = await query(
    `SELECT u.id, u.first_name, u.last_name, u.username
     FROM class_students cs
     JOIN users u ON u.id = cs.student_id
     WHERE cs.class_id = ? AND cs.is_visible = 1 AND u.deleted_at IS NULL`,
    [id]
  );

  const teachers = await query(
    `SELECT u.id, u.first_name, u.last_name, ct.is_primary
     FROM class_teachers ct
     JOIN users u ON u.id = ct.teacher_id
     WHERE ct.class_id = ?`,
    [id]
  );

  return {
    ...cls,
    students,
    teachers,
  };
}

async function create(data, schoolId) {
  const result = await query(
    `INSERT INTO classes (school_id, name, grade, academic_year)
     VALUES (?, ?, ?, ?)`,
    [
      schoolId,
      data.name,
      data.grade,
      data.academicYear,
    ]
  );

  return getById(result.insertId);
}

// ========== افزودن دانش‌آموز به کلاس ==========
async function addStudent(classId, studentId, actorId = null) {
  // بررسی وجود دانش‌آموز با استفاده از JOIN با جدول roles
  const student = await queryOne(
    `SELECT u.id 
     FROM users u 
     JOIN roles r ON r.id = u.role_id 
     WHERE u.id = ? AND r.slug = 'student' AND u.deleted_at IS NULL`,
    [studentId]
  );
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  // بررسی وجود کلاس
  const classData = await queryOne(
    'SELECT id FROM classes WHERE id = ? AND deleted_at IS NULL',
    [classId]
  );
  if (!classData) {
    throw new NotFoundError('Class not found');
  }

  // بررسی وجود دانش‌آموز در کلاس
  const exists = await queryOne(
    `SELECT id FROM class_students WHERE class_id = ? AND student_id = ?`,
    [classId, studentId]
  );

  if (exists) {
    await query(
      `UPDATE class_students SET is_visible = 1, deleted_at = NULL WHERE id = ?`,
      [exists.id]
    );
  } else {
    await query(
      `INSERT INTO class_students (class_id, student_id, is_visible)
       VALUES (?, ?, 1)`,
      [classId, studentId]
    );
  }

  // به‌روزرسانی class_id کاربر - اگر ستون class_id وجود نداره، این خط رو کامنت کنید
  // یا نام ستون صحیح رو جایگزین کنید
  try {
    await query(
      `UPDATE users SET class_id = ? WHERE id = ?`,
      [classId, studentId]
    );
  } catch (error) {
    // اگر ستون class_id وجود نداشت، خطا رو نادیده بگیر
    console.log('⚠️ ستون class_id در جدول users وجود ندارد، از به‌روزرسانی صرف‌نظر شد');
  }

  if (actorId) {
    await auditService.log({
      userId: actorId,
      action: 'class.add_student',
      entityType: 'class',
      entityId: classId,
      newValues: { studentId },
    });
  }

  return getById(classId);
}

// ========== افزودن معلم به کلاس ==========
async function addTeacher(classId, teacherId, isPrimary = false, actorId = null) {
  // بررسی وجود معلم با استفاده از JOIN با جدول roles
  const teacher = await queryOne(
    `SELECT u.id 
     FROM users u 
     JOIN roles r ON r.id = u.role_id 
     WHERE u.id = ? AND r.slug = 'teacher' AND u.deleted_at IS NULL`,
    [teacherId]
  );
  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  // بررسی وجود کلاس
  const classData = await queryOne(
    'SELECT id FROM classes WHERE id = ? AND deleted_at IS NULL',
    [classId]
  );
  if (!classData) {
    throw new NotFoundError('Class not found');
  }

  // بررسی وجود معلم در کلاس
  const exists = await queryOne(
    `SELECT id FROM class_teachers WHERE class_id = ? AND teacher_id = ?`,
    [classId, teacherId]
  );

  if (!exists) {
    await query(
      `INSERT INTO class_teachers (class_id, teacher_id, is_primary)
       VALUES (?, ?, ?)`,
      [classId, teacherId, isPrimary ? 1 : 0]
    );
  }

  // به‌روزرسانی class_id کاربر - اگر ستون class_id وجود نداره، این خط رو کامنت کنید
  // یا نام ستون صحیح رو جایگزین کنید
  try {
    await query(
      `UPDATE users SET class_id = ? WHERE id = ?`,
      [classId, teacherId]
    );
  } catch (error) {
    // اگر ستون class_id وجود نداشت، خطا رو نادیده بگیر
    console.log('⚠️ ستون class_id در جدول users وجود ندارد، از به‌روزرسانی صرف‌نظر شد');
  }

  if (actorId) {
    await auditService.log({
      userId: actorId,
      action: 'class.add_teacher',
      entityType: 'class',
      entityId: classId,
      newValues: { teacherId },
    });
  }

  return getById(classId);
}

// ========== حذف دانش‌آموز از کلاس ==========
async function removeStudent(classId, studentId, actorId = null) {
  await query(
    `UPDATE class_students SET is_visible = 0, deleted_at = NOW()
     WHERE class_id = ? AND student_id = ?`,
    [classId, studentId]
  );

  // به‌روزرسانی class_id کاربر
  try {
    await query(
      `UPDATE users SET class_id = NULL WHERE id = ?`,
      [studentId]
    );
  } catch (error) {
    console.log('⚠️ ستون class_id در جدول users وجود ندارد، از به‌روزرسانی صرف‌نظر شد');
  }

  if (actorId) {
    await auditService.log({
      userId: actorId,
      action: 'class.remove_student',
      entityType: 'class',
      entityId: classId,
      newValues: { studentId },
    });
  }

  return { success: true };
}

// ========== حذف معلم از کلاس ==========
async function removeTeacher(classId, teacherId, actorId = null) {
  await query(
    `DELETE FROM class_teachers WHERE class_id = ? AND teacher_id = ?`,
    [classId, teacherId]
  );

  try {
    await query(
      `UPDATE users SET class_id = NULL WHERE id = ?`,
      [teacherId]
    );
  } catch (error) {
    console.log('⚠️ ستون class_id در جدول users وجود ندارد، از به‌روزرسانی صرف‌نظر شد');
  }

  if (actorId) {
    await auditService.log({
      userId: actorId,
      action: 'class.remove_teacher',
      entityType: 'class',
      entityId: classId,
      newValues: { teacherId },
    });
  }

  return { success: true };
}

module.exports = {
  list,
  getById,
  create,
  addStudent,
  removeStudent,
  addTeacher,
  removeTeacher,
};