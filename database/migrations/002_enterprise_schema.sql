-- ============================================================
-- Migration 002: Enterprise Ecommerce Schema
-- Adds: Product Attributes/Variants, Inventory, Order Timeline,
--       Shipping Zones, Payment Gateways, RBAC, Security/Audit
-- Safe to run on existing databases (IF NOT EXISTS throughout)
-- ============================================================

SET NAMES utf8mb4;
SET foreign_key_checks = 0;

-- ──────────────────────────────────────────────
-- PRODUCT ATTRIBUTES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `product_attributes` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `site_id`      INT NOT NULL DEFAULT 1,
  `name`         VARCHAR(100) NOT NULL COMMENT 'e.g. Color, Size, Weight, Flavor',
  `slug`         VARCHAR(120) NOT NULL,
  `type`         ENUM('select','color','text','number') DEFAULT 'select',
  `sort_order`   INT DEFAULT 0,
  `is_required`  TINYINT(1) DEFAULT 0,
  `is_filterable`TINYINT(1) DEFAULT 1,
  `is_active`    TINYINT(1) DEFAULT 1,
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`, `slug`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default attribute definitions
INSERT IGNORE INTO `product_attributes` (`site_id`,`name`,`slug`,`type`,`sort_order`,`is_filterable`) VALUES
(1,'Color',     'color',     'color',  1, 1),
(1,'Size',      'size',      'select', 2, 1),
(1,'Weight',    'weight',    'select', 3, 1),
(1,'Flavor',    'flavor',    'select', 4, 1),
(1,'Pack Size', 'pack-size', 'select', 5, 1);

CREATE TABLE IF NOT EXISTS `product_attribute_values` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `attribute_id` INT NOT NULL,
  `value`        VARCHAR(200) NOT NULL,
  `label`        VARCHAR(200) DEFAULT NULL COMMENT 'Display label if different from value',
  `color_hex`    VARCHAR(7) DEFAULT NULL COMMENT 'For color swatches e.g. #FF0000',
  `sort_order`   INT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `attribute_id` (`attribute_id`),
  CONSTRAINT `pav_fk1` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- PRODUCT VARIANTS
-- Each row = one purchasable combination (e.g. Red + Large)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `product_variants` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `product_id`     INT NOT NULL,
  `site_id`        INT NOT NULL DEFAULT 1,
  `sku`            VARCHAR(150) DEFAULT NULL,
  `barcode`        VARCHAR(100) DEFAULT NULL,
  `price`          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `sale_price`     DECIMAL(10,2) DEFAULT NULL,
  `cost_price`     DECIMAL(10,2) DEFAULT NULL,
  `stock`          INT NOT NULL DEFAULT 0,
  `reserved_stock` INT NOT NULL DEFAULT 0 COMMENT 'Stock held for pending orders',
  `low_stock_threshold` INT DEFAULT 5,
  `weight`         DECIMAL(8,2) DEFAULT NULL COMMENT 'In grams',
  `image_path`     VARCHAR(255) DEFAULT NULL,
  `is_active`      TINYINT(1) DEFAULT 1,
  `sort_order`     INT DEFAULT 0,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_site` (`site_id`),
  KEY `idx_sku` (`sku`),
  CONSTRAINT `pv_fk1` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `variant_attribute_values` (
  `variant_id`   INT NOT NULL,
  `attribute_id` INT NOT NULL,
  `value_id`     INT NOT NULL,
  PRIMARY KEY (`variant_id`,`attribute_id`),
  KEY `attribute_id` (`attribute_id`),
  KEY `value_id` (`value_id`),
  CONSTRAINT `vav_fk1` FOREIGN KEY (`variant_id`)   REFERENCES `product_variants`(`id`) ON DELETE CASCADE,
  CONSTRAINT `vav_fk2` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes`(`id`) ON DELETE CASCADE,
  CONSTRAINT `vav_fk3` FOREIGN KEY (`value_id`)     REFERENCES `product_attribute_values`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- INVENTORY HISTORY (stock movement audit)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `inventory_history` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `site_id`    INT NOT NULL DEFAULT 1,
  `product_id` INT NOT NULL,
  `variant_id` INT DEFAULT NULL,
  `type`       ENUM('sale','return','adjustment','import','reserve','release','damage','expiry') NOT NULL,
  `qty_before` INT NOT NULL,
  `qty_change` INT NOT NULL COMMENT 'Positive=increase, Negative=decrease',
  `qty_after`  INT NOT NULL,
  `reference`  VARCHAR(100) DEFAULT NULL COMMENT 'Order number, import batch ID, etc.',
  `note`       VARCHAR(500) DEFAULT NULL,
  `admin_id`   INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_variant` (`variant_id`),
  KEY `idx_site` (`site_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- ORDER TIMELINE (status history)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `order_timeline` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `order_id`    INT NOT NULL,
  `status`      VARCHAR(50) NOT NULL,
  `title`       VARCHAR(200) NOT NULL,
  `description` TEXT,
  `is_customer_visible` TINYINT(1) DEFAULT 1,
  `admin_id`    INT DEFAULT NULL,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `ot_fk1` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_notes` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `order_id`    INT NOT NULL,
  `type`        ENUM('customer','admin','system') DEFAULT 'admin',
  `note`        TEXT NOT NULL,
  `is_private`  TINYINT(1) DEFAULT 1 COMMENT 'Private = admin only',
  `admin_id`    INT DEFAULT NULL,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `on_fk1` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add variant_id + fulfilled_qty to order_items (safe ALTER)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='order_items' AND COLUMN_NAME='variant_id');
SET @sql = IF(@col_exists=0,
  'ALTER TABLE order_items ADD COLUMN variant_id INT DEFAULT NULL AFTER product_id, ADD INDEX idx_variant (variant_id)',
  'SELECT "order_items.variant_id already exists" AS note');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='order_items' AND COLUMN_NAME='fulfilled_qty');
SET @sql = IF(@col_exists=0,
  'ALTER TABLE order_items ADD COLUMN fulfilled_qty INT NOT NULL DEFAULT 0 AFTER quantity',
  'SELECT "order_items.fulfilled_qty already exists" AS note');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────
-- SHIPPING ZONES & RATES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `shipping_zones` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `site_id`     INT NOT NULL DEFAULT 1,
  `name`        VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `countries`   JSON DEFAULT NULL COMMENT 'Array of country codes this zone covers',
  `is_default`  TINYINT(1) DEFAULT 0,
  `is_active`   TINYINT(1) DEFAULT 1,
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `shipping_zones` (`id`,`site_id`,`name`,`is_default`,`is_active`,`countries`) VALUES
(1, 1, 'Default Zone', 1, 1, '["*"]');

CREATE TABLE IF NOT EXISTS `shipping_zone_postcodes` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `zone_id`    INT NOT NULL,
  `postcode`   VARCHAR(20) NOT NULL COMMENT 'Full code or prefix e.g. B, B1, B11AB',
  `match_type` ENUM('prefix','exact') DEFAULT 'prefix',
  PRIMARY KEY (`id`),
  KEY `zone_id` (`zone_id`),
  CONSTRAINT `szp_fk1` FOREIGN KEY (`zone_id`) REFERENCES `shipping_zones`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `shipping_rates` (
  `id`                INT NOT NULL AUTO_INCREMENT,
  `zone_id`           INT NOT NULL,
  `site_id`           INT NOT NULL DEFAULT 1,
  `name`              VARCHAR(150) NOT NULL,
  `method`            ENUM('flat','weight','free','local','free_above') DEFAULT 'flat',
  `rate`              DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Base rate',
  `rate_per_kg`       DECIMAL(10,4) DEFAULT 0.00 COMMENT 'For weight-based',
  `free_above_amount` DECIMAL(10,2) DEFAULT NULL COMMENT 'Free if order >= this amount',
  `min_weight_g`      INT DEFAULT NULL,
  `max_weight_g`      INT DEFAULT NULL,
  `min_order`         DECIMAL(10,2) DEFAULT 0.00,
  `max_order`         DECIMAL(10,2) DEFAULT NULL,
  `estimated_days_min`INT DEFAULT 1,
  `estimated_days_max`INT DEFAULT 5,
  `is_active`         TINYINT(1) DEFAULT 1,
  `sort_order`        INT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `zone_id` (`zone_id`),
  KEY `idx_site` (`site_id`),
  CONSTRAINT `sr_fk1` FOREIGN KEY (`zone_id`) REFERENCES `shipping_zones`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default shipping rates for zone 1
INSERT IGNORE INTO `shipping_rates` (`id`,`zone_id`,`site_id`,`name`,`method`,`rate`,`free_above_amount`,`estimated_days_min`,`estimated_days_max`) VALUES
(1, 1, 1, 'Standard Delivery', 'flat',       4.99, NULL, 3, 5),
(2, 1, 1, 'Free Delivery',     'free_above',  0.00, 50.00, 3, 5);

-- ──────────────────────────────────────────────
-- PAYMENT GATEWAYS (pluggable, no hardcoding)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `payment_gateways` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `site_id`      INT NOT NULL DEFAULT 1,
  `gateway_key`  VARCHAR(50) NOT NULL COMMENT 'razorpay | stripe | paypal | cod',
  `display_name` VARCHAR(100) NOT NULL,
  `is_enabled`   TINYINT(1) DEFAULT 0,
  `is_test_mode` TINYINT(1) DEFAULT 1,
  `config`       JSON COMMENT 'Encrypted gateway credentials',
  `sort_order`   INT DEFAULT 0,
  `updated_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_gateway` (`site_id`, `gateway_key`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `payment_gateways` (`site_id`,`gateway_key`,`display_name`,`is_enabled`,`sort_order`) VALUES
(1,'cod',      'Cash on Delivery', 1, 1),
(1,'stripe',   'Stripe',           0, 2),
(1,'razorpay', 'Razorpay',         0, 3),
(1,'paypal',   'PayPal',           0, 4);

-- ──────────────────────────────────────────────
-- SAVED CARTS (persistent carts)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `saved_carts` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `site_id`     INT NOT NULL DEFAULT 1,
  `customer_id` INT DEFAULT NULL,
  `session_key` VARCHAR(64) DEFAULT NULL COMMENT 'For guest carts',
  `items`       JSON NOT NULL,
  `coupon_code` VARCHAR(50) DEFAULT NULL,
  `expires_at`  DATETIME DEFAULT NULL,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_session` (`session_key`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- ADMIN ROLES & PERMISSIONS (RBAC)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `admin_roles` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `site_id`     INT DEFAULT NULL COMMENT 'NULL = global role',
  `name`        VARCHAR(50) NOT NULL,
  `display_name`VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `is_system`   TINYINT(1) DEFAULT 0 COMMENT 'System roles cannot be deleted',
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `admin_roles` (`id`,`name`,`display_name`,`description`,`is_system`) VALUES
(1,'super_admin', 'Super Admin', 'Full access to all sites and settings',1),
(2,'site_owner',  'Site Owner',  'Full access to their assigned site',   1),
(3,'manager',     'Manager',     'Manage orders, products, customers',   1),
(4,'editor',      'Editor',      'Manage products and content only',     1),
(5,'staff',       'Staff',       'View orders and process fulfillment',  1);

CREATE TABLE IF NOT EXISTS `admin_permissions` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `role_id`    INT NOT NULL,
  `resource`   VARCHAR(50) NOT NULL COMMENT 'orders|products|customers|settings|reports|admins',
  `can_view`   TINYINT(1) DEFAULT 0,
  `can_create` TINYINT(1) DEFAULT 0,
  `can_edit`   TINYINT(1) DEFAULT 0,
  `can_delete` TINYINT(1) DEFAULT 0,
  `can_export` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_resource` (`role_id`, `resource`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `ap_fk1` FOREIGN KEY (`role_id`) REFERENCES `admin_roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permission matrix: super_admin gets everything
INSERT IGNORE INTO `admin_permissions` (`role_id`,`resource`,`can_view`,`can_create`,`can_edit`,`can_delete`,`can_export`) VALUES
-- super_admin (1)
(1,'products', 1,1,1,1,1),(1,'categories',1,1,1,1,1),(1,'orders',   1,1,1,1,1),
(1,'customers',1,1,1,1,1),(1,'settings',  1,1,1,1,1),(1,'reports',  1,1,1,1,1),
(1,'admins',   1,1,1,1,1),(1,'content',   1,1,1,1,1),(1,'inventory',1,1,1,1,1),
(1,'shipping', 1,1,1,1,1),(1,'payments',  1,1,1,1,1),
-- site_owner (2)
(2,'products', 1,1,1,1,1),(2,'categories',1,1,1,1,1),(2,'orders',   1,1,1,1,1),
(2,'customers',1,1,1,1,1),(2,'settings',  1,1,1,0,1),(2,'reports',  1,0,0,0,1),
(2,'admins',   1,1,1,0,0),(2,'content',   1,1,1,1,1),(2,'inventory',1,1,1,0,1),
(2,'shipping', 1,1,1,1,0),(2,'payments',  1,1,1,0,0),
-- manager (3)
(3,'products', 1,1,1,0,1),(3,'categories',1,1,1,0,0),(3,'orders',   1,1,1,0,1),
(3,'customers',1,0,1,0,1),(3,'settings',  1,0,0,0,0),(3,'reports',  1,0,0,0,1),
(3,'admins',   0,0,0,0,0),(3,'content',   1,1,1,0,0),(3,'inventory',1,1,1,0,0),
(3,'shipping', 1,0,0,0,0),(3,'payments',  1,0,0,0,0),
-- editor (4)
(4,'products', 1,1,1,0,0),(4,'categories',1,1,1,0,0),(4,'orders',   1,0,0,0,0),
(4,'customers',1,0,0,0,0),(4,'settings',  0,0,0,0,0),(4,'reports',  0,0,0,0,0),
(4,'admins',   0,0,0,0,0),(4,'content',   1,1,1,1,0),(4,'inventory',1,0,0,0,0),
(4,'shipping', 0,0,0,0,0),(4,'payments',  0,0,0,0,0),
-- staff (5)
(5,'products', 1,0,0,0,0),(5,'categories',1,0,0,0,0),(5,'orders',   1,1,0,0,0),
(5,'customers',1,0,0,0,0),(5,'settings',  0,0,0,0,0),(5,'reports',  0,0,0,0,0),
(5,'admins',   0,0,0,0,0),(5,'content',   1,0,0,0,0),(5,'inventory',1,0,0,0,0),
(5,'shipping', 0,0,0,0,0),(5,'payments',  0,0,0,0,0);

-- Add role_id to admins table (safe)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='admins' AND COLUMN_NAME='role_id');
SET @sql = IF(@col_exists=0,
  'ALTER TABLE admins ADD COLUMN role_id INT DEFAULT 1 AFTER role, ADD INDEX idx_role_id (role_id)',
  'SELECT "admins.role_id already exists" AS note');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ──────────────────────────────────────────────
-- AUDIT LOGS (admin action trail)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `site_id`     INT NOT NULL DEFAULT 1,
  `admin_id`    INT DEFAULT NULL,
  `admin_email` VARCHAR(200) DEFAULT NULL,
  `action`      VARCHAR(100) NOT NULL COMMENT 'CREATE|UPDATE|DELETE|LOGIN|LOGOUT|EXPORT',
  `resource`    VARCHAR(50) NOT NULL COMMENT 'product|order|setting|admin...',
  `resource_id` VARCHAR(50) DEFAULT NULL,
  `old_value`   JSON,
  `new_value`   JSON,
  `ip_address`  VARCHAR(45) DEFAULT NULL,
  `user_agent`  VARCHAR(500) DEFAULT NULL,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin` (`admin_id`),
  KEY `idx_action` (`action`),
  KEY `idx_resource` (`resource`,`resource_id`),
  KEY `idx_site` (`site_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- RATE LIMIT LOG
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rate_limit_log` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `ip_address` VARCHAR(45) NOT NULL,
  `action`     VARCHAR(100) NOT NULL,
  `hits`       INT NOT NULL DEFAULT 1,
  `window_start` TIMESTAMP NOT NULL,
  `blocked_at`   TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip_action_window` (`ip_address`,`action`,`window_start`),
  KEY `idx_ip` (`ip_address`),
  KEY `idx_window` (`window_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- SECURITY EVENTS (failed logins, suspicious activity)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `security_events` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `site_id`     INT NOT NULL DEFAULT 1,
  `event_type`  ENUM('failed_login','brute_force','rate_limit','invalid_token','suspicious_ip','csrf_fail') NOT NULL,
  `ip_address`  VARCHAR(45) NOT NULL,
  `user_agent`  VARCHAR(500) DEFAULT NULL,
  `email`       VARCHAR(200) DEFAULT NULL,
  `uri`         VARCHAR(500) DEFAULT NULL,
  `detail`      TEXT,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`event_type`),
  KEY `idx_ip`   (`ip_address`),
  KEY `idx_site` (`site_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;
SELECT 'Migration 002 complete — Enterprise schema installed' AS result;
