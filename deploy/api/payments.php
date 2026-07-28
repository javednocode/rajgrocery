<?php
/**
 * Pluggable Payment Engine
 * No gateway is hardcoded. All gateways are loaded dynamically from DB config.
 *
 * GET  /api/payments/gateways          — list enabled gateways (public)
 * POST /api/payments/initiate          — start payment session
 * POST /api/payments/verify            — verify payment (webhook-safe)
 * GET  /api/payments/gateways/all      — list all gateways with config (admin only)
 * PUT  /api/payments/gateways/{key}    — update gateway config (admin only)
 */

// ─── GATEWAY REGISTRY ─────────────────────────────────────────────────────────

/**
 * Load all available payment driver files.
 * Drivers are PHP files in backend/api/payment_drivers/
 */
function loadPaymentDrivers(): void {
    $driversDir = __DIR__ . '/payment_drivers/';
    if (is_dir($driversDir)) {
        foreach (glob($driversDir . '*.php') as $driver) {
            require_once $driver;
        }
    }
}

/**
 * Get a gateway config from DB for the current site.
 */
function getGatewayConfig(PDO $db, string $gatewayKey): ?array {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $stmt   = $db->prepare("SELECT * FROM payment_gateways WHERE gateway_key = :k AND site_id = :s");
    $stmt->execute([':k' => $gatewayKey, ':s' => $siteId]);
    $row = $stmt->fetch();
    if (!$row) return null;

    $config = json_decode($row['config'] ?? '{}', true) ?: [];
    return array_merge($row, ['config' => $config]);
}

// ─── PUBLIC ENDPOINTS ─────────────────────────────────────────────────────────

function getEnabledGateways(PDO $db): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $stmt   = $db->prepare("SELECT gateway_key, display_name, is_test_mode, sort_order
        FROM payment_gateways WHERE site_id = :s AND is_enabled = 1 ORDER BY sort_order");
    $stmt->execute([':s' => $siteId]);
    successResponse($stmt->fetchAll());
}

/**
 * Initiate a payment session.
 * Input: { gateway_key, order_id, amount, currency, customer_email, customer_name, return_url }
 * Output: { session_id, payment_url, gateway_response } — gateway-specific
 */
function initiatePayment(PDO $db): void {
    $data = getJsonInput();
    $key  = $data['gateway_key'] ?? '';
    if (!$key) errorResponse('gateway_key required', 400);

    $gw = getGatewayConfig($db, $key);
    if (!$gw || !$gw['is_enabled']) errorResponse("Gateway '{$key}' is not enabled", 400);

    loadPaymentDrivers();

    $driverFn = "initiate_{$key}";
    if (!function_exists($driverFn)) {
        errorResponse("Payment driver for '{$key}' not found", 500);
    }

    try {
        $result = $driverFn($gw, $data);
        successResponse($result);
    } catch (\Throwable $e) {
        errorResponse('Payment initiation failed: ' . $e->getMessage(), 500);
    }
}

/**
 * Verify / confirm a payment.
 * Used after redirect or webhook notification.
 * Input: { gateway_key, payment_id, order_id, signature, ... }
 */
function verifyPayment(PDO $db): void {
    $data = getJsonInput();
    $key  = $data['gateway_key'] ?? '';

    $gw = getGatewayConfig($db, $key);
    if (!$gw) errorResponse("Unknown gateway '{$key}'", 400);

    loadPaymentDrivers();

    $driverFn = "verify_{$key}";
    if (!function_exists($driverFn)) {
        errorResponse("Verify driver for '{$key}' not found", 500);
    }

    try {
        $result = $driverFn($gw, $data);
        if ($result['verified'] ?? false) {
            // Update order payment status
            $orderId = $data['order_id'] ?? null;
            if ($orderId) {
                $db->prepare("UPDATE orders SET payment_status = 'paid', payment_ref = :ref WHERE id = :id")
                   ->execute([':ref' => $result['payment_id'] ?? null, ':id' => $orderId]);
            }
        }
        successResponse($result);
    } catch (\Throwable $e) {
        errorResponse('Payment verification failed: ' . $e->getMessage(), 500);
    }
}

// ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────────

function getAllGatewaysAdmin(PDO $db): void {
    requireAuth();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $stmt   = $db->prepare("SELECT * FROM payment_gateways WHERE site_id = :s ORDER BY sort_order");
    $stmt->execute([':s' => $siteId]);
    $gateways = $stmt->fetchAll();

    // Mask sensitive keys for display
    foreach ($gateways as &$gw) {
        $config = json_decode($gw['config'] ?? '{}', true) ?: [];
        foreach (['secret_key', 'webhook_secret', 'private_key', 'client_secret'] as $sensitiveKey) {
            if (isset($config[$sensitiveKey]) && strlen($config[$sensitiveKey]) > 4) {
                $config[$sensitiveKey] = '••••' . substr($config[$sensitiveKey], -4);
            }
        }
        $gw['config'] = $config;
    }

    successResponse($gateways);
}

function updateGatewayConfig(PDO $db, string $gatewayKey): void {
    $admin  = requireAuth();
    $data   = getJsonInput();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    $gw = getGatewayConfig($db, $gatewayKey);
    if (!$gw) errorResponse("Gateway '{$gatewayKey}' not found", 404);

    // Merge new config values into existing (preserves existing secrets if not provided)
    $existingConfig = $gw['config'];
    $newConfig      = $data['config'] ?? [];

    // Remove masked values (don't overwrite real values with masks)
    foreach ($newConfig as $k => $v) {
        if (is_string($v) && str_starts_with($v, '••••')) unset($newConfig[$k]);
    }
    $mergedConfig = array_merge($existingConfig, $newConfig);

    $db->prepare("UPDATE payment_gateways
        SET is_enabled = :enabled, is_test_mode = :test, display_name = :name, config = :cfg, sort_order = :so
        WHERE gateway_key = :k AND site_id = :s")
       ->execute([
           ':enabled' => (int)($data['is_enabled'] ?? $gw['is_enabled']),
           ':test'    => (int)($data['is_test_mode'] ?? $gw['is_test_mode']),
           ':name'    => $data['display_name'] ?? $gw['display_name'],
           ':cfg'     => json_encode($mergedConfig),
           ':so'      => (int)($data['sort_order'] ?? $gw['sort_order']),
           ':k'       => $gatewayKey,
           ':s'       => $siteId,
       ]);

    if (function_exists('addAuditLog')) {
        addAuditLog($db, 'UPDATE', 'payment_gateway', $gatewayKey, null,
            ['is_enabled' => $data['is_enabled'] ?? null, 'is_test_mode' => $data['is_test_mode'] ?? null],
            $admin
        );
    }

    successResponse(null, 'Gateway configuration updated');
}
