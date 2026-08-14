<?php
/**
 * Backup & Restore API
 *
 * POST   /api/backup/create          — create DB backup (admin)
 * GET    /api/backup/list            — list available backups (admin)
 * GET    /api/backup/download/{file} — download backup file (admin)
 * POST   /api/backup/restore         — restore from backup file (admin)
 * DELETE /api/backup/{file}          — delete backup file (admin)
 * GET    /api/backup/status          — backup configuration status
 */

define('BACKUP_DIR', __DIR__ . '/../backups/');

// ─── Create Backup ────────────────────────────────────────────────────────────

function createBackup(): void {
    requireAuth();

    // Prevent any stray output from corrupting the JSON response
    while (ob_get_level()) ob_end_clean();

    // Give plenty of time for large DBs
    @set_time_limit(300);
    @ini_set('memory_limit', '256M');

    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $data   = getJsonInput();
    $type   = $data['type'] ?? 'full'; // full | database | files

    if (!@mkdir(BACKUP_DIR, 0750, true) && !is_dir(BACKUP_DIR)) {
        errorResponse('Cannot create backup directory. Check server permissions.', 500);
    }

    if (!is_writable(BACKUP_DIR)) {
        errorResponse('Backup directory is not writable. Check folder permissions.', 500);
    }

    // Load DB credentials using same logic as Database class
    $isLocal = (
        php_sapi_name() === 'cli-server' ||
        ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' ||
        ($_SERVER['SERVER_ADDR'] ?? '') === '127.0.0.1' ||
        strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false
    );
    if ($isLocal && !getenv('DB_NAME')) {
        $dbHost = 'localhost';
        $dbName = 'reuse_ecom_db';
        $dbUser = 'root';
        $dbPass = '';
    } else {
        $dbHost = getenv('DB_HOST') ?: 'localhost';
        $dbName = getenv('DB_NAME') ?: 'u298651808_webcraftstechb';
        $dbUser = getenv('DB_USER') ?: 'u298651808_webcraftstechb';
        $dbPass = getenv('DB_PASS') ?: 'Jj@9610022011..';
    }

    if (empty($dbName)) errorResponse('Database configuration not found', 500);

    $timestamp = date('Y-m-d_H-i-s');
    $prefix    = "backup_site{$siteId}_{$type}_{$timestamp}";
    $results   = [];

    // ── Database backup (PHP-based — reliable on shared hosting) ─────────────
    if (in_array($type, ['full', 'database'])) {
        $phpBackup = _phpDatabaseBackup($dbHost, $dbUser, $dbPass, $dbName, $siteId);
        if ($phpBackup) {
            $sqlFile = BACKUP_DIR . $prefix . '_php.sql';
            if (file_put_contents($sqlFile, $phpBackup) === false) {
                errorResponse('Failed to write backup file. Disk may be full or directory not writable.', 500);
            }
            $results['database'] = [
                'file'   => basename($sqlFile),
                'size'   => filesize($sqlFile),
                'method' => 'php',
            ];
        } else {
            errorResponse('Database backup failed. Could not connect to database or read tables.', 500);
        }
    }

    // ── Files backup ─────────────────────────────────────────────────────────
    if (in_array($type, ['full', 'files'])) {
        $uploadsDir = __DIR__ . '/../uploads/';
        if (is_dir($uploadsDir)) {
            $zipFile = BACKUP_DIR . $prefix . '_uploads.zip';
            $zip     = new ZipArchive();
            if ($zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
                $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($uploadsDir,
                    RecursiveDirectoryIterator::SKIP_DOTS));
                foreach ($files as $file) {
                    if (!$file->isDir()) {
                        $relative = ltrim(str_replace($uploadsDir, '', $file->getPathname()), '/\\');
                        $zip->addFile($file->getPathname(), 'uploads/' . $relative);
                    }
                }
                $zip->close();
                $results['files'] = ['file' => basename($zipFile), 'size' => filesize($zipFile)];
            } else {
                $results['files'] = ['error' => 'ZipArchive failed to open file'];
            }
        } else {
            $results['files'] = ['error' => 'uploads/ directory not found'];
        }
    }

    // ── Log backup ───────────────────────────────────────────────────────────
    _logBackup($siteId, $type, $results);

    successResponse([
        'type'    => $type,
        'created' => date('c'),
        'files'   => $results,
    ], 'Backup created successfully', 201);
}

/**
 * PHP-based DB backup (fallback when mysqldump not available).
 * Generates INSERT statements for all tables.
 */
function _phpDatabaseBackup(string $host, string $user, string $pass, string $dbName, int $siteId): ?string {
    try {
        $pdo = new PDO("mysql:host={$host};dbname={$dbName};charset=utf8mb4", $user, $pass,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

        $sql  = "-- PHP Backup — Generated: " . date('c') . "\n";
        $sql .= "-- Site ID: $siteId | DB: $dbName\n";
        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

        // Site-scoped tables first, then system tables
        foreach ($tables as $table) {
            $createSql = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_NUM);
            $sql .= "\n-- Table: `$table`\n";
            $sql .= "DROP TABLE IF EXISTS `$table`;\n";
            $sql .= $createSql[1] . ";\n\n";

            // Check if table has site_id column — only export this site's data
            $cols = $pdo->query("SHOW COLUMNS FROM `$table`")->fetchAll(PDO::FETCH_COLUMN);
            $hasSiteId = in_array('site_id', $cols);

            $query = $hasSiteId
                ? "SELECT * FROM `$table` WHERE site_id = $siteId"
                : "SELECT * FROM `$table`";

            $rows = $pdo->query($query)->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($rows)) {
                $columns = '`' . implode('`, `', array_keys($rows[0])) . '`';
                $sql .= "INSERT INTO `$table` ($columns) VALUES\n";
                $values = [];
                foreach ($rows as $row) {
                    $vals = array_map(fn($v) => $v === null ? 'NULL' : $pdo->quote((string)$v), $row);
                    $values[] = '(' . implode(', ', $vals) . ')';
                }
                $sql .= implode(",\n", $values) . ";\n";
            }
        }

        $sql .= "\nSET FOREIGN_KEY_CHECKS=1;\n";
        return $sql;
    } catch (\Throwable $e) {
        error_log('PHP backup error: ' . $e->getMessage());
        return null;
    }
}

// ─── List Backups ────────────────────────────────────────────────────────────

function listBackups(): void {
    requireAuth();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    @mkdir(BACKUP_DIR, 0750, true);
    $pattern = BACKUP_DIR . "backup_site{$siteId}_*";
    $files   = glob($pattern) ?: [];

    rsort($files); // newest first

    $backups = array_map(fn($f) => [
        'filename'  => basename($f),
        'size_bytes'=> filesize($f),
        'size_human'=> _humanSize(filesize($f)),
        'created_at'=> date('c', filemtime($f)),
        'type'      => str_contains($f, '_database_') ? 'database'
                     : (str_contains($f, '_files_') ? 'files' : 'full'),
    ], $files);

    successResponse($backups);
}

// ─── Download Backup ─────────────────────────────────────────────────────────

function downloadBackup(string $filename): void {
    requireAuth();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    // Security: only allow site-scoped backup files
    $filename   = basename($filename); // prevent path traversal
    $targetFile = BACKUP_DIR . $filename;

    if (!str_starts_with($filename, "backup_site{$siteId}_")) {
        errorResponse('Access denied', 403);
    }
    if (!is_file($targetFile)) errorResponse('Backup file not found', 404);

    $mime = str_ends_with($filename, '.gz') ? 'application/gzip' : 'application/zip';
    if (str_ends_with($filename, '.sql')) $mime = 'application/sql';

    header("Content-Type: $mime");
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($targetFile));
    header('Cache-Control: no-cache');
    readfile($targetFile);
    exit;
}

// ─── Restore ─────────────────────────────────────────────────────────────────

function restoreBackup(): void {
    requireAuth();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $data   = getJsonInput();
    $filename = basename($data['filename'] ?? '');

    if (!$filename || !str_starts_with($filename, "backup_site{$siteId}_")) {
        errorResponse('Invalid backup file', 400);
    }

    $targetFile = BACKUP_DIR . $filename;
    if (!is_file($targetFile)) errorResponse('Backup file not found', 404);

    $isLocalR = (
        php_sapi_name() === 'cli-server' ||
        ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' ||
        ($_SERVER['SERVER_ADDR'] ?? '') === '127.0.0.1' ||
        strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false
    );
    if ($isLocalR && !getenv('DB_NAME')) {
        $dbHost = 'localhost'; $dbName = 'reuse_ecom_db'; $dbUser = 'root'; $dbPass = '';
    } else {
        $dbHost = getenv('DB_HOST') ?: 'localhost';
        $dbName = getenv('DB_NAME') ?: 'u298651808_webcraftstechb';
        $dbUser = getenv('DB_USER') ?: 'u298651808_webcraftstechb';
        $dbPass = getenv('DB_PASS') ?: 'Jj@9610022011..';
    }

    if (str_ends_with($filename, '.sql.gz')) {
        $passArg = $dbPass ? '-p' . escapeshellarg($dbPass) : '';
        $cmd = sprintf('zcat %s | mysql --host=%s --user=%s %s %s 2>&1',
            escapeshellarg($targetFile),
            escapeshellarg($dbHost),
            escapeshellarg($dbUser),
            $passArg,
            escapeshellarg($dbName)
        );
        exec($cmd, $output, $exitCode);

        if ($exitCode !== 0) {
            errorResponse('Restore failed: ' . implode(' ', $output), 500);
        }
    } elseif (str_ends_with($filename, '.sql')) {
        // PHP-based restore
        try {
            $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $sql = file_get_contents($targetFile);
            $pdo->exec($sql);
        } catch (\Throwable $e) {
            errorResponse('Restore failed: ' . $e->getMessage(), 500);
        }
    } else {
        errorResponse('Only .sql or .sql.gz backups can be restored via API', 400);
    }

    // Invalidate all caches
    if (function_exists('cacheClearAll')) cacheClearAll();

    successResponse(null, 'Database restored successfully from ' . $filename);
}

// ─── Delete Backup ────────────────────────────────────────────────────────────

function deleteBackup(string $filename): void {
    requireAuth();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $filename   = basename($filename);
    $targetFile = BACKUP_DIR . $filename;

    if (!str_starts_with($filename, "backup_site{$siteId}_")) errorResponse('Access denied', 403);
    if (!is_file($targetFile)) errorResponse('File not found', 404);

    @unlink($targetFile);
    successResponse(null, 'Backup deleted');
}

// ─── Status ──────────────────────────────────────────────────────────────────

function backupStatus(): void {
    requireAuth();
    $siteId    = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $mysqldump = trim(shell_exec('which mysqldump 2>/dev/null') ?: '');

    @mkdir(BACKUP_DIR, 0750, true);
    $writable = is_writable(BACKUP_DIR);
    $files    = glob(BACKUP_DIR . "backup_site{$siteId}_*") ?: [];
    rsort($files);

    successResponse([
        'mysqldump_available' => !empty($mysqldump),
        'mysqldump_path'      => $mysqldump ?: null,
        'zip_available'       => class_exists('ZipArchive'),
        'backup_dir'          => BACKUP_DIR,
        'backup_dir_writable' => $writable,
        'backup_count'        => count($files),
        'latest_backup'       => $files ? ['file' => basename($files[0]), 'created_at' => date('c', filemtime($files[0]))] : null,
        'disk_used_bytes'     => array_sum(array_map('filesize', $files)),
        'disk_used_human'     => _humanSize(array_sum(array_map('filesize', $files))),
    ]);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _humanSize(int $bytes): string {
    if ($bytes > 1073741824) return round($bytes / 1073741824, 2) . ' GB';
    if ($bytes > 1048576)    return round($bytes / 1048576, 2) . ' MB';
    if ($bytes > 1024)       return round($bytes / 1024, 2) . ' KB';
    return $bytes . ' B';
}

function _logBackup(int $siteId, string $type, array $files): void {
    $logFile = BACKUP_DIR . "backup_log_site{$siteId}.json";
    $log     = [];
    if (is_file($logFile)) {
        $log = json_decode(file_get_contents($logFile), true) ?: [];
    }
    array_unshift($log, ['type' => $type, 'files' => $files, 'created_at' => date('c')]);
    $log = array_slice($log, 0, 50); // Keep last 50 entries
    file_put_contents($logFile, json_encode($log, JSON_PRETTY_PRINT));
}
