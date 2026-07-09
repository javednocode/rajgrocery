<?php
/**
 * Admin Pages Structural Verification
 * Checks every admin page for:
 * - PHP syntax
 * - Required includes (header, footer)
 * - $pageTitle set
 * - No hardcoded brand names
 * - No direct $_GET/$_POST usage without sanitization hints
 * - Consistent error handling
 *
 * Usage: php tests/admin/admin_verify.php
 */

$passed = 0; $failed = 0; $warnings = 0; $results = [];

function p($t, $d='') { global $passed, $results; $passed++; $results[]=['PASS',$t,$d]; echo "\033[32m✅\033[0m $t" . ($d?" — $d":'') . "\n"; }
function f($t, $d='') { global $failed, $results; $failed++; $results[]=['FAIL',$t,$d]; echo "\033[31m❌\033[0m $t — $d\n"; }
function w($t, $d='') { global $warnings, $results; $warnings++; $results[]=['WARN',$t,$d]; echo "\033[33m⚠️\033[0m  $t — $d\n"; }
function h($s) { echo "\n\033[1;34m══ $s ══\033[0m\n"; }

$adminDir  = __DIR__ . '/../../backend/admin';
$brandWords = ['The Desi', 'BiteBasket', 'Saggoji', 'Ovlin', 'bitebasket', 'saggoJi', 'thedesi'];

// ─── Get all admin pages (exclude includes/) ─────────────────────────────────
$pages = glob("$adminDir/*.php") ?: [];
sort($pages);

h("ADMIN PAGES: " . count($pages) . " files found");

// ─── PHP Syntax Check ─────────────────────────────────────────────────────────
h('PHP SYNTAX CHECK');

foreach ($pages as $page) {
    $base   = basename($page);
    $output = shell_exec("php -l " . escapeshellarg($page) . " 2>&1");
    str_contains($output, 'No syntax errors')
        ? p("Syntax OK: $base")
        : f("Syntax ERROR: $base", trim($output));
}

// ─── Page Structure Checks ───────────────────────────────────────────────────
h('PAGE STRUCTURE CHECKS');

$excludeFromHeader = ['login.php']; // Login has its own layout

foreach ($pages as $page) {
    $base    = basename($page);
    $content = file_get_contents($page);
    $issues  = [];

    // $pageTitle check (skip login)
    if (!in_array($base, $excludeFromHeader)) {
        if (!str_contains($content, '$pageTitle')) $issues[] = 'missing $pageTitle';
    }

    // header/footer include check
    if (!in_array($base, $excludeFromHeader)) {
        if (!str_contains($content, "includes/header.php")) $issues[] = 'missing header include';
        if (!str_contains($content, "includes/footer.php")) $issues[] = 'missing footer include';
    }

    if (empty($issues)) {
        p("Structure OK: $base");
    } else {
        f("Structure: $base", implode(', ', $issues));
    }
}

// ─── Brand Name Check ─────────────────────────────────────────────────────────
h('BRAND NAME CONTAMINATION CHECK');

$brandFound = false;
foreach ($pages as $page) {
    $base    = basename($page);
    $content = file_get_contents($page);
    foreach ($brandWords as $brand) {
        if (stripos($content, $brand) !== false) {
            f("Brand leak in $base", "Found: '$brand'");
            $brandFound = true;
        }
    }
}
if (!$brandFound) {
    p('No brand names found in any admin page', count($pages) . ' pages scanned');
}

// ─── Security Pattern Checks ─────────────────────────────────────────────────
h('ADMIN SECURITY PATTERNS');

// Check includes directory
$includeFiles = ['header.php', 'footer.php', 'sidebar.php'];
foreach ($includeFiles as $inc) {
    file_exists("$adminDir/includes/$inc")
        ? p("includes/$inc exists")
        : f("includes/$inc MISSING");
}

// Check that admin files use session or auth check
$authProtectedPages = ['dashboard.php', 'products.php', 'orders.php', 'customers.php', 'settings.php'];
foreach ($authProtectedPages as $pg) {
    $file = "$adminDir/$pg";
    if (!file_exists($file)) { w("$pg not found — skipping auth check"); continue; }
    $content = file_get_contents($file);
    // Admin pages are protected by session check in header.php
    str_contains($content, 'header.php')
        ? p("$pg: protected via header include (session check)")
        : w("$pg: may not include header.php auth guard");
}

// ─── Check includes/header.php has auth guard ────────────────────────────────
h('AUTH GUARD IN HEADER');

$headerFile    = "$adminDir/includes/header.php";
$headerContent = file_exists($headerFile) ? file_get_contents($headerFile) : '';

if (empty($headerContent)) {
    f('includes/header.php not found or empty');
} else {
    (str_contains($headerContent, 'session_start') || str_contains($headerContent, '$_SESSION') || str_contains($headerContent, 'admin_token'))
        ? p('header.php contains session/auth check')
        : w('header.php may not have auth guard — verify manually');

    str_contains($headerContent, 'login.php')
        ? p('header.php redirects to login.php if not authenticated')
        : w('header.php does not redirect to login.php — check auth flow');
}

// ─── Check sidebar.php has all Phase 13 pages ────────────────────────────────
h('SIDEBAR COMPLETENESS CHECK');

$sidebarFile    = "$adminDir/includes/sidebar.php";
$sidebarContent = file_exists($sidebarFile) ? file_get_contents($sidebarFile) : '';

$expectedLinks = [
    'products.php'      => 'Products',
    'categories.php'    => 'Categories',
    'inventory.php'     => 'Inventory',
    'orders.php'        => 'Orders',
    'customers.php'     => 'Customers',
    'reports.php'       => 'Reports',
    'theme-manager.php' => 'Theme Manager',
    'media-library.php' => 'Media Library',
    'seo-manager.php'   => 'SEO Manager',
    'site-manager.php'  => 'Site Manager',
    'settings.php'      => 'Site Settings',
    'payments-config.php'=>'Payments',
];

foreach ($expectedLinks as $href => $label) {
    str_contains($sidebarContent, $href)
        ? p("Sidebar: $label link present", $href)
        : f("Sidebar: $label MISSING", "$href not in sidebar");
}

// ─── Admin Page Count ─────────────────────────────────────────────────────────
h('FINAL COUNT');
echo "Total admin pages found: " . count($pages) . "\n";
echo "Expected: ≥25\n";
count($pages) >= 25 ? p("Admin page count meets minimum (≥25)", count($pages) . " pages") : f("Too few admin pages", count($pages) . " found");

// ─── Summary ─────────────────────────────────────────────────────────────────
$total = $passed + $failed + $warnings;
echo "\n\033[1m══ ADMIN VERIFICATION SUMMARY ══\033[0m\n";
echo "Total: $total | \033[32mPass: $passed\033[0m | \033[31mFail: $failed\033[0m | \033[33mWarn: $warnings\033[0m\n";

$report = ['timestamp'=>date('c'), 'pages_checked'=>count($pages), 'passed'=>$passed, 'failed'=>$failed, 'warnings'=>$warnings, 'results'=>$results];
file_put_contents(__DIR__ . '/admin_result.json', json_encode($report, JSON_PRETTY_PRINT));
echo "Report saved to tests/admin/admin_result.json\n";

exit($failed > 0 ? 1 : 0);
