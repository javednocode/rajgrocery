<?php
/**
 * Customer Import API — routes mounted from backend/index.php under
 * /api/customer-import. Mirrors api/product_migration.php's structure.
 *
 * Flow: preview (parse + auto-map, no DB writes) -> validate (dry run
 * against the chosen mapping, no DB writes) -> jobs (create) -> jobs/{id}/
 * process (chunked, call repeatedly — this is also how a browser refresh
 * or a dead connection gets resumed, since all progress lives in the DB).
 */

// Same defensive buffering as api/import.php: index.php already opened an
// outer buffer (for gzip), but a stray PHP notice/warning from anywhere in
// this request — a library, a deprecation on a future PHP bump, whatever —
// still lands in that buffer ahead of our JSON and corrupts it for every
// caller. This inner buffer lets each JSON-emitting handler discard
// exactly that before writing its response, without touching the outer one.
ob_start();

requireAuth();
require_once __DIR__ . '/../helpers/customer_import_queue.php';

function customerImportHandle(PDO $db, string $method, string $uri): void {
    ci_ensure_schema($db);
    // Discard whatever bootstrap-stage noise (requires, schema creation)
    // landed in our buffer before it ever reaches a JSON response.
    if (ob_get_level()) ob_clean();

    if ($method === 'POST' && preg_match('#^/api/customer-import/preview/?$#', $uri)) {
        customerImportPreview(); return;
    }
    if ($method === 'POST' && preg_match('#^/api/customer-import/validate/?$#', $uri)) {
        customerImportValidate($db); return;
    }
    if ($method === 'POST' && preg_match('#^/api/customer-import/jobs/?$#', $uri)) {
        customerImportCreateJob($db); return;
    }
    if ($method === 'GET' && preg_match('#^/api/customer-import/jobs/?$#', $uri)) {
        successResponse(ci_list_jobs($db, 80)); return;
    }
    if ($method === 'GET' && preg_match('#^/api/customer-import/resumable/?$#', $uri)) {
        successResponse(ci_find_resumable_job($db)); return;
    }
    if ($method === 'GET' && preg_match('#^/api/customer-import/jobs/(\d+)/?$#', $uri, $m)) {
        successResponse(ci_get_job($db, (int)$m[1])); return;
    }
    if ($method === 'POST' && preg_match('#^/api/customer-import/jobs/(\d+)/process/?$#', $uri, $m)) {
        $body = customerImportInput();
        successResponse(ci_process_job($db, (int)$m[1], (int)($body['limit'] ?? 200))); return;
    }
    if ($method === 'GET' && preg_match('#^/api/customer-import/jobs/(\d+)/logs/?$#', $uri, $m)) {
        successResponse(ci_get_logs($db, (int)$m[1], (int)($_GET['limit'] ?? 300))); return;
    }
    if ($method === 'POST' && preg_match('#^/api/customer-import/jobs/(\d+)/rollback/?$#', $uri, $m)) {
        successResponse(ci_rollback_job($db, (int)$m[1])); return;
    }
    if ($method === 'GET' && preg_match('#^/api/customer-import/jobs/(\d+)/failed-csv/?$#', $uri, $m)) {
        ci_stream_failed_csv($db, (int)$m[1]); return;
    }
    if ($method === 'GET' && preg_match('#^/api/customer-import/jobs/(\d+)/report-csv/?$#', $uri, $m)) {
        ci_stream_report_csv($db, (int)$m[1]); return;
    }

    errorResponse('Unknown customer import route', 404);
}

function customerImportInput(): array {
    if (!empty($_POST)) return $_POST;
    $json = json_decode(file_get_contents('php://input'), true);
    return is_array($json) ? $json : [];
}

/**
 * Resolves a file_token back to a real path, constrained to the imports
 * directory — the token is opaque to the client but this still guards
 * against a malformed/tampered token pointing outside uploads/imports.
 */
function customerImportResolveToken(string $token): string {
    $path = base64_decode($token, true);
    if ($path === false || $path === '') errorResponse('Invalid file token', 400);
    $importsDir = realpath(ci_payload_dir());
    $real = realpath($path);
    if (!$real || !$importsDir || !str_starts_with($real, $importsDir)) {
        errorResponse('Import file not found — please re-upload', 400);
    }
    return $real;
}

function customerImportUploadFile(): array {
    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        errorResponse('No file uploaded or upload error', 400);
    }
    $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['csv', 'xlsx', 'xls'], true)) errorResponse('Only CSV and XLSX files are supported', 415);

    $dir = ci_payload_dir();
    $dest = $dir . uniqid('custsrc_') . '.' . $ext;
    if (!move_uploaded_file($_FILES['file']['tmp_name'], $dest)) errorResponse('Failed to save uploaded file', 500);

    return ['path' => $dest, 'ext' => $ext, 'name' => $_FILES['file']['name']];
}

// ═══════════════════════════════════════════════════════════════════════
// PREVIEW — parse, auto-map, return first 20 mapped rows. No DB writes.
// ═══════════════════════════════════════════════════════════════════════
function customerImportPreview(): void {
    $file = customerImportUploadFile();
    $rows = ci_parse_file($file['path'], $file['ext']);
    if (!$rows) errorResponse('Could not parse file — check the format', 422);

    $indexed = ci_index_rows($rows);
    if (!$indexed['rows']) errorResponse('File has no data rows', 422);

    $mapping = ci_auto_mapping($indexed['headers']);
    $rawPreview = array_slice($indexed['rows'], 0, 20);
    $preview = array_map(fn($raw) => ci_map_row($raw, $mapping), $rawPreview);

    successResponse([
        'file_token'        => base64_encode($file['path']),
        'file_ext'          => $file['ext'],
        'filename'          => $file['name'],
        'headers'           => $indexed['headers'],
        'fields'            => ci_fields(),
        'suggested_mapping' => $mapping,
        'preview'           => $preview,
        // Un-mapped rows keyed by header, so the admin UI can re-map the
        // preview instantly in JS whenever a mapping dropdown changes,
        // without a round-trip for every tweak.
        'raw_preview'       => $rawPreview,
        'total_rows'        => count($indexed['rows']),
    ], 'File parsed');
}

// ═══════════════════════════════════════════════════════════════════════
// VALIDATE — re-parse with the (possibly admin-edited) mapping, check
// every row against required-field + duplicate rules. No DB writes.
// ═══════════════════════════════════════════════════════════════════════
function customerImportValidate(PDO $db): void {
    $data = customerImportInput();
    $path = customerImportResolveToken((string)($data['file_token'] ?? ''));
    $ext  = (string)($data['file_ext'] ?? 'csv');
    $mapping = is_string($data['mapping'] ?? null) ? json_decode($data['mapping'], true) : ($data['mapping'] ?? []);
    if (!is_array($mapping) || !$mapping) errorResponse('A field mapping is required', 400);

    $rows = ci_parse_file($path, $ext);
    if (!$rows) errorResponse('Could not parse file', 422);
    $indexed = ci_index_rows($rows);

    $mappedRows = array_map(fn($r) => ci_map_row($r, $mapping), $indexed['rows']);
    $result = ci_validate_rows($db, $mappedRows);

    // Cap the per-row detail sent back — the summary counts are exact,
    // but 100k row-by-row objects would bloat the response for no benefit.
    $result['rows'] = array_slice(array_filter($result['rows'], fn($r) => $r['status'] !== 'valid'), 0, 500);

    successResponse($result, 'Validation complete');
}

// ═══════════════════════════════════════════════════════════════════════
// CREATE JOB — re-parse + map the full file, stash it, create the job row.
// ═══════════════════════════════════════════════════════════════════════
function customerImportCreateJob(PDO $db): void {
    $data = customerImportInput();
    $path = customerImportResolveToken((string)($data['file_token'] ?? ''));
    $ext  = (string)($data['file_ext'] ?? 'csv');
    $filename = (string)($data['filename'] ?? basename($path));
    $mapping = is_string($data['mapping'] ?? null) ? json_decode($data['mapping'], true) : ($data['mapping'] ?? []);
    if (!is_array($mapping) || !$mapping) errorResponse('A field mapping is required', 400);
    if (empty($mapping['email'])) errorResponse('Email must be mapped to a column', 400);

    $rows = ci_parse_file($path, $ext);
    if (!$rows) errorResponse('Could not parse file', 422);
    $indexed = ci_index_rows($rows);
    // Only drop rows that are entirely blank (a trailing newline in the
    // source file, etc.) — NOT rows that have data but happen to be
    // missing email. Those need to flow through processing so they get a
    // real ledger entry and show up in failed_rows.csv with a reason,
    // rather than silently vanishing before total_rows is even counted.
    $mappedRows = array_values(array_filter(
        array_map(fn($r) => ci_map_row($r, $mapping), $indexed['rows']),
        fn($r) => implode('', $r) !== ''
    ));
    if (!$mappedRows) errorResponse('The file has no data rows', 422);

    $job = ci_create_job($db, $filename, $mapping, $mappedRows);

    // The source upload is copied into the job's own payload file — clean
    // up the temporary upload now rather than leaving it in uploads/imports/.
    @unlink($path);

    successResponse($job, 'Import job created', 201);
}
