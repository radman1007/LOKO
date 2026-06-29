const { query, queryOne } = require('../database/connection');
const { ForbiddenError } = require('../utils/errors');

async function getSchoolStats(schoolId) {
  const [students] = await query(
    `SELECT COUNT(*) AS cnt FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.school_id = :schoolId AND r.slug = 'student' AND u.deleted_at IS NULL`,
    { schoolId }
  );
  const [teachers] = await query(
    `SELECT COUNT(*) AS cnt FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.school_id = :schoolId AND r.slug = 'teacher' AND u.deleted_at IS NULL`,
    { schoolId }
  );
  const [classes] = await query(
    'SELECT COUNT(*) AS cnt FROM classes WHERE school_id = :schoolId AND deleted_at IS NULL',
    { schoolId }
  );
  const moodStats = await query(
    `SELECT m.slug, COUNT(*) AS cnt FROM mood_checkins mc
     JOIN moods m ON m.id = mc.mood_id
     JOIN users u ON u.id = mc.user_id
     WHERE u.school_id = :schoolId AND mc.checkin_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     GROUP BY m.slug`,
    { schoolId }
  );

  return {
    studentCount: students.cnt,
    teacherCount: teachers.cnt,
    classCount: classes.cnt,
    moodDistribution30d: moodStats,
  };
}

async function getGlobalStats() {
  const [schools] = await query('SELECT COUNT(*) AS cnt FROM schools WHERE deleted_at IS NULL');
  const [users] = await query('SELECT COUNT(*) AS cnt FROM users WHERE deleted_at IS NULL');
  const [tickets] = await query("SELECT COUNT(*) AS cnt FROM tickets WHERE status = 'open'");
  return { schoolCount: schools.cnt, userCount: users.cnt, openTickets: tickets.cnt };
}

async function getClassReport(teacherId, classId) {
  const assignment = await queryOne(
    'SELECT id FROM class_teachers WHERE class_id = :classId AND teacher_id = :teacherId',
    { classId, teacherId }
  );
  if (!assignment) throw new ForbiddenError('Not assigned to this class');

  const students = await query(
    `SELECT u.id, u.first_name, u.last_name, sp.total_points, sp.garden_level
     FROM class_students cs
     JOIN users u ON u.id = cs.student_id
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     WHERE cs.class_id = :classId AND cs.is_visible = 1 AND u.deleted_at IS NULL`,
    { classId }
  );

  const methodStats = await query(
    `SELECT em.name_fa, SUM(ms.usage_count) AS usage, AVG(ms.engagement_rate) AS engagement
     FROM method_statistics ms
     JOIN educational_methods em ON em.id = ms.method_id
     JOIN class_students cs ON cs.student_id = ms.user_id
     WHERE cs.class_id = :classId
     GROUP BY em.id`,
    { classId }
  );

  return { students, methodStats };
}

async function getChildReport(parentId, childId) {
  const relation = await queryOne(
    'SELECT id FROM parent_student_relations WHERE parent_id = :parentId AND student_id = :childId',
    { parentId, childId }
  );
  if (!relation) throw new ForbiddenError('Not your child');

  const profile = await queryOne(
    `SELECT u.first_name, u.last_name, sp.total_points, sp.garden_level
     FROM users u JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = :childId`,
    { childId }
  );

  const moodTrend = await query(
    `SELECT mc.checkin_date, m.slug AS mood FROM mood_checkins mc
     JOIN moods m ON m.id = mc.mood_id
     WHERE mc.user_id = :childId AND mc.checkin_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
     ORDER BY mc.checkin_date`,
    { childId }
  );

  const taskProgress = await queryOne(
    `SELECT COUNT(*) AS completed FROM task_completions
     WHERE user_id = :childId AND completion_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
    { childId }
  );

  return { profile, moodTrend, weeklyTasksCompleted: taskProgress.completed };
}

module.exports = { getSchoolStats, getGlobalStats, getClassReport, getChildReport };
