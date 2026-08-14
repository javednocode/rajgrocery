<?php
/**
 * White-label ecommerce core email helper
 * Uses PHPMailer with SMTP + PDF/XML invoice generation
 */

require_once __DIR__ . '/vendor/PHPMailer/Exception.php';
require_once __DIR__ . '/vendor/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/vendor/PHPMailer/SMTP.php';
require_once __DIR__ . '/invoice_pdf.php';
require_once __DIR__ . '/invoice_xml.php';
require_once __DIR__ . '/branding.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as MailException;

// ── Get SMTP settings from DB ────────────────────────────────────────────────
function getEmailSettings($db) {
    $settings = loadSiteSettings($db);
    $defaults = [];
    foreach (brandingDefaults() as $key => [$value]) {
        $defaults[$key] = (string)$value;
    }
    return array_merge($defaults, $settings);
}

function ensureEmailTables($db) {
    $db->exec("CREATE TABLE IF NOT EXISTS email_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NULL,
        email_type VARCHAR(50) NOT NULL DEFAULT 'order_placed',
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body_html LONGTEXT,
        body_text TEXT,
        attachments JSON NULL,
        status ENUM('pending','processing','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
        attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
        max_attempts TINYINT UNSIGNED NOT NULL DEFAULT 3,
        error_message TEXT,
        scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_order (order_id),
        INDEX idx_scheduled (status, scheduled_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $db->exec("CREATE TABLE IF NOT EXISTS email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        queue_id INT NULL,
        order_id INT NULL,
        email_type VARCHAR(50),
        recipient VARCHAR(255),
        subject VARCHAR(500),
        status ENUM('sent','failed') NOT NULL,
        smtp_response TEXT,
        error_message TEXT,
        pdf_path VARCHAR(500),
        xml_path VARCHAR(500),
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order (order_id),
        INDEX idx_status (status),
        INDEX idx_sent (sent_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $db->exec("CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL UNIQUE,
        order_number VARCHAR(50),
        pdf_path VARCHAR(500),
        xml_path VARCHAR(500),
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

// ── Queue email for background sending ──────────────────────────────────────
function queueEmail($db, $orderId, $type, $recipient, $subject, $htmlBody, $textBody, $attachments = []) {
    ensureEmailTables($db);
    $stmt = $db->prepare("INSERT INTO email_queue 
        (order_id, email_type, recipient, subject, body_html, body_text, attachments, status, scheduled_at)
        VALUES (:oid, :type, :recip, :subj, :html, :text, :attach, 'pending', NOW())");
    $stmt->execute([
        ':oid'    => $orderId,
        ':type'   => $type,
        ':recip'  => $recipient,
        ':subj'   => $subject,
        ':html'   => $htmlBody,
        ':text'   => $textBody,
        ':attach' => json_encode($attachments),
    ]);
    return $db->lastInsertId();
}

// ── Process queue (called by cron or API) ────────────────────────────────────
function processEmailQueue($db, $orderId = null, $limit = 10) {
    ensureEmailTables($db);
    $cfg = getEmailSettings($db);
    if (empty($cfg['email_enabled']) || $cfg['email_enabled'] === '0') {
        return ['processed' => 0, 'sent' => 0, 'failed' => 0, 'skipped' => 'Email notifications disabled'];
    }

    $limit = max(1, min(25, (int)$limit));

    try {
        $db->exec("UPDATE email_queue
            SET status='pending', scheduled_at=NOW(), error_message='Recovered from stale processing state'
            WHERE status='processing'
              AND created_at < DATE_SUB(NOW(), INTERVAL 30 SECOND)");
    } catch (\Throwable $e) {
        error_log('Email queue stale reset skipped: ' . $e->getMessage());
    }

    $summary = ['processed' => 0, 'sent' => 0, 'failed' => 0];

    $where = [
        "status IN ('pending','failed')",
        "attempts < max_attempts",
        "scheduled_at <= NOW()"
    ];
    $params = [];

    if (!empty($orderId)) {
        $where[] = "order_id = :order_id";
        $params[':order_id'] = (int)$orderId;
    }

    // Grab pending/failed jobs. For a new order, process that order first so
    // old failed jobs cannot block the customer/admin confirmation emails.
    $stmt = $db->prepare("SELECT * FROM email_queue
        WHERE " . implode(' AND ', $where) . "
        ORDER BY created_at ASC LIMIT :limit");
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_INT);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $jobs = $stmt->fetchAll();

    foreach ($jobs as $job) {
        $summary['processed']++;

        // Mark as processing
        $db->prepare("UPDATE email_queue SET status='processing', attempts=attempts+1 WHERE id=:id")
           ->execute([':id' => $job['id']]);

        try {
            $attachments = json_decode($job['attachments'] ?? '[]', true) ?: [];
            if (empty($attachments)) {
                $attachments = buildQueuedEmailAttachments($db, $job, $cfg);
            }
            sendViaSMTP($cfg, $job['recipient'], $job['subject'], $job['body_html'], $job['body_text'], $attachments);

            // Mark sent
            $db->prepare("UPDATE email_queue SET status='sent', processed_at=NOW() WHERE id=:id")
               ->execute([':id' => $job['id']]);

            // Log success
            safeLogEmail($db, $job['id'], $job['order_id'], $job['email_type'], $job['recipient'], $job['subject'], 'sent', 'OK');
            $summary['sent']++;

        } catch (\Throwable $e) {
            $err = $e->getMessage();
            $newStatus = ($job['attempts'] + 1 >= $job['max_attempts']) ? 'failed' : 'pending';
            $nextRetry = date('Y-m-d H:i:s', strtotime('+5 minutes'));

            $db->prepare("UPDATE email_queue SET status=:s, error_message=:err, scheduled_at=:next WHERE id=:id")
               ->execute([':s' => $newStatus, ':err' => $err, ':next' => $nextRetry, ':id' => $job['id']]);

            safeLogEmail($db, $job['id'], $job['order_id'], $job['email_type'], $job['recipient'], $job['subject'], 'failed', $err);
            $summary['failed']++;
        }
    }

    return $summary;
}

function triggerEmailQueueWorker($orderId = null) {
    $hostHeader = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $hostOnly = preg_replace('/:\d+$/', '', $hostHeader);
    $serverPort = (int)($_SERVER['SERVER_PORT'] ?? 80);
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || $serverPort === 443;

    $port = $isHttps ? 443 : $serverPort;
    if (preg_match('/:(\d+)$/', $hostHeader, $matches)) {
        $port = (int)$matches[1];
    }

    $path = '/api/email/process';
    if (!empty($orderId)) {
        $path .= '?order_id=' . rawurlencode((string)$orderId);
    }

    $remote = ($isHttps ? 'ssl://' : '') . $hostOnly;
    $fp = @fsockopen($remote, $port, $errno, $errstr, 0.2);
    if (!$fp) {
        error_log('Email worker trigger failed: ' . $errstr . ' (' . $errno . ')');
        return false;
    }

    stream_set_timeout($fp, 0, 200000);
    fwrite($fp, "POST {$path} HTTP/1.1\r\n");
    fwrite($fp, "Host: {$hostHeader}\r\n");
    fwrite($fp, "Connection: Close\r\n");
    fwrite($fp, "Content-Length: 0\r\n\r\n");
    fclose($fp);

    return true;
}

function buildQueuedEmailAttachments($db, $job, $cfg) {
    if (empty($job['order_id'])) return [];

    $orderStmt = $db->prepare("SELECT * FROM orders WHERE id = :id");
    $orderStmt->execute([':id' => $job['order_id']]);
    $order = $orderStmt->fetch();
    if (!$order) return [];

    $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = :oid");
    $itemStmt->execute([':oid' => $job['order_id']]);
    $items = $itemStmt->fetchAll();
    if (empty($items)) return [];

    $attachments = [];
    try {
        $pdfPath = generatePDFInvoice($order, $items, $cfg);
        if ($pdfPath) $attachments[] = $pdfPath;
    } catch (\Throwable $e) {
        error_log('Queued PDF generation error: ' . $e->getMessage());
    }

    $isAdminRecipient = strcasecmp((string)$job['recipient'], (string)($cfg['admin_email'] ?? '')) === 0
        || stripos((string)$job['subject'], 'New Order:') === 0;

    if ($isAdminRecipient) {
        try {
            $xmlPath = generateXMLInvoice($order, $items, $cfg);
            if ($xmlPath) $attachments[] = $xmlPath;
        } catch (\Throwable $e) {
            error_log('Queued XML generation error: ' . $e->getMessage());
        }
    }

    return $attachments;
}

// ── Send directly via SMTP ────────────────────────────────────────────────────
function sendViaSMTP($cfg, $to, $subject, $htmlBody, $textBody = '', $attachments = []) {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Timeout    = 15;
    $mail->Host       = $cfg['smtp_host'];
    $mail->Port       = (int)$cfg['smtp_port'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['smtp_username'];
    $mail->Password   = $cfg['smtp_password'];
    $mail->SMTPSecure = strtolower($cfg['smtp_encryption']) === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->setFrom($cfg['smtp_from_email'], $cfg['smtp_from_name']);
    $mail->addReplyTo($cfg['smtp_from_email'], $cfg['smtp_from_name']);
    $mail->addAddress($to);
    $mail->Subject    = $subject;
    $mail->isHTML(true);
    $mail->Body       = $htmlBody;
    $mail->AltBody    = $textBody ?: strip_tags($htmlBody);
    $mail->CharSet    = 'UTF-8';
    $mail->XMailer    = ' ';

    // Attach files (web-relative paths)
    foreach ($attachments as $filePath) {
        $fullPath = __DIR__ . '/../' . ltrim($filePath, '/');
        if (file_exists($fullPath)) {
            $mail->addAttachment($fullPath, basename($fullPath));
        }
    }
    $mail->send();
}

// ── Send via SMTP with ABSOLUTE file paths as attachments ─────────────────────
function sendViaSMTPWithFiles($cfg, $to, $subject, $htmlBody, $textBody = '', $absFilePaths = []) {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Timeout    = 15;
    $mail->Host       = $cfg['smtp_host'];
    $mail->Port       = (int)$cfg['smtp_port'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['smtp_username'];
    $mail->Password   = $cfg['smtp_password'];
    $mail->SMTPSecure = strtolower($cfg['smtp_encryption']) === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->setFrom($cfg['smtp_from_email'], $cfg['smtp_from_name']);
    $mail->addReplyTo($cfg['smtp_from_email'], $cfg['smtp_from_name']);
    $mail->addAddress($to);
    $mail->Subject    = $subject;
    $mail->isHTML(true);
    $mail->Body       = $htmlBody;
    $mail->AltBody    = $textBody ?: strip_tags($htmlBody);
    $mail->CharSet    = 'UTF-8';
    $mail->XMailer    = ' ';

    // Attach files (absolute filesystem paths)
    foreach ($absFilePaths as $absPath) {
        if ($absPath && file_exists($absPath)) {
            $mail->addAttachment($absPath, basename($absPath));
        }
    }

    $mail->send();
}


// ── Log email result ─────────────────────────────────────────────────────────
function logEmail($db, $queueId, $orderId, $type, $recipient, $subject, $status, $response, $pdfPath = null, $xmlPath = null) {
    ensureEmailTables($db);
    $db->prepare("INSERT INTO email_logs 
        (queue_id, order_id, email_type, recipient, subject, status, smtp_response, pdf_path, xml_path)
        VALUES (:qid, :oid, :type, :recip, :subj, :status, :resp, :pdf, :xml)")
       ->execute([
            ':qid'    => $queueId,
            ':oid'    => $orderId,
            ':type'   => $type,
            ':recip'  => $recipient,
            ':subj'   => $subject,
            ':status' => $status,
            ':resp'   => $response,
            ':pdf'    => $pdfPath,
            ':xml'    => $xmlPath,
       ]);
}

function safeLogEmail($db, $queueId, $orderId, $type, $recipient, $subject, $status, $response, $pdfPath = null, $xmlPath = null) {
    try {
        logEmail($db, $queueId, $orderId, $type, $recipient, $subject, $status, $response, $pdfPath, $xmlPath);
    } catch (\Throwable $e) {
        error_log('Email log skipped: ' . $e->getMessage());
    }
}

// ── Queue order confirmation emails (both customer + admin) ─────────────────
function queueOrderEmails($db, $order, $items) {
    $cfg = getEmailSettings($db);
    if (empty($cfg['email_enabled']) || $cfg['email_enabled'] === '0') return;

    if (!empty($order['customer_email'])) {
        $subject = 'Order Confirmed - ' . $order['order_number'] . ' | ' . settingOrDefault($cfg, 'site_name', 'Your Store');
        $html    = buildCustomerEmail($order, $items, 'order_placed', $cfg);
        $text    = buildPlainText($order, $items, $cfg);
        queueEmail($db, $order['id'], 'order_placed', $order['customer_email'], $subject, $html, $text, []);
    }

    if (!empty($cfg['admin_email'])) {
        $adminSubject = 'New Order: ' . $order['order_number'] . ' from ' . $order['customer_name'];
        $adminHtml    = buildAdminEmail($order, $items, $cfg);
        queueEmail($db, $order['id'], 'order_placed', $cfg['admin_email'], $adminSubject, $adminHtml, '', []);
    }
}

// ── Send order emails IMMEDIATELY via SMTP (no queue table required) ─────────
function sendOrderEmailsNow($db, $order, $items) {
    $cfg = getEmailSettings($db);
    $results = [
        'customer' => ['skipped' => true, 'reason' => 'No customer email'],
        'admin' => ['skipped' => true, 'reason' => 'No admin email'],
    ];

    if (empty($cfg['email_enabled']) || $cfg['email_enabled'] === '0') {
        $results['customer'] = ['skipped' => true, 'reason' => 'Email notifications disabled'];
        $results['admin'] = ['skipped' => true, 'reason' => 'Email notifications disabled'];
        return $results;
    }

    // Generate PDF invoice
    $pdfPath    = null;
    $fullPdfPath = null;
    try {
        $pdfPath     = generatePDFInvoice($order, $items, $cfg);
        $fullPdfPath = __DIR__ . '/../' . ltrim($pdfPath, '/');
    } catch (\Throwable $e) {
        error_log('PDF generation error: ' . $e->getMessage());
    }

    // Generate XML invoice
    $xmlPath    = null;
    $fullXmlPath = null;
    try {
        $xmlPath     = generateXMLInvoice($order, $items, $cfg);
        $fullXmlPath = __DIR__ . '/../' . ltrim($xmlPath, '/');
    } catch (\Throwable $e) {
        error_log('XML generation error: ' . $e->getMessage());
    }

    // Build attachment lists
    $pdfAttachment  = ($fullPdfPath && file_exists($fullPdfPath)) ? [$fullPdfPath] : [];
    $adminAttachments = $pdfAttachment;
    if ($fullXmlPath && file_exists($fullXmlPath)) $adminAttachments[] = $fullXmlPath;

    // ── Send to customer (PDF only — no raw XML) ─────────────────────────────
    if (!empty($order['customer_email'])) {
        try {
            $subject = 'Order Confirmed - ' . $order['order_number'] . ' | ' . settingOrDefault($cfg, 'site_name', 'Your Store');
            $html    = buildCustomerEmail($order, $items, 'order_placed', $cfg);
            $text    = buildPlainText($order, $items, $cfg);
            sendViaSMTPWithFiles($cfg, $order['customer_email'], $subject, $html, $text, $pdfAttachment);
            safeLogEmail($db, null, $order['id'] ?? null, 'order_placed', $order['customer_email'], $subject, 'sent', 'OK', $pdfPath, null);
            $results['customer'] = ['sent' => true, 'recipient' => $order['customer_email']];
            error_log('Customer email sent to: ' . $order['customer_email']);
        } catch (\Throwable $e) {
            safeLogEmail($db, null, $order['id'] ?? null, 'order_placed', $order['customer_email'], $subject ?? 'Order confirmation', 'failed', $e->getMessage(), $pdfPath, null);
            $results['customer'] = ['sent' => false, 'recipient' => $order['customer_email'], 'error' => $e->getMessage()];
            error_log('Customer email error: ' . $e->getMessage());
        }
    }

    // ── Send to admin (PDF + XML for accounting) ─────────────────────────────
    if (!empty($cfg['admin_email'])) {
        try {
            $adminSubject = 'New Order: ' . $order['order_number'] . ' from ' . $order['customer_name'];
            $adminHtml    = buildAdminEmail($order, $items, $cfg);
            sendViaSMTPWithFiles($cfg, $cfg['admin_email'], $adminSubject, $adminHtml, '', $adminAttachments);
            safeLogEmail($db, null, $order['id'] ?? null, 'order_placed', $cfg['admin_email'], $adminSubject, 'sent', 'OK', $pdfPath, $xmlPath);
            $results['admin'] = ['sent' => true, 'recipient' => $cfg['admin_email']];
            error_log('Admin email sent to: ' . $cfg['admin_email']);
        } catch (\Throwable $e) {
            safeLogEmail($db, null, $order['id'] ?? null, 'order_placed', $cfg['admin_email'], $adminSubject ?? 'New order', 'failed', $e->getMessage(), $pdfPath, $xmlPath);
            $results['admin'] = ['sent' => false, 'recipient' => $cfg['admin_email'], 'error' => $e->getMessage()];
            error_log('Admin email error: ' . $e->getMessage());
        }
    }

    // ── WhatsApp ─────────────────────────────────────────────────────────────
    if (!empty($cfg['whatsapp_enabled']) && $cfg['whatsapp_enabled'] === '1') {
        try { sendWhatsAppNotification($cfg, $order); } catch (\Throwable $e) {}
    }

    return $results;
}


// ── Queue status update email ────────────────────────────────────────────────
function queueStatusEmail($db, $order, $newStatus) {
    $cfg = getEmailSettings($db);
    if (empty($cfg['email_enabled']) || $cfg['email_enabled'] === '0') return;
    if (empty($order['customer_email'])) return;

    $labels = [
        'confirmed'  => ['✅ Order Confirmed',  'order_confirmed'],
        'processing' => ['🔧 Order Processing', 'order_confirmed'],
        'shipped'    => ['🚚 Order Shipped',     'order_shipped'],
        'delivered'  => ['📦 Order Delivered',   'order_delivered'],
        'cancelled'  => ['❌ Order Cancelled',   'order_cancelled'],
    ];

    if (!isset($labels[$newStatus])) return;

    [$prefix, $type] = $labels[$newStatus];
    $subject = "$prefix - {$order['order_number']} | " . settingOrDefault($cfg, 'site_name', 'Your Store');
    $html    = buildStatusEmail($order, $newStatus, $cfg);
    queueEmail($db, $order['id'], $type, $order['customer_email'], $subject, $html, '');
}

// ── HTML Email Templates ──────────────────────────────────────────────────────
function emailHeader($cfg = []) {
    $siteName = htmlspecialchars(settingOrDefault($cfg, 'site_name', 'Your Store'));
    $tagline = htmlspecialchars(settingOrDefault($cfg, 'site_tagline', 'White-label ecommerce storefront'));
    return '<!DOCTYPE html><html><head><meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
    body{margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif}
    .wrap{max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .header{background:linear-gradient(135deg,#0D1827 0%,#1a2f50 100%);padding:28px 32px;text-align:center}
    .header h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}
    .header p{color:rgba(255,255,255,.65);margin:4px 0 0;font-size:13px}
    .accent{height:4px;background:linear-gradient(90deg,#070A05,#F28C00,#E0242D)}
    .body{padding:32px}
    .order-badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;
        border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;margin-bottom:20px}
    h2{color:#0D1827;font-size:18px;margin:0 0 16px}
    .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
    .info-row:last-child{border:none}
    .info-label{color:#64748b;font-weight:600}
    .info-value{color:#1e293b;text-align:right}
    table.items{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}
    table.items th{background:#0D1827;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:.5px}
    table.items td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151}
    table.items tr:nth-child(even) td{background:#f8fafc}
    .totals{margin-top:16px;border-top:2px solid #e2e8f0;padding-top:16px}
    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#374151}
    .total-row.grand{font-size:16px;font-weight:700;color:#0D1827;padding-top:8px;margin-top:8px;border-top:2px solid #0D1827}
    .btn{display:inline-block;background:#22C55E;color:#fff;padding:12px 28px;border-radius:8px;
        text-decoration:none;font-weight:700;font-size:14px;margin:20px 0}
    .footer-note{background:#f8fafc;padding:20px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0}
    .footer-note a{color:#F28C00;text-decoration:none}
    </style></head><body><div class="wrap">
    <div class="header">
        <h1>' . $siteName . '</h1>
        <p>' . $tagline . '</p>
    </div>
    <div class="accent"></div>';
}

function emailFooter($orderNumber, $cfg = []) {
    $siteName = htmlspecialchars(settingOrDefault($cfg, 'site_name', 'Your Store'));
    $email = htmlspecialchars(settingOrDefault($cfg, 'site_email', settingOrDefault($cfg, 'contact_email', 'hello@example.com')));
    $phone = htmlspecialchars(settingOrDefault($cfg, 'site_phone', ''));
    $address = htmlspecialchars(settingOrDefault($cfg, 'site_address', ''));
    $siteUrl = appBaseUrl($cfg);
    $siteLink = $siteUrl ? '<p><a href="' . htmlspecialchars($siteUrl) . '">' . htmlspecialchars($siteUrl) . '</a></p>' : '';
    $contactLine = $email;
    if ($phone !== '') $contactLine .= ' | ' . $phone;

    return '<div class="footer-note">
        <p>Order Reference: <strong>' . htmlspecialchars($orderNumber) . '</strong></p>
        <p>Questions? <a href="mailto:' . $email . '">' . $contactLine . '</a></p>
        ' . $siteLink . '
        <p style="color:#cbd5e1;margin-top:12px;font-size:11px">' . $siteName . ($address !== '' ? ' | ' . $address : '') . '</p>
    </div></div></body></html>';
}

function buildItemsTable($items, $cfg = []) {
    $sym = settingOrDefault($cfg, 'currency_symbol', 'HK$');
    $html = '<table class="items"><thead><tr>
        <th>PRODUCT</th><th>QTY</th><th>PRICE</th><th>TOTAL</th>
    </tr></thead><tbody>';
    foreach ($items as $item) {
        $html .= '<tr>
            <td>' . htmlspecialchars($item['product_name']) . '</td>
            <td>' . (int)$item['quantity'] . '</td>
            <td>' . htmlspecialchars($sym) . number_format($item['price'], 2) . '</td>
            <td>' . htmlspecialchars($sym) . number_format($item['total'], 2) . '</td>
        </tr>';
    }
    $html .= '</tbody></table>';
    return $html;
}

function buildTotals($order, $cfg = []) {
    $sym = settingOrDefault($cfg, 'currency_symbol', 'HK$');
    $html = '<div class="totals">';
    $html .= '<div class="total-row"><span>Subtotal</span><span>' . htmlspecialchars($sym) . number_format($order['subtotal'] ?? 0, 2) . '</span></div>';
    if (!empty($order['discount']) && $order['discount'] > 0) {
        $html .= '<div class="total-row"><span>Discount</span><span style="color:#16a34a">-' . htmlspecialchars($sym) . number_format($order['discount'], 2) . '</span></div>';
    }
    if (!empty($order['shipping_charge'])) {
        $html .= '<div class="total-row"><span>Shipping</span><span>' . htmlspecialchars($sym) . number_format($order['shipping_charge'], 2) . '</span></div>';
    }
    if (!empty($order['tax'])) {
        $html .= '<div class="total-row"><span>Tax (VAT)</span><span>' . htmlspecialchars($sym) . number_format($order['tax'], 2) . '</span></div>';
    }
    $html .= '<div class="total-row grand"><span>TOTAL</span><span>' . htmlspecialchars($sym) . number_format($order['total'] ?? 0, 2) . '</span></div>';
    $html .= '</div>';
    return $html;
}

function buildCustomerEmail($order, $items, $type, $cfg = []) {
    $html = emailHeader($cfg);
    $html .= '<div class="body">';
    $html .= '<span class="order-badge">✅ Order Confirmed</span>';
    $html .= '<h2>Thank you, ' . htmlspecialchars($order['customer_name']) . '!</h2>';
    $html .= '<p style="color:#64748b;font-size:14px;margin:0 0 20px">Your order has been received and is being prepared. We\'ll keep you updated every step of the way.</p>';

    $html .= '<div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px">';
    $html .= '<div class="info-row"><span class="info-label">Order Number</span><span class="info-value"><strong>' . htmlspecialchars($order['order_number']) . '</strong></span></div>';
    $html .= '<div class="info-row"><span class="info-label">Order Date</span><span class="info-value">' . date('d M Y, H:i', strtotime($order['created_at'])) . '</span></div>';
    $html .= '<div class="info-row"><span class="info-label">Payment Method</span><span class="info-value">' . strtoupper($order['payment_method'] ?? 'COD') . '</span></div>';
    $html .= '</div>';

    $html .= '<h2 style="font-size:15px">Order Items</h2>';
    $html .= buildItemsTable($items, $cfg);
    $html .= buildTotals($order, $cfg);

    $html .= '<p style="font-size:12px;color:#94a3b8;margin-top:24px">📎 Your PDF invoice is attached to this email.</p>';
    $html .= '</div>';
    $html .= emailFooter($order['order_number'], $cfg);
    return $html;
}

function buildAdminEmail($order, $items, $cfg = []) {
    $html = emailHeader($cfg);
    $html .= '<div class="body">';
    $html .= '<span class="order-badge" style="background:#fef3c7;color:#92400e;border-color:#fde68a">🛒 New Order Received</span>';
    $html .= '<h2>New Order: ' . htmlspecialchars($order['order_number']) . '</h2>';

    $html .= '<div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px">';
    $html .= '<div class="info-row"><span class="info-label">Customer</span><span class="info-value">' . htmlspecialchars($order['customer_name']) . '</span></div>';
    $html .= '<div class="info-row"><span class="info-label">Phone</span><span class="info-value"><a href="tel:' . htmlspecialchars($order['customer_phone'] ?? '') . '">' . htmlspecialchars($order['customer_phone'] ?? 'N/A') . '</a></span></div>';
    $html .= '<div class="info-row"><span class="info-label">Email</span><span class="info-value">' . htmlspecialchars($order['customer_email'] ?? 'N/A') . '</span></div>';
    $html .= '<div class="info-row"><span class="info-label">Order Number</span><span class="info-value"><strong>' . htmlspecialchars($order['order_number']) . '</strong></span></div>';
    $html .= '<div class="info-row"><span class="info-label">Payment</span><span class="info-value">' . strtoupper($order['payment_method'] ?? 'COD') . '</span></div>';
    $html .= '</div>';

    $addr = $order['shipping_address'];
    if (is_string($addr)) { $addrData = json_decode($addr, true); }
    $addrStr = is_array($addrData ?? null)
        ? implode(', ', array_filter($addrData))
        : (string)$addr;
    $html .= '<p style="font-size:13px;color:#374151"><strong>Delivery Address:</strong> ' . htmlspecialchars($addrStr) . '</p>';

    $html .= buildItemsTable($items, $cfg);
    $html .= buildTotals($order, $cfg);

    $html .= '<div style="text-align:center;margin-top:24px">';
    $adminUrl = settingOrDefault($cfg, 'admin_url', appBaseUrl($cfg) ? appBaseUrl($cfg) . '/admin/orders.php' : '/admin/orders.php');
    $html .= '<a href="' . htmlspecialchars($adminUrl) . '" class="btn" style="background:#F28C00">View in Admin Panel →</a>';
    $html .= '</div>';

    $html .= '</div>';
    $html .= emailFooter($order['order_number'], $cfg);
    return $html;
}

function buildStatusEmail($order, $status, $cfg = []) {
    $configs = [
        'confirmed'  => ['✅', 'Order Confirmed', '#16a34a', 'Your order has been confirmed and we\'re getting it ready for you.'],
        'processing' => ['🔧', 'Order Processing', '#2563eb', 'Your order is currently being processed and packed.'],
        'shipped'    => ['🚚', 'Order Shipped', '#7c3aed', 'Great news! Your order is on its way to you.'],
        'delivered'  => ['📦', 'Order Delivered', '#15803d', 'Your order has been delivered. Thank you for shopping with us!'],
        'cancelled'  => ['❌', 'Order Cancelled', '#dc2626', 'Your order has been cancelled. Contact us if you have questions.'],
    ];
    [$icon, $label, $color, $message] = $configs[$status] ?? ['ℹ️', 'Order Update', '#0D1827', 'Your order status has been updated.'];

    $html = emailHeader($cfg);
    $html .= '<div class="body">';
    $html .= '<div style="text-align:center;margin-bottom:24px">';
    $html .= '<div style="font-size:48px;margin-bottom:12px">' . $icon . '</div>';
    $html .= '<h2 style="color:' . $color . ';margin:0">' . $label . '</h2>';
    $html .= '<p style="color:#64748b;font-size:14px;margin:8px 0 0">' . $message . '</p>';
    $html .= '</div>';

    $html .= '<div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px">';
    $html .= '<div class="info-row"><span class="info-label">Order Number</span><span class="info-value"><strong>' . htmlspecialchars($order['order_number']) . '</strong></span></div>';
    $html .= '<div class="info-row"><span class="info-label">Customer</span><span class="info-value">' . htmlspecialchars($order['customer_name']) . '</span></div>';
    $html .= '<div class="info-row"><span class="info-label">Status</span><span class="info-value" style="color:' . $color . ';font-weight:700">' . strtoupper($label) . '</span></div>';
    $html .= '</div>';

    $html .= '<div style="text-align:center">';
    $trackBase = appBaseUrl($cfg);
    $trackUrl = $trackBase ? $trackBase . '/track?order=' . urlencode($order['order_number']) : '';
    if ($trackUrl) {
        $html .= '<a href="' . htmlspecialchars($trackUrl) . '" class="btn" style="background:' . $color . '">Track Order →</a>';
    }
    $html .= '</div>';
    $html .= '</div>';
    $html .= emailFooter($order['order_number'], $cfg);
    return $html;
}

function buildPlainText($order, $items, $cfg = []) {
    $siteName = settingOrDefault($cfg, 'site_name', 'Your Store');
    $email = settingOrDefault($cfg, 'site_email', settingOrDefault($cfg, 'contact_email', 'hello@example.com'));
    $phone = settingOrDefault($cfg, 'site_phone', '');
    $sym = settingOrDefault($cfg, 'currency_symbol', 'HK$');
    $lines = [
        $siteName . ' - Order Confirmation',
        '=====================================',
        'Order Number: ' . $order['order_number'],
        'Date: ' . date('d M Y', strtotime($order['created_at'])),
        'Customer: ' . $order['customer_name'],
        '',
        'ITEMS:',
    ];
    foreach ($items as $item) {
        $lines[] = '- ' . $item['product_name'] . ' x' . $item['quantity'] . ' = ' . $sym . number_format($item['total'], 2);
    }
    $lines[] = '';
    $lines[] = 'Subtotal: ' . $sym . number_format($order['subtotal'] ?? 0, 2);
    if (!empty($order['shipping_charge'])) $lines[] = 'Shipping: ' . $sym . number_format($order['shipping_charge'], 2);
    $lines[] = 'TOTAL: ' . $sym . number_format($order['total'] ?? 0, 2);
    $lines[] = '';
    $lines[] = 'Questions? ' . $email . ($phone !== '' ? ' | ' . $phone : '');
    return implode("\n", $lines);
}
