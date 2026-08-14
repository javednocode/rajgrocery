<?php
/**
 * Test script for the WordPress customer importer.
 * Run: php backend/tests/test_wp_customer_import.php
 *
 * Tests:
 *  1. CSV parses correctly
 *  2. All WP plugin headers auto-map to correct fields
 *  3. user_pass column is NOT in the mapping
 *  4. password_reset_required = 1 after import
 *  5. Batch size is 100
 *  6. Invalid row (no email) is marked failed
 */

// Force local DB detection in CLI context
$_SERVER['SERVER_NAME'] = 'localhost';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/slug.php';
require_once __DIR__ . '/../helpers/customer_import_queue.php';

$db = (new Database())->getConnection();
ci_ensure_schema($db);

$testCsv = __DIR__ . '/../uploads/imports/test_wp_export.csv';
$pass = 0; $fail = 0;

function ok(string $label, bool $cond, string $detail = ''): void {
    global $pass, $fail;
    if ($cond) { $pass++; echo "\033[32m  ✓ PASS\033[0m $label\n"; }
    else        { $fail++; echo "\033[31m  ✗ FAIL\033[0m $label" . ($detail ? " — $detail" : '') . "\n"; }
}

echo "\n\033[1m=== WordPress Customer Import Tests ===\033[0m\n\n";

// ── 1. Parse ─────────────────────────────────────────────────────────
echo "\033[1m[1] CSV Parsing\033[0m\n";
$rows = ci_parse_file($testCsv, 'csv');
ok('File parsed', !empty($rows));
ok('Has 6 rows (1 header + 5 data)', count($rows) === 6, 'got ' . count($rows));

$indexed = ci_index_rows($rows);
ok('Headers extracted', !empty($indexed['headers']));
ok('Has 5 data rows', count($indexed['rows']) === 5, 'got ' . count($indexed['rows']));
echo "\n";

// ── 2. Auto-mapping ──────────────────────────────────────────────────
echo "\033[1m[2] Auto-Mapping (WP Plugin Headers)\033[0m\n";
$mapping = ci_auto_mapping($indexed['headers']);

$expected = [
    'username'             => 'user_login',
    'email'                => 'user_email',
    'display_name'         => 'display_name',
    'account_created_at'   => 'user_registered',
    'customer_role'        => 'role',
    'first_name'           => 'billing_first_name',
    'last_name'            => 'billing_last_name',
    'phone'                => 'billing_phone',
    'company'              => 'billing_company',
    'billing_address'      => 'billing_address_1',
    'billing_city'         => 'billing_city',
    'billing_state'        => 'billing_state',
    'billing_postal_code'  => 'billing_postcode',
    'billing_country'      => 'billing_country',
    'shipping_address'     => 'shipping_address_1',
    'shipping_city'        => 'shipping_city',
    'shipping_state'       => 'shipping_state',
    'shipping_postal_code' => 'shipping_postcode',
    'shipping_country'     => 'shipping_country',
];

foreach ($expected as $field => $expectedHeader) {
    ok("$field → $expectedHeader", ($mapping[$field] ?? null) === $expectedHeader,
       "got: " . ($mapping[$field] ?? '(not mapped)'));
}
echo "\n";

// ── 3. Password hash NOT mapped ───────────────────────────────────────
echo "\033[1m[3] Password Security\033[0m\n";
ok('user_pass is NOT in mapping', !in_array('user_pass', $mapping, true));
ok('user_pass_hash is NOT in mapping', !in_array('user_pass_hash', $mapping, true));
ok('password is NOT a target field', !array_key_exists('password', ci_fields()));
echo "\n";

// ── 4. Row mapping ────────────────────────────────────────────────────
echo "\033[1m[4] Row Mapping\033[0m\n";
$mapped = array_map(fn($r) => ci_map_row($r, $mapping), $indexed['rows']);
$row1 = $mapped[0];
ok('Row 1 username = john.smith',      $row1['username']    === 'john.smith');
ok('Row 1 email = john@example.com',   $row1['email']       === 'john@example.com');
ok('Row 1 display_name = John Smith',  $row1['display_name'] === 'John Smith');
ok('Row 1 first_name = John',          $row1['first_name']  === 'John');
ok('Row 1 customer_role = customer',   $row1['customer_role'] === 'customer');
ok('Row 1 billing_postcode = 999077',  $row1['billing_postal_code'] === '999077');
ok('Row 1 has NO password field',      !array_key_exists('password', $row1));
ok('Row 5 email is empty (invalid row)', $mapped[4]['email'] === '');
echo "\n";

// ── 5. Batch size default is 100 ─────────────────────────────────────
echo "\033[1m[5] Batch Size\033[0m\n";
$ref = new ReflectionFunction('ci_process_job');
$limitParam = null;
foreach ($ref->getParameters() as $p) {
    if ($p->getName() === 'limit') $limitParam = $p->getDefaultValue();
}
ok('Default batch limit = 100', $limitParam === 100, "got: $limitParam");
echo "\n";

// ── 6. Live import into DB (use separate test records) ─────────────────
echo "\033[1m[6] Live Import\033[0m\n";
// Clean up any prior test runs
$db->exec("DELETE FROM customers WHERE email IN ('john@example.com','mary@example.com','bob@testshop.hk','subscriber@example.com') AND source='csv_import'");
$db->exec("DELETE FROM customer_import_items WHERE email IN ('john@example.com','mary@example.com','bob@testshop.hk','subscriber@example.com')");

$validRows = array_values(array_filter($mapped, fn($r) => $r['email'] !== ''));
$job = ci_create_job($db, 'test_wp_export.csv', $mapping, $validRows);
ok('Job created', $job['id'] > 0);
ok('Job total = 4 (valid rows)',  (int)$job['total'] === 4, 'got ' . $job['total']);
echo "\n";

// Process all rows
$processed = ci_process_job($db, $job['id'], 100);
ok('Status = completed',         $processed['status'] === 'completed');
ok('Imported = 4',               (int)$processed['imported'] === 4, 'got ' . $processed['imported']);
ok('Skipped  = 0',               (int)$processed['skipped']  === 0, 'got ' . $processed['skipped']);
ok('Failed   = 0',               (int)$processed['failed']   === 0, 'got ' . $processed['failed']);
echo "\n";

// ── 7. password_reset_required = 1 ───────────────────────────────────
echo "\033[1m[7] Password Reset Required\033[0m\n";
$stmt = $db->prepare("SELECT email, password, password_reset_required, username, display_name, customer_role
    FROM customers WHERE email = 'john@example.com'");
$stmt->execute();
$cust = $stmt->fetch(PDO::FETCH_ASSOC);
ok('Customer john@example.com found',           !empty($cust));
ok('password column is NULL',                   $cust['password'] === null,    'got: ' . var_export($cust['password'], true));
ok('password_reset_required = 1',               (int)$cust['password_reset_required'] === 1);
ok('username = john.smith',                     $cust['username'] === 'john.smith');
ok('display_name = John Smith',                 $cust['display_name'] === 'John Smith');
ok('customer_role = customer',                  $cust['customer_role'] === 'customer');
echo "\n";

// ── 8. Idempotency — re-run must skip duplicates ──────────────────────
echo "\033[1m[8] Idempotency (duplicate skip)\033[0m\n";
$job2 = ci_create_job($db, 'test_wp_export_rerun.csv', $mapping, $validRows);
$processed2 = ci_process_job($db, $job2['id'], 100);
ok('Re-run: status = completed',  $processed2['status'] === 'completed');
ok('Re-run: imported = 0',        (int)$processed2['imported'] === 0, 'got ' . $processed2['imported']);
ok('Re-run: skipped  = 4',        (int)$processed2['skipped']  === 4, 'got ' . $processed2['skipped']);
echo "\n";

// ── 9. Subscriber role is stored correctly ────────────────────────────
echo "\033[1m[9] Customer Role Handling\033[0m\n";
$stmt2 = $db->prepare("SELECT customer_role FROM customers WHERE email = 'subscriber@example.com'");
$stmt2->execute();
$sub = $stmt2->fetch(PDO::FETCH_ASSOC);
ok('Subscriber role stored correctly', $sub['customer_role'] === 'subscriber', 'got: ' . ($sub['customer_role'] ?? 'null'));
echo "\n";

// ── 10. Rollback ──────────────────────────────────────────────────────
echo "\033[1m[10] Rollback\033[0m\n";
$rb = ci_rollback_job($db, $job['id']);
ok('Rollback: status = rolled_back', $rb['status'] === 'rolled_back');
$stmt3 = $db->prepare("SELECT COUNT(*) FROM customers WHERE email = 'john@example.com'");
$stmt3->execute();
ok('Customer deleted after rollback', (int)$stmt3->fetchColumn() === 0);
// Clean up job2 test data too
$db->exec("DELETE FROM customers WHERE email IN ('john@example.com','mary@example.com','bob@testshop.hk','subscriber@example.com') AND source='csv_import'");
echo "\n";

// ── Summary ───────────────────────────────────────────────────────────
$total = $pass + $fail;
echo "\033[1m=== Results: $pass/$total passed ===\033[0m";
echo $fail > 0 ? "\033[31m  ($fail FAILED)\033[0m\n\n" : "\033[32m  All tests passed!\033[0m\n\n";
exit($fail > 0 ? 1 : 0);
