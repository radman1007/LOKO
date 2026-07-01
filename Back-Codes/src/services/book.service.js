const { query, queryOne, withTransaction } = require('../database/connection');
const { NotFoundError } = require('../utils/errors');

// کتاب‌های دانش‌آموز: کتاب‌های کلاس‌هایی که عضو است + کتاب‌های عمومی (class_id NULL)
// game_count = تعداد بازی‌های فعال هر کتاب (برای تصمیم‌گیری در فرانت)
async function getMyBooks(userId) {
  return query(
    `SELECT DISTINCT b.id, b.title, b.description, b.cover_url,
            b.coin_reward, b.class_id, b.sort_order,
            (SELECT COUNT(*) FROM book_games g
              WHERE g.book_id = b.id AND g.is_active = 1 AND g.deleted_at IS NULL) AS game_count
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

// لیست بازی‌های یک کتاب — با وضعیت تکمیل برای کاربر (برای قفل ترتیبی)
async function getBookGames(bookId, userId = null) {
  const book = await getBook(bookId);
  const games = await query(
    `SELECT g.id, g.book_id, g.title, g.description, g.cover_url, g.game_url,
            g.game_type, g.coin_reward, g.sort_order,
            ${userId != null
              ? `(SELECT COUNT(*) FROM book_completions bc
                   WHERE bc.book_game_id = g.id AND bc.user_id = :userId) > 0`
              : '0'} AS completed
     FROM book_games g
     WHERE g.book_id = :bookId AND g.is_active = 1 AND g.deleted_at IS NULL
     ORDER BY g.sort_order, g.id`,
    userId != null ? { bookId, userId } : { bookId }
  );
  return {
    book: { id: book.id, title: book.title, cover_url: book.cover_url },
    games: games.map((g) => ({ ...g, completed: !!Number(g.completed) })),
  };
}

async function getGame(gameId) {
  const game = await queryOne(
    `SELECT g.*, b.title AS book_title FROM book_games g
     JOIN books b ON b.id = g.book_id
     WHERE g.id = :gameId AND g.is_active = 1 AND g.deleted_at IS NULL`,
    { gameId }
  );
  if (!game) throw new NotFoundError('Game');
  return {
    id: game.id,
    bookId: game.book_id,
    bookTitle: game.book_title,
    title: game.title,
    gameUrl: game.game_url,
    gameType: game.game_type,
    coinReward: game.coin_reward,
  };
}

// پایان یک بازی → اعطای سکه + ثبت تکمیل + پیشنهاد بازی بعدیِ همان کتاب
async function completeGame(userId, gameId, { score = null } = {}) {
  const game = await queryOne(
    `SELECT * FROM book_games WHERE id = :gameId AND is_active = 1 AND deleted_at IS NULL`,
    { gameId }
  );
  if (!game) throw new NotFoundError('Game');

  // اجرای مرحله‌ای: بازی قبلیِ همان کتاب باید کامل شده باشد (بازی اول همیشه آزاد)
  const prev = await queryOne(
    `SELECT id FROM book_games
     WHERE book_id = :bookId AND is_active = 1 AND deleted_at IS NULL
       AND (sort_order, id) < (:sortOrder, :gameId)
     ORDER BY sort_order DESC, id DESC LIMIT 1`,
    { bookId: game.book_id, sortOrder: game.sort_order, gameId: game.id }
  );
  if (prev) {
    const prevDone = await queryOne(
      'SELECT id FROM book_completions WHERE book_game_id = :pid AND user_id = :userId LIMIT 1',
      { pid: prev.id, userId }
    );
    if (!prevDone) {
      const { ForbiddenError } = require('../utils/errors');
      throw new ForbiddenError('برای این بازی ابتدا باید بازی قبلی را کامل کنی');
    }
  }

  return withTransaction(async (conn) => {
    const coins = game.coin_reward || 0;

    await conn.execute(
      `INSERT INTO book_completions (book_id, book_game_id, user_id, score, coins_awarded)
       VALUES (?, ?, ?, ?, ?)`,
      [game.book_id, game.id, userId, score, coins]
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
      [userId, wallet.id, coins, newBalance, game.id]
    );
    await conn.execute(
      'UPDATE student_profiles SET total_tokens = ? WHERE user_id = ?',
      [newBalance, userId]
    );

    // بازی بعدیِ همان کتاب
    const [nextRows] = await conn.execute(
      `SELECT id, title, cover_url FROM book_games
       WHERE book_id = ? AND is_active = 1 AND deleted_at IS NULL AND (sort_order, id) > (?, ?)
       ORDER BY sort_order, id LIMIT 1`,
      [game.book_id, game.sort_order, game.id]
    );

    return {
      coinsAwarded: coins,
      coinBalance: newBalance,
      nextGame: nextRows[0] || null,
    };
  });
}

// ─── مدیریت کتاب‌ها (ادمین) ───
async function listAll({ classId = null } = {}) {
  let where = 'WHERE b.deleted_at IS NULL';
  const params = {};
  if (classId) { where += ' AND b.class_id = :classId'; params.classId = classId; }
  return query(
    `SELECT b.*,
            (SELECT COUNT(*) FROM book_games g
              WHERE g.book_id = b.id AND g.is_active = 1 AND g.deleted_at IS NULL) AS game_count
     FROM books b ${where} ORDER BY b.sort_order, b.id`,
    params
  );
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

// ─── مدیریت بازی‌های یک کتاب (ادمین) ───
async function createGame(bookId, data) {
  await getBook(bookId);
  const result = await query(
    `INSERT INTO book_games (book_id, title, description, cover_url, game_url, game_type, coin_reward, sort_order)
     VALUES (:bookId, :title, :description, :coverUrl, :gameUrl, :gameType, :coinReward, :sortOrder)`,
    {
      bookId,
      title: data.title,
      description: data.description || null,
      coverUrl: data.coverUrl || null,
      gameUrl: data.gameUrl || null,
      gameType: data.gameType || 'web',
      coinReward: data.coinReward != null ? data.coinReward : 10,
      sortOrder: data.sortOrder || 0,
    }
  );
  return getGame(result.insertId);
}

async function updateGame(gameId, data) {
  const existing = await queryOne('SELECT id FROM book_games WHERE id = :id AND deleted_at IS NULL', { id: gameId });
  if (!existing) throw new NotFoundError('Game');
  await query(
    `UPDATE book_games SET title = :title, description = :description, cover_url = :coverUrl,
       game_url = :gameUrl, game_type = :gameType, coin_reward = :coinReward, sort_order = :sortOrder,
       updated_at = NOW()
     WHERE id = :id`,
    {
      id: gameId,
      title: data.title,
      description: data.description || null,
      coverUrl: data.coverUrl || null,
      gameUrl: data.gameUrl || null,
      gameType: data.gameType || 'web',
      coinReward: data.coinReward != null ? data.coinReward : 10,
      sortOrder: data.sortOrder || 0,
    }
  );
  return getGame(gameId);
}

async function removeGame(gameId) {
  const existing = await queryOne('SELECT id FROM book_games WHERE id = :id AND deleted_at IS NULL', { id: gameId });
  if (!existing) throw new NotFoundError('Game');
  await query('UPDATE book_games SET deleted_at = NOW(), is_active = 0 WHERE id = :id', { id: gameId });
  return { deleted: true };
}

module.exports = {
  getMyBooks, getMyClasses, getBook, getBookGames, getGame, completeGame,
  listAll, create, update, remove,
  createGame, updateGame, removeGame,
};
