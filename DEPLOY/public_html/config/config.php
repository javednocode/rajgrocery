<?php
/**
 * Asian Food Cork - Application Configuration
 */

// Timezone (Ireland)
date_default_timezone_set('Europe/Dublin');

// JWT Secret
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'AFC_pr0d_s3cr3t_k3y_2026_x9z!qW#mL');
define('JWT_EXPIRY', 86400 * 7); // 7 days

// Upload paths
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', '/uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);

// Pagination
define('DEFAULT_PAGE_SIZE', 12);
define('MAX_PAGE_SIZE', 100);

// CORS - Allow Angular frontend
define('ALLOWED_ORIGINS', [
    'http://localhost:4200',
    'http://localhost:4201',
    'http://127.0.0.1:4200',
    'https://asianfoodcork.com',
    'https://www.asianfoodcork.com',
    'https://mediumturquoise-rat-568948.hostingersite.com',
]);

// App info
define('APP_NAME', 'Asian Food Cork');
define('APP_VERSION', '1.0.0');
define('APP_LOCALE', 'en-IE');
define('APP_CURRENCY', 'EUR');
define('APP_CURRENCY_SYMBOL', '€');
