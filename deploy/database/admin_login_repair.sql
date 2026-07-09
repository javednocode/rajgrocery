-- Repairs the admin login table without touching products, orders, banners, or settings.
-- Import this file into the selected Hostinger database: u303278809_asian_halal

CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @db_name = DATABASE();

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE `admins` ADD COLUMN `avatar` VARCHAR(255) DEFAULT NULL',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'avatar'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE `admins` ADD COLUMN `is_active` TINYINT(1) DEFAULT 1',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'is_active'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE `admins` ADD COLUMN `last_login` DATETIME DEFAULT NULL',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'last_login'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE `admins` ADD COLUMN `role` VARCHAR(50) DEFAULT ''admin''',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'role'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE `admins`
SET
  `name` = 'Super Admin',
  `password` = '$2y$12$GHrty9l9Rluje1sFvyGhP.R0vD/TXTWtRMth/OZ1uUYgzZPYH6WOa',
  `role` = 'super_admin',
  `is_active` = 1
WHERE `email` = 'admin@example.com';

INSERT INTO `admins` (`name`, `email`, `password`, `role`, `is_active`)
SELECT
  'Super Admin',
  'admin@example.com',
  '$2y$12$GHrty9l9Rluje1sFvyGhP.R0vD/TXTWtRMth/OZ1uUYgzZPYH6WOa',
  'super_admin',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM `admins` WHERE `email` = 'admin@example.com'
);
