<?php
/**
 * Customer Password Reset via OTP
 * Self-service password reset using 6-digit OTP sent via SMTP email.
 */

require_once __DIR__ . '/../helpers/email.php';

/**
 * Ensure the password_reset_otps table exists.
 */
function ensureOtpTable($db) {
    $db->exec("CREATE TABLE IF NOT EXISTS `password_reset_otps` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `customer_id` INT NOT NULL,
        `email` VARCHAR(255) NOT NULL,
        `otp` VARCHAR(10) NOT NULL,
        `reset_token` VARCHAR(64) DEFAULT NULL,
        `expires_at` DATETIME NOT NULL,
        `used` TINYINT(1) NOT NULL DEFAULT 0,
        `attempts` INT NOT NULL DEFAULT 0,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_email_otp` (`email`, `otp`),
        INDEX `idx_reset_token` (`reset_token`),
        INDEX `idx_expires` (`expires_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

/**
 * POST /api/customer/forgot-password
 * Sends a 6-digit OTP to the customer's email.
 */
function customerForgotPassword($db) {
    $data  = getJsonInput();
    $email = trim(strtolower($data['email'] ?? ''));

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        errorResponse('Please enter a valid email address.', 400);
    }

    // Rate limit: max 5 OTP requests per email per hour
    if (!checkRateLimit(md5($email), 'forgot_password', 5, 3600)) {
        errorResponse('Too many password reset requests. Please try again later.', 429);
    }

    // Rate limit by IP too
    if (!checkRateLimit(getClientIp(), 'forgot_password_ip', 10, 3600)) {
        errorResponse('Too many password reset requests. Please try again later.', 429);
    }

    ensureOtpTable($db);

    // Check if customer exists
    $stmt = $db->prepare("SELECT id, name, first_name, email FROM customers WHERE email = :email AND is_active = 1");
    $stmt->execute([':email' => $email]);
    $customer = $stmt->fetch();

    if (!$customer) {
        // Don't reveal whether the email exists — always show success
        successResponse(null, 'If an account exists with this email, you will receive a password reset code.');
        return;
    }

    // Invalidate any previous unused OTPs for this email
    $db->prepare("UPDATE password_reset_otps SET used = 1 WHERE email = :email AND used = 0")
       ->execute([':email' => $email]);

    // Generate 6-digit OTP
    $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

    $db->prepare("INSERT INTO password_reset_otps (customer_id, email, otp, expires_at) VALUES (:cid, :email, :otp, :exp)")
       ->execute([
           ':cid'   => $customer['id'],
           ':email' => $email,
           ':otp'   => $otp,
           ':exp'   => $expiresAt,
       ]);

    // Send OTP via SMTP
    try {
        $cfg = getEmailSettings($db);
        $siteName = settingOrDefault($cfg, 'site_name', 'Your Store');
        $customerName = $customer['first_name'] ?: $customer['name'] ?: 'Customer';

        $html = buildOtpEmail($otp, $customerName, $cfg);
        $subject = 'Password Reset Code - ' . $siteName;

        sendViaSMTP($cfg, $email, $subject, $html, "Your password reset code is: $otp. This code expires in 10 minutes.");

        try {
            logEmail($db, null, null, 'password_reset_otp', $email, $subject, 'sent', 'OK');
        } catch (\Throwable $le) {}

    } catch (\Throwable $e) {
        error_log('OTP email send error: ' . $e->getMessage());
        try {
            logEmail($db, null, null, 'password_reset_otp', $email, 'Password Reset Code', 'failed', $e->getMessage());
        } catch (\Throwable $le) {}
        errorResponse('Could not send the password reset email. Please try again later.', 500);
    }

    successResponse(null, 'If an account exists with this email, you will receive a password reset code.');
}

/**
 * POST /api/customer/verify-otp
 * Verifies the OTP and returns a one-time reset token.
 */
function customerVerifyOtp($db) {
    $data  = getJsonInput();
    $email = trim(strtolower($data['email'] ?? ''));
    $otp   = trim($data['otp'] ?? '');

    if (!$email || !$otp) {
        errorResponse('Email and OTP code are required.', 400);
    }

    // Rate limit: max 10 verify attempts per IP per 15 mins
    if (!checkRateLimit(getClientIp(), 'verify_otp', 10, 900)) {
        errorResponse('Too many attempts. Please try again later.', 429);
    }

    ensureOtpTable($db);

    // Find the OTP record
    $stmt = $db->prepare("SELECT id, customer_id, otp, expires_at, used, attempts 
        FROM password_reset_otps 
        WHERE email = :email AND used = 0 
        ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([':email' => $email]);
    $record = $stmt->fetch();

    if (!$record) {
        errorResponse('Invalid or expired code. Please request a new one.', 400);
    }

    // Increment attempt counter
    $db->prepare("UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = :id")
       ->execute([':id' => $record['id']]);

    // Check max attempts (5 per OTP)
    if ($record['attempts'] >= 5) {
        $db->prepare("UPDATE password_reset_otps SET used = 1 WHERE id = :id")
           ->execute([':id' => $record['id']]);
        errorResponse('Too many incorrect attempts. Please request a new code.', 429);
    }

    // Check expiry
    if (strtotime($record['expires_at']) < time()) {
        $db->prepare("UPDATE password_reset_otps SET used = 1 WHERE id = :id")
           ->execute([':id' => $record['id']]);
        errorResponse('This code has expired. Please request a new one.', 400);
    }

    // Verify OTP
    if (!hash_equals($record['otp'], $otp)) {
        $remaining = 5 - $record['attempts'] - 1;
        errorResponse("Incorrect code. $remaining attempts remaining.", 400);
    }

    // OTP is valid — generate a one-time reset token
    $resetToken = bin2hex(random_bytes(32));
    $db->prepare("UPDATE password_reset_otps SET reset_token = :token WHERE id = :id")
       ->execute([':token' => $resetToken, ':id' => $record['id']]);

    successResponse(['reset_token' => $resetToken], 'Code verified successfully. You can now set a new password.');
}

/**
 * POST /api/customer/reset-password
 * Uses the reset token from verify-otp to set a new password.
 */
function customerResetPassword($db) {
    $data        = getJsonInput();
    $email       = trim(strtolower($data['email'] ?? ''));
    $resetToken  = trim($data['reset_token'] ?? '');
    $newPassword = $data['new_password'] ?? '';

    if (!$email || !$resetToken || !$newPassword) {
        errorResponse('Email, reset token, and new password are required.', 400);
    }

    if (strlen($newPassword) < 8) {
        errorResponse('New password must be at least 8 characters.', 400);
    }

    // Rate limit
    if (!checkRateLimit(getClientIp(), 'reset_password', 5, 900)) {
        errorResponse('Too many attempts. Please try again later.', 429);
    }

    ensureOtpTable($db);

    // Validate reset token
    $stmt = $db->prepare("SELECT id, customer_id, expires_at, used 
        FROM password_reset_otps 
        WHERE email = :email AND reset_token = :token AND used = 0 
        ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([':email' => $email, ':token' => $resetToken]);
    $record = $stmt->fetch();

    if (!$record) {
        errorResponse('Invalid or expired reset token. Please restart the password reset process.', 400);
    }

    // Check expiry (extend by 5 more minutes from OTP expiry for the reset step)
    if (strtotime($record['expires_at']) + 300 < time()) {
        $db->prepare("UPDATE password_reset_otps SET used = 1 WHERE id = :id")
           ->execute([':id' => $record['id']]);
        errorResponse('This reset session has expired. Please request a new code.', 400);
    }

    // Update the customer's password
    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $db->prepare("UPDATE customers SET password = :pw, password_reset_required = 0 WHERE id = :id")
       ->execute([':pw' => $hash, ':id' => $record['customer_id']]);

    // Mark OTP as used
    $db->prepare("UPDATE password_reset_otps SET used = 1 WHERE id = :id")
       ->execute([':id' => $record['id']]);

    // Invalidate all other unused OTPs for this email
    $db->prepare("UPDATE password_reset_otps SET used = 1 WHERE email = :email AND used = 0")
       ->execute([':email' => $email]);

    successResponse(null, 'Password has been reset successfully. You can now log in with your new password.');
}

/**
 * Build the OTP email HTML template.
 */
function buildOtpEmail($otp, $customerName, $cfg = []) {
    $siteName = htmlspecialchars(settingOrDefault($cfg, 'site_name', 'Your Store'));
    $tagline = htmlspecialchars(settingOrDefault($cfg, 'site_tagline', ''));

    return '<!DOCTYPE html><html><head><meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
    body{margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif}
    .wrap{max-width:500px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .header{background:linear-gradient(135deg,#0D1827 0%,#1a2f50 100%);padding:28px 32px;text-align:center}
    .header h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}
    .header p{color:rgba(255,255,255,.65);margin:4px 0 0;font-size:13px}
    .accent{height:4px;background:linear-gradient(90deg,#070A05,#F28C00,#E0242D)}
    .body{padding:32px;text-align:center}
    .otp-box{display:inline-block;background:linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%);border:2px solid #22C55E;border-radius:12px;padding:20px 40px;margin:20px 0;letter-spacing:8px;font-size:32px;font-weight:800;color:#0D1827}
    .expire{color:#94a3b8;font-size:13px;margin-top:12px}
    .warning{background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-top:20px;font-size:12px;color:#92400e;text-align:left}
    .footer{background:#f8fafc;padding:20px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0}
    </style></head><body><div class="wrap">
    <div class="header">
        <h1>' . $siteName . '</h1>
        ' . ($tagline ? '<p>' . $tagline . '</p>' : '') . '
    </div>
    <div class="accent"></div>
    <div class="body">
        <h2 style="color:#0D1827;font-size:18px;margin:0 0 8px">Password Reset</h2>
        <p style="color:#64748b;font-size:14px;margin:0 0 4px">Hi ' . htmlspecialchars($customerName) . ',</p>
        <p style="color:#64748b;font-size:14px;margin:0 0 20px">Use this code to reset your password:</p>
        <div class="otp-box">' . htmlspecialchars($otp) . '</div>
        <p class="expire">⏱ This code expires in <strong>10 minutes</strong></p>
        <div class="warning">
            🔒 <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email. Your account is safe — no changes have been made.
        </div>
    </div>
    <div class="footer">
        <p>' . $siteName . '</p>
        <p style="color:#cbd5e1;font-size:11px;margin-top:8px">This is an automated email. Please do not reply.</p>
    </div>
    </div></body></html>';
}
