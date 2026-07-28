<?php
/**
 * Job Queue — file-based with Redis-ready interface.
 * Drop-in: swap to Redis/Beanstalkd by replacing dispatch() and processQueue().
 *
 * Jobs are stored as JSON files in a queue directory.
 * The /api/email/process cron can also call processQueue() for background work.
 */

define('ECOMMERCE_QUEUE_DIR', sys_get_temp_dir() . '/ecommerce_queue/');

/**
 * Available job handlers — register your jobs here.
 * Each handler must be a callable: function(array $data): void
 */
function getJobHandlers(): array {
    return [
        'send_order_email'    => 'handleSendOrderEmail',
        'send_low_stock_alert'=> 'handleLowStockAlert',
        'generate_invoice'    => 'handleGenerateInvoice',
        'update_inventory'    => 'handleUpdateInventory',
        'export_products'     => 'handleExportProducts',
        'sitemap_invalidate'  => 'handleSitemapInvalidate',
        'webhook_dispatch'    => 'handleWebhookDispatch',
    ];
}

/**
 * Dispatch a job to the queue.
 *
 * @param string $job   Job type key (must be in getJobHandlers())
 * @param array  $data  Job payload
 * @param int    $delay Delay in seconds before job is eligible (0 = immediate)
 */
function dispatch(string $job, array $data = [], int $delay = 0): bool {
    $dir = ECOMMERCE_QUEUE_DIR;
    if (!is_dir($dir)) @mkdir($dir, 0750, true);

    $siteId  = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $payload = [
        'id'           => uniqid('job_', true),
        'job'          => $job,
        'data'         => $data,
        'site_id'      => $siteId,
        'status'       => 'pending',
        'attempts'     => 0,
        'max_attempts' => 3,
        'available_at' => time() + $delay,
        'created_at'   => time(),
    ];

    $filename = $dir . $payload['id'] . '.json';
    return @file_put_contents($filename, json_encode($payload, JSON_UNESCAPED_UNICODE), LOCK_EX) !== false;
}

/**
 * Process pending queue jobs.
 * Designed to be called from a cron job or /api/queue/process endpoint.
 *
 * @param int $maxJobs  Max jobs to process per call (default 20)
 * @return array        Summary of processed/failed jobs
 */
function processQueue(int $maxJobs = 20): array {
    $dir = ECOMMERCE_QUEUE_DIR;
    if (!is_dir($dir)) return ['processed' => 0, 'failed' => 0, 'skipped' => 0];

    $files = glob($dir . 'job_*.json') ?: [];
    $now   = time();
    $handlers = getJobHandlers();
    $stats = ['processed' => 0, 'failed' => 0, 'skipped' => 0];
    $count = 0;

    foreach ($files as $file) {
        if ($count >= $maxJobs) break;

        $raw = @file_get_contents($file);
        if (!$raw) { @unlink($file); continue; }

        $job = json_decode($raw, true);
        if (!$job) { @unlink($file); continue; }

        // Skip jobs not yet available
        if (($job['available_at'] ?? 0) > $now) { $stats['skipped']++; continue; }

        // Skip failed jobs that have exceeded max attempts
        if (($job['attempts'] ?? 0) >= ($job['max_attempts'] ?? 3)) {
            // Move to failed dir for inspection
            $failDir = $dir . 'failed/';
            if (!is_dir($failDir)) @mkdir($failDir, 0750, true);
            @rename($file, $failDir . basename($file));
            $stats['failed']++;
            continue;
        }

        // Update attempt count and status
        $job['attempts']++;
        $job['status'] = 'processing';
        @file_put_contents($file, json_encode($job), LOCK_EX);

        try {
            $handlerFn = $handlers[$job['job']] ?? null;
            if ($handlerFn && function_exists($handlerFn)) {
                $handlerFn($job['data']);
            } else {
                error_log("Queue: Unknown job type '{$job['job']}'");
            }
            @unlink($file); // Job complete — remove
            $stats['processed']++;
            $count++;
        } catch (\Throwable $e) {
            error_log("Queue job {$job['id']} failed: " . $e->getMessage());
            // Retry: update job with error and re-queue
            $job['status']    = 'pending';
            $job['last_error']= $e->getMessage();
            $job['available_at'] = time() + (30 * $job['attempts']); // Exponential backoff
            @file_put_contents($file, json_encode($job), LOCK_EX);
            $stats['failed']++;
        }
    }

    return $stats;
}

/**
 * Get queue stats.
 */
function getQueueStats(): array {
    $dir     = ECOMMERCE_QUEUE_DIR;
    $pending = count(glob($dir . 'job_*.json') ?: []);
    $failed  = count(glob($dir . 'failed/job_*.json') ?: []);
    return ['pending' => $pending, 'failed' => $failed, 'queue_dir' => $dir];
}

// ──────────────────────────────────────────────
// JOB HANDLERS (stubs — implement as needed)
// ──────────────────────────────────────────────

function handleSendOrderEmail(array $data): void {
    // Data: order_id, email_type (confirmed|shipped|delivered)
    // Integrate with email.php sendOrderEmail()
    if (function_exists('sendOrderEmail')) sendOrderEmail($data);
}

function handleLowStockAlert(array $data): void {
    // Data: product_id, variant_id, current_stock, threshold
    error_log("Low stock alert: product #{$data['product_id']}, stock={$data['current_stock']}");
    // TODO: send email to admin
}

function handleGenerateInvoice(array $data): void {
    // Data: order_id
    // Deferred PDF generation
}

function handleUpdateInventory(array $data): void {
    // Data: adjustments array
}

function handleExportProducts(array $data): void {
    // Data: filters, format (csv/xlsx), admin_email
}

function handleSitemapInvalidate(array $data): void {
    if (function_exists('cacheClear')) cacheClear('sitemap_xml');
}

function handleWebhookDispatch(array $data): void {
    // Data: url, payload, headers, secret
    $url = $data['url'] ?? '';
    if (!$url) return;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_POSTFIELDS     => json_encode($data['payload'] ?? []),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', ...(array)($data['headers'] ?? [])],
    ]);
    curl_exec($ch);
    curl_close($ch);
}
