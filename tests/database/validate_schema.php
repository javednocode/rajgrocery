<?php
/**
 * Database Validation Test Suite
 * Tests all migrations, foreign keys, indexes, and constraints.
 *
 * Usage: php tests/database/validate_schema.php
 *
 * Set DB credentials via env:
 *   DB_HOST=localhost DB_NAME=reuse_ecom DB_USER=root DB_PASS='' php tests/database/validate_schema.php
 */

// ─── Config ──────────────────────────────────────────────────────────────────
$host   = getenv('DB_HOST') ?: '127.0.0.1';
$port   = getenv('DB_PORT') ?: '3306';
$dbname = getenv('DB_NAME') ?: 'reuse_ecom_test';
$user   = getenv('DB_USER') ?: 'root';
$pass   = getenv('DB_PASS') ?: '';

$results = [];
$errors  = [];

// ─── Helper ──────────────────────────────────────────────────────────────────
function pass(string $test, string $detail = ''): void {
    global $results;
    $results[] = ['status' => 'PASS', 'test' => $test, 'detail' => $detail];
    echo "\033[32m✅ PASS\033[0m  $test" . ($detail ? " — $detail" : '') . "\n";
}

function fail(string $test, string $detail = ''): void {
    global $results, $errors;
    $results[] = ['status' => 'FAIL', 'test' => $test, 'detail' => $detail];
    $errors[]  = "$test: $detail";
    echo "\033[31m❌ FAIL\033[0m  $test" . ($detail ? " — $detail" : '') . "\n";
}

function info(string $msg): void {
    echo "\033[33m   ℹ\033[0m  $msg\n";
}

function header_line(string $section): void {
    echo "\n\033[1;34m══ $section ══\033[0m\n";
}

// ─── Connect ─────────────────────────────────────────────────────────────────
header_line('DATABASE CONNECTION');

try {
    $pdo = new PDO(
        "mysql:host={$host};port={$port};charset=utf8mb4",
        $user, $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
    pass('MySQL connection', "Connected to {$host}:{$port} as {$user}");
} catch (PDOException $e) {
    fail('MySQL connection', $e->getMessage());
    echo "\n\033[31mCannot connect to database. Aborting.\033[0m\n";
    exit(1);
}

// ─── Create fresh test database ──────────────────────────────────────────────
header_line('FRESH DATABASE MIGRATION TEST');

$pdo->exec("DROP DATABASE IF EXISTS `{$dbname}`");
$pdo->exec("CREATE DATABASE `{$dbname}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$pdo->exec("USE `{$dbname}`");
pass('Create test database', $dbname);

$schemaFile = __DIR__ . '/../../database/schema.sql';
$migration1 = __DIR__ . '/../../database/migrations/001_add_site_id.sql';
$migration2 = __DIR__ . '/../../database/migrations/002_enterprise_schema.sql';

// Run schema
foreach ([
    ['Main schema', $schemaFile],
    ['Migration 001 (site_id)', $migration1],
    ['Migration 002 (enterprise)', $migration2],
] as [$label, $file]) {
    if (!file_exists($file)) { fail($label, "File not found: $file"); continue; }
    try {
        $sql = file_get_contents($file);
        // Split on semicolons, skip empty lines
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        foreach ($statements as $stmt) {
            if (empty($stmt) || str_starts_with(ltrim($stmt), '--')) continue;
            $pdo->exec($stmt);
        }
        pass($label, 'Executed successfully on empty DB');
    } catch (PDOException $e) {
        fail($label, $e->getMessage());
    }
}

// ─── Run migrations again (idempotency test) ─────────────────────────────────
header_line('IDEMPOTENCY TEST (run migrations twice)');

foreach ([
    ['Schema (re-run)', $schemaFile],
    ['Migration 001 (re-run)', $migration1],
    ['Migration 002 (re-run)', $migration2],
] as [$label, $file]) {
    if (!file_exists($file)) { fail($label, "File not found"); continue; }
    try {
        $sql = file_get_contents($file);
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        foreach ($statements as $stmt) {
            if (empty($stmt) || str_starts_with(ltrim($stmt), '--')) continue;
            $pdo->exec($stmt);
        }
        pass($label, 'Idempotent — no errors on second run');
    } catch (PDOException $e) {
        fail($label, 'NOT idempotent: ' . $e->getMessage());
    }
}

// ─── Table existence checks ───────────────────────────────────────────────────
header_line('REQUIRED TABLE CHECKS');

$requiredTables = [
    // Core
    'sites', 'site_settings', 'admins', 'admin_roles', 'admin_permissions',
    // Catalog
    'products', 'product_images', 'categories', 'product_categories',
    'product_attributes', 'product_attribute_values', 'product_variants', 'variant_attribute_values',
    // Commerce
    'orders', 'order_items', 'order_timeline', 'order_notes', 'coupons',
    // Inventory
    'inventory_history',
    // Shipping
    'shipping_zones', 'shipping_zone_postcodes', 'shipping_rates',
    // Payments
    'payment_gateways', 'saved_carts',
    // Content
    'banners', 'blog_posts', 'blog_categories', 'pages',
    // Customers
    'customers',
    // Security
    'audit_logs', 'security_events', 'rate_limit_log',
];

$stmt = $pdo->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$dbname'");
$existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);

foreach ($requiredTables as $table) {
    if (in_array($table, $existingTables)) {
        pass("Table: $table");
    } else {
        fail("Table: $table", 'NOT FOUND in database');
    }
}
info('Total tables in DB: ' . count($existingTables));

// ─── Column checks on critical tables ────────────────────────────────────────
header_line('CRITICAL COLUMN CHECKS');

$columnChecks = [
    'products'         => ['id', 'site_id', 'name', 'slug', 'price', 'stock', 'is_active'],
    'orders'           => ['id', 'site_id', 'order_number', 'status', 'payment_status', 'total'],
    'order_items'      => ['id', 'order_id', 'product_id', 'variant_id', 'quantity', 'fulfilled_qty', 'total_price'],
    'product_variants' => ['id', 'product_id', 'site_id', 'sku', 'price', 'stock', 'reserved_stock'],
    'admins'           => ['id', 'name', 'email', 'password', 'role', 'role_id', 'is_active'],
    'shipping_rates'   => ['id', 'zone_id', 'method', 'rate', 'free_above_amount', 'rate_per_kg'],
    'payment_gateways' => ['id', 'site_id', 'gateway_key', 'is_enabled', 'is_test_mode', 'config'],
    'audit_logs'       => ['id', 'site_id', 'admin_id', 'action', 'resource', 'old_value', 'new_value'],
];

foreach ($columnChecks as $table => $columns) {
    $stmt = $pdo->query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = '$dbname' AND TABLE_NAME = '$table'");
    $existingCols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($columns as $col) {
        if (in_array($col, $existingCols)) {
            pass("$table.$col");
        } else {
            fail("$table.$col", 'Column missing');
        }
    }
}

// ─── Foreign Key Integrity ────────────────────────────────────────────────────
header_line('FOREIGN KEY CONSTRAINT CHECKS');

$fkStmt = $pdo->query("SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = '$dbname' AND REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY TABLE_NAME");
$fks = $fkStmt->fetchAll();

if (count($fks) > 0) {
    pass('Foreign keys defined', count($fks) . ' FK constraints found');
    foreach ($fks as $fk) {
        info("{$fk['TABLE_NAME']}.{$fk['COLUMN_NAME']} → {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}");
    }
} else {
    fail('Foreign keys defined', 'No FK constraints found');
}

// ─── Index checks ────────────────────────────────────────────────────────────
header_line('INDEX COVERAGE CHECKS');

$criticalIndexes = [
    ['products',          'site_id'],
    ['orders',            'site_id'],
    ['orders',            'order_number'],
    ['order_items',       'order_id'],
    ['product_variants',  'product_id'],
    ['inventory_history', 'product_id'],
    ['shipping_rates',    'zone_id'],
    ['audit_logs',        'admin_id'],
    ['security_events',   'ip_address'],
];

foreach ($criticalIndexes as [$table, $col]) {
    $idxStmt = $pdo->prepare("SELECT INDEX_NAME FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1");
    $idxStmt->execute([$dbname, $table, $col]);
    $idx = $idxStmt->fetch();
    if ($idx) {
        pass("Index on {$table}.{$col}", $idx['INDEX_NAME']);
    } else {
        fail("Index on {$table}.{$col}", 'No index found — potential slow query');
    }
}

// ─── Data Integrity — Default Seeds ──────────────────────────────────────────
header_line('DEFAULT SEED DATA CHECKS');

$seedChecks = [
    ['admin_roles',      "SELECT COUNT(*) FROM admin_roles WHERE is_system = 1",                5, 'system roles'],
    ['admin_permissions',"SELECT COUNT(*) FROM admin_permissions",                              55, 'permission rows (≥55)'],
    ['payment_gateways', "SELECT COUNT(*) FROM payment_gateways WHERE site_id = 1",             4, 'default gateways'],
    ['shipping_zones',   "SELECT COUNT(*) FROM shipping_zones WHERE site_id = 1",               1, 'default zone'],
    ['shipping_rates',   "SELECT COUNT(*) FROM shipping_rates WHERE site_id = 1",               2, 'default rates'],
    ['product_attributes',"SELECT COUNT(*) FROM product_attributes WHERE site_id = 1",          5, 'default attributes'],
];

foreach ($seedChecks as [$label, $query, $expected, $desc]) {
    $count = (int)$pdo->query($query)->fetchColumn();
    if ($count >= $expected) {
        pass("Seed: $label", "$count $desc found");
    } else {
        fail("Seed: $label", "Expected ≥{$expected}, got {$count}");
    }
}

// ─── Duplicate Constraint Check ──────────────────────────────────────────────
header_line('DUPLICATE CONSTRAINT CHECK');

$dupStmt = $pdo->query("SELECT CONSTRAINT_NAME, TABLE_NAME, COUNT(*) as cnt
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = '$dbname'
    GROUP BY CONSTRAINT_NAME, TABLE_NAME
    HAVING cnt > 1");
$dups = $dupStmt->fetchAll();

if (empty($dups)) {
    pass('No duplicate constraints', 'All constraint names are unique');
} else {
    foreach ($dups as $dup) {
        fail('Duplicate constraint', "{$dup['TABLE_NAME']}.{$dup['CONSTRAINT_NAME']}");
    }
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────
$pdo->exec("DROP DATABASE IF EXISTS `{$dbname}`");
info("Test database '$dbname' cleaned up");

// ─── Summary ─────────────────────────────────────────────────────────────────
$passed = count(array_filter($results, fn($r) => $r['status'] === 'PASS'));
$failed = count(array_filter($results, fn($r) => $r['status'] === 'FAIL'));
$total  = count($results);

echo "\n\033[1m══ SUMMARY ══\033[0m\n";
echo "Total: $total | \033[32mPass: $passed\033[0m | \033[31mFail: $failed\033[0m\n";

if (!empty($errors)) {
    echo "\n\033[31mFAILURES:\033[0m\n";
    foreach ($errors as $e) echo "  - $e\n";
}

// Write JSON report
$report = [
    'timestamp'   => date('c'),
    'database'    => ['host' => $host, 'name' => $dbname],
    'total'       => $total,
    'passed'      => $passed,
    'failed'      => $failed,
    'pass_rate'   => $total > 0 ? round($passed / $total * 100, 1) : 0,
    'errors'      => $errors,
    'results'     => $results,
];

file_put_contents(__DIR__ . '/db_validation_result.json', json_encode($report, JSON_PRETTY_PRINT));
echo "\nReport saved to tests/database/db_validation_result.json\n";

exit($failed > 0 ? 1 : 0);
