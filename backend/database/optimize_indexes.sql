-- ============================================================
-- White-label ecommerce MySQL performance indexes
-- Run this in phpMyAdmin on Hostinger after upload
-- Safe to run multiple times (uses IF NOT EXISTS pattern)
-- Database: configure this in your hosting control panel
-- ============================================================

-- ── products table indexes ───────────────────────────────────
ALTER TABLE `products`
    ADD INDEX IF NOT EXISTS `idx_prod_active_date`    (`is_active`, `created_at` DESC),
    ADD INDEX IF NOT EXISTS `idx_prod_featured`       (`is_featured`, `is_active`),
    ADD INDEX IF NOT EXISTS `idx_prod_trending`       (`is_trending`, `is_active`),
    ADD INDEX IF NOT EXISTS `idx_prod_active_sales`   (`is_active`, `sales_count` DESC),
    ADD INDEX IF NOT EXISTS `idx_prod_brand`          (`brand`),
    ADD INDEX IF NOT EXISTS `idx_prod_stock`          (`stock`),
    ADD INDEX IF NOT EXISTS `idx_prod_name`           (`name`(50)),
    ADD INDEX IF NOT EXISTS `idx_prod_sku`            (`sku`);

-- ── product_images table indexes ────────────────────────────
ALTER TABLE `product_images`
    ADD INDEX IF NOT EXISTS `idx_pimg_product_primary` (`product_id`, `is_primary`),
    ADD INDEX IF NOT EXISTS `idx_pimg_sort`            (`product_id`, `sort_order`);

-- ── product_categories table indexes ────────────────────────
ALTER TABLE `product_categories`
    ADD INDEX IF NOT EXISTS `idx_pcat_product`  (`product_id`),
    ADD INDEX IF NOT EXISTS `idx_pcat_category` (`category_id`);

-- ── categories table indexes ─────────────────────────────────
ALTER TABLE `categories`
    ADD INDEX IF NOT EXISTS `idx_cat_active_sort`   (`is_active`, `sort_order`),
    ADD INDEX IF NOT EXISTS `idx_cat_featured`      (`is_featured`, `is_active`),
    ADD INDEX IF NOT EXISTS `idx_cat_parent`        (`parent_id`);

-- ── orders table indexes ─────────────────────────────────────
ALTER TABLE `orders`
    ADD INDEX IF NOT EXISTS `idx_ord_created`    (`created_at`),
    ADD INDEX IF NOT EXISTS `idx_ord_status`     (`status`),
    ADD INDEX IF NOT EXISTS `idx_ord_date_status`(`created_at`, `status`);

-- ── banners table indexes ────────────────────────────────────
ALTER TABLE `banners`
    ADD INDEX IF NOT EXISTS `idx_ban_active_pos` (`is_active`, `position`, `sort_order`);

-- ── site_settings index ──────────────────────────────────────
ALTER TABLE `site_settings`
    ADD INDEX IF NOT EXISTS `idx_settings_key` (`setting_key`);

-- ── FULLTEXT search on products (faster LIKE search) ─────────
-- Only add if not already exists
SET @exist := (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'products'
      AND index_name = 'ft_prod_search'
);
SET @sql := IF(@exist = 0,
    'ALTER TABLE products ADD FULLTEXT INDEX ft_prod_search (name, brand, short_description)',
    'SELECT "fulltext index already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Optimize all tables (reclaim space, update stats) ────────
OPTIMIZE TABLE `products`;
OPTIMIZE TABLE `product_images`;
OPTIMIZE TABLE `product_categories`;
OPTIMIZE TABLE `categories`;
OPTIMIZE TABLE `orders`;
OPTIMIZE TABLE `banners`;
OPTIMIZE TABLE `site_settings`;

-- ── Analyze tables (update query optimizer statistics) ───────
ANALYZE TABLE `products`;
ANALYZE TABLE `product_images`;
ANALYZE TABLE `product_categories`;
ANALYZE TABLE `categories`;
ANALYZE TABLE `orders`;

-- Done! All indexes created and tables optimized.
-- Check with: SHOW INDEX FROM products;
