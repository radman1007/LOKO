// Seed: کتاب‌ها و بازی‌های واقعی کلاس اول (idempotent)
// بازی‌ها فایل‌های HTML واقعی در فرانت (public/games) هستند و از طریق مرورگر لود می‌شوند.
const { createPool, query, queryOne, closePool } = require('../connection');
const logger = require('../../utils/logger');

const BOOKS = [
  {
    title: 'ریاضی اول', desc: 'بازی‌های آموزش ریاضی کلاس اول', coin: 10, sort: 1,
    games: [
      { title: 'جزیره حیوانات',       coin: 10, url: '/games/math-first-grade-game-one.html' },
      { title: 'قطار اعداد',          coin: 10, url: '/games/math-first-grade-game-two.html' },
      { title: 'شکارچی کوچک',         coin: 10, url: '/games/math-first-grade-game-three.html' },
      { title: 'هیولاهای گرسنه',      coin: 12, url: '/games/math-first-grade-game-four.html' },
      { title: 'آشپز کوچولو',         coin: 12, url: '/games/math-first-grade-game-five.html' },
      { title: 'سفر ریتم',            coin: 12, url: '/games/math-first-grade-game-six.html' },
      { title: 'خرگوش مهربان',        coin: 14, url: '/games/math-first-grade-game-seven.html' },
      { title: 'یادگیری اعداد فارسی', coin: 14, url: '/games/math-first-grade-game-eight.html' },
      { title: 'حدس اعداد فضایی',     coin: 15, url: '/games/math-first-grade-game-nine.html' },
      { title: 'سفر ریاضی',           coin: 15, url: '/games/math-first-grade-game-ten.html' },
    ],
  },
  {
    title: 'علوم اول', desc: 'بازی‌های آموزش علوم کلاس اول', coin: 12, sort: 2,
    games: [
      { title: 'یادگیری سایه',        coin: 12, url: '/games/science-first-grade-game-one.html' },
      { title: 'آزمایشگاه گوجه',      coin: 12, url: '/games/science-first-grade-game-two.html' },
      { title: 'آزمایشگاه جادویی آب', coin: 14, url: '/games/science-first-grade-game-three.html' },
    ],
  },
  {
    title: 'قرآن اول', desc: 'بازی آموزش قرآن کلاس اول', coin: 15, sort: 3,
    games: [
      { title: 'قطار قرآن — سوره توحید', coin: 15, url: '/games/quran-first-grade-game-one.html' },
    ],
  },
  {
    title: 'نگارش اول', desc: 'بازی نگارش کلاس اول', coin: 15, sort: 4,
    games: [
      { title: 'نگارش حرف سین', coin: 15, url: '/games/writing-first-grade-game-four.html' },
    ],
  },
];

async function seedFirstGrade() {
  await createPool();

  // غیرفعال‌کردن کتاب‌های نمونه‌ی قدیمی با URL آزمایشی
  await query(
    `UPDATE books SET is_active = 0, deleted_at = NOW()
     WHERE game_url LIKE 'https://example.com/%' AND deleted_at IS NULL`
  );

  for (const b of BOOKS) {
    // upsert کتاب بر اساس عنوان (کتاب عمومی: class_id = NULL)
    let book = await queryOne(
      'SELECT id FROM books WHERE title = :title AND deleted_at IS NULL',
      { title: b.title }
    );
    if (!book) {
      const res = await query(
        `INSERT INTO books (class_id, grade, title, description, coin_reward, sort_order, is_active)
         VALUES (NULL, 'اول', :title, :desc, :coin, :sort, 1)`,
        { title: b.title, desc: b.desc, coin: b.coin, sort: b.sort }
      );
      book = { id: res.insertId };
    } else {
      await query("UPDATE books SET is_active = 1, deleted_at = NULL, grade = 'اول', sort_order = :sort WHERE id = :id",
        { sort: b.sort, id: book.id });
    }

    // درج بازی‌ها به ترتیب (idempotent بر اساس book_id + game_url)
    let order = 0;
    for (const g of b.games) {
      const exists = await queryOne(
        'SELECT id FROM book_games WHERE book_id = :bid AND game_url = :url',
        { bid: book.id, url: g.url }
      );
      if (!exists) {
        await query(
          `INSERT INTO book_games (book_id, title, game_url, game_type, coin_reward, sort_order, is_active)
           VALUES (:bid, :title, :url, 'web', :coin, :sort, 1)`,
          { bid: book.id, title: g.title, url: g.url, coin: g.coin, sort: order }
        );
      } else {
        await query(
          'UPDATE book_games SET title = :title, coin_reward = :coin, sort_order = :sort, is_active = 1, deleted_at = NULL WHERE id = :id',
          { title: g.title, coin: g.coin, sort: order, id: exists.id }
        );
      }
      order += 1;
    }
    logger.info(`Seeded book: ${b.title} (${b.games.length} games)`);
  }

  await closePool();
  logger.info('First-grade books & games seeded successfully');
}

if (require.main === module) {
  seedFirstGrade()
    .then(() => process.exit(0))
    .catch((err) => { logger.error('Seed failed', { error: err.message }); process.exit(1); });
}

module.exports = { seedFirstGrade };
