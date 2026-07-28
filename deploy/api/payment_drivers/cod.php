<?php
/**
 * Cash on Delivery (COD) Payment Driver
 * The simplest driver — no external API call, just validates the order.
 */

function initiate_cod(array $gw, array $data): array {
    $orderId = $data['order_id'] ?? null;
    if (!$orderId) throw new \RuntimeException('order_id required for COD');

    return [
        'gateway'      => 'cod',
        'order_id'     => $orderId,
        'payment_url'  => null,
        'session_id'   => 'cod_' . $orderId . '_' . time(),
        'verified'     => true, // COD is "verified" immediately
        'message'      => 'Order placed successfully. Pay on delivery.',
    ];
}

function verify_cod(array $gw, array $data): array {
    return [
        'gateway'    => 'cod',
        'verified'   => true,
        'payment_id' => 'cod_' . ($data['order_id'] ?? 'unknown'),
        'message'    => 'COD order confirmed',
    ];
}
