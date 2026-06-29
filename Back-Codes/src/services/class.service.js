const { query, queryOne } = require('../database/connection');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

async function list(schoolId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const classes = await query(
    `SELECT c.*, COUNT(cs.id) AS student_count
     FROM classes c
     LEFT JOIN class_students cs ON cs.class_id = c.id AND cs.is_visible = 1
     WHERE c.school_id = :schoolId AND c.deleted_at IS NULL
     GROUP BY c.id
     ORDER BY c.name LIMIT :limit OFFSET :offset`,
    { schoolId, limit, offset }
  );
  return { classes, page, limit };
}

async function getById(id, schoolId = null) {
  const cls = await queryOne(
    'SELECT * FROM classes WHERE id = :id AND deleted_at IS NULL',
    { id }
  );
  if (!cls) throw new NotFoundError('Class');
  if (schoolId && cls.school_id !== schoolId) throw new ForbiddenError('Access denied');

  const students = await query(
    `SELECT u.id, u.first_name, u.last_name, u.username
     FROM class_students cs JOIN users u ON u.id = cs.student_id
     WHERE cs.class_id = :id AND cs.is_visible = 1 AND u.deleted_at IS NULL`,
    { id }
  );
  const teachers = await query(
    `SELECT u.id, u.first_name, u.last_name, ct.is_primary
     FROM class_teachers ct JOIN users u ON u.id = ct.teacher_id
     WHERE ct.class_id = :id`,
    { id }
  );

  return { ...cls, students, teachers };
}

async function create(data, schoolId) {
  const result = await query(
    `INSERT INTO classes (school_id, name, grade, academic_year) VALUES (:schoolId, :name, :grade, :year)`,
    { schoolId, name: data.name, grade: data.grade, year: data.academicYear }
  );
  return getById(result.insertId);
}

module.exports = { list, getById, create };
