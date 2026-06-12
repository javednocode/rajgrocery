<?php
/**
 * Dashboard Stats API — Optimized
 * Reduces 7 DB round-trips (revenue loop) to a single GROUP BY query
 * Consolidates count queries
 */

function getDashboardStats($db) {
    try {
        $cached = cacheGet('dashboard_stats');
        if ($cached !== null) {
            successResponse($cached);
            return;
        }

        $today = date('Y-m-d');
        $monthStart = date('Y-m-01');

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

    // ── Product/customer/category counts in one round-trip ───────────
    $counts = $db->query("
        SELECT
            (SELECT COUNT(*) FROM products)                                               as total_products,
            (SELECT COUNT(*) FROM customers)                                              as total_customers,
            (SELECT COUNT(*) FROM categories)                                             as total_categories,
            (SELECT COUNT(*) FROM products WHERE stock <= low_stock_threshold AND stock > 0 AND is_active = 1) as low_stock,
            (SELECT COUNT(*) FROM products WHERE stock = 0 AND is_active = 1)            as out_of_stock
    ")->fetch();

    // ── Order status breakdown ────────────────────────────────────────
    $statusBreakdown = $db->query("SELECT status, COUNT(*) as count FROM orders GROUP BY status")->fetchAll();

    // ── Recent orders ─────────────────────────────────────────────────
    $recentOrders = $db->query("
        SELECT id, order_number, customer_name, total, status, payment_status, created_at
        FROM orders ORDER BY created_at DESC LIMIT 10
    ")->fetchAll();

    // ── Top products ──────────────────────────────────────────────────
    $topProducts = $db->query("
        SELECT p.id, p.name, p.slug, p.sales_count, p.price,
            (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p
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
