<?php
/**
 * Redis-ready cache layer.
 * Auto-detects Redis availability and falls back to file cache.
 * Drop-in replacement for cacheGet() / cacheSet().
 *
 * To enable Redis: set REDIS_URL in .env (e.g. redis://127.0.0.1:6379)
 * The interface is identical to file cache — swap with zero app changes.
 */

// ─── Connection ───────────────────────────────────────────────────────────────

/**
 * Try to get a Redis connection. Returns Redis object or null.
 * Cached per-request in a static variable to avoid repeated connects.
 */
function getRedisConnection(): ?object {
    static $redis = false; // false = not yet tried, null = unavailable

    if ($redis !== false) return $redis;

    $url = getenv('REDIS_URL');
    if (!$url || !class_exists('Redis')) {
        $redis = null;
        return null;
    }

    try {
        $parts = parse_url($url);
        $redis = new \Redis();
        $ok = $redis->connect(
            $parts['host'] ?? '127.0.0.1',
            (int)($parts['port'] ?? 6379),
            timeout: 1.0
        );
        if (!$ok) { $redis = null; return null; }

        // Auth if password provided
        if (!empty($parts['pass'])) $redis->auth($parts['pass']);

        // DB from path e.g. /1
        $db = ltrim($parts['path'] ?? '/0', '/');
        if (is_numeric($db) && $db > 0) $redis->select((int)$db);

        return $redis;
    } catch (\Throwable $e) {
        error_log('Redis connection failed: ' . $e->getMessage());
        $redis = null;
        return null;
    }
}

// ─── Cache key scoping ────────────────────────────────────────────────────────

function getRedisCacheKey(string $key): string {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $domain = defined('ECOMMERCE_CACHE_DOMAIN') ? ECOMMERCE_CACHE_DOMAIN : md5($_SERVER['HTTP_HOST'] ?? 'localhost');
    return "ecom:s{$siteId}:{$domain}:{$key}";
}

// ─── Public API (drop-in for cache.php functions) ────────────────────────────

/**
 * Get a cached value — Redis first, file cache fallback.
 */
function redisCacheGet(string $key): mixed {
    $redis = getRedisConnection();

    if ($redis) {
        try {
            $val = $redis->get(getRedisCacheKey($key));
            if ($val === false) return null;
            return json_decode($val, true);
        } catch (\Throwable $e) { /* fall through */ }
    }

    // Fallback to file cache
    return function_exists('cacheGet') ? cacheGet($key) : null;
}

/**
 * Set a cached value — Redis first, file cache fallback.
 */
function redisCacheSet(string $key, mixed $value, int $ttl = 300): bool {
    $redis = getRedisConnection();

    if ($redis) {
        try {
            return $redis->setex(
                getRedisCacheKey($key),
                $ttl,
                json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            );
        } catch (\Throwable $e) { /* fall through */ }
    }

    return function_exists('cacheSet') ? cacheSet($key, $value, $ttl) : false;
}

/**
 * Delete a cached key — Redis first, file cache fallback.
 */
function redisCacheClear(string $key): bool {
    $redis = getRedisConnection();

    if ($redis) {
        try {
            $redis->del(getRedisCacheKey($key));
            return true;
        } catch (\Throwable $e) { /* fall through */ }
    }

    return function_exists('cacheClear') ? cacheClear($key) : false;
}

/**
 * Clear all cache for the current site — Redis pattern delete, file fallback.
 */
function redisCacheClearAll(): int {
    $redis = getRedisConnection();

    if ($redis) {
        try {
            $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
            $domain = defined('ECOMMERCE_CACHE_DOMAIN') ? ECOMMERCE_CACHE_DOMAIN : md5($_SERVER['HTTP_HOST'] ?? 'localhost');
            $pattern = "ecom:s{$siteId}:{$domain}:*";

            $keys = $redis->keys($pattern);
            if ($keys) $redis->del($keys);
            return count($keys ?: []);
        } catch (\Throwable $e) { /* fall through */ }
    }

    return function_exists('cacheClearAll') ? cacheClearAll() : 0;
}

/**
 * Flush expired keys by TTL pattern from Redis.
 * (Redis auto-expires via TTL, so this is a no-op for Redis;
 *  delegates to file cache purge for file backend.)
 */
function redisCachePurgeExpired(): int {
    $redis = getRedisConnection();
    if ($redis) return 0; // Redis auto-expires — nothing to do
    return function_exists('cachePurgeExpired') ? cachePurgeExpired() : 0;
}

/**
 * Check Redis health and return stats.
 */
function getRedisStats(): array {
    $redis = getRedisConnection();

    if (!$redis) {
        return [
            'backend'    => 'file',
            'redis'      => null,
            'message'    => 'Redis not available — using file cache. Set REDIS_URL in .env to enable.',
        ];
    }

    try {
        $info = $redis->info('all');
        return [
            'backend'           => 'redis',
            'version'           => $info['redis_version'] ?? 'unknown',
            'connected_clients' => $info['connected_clients'] ?? 0,
            'used_memory_human' => $info['used_memory_human'] ?? 'unknown',
            'keyspace_hits'     => $info['keyspace_hits'] ?? 0,
            'keyspace_misses'   => $info['keyspace_misses'] ?? 0,
            'uptime_days'       => round(($info['uptime_in_seconds'] ?? 0) / 86400, 1),
            'message'           => 'Redis connected and healthy',
        ];
    } catch (\Throwable $e) {
        return ['backend' => 'redis', 'error' => $e->getMessage()];
    }
}
