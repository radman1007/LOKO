-- ============================================================
-- Loko Platform - Migration 005
-- Books & Games, Rewards, per-secret passwords, task slugs,
-- garden wellbeing snapshots
-- MySQL 8.0+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── books ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  class_id    BIGINT UNSIGNED NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT NULL,
  cover_url   VARCHAR(500) NULL,
  game_url    VARCHAR(500) NULL,
  game_type   VARCHAR(50) NOT NULL DEFAULT 'web',
  coin_reward SMALLINT UNSIGNED NOT NULL DEFAULT 10,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at  TIMESTAMP NULL DEFAULT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_books_class (class_id),
  KEY idx_books_active (is_active),
  CONSTRAINT fk_books_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── book_completions (game finished) ───────────────────────
CREATE TABLE IF NOT EXISTS book_completions (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_id     BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  score       INT UNSIGNED NULL,
  coins_awarded SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bc_user (user_id),
  KEY idx_bc_book (book_id),
  CONSTRAINT fk_bc_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT fk_bc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── rewards (Loko Club shop) ───────────────────────────────
CREATE TABLE IF NOT EXISTS rewards (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(80) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT NULL,
  icon_url    VARCHAR(500) NULL,
  cost_coins  INT UNSIGNED NOT NULL DEFAULT 0,
  stock       INT NULL DEFAULT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_rewards_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── reward_redemptions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  reward_id   BIGINT UNSIGNED NOT NULL,
  cost_coins  INT UNSIGNED NOT NULL,
  status      ENUM('pending','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rr_user (user_id),
  CONSTRAINT fk_rr_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  CONSTRAINT fk_rr_reward FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── per-secret password ────────────────────────────────────
ALTER TABLE secrets
  ADD COLUMN title VARCHAR(200) NULL AFTER user_id,
  ADD COLUMN password_hash VARCHAR(255) NULL;

-- ─── daily_tasks: slug for idempotent seeding + icon ────────
ALTER TABLE daily_tasks
  ADD COLUMN slug VARCHAR(80) NULL,
  ADD COLUMN icon VARCHAR(50) NULL,
  ADD COLUMN category VARCHAR(50) NULL,
  ADD UNIQUE KEY uk_daily_tasks_slug (slug);

-- ─── relax content file_url so admin can create metadata-only ─
ALTER TABLE videos   MODIFY COLUMN file_url VARCHAR(500) NULL;
ALTER TABLE podcasts MODIFY COLUMN file_url VARCHAR(500) NULL;

-- ─── wellbeing snapshots ────────────────────────────────────
CREATE TABLE IF NOT EXISTS wellbeing_snapshots (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  score       TINYINT UNSIGNED NOT NULL,
  mood_factor DECIMAL(5,2) NULL,
  breathing_factor DECIMAL(5,2) NULL,
  garden_factor DECIMAL(5,2) NULL,
  snapshot_date DATE NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ws_user_date (user_id, snapshot_date),
  CONSTRAINT fk_ws_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
