<?php
/**
 * Dashboard Stats API — Optimized
 * Reduces 7 DB round-trips (revenue loop) to a single GROUP BY query
 * Consolidates count queries
 */

function getDashboardStats($db) {
    try {
        // Country filter — admin can pass ?country_id=N to scope the dashboard
        $countryId = (int)($_GET['country_id'] ?? 0);
        $cacheKey = 'dashboard_stats' . ($countryId ? '_c' . $countryId : '');
        $cached = cacheGet($cacheKey);
        if ($cached !== null) {
            successResponse($cached);
            return;
        }

        $today = date('Y-m-d');
        $monthStart = date('Y-m-01');

        // Country join for scoping products/categories to a specific country
        $productCountryJoin = $countryId
            ? "INNER JOIN product_countries pc_dash ON pc_dash.product_id = p.id AND pc_dash.country_id = $countryId"
            : "";
        $catCountryJoin = $countryId
            ? "INNER JOIN category_countries cc_dash ON cc_dash.category_id = c.id AND cc_dash.country_id = $countryId"
            : "";

        // ── Single query for all order aggregates ────────────────────────
        $orderStats = $db->query("
            SELECT
                COALESCE(SUM(CASE WHEN DATE(created_at) = '$today' THEN 1 ELSE 0 END), 0)               as today_count,
                COALESCE(SUM(CASE WHEN DATE(created_at) = '$today' THEN total ELSE 0 END), 0)            as today_revenue,
                COALESCE(SUM(CASE WHEN created_at >= '$monthStart' THEN 1 ELSE 0 END), 0)                as month_count,
                COALESCE(SUM(CASE WHEN created_at >= '$monthStart' THEN total ELSE 0 END), 0)            as month_revenue,
                COUNT(*)                                                                                   as total_count,
                COALESCE(SUM(total), 0)                                                                   as total_revenue
            FROM orders
        ")->fetch();

    // ── Product/customer/category counts — scoped by country if selected ─
    $productCountSql = $countryId
        ? "SELECT COUNT(DISTINCT p.id) FROM products p INNER JOIN product_countries pc_cnt ON pc_cnt.product_id = p.id AND pc_cnt.country_id = $countryId"
        : "SELECT COUNT(*) FROM products";
    $catCountSql = $countryId
        ? "SELECT COUNT(DISTINCT c.id) FROM categories c INNER JOIN category_countries cc_cnt ON cc_cnt.category_id = c.id AND cc_cnt.country_id = $countryId"
        : "SELECT COUNT(*) FROM categories";
    $lowStockSql = $countryId
        ? "SELECT COUNT(DISTINCT p.id) FROM products p INNER JOIN product_countries pc_ls ON pc_ls.product_id = p.id AND pc_ls.country_id = $countryId WHERE p.stock <= p.low_stock_threshold AND p.stock > 0 AND p.is_active = 1"
        : "SELECT COUNT(*) FROM products WHERE stock <= low_stock_threshold AND stock > 0 AND is_active = 1";
    $oosSql = $countryId
        ? "SELECT COUNT(DISTINCT p.id) FROM products p INNER JOIN product_countries pc_oos ON pc_oos.product_id = p.id AND pc_oos.country_id = $countryId WHERE p.stock = 0 AND p.is_active = 1"
        : "SELECT COUNT(*) FROM products WHERE stock = 0 AND is_active = 1";

    $counts = [
        'total_products'   => (int)$db->query($productCountSql)->fetchColumn(),
        'total_customers'  => (int)$db->query("SELECT COUNT(*) FROM customers")->fetchColumn(),
        'total_categories' => (int)$db->query($catCountSql)->fetchColumn(),
        'low_stock'        => (int)$db->query($lowStockSql)->fetchColumn(),
        'out_of_stock'     => (int)$db->query($oosSql)->fetchColumn(),
    ];

    // ── Order status breakdown ────────────────────────────────────────
    $statusBreakdown = $db->query("SELECT status, COUNT(*) as count FROM orders GROUP BY status")->fetchAll();

    // ── Recent orders ─────────────────────────────────────────────────
    $recentOrders = $db->query("
        SELECT id, order_number, customer_name, total, status, payment_status, created_at
        FROM orders ORDER BY created_at DESC LIMIT 10
    ")->fetchAll();

    // ── Top products — scoped by country ─────────────────────────────
    $topProductsJoin = $countryId
        ? "INNER JOIN product_countries pc_top ON pc_top.product_id = p.id AND pc_top.country_id = $countryId"
        : "";
    $topProducts = $db->query("
        SELECT p.id, p.name, p.slug, p.sales_count, p.price,
            (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p $topProductsJoin
        WHERE p.is_active = 1
        ORDER BY p.sales_count DESC LIMIT 5
    ")->fetchAll();

    // ── Revenue last 7 days — SINGLE query with GROUP BY ─────────────
    $revenueRows = $db->query("
        SELECT DATE(created_at) as date, COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ")->fetchAll(PDO::FETCH_KEY_PAIR);

    // Fill in missing days (where no orders exist)
    $revenueChart = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $revenueChart[] = [
            'date'    => $date,
            'revenue' => (float)($revenueRows[$date] ?? 0)
        ];
    }

    $response = [
        'today'            => ['orders' => (int)$orderStats['today_count'],  'revenue' => (float)$orderStats['today_revenue']],
        'month'            => ['orders' => (int)$orderStats['month_count'],  'revenue' => (float)$orderStats['month_revenue']],
        'total'            => [
            'orders'     => (int)$orderStats['total_count'],
            'revenue'    => (float)$orderStats['total_revenue'],
            'products'   => (int)$counts['total_products'],
            'customers'  => (int)$counts['total_customers'],
            'categories' => (int)$counts['total_categories'],
        ],
        'stock'            => ['low_stock' => (int)$counts['low_stock'], 'out_of_stock' => (int)$counts['out_of_stock']],
        'status_breakdown' => $statusBreakdown,
        'recent_orders'    => $recentOrders,
        'top_products'     => $topProducts,
        'revenue_chart'    => $revenueChart,
    ];

        cacheSet('dashboard_stats', $response, 30);
        successResponse($response);
    } catch (Throwable $e) {
        error_log('Dashboard stats failed: ' . $e->getMessage());
        errorResponse('Dashboard database error. Import database/hostinger_schema_repair.sql, then refresh.', 500);
    }
}
