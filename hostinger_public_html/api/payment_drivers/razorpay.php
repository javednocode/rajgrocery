<?php
/**
 * Razorpay Payment Driver
 * Creates an order and returns order_id for frontend Razorpay checkout.
 * Credentials from gateway config: { key_id, key_secret, webhook_secret }
 */

function initiate_razorpay(array $gw, array $data): array {
    $config    = $gw['config'];
    $keyId     = $config['key_id']     ?? '';
    $keySecret = $config['key_secret'] ?? '';

    if (!$keyId || !$keySecret) throw new \RuntimeException('Razorpay key_id and key_secret required');

    $amount   = (int)round((float)($data['amount'] ?? 0) * 100); // Razorpay uses paise
    $currency = strtoupper($data['currency'] ?? 'INR');
    $orderId  = $data['order_id'] ?? '';

    $payload = json_encode([
        'amount'          => $amount,
        'currency'        => $currency,
        'receipt'         => 'order_' . $orderId,
        'notes'           => ['store_order_id' => $orderId],
        'payment_capture' => 1,
    ]);

    $ch = curl_init('https://api.razorpay.com/v1/orders');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_USERPWD        => $keyId . ':' . $keySecret,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 15,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);
    if ($httpCode !== 200) throw new \RuntimeException($result['error']['description'] ?? 'Razorpay error');

    return [
        'gateway'          => 'razorpay',
        'razorpay_order_id'=> $result['id'],
        'key_id'           => $keyId, // Safe to send to frontend
        'amount'           => $amount,
        'currency'         => $currency,
        'test_mode'        => (bool)($gw['is_test_mode'] ?? true),
    ];
}

function verify_razorpay(array $gw, array $data): array {
    $config    = $gw['config'];
    $keySecret = $config['key_secret'] ?? '';

    $razorpayPaymentId = $data['razorpay_payment_id'] ?? '';
    $razorpayOrderId   = $data['razorpay_order_id']   ?? '';
    $razorpaySignature = $data['razorpay_signature']   ?? '';

    if (!$keySecret) throw new \RuntimeException('Razorpay key_secret not configured');

    // Verify signature
    $expected = hash_hmac('sha256', $razorpayOrderId . '|' . $razorpayPaymentId, $keySecret);
    $verified  = hash_equals($expected, $razorpaySignature);

    return [
        'gateway'    => 'razorpay',
        'verified'   => $verified,
        'payment_id' => $razorpayPaymentId,
        'message'    => $verified ? 'Payment verified' : 'Signature verification failed',
    ];
}
