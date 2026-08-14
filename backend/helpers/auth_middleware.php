<?php
/**
 * JWT Authentication Middleware — with Role-Based Access Control (RBAC)
 * Upgraded for Phase 13: roles, permissions, rate-limited login protection.
 */

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $payloadJson = json_encode($payload);

    $base64Header  = base64UrlEncode($header);
    $base64Payload = base64UrlEncode($payloadJson);

    $signature       = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);

    return "$base64Header.$base64Payload.$base64Signature";
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    [$base64Header, $base64Payload, $base64Signature] = $parts;

    $signature         = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $expectedSignature = base64UrlEncode($signature);

    if (!hash_equals($expectedSignature, $base64Signature)) return false;

    $payload = json_decode(base64UrlDecode($base64Payload), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) return false;

    return $payload;
}

/**
 * Require a valid admin JWT. Returns the decoded payload.
 * Applies rate limiting to prevent token brute-forcing.
 */
function requireAuth(): array {
    $headers    = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
        errorResponse('Authentication required', 401);
    }

    // Rate limit: max 120 token verifications per minute per IP
    // Skip rate limiting on localhost (local development)
    $isLocalHost = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1']);
    if (!$isLocalHost && function_exists('checkRateLimit') && function_exists('getClientIp')) {
        $ip = getClientIp();
        if (!checkRateLimit($ip, 'auth_verify', 120, 60)) {
            errorResponse('Too many requests. Try again in a minute.', 429);
        }
    }

    $payload = verifyJWT($matches[1]);
    if (!$payload) {
        errorResponse('Invalid or expired token', 401);
    }
    // Customer tokens must never be accepted on admin routes. Old admin
    // tokens (issued before the 'type' claim existed) have no 'type' key
    // and are unaffected by this check.
    if (($payload['type'] ?? null) === 'customer') {
        errorResponse('Authentication required', 401);
    }

    return $payload;
}

/**
 * Require a specific role or higher.
 * Role hierarchy: super_admin > site_owner > manager > editor > staff
 *
 * @param string|array $requiredRole Single role or array of accepted roles
 */
function requireRole(string|array $requiredRole): array {
    $payload = requireAuth();
    $userRole = $payload['role'] ?? 'staff';

    $hierarchy = ['super_admin' => 5, 'site_owner' => 4, 'manager' => 3, 'editor' => 2, 'staff' => 1];
    $required  = is_array($requiredRole) ? $requiredRole : [$requiredRole];

    // Check if user's role is in the accepted list
    $userLevel  = $hierarchy[$userRole] ?? 0;
    $minRequired = min(array_map(fn($r) => $hierarchy[$r] ?? 99, $required));

    if ($userLevel < $minRequired) {
        errorResponse('Insufficient permissions for this action', 403);
    }

    return $payload;
}

/**
 * Check if the current admin has permission for a resource + action.
 * Used for fine-grained UI/API control.
 *
 * @param PDO    $db
 * @param array  $payload    JWT payload
 * @param string $resource   'products'|'orders'|'settings'|etc.
 * @param string $action     'view'|'create'|'edit'|'delete'|'export'
 */
function hasPermission(PDO $db, array $payload, string $resource, string $action): bool {
    $userRole = $payload['role'] ?? 'staff';

    // Super admin always has everything
    if ($userRole === 'super_admin') return true;

    $roleId = $payload['role_id'] ?? null;
    if (!$roleId) {
        // Fallback: look up role_id by role name
        try {
            $stmt = $db->prepare("SELECT id FROM admin_roles WHERE name = :name");
            $stmt->execute([':name' => $userRole]);
            $row = $stmt->fetch();
            $roleId = $row ? $row['id'] : null;
        } catch (\Throwable $e) { return false; }
    }

    if (!$roleId) return false;

    try {
        $col = 'can_' . preg_replace('/[^a-z]/', '', strtolower($action));
        $stmt = $db->prepare("SELECT $col FROM admin_permissions WHERE role_id = :rid AND resource = :res");
        $stmt->execute([':rid' => $roleId, ':res' => $resource]);
        $row = $stmt->fetch();
        return $row && (bool)($row[$col] ?? false);
    } catch (\Throwable $e) {
        return false;
    }
}

/**
 * Optional auth — returns payload or null (for public routes with optional admin features).
 */
function optionalAuth(): ?array {
    $headers    = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
        $payload = verifyJWT($matches[1]);
        return $payload ?: null;
    }
    return null;
}

/**
 * Require a valid customer JWT (storefront self-service auth — separate
 * from the admin requireAuth() above). Returns the decoded payload.
 * Uses its own rate-limit bucket ('customer_auth_verify') so a burst of
 * storefront traffic can never exhaust the admin 'auth_verify' counter
 * for the same IP.
 */
function requireCustomerAuth(): array {
    $headers    = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
        errorResponse('Authentication required', 401);
    }

    $isLocalHost = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1']);
    if (!$isLocalHost && function_exists('checkRateLimit') && function_exists('getClientIp')) {
        $ip = getClientIp();
        if (!checkRateLimit($ip, 'customer_auth_verify', 120, 60)) {
            errorResponse('Too many requests. Try again in a minute.', 429);
        }
    }

    $payload = verifyJWT($matches[1]);
    if (!$payload || ($payload['type'] ?? null) !== 'customer') {
        errorResponse('Authentication required', 401);
    }

    return $payload;
}

/**
 * Optional customer auth — returns the JWT payload or null. Used by
 * routes (like guest checkout) that behave differently for logged-in
 * customers vs guests without ever requiring a token.
 */
function optionalCustomerAuth(): ?array {
    $headers    = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
        $payload = verifyJWT($matches[1]);
        if ($payload && ($payload['type'] ?? null) === 'customer') {
            return $payload;
        }
    }
    return null;
}
