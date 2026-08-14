-- ============================================================
-- Customer Import — WordPress Plugin Support Migration
-- Adds: username, display_name, customer_role,
--       password_reset_required
--
-- Compatible with MySQL 5.7+ (uses INFORMATION_SCHEMA guards
-- instead of ADD COLUMN IF NOT EXISTS which requires MySQL 8.0+).
-- ============================================================

-- username: the WordPress user_login value
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'customers' AND column_name = 'username');
SET @sql = IF(@col = 0,
  'ALTER TABLE customers ADD COLUMN username VARCHAR(100) DEFAULT NULL AFTER name',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- display_name: WordPress display_name field
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'customers' AND column_name = 'display_name');
SET @sql = IF(@col = 0,
  'ALTER TABLE customers ADD COLUMN display_name VARCHAR(150) DEFAULT NULL AFTER username',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- customer_role: WooCommerce role string (informational)
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'customers' AND column_name = 'customer_role');
SET @sql = IF(@col = 0,
  "ALTER TABLE customers ADD COLUMN customer_role VARCHAR(50) DEFAULT 'customer' AFTER display_name",
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- password_reset_required: imported customers must reset password.
-- WordPress hashes are NEVER stored.
SET @col = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'customers' AND column_name = 'password_reset_required');
SET @sql = IF(@col = 0,
  'ALTER TABLE customers ADD COLUMN password_reset_required TINYINT(1) NOT NULL DEFAULT 0 AFTER password',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Index username for future WooCommerce order linking
SET @idx = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'customers' AND index_name = 'idx_username');
SET @sql = IF(@idx = 0,
  'ALTER TABLE customers ADD INDEX idx_username (username)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
