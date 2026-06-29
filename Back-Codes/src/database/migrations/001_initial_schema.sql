-- ============================================================
-- Loko Platform - Initial Schema Migration (FIXED VERSION)
-- MySQL 8.0+ | utf8mb4_unicode_ci
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 0. SCHEMA MIGRATIONS (MUST BE FIRST)
-- ============================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  version     VARCHAR(50) NOT NULL,
  name        VARCHAR(200) NOT NULL,
  applied_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_migration_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(50) NOT NULL,
  slug        VARCHAR(50) NOT NULL,
  description VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. SCHOOLS
-- ============================================================
CREATE TABLE IF NOT EXISTS schools (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(200) NOT NULL,
  code        VARCHAR(50) NOT NULL,
  address     TEXT NULL,
  phone       VARCHAR(20) NULL,
  email       VARCHAR(150) NULL,
  logo_url    VARCHAR(500) NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  settings    JSON NULL,
  deleted_at  TIMESTAMP NULL DEFAULT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_schools_code (code),
  KEY idx_schools_active (is_active),
  KEY idx_schools_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  school_id       BIGINT UNSIGNED NULL,
  role_id         TINYINT UNSIGNED NOT NULL,
  username        VARCHAR(100) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  plain_password  VARCHAR(100) NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  national_code   VARCHAR(20) NULL,
  phone           VARCHAR(20) NULL,
  email           VARCHAR(150) NULL,
  avatar_url      VARCHAR(500) NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at   TIMESTAMP NULL,
  deleted_at      TIMESTAMP NULL DEFAULT NULL,
  created_by      BIGINT UNSIGNED NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_username (username),
  KEY idx_users_school (school_id),
  KEY idx_users_role (role_id),
  CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. CLASSES
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  school_id       BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(100) NOT NULL,
  grade           VARCHAR(20) NOT NULL,
  academic_year   VARCHAR(20) NOT NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at      TIMESTAMP NULL DEFAULT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_classes_school_name_year (school_id, name, academic_year),
  CONSTRAINT fk_classes_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. CLASS_STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS class_students (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  class_id    BIGINT UNSIGNED NOT NULL,
  student_id  BIGINT UNSIGNED NOT NULL,
  joined_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_class_student (class_id, student_id),
  CONSTRAINT fk_cs_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_cs_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. MOODS (FIXED - REQUIRED BY SEED)
-- ============================================================
CREATE TABLE IF NOT EXISTS moods (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(50) NOT NULL,
  label_fa VARCHAR(100) NOT NULL,
  label_en VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_moods_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. EDUCATIONAL METHODS (FIXED - REQUIRED BY SEED)
-- ============================================================
CREATE TABLE IF NOT EXISTS educational_methods (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(50) NOT NULL,
  name_fa VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_methods_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. BADGE DEFINITIONS (FIXED - REQUIRED BY SEED)
-- ============================================================
CREATE TABLE IF NOT EXISTS badge_definitions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(50) NOT NULL,
  name_fa VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NULL,
  criteria_type VARCHAR(50) NOT NULL,
  criteria_value INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_badges_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. CONTENT CATEGORIES (FIXED - REQUIRED BY SEED)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(50) NOT NULL,
  name_fa VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  mood_slug VARCHAR(50) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- END
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;