<?php
/**
 * White-label ecommerce main API router
 * All API requests are routed through this file
 *
 * OPTIMIZED v3:
 *  - Lazy DB connection (only connects when handler needs it)
 *  - Early exit after every matched route (no regex waterfall)
 *  - OPTIONS preflight returns before loading ANY includes
 */

// ── Output buffering + gzip at PHP level ──────────────────────────
if (!headers_sent()) {
    if (function_exists('ob_gzhandler') && !ini_get('zlib.output_compression')) {
        ob_start('ob_gzhandler');
    } else {
        ob_start();
    }
}

// ── Handle preflight BEFORE loading anything else ─────────────────
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Max-Age: 86400");
    http_response_code(200);
    exit;
}

// Load config (lightweight — just constants)
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/auth_middleware.php';
require_once __DIR__ . '/helpers/upload.php';
require_once __DIR__ . '/helpers/slug.php';
require_once __DIR__ . '/helpers/cache.php';

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

// ── LAZY Database connection — only connect when actually needed ──
// This saves ~20-50ms on Bluehost for every request by deferring the
// TCP + MySQL handshake until the first query actually runs.
$db = null;
function getDB() {
    global $db;
    if ($db === null) {
        $database = new Database();
        $db = $database->getConnection();
    }
    return $db;
}

// ============================================
// API ROUTING — with early exit after match
// ============================================

// Auth routes
if (preg_match('#^/api/auth/login$#', $uri)) {
    require_once __DIR__ . '/api/auth.php';
    handleLogin(getDB());
    exit;
}

// Products — order matters: specific routes before parameterized ones
if (preg_match('#^/api/products/featured/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    getFeaturedProducts(getDB());
    exit;
}
if (preg_match('#^/api/products/featured/clear/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'POST') { requireAuth(); clearAllFeatured(getDB()); }
    exit;
}
if (preg_match('#^/api/products/trending/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    getTrendingProducts(getDB());
    exit;
}
if (preg_match('#^/api/products/trending/clear/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'POST') { requireAuth(); clearAllTrending(getDB()); }
    exit;
}
if (preg_match('#^/api/products/search/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    searchProducts(getDB());
    exit;
}
if (preg_match('#^/api/products/bulk/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'POST') { requireAuth(); bulkProductAction(getDB()); }
    exit;
}
if (preg_match('#^/api/products/slug/([a-z0-9-]+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    getProductBySlug(getDB(), $m[1]);
    exit;
}
if (preg_match('#^/api/products/(\d+)/featured/?$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'POST') { requireAuth(); toggleProductFeatured(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/products/(\d+)/trending/?$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'POST') { requireAuth(); toggleProductTrending(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/products/(\d+)/variations/?$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'GET') getVariations(getDB(), $m[1]);
    if ($method === 'POST') { requireAuth(); createVariation(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/products/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'GET')  getProductById(getDB(), $m[1]);
    if ($method === 'PUT')  { requireAuth(); updateProduct(getDB(), $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteProduct(getDB(), $m[1]); }
    if ($method === 'POST') { requireAuth(); updateProduct(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/products/?$#', $uri)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'GET') getProducts(getDB());
    if ($method === 'POST') { requireAuth(); createProduct(getDB()); }
    exit;
}

// Variations (standalone)
if (preg_match('#^/api/variations/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'PUT')    { requireAuth(); updateVariation(getDB(), $m[1]); }
    if ($method === 'POST')   { requireAuth(); updateVariation(getDB(), $m[1]); }  // POST works with $_FILES
    if ($method === 'DELETE') { requireAuth(); deleteVariation(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/product-images/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/products.php';
    if ($method === 'DELETE') { requireAuth(); deleteProductImage(getDB(), $m[1]); }
    exit;
}

// Categories
if (preg_match('#^/api/categories/featured/?$#', $uri)) {
    require_once __DIR__ . '/api/categories.php';
    getFeaturedCategories(getDB());
    exit;
}
if (preg_match('#^/api/categories/slug/([a-z0-9-]+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/categories.php';
    getCategoryBySlug(getDB(), $m[1]);
    exit;
}
if (preg_match('#^/api/categories/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/categories.php';
    if ($method === 'GET') getCategoryById(getDB(), $m[1]);
    if ($method === 'PUT') { requireAuth(); updateCategory(getDB(), $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteCategory(getDB(), $m[1]); }
    if ($method === 'POST') { requireAuth(); updateCategory(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/categories/?$#', $uri)) {
    require_once __DIR__ . '/api/categories.php';
    if ($method === 'GET') getCategories(getDB());
    if ($method === 'POST') { requireAuth(); createCategory(getDB()); }
    exit;
}

// Banners
if (preg_match('#^/api/banners/reorder$#', $uri)) {
    require_once __DIR__ . '/api/banners.php';
    if ($method === 'POST') { requireAuth(); reorderBanners(getDB()); }
    exit;
}
if (preg_match('#^/api/banners/(\d+)/toggle$#', $uri, $m)) {
    require_once __DIR__ . '/api/banners.php';
    if ($method === 'POST') { requireAuth(); toggleBanner(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/banners/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/banners.php';
    if ($method === 'GET') { requireAuth(); getBannerById(getDB(), $m[1]); }
    if ($method === 'PUT') { requireAuth(); updateBanner(getDB(), $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteBanner(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/banners/?$#', $uri)) {
    require_once __DIR__ . '/api/banners.php';
    if ($method === 'GET') getBanners(getDB());
    if ($method === 'POST') { requireAuth(); createBanner(getDB()); }
    exit;
}

// Hero Products
if (preg_match('#^/api/hero-products/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/hero_products.php';
    if ($method === 'PUT') { requireAuth(); updateHeroProduct(getDB(), $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteHeroProduct(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/hero-products/?$#', $uri)) {
    require_once __DIR__ . '/api/hero_products.php';
    if ($method === 'GET') getHeroProducts(getDB());
    if ($method === 'POST') { requireAuth(); createHeroProduct(getDB()); }
    exit;
}

// Settings
if (preg_match('#^/api/settings/([a-z_]+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/settings.php';
    getSetting(getDB(), $m[1]);
    exit;
}
if (preg_match('#^/api/settings/?$#', $uri)) {
    require_once __DIR__ . '/api/settings.php';
    if ($method === 'GET') getSettings(getDB());
    if ($method === 'PUT') { requireAuth(); updateSettings(getDB()); }
    exit;
}

// Delivery
if (preg_match('#^/api/delivery/calculate/?$#', $uri)) {
    require_once __DIR__ . '/api/delivery.php';
    if ($method === 'POST' || $method === 'GET') calculateDeliveryFee(getDB());
    exit;
}

// Blogs
if (preg_match('#^/api/blogs/slug/([a-z0-9-]+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/blogs.php';
    getBlogBySlug(getDB(), $m[1]);
    exit;
}
if (preg_match('#^/api/blogs/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/blogs.php';
    if ($method === 'GET') getBlogById(getDB(), $m[1]);
    if ($method === 'PUT') { requireAuth(); updateBlog(getDB(), $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteBlog(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/blogs/?$#', $uri)) {
    require_once __DIR__ . '/api/blogs.php';
    if ($method === 'GET') getBlogs(getDB());
    if ($method === 'POST') { requireAuth(); createBlog(getDB()); }
    exit;
}

// Orders
if (preg_match('#^/api/orders/track/([A-Z0-9-]+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/orders.php';
    trackOrder(getDB(), $m[1]);
    exit;
}
if (preg_match('#^/api/orders/(\d+)/invoice$#', $uri, $m)) {
    requireAuth();
    require_once __DIR__ . '/api/orders.php';
    if ($method === 'GET') getOrderInvoice(getDB(), $m[1]);
    exit;
}
if (preg_match('#^/api/orders/(\d+)/notifications$#', $uri, $m)) {
    requireAuth();
    require_once __DIR__ . '/api/orders.php';
    if ($method === 'GET') getOrderNotifications(getDB(), $m[1]);
    exit;
}
if (preg_match('#^/api/orders/(\d+)/send-emails$#', $uri, $m)) {
    requireAuth();
    require_once __DIR__ . '/api/orders.php';
    if ($method === 'POST') sendOrderNotifications(getDB(), $m[1]);
    exit;
}
if (preg_match('#^/api/orders/(\d+)$#', $uri, $m)) {
    require_once __DIR__ . '/api/orders.php';
    if ($method === 'GET') getOrderById(getDB(), $m[1]);
    if ($method === 'PUT') { requireAuth(); updateOrder(getDB(), $m[1]); }
    if ($method === 'DELETE') { requireAuth(); deleteOrder(getDB(), $m[1]); }
    exit;
}
if (preg_match('#^/api/orders/?$#', $uri)) {
    require_once __DIR__ . '/api/orders.php';
    if ($method === 'GET') { requireAuth(); getOrders(getDB()); }
    if ($method === 'POST') createOrder(getDB());
    exit;
}

// Customers
if (preg_match('#^/api/customers/register/?$#', $uri)) {
    require_once __DIR__ . '/api/customers.php';
    if ($method === 'POST') registerCustomer(getDB());
    exit;
}
if (preg_match('#^/api/customers/?$#', $uri)) {
    require_once __DIR__ . '/api/customers.php';
    if ($method === 'GET') { requireAuth(); getCustomers(getDB()); }
    exit;
}

// Coupons
if (preg_match('#^/api/coupons/validate/?$#', $uri)) {
    require_once __DIR__ . '/api/coupons.php';
    validateCoupon(getDB());
    exit;
}

// Dashboard stats (admin)
if (preg_match('#^/api/dashboard/stats/?$#', $uri)) {
    requireAuth();
    require_once __DIR__ . '/api/dashboard.php';
    getDashboardStats(getDB());
    exit;
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
    exit;
}

// Bulk Product Import
if (preg_match('#^/api/import/(preview|process|import|status)/?$#', $uri)) {
    @set_time_limit(300);
    @ini_set('memory_limit', '512M');
    require_once __DIR__ . '/api/import.php';
    exit;
}

// Bulk Stock Update
if (preg_match('#^/api/stock/update/?$#', $uri) && $method === 'POST') {
    require_once __DIR__ . '/api/stock.php';
    exit;
}

// Email System
if (preg_match('#^/api/email/process/?$#', $uri)) {
    require_once __DIR__ . '/api/email_queue.php';
    if ($method === 'GET' || $method === 'POST') processQueue(getDB());
    exit;
}

// Test Email — handled INLINE to avoid output-buffer issues
if (preg_match('#^/api/email/test/?$#', $uri) && $method === 'POST') {
    requireAuth();
    $data = getJsonInput();
    $to   = trim($data['to'] ?? '');
    if (empty($to)) { errorResponse('Recipient email required', 400); }

    while (ob_get_level() > 0) { ob_get_clean(); }

    try {
        require_once __DIR__ . '/helpers/email.php';
        $cfg = getEmailSettings(getDB());
        $siteName = settingOrDefault($cfg, 'site_name', 'Your Store');
        $tagline = settingOrDefault($cfg, 'site_tagline', 'SMTP Test Email');

        $html = '<html><body style="font-family:Arial,sans-serif;padding:20px">'
              . '<div style="max-width:500px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1)">'
              . '<div style="background:#0D1827;padding:20px;text-align:center">'
              . '<h1 style="color:#fff;margin:0">' . htmlspecialchars($siteName) . '</h1>'
              . '<p style="color:rgba(255,255,255,.6);margin:4px 0 0;font-size:12px">' . htmlspecialchars($tagline) . '</p>'
              . '</div>'
              . '<div style="padding:24px">'
              . '<p><strong>SMTP is working correctly!</strong></p>'
              . '<p>Host: ' . htmlspecialchars($cfg['smtp_host']) . '</p>'
              . '<p>Port: ' . $cfg['smtp_port'] . ' | Encryption: ' . strtoupper($cfg['smtp_encryption']) . '</p>'
              . '<p>Sent: ' . date('d M Y H:i:s') . '</p>'
              . '</div></div></body></html>';

        sendViaSMTP($cfg, $to, 'SMTP Test - ' . $siteName, $html, 'SMTP is working!');

        try { logEmail(getDB(), null, null, 'test', $to, 'SMTP Test', 'sent', 'OK'); } catch (Exception $le) {}

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true, 'message' => 'Test email sent successfully to ' . $to, 'data' => ['to' => $to]]);
        exit;

    } catch (Exception $e) {
        try { logEmail(getDB(), null, null, 'test', $to, 'SMTP Test', 'failed', $e->getMessage()); } catch (Exception $le) {}
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'SMTP Error: ' . $e->getMessage()]);
        exit;
    }
}

if (preg_match('#^/api/email/logs/?$#', $uri)) {
    requireAuth();
    require_once __DIR__ . '/api/email_queue.php';
    if ($method === 'GET') getEmailLogs(getDB());
    exit;
}
if (preg_match('#^/api/email/queue/?$#', $uri)) {
    requireAuth();
    require_once __DIR__ . '/api/email_queue.php';
    if ($method === 'GET') getEmailQueueList(getDB());
    exit;
}
if (preg_match('#^/api/email/queue/(\d+)/retry$#', $uri, $m)) {
    requireAuth();
    require_once __DIR__ . '/api/email_queue.php';
    if ($method === 'POST') retryEmailJob(getDB(), $m[1]);
    exit;
}
if (preg_match('#^/api/email/settings/?$#', $uri)) {
    require_once __DIR__ . '/api/email_queue.php';
    if ($method === 'GET') { requireAuth(); getEmailSettingsApi(getDB()); }
    if ($method === 'PUT') { requireAuth(); updateEmailSettings(getDB()); }
    exit;
}

// Database Index Optimization (run once)
if (preg_match('#^/api/optimize-indexes/?$#', $uri)) {
    // Allowed via GET in browser for setup
    require_once __DIR__ . '/api/optimize_indexes.php';
    optimizeIndexes(getDB());
    exit;
}

// Cache Clear (admin)
if (preg_match('#^/api/cache/clear/?$#', $uri) && $method === 'POST') {
    requireAuth();
    $cleared = cacheClearAll();
    successResponse(['cleared_files' => $cleared], "Cache cleared ($cleared files)");
    exit;
}

// 404 fallback
errorResponse('Endpoint not found', 404);
