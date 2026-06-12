-- Attach an existing uploaded MP4 file to the homepage hero banner.
-- Import this into the selected Hostinger database: u303278809_asian_halal

CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) DEFAULT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `image` VARCHAR(255) NOT NULL DEFAULT '',
  `mobile_image` VARCHAR(255) DEFAULT NULL,
  `media_type` ENUM('image','video') NOT NULL DEFAULT 'image',
  `video` VARCHAR(500) DEFAULT NULL,
  `mobile_video` VARCHAR(500) DEFAULT NULL,
  `fallback_image` VARCHAR(255) DEFAULT NULL,
  `link` VARCHAR(500) DEFAULT NULL,
  `button_text` VARCHAR(100) DEFAULT NULL,
  `button_color` VARCHAR(30) DEFAULT '#e06400',
  `position` ENUM('hero','secondary','sidebar') DEFAULT 'hero',
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `starts_at` DATETIME DEFAULT NULL,
  `ends_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @db_name = DATABASE();

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE `banners` ADD COLUMN `media_type` ENUM(''image'',''video'') NOT NULL DEFAULT ''image'' AFTER `mobile_image`',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'media_type'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE `banners` ADD COLUMN `video` VARCHAR(500) DEFAULT NULL AFTER `media_type`',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'video'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE `banners` ADD COLUMN `mobile_video` VARCHAR(500) DEFAULT NULL AFTER `video`',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'mobile_video'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE `banners` ADD COLUMN `fallback_image` VARCHAR(255) DEFAULT NULL AFTER `mobile_video`',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'fallback_image'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE `banners` ADD COLUMN `button_color` VARCHAR(30) DEFAULT ''#e06400'' AFTER `button_text`',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'button_color'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @desktop_video = '/uploads/banners/videos/1781031481_5046ae5c.mp4';

UPDATE `banners`
SET `is_active` = 0
WHERE `position` = 'hero';

INSERT INTO `banners`
  (`title`, `subtitle`, `image`, `media_type`, `video`, `mobile_video`, `fallback_image`,
   `link`, `button_text`, `button_color`, `position`, `sort_order`, `is_active`)
VALUES
  ('Fresh Halal Meats, Premium Spices & Ethnic Groceries',
   'From our store to your door — fresh halal meats, spices, vegetables and daily essentials delivered fast.',
   '',
   'video',
   @desktop_video,
   @desktop_video,
   NULL,
   '/categories',
   'Shop All Departments',
   '#f28c00',
   'hero',
   0,
   1);

INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`)
VALUES ('banner_schema_v2', '1', 'system')
ON DUPLICATE KEY UPDATE `setting_value` = '1';
