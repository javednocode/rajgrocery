<?php
/**
 * Shipping Zones & Rates API
 *
 * GET    /api/shipping/zones              — list all zones with rates
 * POST   /api/shipping/zones              — create zone
 * PUT    /api/shipping/zones/{id}         — update zone
 * DELETE /api/shipping/zones/{id}         — delete zone
 *
 * GET    /api/shipping/zones/{id}/rates   — list rates for zone
 * POST   /api/shipping/zones/{id}/rates   — add rate
 * PUT    /api/shipping/rates/{rateId}     — update rate
 * DELETE /api/shipping/rates/{rateId}     — delete rate
 *
 * POST   /api/shipping/calculate          — calculate shipping for cart
 */

// ─── ZONES ────────────────────────────────────────────────────────────────────

function getShippingZones(PDO $db): void {
    $siteId   = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $cacheKey = "shipping_zones_{$siteId}";

    if (function_exists('cacheGet') && ($cached = cacheGet($cacheKey)) !== null) {
        successResponse($cached); return;
    }

    $stmt = $db->prepare("SELECT z.*, COUNT(r.id) AS rate_count
        FROM shipping_zones z
        LEFT JOIN shipping_rates r ON r.zone_id = z.id AND r.is_active = 1
        WHERE z.site_id = :s
        GROUP BY z.id ORDER BY z.sort_order, z.name");
    $stmt->execute([':s' => $siteId]);
    $zones = $stmt->fetchAll();

    foreach ($zones as &$zone) {
        $rStmt = $db->prepare("SELECT * FROM shipping_rates WHERE zone_id = :zid ORDER BY sort_order");
        $rStmt->execute([':zid' => $zone['id']]);
        $zone['rates'] = $rStmt->fetchAll();

        $pStmt = $db->prepare("SELECT * FROM shipping_zone_postcodes WHERE zone_id = :zid");
        $pStmt->execute([':zid' => $zone['id']]);
        $zone['postcodes'] = $pStmt->fetchAll();
    }

    if (function_exists('cacheSet')) cacheSet($cacheKey, $zones, 600);
    successResponse($zones);
}

function createShippingZone(PDO $db): void {
    $data   = getJsonInput();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $name   = trim($data['name'] ?? '');
    if (!$name) errorResponse('Zone name required', 400);

    $db->prepare("INSERT INTO shipping_zones (site_id, name, description, countries, is_default, is_active, sort_order)
        VALUES (:s, :n, :d, :c, :def, 1, :so)")
       ->execute([
           ':s'   => $siteId,
           ':n'   => $name,
           ':d'   => $data['description'] ?? null,
           ':c'   => isset($data['countries']) ? json_encode($data['countries']) : '["*"]',
           ':def' => (int)($data['is_default'] ?? 0),
           ':so'  => (int)($data['sort_order'] ?? 0),
       ]);

    $zoneId = (int)$db->lastInsertId();
    _syncZonePostcodes($db, $zoneId, $data['postcodes'] ?? []);
    _clearShippingCache($siteId);

    successResponse(['id' => $zoneId], 'Shipping zone created', 201);
}

function updateShippingZone(PDO $db, int $zoneId): void {
    $data   = getJsonInput();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    $fields = []; $params = [':id' => $zoneId, ':s' => $siteId];
    if (isset($data['name']))        { $fields[] = 'name = :n';  $params[':n'] = $data['name']; }
    if (isset($data['description'])) { $fields[] = 'description = :d'; $params[':d'] = $data['description']; }
    if (isset($data['countries']))   { $fields[] = 'countries = :c';   $params[':c'] = json_encode($data['countries']); }
    if (isset($data['is_default']))  { $fields[] = 'is_default = :def'; $params[':def'] = (int)$data['is_default']; }
    if (isset($data['is_active']))   { $fields[] = 'is_active = :ia';  $params[':ia'] = (int)$data['is_active']; }
    if (isset($data['sort_order']))  { $fields[] = 'sort_order = :so'; $params[':so'] = (int)$data['sort_order']; }

    if ($fields) {
        $db->prepare("UPDATE shipping_zones SET " . implode(', ', $fields) . " WHERE id = :id AND site_id = :s")->execute($params);
    }

    if (isset($data['postcodes'])) _syncZonePostcodes($db, $zoneId, $data['postcodes']);
    _clearShippingCache($siteId);
    successResponse(null, 'Zone updated');
}

function deleteShippingZone(PDO $db, int $zoneId): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $chk    = $db->prepare("SELECT is_default FROM shipping_zones WHERE id = :id AND site_id = :s");
    $chk->execute([':id' => $zoneId, ':s' => $siteId]);
    $zone   = $chk->fetch();
    if (!$zone) errorResponse('Zone not found', 404);
    if ($zone['is_default']) errorResponse('Cannot delete the default shipping zone', 409);

    $db->prepare("DELETE FROM shipping_zones WHERE id = :id AND site_id = :s")->execute([':id' => $zoneId, ':s' => $siteId]);
    _clearShippingCache($siteId);
    successResponse(null, 'Zone deleted');
}

// ─── RATES ────────────────────────────────────────────────────────────────────

function getZoneRates(PDO $db, int $zoneId): void {
    $stmt = $db->prepare("SELECT * FROM shipping_rates WHERE zone_id = :zid ORDER BY sort_order");
    $stmt->execute([':zid' => $zoneId]);
    successResponse($stmt->fetchAll());
}

function createShippingRate(PDO $db, int $zoneId): void {
    $data   = getJsonInput();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $name   = trim($data['name'] ?? '');
    if (!$name) errorResponse('Rate name required', 400);

    $methods = ['flat','weight','free','local','free_above'];
    $method  = in_array($data['method'] ?? '', $methods) ? $data['method'] : 'flat';

    $db->prepare("INSERT INTO shipping_rates
        (zone_id, site_id, name, method, rate, rate_per_kg, free_above_amount,
         min_weight_g, max_weight_g, min_order, max_order,
         estimated_days_min, estimated_days_max, is_active, sort_order)
        VALUES (:zid, :s, :n, :m, :r, :rpkg, :fa, :minw, :maxw, :mino, :maxo, :emin, :emax, 1, :so)")
       ->execute([
           ':zid'  => $zoneId,      ':s'    => $siteId,
           ':n'    => $name,        ':m'    => $method,
           ':r'    => (float)($data['rate'] ?? 0),
           ':rpkg' => (float)($data['rate_per_kg'] ?? 0),
           ':fa'   => isset($data['free_above_amount']) ? (float)$data['free_above_amount'] : null,
           ':minw' => isset($data['min_weight_g']) ? (int)$data['min_weight_g'] : null,
           ':maxw' => isset($data['max_weight_g']) ? (int)$data['max_weight_g'] : null,
           ':mino' => (float)($data['min_order'] ?? 0),
           ':maxo' => isset($data['max_order']) ? (float)$data['max_order'] : null,
           ':emin' => (int)($data['estimated_days_min'] ?? 1),
           ':emax' => (int)($data['estimated_days_max'] ?? 5),
           ':so'   => (int)($data['sort_order'] ?? 0),
       ]);

    _clearShippingCache($siteId);
    successResponse(['id' => (int)$db->lastInsertId()], 'Rate created', 201);
}

function updateShippingRate(PDO $db, int $rateId): void {
    $data   = getJsonInput();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $fields = []; $params = [':id' => $rateId];

    $colMap = ['name' => ':n', 'method' => ':m', 'rate' => ':r', 'rate_per_kg' => ':rpkg',
               'free_above_amount' => ':fa', 'min_weight_g' => ':minw', 'max_weight_g' => ':maxw',
               'min_order' => ':mino', 'max_order' => ':maxo', 'is_active' => ':ia',
               'estimated_days_min' => ':emin', 'estimated_days_max' => ':emax'];

    foreach ($colMap as $col => $ph) {
        if (array_key_exists($col, $data)) {
            $fields[] = "$col = $ph";
            $params[$ph] = is_numeric($data[$col]) ? ($data[$col] + 0) : $data[$col];
        }
    }

    if ($fields) $db->prepare("UPDATE shipping_rates SET " . implode(', ', $fields) . " WHERE id = :id")->execute($params);
    _clearShippingCache($siteId);
    successResponse(null, 'Rate updated');
}

function deleteShippingRate(PDO $db, int $rateId): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $db->prepare("DELETE FROM shipping_rates WHERE id = :id")->execute([':id' => $rateId]);
    _clearShippingCache($siteId);
    successResponse(null, 'Rate deleted');
}

// ─── CALCULATE SHIPPING ───────────────────────────────────────────────────────

/**
 * Calculate shipping cost for a cart.
 * Input: { postcode, country, subtotal, weight_g, items: [...] }
 * Output: array of available shipping options sorted by price
 */
function calculateShippingOptions(PDO $db): void {
    $data     = getJsonInput() ?: $_GET;
    $siteId   = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $postcode = strtoupper(trim($data['postcode'] ?? ''));
    $country  = strtoupper(trim($data['country']  ?? 'GB'));
    $subtotal = (float)($data['subtotal'] ?? 0);
    $weightG  = (int)($data['weight_g']  ?? 0);

    // Find matching zone by postcode or country
    $zones = _resolveZonesForAddress($db, $siteId, $postcode, $country);

    if (empty($zones)) {
        // Fall back to default zone
        $defStmt = $db->prepare("SELECT id FROM shipping_zones WHERE site_id = :s AND is_default = 1 LIMIT 1");
        $defStmt->execute([':s' => $siteId]);
        $def = $defStmt->fetch();
        $zones = $def ? [$def['id']] : [];
    }

    if (empty($zones)) {
        successResponse([]); return;
    }

    $placeholders = implode(',', array_fill(0, count($zones), '?'));
    $rStmt = $db->prepare("SELECT r.*, z.name AS zone_name
        FROM shipping_rates r
        JOIN shipping_zones z ON z.id = r.zone_id
        WHERE r.zone_id IN ($placeholders)
          AND r.is_active = 1
          AND r.min_order <= ?
          AND (r.max_order IS NULL OR r.max_order >= ?)
          AND (r.min_weight_g IS NULL OR r.min_weight_g <= ?)
          AND (r.max_weight_g IS NULL OR r.max_weight_g >= ?)
        ORDER BY r.sort_order, r.rate");
    $rStmt->execute([...$zones, $subtotal, $subtotal, $weightG, $weightG]);
    $rates = $rStmt->fetchAll();

    $options = [];
    foreach ($rates as $rate) {
        $cost = _calcRateCost($rate, $subtotal, $weightG);
        if ($cost === null) continue; // Condition not met

        $options[] = [
            'id'             => $rate['id'],
            'name'           => $rate['name'],
            'method'         => $rate['method'],
            'cost'           => $cost,
            'is_free'        => $cost == 0,
            'estimated_days' => $rate['estimated_days_min'] === $rate['estimated_days_max']
                ? "{$rate['estimated_days_min']} days"
                : "{$rate['estimated_days_min']}–{$rate['estimated_days_max']} days",
        ];
    }

    // Sort: free first, then cheapest
    usort($options, fn($a, $b) => $a['cost'] <=> $b['cost']);
    successResponse($options);
}

// ─── PRIVATE HELPERS ──────────────────────────────────────────────────────────

function _calcRateCost(array $rate, float $subtotal, int $weightG): ?float {
    return match($rate['method']) {
        'free'       => 0.0,
        'free_above' => $subtotal >= ($rate['free_above_amount'] ?? 0) ? 0.0 : (float)$rate['rate'],
        'flat'       => (float)$rate['rate'],
        'weight'     => (float)$rate['rate'] + (($weightG / 1000) * (float)$rate['rate_per_kg']),
        'local'      => (float)$rate['rate'],
        default      => (float)$rate['rate'],
    };
}

function _resolveZonesForAddress(PDO $db, int $siteId, string $postcode, string $country): array {
    $zones = [];

    if ($postcode) {
        // Match postcode prefix or exact
        $stmt = $db->prepare("SELECT DISTINCT szp.zone_id
            FROM shipping_zone_postcodes szp
            JOIN shipping_zones sz ON sz.id = szp.zone_id
            WHERE sz.site_id = :s AND sz.is_active = 1
              AND (
                (szp.match_type = 'exact'  AND szp.postcode = :pc)
                OR (szp.match_type = 'prefix' AND :pc2 LIKE CONCAT(szp.postcode, '%'))
              )
            ORDER BY LENGTH(szp.postcode) DESC");
        $stmt->execute([':s' => $siteId, ':pc' => $postcode, ':pc2' => $postcode]);
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $zones = array_merge($zones, $rows);
    }

    if ($country && empty($zones)) {
        // Match country code in JSON array
        $stmt = $db->prepare("SELECT id FROM shipping_zones
            WHERE site_id = :s AND is_active = 1
              AND (JSON_CONTAINS(countries, :cc) OR JSON_CONTAINS(countries, '\"*\"'))
            ORDER BY is_default ASC");
        $stmt->execute([':s' => $siteId, ':cc' => json_encode($country)]);
        $zones = array_merge($zones, $stmt->fetchAll(PDO::FETCH_COLUMN));
    }

    return array_unique(array_filter($zones));
}

function _syncZonePostcodes(PDO $db, int $zoneId, array $postcodes): void {
    $db->prepare("DELETE FROM shipping_zone_postcodes WHERE zone_id = :zid")->execute([':zid' => $zoneId]);
    if (!empty($postcodes)) {
        $ins = $db->prepare("INSERT INTO shipping_zone_postcodes (zone_id, postcode, match_type) VALUES (:zid, :pc, :mt)");
        foreach ($postcodes as $pc) {
            $code = strtoupper(trim(is_array($pc) ? ($pc['postcode'] ?? '') : $pc));
            if ($code) {
                $ins->execute([':zid' => $zoneId, ':pc' => $code, ':mt' => (is_array($pc) && isset($pc['match_type'])) ? $pc['match_type'] : 'prefix']);
            }
        }
    }
}

function _clearShippingCache(int $siteId): void {
    if (function_exists('cacheClearPattern')) cacheClearPattern("shipping_zones_{$siteId}");
}
