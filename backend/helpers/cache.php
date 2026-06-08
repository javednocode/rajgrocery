<?php
/**
 * White-label ecommerce file-based cache helper.
 * Lightweight caching for shared hosting (no Redis/Memcached needed)
 * Cache files stored in system temp dir, JSON-encoded, with TTL
 */

define('ECOMMERCE_CACHE_DIR', sys_get_temp_dir() . '/ecommerce_cache/');
define('ECOMMERCE_CACHE_PREFIX', 'ecommerce_');

/**
 * Ensure cache directory exists
 */
function ensureCacheDir() {
    if (!is_dir(ECOMMERCE_CACHE_DIR)) {
        @mkdir(ECOMMERCE_CACHE_DIR, 0755, true);
    }
}

/**
 * Get cached value — returns null if missing or expired
 */
function cacheGet(string $key) {
    $file = ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . md5($key) . '.json';
    if (!file_exists($file)) return null;
    
    $content = @file_get_contents($file);
    if (!$content) return null;
    
    $data = json_decode($content, true);
    if (!$data || !isset($data['expires']) || !isset($data['value'])) return null;
    
    // Check TTL
    if ($data['expires'] < time()) {
        @unlink($file);
        return null;
    }
    
    return $data['value'];
}

/**
 * Store value in cache with TTL in seconds
 */
function cacheSet(string $key, $value, int $ttl = 300): bool {
    ensureCacheDir();
    $file = ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . md5($key) . '.json';
    $data = json_encode([
        'key'     => $key,
        'expires' => time() + $ttl,
        'value'   => $value
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return @file_put_contents($file, $data, LOCK_EX) !== false;
}

/**
 * Delete a specific cache key
 */
function cacheClear(string $key): bool {
    $file = ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . md5($key) . '.json';
    return file_exists($file) ? @unlink($file) : true;
}

/**
 * Clear all ecommerce cache files
 */
function cacheClearAll(): int {
    ensureCacheDir();
    $count = 0;
    $files = glob(ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . '*.json');
    if ($files) {
        foreach ($files as $file) {
            if (@unlink($file)) $count++;
        }
    }
    return $count;
}

/**
 * Clear cache keys matching a pattern prefix
 * e.g., cacheClearPattern('products_') clears products_featured, products_trending, etc.
 */
function cacheClearPattern(string $pattern): int {
    ensureCacheDir();
    // We store a manifest for pattern-based clearing
    $count = 0;
    $files = glob(ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . '*.json');
    if ($files) {
        foreach ($files as $file) {
            $content = @file_get_contents($file);
            if ($content) {
                $data = json_decode($content, true);
                if ($data && isset($data['key']) && strpos($data['key'], $pattern) === 0) {
                    if (@unlink($file)) $count++;
                }
            }
        }
    }
    return $count;
}
