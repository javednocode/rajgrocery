-- ════════════════════════════════════════════════════════════════════════
-- Customer Import & Management System
-- Safe to run multiple times. Adds columns/tables only if missing.
--
-- 1. Extends `customers` with the fields a CSV/WooCommerce customer export
--    carries that the base schema doesn't have (first/last name, company,
--    flat billing/shipping snapshot, original account-created date, and
--    import provenance columns used to link future order imports back to
--    the correct customer).
-- 2. Adds a job/log/item-ledger table set, mirroring the existing product
--    migration system (import_jobs/import_logs/import_job_items in
--    helpers/import_queue.php) so imports are chunked, resumable, and
--    auditable at 100k+ row scale without holding one giant transaction
--    open or re-processing rows that already succeeded.
-- ════════════════════════════════════════════════════════════════════════

-- ── customers: additive columns ────────────────────────────────────────
SET @db := DATABASE();

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `first_name` VARCHAR(100) DEFAULT NULL AFTER `name`',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'first_name');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `last_name` VARCHAR(100) DEFAULT NULL AFTER `first_name`',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'last_name');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `company` VARCHAR(150) DEFAULT NULL AFTER `phone`',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'company');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `billing_address` VARCHAR(255) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'billing_address');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `billing_city` VARCHAR(100) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'billing_city');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `billing_state` VARCHAR(100) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'billing_state');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `billing_country` VARCHAR(100) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'billing_country');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `billing_postal_code` VARCHAR(20) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'billing_postal_code');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `shipping_address` VARCHAR(255) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'shipping_address');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `shipping_city` VARCHAR(100) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'shipping_city');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `shipping_state` VARCHAR(100) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'shipping_state');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `shipping_country` VARCHAR(100) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'shipping_country');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `shipping_postal_code` VARCHAR(20) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'shipping_postal_code');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Original "account created" date carried in the export — distinct from
-- `created_at`, which records when THIS system inserted the row.
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `account_created_at` DATE DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'account_created_at');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Where the row came from: storefront (self-registered), csv_import, admin.
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `source` VARCHAR(30) NOT NULL DEFAULT ''storefront''',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'source');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Customer/User ID from the source system (e.g. WooCommerce). Kept so a
-- future order importer can match an order's customer reference to the
-- right row even if the email on the order differs slightly from the
-- email on file — matches by whichever of the two is present.
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `external_customer_id` VARCHAR(100) DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'external_customer_id');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Which import job created this row (soft reference — no FK, mirrors how
-- product_images/import_job_items reference product_id).
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD COLUMN `import_job_id` INT DEFAULT NULL',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'import_job_id');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Indexes (idempotent: information_schema.STATISTICS guard) ──────────
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD INDEX `idx_external_customer_id` (`external_customer_id`)',
  'SELECT 1') FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND INDEX_NAME = 'idx_external_customer_id');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD INDEX `idx_source` (`source`)',
  'SELECT 1') FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND INDEX_NAME = 'idx_source');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `customers` ADD INDEX `idx_import_job_id` (`import_job_id`)',
  'SELECT 1') FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'customers' AND INDEX_NAME = 'idx_import_job_id');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- NOTE: case-insensitive email dedup uses LOWER(email)=LOWER(:x) at query
-- time (see helpers/customer_import_queue.php). Deliberately not adding a
-- functional index for it — those need MySQL 8.0.13+/MariaDB 10.3.7+ and
-- this migration has to run on whatever version shared hosting provides.
-- The existing UNIQUE btree on `email` already keeps exact-match lookups
-- (registration, login) fast; a full scan for the LOWER() comparison is
-- inconsequential at 100k rows and can be revisited if it ever isn't.

-- ── Job / log / item-ledger tables ──────────────────────────────────────
-- Mirrors import_jobs / import_logs / import_job_items in
-- helpers/import_queue.php (the product migration system) so the
-- customer importer is chunk-processed, resumable, and auditable the
-- same proven way at large row counts.

CREATE TABLE IF NOT EXISTS `customer_import_jobs` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `batch_id` VARCHAR(64) NOT NULL UNIQUE,
  `filename` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending','running','completed','failed','rolled_back') DEFAULT 'pending',
  `mapping_json` LONGTEXT,
  `payload_file` VARCHAR(255) DEFAULT NULL,
  `total` INT DEFAULT 0,
  `processed` INT DEFAULT 0,
  `imported` INT DEFAULT 0,
  `skipped` INT DEFAULT 0,
  `failed` INT DEFAULT 0,
  `started_at` DATETIME DEFAULT NULL,
  `finished_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `customer_import_logs` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT NOT NULL,
  `batch_id` VARCHAR(64) NOT NULL,
  `level` ENUM('info','success','warning','error') DEFAULT 'info',
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_job_id` (`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Per-row ledger. `row_data_json` keeps the fully mapped field values (not
-- just an error string) so a failed row can be reconstructed into
-- failed_rows.csv in the same shape as the original required-field
-- columns — fix the data, re-upload just that file.
CREATE TABLE IF NOT EXISTS `customer_import_items` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT NOT NULL,
  `batch_id` VARCHAR(64) NOT NULL,
  `row_number` INT NOT NULL,
  `customer_id` INT DEFAULT NULL,
  `email` VARCHAR(200) DEFAULT NULL,
  `action` ENUM('imported','skipped','failed') NOT NULL,
  `error` TEXT DEFAULT NULL,
  `row_data_json` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_job_id` (`job_id`),
  KEY `idx_action` (`action`),
  KEY `idx_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Customer import system ready.' AS status;
