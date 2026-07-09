<?php
/**
 * Security helper — CSRF, rate limiting, audit logs, security headers.
 * White-label ecommerce engine.
 */

// ──────────────────────────────────────────────
// SECURITY HEADERS
// ──────────────────────────────────────────────

/**
 * Inject hardened HTTP security headers.
 * Call this before any output for admin pages.
 */
function sendSecurityHeaders(): void {
    if (headers_sent()) return;
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: SAMEORIGIN");
    header("X-XSS-Protection: 1; mode=block");
    header("Referrer-Policy: strict-origin-when-cross-origin");
    header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
    // CSP: allow self + specific CDNs for fonts/charts
    header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://checkout.razorpay.com; frame-src https://js.stripe.com https://checkout.razorpay.com https://www.paypal.com;");
    header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
}

// ──────────────────────────────────────────────
// CSRF PROTECTION
// ──────────────────────────────────────────────

/**
 * Generate (or return existing) CSRF token for the current session.
 */
function getCsrfToken(): string {
    if (session_status() === PHP_SESSION_NONE) {
        session_start(['cookie_secure' => true, 'cookie_httponly' => true, 'cookie_samesite' => 'Strict']);
    }
    if (empty($_SESSION['csrf_token']) || strlen($_SESSION['csrf_token']) < 32) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token from request header or POST body.
 * Call on all state-changing admin form submissions.
 */
function verifyCsrfToken(): bool {
    if (session_status() === PHP_SESSION_NONE) {
        session_start(['cookie_secure' => true, 'cookie_httponly' => true, 'cookie_samesite' => 'Strict']);
    }
    $expected = $_SESSION['csrf_token'] ?? '';
    if (empty($expected)) return false;

    // API: check X-CSRF-Token header
    $headers = getallheaders();
    $provided = $headers['X-CSRF-Token'] ?? $headers['x-csrf-token'] ?? '';

    // Form: check POST field
    if (empty($provided)) {
        $provided = $_POST['_csrf'] ?? '';
    }

    // JSON body: check _csrf field
    if (empty($provided)) {
        $body = json_decode(file_get_contents('php://input'), true);
        $provided = $body['_csrf'] ?? '';
    }

    return hash_equals($expected, $provided);
}

// ──────────────────────────────────────────────
// RATE LIMITING (file-based, DB-backed optional)
// ──────────────────────────────────────────────

/**
 * Check and enforce rate limiting for an IP + action combo.
 * Uses file-based tracking (no Redis required).
 * Returns true if allowed, false if blocked.
 *
 * @param string $ip      Client IP address
 * @param string $action  Identifier e.g. 'login', 'order_create'
 * @param int    $max     Maximum hits allowed in window
 * @param int    $window  Window in seconds (default 60)
 */
function checkRateLimit(string $ip, string $action, int $max = 60, int $window = 60): bool {
    // Never rate-limit local development
    if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) return true;

    $dir  = sys_get_temp_dir() . '/ecommerce_ratelimit/';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);

    $key  = md5($ip . '|' . $action);
    $file = $dir . $key . '.json';
    $now  = time();

    $data = ['hits' => [], 'blocked_until' => 0];
    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        if ($raw) $data = json_decode($raw, true) ?: $data;
    }

    // Check if currently blocked
    if (($data['blocked_until'] ?? 0) > $now) {
        return false;
    }

    // Clean old hits outside window
    $data['hits'] = array_filter($data['hits'], fn($t) => $t > ($now - $window));

    // Add current hit
    $data['hits'][] = $now;

    // Check if over limit
    if (count($data['hits']) > $max) {
        $data['blocked_until'] = $now + $window; // block for one more window
        @file_put_contents($file, json_encode($data), LOCK_EX);
        return false;
    }

    @file_put_contents($file, json_encode($data), LOCK_EX);
    return true;
}

/**
 * Get client IP address, respecting trusted proxy headers.
 */
function getClientIp(): string {
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'] as $key) {
        $ip = $_SERVER[$key] ?? '';
        if ($ip) {
            // X-Forwarded-For can be a comma list — take first
            $ip = trim(explode(',', $ip)[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// ──────────────────────────────────────────────
// AUDIT LOGS
// ──────────────────────────────────────────────

/**
 * Write an admin action to the audit_logs table.
 *
 * @param PDO    $db
 * @param string $action      CREATE|UPDATE|DELETE|LOGIN|LOGOUT|EXPORT
 * @param string $resource    product|order|setting|admin|coupon...
 * @param mixed  $resourceId  The affected record ID
 * @param mixed  $oldValue    Previous state (array/scalar)
 * @param mixed  $newValue    New state (array/scalar)
 * @param array  $adminPayload JWT payload (contains id, email)
 */
function addAuditLog(
    PDO    $db,
    string $action,
    string $resource,
    mixed  $resourceId  = null,
    mixed  $oldValue    = null,
    mixed  $newValue    = null,
    array  $adminPayload = []
): void {
    try {
        $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
        $db->prepare("INSERT INTO audit_logs
            (site_id, admin_id, admin_email, action, resource, resource_id, old_value, new_value, ip_address, user_agent)
            VALUES (:site, :aid, :email, :action, :res, :rid, :old, :new, :ip, :ua)")
           ->execute([
               ':site'   => $siteId,
               ':aid'    => $adminPayload['id']    ?? null,
               ':email'  => $adminPayload['email'] ?? null,
               ':action' => strtoupper($action),
               ':res'    => $resource,
               ':rid'    => $resourceId !== null ? (string)$resourceId : null,
               ':old'    => $oldValue !== null ? json_encode($oldValue, JSON_UNESCAPED_UNICODE) : null,
               ':new'    => $newValue !== null ? json_encode($newValue, JSON_UNESCAPED_UNICODE) : null,
               ':ip'     => getClientIp(),
               ':ua'     => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
           ]);
    } catch (\Throwable $e) {
        // Never let audit logging crash the main request
        error_log('audit_log failed: ' . $e->getMessage());
    }
}

// ──────────────────────────────────────────────
// SECURITY EVENTS
// ──────────────────────────────────────────────

/**
 * Log a security event (failed login, brute force attempt, CSRF failure, etc.)
 */
function logSecurityEvent(
    PDO    $db,
    string $eventType,
    string $detail = '',
    string $email  = ''
): void {
    try {
        $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
        $db->prepare("INSERT INTO security_events
            (site_id, event_type, ip_address, user_agent, email, uri, detail)
            VALUES (:site, :type, :ip, :ua, :email, :uri, :detail)")
           ->execute([
               ':site'   => $siteId,
               ':type'   => $eventType,
               ':ip'     => getClientIp(),
               ':ua'     => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
               ':email'  => $email ?: null,
               ':uri'    => substr($_SERVER['REQUEST_URI'] ?? '', 0, 500),
               ':detail' => $detail ?: null,
           ]);
    } catch (\Throwable $e) {
        error_log('security_event failed: ' . $e->getMessage());
    }
}

// ──────────────────────────────────────────────
// INPUT SANITIZATION HELPERS
// ──────────────────────────────────────────────

/**
 * Sanitize string input — strip tags, trim, limit length.
 */
function sanitizeStr(string $value, int $maxLen = 255): string {
    return substr(trim(strip_tags($value)), 0, $maxLen);
}

/**
 * Sanitize integer input — return int or null if invalid.
 */
function sanitizeInt(mixed $value): ?int {
    return is_numeric($value) ? (int)$value : null;
}

/**
 * Sanitize decimal — return float or null if invalid.
 */
function sanitizeDecimal(mixed $value): ?float {
    return is_numeric($value) ? round((float)$value, 4) : null;
}

/**
 * Validate that a value is in an allowed set (whitelist).
 */
function sanitizeEnum(mixed $value, array $allowed, mixed $default = null): mixed {
    return in_array($value, $allowed, true) ? $value : $default;
}
