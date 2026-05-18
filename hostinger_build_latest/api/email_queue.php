<?php
/**
 * Asian Food Cork - Email Queue API
 * Handles queue processing, logs, settings, test sends
 */

require_once __DIR__ . '/../helpers/email.php';
require_once __DIR__ . '/../helpers/whatsapp.php';

// ── Process Queue (called by cron) ───────────────────────────────────────────
function processQueue($db) {
    processEmailQueue($db);
    successResponse(null, 'Queue processed');
}

// ── Get Email Logs ────────────────────────────────────────────────────────────
function getEmailLogs($db) {
    [$page, $perPage, $offset] = getPaginationParams();
    $where  = ['1=1'];
    $params = [];
    if (!empty($_GET['status'])) { $where[] = 'status=:s'; $params[':s'] = $_GET['status']; }
    if (!empty($_GET['order_id'])) { $where[] = 'order_id=:oid'; $params[':oid'] = $_GET['order_id']; }
    $w = implode(' AND ', $where);

    $total = $db->prepare("SELECT COUNT(*) FROM email_logs WHERE $w");
    $total->execute($params);
    $total = $total->fetchColumn();

    $stmt = $db->prepare("SELECT * FROM email_logs WHERE $w ORDER BY sent_at DESC LIMIT :lim OFFSET :off");
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    paginatedResponse($stmt->fetchAll(), $total, $page, $perPage);
}

// ── Get Email Queue ───────────────────────────────────────────────────────────
function getEmailQueueList($db) {
    [$page, $perPage, $offset] = getPaginationParams();
    $where  = ['1=1'];
    $params = [];
    if (!empty($_GET['status'])) { $where[] = 'status=:s'; $params[':s'] = $_GET['status']; }
    $w = implode(' AND ', $where);

    $total = $db->prepare("SELECT COUNT(*) FROM email_queue WHERE $w");
    $total->execute($params);
    $count = $total->fetchColumn();

    $stmt = $db->prepare("SELECT id, order_id, email_type, recipient, subject, status, attempts, max_attempts, error_message, scheduled_at, created_at FROM email_queue WHERE $w ORDER BY created_at DESC LIMIT :lim OFFSET :off");
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    paginatedResponse($stmt->fetchAll(), $count, $page, $perPage);
}

// ── Manual retry ─────────────────────────────────────────────────────────────
function retryEmailJob($db, $id) {
    $stmt = $db->prepare("UPDATE email_queue SET status='pending', attempts=0, scheduled_at=NOW(), error_message=NULL WHERE id=:id");
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) errorResponse('Queue item not found', 404);
    processEmailQueue($db); // process immediately
    successResponse(null, 'Email queued for retry');
}

// ── Get Email Settings ────────────────────────────────────────────────────────
function getEmailSettingsApi($db) {
    $cfg = getEmailSettings($db);
    unset($cfg['smtp_password']); // don't expose password in GET
    successResponse($cfg);
}

// ── Update Email Settings ─────────────────────────────────────────────────────
function updateEmailSettings($db) {
    $data = getJsonInput();
    $allowed = ['smtp_host','smtp_port','smtp_encryption','smtp_username','smtp_password',
                'smtp_from_email','smtp_from_name','admin_email','email_enabled',
                'whatsapp_enabled','whatsapp_number','whatsapp_api_key'];

    foreach ($allowed as $key) {
        if (!array_key_exists($key, $data)) continue;
        $db->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group)
            VALUES (:k, :v, 'email')
            ON DUPLICATE KEY UPDATE setting_value = :v2")
           ->execute([':k' => $key, ':v' => $data[$key], ':v2' => $data[$key]]);
    }
    successResponse(null, 'Email settings updated');
}

// ── Send Test Email ───────────────────────────────────────────────────────────
function sendTestEmail($db) {
    $data = getJsonInput();
    $to   = $data['to'] ?? null;
    if (empty($to)) errorResponse('Recipient email required', 400);

    $cfg = getEmailSettings($db);

    $html = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f0f2f5;padding:20px">'
          . '<div style="max-width:500px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">'
          . '<div style="background:#0D1827;padding:20px;text-align:center">'
          . '<h1 style="color:#fff;margin:0;font-size:20px">Asian Food Cork</h1>'
          . '<p style="color:rgba(255,255,255,.6);margin:4px 0 0;font-size:12px">SMTP Test Email</p>'
          . '</div>'
          . '<div style="padding:24px">'
          . '<p style="color:#374151">✅ Your SMTP configuration is working correctly!</p>'
          . '<p style="color:#374151"><strong>SMTP Host:</strong> ' . htmlspecialchars($cfg['smtp_host']) . '</p>'
          . '<p style="color:#374151"><strong>Port:</strong> ' . htmlspecialchars($cfg['smtp_port']) . '</p>'
          . '<p style="color:#374151"><strong>Encryption:</strong> ' . strtoupper($cfg['smtp_encryption']) . '</p>'
          . '<p style="color:#374151"><strong>Sent at:</strong> ' . date('d M Y H:i:s') . '</p>'
          . '</div>'
          . '<div style="padding:12px 24px;background:#f8fafc;text-align:center;font-size:12px;color:#94a3b8">'
          . 'Asian Food Cork | Cork, Ireland | orders@asianfoodcork.com'
          . '</div></div></body></html>';

    try {
        sendViaSMTP($cfg, $to, '✅ SMTP Test – Asian Food Cork', $html, 'SMTP test successful!');
        // Log to email_logs
        logEmail($db, null, null, 'test', $to, 'SMTP Test', 'sent', 'Test sent successfully');
        successResponse(null, 'Test email sent successfully to ' . $to);
    } catch (Exception $e) {
        logEmail($db, null, null, 'test', $to, 'SMTP Test', 'failed', $e->getMessage());
        errorResponse('SMTP Error: ' . $e->getMessage(), 500);
    }
}
