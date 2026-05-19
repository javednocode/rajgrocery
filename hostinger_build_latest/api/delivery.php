<?php
/**
 * Delivery calculation API endpoint
 * POST /api/delivery/calculate
 * Body: { subtotal, eircode, city, county }
 * Returns: { zone, shipping_charge, is_free, message, breakdown }
 */

function calculateDeliveryFee($db) {
    $data = getJsonInput();

    $subtotal = (float)($data['subtotal'] ?? 0);
    $eircode  = strtoupper(trim($data['eircode'] ?? ''));
    $city     = strtolower(trim($data['city']    ?? ''));
    $county   = strtolower(trim($data['county']  ?? ''));

    // ── Load delivery settings ────────────────────────────────────────────────
    $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings WHERE setting_group = 'delivery'");
    $ds = [];
    foreach ($stmt->fetchAll() as $r) $ds[$r['setting_key']] = $r['setting_value'];

    $freeAbove         = (float)($ds['delivery_free_above']          ?? 50);
    $freeEnabled       = ($ds['delivery_free_enabled']               ?? '1') === '1';
    $corkCityFee       = (float)($ds['delivery_cork_city_fee']       ?? 2.95);
    $outsideCorkFee    = (float)($ds['delivery_outside_cork_fee']    ?? 4.95);
    $smallOrderMin     = (float)($ds['delivery_small_order_min']     ?? 25);
    $smallOrderFee     = (float)($ds['delivery_small_order_fee']     ?? 1.50);
    $smallOrderEnabled = ($ds['delivery_small_order_enabled']        ?? '1') === '1';

    // ── Zone detection ────────────────────────────────────────────────────────
    // Cork Eircode routing keys start with T (T12, T23, T34, T45, T56, T67, T8, T9)
    $isCorkCity = false;
    if ($eircode !== '') {
        $isCorkCity = (substr($eircode, 0, 1) === 'T');
    }
    if (!$isCorkCity) {
        $isCorkCity = (strpos($city, 'cork') !== false) || ($county === 'cork') || ($county === 'co. cork');
    }

    $zone = $isCorkCity ? 'cork_city' : 'outside_cork';

    // ── Calculate fee ─────────────────────────────────────────────────────────
    $shippingCharge = 0;
    $isFree         = false;
    $hasSmallFee    = false;
    $message        = '';
    $amountToFree   = 0;

    if ($isCorkCity) {
        if ($freeEnabled && $subtotal >= $freeAbove) {
            $shippingCharge = 0;
            $isFree = true;
            $message = '🎉 Free delivery unlocked!';
        } else {
            $shippingCharge = $corkCityFee;
            if ($freeEnabled) {
                $amountToFree = round($freeAbove - $subtotal, 2);
                $message = "Add €{$amountToFree} more for free delivery";
            } else {
                $message = 'Cork City delivery';
            }
        }
    } else {
        $shippingCharge = $outsideCorkFee;
        if ($smallOrderEnabled && $subtotal < $smallOrderMin) {
            $shippingCharge += $smallOrderFee;
            $hasSmallFee = true;
            $message = 'Delivery + small order fee';
        } else {
            $message = 'Outside Cork City delivery';
        }
    }

    // ── Progress to free delivery ─────────────────────────────────────────────
    $progress = 0;
    if ($isCorkCity && $freeEnabled) {
        $progress = min(100, round(($subtotal / $freeAbove) * 100));
    }

    successResponse([
        'zone'            => $zone,
        'zone_label'      => $isCorkCity ? 'Cork City' : 'Outside Cork',
        'shipping_charge' => round($shippingCharge, 2),
        'is_free'         => $isFree,
        'has_small_fee'   => $hasSmallFee,
        'message'         => $message,
        'amount_to_free'  => $amountToFree,
        'progress'        => $progress,
        'settings'        => [
            'free_above'     => $freeAbove,
            'free_enabled'   => $freeEnabled,
            'cork_city_fee'  => $corkCityFee,
            'outside_fee'    => $outsideCorkFee,
            'small_order_min'=> $smallOrderMin,
            'small_order_fee'=> $smallOrderFee,
        ]
    ]);
}
