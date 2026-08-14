<?php
/**
 * Customer import queue and row-import helpers.
 *
 * Mirrors helpers/import_queue.php (the product migration system) on
 * purpose: same job/log/item-ledger shape, same chunked-and-resumable
 * processing model. That system already proved this pattern handles large
 * imports on shared hosting without timing out and without losing state if
 * a run gets interrupted — reusing it here rather than inventing a second
 * import architecture.
 *
 * WordPress "Import Export Users and Customers" plugin support:
 *  - Exact column aliases for both v1.x and v2.x (WebToffee) plugin exports
 *  - user_pass / password hash columns are silently IGNORED — never stored
 *  - password_reset_required = 1 is set on every imported row so customers
 *    must use Forgot Password to gain access
 *  - username, display_name, customer_role are stored as informational fields
 */

require_once __DIR__ . '/slug.php';

// ── Schema is created by database/customer_import_system.sql. This is a
//    safety net only (e.g. a fresh environment where the .sql hasn't been
//    run yet) — CREATE TABLE IF NOT EXISTS, so it's a no-op otherwise.
//    Also handles the WordPress-support migration columns added later. ──
function ci_ensure_schema(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;

    // Core import tables
    $db->exec("CREATE TABLE IF NOT EXISTS customer_import_jobs (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        batch_id VARCHAR(64) NOT NULL UNIQUE,
        filename VARCHAR(255) DEFAULT NULL,
        status ENUM('pending','running','completed','failed','rolled_back') DEFAULT 'pending',
        mapping_json LONGTEXT,
        payload_file VARCHAR(255) DEFAULT NULL,
        total INT DEFAULT 0,
        processed INT DEFAULT 0,
        imported INT DEFAULT 0,
        updated INT DEFAULT 0,
        skipped INT DEFAULT 0,
        failed INT DEFAULT 0,
        started_at DATETIME DEFAULT NULL,
        finished_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_status (status),
        KEY idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $db->exec("CREATE TABLE IF NOT EXISTS customer_import_logs (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        batch_id VARCHAR(64) NOT NULL,
        level ENUM('info','success','warning','error') DEFAULT 'info',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_job_id (job_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $db->exec("CREATE TABLE IF NOT EXISTS customer_import_items (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        batch_id VARCHAR(64) NOT NULL,
        `row_number` INT NOT NULL,
        customer_id INT DEFAULT NULL,
        email VARCHAR(200) DEFAULT NULL,
        `action` ENUM('imported','updated','skipped','failed') NOT NULL,
        error TEXT DEFAULT NULL,
        row_data_json LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_job_id (job_id),
        KEY idx_action (`action`),
        KEY idx_customer_id (customer_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // ── WordPress-support migration — add columns if missing ──────────────
    // Uses INFORMATION_SCHEMA guards (MySQL 5.7+ compatible) so this is safe
    // to call on an already-migrated DB without error.
    //
    // These also cover production DBs that were created from an older SQL dump
    // and don't yet have first_name / last_name / the WP-specific columns.
    ci_add_column_if_missing($db, 'customers', 'first_name',
        "ALTER TABLE customers ADD COLUMN first_name VARCHAR(100) DEFAULT NULL AFTER name");
    ci_add_column_if_missing($db, 'customers', 'last_name',
        "ALTER TABLE customers ADD COLUMN last_name VARCHAR(100) DEFAULT NULL AFTER first_name");
    ci_add_column_if_missing($db, 'customers', 'username',
        "ALTER TABLE customers ADD COLUMN username VARCHAR(100) DEFAULT NULL AFTER last_name");
    ci_add_column_if_missing($db, 'customers', 'display_name',
        "ALTER TABLE customers ADD COLUMN display_name VARCHAR(150) DEFAULT NULL AFTER username");
    ci_add_column_if_missing($db, 'customers', 'customer_role',
        "ALTER TABLE customers ADD COLUMN customer_role VARCHAR(50) DEFAULT 'customer' AFTER display_name");
    ci_add_column_if_missing($db, 'customers', 'company',
        "ALTER TABLE customers ADD COLUMN company VARCHAR(150) DEFAULT NULL AFTER customer_role");
    ci_add_column_if_missing($db, 'customers', 'password_reset_required',
        "ALTER TABLE customers ADD COLUMN password_reset_required TINYINT(1) NOT NULL DEFAULT 0 AFTER password");
    ci_add_column_if_missing($db, 'customers', 'billing_address',
        "ALTER TABLE customers ADD COLUMN billing_address VARCHAR(255) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'billing_city',
        "ALTER TABLE customers ADD COLUMN billing_city VARCHAR(100) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'billing_state',
        "ALTER TABLE customers ADD COLUMN billing_state VARCHAR(100) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'billing_country',
        "ALTER TABLE customers ADD COLUMN billing_country VARCHAR(100) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'billing_postal_code',
        "ALTER TABLE customers ADD COLUMN billing_postal_code VARCHAR(20) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'shipping_address',
        "ALTER TABLE customers ADD COLUMN shipping_address VARCHAR(255) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'shipping_city',
        "ALTER TABLE customers ADD COLUMN shipping_city VARCHAR(100) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'shipping_state',
        "ALTER TABLE customers ADD COLUMN shipping_state VARCHAR(100) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'shipping_country',
        "ALTER TABLE customers ADD COLUMN shipping_country VARCHAR(100) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'shipping_postal_code',
        "ALTER TABLE customers ADD COLUMN shipping_postal_code VARCHAR(20) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'account_created_at',
        "ALTER TABLE customers ADD COLUMN account_created_at DATE DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'source',
        "ALTER TABLE customers ADD COLUMN source VARCHAR(30) NOT NULL DEFAULT 'storefront'");
    ci_add_column_if_missing($db, 'customers', 'external_customer_id',
        "ALTER TABLE customers ADD COLUMN external_customer_id VARCHAR(100) DEFAULT NULL");
    ci_add_column_if_missing($db, 'customers', 'import_job_id',
        "ALTER TABLE customers ADD COLUMN import_job_id INT DEFAULT NULL");

    // Add 'updated' counter to jobs table if running against an older schema
    ci_add_column_if_missing($db, 'customer_import_jobs', 'updated',
        "ALTER TABLE customer_import_jobs ADD COLUMN updated INT DEFAULT 0 AFTER imported");

    // Add 'updated' to items action enum if not already there
    try {
        $db->exec("ALTER TABLE customer_import_items MODIFY `action` ENUM('imported','updated','skipped','failed') NOT NULL");
    } catch (\Throwable $e) { /* already up to date */ }
}

/** Adds a column to a table only when it does not already exist. */
function ci_add_column_if_missing(PDO $db, string $table, string $column, string $alterSql): void {
    $stmt = $db->prepare("SELECT COUNT(*) FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = :t AND column_name = :c");
    $stmt->execute([':t' => $table, ':c' => $column]);
    if ((int)$stmt->fetchColumn() === 0) {
        try { $db->exec($alterSql); } catch (\Throwable $e) { /* race — another request beat us */ }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// FIELD DEFINITIONS — the canonical target field list.
// These are the fields we import INTO our system. WordPress-only fields
// (passwords, WP user meta, nonces, etc.) are NOT in this list — any CSV
// column not mapped here is silently ignored.
// ═══════════════════════════════════════════════════════════════════════
function ci_fields(): array {
    return [
        // ── Identity ──────────────────────────────────────────────────
        'username'             => 'Username',
        'first_name'           => 'First Name',
        'last_name'            => 'Last Name',
        'display_name'         => 'Display Name',
        'email'                => 'Email',
        'phone'                => 'Phone',
        'company'              => 'Company',
        // ── Billing ───────────────────────────────────────────────────
        'billing_address'      => 'Billing Address',
        'billing_city'         => 'Billing City',
        'billing_state'        => 'Billing State',
        'billing_country'      => 'Billing Country',
        'billing_postal_code'  => 'Billing Postcode',
        // ── Shipping ──────────────────────────────────────────────────
        'shipping_address'     => 'Shipping Address',
        'shipping_city'        => 'Shipping City',
        'shipping_state'       => 'Shipping State',
        'shipping_country'     => 'Shipping Country',
        'shipping_postal_code' => 'Shipping Postcode',
        // ── Account meta ──────────────────────────────────────────────
        'customer_role'        => 'Customer Role',
        'account_created_at'   => 'Registration Date',
        // ── Order-linking key (req #15) ───────────────────────────────
        'external_customer_id' => 'Customer ID',
    ];
}

/**
 * Normalise a header string the same way across preview/validate/import
 * so a mapping chosen at preview time still matches at import time.
 */
function ci_header_key($value): string {
    return strtolower(trim(preg_replace('/[^a-z0-9]+/i', '_', (string)$value), '_'));
}

/**
 * Auto-mapping aliases covering:
 *  1. WooCommerce native "Export Customers" columns
 *  2. WebToffee "Import Export Users and Customers" plugin v1.x + v2.x
 *  3. Generic CSV export variants
 *
 * The WordPress user_pass / user_pass_hash / password columns are
 * deliberately ABSENT from this mapping — they map to nothing, so the
 * password hash is silently ignored and never stored anywhere.
 *
 * All header keys are pre-normalised by ci_header_key() before this runs,
 * so 'Billing First Name' becomes 'billing_first_name', etc.
 */
function ci_auto_mapping(array $headers): array {
    // Keys = our internal field names, values = ordered list of normalised
    // header strings to try, first match wins.
    $aliases = [
        // ── Identity ──────────────────────────────────────────────────
        'username' => [
            'user_login',       // WordPress / WP plugin v1 & v2 exact export name
            'username',
            'login',
            'user_name',
        ],
        'first_name' => [
            'billing_first_name',   // WP plugin primary (WC billing block)
            'first_name',
            'firstname',
            'fname',
        ],
        'last_name' => [
            'billing_last_name',    // WP plugin primary
            'last_name',
            'lastname',
            'lname',
            'surname',
        ],
        'display_name' => [
            'display_name',         // WordPress display_name field
            'displayname',
            'full_name',
            'fullname',
        ],
        'email' => [
            'user_email',           // WordPress / WP plugin exact column name
            'email',
            'email_address',
            'billing_email',
        ],
        'phone' => [
            'billing_phone',        // WP plugin / WooCommerce
            'phone',
            'phone_number',
            'telephone',
            'mobile',
        ],
        'company' => [
            'billing_company',      // WP plugin / WooCommerce
            'company',
            'organization',
            'organisation',
        ],

        // ── Billing ───────────────────────────────────────────────────
        'billing_address' => [
            'billing_address_1',    // WP plugin / WooCommerce exact
            'billing_address',
            'billing_street_address',
            'billing_address1',
        ],
        'billing_city' => [
            'billing_city',
            'billing_town',
        ],
        'billing_state' => [
            'billing_state',
            'billing_province',
            'billing_county',
        ],
        'billing_country' => [
            'billing_country',
            'billing_country_code',
        ],
        'billing_postal_code' => [
            'billing_postcode',     // WP plugin / WooCommerce exact name
            'billing_postal_code',
            'billing_zip',
            'billing_zip_code',
        ],

        // ── Shipping ──────────────────────────────────────────────────
        'shipping_address' => [
            'shipping_address_1',   // WP plugin / WooCommerce exact
            'shipping_address',
            'shipping_street_address',
            'shipping_address1',
        ],
        'shipping_city' => [
            'shipping_city',
            'shipping_town',
        ],
        'shipping_state' => [
            'shipping_state',
            'shipping_province',
            'shipping_county',
        ],
        'shipping_country' => [
            'shipping_country',
            'shipping_country_code',
        ],
        'shipping_postal_code' => [
            'shipping_postcode',    // WP plugin / WooCommerce exact name
            'shipping_postal_code',
            'shipping_zip',
            'shipping_zip_code',
        ],

        // ── Account meta ──────────────────────────────────────────────
        'customer_role' => [
            'role',                 // WP plugin exact column name
            'customer_role',
            'user_role',
            'roles',
            'woocommerce_role',
        ],
        'account_created_at' => [
            'user_registered',      // WordPress / WP plugin exact column name
            'registration_date',
            'account_created_date',
            'account_created',
            'date_registered',
            'registered',
            'created_at',
            'date_created',
        ],

        // ── Order-linking key (req #15) ───────────────────────────────
        // Deliberately listed last — 'id' is a very common header and we
        // only want it as a fallback for external_customer_id.
        'external_customer_id' => [
            'customer_id',
            'user_id',
            'id',
        ],
    ];

    $mapping = [];
    foreach ($aliases as $field => $names) {
        foreach ($names as $name) {
            if (in_array($name, $headers, true)) {
                $mapping[$field] = $name;
                break;
            }
        }
    }
    return $mapping;
}

function ci_map_row(array $rawByHeader, array $mapping): array {
    $out = [];
    foreach (ci_fields() as $field => $label) {
        $header = $mapping[$field] ?? null;
        $out[$field] = $header !== null ? trim((string)($rawByHeader[$header] ?? '')) : '';
    }
    return $out;
}

// ═══════════════════════════════════════════════════════════════════════
// FILE PARSING — CSV (auto delimiter + BOM strip) and XLSX
// ═══════════════════════════════════════════════════════════════════════
function ci_payload_dir(): string {
    $dir = __DIR__ . '/../uploads/imports/';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    return $dir;
}

function ci_read_csv(string $path): array {
    $rows = [];
    $fp = fopen($path, 'r');
    if (!$fp) return [];
    $bom = fread($fp, 3);
    if ($bom !== "\xEF\xBB\xBF") rewind($fp);
    $line = fgets($fp);
    rewind($fp);
    if ($bom === "\xEF\xBB\xBF") fread($fp, 3);
    $delim = substr_count((string)$line, "\t") > substr_count((string)$line, ',') ? "\t" : ',';
    // PHP 8.5 deprecates the implicit $escape default — pass it explicitly
    // (backslash matches the historical default) so parsing behaviour is
    // unchanged and this stays warning-free on newer PHP.
    while (($row = fgetcsv($fp, null, $delim, '"', '\\')) !== false) $rows[] = $row;
    fclose($fp);
    return $rows;
}

function ci_read_xlsx(string $path): array {
    if (!class_exists('SimpleXLSX')) require_once __DIR__ . '/SimpleXLSX.php';
    $xlsx = SimpleXLSX::parse($path);
    return $xlsx ? $xlsx->rows(0) : [];
}

function ci_parse_file(string $path, string $ext): array {
    return in_array($ext, ['xlsx', 'xls'], true) ? ci_read_xlsx($path) : ci_read_csv($path);
}

/**
 * Turns a parsed sheet (headers + data rows) into an array of raw
 * associative rows keyed by normalised header — the shape both auto-
 * mapping and manual mapping work against.
 */
function ci_index_rows(array $rows): array {
    if (count($rows) < 1) return ['headers' => [], 'rows' => []];
    $headers = array_map('ci_header_key', array_shift($rows));
    $indexed = [];
    foreach ($rows as $row) {
        $byHeader = [];
        foreach ($headers as $i => $h) {
            if ($h === '') continue;
            $byHeader[$h] = $row[$i] ?? '';
        }
        $indexed[] = $byHeader;
    }
    return ['headers' => $headers, 'rows' => $indexed];
}

// ═══════════════════════════════════════════════════════════════════════
// VALIDATION — no DB writes. Used by the /validate endpoint.
// ═══════════════════════════════════════════════════════════════════════
function ci_validate_email(string $email): ?string {
    $email = trim($email);
    if ($email === '') return 'Email is required';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return 'Email is not valid';
    return null;
}

/**
 * Validates every mapped row against required-field rules and duplicate
 * detection (both against the DB and within the file itself), without
 * writing anything. Returns per-row results plus a summary — this is the
 * "Validate before import" step, distinct from actually importing.
 */
function ci_validate_rows(PDO $db, array $mappedRows): array {
    $emailsInFile = [];
    $results = [];
    $summary = ['total' => count($mappedRows), 'valid' => 0, 'duplicate_in_db' => 0, 'duplicate_in_file' => 0, 'invalid' => 0];

    // Batch-check which emails already exist — one query, not N.
    $candidateEmails = array_values(array_unique(array_filter(array_map(
        fn($r) => strtolower(trim($r['email'] ?? '')), $mappedRows
    ))));
    $existing = [];
    foreach (array_chunk($candidateEmails, 1000) as $chunk) {
        if (!$chunk) continue;
        $placeholders = implode(',', array_fill(0, count($chunk), '?'));
        $stmt = $db->prepare("SELECT LOWER(email) AS e FROM customers WHERE LOWER(email) IN ($placeholders)");
        $stmt->execute($chunk);
        foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $e) $existing[$e] = true;
    }

    foreach ($mappedRows as $i => $row) {
        $rowNum = $i + 2; // +1 for 0-index, +1 for the header row
        $email = strtolower(trim($row['email'] ?? ''));
        $err = ci_validate_email($row['email'] ?? '');

        if ($err) {
            $summary['invalid']++;
            $results[] = ['row' => $rowNum, 'email' => $row['email'] ?? '', 'status' => 'invalid', 'reason' => $err];
        } elseif (isset($existing[$email])) {
            $summary['duplicate_in_db']++;
            $results[] = ['row' => $rowNum, 'email' => $row['email'], 'status' => 'duplicate_in_db', 'reason' => 'Email already exists in the system'];
        } elseif (isset($emailsInFile[$email])) {
            $summary['duplicate_in_file']++;
            $results[] = ['row' => $rowNum, 'email' => $row['email'], 'status' => 'duplicate_in_file', 'reason' => 'Duplicate email earlier in this file (row ' . $emailsInFile[$email] . ')'];
        } else {
            $emailsInFile[$email] = $rowNum;
            $summary['valid']++;
            $results[] = ['row' => $rowNum, 'email' => $row['email'], 'status' => 'valid', 'reason' => null];
        }
    }

    return ['summary' => $summary, 'rows' => $results];
}

// ═══════════════════════════════════════════════════════════════════════
// JOB LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════
function ci_write_payload(string $batchId, array $rows): string {
    $path = ci_payload_dir() . $batchId . '.json';
    file_put_contents($path, json_encode($rows, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    return $path;
}

function ci_read_payload(string $path): array {
    if (!$path || !is_file($path)) return [];
    $data = json_decode((string)file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function ci_log(PDO $db, int $jobId, string $batchId, string $level, string $message): void {
    $stmt = $db->prepare("INSERT INTO customer_import_logs (job_id, batch_id, level, message) VALUES (:j,:b,:l,:m)");
    $stmt->execute([
        ':j' => $jobId, ':b' => $batchId,
        ':l' => in_array($level, ['info', 'success', 'warning', 'error'], true) ? $level : 'info',
        ':m' => $message,
    ]);
}

function ci_create_job(PDO $db, string $filename, array $mapping, array $mappedRows): array {
    ci_ensure_schema($db);
    $batchId = 'cust_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4));
    $payloadFile = ci_write_payload($batchId, $mappedRows);

    $stmt = $db->prepare("INSERT INTO customer_import_jobs
        (batch_id, filename, status, mapping_json, payload_file, total)
        VALUES (:b,:f,'pending',:m,:p,:t)");
    $stmt->execute([
        ':b' => $batchId, ':f' => $filename,
        ':m' => json_encode($mapping, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        ':p' => $payloadFile, ':t' => count($mappedRows),
    ]);
    $jobId = (int)$db->lastInsertId();
    ci_log($db, $jobId, $batchId, 'info', "Import job created. Rows queued: " . count($mappedRows));
    return ci_get_job($db, $jobId);
}

function ci_get_job(PDO $db, int $jobId): array {
    ci_ensure_schema($db);
    $stmt = $db->prepare("SELECT * FROM customer_import_jobs WHERE id = :id");
    $stmt->execute([':id' => $jobId]);
    $job = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$job) throw new RuntimeException('Import job not found');
    $job['mapping'] = json_decode($job['mapping_json'] ?? '{}', true) ?: [];
    $job['progress_percent'] = (int)$job['total'] > 0 ? round(((int)$job['processed'] / (int)$job['total']) * 100, 2) : 0;
    $job['updated'] = (int)($job['updated'] ?? 0); // column may not exist in old schema
    unset($job['mapping_json']);
    return $job;
}

function ci_list_jobs(PDO $db, int $limit = 50): array {
    ci_ensure_schema($db);
    $stmt = $db->prepare("SELECT id, batch_id, filename, status, total, processed,
        imported, COALESCE(updated, 0) AS updated, skipped, failed,
        started_at, finished_at, created_at
        FROM customer_import_jobs ORDER BY created_at DESC LIMIT :lim");
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/** Most recent job that never reached a terminal state — used to offer "Resume" on page load. */
function ci_find_resumable_job(PDO $db): ?array {
    ci_ensure_schema($db);
    $stmt = $db->query("SELECT id FROM customer_import_jobs WHERE status IN ('pending','running') ORDER BY created_at DESC LIMIT 1");
    $id = $stmt->fetchColumn();
    return $id ? ci_get_job($db, (int)$id) : null;
}

function ci_get_logs(PDO $db, int $jobId, int $limit = 300): array {
    ci_ensure_schema($db);
    $stmt = $db->prepare("SELECT level, message, created_at FROM customer_import_logs WHERE job_id = :j ORDER BY id DESC LIMIT :lim");
    $stmt->bindValue(':j', $jobId, PDO::PARAM_INT);
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

/**
 * Parses a variety of date formats importers actually produce
 * ("2024-01-15", "01/15/2024", "15-01-2024 10:30:00", WooCommerce's
 * ISO-ish export format, ...) into Y-m-d, or null if unparseable. Never
 * throws — a bad date should not fail the whole row.
 */
function ci_parse_date(string $value): ?string {
    $value = trim($value);
    if ($value === '') return null;
    try {
        $dt = new DateTime($value);
        $year = (int)$dt->format('Y');
        if ($year < 1990 || $year > (int)date('Y') + 1) return null; // sanity bound
        return $dt->format('Y-m-d');
    } catch (\Throwable $e) {
        return null;
    }
}

/**
 * Sanitise a customer_role value from a WP export.
 * WP exports the role as a plain string ("customer", "subscriber",
 * "administrator", etc.) — we store as-is, defaulting to "customer".
 * We cap it at 50 chars to fit the column.
 */
function ci_sanitise_role(string $value): string {
    $value = strtolower(trim($value));
    // Common WP serialised role format: a:1:{s:8:"customer";b:1;}
    // Unwrap it to the plain role name if present.
    if (str_starts_with($value, 'a:')) {
        if (preg_match('/s:\d+:"([^"]+)"/', $value, $m)) {
            $value = $m[1];
        }
    }
    if ($value === '') return 'customer';
    return substr($value, 0, 50);
}

/**
 * Imports one already-mapped row. Returns 'imported' | 'skipped'.
 * Throws on hard validation failure (caught by the caller, recorded as
 * 'failed'). The customer insert and its ledger row happen in one
 * transaction so a crash between them can never leave one without the other.
 *
 * PASSWORD POLICY (requirement #5):
 *   - WordPress password hashes are never in the mapped row (user_pass is
 *     not in ci_fields() so ci_map_row() drops it completely).
 *   - password column is set to NULL.
 *   - password_reset_required = 1 forces the customer to use Forgot
 *     Password to create a new password before they can log in.
 */
function ci_import_row(PDO $db, int $jobId, string $batchId, int $rowNumber, array $row, array $existingEmails): string {
    $email = trim($row['email'] ?? '');
    $err = ci_validate_email($email);
    if ($err) throw new RuntimeException($err);

    $emailLower = strtolower($email);
    if (isset($existingEmails[$emailLower])) {
        ci_record_item($db, $jobId, $batchId, $rowNumber, null, $email, 'skipped', 'Duplicate email', $row);
        return 'skipped';
    }

    $first = trim($row['first_name'] ?? '');
    $last  = trim($row['last_name'] ?? '');
    $name  = trim($first . ' ' . $last);
    if ($name === '') {
        // Fallback: use display_name if we have it, otherwise email prefix
        $name = trim($row['display_name'] ?? '') ?: explode('@', $email)[0];
    }

    $data = [
        ':username'              => trim($row['username'] ?? '') ?: null,
        ':display_name'          => trim($row['display_name'] ?? '') ?: null,
        ':name'                  => $name,
        ':first_name'            => $first ?: null,
        ':last_name'             => $last ?: null,
        ':email'                 => $email,
        ':phone'                 => trim($row['phone'] ?? '') ?: '',
        ':company'               => trim($row['company'] ?? '') ?: null,
        ':billing_address'       => trim($row['billing_address'] ?? '') ?: null,
        ':billing_city'          => trim($row['billing_city'] ?? '') ?: null,
        ':billing_state'         => trim($row['billing_state'] ?? '') ?: null,
        ':billing_country'       => trim($row['billing_country'] ?? '') ?: null,
        ':billing_postal_code'   => trim($row['billing_postal_code'] ?? '') ?: null,
        ':shipping_address'      => trim($row['shipping_address'] ?? '') ?: null,
        ':shipping_city'         => trim($row['shipping_city'] ?? '') ?: null,
        ':shipping_state'        => trim($row['shipping_state'] ?? '') ?: null,
        ':shipping_country'      => trim($row['shipping_country'] ?? '') ?: null,
        ':shipping_postal_code'  => trim($row['shipping_postal_code'] ?? '') ?: null,
        ':customer_role'         => ci_sanitise_role($row['customer_role'] ?? ''),
        ':account_created_at'    => ci_parse_date($row['account_created_at'] ?? ''),
        ':external_customer_id'  => trim($row['external_customer_id'] ?? '') ?: null,
        ':import_job_id'         => $jobId,
    ];

    $db->beginTransaction();
    try {
        $db->prepare("INSERT INTO customers
            (username, display_name, name, first_name, last_name,
             email, phone, company,
             billing_address, billing_city, billing_state, billing_country, billing_postal_code,
             shipping_address, shipping_city, shipping_state, shipping_country, shipping_postal_code,
             customer_role, account_created_at, external_customer_id,
             source, is_active, password, password_reset_required, import_job_id)
            VALUES
            (:username, :display_name, :name, :first_name, :last_name,
             :email, :phone, :company,
             :billing_address, :billing_city, :billing_state, :billing_country, :billing_postal_code,
             :shipping_address, :shipping_city, :shipping_state, :shipping_country, :shipping_postal_code,
             :customer_role, :account_created_at, :external_customer_id,
             'csv_import', 1, NULL, 1, :import_job_id)"
        )->execute($data);
        $customerId = (int)$db->lastInsertId();

        ci_record_item($db, $jobId, $batchId, $rowNumber, $customerId, $email, 'imported', null, $row);
        $db->commit();
        return 'imported';
    } catch (\Throwable $e) {
        $db->rollBack();
        // A duplicate-key race (two rows in this file sharing an email,
        // both absent from the pre-check because neither existed yet at
        // check time) lands here as a DB constraint violation — that's a
        // skip, not a data-quality failure.
        if (str_contains($e->getMessage(), 'Duplicate entry')) {
            ci_record_item($db, $jobId, $batchId, $rowNumber, null, $email, 'skipped', 'Duplicate email (within file)', $row);
            return 'skipped';
        }
        throw $e;
    }
}

function ci_record_item(PDO $db, int $jobId, string $batchId, int $rowNumber, ?int $customerId, string $email, string $action, ?string $error, array $row): void {
    $stmt = $db->prepare("INSERT INTO customer_import_items
        (job_id, batch_id, `row_number`, customer_id, email, `action`, error, row_data_json)
        VALUES (:j,:b,:r,:c,:e,:a,:err,:row)");
    $stmt->execute([
        ':j' => $jobId, ':b' => $batchId, ':r' => $rowNumber, ':c' => $customerId,
        ':e' => $email ?: null, ':a' => $action, ':err' => $error,
        ':row' => json_encode($row, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    ]);
}

/**
 * Processes up to $limit rows starting from wherever this job's
 * `processed` counter left off. Safe to call repeatedly — including after
 * an interruption — because all state (offset, per-row outcomes) lives in
 * the DB, not in PHP memory or a session. That is the entire resume
 * mechanism: the client just keeps calling this until status=completed.
 *
 * Batch size is 100 (requirement #8) — matches the constant in the admin UI.
 */
function ci_process_job(PDO $db, int $jobId, int $limit = 100): array {
    $job = ci_get_job($db, $jobId);
    if (in_array($job['status'], ['completed', 'failed', 'rolled_back'], true)) return $job;

    $rows = ci_read_payload($job['payload_file'] ?? '');
    $offset = (int)$job['processed'];
    $chunk = array_slice($rows, $offset, max(1, min($limit, 500)));

    if ($job['status'] === 'pending') {
        $db->prepare("UPDATE customer_import_jobs SET status='running', started_at=COALESCE(started_at, NOW()) WHERE id=:id")->execute([':id' => $jobId]);
        ci_log($db, $jobId, $job['batch_id'], 'info', 'Import processing started');
    }

    // Batch existence pre-check for this chunk only — keeps duplicate
    // detection to one query per chunk instead of one per row, which is
    // what actually makes this scale to 100k+ rows.
    $chunkEmails = array_values(array_unique(array_filter(array_map(
        fn($r) => strtolower(trim($r['email'] ?? '')), $chunk
    ))));
    $existing = [];
    if ($chunkEmails) {
        $placeholders = implode(',', array_fill(0, count($chunkEmails), '?'));
        $stmt = $db->prepare("SELECT LOWER(email) AS e FROM customers WHERE LOWER(email) IN ($placeholders)");
        $stmt->execute($chunkEmails);
        foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $e) $existing[$e] = true;
    }

    $stats = ['processed' => 0, 'imported' => 0, 'updated' => 0, 'skipped' => 0, 'failed' => 0];
    $startTime = time();
    foreach ($chunk as $i => $row) {
        // Hard timeout guard — leaves headroom under typical 180-300s shared-hosting limits.
        if ((time() - $startTime) >= 150) {
            ci_log($db, $jobId, $job['batch_id'], 'warning', 'Time limit approaching — stopping batch early at row ' . ($offset + $i + 1));
            break;
        }
        $rowNumber = $offset + $i + 2; // +1 zero-index, +1 header row
        try {
            $action = ci_import_row($db, $jobId, $job['batch_id'], $rowNumber, $row, $existing);
            $stats[$action]++;
            if ($action === 'imported') {
                // Mark it existing for the rest of THIS chunk too, so a
                // later duplicate within the same chunk is caught by the
                // fast path rather than falling through to the DB
                // constraint-violation branch.
                $existing[strtolower(trim($row['email'] ?? ''))] = true;
            }
        } catch (\Throwable $e) {
            $stats['failed']++;
            ci_record_item($db, $jobId, $job['batch_id'], $rowNumber, null, (string)($row['email'] ?? ''), 'failed', $e->getMessage(), $row);
            ci_log($db, $jobId, $job['batch_id'], 'error', "Row $rowNumber failed: " . $e->getMessage());
        }
        $stats['processed']++;
    }

    $done = ($offset + $stats['processed']) >= count($rows);
    $status = $done ? 'completed' : 'running';
    $finish = $done ? ', finished_at=NOW()' : '';
    $stmt = $db->prepare("UPDATE customer_import_jobs SET
        status=:status, processed=processed+:processed,
        imported=imported+:imported,
        updated=COALESCE(updated,0)+:updated,
        skipped=skipped+:skipped, failed=failed+:failed
        $finish WHERE id=:id");
    $stmt->execute([
        ':status' => $status, ':processed' => $stats['processed'],
        ':imported' => $stats['imported'], ':updated' => $stats['updated'],
        ':skipped' => $stats['skipped'], ':failed' => $stats['failed'], ':id' => $jobId,
    ]);
    if ($done) {
        $j = ci_get_job($db, $jobId);
        ci_log($db, $jobId, $job['batch_id'], 'success',
            sprintf('Import completed. Imported: %d | Skipped: %d | Failed: %d',
                $j['imported'], $j['skipped'], $j['failed']));
    }

    return ci_get_job($db, $jobId);
}

function ci_rollback_job(PDO $db, int $jobId): array {
    $job = ci_get_job($db, $jobId);
    if ($job['status'] === 'rolled_back') return $job;

    $stmt = $db->prepare("SELECT DISTINCT customer_id FROM customer_import_items WHERE job_id=:j AND `action`='imported' AND customer_id IS NOT NULL");
    $stmt->execute([':j' => $jobId]);
    $ids = array_map('intval', array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'customer_id'));

    // Only remove customers that are still exactly as this job left them —
    // if they've since placed a real order (customer_id referenced by
    // orders), don't delete a live customer record out from under it.
    $removed = 0;
    $orderCheck = $db->prepare("SELECT COUNT(*) FROM orders WHERE customer_id = :cid");
    $delete = $db->prepare("DELETE FROM customers WHERE id = :id AND import_job_id = :job");
    foreach ($ids as $cid) {
        $orderCheck->execute([':cid' => $cid]);
        if ((int)$orderCheck->fetchColumn() > 0) continue;
        $delete->execute([':id' => $cid, ':job' => $jobId]);
        $removed++;
    }

    $db->prepare("UPDATE customer_import_jobs SET status='rolled_back', finished_at=NOW() WHERE id=:id")->execute([':id' => $jobId]);
    ci_log($db, $jobId, $job['batch_id'], 'warning', "Rollback completed. Customers removed: $removed" . (count($ids) - $removed > 0 ? ' (' . (count($ids) - $removed) . ' kept — already have orders)' : ''));
    return ci_get_job($db, $jobId);
}

/**
 * Streams failed_rows.csv — original required-field columns plus why each
 * row failed, so it's directly fixable and re-uploadable.
 */
function ci_stream_failed_csv(PDO $db, int $jobId): void {
    $job = ci_get_job($db, $jobId);
    $stmt = $db->prepare("SELECT `row_number`, error, row_data_json FROM customer_import_items WHERE job_id=:j AND `action`='failed' ORDER BY `row_number` ASC");
    $stmt->execute([':j' => $jobId]);

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="failed_rows_' . $job['batch_id'] . '.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, array_merge(['Row', 'Error'], array_values(ci_fields())), ',', '"', '\\');
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row = json_decode($r['row_data_json'] ?? '{}', true) ?: [];
        $line = [$r['row_number'], $r['error']];
        foreach (array_keys(ci_fields()) as $field) $line[] = $row[$field] ?? '';
        fputcsv($out, $line, ',', '"', '\\');
    }
    fclose($out);
    exit;
}

/**
 * Streams a full job report (every row, every outcome) — the audit trail.
 */
function ci_stream_report_csv(PDO $db, int $jobId): void {
    $job = ci_get_job($db, $jobId);
    $stmt = $db->prepare("SELECT `row_number`, email, customer_id, `action`, error, created_at FROM customer_import_items WHERE job_id=:j ORDER BY `row_number` ASC");
    $stmt->execute([':j' => $jobId]);

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="import_log_' . $job['batch_id'] . '.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['Row', 'Email', 'Customer ID', 'Action', 'Error', 'Processed At'], ',', '"', '\\');
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($out, [$r['row_number'], $r['email'], $r['customer_id'], $r['action'], $r['error'], $r['created_at']], ',', '"', '\\');
    }
    fclose($out);
    exit;
}
