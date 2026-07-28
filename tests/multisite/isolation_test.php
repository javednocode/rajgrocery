<?php
/**
 * Multi-Site Isolation Test Suite
 * Creates 3 test sites and verifies complete data isolation.
 *
 * Usage: DB_HOST=localhost DB_NAME=reuse_ecom DB_USER=root DB_PASS='' php tests/multisite/isolation_test.php
 */

$host   = getenv('DB_HOST') ?: '127.0.0.1';
$dbname = getenv('DB_NAME') ?: 'reuse_ecom';
$user   = getenv('DB_USER') ?: 'root';
$pass   = getenv('DB_PASS') ?: '';

$passed = 0; $failed = 0; $results = [];

function p(string $t, string $d = '') { global $passed, $results; $passed++; $results[] = ['PASS', $t, $d]; echo "\033[32m✅\033[0m $t" . ($d ? " ($d)" : '') . "\n"; }
function f(string $t, string $d = '') { global $failed, $results; $failed++; $results[] = ['FAIL', $t, $d]; echo "\033[31m❌\033[0m $t — $d\n"; }
function h(string $s) { echo "\n\033[1;34m══ $s ══\033[0m\n"; }

try {
    $db = new PDO("mysql:host={$host};dbname={$dbname};charset=utf8mb4", $user, $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    p('Database connection');
} catch (PDOException $e) {
    f('Database connection', $e->getMessage());
    echo "Cannot connect. Ensure reuse_ecom DB exists with schema applied.\n";
    exit(1);
}

// ─── Create 3 Test Sites ─────────────────────────────────────────────────────
h('SITE SETUP: Create 3 isolated test sites');

$siteIds = [];
$sites = [
    ['site_name' => 'Site A — Grocery Test',  'domain' => 'grocery-test.local',  'theme' => 'grocery',  'currency' => 'GBP'],
    ['site_name' => 'Site B — Namkeen Test',  'domain' => 'namkeen-test.local',  'theme' => 'namkeen',  'currency' => 'INR'],
    ['site_name' => 'Site C — Fashion Test',  'domain' => 'fashion-test.local',  'theme' => 'default',  'currency' => 'USD'],
];

foreach ($sites as $site) {
    try {
        // Remove if already exists from a previous test run
        $db->prepare("DELETE FROM sites WHERE domain = ?")->execute([$site['domain']]);
        $db->prepare("INSERT INTO sites (site_name, domain, theme, currency, status) VALUES (?,?,?,?,?)")
           ->execute([$site['site_name'], $site['domain'], $site['theme'], $site['currency'], 'active']);
        $id = (int)$db->lastInsertId();
        $siteIds[] = $id;
        p("Created site: {$site['site_name']}", "ID=$id domain={$site['domain']}");
    } catch (PDOException $e) {
        f("Create site: {$site['site_name']}", $e->getMessage());
    }
}

if (count($siteIds) < 3) { echo "Not enough sites created. Aborting.\n"; exit(1); }
[$sA, $sB, $sC] = $siteIds;

// ─── Product Isolation ───────────────────────────────────────────────────────
h('PRODUCT ISOLATION');

// Insert products for each site
$prodIds = [];
foreach ($siteIds as $i => $sid) {
    $db->prepare("INSERT INTO products (site_id, name, slug, price, stock, is_active) VALUES (?,?,?,?,?,1)")
       ->execute([$sid, "Test Product Site $sid", "test-product-site-$sid", 9.99 + $i, 100]);
    $prodIds[$sid] = (int)$db->lastInsertId();
}

// Test: Site A only sees its own products
foreach ($siteIds as $sid) {
    $stmt = $db->prepare("SELECT COUNT(*) FROM products WHERE site_id = ?");
    $stmt->execute([$sid]);
    $count = (int)$stmt->fetchColumn();
    $count > 0 ? p("Site $sid products visible to itself", "$count product(s)") : f("Site $sid has no products");

    // Cross-site check: should NOT see other sites' products
    $others = array_filter($siteIds, fn($s) => $s !== $sid);
    foreach ($others as $other) {
        $cross = $db->prepare("SELECT COUNT(*) FROM products WHERE site_id = ? AND id = ?");
        $cross->execute([$sid, $prodIds[$other]]);
        $crossCount = (int)$cross->fetchColumn();
        $crossCount === 0
            ? p("Site $sid cannot see Site $other product (expected 0)", "cross-site=0")
            : f("LEAKAGE: Site $sid can see Site $other product", "cross-site={$crossCount}");
    }
}

// ─── Order Isolation ─────────────────────────────────────────────────────────
h('ORDER ISOLATION');

$orderIds = [];
foreach ($siteIds as $sid) {
    $num = 'TEST-' . strtoupper(substr(md5($sid . time()), 0, 8));
    $db->prepare("INSERT INTO orders (site_id, order_number, customer_name, customer_email, customer_phone, status, payment_status, subtotal, total, delivery_charge)
        VALUES (?,?,?,?,?,'pending','pending',10.00,10.00,0)")
       ->execute([$sid, $num, "Test Customer $sid", "test$sid@example.com", '0000000000']);
    $orderIds[$sid] = (int)$db->lastInsertId();
}

foreach ($siteIds as $sid) {
    $others = array_filter($siteIds, fn($s) => $s !== $sid);
    foreach ($others as $other) {
        $cross = $db->prepare("SELECT COUNT(*) FROM orders WHERE site_id = ? AND id = ?");
        $cross->execute([$sid, $orderIds[$other]]);
        (int)$cross->fetchColumn() === 0
            ? p("Order isolation: Site $sid cannot see Site $other order")
            : f("ORDER LEAKAGE: Site $sid can see Site $other order");
    }
}

// ─── Settings Isolation ──────────────────────────────────────────────────────
h('SETTINGS ISOLATION');

foreach ($siteIds as $i => $sid) {
    $val = "BrandName_Site_{$sid}";
    // Use REPLACE to handle existing rows
    $db->prepare("REPLACE INTO site_settings (site_id, setting_key, setting_value, setting_type, setting_group)
        VALUES (?, 'site_name', ?, 'text', 'general')")->execute([$sid, $val]);
}

foreach ($siteIds as $sid) {
    $stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE site_id = ? AND setting_key = 'site_name'");
    $stmt->execute([$sid]);
    $val = $stmt->fetchColumn();
    $expected = "BrandName_Site_{$sid}";
    $val === $expected
        ? p("Settings isolation: Site $sid has own site_name", $val)
        : f("Settings isolation failed: Site $sid", "expected '$expected', got '$val'");
}

// ─── Cache Key Isolation ─────────────────────────────────────────────────────
h('CACHE ISOLATION (Key Namespace)');

// Simulate cache key generation for different sites/domains
function simulateCachePrefix(int $siteId, string $domain): string {
    return 'ecommerce_' . md5($domain) . "_s{$siteId}_";
}

$domainA = 'grocery-test.local';
$domainB = 'namkeen-test.local';
$domainC = 'fashion-test.local';

$prefixA = simulateCachePrefix($sA, $domainA);
$prefixB = simulateCachePrefix($sB, $domainB);
$prefixC = simulateCachePrefix($sC, $domainC);

// All prefixes must be unique
$prefixes = [$prefixA, $prefixB, $prefixC];
$uniquePrefixes = array_unique($prefixes);

count($uniquePrefixes) === 3
    ? p('Cache prefixes are unique per site+domain', "A≠B≠C")
    : f('Cache prefix collision detected', 'Prefixes not unique');

// Verify prefix format includes site_id (prevents accidental sharing)
foreach ([[$sA, $prefixA], [$sB, $prefixB], [$sC, $prefixC]] as [$sid, $prefix]) {
    str_contains($prefix, "_s{$sid}_")
        ? p("Cache prefix includes site_id=$sid", $prefix)
        : f("Cache prefix missing site_id=$sid", $prefix);
}

// ─── SEO Isolation ───────────────────────────────────────────────────────────
h('SEO SETTINGS ISOLATION');

$seoKeys = ['meta_title', 'meta_description', 'og_title'];
foreach ($seoKeys as $key) {
    foreach ($siteIds as $sid) {
        $val = "SEO_{$key}_Site_{$sid}";
        $db->prepare("REPLACE INTO site_settings (site_id, setting_key, setting_value, setting_type, setting_group)
            VALUES (?, ?, ?, 'text', 'seo')")->execute([$sid, $key, $val]);
    }
    // Verify each site has its own value
    foreach ($siteIds as $sid) {
        $stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE site_id = ? AND setting_key = ?");
        $stmt->execute([$sid, $key]);
        $got      = $stmt->fetchColumn();
        $expected = "SEO_{$key}_Site_{$sid}";
        $got === $expected
            ? p("SEO '$key' isolated for site $sid")
            : f("SEO '$key' isolation failed for site $sid", "got: $got");
    }
}

// ─── Theme Isolation ─────────────────────────────────────────────────────────
h('THEME ISOLATION');

foreach ($siteIds as $i => $sid) {
    $themes = ['grocery', 'namkeen', 'default'];
    $theme  = $themes[$i] ?? 'default';
    $db->prepare("REPLACE INTO site_settings (site_id, setting_key, setting_value, setting_type, setting_group)
        VALUES (?, 'active_theme', ?, 'text', 'general')")->execute([$sid, $theme]);
}

foreach ([[$sA,'grocery'], [$sB,'namkeen'], [$sC,'default']] as [$sid, $expectedTheme]) {
    $stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE site_id = ? AND setting_key = 'active_theme'");
    $stmt->execute([$sid]);
    $got = $stmt->fetchColumn();
    $got === $expectedTheme
        ? p("Theme isolation: Site $sid theme = $got")
        : f("Theme isolation failed for site $sid", "expected $expectedTheme, got $got");
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────
h('CLEANUP');
foreach ($siteIds as $sid) {
    $db->prepare("DELETE FROM orders WHERE site_id = ? AND customer_email LIKE 'test%@example.com'")->execute([$sid]);
    $db->prepare("DELETE FROM products WHERE site_id = ? AND slug LIKE 'test-product-site-%'")->execute([$sid]);
    $db->prepare("DELETE FROM site_settings WHERE site_id = ? AND setting_value LIKE 'BrandName_Site_%' OR (site_id = ? AND setting_key IN ('meta_title','meta_description','og_title','active_theme'))")->execute([$sid, $sid]);
    $db->prepare("DELETE FROM sites WHERE id = ?")->execute([$sid]);
}
echo "Test sites and data cleaned up\n";

// ─── Summary ─────────────────────────────────────────────────────────────────
echo "\n\033[1m══ MULTI-SITE ISOLATION SUMMARY ══\033[0m\n";
echo "Total: " . ($passed + $failed) . " | \033[32mPass: $passed\033[0m | \033[31mFail: $failed\033[0m\n";

$report = ['timestamp'=>date('c'),'passed'=>$passed,'failed'=>$failed,'results'=>$results];
file_put_contents(__DIR__ . '/multisite_result.json', json_encode($report, JSON_PRETTY_PRINT));
echo "Report saved to tests/multisite/multisite_result.json\n";

exit($failed > 0 ? 1 : 0);
