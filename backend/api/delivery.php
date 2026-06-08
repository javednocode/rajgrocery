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
    $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings WHERE setting_group = 'delivery' OR setting_key = 'currency_symbol'");
    $ds = [];
    foreach ($stmt->fetchAll() as $r) $ds[$r['setting_key']] = $r['setting_value'];

    $freeAbove         = (float)($ds['delivery_free_above']          ?? 50);
    $freeEnabled       = ($ds['delivery_free_enabled']               ?? '1') === '1';
    $localFee          = (float)($ds['delivery_local_fee']            ?? 2.95);
    $standardFee       = (float)($ds['delivery_standard_fee']         ?? 4.95);
    $smallOrderMin     = (float)($ds['delivery_small_order_min']     ?? 25);
    $smallOrderFee     = (float)($ds['delivery_small_order_fee']     ?? 1.50);
    $smallOrderEnabled = ($ds['delivery_small_order_enabled']        ?? '1') === '1';
    $localLabel        = $ds['delivery_local_zone_label']            ?? 'Local delivery';
    $standardLabel     = $ds['delivery_standard_zone_label']         ?? 'Standard delivery';
    $localKeywords     = array_filter(array_map('trim', explode(',', strtolower($ds['delivery_local_keywords'] ?? ''))));
    $localPrefixes     = array_filter(array_map('trim', explode(',', strtoupper($ds['delivery_local_postcode_prefixes'] ?? ''))));
    $currencySymbol    = $ds['currency_symbol'] ?? '$';

    // ── Zone detection ────────────────────────────────────────────────────────
    $isLocal = false;
    foreach ($localPrefixes as $prefix) {
        if ($prefix !== '' && str_starts_with($eircode, $prefix)) {
            $isLocal = true;
            break;
        }
    }
    if (!$isLocal) {
        foreach ($localKeywords as $keyword) {
            if ($keyword !== '' && (str_contains($city, $keyword) || str_contains($county, $keyword))) {
                $isLocal = true;
                break;
            }
        }
    }

    if (!empty($data['delivery_zone'])) {
        $zoneOverride = strtolower((string)$data['delivery_zone']);
        $isLocal = ($zoneOverride === 'local');
    }

    $zone = $isLocal ? 'local' : 'standard';

    // ── Calculate fee ─────────────────────────────────────────────────────────
    $shippingCharge = 0;
    $isFree         = false;
    $hasSmallFee    = false;
    $message        = '';
    $amountToFree   = 0;

    if ($isLocal) {
        if ($freeEnabled && $subtotal >= $freeAbove) {
            $shippingCharge = 0;
            $isFree = true;
            $message = '🎉 Free delivery unlocked!';
        } else {
            $shippingCharge = $localFee;
            if ($freeEnabled) {
                $amountToFree = round($freeAbove - $subtotal, 2);
                $message = "Add {$currencySymbol}{$amountToFree} more for free delivery";
            } else {
                $message = $localLabel;
            }
        }
    } else {
        $shippingCharge = $standardFee;
        if ($smallOrderEnabled && $subtotal < $smallOrderMin) {
            $shippingCharge += $smallOrderFee;
            $hasSmallFee = true;
            $message = 'Delivery + small order fee';
        } else {
            $message = $standardLabel;
        }
    }

    // ── Progress to free delivery ─────────────────────────────────────────────
    $progress = 0;
    if ($isLocal && $freeEnabled) {
        $progress = min(100, round(($subtotal / $freeAbove) * 100));
    }

    successResponse([
        'zone'            => $zone,
        'zone_label'      => $isLocal ? $localLabel : $standardLabel,
        'shipping_charge' => round($shippingCharge, 2),
        'is_free'         => $isFree,
        'has_small_fee'   => $hasSmallFee,
        'message'         => $message,
        'amount_to_free'  => $amountToFree,
        'progress'        => $progress,
        'settings'        => [
            'free_above'     => $freeAbove,
            'free_enabled'   => $freeEnabled,
            'local_fee'      => $localFee,
            'standard_fee'   => $standardFee,
            'small_order_min'=> $smallOrderMin,
            'small_order_fee'=> $smallOrderFee,
        ]
    ]);
}
