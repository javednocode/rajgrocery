<?php
/**
 * White-label settings API.
 * Branding is stored in site_settings and seeded from white-label defaults.
 */

require_once __DIR__ . '/../helpers/branding.php';

function getSettings($db) {
    $group = $_GET['group'] ?? null;
    $cacheKey = 'settings_' . ($group ?: 'all');

    // Prevent Cloudflare/CDN/reverse-proxy from caching settings across domains.
    // Settings are domain-specific; shared CDN caching causes cross-brand bleed.
    header('Cache-Control: private, no-store');
    header('Vary: Host');

    if (function_exists('cacheGet')) {
        $cached = cacheGet($cacheKey);
        if ($cached !== null) {
            successResponse($cached);
            return;
        }
    }

    try {
        $settings = loadSiteSettings($db, $group ?: null);
    } catch (\Throwable $e) {
        errorResponse('Settings unavailable', 500);
    }

    $settings['_ts'] = time();

    if (function_exists('cacheSet')) {
        cacheSet($cacheKey, $settings, 600);
    }

    successResponse($settings);
}


function getSetting($db, $key) {
    try {
        $settings = loadSiteSettings($db);
    } catch (\Throwable $e) {
        errorResponse('Setting unavailable', 500);
    }

    if (!array_key_exists($key, $settings)) errorResponse('Setting not found', 404);
    successResponse(['key' => $key, 'value' => $settings[$key]]);
}

function updateSettings($db) {
    $data = !empty($_POST) ? $_POST : getJsonInput();

    if (empty($data) && empty($_FILES)) errorResponse('No settings provided', 400);

    seedDefaultSiteSettings($db);

    $upsert = $db->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_group)
        VALUES (:key, :val, :type, :grp)
        ON DUPLICATE KEY UPDATE
            setting_value = VALUES(setting_value),
            setting_type = VALUES(setting_type),
            setting_group = VALUES(setting_group)");

    $defaults = brandingDefaults();
    foreach ($data as $key => $value) {
        if (!is_string($key) || $key === '') continue;
        $type = $defaults[$key][1] ?? 'text';
        $group = brandingSettingGroup($key);
        try {
            $upsert->execute([
                ':key' => $key,
                ':val' => is_array($value) ? json_encode($value) : (string)$value,
                ':type' => $type,
                ':grp' => $group,
            ]);
        } catch (\Throwable $e) {
            error_log('Setting update skipped for ' . $key . ': ' . $e->getMessage());
        }
    }

    foreach (['site_logo', 'site_favicon'] as $fileKey) {
        if (empty($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) continue;
        $r = uploadImage($_FILES[$fileKey], 'branding');
        if (!empty($r['success'])) {
            $type = $defaults[$fileKey][1] ?? 'image';
            $group = brandingSettingGroup($fileKey);
            $upsert->execute([
                ':key' => $fileKey,
                ':val' => $r['path'],
                ':type' => $type,
                ':grp' => $group,
            ]);
        }
    }

    if (function_exists('cacheClearPattern')) {
        cacheClearPattern('settings_');
    }

    successResponse(null, 'Settings updated');
}

/**
 * Public Settings — no auth required.
 * Returns safe, public-facing configuration for the Angular frontend.
 * GET /api/settings/public
 */
function getPublicSettings(PDO $db): void {
    header('Cache-Control: private, no-store');

    try {
        // Load ALL settings from site_settings (no site_id column in this schema)
        $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $data = [];
        foreach ($rows as $row) {
            $data[$row['setting_key']] = $row['setting_value'];
        }

        // Resolve site_logo URL — prepend base URL if it's a relative path
        if (!empty($data['site_logo']) && !str_starts_with($data['site_logo'], 'http')) {
            $data['logo_url'] = $data['site_logo']; // alias for frontend compatibility
        }
        if (!empty($data['site_favicon']) && !str_starts_with($data['site_favicon'], 'http')) {
            $data['favicon_url'] = $data['site_favicon'];
        }

        // Map alternate key names the frontend uses
        if (!empty($data['currency_symbol'])) {
            $data['currency_symbol'] = $data['currency_symbol'];
        }

        // Fallback defaults for keys the frontend expects
        $defaults = [
            'site_name'          => 'Indian Market Grocery Store',
            'site_tagline'       => 'Premium South Asian groceries delivered.',
            'site_logo'          => '/logo.png',
            'logo_url'           => '/logo.png',
            'currency_symbol'    => '€',
            'shipping_free_above'=> '50',
            'hero_eyebrow'       => 'Premium Indian Grocery',
            'hero_title'         => 'Authentic Indian groceries, delivered fresh.',
            'hero_subtitle'      => 'Shop trusted brands, fresh staples, spices, rice, atta, lentils, snacks and more.',
        ];
        foreach ($defaults as $k => $v) {
            if (!isset($data[$k]) || $data[$k] === '') {
                $data[$k] = $v;
            }
        }

        successResponse($data);

    } catch (\Throwable $e) {
        error_log('getPublicSettings error: ' . $e->getMessage());
        // Return minimal defaults so the frontend still renders
        successResponse([
            'site_name'       => 'Indian Market Grocery Store',
            'site_logo'       => '/logo.png',
            'logo_url'        => '/logo.png',
            'currency_symbol' => '€',
        ]);
    }
}


