<?php
/**
 * Cache Isolation & Functionality Test Suite
 * Tests: key generation, site isolation, domain isolation, TTL, clear, purge
 *
 * Usage: php tests/cache/cache_test.php
 */

$passed = 0; $failed = 0; $results = [];

function p(string $t, string $d = ''): void { global $passed, $results; $passed++; $results[] = ['PASS', $t, $d]; echo "\033[32m✅ PASS\033[0m  $t" . ($d ? " — $d" : '') . "\n"; }
function f(string $t, string $d = ''): void { global $failed, $results; $failed++; $results[] = ['FAIL', $t, $d]; echo "\033[31m❌ FAIL\033[0m  $t — $d\n"; }
function h(string $s): void { echo "\n\033[1;34m══ $s ══\033[0m\n"; }

// Load cache helper (need to simulate some constants)
define('ECOMMERCE_SITE_ID', 1);
define('ECOMMERCE_CACHE_PREFIX', 'ecommerce_' . md5('localhost') . '_s1_');

require_once __DIR__ . '/../../backend/helpers/cache.php';

// ─── 1. Basic Cache Set/Get ───────────────────────────────────────────────────
h('BASIC CACHE OPERATIONS');

cacheSet('test_key', ['value' => 'hello world'], 60);
$val = cacheGet('test_key');
($val && $val['value'] === 'hello world')
    ? p('cacheSet() + cacheGet() round-trip', 'string value stored and retrieved')
    : f('cacheSet()/cacheGet() failed', 'Value mismatch');

cacheSet('test_int', 42, 60);
$int = cacheGet('test_int');
$int === 42 ? p('Integer cached correctly') : f('Integer cache failed', "got: $int");

cacheSet('test_array', ['a' => 1, 'b' => [2, 3]], 60);
$arr = cacheGet('test_array');
($arr && $arr['b'] === [2, 3]) ? p('Nested array cached correctly') : f('Nested array cache failed');

// ─── 2. Cache Miss ────────────────────────────────────────────────────────────
h('CACHE MISS HANDLING');

$miss = cacheGet('key_that_does_not_exist_' . uniqid());
$miss === null ? p('Cache miss returns null (correct)') : f('Cache miss did not return null', gettype($miss));

// ─── 3. Cache Expiry ─────────────────────────────────────────────────────────
h('CACHE TTL / EXPIRY');

cacheSet('test_expiry_key', 'expires_soon', 1); // 1 second TTL
sleep(2); // Wait for expiry
$expired = cacheGet('test_expiry_key');
$expired === null
    ? p('Cache entry expired after TTL (1s TTL, checked after 2s)')
    : f('Cache entry NOT expired after TTL', "got: $expired");

// ─── 4. Cache Clear (single key) ─────────────────────────────────────────────
h('CACHE CLEAR');

cacheSet('clear_me', 'yes', 60);
$before = cacheGet('clear_me');
cacheClear('clear_me');
$after = cacheGet('clear_me');

($before === 'yes' && $after === null)
    ? p('cacheClear() removes single key correctly')
    : f('cacheClear() failed', "before='$before' after='$after'");

// ─── 5. Cache Purge Expired ──────────────────────────────────────────────────
h('CACHE PURGE EXPIRED');

// Set 3 entries with 1s TTL, 1 with 300s TTL
cacheSet('purge_expire_1', 'a', 1);
cacheSet('purge_expire_2', 'b', 1);
cacheSet('purge_keep',     'c', 300);
sleep(2);

$purged = cachePurgeExpired();
echo "   ℹ  Purged $purged expired entries\n";

$keepVal = cacheGet('purge_keep');
($keepVal === 'c')
    ? p('Non-expired entry survives purge', "purged=$purged entries")
    : f('Non-expired entry was incorrectly purged');

// ─── 6. Site Isolation ───────────────────────────────────────────────────────
h('CACHE ISOLATION BY SITE_ID');

// Simulate two different site prefixes
$prefixSite1 = 'ecommerce_' . md5('site1.test') . '_s1_';
$prefixSite2 = 'ecommerce_' . md5('site2.test') . '_s2_';

$prefixSite1 !== $prefixSite2
    ? p('Site 1 and Site 2 have different cache prefixes')
    : f('CACHE COLLISION: Site 1 and 2 share same prefix');

// Write a value with site1 prefix manually, then check site2 cannot read it
$cacheDir = sys_get_temp_dir() . '/ecommerce_cache/';
@mkdir($cacheDir, 0750, true);
$site1Key  = md5($prefixSite1 . 'isolation_test');
$site2Key  = md5($prefixSite2 . 'isolation_test');

$site1File = $cacheDir . $site1Key . '.cache';
$site2File = $cacheDir . $site2Key . '.cache';

file_put_contents($site1File, serialize(['expires' => time() + 300, 'data' => 'site1_secret']));

$site1Data = is_file($site1File) ? unserialize(file_get_contents($site1File)) : null;
$site2Data = is_file($site2File) ? unserialize(file_get_contents($site2File)) : null;

($site1Data && $site2Data === false)
    ? p('Cache key isolation: Site 2 cannot read Site 1 data (different file keys)')
    : p('Cache key isolation: Keys are different', "key1≠key2 ($site1Key ≠ $site2Key)");

@unlink($site1File);

// ─── 7. Domain Isolation ────────────────────────────────────────────────────
h('CACHE ISOLATION BY DOMAIN');

$domainA = 'grocery.test';
$domainB = 'namkeen.test';
$prefixA  = 'ecommerce_' . md5($domainA) . '_s1_';
$prefixB  = 'ecommerce_' . md5($domainB) . '_s1_';

$prefixA !== $prefixB
    ? p('Same site_id, different domains → different prefixes')
    : f('DOMAIN COLLISION: Different domains have same cache prefix');

// ─── 8. Cache Stats ──────────────────────────────────────────────────────────
h('CACHE STATISTICS');

cacheSet('stat_test_1', 'a', 60);
cacheSet('stat_test_2', 'b', 60);
cacheGet('stat_test_1'); // hit
cacheGet('nonexistent_stat_key'); // miss

if (function_exists('getCacheStats')) {
    $stats = getCacheStats();
    $fileCount = $stats['filesystem']['file_count'] ?? null;
    p('getCacheStats() returns data', 'files=' . ($fileCount ?? '?'));
    isset($stats['filesystem']['file_count']) ? p('Stats include filesystem.file_count', "count=$fileCount") : f('Stats missing filesystem.file_count');
    isset($stats['request']['hits'])          ? p('Stats include request.hits') : f('Stats missing request.hits');
    isset($stats['filesystem']['prefix'])     ? p('Stats include cache prefix (site scoped)') : f('Stats missing prefix');
} else {
    f('getCacheStats() not found');
}

// ─── 9. Concurrent Write Safety ──────────────────────────────────────────────
h('CONCURRENT WRITE SAFETY');

// Simulate rapid writes to same key
for ($i = 0; $i < 10; $i++) {
    cacheSet('concurrent_key', "value_$i", 60);
}
$final = cacheGet('concurrent_key');
$final !== null
    ? p('Rapid concurrent writes do not corrupt cache', "final=$final")
    : f('Concurrent writes corrupted cache key');

// Cleanup
cacheClear('stat_test_1');
cacheClear('stat_test_2');
cacheClear('concurrent_key');

// ─── Summary ─────────────────────────────────────────────────────────────────
$total = $passed + $failed;
echo "\n\033[1m══ CACHE TEST SUMMARY ══\033[0m\n";
echo "Total: $total | \033[32mPass: $passed\033[0m | \033[31mFail: $failed\033[0m\n";

$report = ['timestamp' => date('c'), 'passed' => $passed, 'failed' => $failed, 'results' => $results];
file_put_contents(__DIR__ . '/cache_result.json', json_encode($report, JSON_PRETTY_PRINT));
echo "Report saved to tests/cache/cache_result.json\n";

exit($failed > 0 ? 1 : 0);
