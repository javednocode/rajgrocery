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
    require_once __DIR__ . '/api/import.php';
}

// ── Bulk Stock Update ─────────────────────────────────────────────────────
if (preg_match('#^/api/stock/update/?$#', $uri) && $method === 'POST') {
    require_once __DIR__ . '/api/stock.php';
}

// 404 fallback
errorResponse('Endpoint not found', 404);
