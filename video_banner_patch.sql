-- Video Banner Columns Patch
-- Import this into u298651808_webcraftstechb if video banner saving fails.
-- Safe to run multiple times (uses IF NOT EXISTS logic).

SET @db = DATABASE();

-- Add media_type column
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `banners` ADD COLUMN `media_type` ENUM(''image'',''video'') NOT NULL DEFAULT ''image'' AFTER `mobile_image`',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'media_type');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add video column
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `banners` ADD COLUMN `video` VARCHAR(500) DEFAULT NULL AFTER `media_type`',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'video');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add mobile_video column
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `banners` ADD COLUMN `mobile_video` VARCHAR(500) DEFAULT NULL AFTER `video`',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'mobile_video');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add fallback_image column
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `banners` ADD COLUMN `fallback_image` VARCHAR(255) DEFAULT NULL AFTER `mobile_video`',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'fallback_image');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add button_color column
SET @sql = (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE `banners` ADD COLUMN `button_color` VARCHAR(30) DEFAULT ''#e06400'' AFTER `button_text`',
  'SELECT 1') FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'button_color');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Mark schema as done so the API doesn't try to run it again
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`)
VALUES ('banner_schema_v2', '1', 'system')
ON DUPLICATE KEY UPDATE `setting_value` = '1';

SELECT 'Video banner columns added successfully!' AS status;
