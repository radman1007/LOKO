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

  const dailyTasks = [
    { slug: 'mood_today', title: 'ثبت حال امروز', icon: 'mood', category: 'health', points: 5, tokens: 2 },
    { slug: 'breathing_today', title: 'یک تمرین تنفس انجام بده', icon: 'breath', category: 'health', points: 5, tokens: 2 },
    { slug: 'watch_video', title: 'یک ویدیوی آموزشی تماشا کن', icon: 'tv', category: 'learn', points: 8, tokens: 3 },
    { slug: 'play_game', title: 'یک بازی کتاب را کامل کن', icon: 'game', category: 'learn', points: 10, tokens: 5 },
    { slug: 'write_secret', title: 'یک راز در دفترچه بنویس', icon: 'secret', category: 'health', points: 3, tokens: 1 },
  ];
  for (const t of dailyTasks) {
    await query(
      `INSERT INTO daily_tasks (slug, title_fa, icon, category, points_reward, token_reward, is_active)
       VALUES (:slug, :title, :icon, :category, :points, :tokens, 1)
       ON DUPLICATE KEY UPDATE title_fa = VALUES(title_fa), icon = VALUES(icon),
         category = VALUES(category), points_reward = VALUES(points_reward), token_reward = VALUES(token_reward)`,
      t
    );
  }

  const rewards = [
    { slug: 'avatar_frame', title: 'قاب آواتار طلایی', desc: 'یک قاب ویژه برای پروفایل', cost: 50, sort: 1 },
    { slug: 'garden_seed', title: 'بذر کمیاب باغچه', desc: 'یک گیاه خاص در باغچه‌ات بکار', cost: 80, sort: 2 },
    { slug: 'sticker_pack', title: 'بسته استیکر لوکو', desc: 'مجموعه استیکرهای بامزه', cost: 30, sort: 3 },
    { slug: 'badge_booster', title: 'افزایش‌دهنده امتیاز', desc: 'امتیاز دو برابر برای یک روز', cost: 120, sort: 4 },
  ];
  for (const r of rewards) {
    await query(
      `INSERT INTO rewards (slug, title, description, cost_coins, sort_order, is_active)
       VALUES (:slug, :title, :desc, :cost, :sort, 1)
       ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description),
         cost_coins = VALUES(cost_coins), sort_order = VALUES(sort_order)`,
      r
    );
  }

  const books = [
    { title: 'ماجراهای جنگل', desc: 'یادگیری اعداد با حیوانات جنگل', game: 'https://example.com/games/jungle', cover: '/uploads/books/jungle.png', coin: 10, sort: 1 },
    { title: 'سفر به فضا', desc: 'آشنایی با سیارات', game: 'https://example.com/games/space', cover: '/uploads/books/space.png', coin: 15, sort: 2 },
    { title: 'دنیای رنگ‌ها', desc: 'یادگیری رنگ‌ها و شکل‌ها', game: 'https://example.com/games/colors', cover: '/uploads/books/colors.png', coin: 10, sort: 3 },
  ];
  const [bookCount] = await query('SELECT COUNT(*) AS cnt FROM books');
  if (bookCount.cnt === 0) {
    for (const b of books) {
      await query(
        `INSERT INTO books (class_id, title, description, game_url, cover_url, coin_reward, sort_order, is_active)
         VALUES (NULL, :title, :desc, :game, :cover, :coin, :sort, 1)`,
        b
      );
    }
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
