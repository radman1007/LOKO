const { query, queryOne, withTransaction } = require('../database/connection');
const { NotFoundError } = require('../utils/errors');

// کتاب‌های دانش‌آموز: کتاب‌های کلاس‌هایی که عضو است + کتاب‌های عمومی (class_id NULL)
async function getMyBooks(userId) {
  return query(
    `SELECT DISTINCT b.id, b.title, b.description, b.cover_url, b.game_url,
            b.game_type, b.coin_reward, b.class_id, b.sort_order
     FROM books b
     LEFT JOIN class_students cs
       ON cs.class_id = b.class_id AND cs.student_id = :userId AND cs.is_visible = 1
     WHERE b.is_active = 1 AND b.deleted_at IS NULL
       AND (b.class_id IS NULL OR cs.id IS NOT NULL)
     ORDER BY b.sort_order, b.id`,
    { userId }
  );
}

// کلاس‌های دانش‌آموز جاری
async function getMyClasses(userId) {
  return query(
    `SELECT c.id, c.name, c.grade, c.academic_year, s.name AS school_name
     FROM class_students cs
     JOIN classes c ON c.id = cs.class_id
     LEFT JOIN schools s ON s.id = c.school_id
     WHERE cs.student_id = :userId AND cs.is_visible = 1 AND c.deleted_at IS NULL`,
    { userId }
  );
}

async function getBook(id) {
  const book = await queryOne(
    'SELECT * FROM books WHERE id = :id AND deleted_at IS NULL',
    { id }
  );
  if (!book) throw new NotFoundError('Book');
  return book;
}

async function getBookGame(id) {
  const book = await getBook(id);
  return {
    bookId: book.id,
    title: book.title,
    gameUrl: book.game_url,
    gameType: book.game_type,
    coinReward: book.coin_reward,
  };
}

// پایان بازی → اعطای سکه + ثبت تکمیل + پیشنهاد بازی بعدی
async function completeGame(userId, bookId, { score = null } = {}) {
  const book = await getBook(bookId);

  return withTransaction(async (conn) => {
    const coins = book.coin_reward || 0;

    await conn.execute(
      `INSERT INTO book_completions (book_id, user_id, score, coins_awarded)
       VALUES (?, ?, ?, ?)`,
      [bookId, userId, score, coins]
    );

    // اطمینان از وجود کیف پول و اعطای سکه
    let [walletRows] = await conn.execute(
      'SELECT id, balance FROM token_wallets WHERE user_id = ?',
      [userId]
    );
    if (walletRows.length === 0) {
      await conn.execute('INSERT INTO token_wallets (user_id, balance) VALUES (?, 0)', [userId]);
      [walletRows] = await conn.execute('SELECT id, balance FROM token_wallets WHERE user_id = ?', [userId]);
    }
    const wallet = walletRows[0];
    const newBalance = wallet.balance + coins;

    await conn.execute('UPDATE token_wallets SET balance = ? WHERE user_id = ?', [newBalance, userId]);
    await conn.execute(
      `INSERT INTO token_transactions (user_id, wallet_id, amount, balance_after, source_type, source_id)
       VALUES (?, ?, ?, ?, 'book_game', ?)`,
      [userId, wallet.id, coins, newBalance, bookId]
    );
    await conn.execute(
      'UPDATE student_profiles SET total_tokens = ? WHERE user_id = ?',
      [newBalance, userId]
    );

    // بازی بعدی (همان مجموعه کتاب‌های قابل‌دسترس)
    const [nextRows] = await conn.execute(
      `SELECT b.id, b.title, b.cover_url FROM books b
       WHERE b.is_active = 1 AND b.deleted_at IS NULL AND b.id <> ?
         AND (b.class_id IS NULL OR b.class_id IN
              (SELECT class_id FROM class_students WHERE student_id = ? AND is_visible = 1))
       ORDER BY b.sort_order, b.id LIMIT 1`,
      [bookId, userId]
    );

    return {
      coinsAwarded: coins,
      coinBalance: newBalance,
      nextBook: nextRows[0] || null,
    };
  });
}

// ─── مدیریت کتاب‌ها (ادمین) ───
async function listAll({ classId = null } = {}) {
  let where = 'WHERE b.deleted_at IS NULL';
  const params = {};
  if (classId) { where += ' AND b.class_id = :classId'; params.classId = classId; }
  return query(`SELECT * FROM books b ${where} ORDER BY b.sort_order, b.id`, params);
}

async function create(data) {
  const result = await query(
    `INSERT INTO books (class_id, title, description, cover_url, game_url, game_type, coin_reward, sort_order)
     VALUES (:classId, :title, :description, :coverUrl, :gameUrl, :gameType, :coinReward, :sortOrder)`,
    {
      classId: data.classId || null,
      title: data.title,
      description: data.description || null,
      coverUrl: data.coverUrl || null,
      gameUrl: data.gameUrl || null,
      gameType: data.gameType || 'web',
      coinReward: data.coinReward != null ? data.coinReward : 10,
      sortOrder: data.sortOrder || 0,
    }
  );
  return getBook(result.insertId);
}

async function update(id, data) {
  await getBook(id);
  await query(
    `UPDATE books SET title = :title, description = :description, cover_url = :coverUrl,
       game_url = :gameUrl, game_type = :gameType, coin_reward = :coinReward,
       class_id = :classId, sort_order = :sortOrder, updated_at = NOW()
     WHERE id = :id`,
    {
      id,
      title: data.title,
      description: data.description || null,
      coverUrl: data.coverUrl || null,
      gameUrl: data.gameUrl || null,
      gameType: data.gameType || 'web',
      coinReward: data.coinReward != null ? data.coinReward : 10,
      classId: data.classId || null,
      sortOrder: data.sortOrder || 0,
    }
  );
  return getBook(id);
}

async function remove(id) {
  await getBook(id);
  await query('UPDATE books SET deleted_at = NOW(), is_active = 0 WHERE id = :id', { id });
  return { deleted: true };
}

module.exports = {
  getMyBooks, getMyClasses, getBook, getBookGame, completeGame,
  listAll, create, update, remove,
};
