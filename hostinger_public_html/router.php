<?php
/**
 * PHP Built-in Server Router
 * Routes all requests to index.php (like Apache mod_rewrite)
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Serve static files directly (CSS, JS, images, etc.)
$staticExtensions = [
    'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico',
    'ttf', 'woff', 'woff2', 'eot', 'map', 'pdf',
    'mp4', 'webm', 'mov',
];
$ext = strtolower(pathinfo($uri, PATHINFO_EXTENSION));

if ($uri === '/' && file_exists(__DIR__ . '/index.html')) {
    require __DIR__ . '/index.html';
    return true;
}

if ($uri === '/admin') {
    header('Location: /admin/', true, 301);
    return true;
}

if ($uri === '/admin/') {
    require __DIR__ . '/admin/index.php';
    return true;
}

if ($ext && in_array($ext, $staticExtensions)) {
    $file = __DIR__ . $uri;
    if (file_exists($file)) {
        return false; // Serve the file as-is
    }
}

// If it's an existing PHP file, serve it (except for /api/ routes which must go to index.php)
if ($uri !== '/' && file_exists(__DIR__ . $uri) && pathinfo($uri, PATHINFO_EXTENSION) === 'php' && strpos($uri, '/api/') !== 0) {
    return false;
}

// If it's an existing directory with index.php, serve it
if (is_dir(__DIR__ . $uri)) {
    $indexFile = rtrim(__DIR__ . $uri, '/') . '/index.php';
    if (file_exists($indexFile)) {
        if ($uri !== '/' && substr($uri, -1) !== '/') {
            $query = $_SERVER['QUERY_STRING'] ?? '';
            header('Location: ' . $uri . '/' . ($query ? '?' . $query : ''), true, 301);
            return true;
        }
        require $indexFile;
        return true;
    }
}

// API requests go through the PHP API router.
if (strpos($uri, '/api/') === 0) {
    require __DIR__ . '/index.php';
    return true;
}

// Local dev fallback for Angular routes.
if (file_exists(__DIR__ . '/index.html')) {
    require __DIR__ . '/index.html';
    return true;
}

// Backend-only fallback.
require __DIR__ . '/index.php';
return true;
