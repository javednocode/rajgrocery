-- White-label Grocery eCommerce Database Schema
-- MySQL 8.0+



-- ============================================
-- 1. ADMIN USERS
-- ============================================
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin','admin','editor') DEFAULT 'admin',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default admin: admin@example.com / password123
-- Hash generated via: password_hash('password123', PASSWORD_BCRYPT)
INSERT INTO `admins` (`name`, `email`, `password`, `role`, `is_active`) VALUES
('Super Admin', 'admin@example.com', '$2y$12$GHrty9l9Rluje1sFvyGhP.R0vD/TXTWtRMth/OZ1uUYgzZPYH6WOa', 'super_admin', 1)
ON DUPLICATE KEY UPDATE
  `password` = VALUES(`password`),
  `role` = VALUES(`role`),
  `is_active` = 1;

-- ============================================
-- 2. CATEGORIES (Nested with self-referencing parent_id)
-- ============================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `icon` VARCHAR(100) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `focus_keyword` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(300) NOT NULL UNIQUE,
  `short_description` VARCHAR(500) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `sale_price` DECIMAL(10,2) DEFAULT NULL,
  `cost_price` DECIMAL(10,2) DEFAULT NULL,
  `sku` VARCHAR(100) DEFAULT NULL,
  `barcode` VARCHAR(100) DEFAULT NULL,
  `stock` INT DEFAULT 0,
  `low_stock_threshold` INT DEFAULT 5,
  `weight` DECIMAL(8,2) DEFAULT NULL,
  `unit` VARCHAR(50) DEFAULT 'piece',
  `brand` VARCHAR(150) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_trending` TINYINT(1) DEFAULT 0,
  `is_new` TINYINT(1) DEFAULT 0,
  `views` INT DEFAULT 0,
  `sales_count` INT DEFAULT 0,
  `avg_rating` DECIMAL(3,2) DEFAULT 0.00,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `focus_keyword` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_price` (`price`),
  INDEX `idx_featured` (`is_featured`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. PRODUCT IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. PRODUCT VARIATIONS (size, weight, colour, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS `product_variations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL COMMENT 'e.g. 500g, Red, Large',
  `sku` VARCHAR(100) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `sale_price` DECIMAL(10,2) DEFAULT NULL,
  `stock` INT DEFAULT 0,
  `image_path` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. PRODUCT ↔ CATEGORY (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS `product_categories` (
  `product_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`product_id`, `category_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. CUSTOMERS
-- ============================================
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(200) DEFAULT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `is_guest` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `total_orders` INT DEFAULT 0,
  `total_spent` DECIMAL(12,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. CUSTOMER ADDRESSES
-- ============================================
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

-- ============================================
-- 8. ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(30) NOT NULL UNIQUE,
  `customer_id` INT DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(200) DEFAULT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `billing_address` TEXT DEFAULT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(12,2) DEFAULT 0.00,
  `shipping_charge` DECIMAL(10,2) DEFAULT 0.00,
  `tax` DECIMAL(10,2) DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `coupon_code` VARCHAR(50) DEFAULT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'cod',
  `payment_status` VARCHAR(50) DEFAULT 'pending',
  `payment_id` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending','confirmed','processing','shipped','delivered','cancelled','returned') DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `delivered_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
  INDEX `idx_order_number` (`order_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 9. ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT DEFAULT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_image` VARCHAR(255) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `total` DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 10. BANNERS
-- ============================================
CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) DEFAULT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `image` VARCHAR(255) NOT NULL,
  `mobile_image` VARCHAR(255) DEFAULT NULL,
  `link` VARCHAR(500) DEFAULT NULL,
  `button_text` VARCHAR(100) DEFAULT NULL,
  `position` ENUM('hero','secondary','sidebar') DEFAULT 'hero',
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `starts_at` DATETIME DEFAULT NULL,
  `ends_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 11. BLOG CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS `blog_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 12. BLOG POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(300) NOT NULL UNIQUE,
  `excerpt` VARCHAR(500) DEFAULT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `featured_image` VARCHAR(255) DEFAULT NULL,
  `author` VARCHAR(100) DEFAULT 'Admin',
  `status` ENUM('draft','published','archived') DEFAULT 'draft',
  `views` INT DEFAULT 0,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `focus_keyword` VARCHAR(150) DEFAULT NULL,
  `published_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 13. SITE SETTINGS (Key-Value Store)
-- ============================================
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT DEFAULT NULL,
  `setting_type` ENUM('text','textarea','image','json','boolean','number') DEFAULT 'text',
  `setting_group` VARCHAR(50) DEFAULT 'general',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default settings
INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`, `setting_type`, `setting_group`) VALUES
('site_name', 'Your Store', 'text', 'general'),
('site_tagline', 'White-label ecommerce storefront', 'text', 'general'),
('site_logo', '/logo.svg', 'image', 'general'),
('site_favicon', '/favicon.ico', 'image', 'general'),
('site_email', 'hello@example.com', 'text', 'general'),
('site_phone', '', 'text', 'general'),
('site_address', 'Configure store address in Admin Settings', 'textarea', 'general'),
('footer_about', 'A reusable ecommerce storefront. Update this copy in Admin Settings for each new brand.', 'textarea', 'footer'),
('footer_copyright', '© 2026 Your Store. All rights reserved.', 'text', 'footer'),
('social_facebook', '', 'text', 'social'),
('social_instagram', '', 'text', 'social'),
('social_twitter', '', 'text', 'social'),
('social_youtube', '', 'text', 'social'),
('social_whatsapp', '', 'text', 'social'),
('shipping_free_above', '50', 'number', 'shipping'),
('shipping_charge', '5', 'number', 'shipping'),
('tax_percentage', '0', 'number', 'tax'),
('currency_symbol', '$', 'text', 'general'),
('currency_code', 'USD', 'text', 'general'),
('header_offer_text', 'Free delivery options can be configured in Admin Settings.', 'text', 'header'),
('maintenance_mode', '0', 'boolean', 'general'),
('google_analytics_id', '', 'text', 'seo'),
('meta_title', 'Your Store - Online Store', 'text', 'seo'),
('meta_description', 'Shop products online. Fast checkout, product management, customer management, and order management are ready to customize.', 'textarea', 'seo');

-- ============================================
-- 14. COUPONS
-- ============================================
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  `discount_type` ENUM('percentage','fixed') DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_order_amount` DECIMAL(10,2) DEFAULT 0.00,
  `max_discount` DECIMAL(10,2) DEFAULT NULL,
  `usage_limit` INT DEFAULT NULL,
  `used_count` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `starts_at` DATETIME DEFAULT NULL,
  `expires_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 15. STATIC PAGES
-- ============================================
CREATE TABLE IF NOT EXISTS `pages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(300) NOT NULL UNIQUE,
  `content` LONGTEXT DEFAULT NULL,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 16. REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `customer_id` INT DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `rating` TINYINT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT DEFAULT NULL,
  `is_approved` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 17. WISHLIST
-- ============================================
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_wishlist` (`customer_id`, `product_id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



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


-- ============================================================
-- Asian Spices & Halal Meats — Brand Settings Reset
-- Run once to overwrite all Saggoji/Bikaneri database settings
-- ============================================================

INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_group) VALUES
('site_name',        'Asian Spices & Halal Meats', 'text', 'general'),
('site_tagline',     'Fresh Halal Meats, Premium Spices & Ethnic Groceries', 'text', 'general'),
('site_description', 'Shop fresh halal meats, premium spices, fresh vegetables and daily essentials online. Fast delivery, best prices guaranteed.', 'textarea', 'seo'),
('site_logo',        '/logo.svg', 'image', 'general'),
('site_email',       'hello@asianspiceshalal.com', 'text', 'general'),
('site_phone',       '+353 1 234 5678', 'text', 'general'),
('site_address',     '12 Halal Street, Dublin, Ireland', 'textarea', 'general'),
('business_city',    'Dublin', 'text', 'contact'),
('business_region',  'Leinster', 'text', 'contact'),
('business_country', 'Ireland', 'text', 'contact'),
('contact_email',    'hello@asianspiceshalal.com', 'text', 'contact'),
('contact_address',  '12 Halal Street, Dublin, Ireland', 'text', 'contact'),
('contact_hours',    'Mon–Sat: 8am–8pm | Sun: 10am–6pm', 'textarea', 'contact'),
('footer_about',     'Your one-stop shop for fresh halal meats, premium spices, fresh vegetables and daily essentials. Fast delivery, best prices guaranteed.', 'textarea', 'footer'),
('footer_copyright', '© 2026 Asian Spices & Halal Meats. All rights reserved.', 'text', 'footer'),
('newsletter_desc',  'Get weekly deals, new arrivals and halal recipes straight to your inbox.', 'textarea', 'footer'),
('header_offer_text','🚚 Free delivery on orders over HK$400', 'text', 'header'),
('currency_symbol',  'HK$', 'text', 'general'),
('currency_code',    'HKD', 'text', 'general'),
('shipping_free_above', '400', 'number', 'shipping'),
('shipping_charge',     '40', 'number', 'shipping'),
('delivery_free_above', '400', 'number', 'delivery'),
('delivery_free_enabled', '1', 'boolean', 'delivery'),
('delivery_local_fee',   '40', 'number', 'delivery'),
('delivery_standard_fee','40', 'number', 'delivery'),
('delivery_local_zone_label',    'Local Dublin Delivery', 'text', 'delivery'),
('delivery_standard_zone_label', 'Standard Delivery',     'text', 'delivery'),
('meta_title',       'Asian Spices & Halal Meats — Fresh Halal Groceries Online', 'text', 'seo'),
('meta_description', 'Shop fresh halal meats, premium spices, vegetables and daily essentials. Fast delivery to your door. 100% halal certified.', 'textarea', 'seo'),
('meta_keywords',    'halal meat, asian spices, fresh vegetables, online grocery, halal grocery, spices online, fresh groceries, irish halal', 'text', 'seo'),
('smtp_from_name',   'Asian Spices & Halal Meats', 'text', 'email'),
('admin_email',      'hello@asianspiceshalal.com', 'text', 'email'),
('social_facebook',  '', 'text', 'social'),
('social_instagram', '', 'text', 'social'),
('social_whatsapp',  '', 'text', 'social'),
('maintenance_mode', '0', 'boolean', 'general')
ON DUPLICATE KEY UPDATE
  setting_value = VALUES(setting_value),
  setting_type  = VALUES(setting_type),
  setting_group = VALUES(setting_group);

-- Clear old Saggoji/Bikaneri banners
UPDATE banners SET is_active = 0 WHERE title LIKE '%Saggoji%' OR title LIKE '%Bikaneri%' OR title LIKE '%Namkeen%' OR subtitle LIKE '%Saggoji%' OR subtitle LIKE '%Bikaneri%';

SELECT 'Asian Spices & Halal Meats brand settings applied.' AS status;
