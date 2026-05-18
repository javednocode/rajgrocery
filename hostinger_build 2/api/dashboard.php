<?php
/**
 * Dashboard Stats API
 */

function getDashboardStats($db) {
    // Today's stats
    $today = date('Y-m-d');
    $todayOrders = $db->query("SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue FROM orders WHERE DATE(created_at) = '$today'")->fetch();
    
    // This month
    $monthStart = date('Y-m-01');
    $monthOrders = $db->query("SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue FROM orders WHERE created_at >= '$monthStart'")->fetch();
    
    // Total stats
    $totalOrders = $db->query("SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue FROM orders")->fetch();
    $totalProducts = $db->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $totalCustomers = $db->query("SELECT COUNT(*) FROM customers")->fetchColumn();
    $totalCategories = $db->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    
    // Low stock products
    $lowStock = $db->query("SELECT COUNT(*) FROM products WHERE stock <= low_stock_threshold AND stock > 0 AND is_active = 1")->fetchColumn();
    $outOfStock = $db->query("SELECT COUNT(*) FROM products WHERE stock = 0 AND is_active = 1")->fetchColumn();
    
    // Order status breakdown
    $statusBreakdown = $db->query("SELECT status, COUNT(*) as count FROM orders GROUP BY status")->fetchAll();
    
    // Recent orders
    $recentOrders = $db->query("SELECT id, order_number, customer_name, total, status, payment_status, created_at FROM orders ORDER BY created_at DESC LIMIT 10")->fetchAll();
    
    // Top products
    $topProducts = $db->query("SELECT p.id, p.name, p.slug, p.sales_count, p.price, (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image FROM products p WHERE p.is_active = 1 ORDER BY p.sales_count DESC LIMIT 5")->fetchAll();
    
    // Revenue last 7 days
    $revenueChart = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $r = $db->prepare("SELECT COALESCE(SUM(total),0) as revenue FROM orders WHERE DATE(created_at) = :d");
        $r->execute([':d'=>$date]);
        $revenueChart[] = ['date'=>$date, 'revenue'=>(float)$r->fetchColumn()];
    }
    
    successResponse([
        'today' => ['orders'=>(int)$todayOrders['count'], 'revenue'=>(float)$todayOrders['revenue']],
        'month' => ['orders'=>(int)$monthOrders['count'], 'revenue'=>(float)$monthOrders['revenue']],
        'total' => ['orders'=>(int)$totalOrders['count'], 'revenue'=>(float)$totalOrders['revenue'], 'products'=>(int)$totalProducts, 'customers'=>(int)$totalCustomers, 'categories'=>(int)$totalCategories],
        'stock' => ['low_stock'=>(int)$lowStock, 'out_of_stock'=>(int)$outOfStock],
        'status_breakdown' => $statusBreakdown,
        'recent_orders' => $recentOrders,
        'top_products' => $topProducts,
        'revenue_chart' => $revenueChart
    ]);
}
