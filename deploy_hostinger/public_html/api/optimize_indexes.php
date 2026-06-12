<?php
/**
 * Database Index Optimization — COMPREHENSIVE
 * Run ONCE after deployment: POST /api/optimize-indexes (admin only)
 *
 * Covers EVERY table and EVERY query pattern found in the codebase.
 * Safe to run multiple times — skips existing indexes.
 */

function optimizeIndexes($db) {
    $results = [];

    $indexes = [

        // ═══════════════════════════════════════════════════════════════════
        // products — the most queried table
        // ═══════════════════════════════════════════════════════════════════

        // Slug lookup: getProductBySlug() — WHERE slug = :slug AND is_active = 1
        ['products', 'idx_prod_slug', 'slug'],

        // Active filter: every public query — WHERE is_active = 1
        ['products', 'idx_prod_is_active', 'is_active'],

        // Default sort: ORDER BY created_at DESC
        ['products', 'idx_prod_created', 'created_at'],

        // Popular sort: ORDER BY sales_count DESC
        ['products', 'idx_prod_sales', 'sales_count'],

        // Featured products: WHERE is_active = 1 AND is_featured = 1
        ['products', 'idx_prod_featured', 'is_active, is_featured'],

        // Trending products: WHERE is_active = 1 AND is_trending = 1
        ['products', 'idx_prod_trending', 'is_active, is_trending'],

        // Dashboard: WHERE stock <= low_stock_threshold AND stock > 0 AND is_active = 1
        ['products', 'idx_prod_stock', 'is_active, stock'],

        // Search: WHERE name LIKE, sku LIKE, short_description LIKE
        // (LIKE '%x%' can't use B-tree, but name prefix search LIKE 'x%' benefits)
        ['products', 'idx_prod_name', 'name'],
        ['products', 'idx_prod_sku', 'sku'],
        ['products', 'idx_prod_brand', 'brand'],


        // ═══════════════════════════════════════════════════════════════════
        // product_categories — junction table, used in EVERY category filter
        // ═══════════════════════════════════════════════════════════════════

        // INNER JOIN product_categories pc ON pc.product_id = p.id
        ['product_categories', 'idx_pc_product_id', 'product_id'],

        // JOIN categories c ON pc.category_id = c.id
        ['product_categories', 'idx_pc_category_id', 'category_id'],

        // Composite covering index for both JOIN directions + uniqueness
        ['product_categories', 'idx_pc_product_category', 'product_id, category_id'],

        // Reverse composite for category → products direction
        ['product_categories', 'idx_pc_category_product', 'category_id, product_id'],


        // ═══════════════════════════════════════════════════════════════════
        // product_images — queried on EVERY product listing + detail page
        // ═══════════════════════════════════════════════════════════════════

        // batchLoadImages: WHERE product_id IN (...) ORDER BY is_primary DESC, sort_order
        ['product_images', 'idx_pi_product_id', 'product_id'],

        // Primary image subquery: WHERE product_id = ? AND is_primary = 1
        ['product_images', 'idx_pi_product_primary', 'product_id, is_primary'],

        // Full covering for image listings: sort_order used in ORDER BY
        ['product_images', 'idx_pi_product_sort', 'product_id, is_primary, sort_order'],


        // ═══════════════════════════════════════════════════════════════════
        // product_variations — queried on product detail page
        // ═══════════════════════════════════════════════════════════════════

        // WHERE product_id = :pid ORDER BY sort_order ASC, id ASC
        ['product_variations', 'idx_pv_product_id', 'product_id'],

        // Composite for active variations
        ['product_variations', 'idx_pv_product_active', 'product_id, is_active'],


        // ═══════════════════════════════════════════════════════════════════
        // categories
        // ═══════════════════════════════════════════════════════════════════

        // Slug lookup: getCategoryBySlug() — WHERE slug = :slug AND is_active = 1
        ['categories', 'idx_cat_slug', 'slug'],

        // Active filter
        ['categories', 'idx_cat_active', 'is_active'],

        // Parent lookup: buildCategoryTree, getDescendantCategoryIds
        ['categories', 'idx_cat_parent', 'parent_id'],

        // Featured categories: WHERE is_active = 1 AND is_featured = 1
        ['categories', 'idx_cat_featured', 'is_active, is_featured'],

        // Sort: ORDER BY sort_order ASC
        ['categories', 'idx_cat_sort', 'sort_order'],


        // ═══════════════════════════════════════════════════════════════════
        // orders — admin dashboard, order listing, tracking
        // ═══════════════════════════════════════════════════════════════════

        // Order listing: ORDER BY created_at DESC
        ['orders', 'idx_ord_created', 'created_at'],

        // Filter by status: WHERE status = :status
        ['orders', 'idx_ord_status', 'status'],

        // Track order: WHERE order_number = :num
        ['orders', 'idx_ord_number', 'order_number'],

        // Dashboard: WHERE DATE(created_at), GROUP BY status
        // Composite for date range + status queries
        ['orders', 'idx_ord_status_created', 'status, created_at'],

        // Customer lookup (if customer_id column exists)
        ['orders', 'idx_ord_customer_email', 'customer_email'],

        // Search: customer_name, customer_phone
        ['orders', 'idx_ord_customer_name', 'customer_name'],
        ['orders', 'idx_ord_customer_phone', 'customer_phone'],

        // Payment status filter
        ['orders', 'idx_ord_payment_status', 'payment_status'],


        // ═══════════════════════════════════════════════════════════════════
        // order_items — loaded for every order
        // ═══════════════════════════════════════════════════════════════════

        // WHERE order_id = :oid
        ['order_items', 'idx_oi_order_id', 'order_id'],

        // Product lookup for stock updates
        ['order_items', 'idx_oi_product_id', 'product_id'],


        // ═══════════════════════════════════════════════════════════════════
        // customers
        // ═══════════════════════════════════════════════════════════════════

        // Duplicate check: WHERE email = :email
        ['customers', 'idx_cust_email', 'email'],

        // Order listing: ORDER BY created_at DESC
        ['customers', 'idx_cust_created', 'created_at'],

        // Search: name, phone
        ['customers', 'idx_cust_name', 'name'],
        ['customers', 'idx_cust_phone', 'phone'],


        // ═══════════════════════════════════════════════════════════════════
        // site_settings — queried on EVERY page load (settings, delivery)
        // ═══════════════════════════════════════════════════════════════════

        // WHERE setting_key = :key
        ['site_settings', 'idx_ss_key', 'setting_key'],

        // WHERE setting_group = 'delivery'
        ['site_settings', 'idx_ss_group', 'setting_group'],

        // Composite for group queries
        ['site_settings', 'idx_ss_group_key', 'setting_group, setting_key'],


        // ═══════════════════════════════════════════════════════════════════
        // blog_posts
        // ═══════════════════════════════════════════════════════════════════

        // Slug lookup: WHERE slug = :slug AND status = 'published'
        ['blog_posts', 'idx_blog_slug', 'slug'],

        // Status filter: WHERE status = 'published'
        ['blog_posts', 'idx_blog_status', 'status'],

        // Sort: ORDER BY created_at DESC
        ['blog_posts', 'idx_blog_created', 'created_at'],

        // Composite for public listing
        ['blog_posts', 'idx_blog_status_created', 'status, created_at'],

        // Category join
        ['blog_posts', 'idx_blog_category', 'category_id'],


        // ═══════════════════════════════════════════════════════════════════
        // banners
        // ═══════════════════════════════════════════════════════════════════

        // Active banners: WHERE is_active = 1 AND position = 'hero'
        ['banners', 'idx_ban_active', 'is_active'],
        ['banners', 'idx_ban_position', 'position'],
        ['banners', 'idx_ban_sort', 'sort_order'],
        ['banners', 'idx_ban_active_pos', 'is_active, position'],


        // ═══════════════════════════════════════════════════════════════════
        // hero_products
        // ═══════════════════════════════════════════════════════════════════

        // WHERE is_active = 1, JOIN products ON product_id
        ['hero_products', 'idx_hp_active', 'is_active'],
        ['hero_products', 'idx_hp_product', 'product_id'],
        ['hero_products', 'idx_hp_sort', 'sort_order'],


        // ═══════════════════════════════════════════════════════════════════
        // coupons
        // ═══════════════════════════════════════════════════════════════════

        // WHERE code = :code AND is_active = 1
        ['coupons', 'idx_coupon_code', 'code'],
        ['coupons', 'idx_coupon_active', 'is_active'],


        // ═══════════════════════════════════════════════════════════════════
        // email_logs
        // ═══════════════════════════════════════════════════════════════════

        ['email_logs', 'idx_elog_status', 'status'],
        ['email_logs', 'idx_elog_order', 'order_id'],
        ['email_logs', 'idx_elog_sent', 'sent_at'],


        // ═══════════════════════════════════════════════════════════════════
        // email_queue
        // ═══════════════════════════════════════════════════════════════════

        ['email_queue', 'idx_eq_status', 'status'],
        ['email_queue', 'idx_eq_created', 'created_at'],
        ['email_queue', 'idx_eq_order', 'order_id'],
        ['email_queue', 'idx_eq_scheduled', 'status, scheduled_at'],

    ];

    foreach ($indexes as [$table, $indexName, $columns]) {
        try {
            // Check if table exists first
            $tableCheck = $db->query("SHOW TABLES LIKE '$table'");
            if ($tableCheck->rowCount() === 0) {
                $results[] = "SKIP: Table '$table' does not exist";
                continue;
            }

            // Check if index already exists
            $check = $db->prepare("SHOW INDEX FROM `$table` WHERE Key_name = :name");
            $check->execute([':name' => $indexName]);
            if ($check->fetch()) {
                $results[] = "SKIP: $table.$indexName already exists";
                continue;
            }

            // Check if column(s) exist
            $cols = array_map('trim', explode(',', $columns));
            $existingCols = $db->query("SHOW COLUMNS FROM `$table`")->fetchAll(PDO::FETCH_COLUMN);
            $missingCols = array_diff($cols, $existingCols);
            if (!empty($missingCols)) {
                $results[] = "SKIP: $table.$indexName — column(s) missing: " . implode(', ', $missingCols);
                continue;
            }

            $db->exec("CREATE INDEX `$indexName` ON `$table` ($columns)");
            $results[] = "✅ CREATED: $table.$indexName ON ($columns)";
        } catch (Exception $e) {
            $msg = $e->getMessage();
            if (strpos($msg, 'Duplicate') !== false || strpos($msg, 'exists') !== false) {
                $results[] = "SKIP: $table.$indexName already exists (duplicate)";
            } else {
                $results[] = "❌ ERROR: $table.$indexName — $msg";
            }
        }
    }

    // ── Run ANALYZE TABLE on all tables to update optimizer statistics ──
    $allTables = [
        'products', 'product_categories', 'product_images', 'product_variations',
        'categories', 'orders', 'order_items', 'customers', 'site_settings',
        'blog_posts', 'banners', 'hero_products', 'coupons',
        'email_logs', 'email_queue'
    ];
    foreach ($allTables as $table) {
        try {
            $tableCheck = $db->query("SHOW TABLES LIKE '$table'");
            if ($tableCheck->rowCount() > 0) {
                $db->exec("ANALYZE TABLE `$table`");
                $results[] = "📊 ANALYZED: $table";
            }
        } catch (Exception $e) {
            $results[] = "ANALYZE skip: $table";
        }
    }

    // ── Summary ──
    $created = count(array_filter($results, fn($r) => strpos($r, '✅') === 0));
    $skipped = count(array_filter($results, fn($r) => strpos($r, 'SKIP') === 0));
    $errors  = count(array_filter($results, fn($r) => strpos($r, '❌') === 0));
    $analyzed = count(array_filter($results, fn($r) => strpos($r, '📊') === 0));

    successResponse([
        'summary' => [
            'created'  => $created,
            'skipped'  => $skipped,
            'errors'   => $errors,
            'analyzed' => $analyzed,
        ],
        'details' => $results
    ], "Index optimization complete: $created created, $skipped skipped, $errors errors, $analyzed tables analyzed");
}
