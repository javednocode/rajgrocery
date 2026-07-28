<?php
/**
 * Reports & Analytics API
 *
 * GET /api/reports/revenue        — revenue by period
 * GET /api/reports/orders         — orders over time
 * GET /api/reports/products       — top products
 * GET /api/reports/customers      — customer stats
 * GET /api/reports/conversion     — order conversion funnel
 * GET /api/reports/summary        — KPI dashboard summary
 * GET /api/reports/export         — CSV export (admin only)
 */

function getReportsSummary(PDO $db): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $today  = date('Y-m-d');
    $month  = date('Y-m-01');
    $prevMonth = date('Y-m-01', strtotime('-1 month'));
    $prevEnd   = date('Y-m-t', strtotime('-1 month'));

    $cacheKey = "reports_summary_{$siteId}_{$today}";
    if (function_exists('cacheGet') && ($cached = cacheGet($cacheKey)) !== null) {
        successResponse($cached); return;
    }

    // Revenue this month
    $rev = $db->prepare("SELECT
        COALESCE(SUM(total), 0) AS revenue,
        COUNT(*) AS orders
        FROM orders WHERE site_id = :s AND status NOT IN ('cancelled')
        AND created_at >= :m");
    $rev->execute([':s' => $siteId, ':m' => $month]);
    $thisMonth = $rev->fetch();

    // Revenue last month
    $revPrev = $db->prepare("SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
        FROM orders WHERE site_id = :s AND status NOT IN ('cancelled')
        AND created_at BETWEEN :pm AND :pe");
    $revPrev->execute([':s' => $siteId, ':pm' => $prevMonth, ':pe' => $prevEnd . ' 23:59:59']);
    $lastMonth = $revPrev->fetch();

    // Today's orders
    $todayStmt = $db->prepare("SELECT COUNT(*) AS count, COALESCE(SUM(total),0) AS revenue
        FROM orders WHERE site_id = :s AND DATE(created_at) = :d");
    $todayStmt->execute([':s' => $siteId, ':d' => $today]);
    $todayData = $todayStmt->fetch();

    // Active customers
    $custStmt = $db->prepare("SELECT COUNT(*) AS total FROM customers WHERE site_id = :s");
    $custStmt->execute([':s' => $siteId]);
    $customers = $custStmt->fetchColumn();

    // Pending orders
    $pendingStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE site_id = :s AND status = 'pending'");
    $pendingStmt->execute([':s' => $siteId]);
    $pending = $pendingStmt->fetchColumn();

    // Low stock count
    $stockStmt = $db->prepare("SELECT COUNT(*) FROM products WHERE site_id = :s AND is_active = 1 AND stock <= COALESCE(low_stock_threshold, 5)");
    $stockStmt->execute([':s' => $siteId]);
    $lowStock = $stockStmt->fetchColumn();

    // Products count
    $prodStmt = $db->prepare("SELECT COUNT(*) FROM products WHERE site_id = :s AND is_active = 1");
    $prodStmt->execute([':s' => $siteId]);
    $products = $prodStmt->fetchColumn();

    $revChange = $lastMonth['revenue'] > 0
        ? round((($thisMonth['revenue'] - $lastMonth['revenue']) / $lastMonth['revenue']) * 100, 1)
        : 0;

    $summary = [
        'today' => [
            'orders'  => (int)$todayData['count'],
            'revenue' => (float)$todayData['revenue'],
        ],
        'this_month' => [
            'revenue'      => (float)$thisMonth['revenue'],
            'orders'       => (int)$thisMonth['orders'],
            'revenue_change'=> $revChange,
        ],
        'last_month' => [
            'revenue' => (float)$lastMonth['revenue'],
            'orders'  => (int)$lastMonth['orders'],
        ],
        'totals' => [
            'customers'     => (int)$customers,
            'products'      => (int)$products,
            'pending_orders'=> (int)$pending,
            'low_stock'     => (int)$lowStock,
        ],
    ];

    if (function_exists('cacheSet')) cacheSet($cacheKey, $summary, 300);
    successResponse($summary);
}

function getRevenueReport(PDO $db): void {
    $siteId   = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $period   = $_GET['period'] ?? 'month'; // day, week, month, year
    $from     = $_GET['from'] ?? date('Y-m-01');
    $to       = $_GET['to']   ?? date('Y-m-t');

    $groupBy = match($period) {
        'day'   => 'DATE(created_at)',
        'week'  => 'YEARWEEK(created_at, 1)',
        'month' => 'DATE_FORMAT(created_at, "%Y-%m")',
        'year'  => 'YEAR(created_at)',
        default => 'DATE(created_at)',
    };

    $stmt = $db->prepare("SELECT
        $groupBy AS period,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS revenue,
        COALESCE(AVG(total), 0) AS avg_order_value,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
        FROM orders
        WHERE site_id = :s
          AND created_at >= :from AND created_at <= :to
          AND status NOT IN ('cancelled')
        GROUP BY $groupBy
        ORDER BY period ASC");
    $stmt->execute([':s' => $siteId, ':from' => $from . ' 00:00:00', ':to' => $to . ' 23:59:59']);
    successResponse($stmt->fetchAll());
}

function getTopProductsReport(PDO $db): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $limit  = min(50, max(5, (int)($_GET['limit'] ?? 10)));
    $from   = $_GET['from'] ?? date('Y-m-01');
    $to     = $_GET['to']   ?? date('Y-m-t');

    $stmt = $db->prepare("SELECT
        oi.product_name,
        oi.product_id,
        SUM(oi.quantity) AS units_sold,
        SUM(oi.total_price) AS revenue,
        COUNT(DISTINCT oi.order_id) AS order_count
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.site_id = :s
          AND o.created_at >= :from AND o.created_at <= :to
          AND o.status NOT IN ('cancelled')
        GROUP BY oi.product_id, oi.product_name
        ORDER BY revenue DESC
        LIMIT :lim");
    $stmt->bindValue(':s', $siteId);
    $stmt->bindValue(':from', $from . ' 00:00:00');
    $stmt->bindValue(':to',   $to   . ' 23:59:59');
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    successResponse($stmt->fetchAll());
}

function getCustomersReport(PDO $db): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $from   = $_GET['from'] ?? date('Y-m-01');
    $to     = $_GET['to']   ?? date('Y-m-t');

    // New customers by period
    $newStmt = $db->prepare("SELECT DATE(created_at) AS day, COUNT(*) AS new_customers
        FROM customers WHERE site_id = :s AND created_at BETWEEN :f AND :t
        GROUP BY DATE(created_at) ORDER BY day");
    $newStmt->execute([':s' => $siteId, ':f' => $from, ':t' => $to . ' 23:59:59']);

    // Top customers by spend
    $topStmt = $db->prepare("SELECT o.customer_name, o.customer_email,
        COUNT(*) AS orders, SUM(o.total) AS total_spend
        FROM orders o WHERE o.site_id = :s AND o.status != 'cancelled'
        GROUP BY o.customer_email, o.customer_name
        ORDER BY total_spend DESC LIMIT 10");
    $topStmt->execute([':s' => $siteId]);

    successResponse([
        'new_by_day'    => $newStmt->fetchAll(),
        'top_customers' => $topStmt->fetchAll(),
    ]);
}

function getConversionReport(PDO $db): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    $stmt = $db->prepare("SELECT
        status,
        COUNT(*) AS count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders WHERE site_id = :s2), 1) AS pct
        FROM orders WHERE site_id = :s GROUP BY status ORDER BY count DESC");
    $stmt->execute([':s' => $siteId, ':s2' => $siteId]);
    $byStatus = $stmt->fetchAll();

    $payStmt = $db->prepare("SELECT payment_status, COUNT(*) AS count
        FROM orders WHERE site_id = :s GROUP BY payment_status");
    $payStmt->execute([':s' => $siteId]);

    successResponse([
        'by_status'         => $byStatus,
        'by_payment_status' => $payStmt->fetchAll(),
    ]);
}

function exportReport(PDO $db): void {
    requireAuth();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $type   = $_GET['type'] ?? 'orders';
    $from   = $_GET['from'] ?? date('Y-m-01');
    $to     = $_GET['to']   ?? date('Y-m-t');

    $rows = [];
    $headers = [];

    if ($type === 'orders') {
        $headers = ['Order Number', 'Date', 'Customer', 'Email', 'Phone', 'Status', 'Payment', 'Total', 'Items'];
        $stmt = $db->prepare("SELECT o.order_number, o.created_at, o.customer_name, o.customer_email, o.customer_phone,
            o.status, o.payment_status, o.total,
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
            FROM orders o WHERE o.site_id = :s AND o.created_at BETWEEN :f AND :t ORDER BY o.created_at DESC");
        $stmt->execute([':s' => $siteId, ':f' => $from, ':t' => $to . ' 23:59:59']);
        $rows = $stmt->fetchAll(PDO::FETCH_NUM);
    } elseif ($type === 'products') {
        $headers = ['ID', 'Name', 'SKU', 'Price', 'Stock', 'Status', 'Featured'];
        $stmt = $db->prepare("SELECT id, name, sku, price, stock, is_active, is_featured FROM products WHERE site_id = :s ORDER BY name");
        $stmt->execute([':s' => $siteId]);
        $rows = $stmt->fetchAll(PDO::FETCH_NUM);
    } elseif ($type === 'customers') {
        $headers = ['ID', 'Name', 'Email', 'Phone', 'Joined', 'Orders'];
        $stmt = $db->prepare("SELECT c.id, c.name, c.email, c.phone, c.created_at,
            (SELECT COUNT(*) FROM orders WHERE customer_email = c.email AND site_id = :s2) AS orders
            FROM customers c WHERE c.site_id = :s ORDER BY c.created_at DESC");
        $stmt->execute([':s' => $siteId, ':s2' => $siteId]);
        $rows = $stmt->fetchAll(PDO::FETCH_NUM);
    }

    // Stream CSV
    $filename = $type . '_' . date('Y-m-d') . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header("Content-Disposition: attachment; filename=\"{$filename}\"");
    header('Cache-Control: no-store');

    $out = fopen('php://output', 'w');
    fputcsv($out, $headers);
    foreach ($rows as $row) fputcsv($out, $row);
    fclose($out);
    exit;
}
