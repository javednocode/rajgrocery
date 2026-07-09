-- Migration 001: Add site_id to all existing tables
-- Run this on existing installations upgrading from single-site to multi-site
-- Safe to run multiple times (uses IF NOT EXISTS checks via COLUMN_NAME)

-- Add site_id to products
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='products' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE products ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_products (site_id)',
  'SELECT "products.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to categories
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='categories' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE categories ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_categories (site_id)',
  'SELECT "categories.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to orders
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE orders ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_orders (site_id)',
  'SELECT "orders.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to customers
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='customers' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE customers ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_customers (site_id)',
  'SELECT "customers.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to coupons
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='coupons' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE coupons ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_coupons (site_id)',
  'SELECT "coupons.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to blog_posts
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='blog_posts' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE blog_posts ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_blog_posts (site_id)',
  'SELECT "blog_posts.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to banners
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='banners' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE banners ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_banners (site_id)',
  'SELECT "banners.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to hero_products
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='hero_products' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE hero_products ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_hero_products (site_id)',
  'SELECT "hero_products.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to pages
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='pages' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE pages ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_pages (site_id)',
  'SELECT "pages.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to reviews
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='reviews' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE reviews ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_reviews (site_id)',
  'SELECT "reviews.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Fix site_settings: change single unique key to per-site unique key
-- Drop old unique key if it's just on setting_key
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='site_settings' AND CONSTRAINT_NAME='setting_key') > 0,
  'ALTER TABLE site_settings DROP INDEX setting_key',
  'SELECT "Old unique index already removed" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to site_settings
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='site_settings' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE site_settings ADD COLUMN site_id INT NOT NULL DEFAULT 1 AFTER id, ADD INDEX idx_site_settings (site_id)',
  'SELECT "site_settings.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add new composite unique key for site_settings
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='site_settings' AND CONSTRAINT_NAME='unique_site_setting') = 0,
  'ALTER TABLE site_settings ADD UNIQUE KEY unique_site_setting (site_id, setting_key)',
  'SELECT "unique_site_setting already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add site_id to admins
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='admins' AND COLUMN_NAME='site_id') = 0,
  'ALTER TABLE admins ADD COLUMN site_id INT DEFAULT NULL AFTER id COMMENT "NULL = super admin (all sites)", ADD INDEX idx_site_admins (site_id)',
  'SELECT "admins.site_id already exists" AS note'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Fix old SAGGOJI50 coupon code to be generic (if exists)
UPDATE coupons SET code = 'WELCOME50', description = 'Flat 50 off first order' WHERE code = 'SAGGOJI50';
-- Clear client-specific banner seed data
DELETE FROM banners WHERE title LIKE '%Saggoji%' OR subtitle LIKE '%Saggoji%' OR title LIKE '%Bikaneri%';
-- Clear client-specific product data
UPDATE products SET brand = NULL WHERE brand = 'Saggoji';
-- Clear The Desi site settings - reset to generic defaults
UPDATE site_settings SET setting_value = 'Your Store' WHERE setting_key = 'site_name' AND setting_value = 'The Desi';
UPDATE site_settings SET setting_value = 'Quality products delivered to your door.' WHERE setting_key = 'site_tagline' AND setting_value LIKE '%South Asian%';
UPDATE site_settings SET setting_value = 'hello@example.com' WHERE setting_key IN ('site_email','contact_email','smtp_from_email','admin_email') AND setting_value LIKE '%thedesi%';
UPDATE site_settings SET setting_value = 'hello@example.com' WHERE setting_key = 'smtp_from_email' AND setting_value = '';
UPDATE site_settings SET setting_value = CONCAT('© ', YEAR(NOW()), ' Your Store. All rights reserved.') WHERE setting_key = 'footer_copyright' AND setting_value LIKE '%The Desi%';

SELECT 'Migration 001 complete — site_id added to all tables' AS result;
