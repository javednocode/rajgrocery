<?php
/**
 * Stripe Payment Driver
 * Uses Stripe Checkout Sessions (no JS SDK required server-side).
 * Credentials from gateway config: { publishable_key, secret_key, webhook_secret }
 */

function initiate_stripe(array $gw, array $data): array {
    $config     = $gw['config'];
    $secretKey  = $config['secret_key'] ?? '';
    $isTestMode = (bool)($gw['is_test_mode'] ?? true);

    if (!$secretKey) throw new \RuntimeException('Stripe secret_key not configured');

    $amount   = (int)round((float)($data['amount'] ?? 0) * 100); // Stripe uses cents
    $currency = strtolower($data['currency'] ?? 'usd');
    $orderId  = $data['order_id'] ?? '';
    $returnUrl= rtrim($data['return_url'] ?? '', '/');

    $payload = http_build_query([
        'payment_method_types[]'      => 'card',
        'line_items[0][price_data][currency]'              => $currency,
        'line_items[0][price_data][product_data][name]'   => 'Order #' . $orderId,
        'line_items[0][price_data][unit_amount]'           => $amount,
        'line_items[0][quantity]'                          => 1,
        'mode'                        => 'payment',
        'success_url'                 => $returnUrl . '?status=success&session_id={CHECKOUT_SESSION_ID}&order_id=' . $orderId,
        'cancel_url'                  => $returnUrl . '?status=cancelled&order_id=' . $orderId,
        'metadata[order_id]'          => $orderId,
        'customer_email'              => $data['customer_email'] ?? '',
    ]);

    $ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_USERPWD        => $secretKey . ':',
        CURLOPT_TIMEOUT        => 15,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);
    if ($httpCode !== 200) throw new \RuntimeException($result['error']['message'] ?? 'Stripe error');

    return [
        'gateway'    => 'stripe',
        'session_id' => $result['id'],
        'payment_url'=> $result['url'],
        'test_mode'  => $isTestMode,
    ];
}

function verify_stripe(array $gw, array $data): array {
    $config        = $gw['config'];
    $secretKey     = $config['secret_key'] ?? '';
    $webhookSecret = $config['webhook_secret'] ?? '';
    $sessionId     = $data['session_id'] ?? '';

    if (!$secretKey) throw new \RuntimeException('Stripe secret_key not configured');

    // Verify via Checkout Session retrieve
    $ch = curl_init("https://api.stripe.com/v1/checkout/sessions/{$sessionId}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD        => $secretKey . ':',
        CURLOPT_TIMEOUT        => 10,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $session = json_decode($response, true);
    if ($httpCode !== 200) throw new \RuntimeException('Stripe session not found');

    $verified = ($session['payment_status'] ?? '') === 'paid';

    return [
        'gateway'    => 'stripe',
        'verified'   => $verified,
        'payment_id' => $session['payment_intent'] ?? $sessionId,
        'status'     => $session['payment_status'] ?? 'unknown',
        'amount'     => ($session['amount_total'] ?? 0) / 100,
        'currency'   => $session['currency'] ?? '',
    ];
}
