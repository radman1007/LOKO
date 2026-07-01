-- ============================================================
-- Loko Platform - Migration 007
-- پایه‌ی تحصیلی برای دانش‌آموز و کتاب (فعال‌سازی کتاب‌ها بر اساس پایه)
-- MySQL 8.0+
-- ============================================================

SET NAMES utf8mb4;

-- پایه‌ی تحصیلی دانش‌آموز (اول، دوم، ...)
ALTER TABLE users ADD COLUMN grade VARCHAR(20) NULL AFTER national_code;

-- پایه‌ی هدف هر کتاب (NULL = عمومی برای همه‌ی پایه‌ها)
ALTER TABLE books ADD COLUMN grade VARCHAR(20) NULL AFTER class_id;
CREATE INDEX idx_books_grade ON books (grade);
