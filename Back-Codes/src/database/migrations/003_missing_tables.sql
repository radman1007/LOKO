-- ============================================================
-- Loko Platform - Migration 003
-- Add all missing tables required by services & engines
-- MySQL 8.0+ | utf8mb4_unicode_ci
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── Fix class_students: add missing columns ────────────────
ALTER TABLE class_students
  ADD COLUMN is_visible TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- ─── Fix badge_definitions: add is_active ───────────────────
ALTER TABLE badge_definitions
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;

-- ─── class_teachers ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_teachers (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  class_id    BIGINT UNSIGNED NOT NULL,
  teacher_id  BIGINT UNSIGNED NOT NULL,
  is_primary  TINYINT(1) NOT NULL DEFAULT 0,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_class_teacher (class_id, teacher_id),
  CONSTRAINT fk_ct_class   FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_ct_teacher FOREIGN KEY (teacher_id) REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── student_profiles ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  total_points INT UNSIGNED NOT NULL DEFAULT 0,
  total_tokens INT UNSIGNED NOT NULL DEFAULT 0,
  garden_level TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_sp_user (user_id),
  CONSTRAINT fk_sp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── token_wallets ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_wallets (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  balance    INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tw_user (user_id),
  CONSTRAINT fk_tw_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── token_transactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_transactions (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  wallet_id     BIGINT UNSIGNED NOT NULL,
  amount        INT NOT NULL,
  balance_after INT UNSIGNED NOT NULL,
  source_type   VARCHAR(50) NOT NULL,
  source_id     BIGINT UNSIGNED NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tt_user (user_id),
  CONSTRAINT fk_tt_user   FOREIGN KEY (user_id)   REFERENCES users(id)          ON DELETE CASCADE,
  CONSTRAINT fk_tt_wallet FOREIGN KEY (wallet_id) REFERENCES token_wallets(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── points_transactions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS points_transactions (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  amount        INT NOT NULL,
  balance_after INT UNSIGNED NOT NULL,
  source_type   VARCHAR(50) NOT NULL,
  source_id     BIGINT UNSIGNED NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pt_user (user_id),
  CONSTRAINT fk_pt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── daily_tasks ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_tasks (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title_fa      VARCHAR(200) NOT NULL,
  title_en      VARCHAR(200) NULL,
  description   TEXT NULL,
  points_reward SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  token_reward  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at    TIMESTAMP NULL DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── task_completions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_completions (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  task_id         INT UNSIGNED NOT NULL,
  user_id         BIGINT UNSIGNED NOT NULL,
  completion_date DATE NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tc_user_task_date (user_id, task_id, completion_date),
  KEY idx_tc_user (user_id),
  CONSTRAINT fk_tc_task FOREIGN KEY (task_id) REFERENCES daily_tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_tc_user FOREIGN KEY (user_id) REFERENCES users(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── mood_checkins ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mood_checkins (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  mood_id       INT UNSIGNED NOT NULL,
  is_first_of_day TINYINT(1) NOT NULL DEFAULT 0,
  checkin_date  DATE NOT NULL,
  note          TEXT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mc_user_date (user_id, checkin_date),
  CONSTRAINT fk_mc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_mc_mood FOREIGN KEY (mood_id) REFERENCES moods(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── garden_states ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS garden_states (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  level      TINYINT UNSIGNED NOT NULL DEFAULT 1,
  experience INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_gs_user (user_id),
  CONSTRAINT fk_gs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── garden_plants ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS garden_plants (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  plant_type   VARCHAR(50) NOT NULL,
  plant_slug   VARCHAR(100) NOT NULL,
  growth_stage TINYINT UNSIGNED NOT NULL DEFAULT 0,
  acquired_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_gp_user (user_id),
  CONSTRAINT fk_gp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── secrets ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS secrets (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  content    TEXT NOT NULL,
  mood_tag   VARCHAR(20) NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_secrets_user (user_id),
  CONSTRAINT fk_secrets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── breathing_sessions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          BIGINT UNSIGNED NOT NULL,
  started_at       DATETIME NOT NULL,
  ended_at         DATETIME NOT NULL,
  duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
  cycle_count      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bs_user (user_id),
  CONSTRAINT fk_bs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── user_badges ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  badge_id    INT UNSIGNED NOT NULL,
  awarded_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ub_user_badge (user_id, badge_id),
  CONSTRAINT fk_ub_user  FOREIGN KEY (user_id)  REFERENCES users(id)             ON DELETE CASCADE,
  CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES badge_definitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── method_statistics ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS method_statistics (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  method_id       INT UNSIGNED NOT NULL,
  usage_count     INT UNSIGNED NOT NULL DEFAULT 0,
  engagement_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ms_user_method (user_id, method_id),
  CONSTRAINT fk_ms_user   FOREIGN KEY (user_id)   REFERENCES users(id)               ON DELETE CASCADE,
  CONSTRAINT fk_ms_method FOREIGN KEY (method_id) REFERENCES educational_methods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── parent_student_relations ───────────────────────────────
CREATE TABLE IF NOT EXISTS parent_student_relations (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id  BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_psr (parent_id, student_id),
  CONSTRAINT fk_psr_parent  FOREIGN KEY (parent_id)  REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_psr_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── tickets ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  school_id  BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  subject    VARCHAR(200) NOT NULL,
  priority   ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status     ENUM('open','answered','closed') NOT NULL DEFAULT 'open',
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tickets_school (school_id),
  KEY idx_tickets_creator (created_by),
  KEY idx_tickets_status (status),
  CONSTRAINT fk_tickets_school   FOREIGN KEY (school_id)  REFERENCES schools(id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_creator  FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── ticket_messages ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_messages (
  id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  message   TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tm_ticket (ticket_id),
  CONSTRAINT fk_tm_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_tm_sender FOREIGN KEY (sender_id) REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── audit_logs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NULL,
  school_id   BIGINT UNSIGNED NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id   BIGINT UNSIGNED NULL,
  old_values  JSON NULL,
  new_values  JSON NULL,
  ip_address  VARCHAR(45) NULL,
  user_agent  VARCHAR(500) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_al_user   (user_id),
  KEY idx_al_school (school_id),
  KEY idx_al_action (action),
  KEY idx_al_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
