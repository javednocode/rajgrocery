<?php
/**
 * PHP Built-in Server Router
 * Routes all requests to index.php (like Apache mod_rewrite)
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Serve static files directly (CSS, JS, images, etc.)
$staticExtensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'ttf', 'woff', 'woff2', 'eot', 'map'];
$ext = strtolower(pathinfo($uri, PATHINFO_EXTENSION));

if ($ext && in_array($ext, $staticExtensions)) {
    $file = __DIR__ . $uri;
    if (file_exists($file)) {
        return false; // Serve the file as-is
    }
}

// If it's an existing PHP file, serve it
if ($uri !== '/' && file_exists(__DIR__ . $uri) && pathinfo($uri, PATHINFO_EXTENSION) === 'php') {
    return false;
}

// If it's an existing directory with index.php, serve it
if (is_dir(__DIR__ . $uri)) {
    $indexFile = rtrim(__DIR__ . $uri, '/') . '/index.php';
    if (file_exists($indexFile)) {
        require $indexFile;
        return true;
    }
}

// Route everything else through the main API index.php
require __DIR__ . '/index.php';
return true;
