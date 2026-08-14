-- ════════════════════════════════════════════════════════════════════════
-- Customer Account System — self-service login, saved addresses, and
-- order history for the storefront (distinct from the admin-only
-- CSV/WooCommerce customer importer in customer_import_system.sql).
-- Safe to run multiple times. Adds columns/tables/indexes/constraints
-- only if missing — mirrors the guard style established in
-- customer_import_system.sql.
-- ════════════════════════════════════════════════════════════════════════

SET @db := DATABASE();

-- ── customers: additive columns ─────────────────────────────────────────
-- schema.sql already defines password/is_guest/is_active, and
-- customer_import_system.sql already added password_reset_required —
-- guarded again here as cheap insurance for any deployment missing one.
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `password` VARCHAR(255) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'password');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `is_guest` TINYINT(1) DEFAULT 0',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'is_guest');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `is_active` TINYINT(1) DEFAULT 1',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'is_active');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `password_reset_required` TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'password_reset_required');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── customers: genuinely new column ─────────────────────────────────────
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `last_login_at` DATETIME DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'last_login_at');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── orders: customer_id column ──────────────────────────────────────────
-- schema.sql already defines this — guarded again for deployments
-- created before it existed.
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `orders` ADD COLUMN `customer_id` INT DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'customer_id');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── orders: index on customer_id (idempotent: information_schema.STATISTICS guard) ──
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `orders` ADD INDEX `idx_orders_customer_id` (`customer_id`)',
  'SELECT 1') FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_orders_customer_id');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── orders: FK on customer_id → customers.id ────────────────────────────
-- Guarded by checking for ANY constraint on this column referencing
-- `customers` (not a fixed constraint name) — a fresh schema.sql install
-- already carries this FK under an auto-generated name, so a name-based
-- guard (like the index guard above) would misfire on that case.
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL',
  'SELECT 1') FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'customer_id' AND REFERENCED_TABLE_NAME = 'customers');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── addresses: full table (matches schema.sql exactly) ──────────────────
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `label` VARCHAR(50) DEFAULT 'Home',
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address_line1` VARCHAR(255) NOT NULL,
  `address_line2` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(10) NOT NULL,
  `is_default` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Customer account system ready.' AS status;
