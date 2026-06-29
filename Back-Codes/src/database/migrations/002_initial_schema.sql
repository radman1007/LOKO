-- ============================================================
-- Loko Platform - Migration 002
-- Add refresh_tokens and access_logs tables
-- MySQL 8.0+ | utf8mb4_unicode_ci
-- ============================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  token_hash    VARCHAR(255) NOT NULL,
  jti           VARCHAR(100) NOT NULL,
  family_id     VARCHAR(100) NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  revoked_at    TIMESTAMP NULL DEFAULT NULL,
  replaced_by   VARCHAR(100) NULL DEFAULT NULL,
  ip_address    VARCHAR(45) NULL DEFAULT NULL,
  user_agent    VARCHAR(500) NULL DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_refresh_token_hash (token_hash),
  UNIQUE KEY uk_refresh_token_jti (jti),
  KEY idx_refresh_tokens_user (user_id),
  KEY idx_refresh_tokens_family (family_id),
  KEY idx_refresh_tokens_expires (expires_at),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS access_logs (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NULL,
  method        VARCHAR(10) NOT NULL,
  path          VARCHAR(500) NOT NULL,
  status_code   SMALLINT UNSIGNED NOT NULL,
  duration_ms   INT UNSIGNED NULL,
  ip_address    VARCHAR(45) NULL,
  user_agent    VARCHAR(500) NULL,
  request_id    VARCHAR(100) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_access_logs_user (user_id),
  KEY idx_access_logs_created (created_at),
  KEY idx_access_logs_status (status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;