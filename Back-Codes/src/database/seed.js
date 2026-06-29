const { createPool, query, closePool } = require('./connection');
const { hashPassword } = require('../utils/crypto');
const logger = require('../utils/logger');

async function seed() {
  await createPool();

  const roles = [
    { slug: 'team_admin', name: 'Team Admin' },
    { slug: 'school_admin', name: 'School Admin' },
    { slug: 'teacher', name: 'Teacher' },
    { slug: 'student', name: 'Student' },
    { slug: 'parent', name: 'Parent' },
  ];

  for (const role of roles) {
    await query(
      'INSERT IGNORE INTO roles (slug, name, description) VALUES (:slug, :name, :desc)',
      { slug: role.slug, name: role.name, desc: `${role.name} role` }
    );
  }

  const moods = [
    { slug: 'good', label_fa: 'خوب', label_en: 'Good', sort: 1 },
    { slug: 'normal', label_fa: 'معمولی', label_en: 'Normal', sort: 2 },
    { slug: 'bad', label_fa: 'بد', label_en: 'Bad', sort: 3 },
  ];

  for (const mood of moods) {
    await query(
      'INSERT IGNORE INTO moods (slug, label_fa, label_en, sort_order) VALUES (:slug, :fa, :en, :sort)',
      { slug: mood.slug, fa: mood.label_fa, en: mood.label_en, sort: mood.sort }
    );
  }

  const methods = [
    { slug: 'audio_learning', name_fa: 'یادگیری صوتی', name_en: 'Audio Learning' },
    { slug: 'video_learning', name_fa: 'یادگیری ویدیویی', name_en: 'Video Learning' },
    { slug: 'game_learning', name_fa: 'یادگیری بازی‌محور', name_en: 'Game Learning' },
    { slug: 'interactive_books', name_fa: 'کتاب‌های تعاملی', name_en: 'Interactive Books' },
  ];

  for (const method of methods) {
    await query(
      'INSERT IGNORE INTO educational_methods (slug, name_fa, name_en) VALUES (:slug, :fa, :en)',
      { slug: method.slug, fa: method.name_fa, en: method.name_en }
    );
  }

  const badges = [
    { slug: 'first_task', name_fa: 'اولین تسک', criteria_type: 'tasks', criteria_value: 1 },
    { slug: 'task_master_10', name_fa: '۱۰ تسک', criteria_type: 'tasks', criteria_value: 10 },
    { slug: 'point_collector_100', name_fa: '۱۰۰ امتیاز', criteria_type: 'points', criteria_value: 100 },
    { slug: 'point_collector_500', name_fa: '۵۰۰ امتیاز', criteria_type: 'points', criteria_value: 500 },
  ];

  for (const badge of badges) {
    await query(
      `INSERT IGNORE INTO badge_definitions (slug, name_fa, name_en, criteria_type, criteria_value)
       VALUES (:slug, :fa, :en, :type, :value)`,
      { slug: badge.slug, fa: badge.name_fa, en: badge.slug, type: badge.criteria_type, value: badge.criteria_value }
    );
  }

  const categories = [
    { slug: 'motivational', name_fa: 'انگیزشی', name_en: 'Motivational', type: 'podcast', mood: 'good' },
    { slug: 'educational', name_fa: 'آموزشی', name_en: 'Educational', type: 'podcast', mood: 'normal' },
    { slug: 'calming', name_fa: 'آرامش‌بخش', name_en: 'Calming', type: 'podcast', mood: 'bad' },
    { slug: 'general_video', name_fa: 'عمومی', name_en: 'General', type: 'video', mood: null },
  ];

  for (const cat of categories) {
    await query(
      `INSERT IGNORE INTO content_categories (slug, name_fa, name_en, content_type, mood_slug)
       VALUES (:slug, :fa, :en, :type, :mood)`,
      { slug: cat.slug, fa: cat.name_fa, en: cat.name_en, type: cat.type, mood: cat.mood }
    );
  }

  const existingAdmin = await query('SELECT id FROM users WHERE username = :u', { u: 'loko_admin' });
  if (existingAdmin.length === 0) {
    const password = 'Admin@12345';
    const hash = await hashPassword(password);
    await query(
      `INSERT INTO users (role_id, username, password_hash, plain_password, first_name, last_name)
       VALUES (1, 'loko_admin', :hash, :plain, 'Loko', 'Admin')`,
      { hash, plain: password }
    );
    logger.info('Team Admin created: loko_admin / Admin@12345');
  }

  await closePool();
  logger.info('Seed data applied successfully');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Seed failed', { error: err.message });
      process.exit(1);
    });
}

module.exports = { seed };
