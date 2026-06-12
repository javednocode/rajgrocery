-- ============================================================
-- Video Banner Migration
-- Run this on your Hostinger MySQL database
-- ============================================================

ALTER TABLE `banners`
  ADD COLUMN IF NOT EXISTS `media_type`     ENUM('image','video') NOT NULL DEFAULT 'image' AFTER `mobile_image`,
  ADD COLUMN IF NOT EXISTS `video`          VARCHAR(500) DEFAULT NULL AFTER `media_type`,
  ADD COLUMN IF NOT EXISTS `mobile_video`   VARCHAR(500) DEFAULT NULL AFTER `video`,
  ADD COLUMN IF NOT EXISTS `fallback_image` VARCHAR(255) DEFAULT NULL AFTER `mobile_video`,
  ADD COLUMN IF NOT EXISTS `button_color`   VARCHAR(30)  DEFAULT '#e06400' AFTER `button_text`;
