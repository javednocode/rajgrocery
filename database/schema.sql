-- ============================================================
-- WHITE-LABEL ECOMMERCE ENGINE — Clean Schema
-- Version: 2.0 | No client seed data
-- Compatible: MySQL 8.0+ / MariaDB 10.6+
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- ──────────────────────────────────────────────
-- SITES (multi-brand support)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `sites` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `site_name`  VARCHAR(150) NOT NULL,
  `domain`     VARCHAR(255) NOT NULL,
  `theme`      VARCHAR(100) DEFAULT 'default',
  `currency`   VARCHAR(10)  DEFAULT 'USD',
  `timezone`   VARCHAR(50)  DEFAULT 'UTC',
  `status`     ENUM('active','maintenance','suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default site (site_id = 1 for backward compatibility)
INSERT IGNORE INTO `sites` (`id`, `site_name`, `domain`, `theme`, `currency`, `timezone`, `status`)
VALUES (1, 'Your Store', 'localhost', 'default', 'USD', 'UTC', 'active');

-- ──────────────────────────────────────────────
-- ADMINS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `admins` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `site_id`    INT DEFAULT NULL COMMENT 'NULL = super admin (all sites)',
  `name`       VARCHAR(100) NOT NULL,
  `email`      VARCHAR(150) NOT NULL,
  `password`   VARCHAR(255) NOT NULL,
  `role`       ENUM('super_admin','admin','editor') DEFAULT 'admin',
  `avatar`     VARCHAR(255) DEFAULT NULL,
  `is_active`  TINYINT(1) DEFAULT '1',
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin (password: admin123 — CHANGE IMMEDIATELY after install)
-- Hash of 'admin123' with bcrypt cost 12
INSERT IGNORE INTO `admins` (`id`, `site_id`, `name`, `email`, `password`, `role`)
VALUES (1, NULL, 'Super Admin', 'admin@example.com', '$2y$12$GHrty9l9Rluje1sFvyGhP.R0vD/TXTWtRMth/OZ1uUYgzZPYH6WOa', 'super_admin');

-- ──────────────────────────────────────────────
-- SITE SETTINGS (per-site branding key/value store)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `site_id`       INT NOT NULL DEFAULT 1,
  `setting_key`   VARCHAR(100) NOT NULL,
  `setting_value` TEXT,
  `setting_type`  ENUM('text','textarea','image','json','boolean','number') DEFAULT 'text',
  `setting_group` VARCHAR(50) DEFAULT 'general',
  `updated_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_site_setting` (`site_id`, `setting_key`),
  KEY `idx_site` (`site_id`),
  KEY `idx_group` (`setting_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- PAGE SECTIONS (homepage/page builder)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `page_sections` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `site_id`     INT NOT NULL DEFAULT 1,
  `section_key` VARCHAR(100) NOT NULL,
  `is_enabled`  TINYINT(1) DEFAULT 1,
  `sort_order`  INT DEFAULT 0,
  `config`      JSON,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_section` (`site_id`, `section_key`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default homepage sections
INSERT IGNORE INTO `page_sections` (`site_id`, `section_key`, `is_enabled`, `sort_order`) VALUES
(1, 'hero_banner',        1, 1),
(1, 'featured_categories',1, 2),
(1, 'best_sellers',       1, 3),
(1, 'featured_products',  1, 4),
(1, 'promo_banners',      1, 5),
(1, 'trust_section',      1, 6),
(1, 'testimonials',       1, 7),
(1, 'blog_section',       1, 8),
(1, 'newsletter',         1, 9),
(1, 'instagram_feed',     0, 10);

-- ──────────────────────────────────────────────
-- CUSTOMERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `customers` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `site_id`      INT NOT NULL DEFAULT 1,
  `name`         VARCHAR(150) NOT NULL,
  `email`        VARCHAR(200) DEFAULT NULL,
  `phone`        VARCHAR(20) NOT NULL,
  `password`     VARCHAR(255) DEFAULT NULL,
  `is_guest`     TINYINT(1) DEFAULT '0',
  `is_active`    TINYINT(1) DEFAULT '1',
  `total_orders` INT DEFAULT '0',
  `total_spent`  DECIMAL(12,2) DEFAULT '0.00',
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- ADDRESSES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `addresses` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `customer_id`   INT NOT NULL,
  `label`         VARCHAR(50) DEFAULT 'Home',
  `full_name`     VARCHAR(150) NOT NULL,
  `phone`         VARCHAR(20) NOT NULL,
  `address_line1` VARCHAR(255) NOT NULL,
  `address_line2` VARCHAR(255) DEFAULT NULL,
  `city`          VARCHAR(100) NOT NULL,
  `state`         VARCHAR(100) NOT NULL,
  `pincode`       VARCHAR(10) NOT NULL,
  `is_default`    TINYINT(1) DEFAULT '0',
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- CATEGORIES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `categories` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `site_id`          INT NOT NULL DEFAULT 1,
  `parent_id`        INT DEFAULT NULL,
  `name`             VARCHAR(150) NOT NULL,
  `slug`             VARCHAR(200) NOT NULL,
  `description`      TEXT,
  `image`            VARCHAR(255) DEFAULT NULL,
  `icon`             VARCHAR(100) DEFAULT NULL,
  `sort_order`       INT DEFAULT '0',
  `is_active`        TINYINT(1) DEFAULT '1',
  `is_featured`      TINYINT(1) DEFAULT '0',
  `meta_title`       VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT,
  `focus_keyword`    VARCHAR(150) DEFAULT NULL,
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`, `slug`),
  KEY `parent_id` (`parent_id`),
  KEY `idx_site` (`site_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- PRODUCTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `products` (
  `id`                  INT NOT NULL AUTO_INCREMENT,
  `site_id`             INT NOT NULL DEFAULT 1,
  `name`                VARCHAR(255) NOT NULL,
  `slug`                VARCHAR(300) NOT NULL,
  `short_description`   VARCHAR(500) DEFAULT NULL,
  `description`         TEXT,
  `price`               DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `sale_price`          DECIMAL(10,2) DEFAULT NULL,
  `cost_price`          DECIMAL(10,2) DEFAULT NULL,
  `sku`                 VARCHAR(100) DEFAULT NULL,
  `barcode`             VARCHAR(100) DEFAULT NULL,
  `stock`               INT DEFAULT '0',
  `low_stock_threshold` INT DEFAULT '5',
  `weight`              DECIMAL(8,2) DEFAULT NULL,
  `unit`                VARCHAR(50) DEFAULT 'piece',
  `brand`               VARCHAR(150) DEFAULT NULL,
  `is_active`           TINYINT(1) DEFAULT '1',
  `is_featured`         TINYINT(1) DEFAULT '0',
  `is_trending`         TINYINT(1) DEFAULT '0',
  `is_new`              TINYINT(1) DEFAULT '0',
  `views`               INT DEFAULT '0',
  `sales_count`         INT DEFAULT '0',
  `avg_rating`          DECIMAL(3,2) DEFAULT '0.00',
  `meta_title`          VARCHAR(255) DEFAULT NULL,
  `meta_description`    TEXT,
  `og_image`            VARCHAR(500) DEFAULT NULL,
  `canonical_url`       VARCHAR(500) DEFAULT NULL,
  `robots`              VARCHAR(100) DEFAULT 'index,follow',
  `focus_keyword`       VARCHAR(150) DEFAULT NULL,
  `schema_json`         JSON,
  `created_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`, `slug`),
  KEY `idx_site` (`site_id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_price` (`price`),
  KEY `idx_featured` (`is_featured`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- PRODUCT CATEGORIES (junction)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `product_categories` (
  `product_id`  INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`product_id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- PRODUCT IMAGES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `product_images` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `alt_text`   VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT '0',
  `is_primary` TINYINT(1) DEFAULT '0',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- PRODUCT VARIATIONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `product_variations` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `name`       VARCHAR(255) NOT NULL COMMENT 'e.g. 500g, Red, Large',
  `sku`        VARCHAR(100) DEFAULT NULL,
  `price`      DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` DECIMAL(10,2) DEFAULT NULL,
  `stock`      INT DEFAULT '0',
  `image_path` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT '0',
  `is_active`  TINYINT(1) DEFAULT '1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `product_variations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- ORDERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `site_id`          INT NOT NULL DEFAULT 1,
  `order_number`     VARCHAR(30) NOT NULL,
  `customer_id`      INT DEFAULT NULL,
  `customer_name`    VARCHAR(150) NOT NULL,
  `customer_email`   VARCHAR(200) DEFAULT NULL,
  `customer_phone`   VARCHAR(20) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `billing_address`  TEXT,
  `subtotal`         DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `discount`         DECIMAL(12,2) DEFAULT '0.00',
  `shipping_charge`  DECIMAL(10,2) DEFAULT '0.00',
  `tax`              DECIMAL(10,2) DEFAULT '0.00',
  `total`            DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  `coupon_code`      VARCHAR(50) DEFAULT NULL,
  `payment_method`   ENUM('cod','online','bank_transfer','stripe','paypal','razorpay') DEFAULT 'cod',
  `payment_status`   ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_id`       VARCHAR(255) DEFAULT NULL,
  `status`           ENUM('pending','confirmed','processing','shipped','delivered','cancelled','returned') DEFAULT 'pending',
  `notes`            TEXT,
  `delivered_at`     DATETIME DEFAULT NULL,
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_site` (`site_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- ORDER ITEMS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `order_id`      INT NOT NULL,
  `product_id`    INT DEFAULT NULL,
  `product_name`  VARCHAR(255) NOT NULL,
  `product_image` VARCHAR(255) DEFAULT NULL,
  `price`         DECIMAL(10,2) NOT NULL,
  `quantity`      INT NOT NULL DEFAULT '1',
  `total`         DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- COUPONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `coupons` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `site_id`          INT NOT NULL DEFAULT 1,
  `code`             VARCHAR(50) NOT NULL,
  `description`      VARCHAR(255) DEFAULT NULL,
  `discount_type`    ENUM('percentage','fixed') DEFAULT 'percentage',
  `discount_value`   DECIMAL(10,2) NOT NULL,
  `min_order_amount` DECIMAL(10,2) DEFAULT '0.00',
  `max_discount`     DECIMAL(10,2) DEFAULT NULL,
  `usage_limit`      INT DEFAULT NULL,
  `used_count`       INT DEFAULT '0',
  `is_active`        TINYINT(1) DEFAULT '1',
  `starts_at`        DATETIME DEFAULT NULL,
  `expires_at`       DATETIME DEFAULT NULL,
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_code` (`site_id`, `code`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- REVIEWS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `reviews` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `site_id`       INT NOT NULL DEFAULT 1,
  `product_id`    INT NOT NULL,
  `customer_id`   INT DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `rating`        TINYINT NOT NULL,
  `comment`       TEXT,
  `is_approved`   TINYINT(1) DEFAULT '0',
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_site` (`site_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` BETWEEN 1 AND 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- BANNERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `banners` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `site_id`        INT NOT NULL DEFAULT 1,
  `title`          VARCHAR(255) DEFAULT NULL,
  `subtitle`       VARCHAR(255) DEFAULT NULL,
  `image`          VARCHAR(255) NOT NULL,
  `mobile_image`   VARCHAR(255) DEFAULT NULL,
  `media_type`     ENUM('image','video') NOT NULL DEFAULT 'image',
  `video`          VARCHAR(500) DEFAULT NULL,
  `mobile_video`   VARCHAR(500) DEFAULT NULL,
  `fallback_image` VARCHAR(255) DEFAULT NULL,
  `link`           VARCHAR(500) DEFAULT NULL,
  `button_text`    VARCHAR(100) DEFAULT NULL,
  `button_color`   VARCHAR(30) DEFAULT '#3BB77E',
  `position`       VARCHAR(50) DEFAULT 'hero',
  `sort_order`     INT DEFAULT '0',
  `is_active`      TINYINT(1) DEFAULT '1',
  `starts_at`      DATETIME DEFAULT NULL,
  `ends_at`        DATETIME DEFAULT NULL,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- HERO PRODUCTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `hero_products` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `site_id`      INT NOT NULL DEFAULT 1,
  `product_id`   INT DEFAULT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `price`        DECIMAL(10,2) NOT NULL,
  `badge`        VARCHAR(50) DEFAULT NULL,
  `image`        VARCHAR(255) NOT NULL,
  `link`         VARCHAR(255) DEFAULT NULL,
  `sort_order`   INT DEFAULT '0',
  `is_featured`  TINYINT DEFAULT '0',
  `is_active`    TINYINT DEFAULT '1',
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- BLOG CATEGORIES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `blog_categories` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `site_id`    INT NOT NULL DEFAULT 1,
  `name`       VARCHAR(150) NOT NULL,
  `slug`       VARCHAR(200) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`, `slug`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- BLOG POSTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `site_id`          INT NOT NULL DEFAULT 1,
  `category_id`      INT DEFAULT NULL,
  `title`            VARCHAR(255) NOT NULL,
  `slug`             VARCHAR(300) NOT NULL,
  `excerpt`          VARCHAR(500) DEFAULT NULL,
  `content`          LONGTEXT,
  `featured_image`   VARCHAR(255) DEFAULT NULL,
  `author`           VARCHAR(100) DEFAULT 'Admin',
  `status`           ENUM('draft','published','archived') DEFAULT 'draft',
  `views`            INT DEFAULT '0',
  `meta_title`       VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT,
  `focus_keyword`    VARCHAR(150) DEFAULT NULL,
  `published_at`     DATETIME DEFAULT NULL,
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`, `slug`),
  KEY `category_id` (`category_id`),
  KEY `idx_site` (`site_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- STATIC PAGES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `pages` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `site_id`          INT NOT NULL DEFAULT 1,
  `title`            VARCHAR(255) NOT NULL,
  `slug`             VARCHAR(300) NOT NULL,
  `content`          LONGTEXT,
  `meta_title`       VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT,
  `is_active`        TINYINT(1) DEFAULT '1',
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`, `slug`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- WISHLISTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `product_id`  INT NOT NULL,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`customer_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- EMAIL QUEUE
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `email_queue` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `order_id`     INT DEFAULT NULL,
  `email_type`   VARCHAR(50) NOT NULL DEFAULT 'order_placed',
  `recipient`    VARCHAR(255) NOT NULL,
  `subject`      VARCHAR(500) NOT NULL,
  `body_html`    LONGTEXT,
  `body_text`    TEXT,
  `attachments`  JSON DEFAULT NULL,
  `status`       ENUM('pending','processing','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
  `attempts`     TINYINT UNSIGNED NOT NULL DEFAULT '0',
  `max_attempts` TINYINT UNSIGNED NOT NULL DEFAULT '3',
  `error_message` TEXT,
  `scheduled_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `processed_at` DATETIME DEFAULT NULL,
  `created_at`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_order` (`order_id`),
  KEY `idx_scheduled` (`status`,`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- EMAIL LOGS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `email_logs` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `queue_id`       INT DEFAULT NULL,
  `order_id`       INT DEFAULT NULL,
  `email_type`     VARCHAR(50) DEFAULT NULL,
  `recipient`      VARCHAR(255) DEFAULT NULL,
  `subject`        VARCHAR(500) DEFAULT NULL,
  `status`         ENUM('sent','failed') NOT NULL,
  `smtp_response`  TEXT,
  `error_message`  TEXT,
  `pdf_path`       VARCHAR(500) DEFAULT NULL,
  `xml_path`       VARCHAR(500) DEFAULT NULL,
  `sent_at`        DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sent` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- INVOICES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `invoices` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `order_id`     INT NOT NULL,
  `order_number` VARCHAR(50) DEFAULT NULL,
  `pdf_path`     VARCHAR(500) DEFAULT NULL,
  `xml_path`     VARCHAR(500) DEFAULT NULL,
  `generated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- SEO OVERRIDES (per URL / entity)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `seo_overrides` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `site_id`          INT NOT NULL DEFAULT 1,
  `entity_type`      ENUM('product','category','blog','page','url') DEFAULT NULL,
  `entity_id`        INT DEFAULT NULL,
  `url_path`         VARCHAR(500) DEFAULT NULL,
  `meta_title`       VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT,
  `og_image`         VARCHAR(500) DEFAULT NULL,
  `canonical_url`    VARCHAR(500) DEFAULT NULL,
  `robots`           VARCHAR(100) DEFAULT 'index,follow',
  `schema_json`      JSON,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_site` (`site_id`),
  KEY `idx_entity` (`entity_type`, `entity_id`),
  KEY `idx_url` (`url_path`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- MODULE REGISTRY (future extensibility)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `module_registry` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `site_id`      INT NOT NULL DEFAULT 1,
  `module_key`   VARCHAR(100) NOT NULL,
  `is_active`    TINYINT(1) DEFAULT 0,
  `config`       JSON,
  `installed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_module` (`site_id`, `module_key`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Register all known modules (inactive by default)
INSERT IGNORE INTO `module_registry` (`site_id`, `module_key`, `is_active`) VALUES
(1, 'wishlist', 0),
(1, 'rewards', 0),
(1, 'affiliate', 0),
(1, 'referral', 0),
(1, 'subscriptions', 0),
(1, 'vendor_marketplace', 0),
(1, 'pos', 0),
(1, 'inventory', 0),
(1, 'multi_warehouse', 0),
(1, 'whatsapp_marketing', 0),
(1, 'email_marketing', 0);

SET foreign_key_checks = 1;
