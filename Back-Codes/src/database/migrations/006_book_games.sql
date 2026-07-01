-- ============================================================
-- Loko Platform - Migration 006
-- هر کتاب می‌تواند چند بازی داشته باشد (book_games)
-- MySQL 8.0+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── book_games: بازی‌های هر کتاب ───────────────────────────
CREATE TABLE IF NOT EXISTS book_games (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_id      BIGINT UNSIGNED NOT NULL,
  title        VARCHAR(200) NOT NULL,
  description  TEXT NULL,
  cover_url    VARCHAR(500) NULL,
  game_url     VARCHAR(500) NULL,
  game_type    VARCHAR(50) NOT NULL DEFAULT 'web',
  coin_reward  SMALLINT UNSIGNED NOT NULL DEFAULT 10,
  sort_order   INT NOT NULL DEFAULT 0,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at   TIMESTAMP NULL DEFAULT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_book_games_book (book_id),
  KEY idx_book_games_active (is_active),
  CONSTRAINT fk_book_games_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── انتقال بازی فعلی هر کتاب به‌عنوان اولین بازی ─────────────
INSERT INTO book_games (book_id, title, cover_url, game_url, game_type, coin_reward, sort_order)
SELECT b.id, b.title, b.cover_url, b.game_url, b.game_type, b.coin_reward, 0
FROM books b
WHERE b.game_url IS NOT NULL AND b.game_url <> ''
  AND b.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM book_games g WHERE g.book_id = b.id);

-- ─── ثبت تکمیل به تفکیک بازی ─────────────────────────────────
ALTER TABLE book_completions
  ADD COLUMN book_game_id BIGINT UNSIGNED NULL AFTER book_id;

SET FOREIGN_KEY_CHECKS = 1;
