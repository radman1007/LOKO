-- ============================================================
-- Loko Platform - Migration 004
-- Add content tables: videos, podcasts, content_interactions
-- Fix content_categories: add is_active, deleted_at, sort_order
-- MySQL 8.0+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── Fix content_categories ─────────────────────────────────
ALTER TABLE content_categories
  ADD COLUMN sort_order  INT NOT NULL DEFAULT 0,
  ADD COLUMN is_active   TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN deleted_at  TIMESTAMP NULL DEFAULT NULL;

-- ─── videos ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id      INT UNSIGNED NULL,
  title            VARCHAR(300) NOT NULL,
  description      TEXT NULL,
  file_url         VARCHAR(500) NOT NULL,
  thumbnail_url    VARCHAR(500) NULL,
  duration_seconds INT UNSIGNED NULL,
  view_count       INT UNSIGNED NOT NULL DEFAULT 0,
  uploaded_by      BIGINT UNSIGNED NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at       TIMESTAMP NULL DEFAULT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_videos_category (category_id),
  KEY idx_videos_active (is_active),
  CONSTRAINT fk_videos_category  FOREIGN KEY (category_id) REFERENCES content_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_videos_uploader  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── podcasts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS podcasts (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id      INT UNSIGNED NULL,
  title            VARCHAR(300) NOT NULL,
  description      TEXT NULL,
  file_url         VARCHAR(500) NOT NULL,
  cover_url        VARCHAR(500) NULL,
  duration_seconds INT UNSIGNED NULL,
  mood_slug        VARCHAR(50) NULL,
  play_count       INT UNSIGNED NOT NULL DEFAULT 0,
  uploaded_by      BIGINT UNSIGNED NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at       TIMESTAMP NULL DEFAULT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_podcasts_category (category_id),
  KEY idx_podcasts_mood (mood_slug),
  KEY idx_podcasts_active (is_active),
  CONSTRAINT fk_podcasts_category FOREIGN KEY (category_id) REFERENCES content_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_podcasts_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── content_interactions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS content_interactions (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          BIGINT UNSIGNED NOT NULL,
  content_type     ENUM('video','podcast') NOT NULL,
  content_id       BIGINT UNSIGNED NOT NULL,
  interaction_type VARCHAR(50) NOT NULL,
  progress_seconds INT UNSIGNED NULL,
  duration_seconds INT UNSIGNED NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ci_user    (user_id),
  KEY idx_ci_content (content_type, content_id),
  CONSTRAINT fk_ci_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
