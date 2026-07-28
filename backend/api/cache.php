<?php
/**
 * Cache management API endpoint.
 * GET  /api/cache/stats   — Cache health dashboard (admin only)
 * POST /api/cache/clear   — Clear cache for current site (admin only)
 * POST /api/cache/purge   — Purge only expired cache files
 */

function getCacheStatsApi($db) {
    if (!function_exists('getCacheStats')) {
        errorResponse('Cache functions not available', 503);
        return;
    }
    successResponse(getCacheStats());
}

function clearCache($db) {
    if (!function_exists('cacheClearAll')) {
        errorResponse('Cache functions not available', 503);
        return;
    }

    $input  = getJsonInput() ?: [];
    $pattern = $input['pattern'] ?? null;

    if ($pattern && function_exists('cacheClearPattern')) {
        $cleared = cacheClearPattern($pattern);
        successResponse(['cleared' => $cleared, 'pattern' => $pattern], "Cleared {$cleared} cache entries matching '{$pattern}'");
    } else {
        $cleared = cacheClearAll();
        successResponse(['cleared' => $cleared], "Cleared {$cleared} cache files");
    }
}

function purgeExpiredCache($db) {
    if (!function_exists('cachePurgeExpired')) {
        errorResponse('Cache functions not available', 503);
        return;
    }
    $count = cachePurgeExpired();
    successResponse(['purged' => $count], "Purged {$count} expired cache files");
}
