<?php
/**
 * asianfoodcork - Main API Router
 * All API requests are routed through this file
 */

// Load config
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/auth_middleware.php';
require_once __DIR__ . '/helpers/upload.php';
require_once __DIR__ . '/helpers/slug.php';

// CORS handling
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS) || getenv('APP_ENV') === 'development') {
    header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request info
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Remove query string
$uri = strtok($uri, '?');

// Remove base path if deployed in subdirectory
$basePath = getenv('BASE_PATH') ?: '';
if ($basePath && strpos($uri, $basePath) === 0) {
    $uri = substr($uri, strlen($basePath));
}

// Clean URI
$uri = '/' . trim($uri, '/');

// Database connection
$database = new Database();
$db = $database->getConnection();

// ============================================
// API ROUTING
// ============================================

// Auth routes
if (preg_match('#^/api/auth/login$#', $uri)) {
    require_once __DIR__ . '/api/auth.php';
    handleLogin($db);
}

// Products
if (preg_match('#^/api/products/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'GET') getProducts($db);
    if ($method === 'POST') { requireAuth(); createProduct($db); }
}
if (preg_match('#^/api/products/bulk/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'POST') { requireAuth(); bulkProductAction($db); }
}
if (preg_match('#^/api/products/featured/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    getFeaturedProducts($db);
}
if (preg_match('#^/api/products/(\d+)/featured/?$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'POST') { requireAuth(); toggleProductFeatured($db, $m[1]); }
}
if (preg_match('#^/api/products/featured/clear/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'POST') { requireAuth(); clearAllFeatured($db); }
}
if (preg_match('#^/api/products/trending/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    getTrendingProducts($db);
}
if (preg_match('#^/api/products/search/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    searchProducts($db);
}
if (preg_match('#^/api/products/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'GET')  getProductById($db, $m[1]);
    if ($method === 'PUT')  { requireAuth(); updateProduct($db, $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteProduct($db, $m[1]); }
    // POST with _method override (from admin JS)
    if ($method === 'POST') { requireAuth(); updateProduct($db, $m[1]); }
}
if (preg_match('#^/api/products/(\d+)/trending/?$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'POST') { requireAuth(); toggleProductTrending($db, $m[1]); }
}
if (preg_match('#^/api/products/trending/clear/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'POST') { requireAuth(); clearAllTrending($db); }
}
if (preg_match('#^/api/products/slug/([a-z0-9-]+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    getProductBySlug($db, $m[1]);
}

// Product Variations
if (preg_match('#^/api/products/(\d+)/variations/?$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'GET') getVariations($db, $m[1]);
    if ($method === 'POST') { requireAuth(); createVariation($db, $m[1]); }
}
if (preg_match('#^/api/variations/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'PUT') { requireAuth(); updateVariation($db, $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteVariation($db, $m[1]); }
}
if (preg_match('#^/api/product-images/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'DELETE') { requireAuth(); deleteProductImage($db, $m[1]); }
}

// Categories
if (preg_match('#^/api/categories/?$#', $uri)) {
    require_once __DIR__ . '/api/categories.php';
    if ($method === 'GET') getCategories($db);
    if ($method === 'POST') { requireAuth(); createCategory($db); }
}
if (preg_match('#^/api/categories/featured/?$#', $uri)) {
    require_once __DIR__ . '/api/categories.php';
    getFeaturedCategories($db);
}
if (preg_match('#^/api/categories/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/categories.php';
    if ($method === 'GET') getCategoryById($db, $m[1]);
    if ($method === 'PUT') { requireAuth(); updateCategory($db, $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteCategory($db, $m[1]); }
    // POST with _method override (from admin JS)
    if ($method === 'POST') { requireAuth(); updateCategory($db, $m[1]); }
}
if (preg_match('#^/api/categories/slug/([a-z0-9-]+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/categories.php';
    getCategoryBySlug($db, $m[1]);
}

// Banners
if (preg_match('#^/api/banners/?$#', $uri)) {
    require_once __DIR__ . '/api/banners.php';
    if ($method === 'GET') getBanners($db);
    if ($method === 'POST') { requireAuth(); createBanner($db); }
}
if (preg_match('#^/api/banners/reorder$#', $uri)) {
    require_once __DIR__ . '/api/banners.php';
    if ($method === 'POST') { requireAuth(); reorderBanners($db); }
}
if (preg_match('#^/api/banners/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/banners.php';
    if ($method === 'GET') { requireAuth(); getBannerById($db, $m[1]); }
    if ($method === 'PUT') { requireAuth(); updateBanner($db, $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteBanner($db, $m[1]); }
}
if (preg_match('#^/api/banners/(\d+)/toggle$#', $uri, $m)) {
    require_once __DIR__ . '/api/banners.php';
    if ($method === 'POST') { requireAuth(); toggleBanner($db, $m[1]); }
}

// Hero Products
if (preg_match('#^/api/hero-products/?$#', $uri)) {
    require_once __DIR__ . '/api/hero_products.php';
    if ($method === 'GET') getHeroProducts($db);
    if ($method === 'POST') { requireAuth(); createHeroProduct($db); }
}
if (preg_match('#^/api/hero-products/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/hero_products.php';
    if ($method === 'PUT') { requireAuth(); updateHeroProduct($db, $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteHeroProduct($db, $m[1]); }
}

// Settings
if (preg_match('#^/api/settings/?$#', $uri)) {
    require_once __DIR__ . '/api/settings.php';
    if ($method === 'GET') getSettings($db);
    if ($method === 'PUT') { requireAuth(); updateSettings($db); }
}
if (preg_match('#^/api/settings/([a-z_]+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/settings.php';
    getSetting($db, $m[1]);
}

// Delivery
if (preg_match('#^/api/delivery/calculate/?$#', $uri)) {
    require_once __DIR__ . '/api/delivery.php';
    if ($method === 'POST' || $method === 'GET') calculateDeliveryFee($db);
}

// Blogs
if (preg_match('#^/api/blogs/?$#', $uri)) {
    require_once __DIR__ . '/api/blogs.php';
    if ($method === 'GET') getBlogs($db);
    if ($method === 'POST') { requireAuth(); createBlog($db); }
}
if (preg_match('#^/api/blogs/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/blogs.php';
    if ($method === 'GET') getBlogById($db, $m[1]);
    if ($method === 'PUT') { requireAuth(); updateBlog($db, $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteBlog($db, $m[1]); }
}
if (preg_match('#^/api/blogs/slug/([a-z0-9-]+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/blogs.php';
    getBlogBySlug($db, $m[1]);
}

// Orders
if (preg_match('#^/api/orders/?$#', $uri)) {
    require_once __DIR__ . '/api/orders.php';
    if ($method === 'GET') { requireAuth(); getOrders($db); }
    if ($method === 'POST') createOrder($db);
}
if (preg_match('#^/api/orders/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/orders.php';
    if ($method === 'GET') getOrderById($db, $m[1]);
    if ($method === 'PUT') { requireAuth(); updateOrder($db, $m[1]); }
}
if (preg_match('#^/api/orders/track/([A-Z0-9-]+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/orders.php';
    trackOrder($db, $m[1]);
}

// Customers
if (preg_match('#^/api/customers/register/?$#', $uri)) {
    require_once __DIR__ . '/api/customers.php';
    if ($method === 'POST') registerCustomer($db);
}
if (preg_match('#^/api/customers/?$#', $uri)) {
    require_once __DIR__ . '/api/customers.php';
    if ($method === 'GET') { requireAuth(); getCustomers($db); }
}

// Coupons
if (preg_match('#^/api/coupons/validate/?$#', $uri)) {
    require_once __DIR__ . '/api/coupons.php';
    validateCoupon($db);
}

// Dashboard stats (admin)
if (preg_match('#^/api/dashboard/stats/?$#', $uri)) {
    requireAuth();
    require_once __DIR__ . '/api/dashboard.php';
    getDashboardStats($db);
}

// Upload
if (preg_match('#^/api/upload/?$#', $uri) && $method === 'POST') {
    requireAuth();
    if (!isset($_FILES['file'])) errorResponse('No file provided', 400);
    $folder = $_POST['folder'] ?? 'general';
    $result = uploadImage($_FILES['file'], $folder);
    if ($result['success']) {
        successResponse($result);
    } else {
        errorResponse($result['message']);
    }
}

// ── Bulk Product Import ───────────────────────────────────────────────────
if (preg_match('#^/api/import/(preview|process|import|status)/?$#', $uri)) {
    @set_time_limit(300);
    @ini_set('memory_limit', '512M');
    require_once __DIR__ . '/api/import.php';
    exit; // prevent 404 fallthrough
}

// ── Bulk Stock Update ─────────────────────────────────────────────────────
if (preg_match('#^/api/stock/update/?$#', $uri) && $method === 'POST') {
    require_once __DIR__ . '/api/stock.php';
}

// ── Email System ─────────────────────────────────────────────────────────────
if (preg_match('#^/api/email/process/?$#', $uri)) {
    require_once __DIR__ . '/api/email_queue.php';
    if ($method === 'GET' || $method === 'POST') processQueue($db);
}

// ── Test Email — handled INLINE to avoid output-buffer issues ─────────────────
if (preg_match('#^/api/email/test/?$#', $uri) && $method === 'POST') {
    requireAuth();
    $data = getJsonInput();
    $to   = trim($data['to'] ?? '');
    if (empty($to)) { errorResponse('Recipient email required', 400); }

    // Clear any stray output that would corrupt JSON
    while (ob_get_level() > 0) { ob_get_clean(); }

    try {
        require_once __DIR__ . '/helpers/email.php';
        $cfg = getEmailSettings($db);

        $html = '<html><body style="font-family:Arial,sans-serif;padding:20px">'
              . '<div style="max-width:500px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1)">'
              . '<div style="background:#0D1827;padding:20px;text-align:center">'
              . '<h1 style="color:#fff;margin:0">Asian Food Cork</h1>'
              . '<p style="color:rgba(255,255,255,.6);margin:4px 0 0;font-size:12px">SMTP Test Email</p>'
              . '</div>'
              . '<div style="padding:24px">'
              . '<p><strong>SMTP is working correctly!</strong></p>'
              . '<p>Host: ' . htmlspecialchars($cfg['smtp_host']) . '</p>'
              . '<p>Port: ' . $cfg['smtp_port'] . ' | Encryption: ' . strtoupper($cfg['smtp_encryption']) . '</p>'
              . '<p>Sent: ' . date('d M Y H:i:s') . '</p>'
              . '</div></div></body></html>';

        sendViaSMTP($cfg, $to, 'SMTP Test - Asian Food Cork', $html, 'SMTP is working!');

        // Try log — silently skip if table missing
        try { logEmail($db, null, null, 'test', $to, 'SMTP Test', 'sent', 'OK'); } catch (Exception $le) {}

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true, 'message' => 'Test email sent successfully to ' . $to, 'data' => ['to' => $to]]);
        exit;

    } catch (Exception $e) {
        try { logEmail($db, null, null, 'test', $to, 'SMTP Test', 'failed', $e->getMessage()); } catch (Exception $le) {}
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'SMTP Error: ' . $e->getMessage()]);
        exit;
    }
}

if (preg_match('#^/api/email/logs/?$#', $uri)) {
    requireAuth();
    require_once __DIR__ . '/api/email_queue.php';
    if ($method === 'GET') getEmailLogs($db);
}
if (preg_match('#^/api/email/queue/?$#', $uri)) {
    requireAuth();
    require_once __DIR__ . '/api/email_queue.php';
    if ($method === 'GET') getEmailQueueList($db);
}
if (preg_match('#^/api/email/queue/(\\d+)/retry$#', $uri, $m)) {
    requireAuth();
    require_once __DIR__ . '/api/email_queue.php';
    if ($method === 'POST') retryEmailJob($db, $m[1]);
}
if (preg_match('#^/api/email/settings/?$#', $uri)) {
    require_once __DIR__ . '/api/email_queue.php';
    if ($method === 'GET') { requireAuth(); getEmailSettingsApi($db); }
    if ($method === 'PUT') { requireAuth(); updateEmailSettings($db); }
}

// 404 fallback
errorResponse('Endpoint not found', 404);
