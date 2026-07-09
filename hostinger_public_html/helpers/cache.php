<?php
/**
 * White-label ecommerce file-based cache helper.
 * Lightweight caching for shared hosting (no Redis/Memcached needed).
 * Cache files stored in system temp dir, JSON-encoded, with TTL.
 *
 * Cache is scoped per domain + site_id to prevent cross-brand data leakage.
 */

define('ECOMMERCE_CACHE_DIR', sys_get_temp_dir() . '/ecommerce_cache/');

// Domain prefix: prevents cross-site pollution on shared hosting /tmp
define('ECOMMERCE_CACHE_DOMAIN', md5($_SERVER['HTTP_HOST'] ?? 'localhost'));

// Site ID: resolved from request context (set by index.php middleware, default 1)
if (!defined('ECOMMERCE_SITE_ID')) {
    define('ECOMMERCE_SITE_ID', 1);
}

// Final cache prefix: domain + site_id ensures complete isolation
define('ECOMMERCE_CACHE_PREFIX', 'ecommerce_' . ECOMMERCE_CACHE_DOMAIN . '_s' . ECOMMERCE_SITE_ID . '_');

// Cache hit/miss tracking (in-memory, per-request only)
$_ecommerce_cache_stats = ['hits' => 0, 'misses' => 0, 'writes' => 0, 'deletes' => 0];

/**
 * Ensure cache directory exists with correct permissions
 */
function ensureCacheDir(): void {
    if (!is_dir(ECOMMERCE_CACHE_DIR)) {
        @mkdir(ECOMMERCE_CACHE_DIR, 0750, true);
    }
}

/**
 * Get cached value — returns null if missing or expired
 */
function cacheGet(string $key): mixed {
    global $_ecommerce_cache_stats;

    $file = ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . md5($key) . '.json';
    if (!file_exists($file)) {
        $_ecommerce_cache_stats['misses']++;
        return null;
    }

    $content = @file_get_contents($file);
    if (!$content) {
        $_ecommerce_cache_stats['misses']++;
        return null;
    }

    $data = json_decode($content, true);
    if (!$data || !isset($data['expires'], $data['value'])) {
        $_ecommerce_cache_stats['misses']++;
        return null;
    }

    // Check TTL
    if ($data['expires'] < time()) {
        @unlink($file);
        $_ecommerce_cache_stats['misses']++;
        return null;
    }

    $_ecommerce_cache_stats['hits']++;
    return $data['value'];
}

/**
 * Store value in cache with TTL in seconds
 */
function cacheSet(string $key, mixed $value, int $ttl = 300): bool {
    global $_ecommerce_cache_stats;

    ensureCacheDir();
    $file = ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . md5($key) . '.json';
    $data = json_encode([
        'key'     => $key,
        'expires' => time() + $ttl,
        'created' => time(),
        'site_id' => ECOMMERCE_SITE_ID,
        'value'   => $value
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $ok = @file_put_contents($file, $data, LOCK_EX) !== false;
    if ($ok) $_ecommerce_cache_stats['writes']++;
    return $ok;
}

/**
 * Delete a specific cache key
 */
function cacheClear(string $key): bool {
    global $_ecommerce_cache_stats;

    $file = ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . md5($key) . '.json';
    if (file_exists($file)) {
        $ok = @unlink($file);
        if ($ok) $_ecommerce_cache_stats['deletes']++;
        return $ok;
    }
    return true;
}

/**
 * Clear all cache files for the current site
 */
function cacheClearAll(): int {
    global $_ecommerce_cache_stats;

    ensureCacheDir();
    $count = 0;
    $files = glob(ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . '*.json');
    if ($files) {
        foreach ($files as $file) {
            if (@unlink($file)) {
                $count++;
                $_ecommerce_cache_stats['deletes']++;
            }
        }
    }
    return $count;
}

/**
 * Clear cache keys matching a pattern prefix for the current site.
 * e.g. cacheClearPattern('products_') clears products_featured, products_trending, etc.
 */
function cacheClearPattern(string $pattern): int {
    global $_ecommerce_cache_stats;

    ensureCacheDir();
    $count = 0;
    $files = glob(ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . '*.json');
    if ($files) {
        foreach ($files as $file) {
            $content = @file_get_contents($file);
            if ($content) {
                $data = json_decode($content, true);
                if ($data && isset($data['key']) && str_starts_with($data['key'], $pattern)) {
                    if (@unlink($file)) {
                        $count++;
                        $_ecommerce_cache_stats['deletes']++;
                    }
                }
            }
        }
    }
    return $count;
}

/**
 * Get cache statistics for the current site:
 * - Request-level hit/miss/write counts
 * - Filesystem: file count, total size, oldest/newest file
 */
function getCacheStats(): array {
    global $_ecommerce_cache_stats;

    ensureCacheDir();
    $files       = glob(ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . '*.json') ?: [];
    $fileCount   = count($files);
    $totalSize   = 0;
    $expiredCount = 0;
    $now = time();

    foreach ($files as $file) {
        $totalSize += filesize($file);
        $content = @file_get_contents($file);
        if ($content) {
            $data = json_decode($content, true);
            if ($data && isset($data['expires']) && $data['expires'] < $now) {
                $expiredCount++;
            }
        }
    }

    return [
        'request' => [
            'hits'    => $_ecommerce_cache_stats['hits'],
            'misses'  => $_ecommerce_cache_stats['misses'],
            'writes'  => $_ecommerce_cache_stats['writes'],
            'deletes' => $_ecommerce_cache_stats['deletes'],
        ],
        'filesystem' => [
            'cache_dir'     => ECOMMERCE_CACHE_DIR,
            'file_count'    => $fileCount,
            'expired_count' => $expiredCount,
            'total_size_kb' => round($totalSize / 1024, 2),
            'prefix'        => ECOMMERCE_CACHE_PREFIX,
            'site_id'       => ECOMMERCE_SITE_ID,
            'domain_hash'   => ECOMMERCE_CACHE_DOMAIN,
        ]
    ];
}

/**
 * Purge all expired cache files for the current site
 */
function cachePurgeExpired(): int {
    ensureCacheDir();
    $count = 0;
    $now   = time();
    $files = glob(ECOMMERCE_CACHE_DIR . ECOMMERCE_CACHE_PREFIX . '*.json') ?: [];
    foreach ($files as $file) {
        $content = @file_get_contents($file);
        if (!$content) { @unlink($file); $count++; continue; }
        $data = json_decode($content, true);
        if (!$data || !isset($data['expires']) || $data['expires'] < $now) {
            if (@unlink($file)) $count++;
        }
    }
    return $count;
}
