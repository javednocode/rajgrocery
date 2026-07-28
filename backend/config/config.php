<?php
/**
 * White-label ecommerce application configuration.
 */

date_default_timezone_set(getenv('APP_TIMEZONE') ?: 'UTC');

// JWT Secret
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'change_this_jwt_secret_2026');
define('JWT_EXPIRY', 86400 * 7); // 7 days

// Upload paths
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', '/uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB images
define('MAX_VIDEO_SIZE', 100 * 1024 * 1024); // 100MB videos
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);
define('ALLOWED_VIDEO_EXTENSIONS', ['mp4', 'webm', 'mov', 'm4v', 'avi', 'mkv', 'ogg']);

// Pagination
define('DEFAULT_PAGE_SIZE', 12);
define('MAX_PAGE_SIZE', 2000); // Admin panels need all products (920+)

// CORS - Allow Angular frontend
$envOrigins = array_filter(array_map('trim', explode(',', getenv('ALLOWED_ORIGINS') ?: '')));
define('ALLOWED_ORIGINS', array_values(array_unique(array_merge([
    'http://localhost:4200',
    'http://localhost:4201',
    'http://127.0.0.1:4200',
], $envOrigins))));

// App info
define('APP_NAME', getenv('APP_NAME') ?: 'Your Store');
define('APP_VERSION', '1.0.0');
define('APP_LOCALE', getenv('APP_LOCALE') ?: 'en-US');
define('APP_CURRENCY', getenv('APP_CURRENCY') ?: 'USD');
define('APP_CURRENCY_SYMBOL', getenv('APP_CURRENCY_SYMBOL') ?: '$');
