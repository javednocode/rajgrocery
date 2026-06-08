<?php
/**
 * White-label settings API.
 * Branding is stored in site_settings and seeded from white-label defaults.
 */

require_once __DIR__ . '/../helpers/branding.php';

function getSettings($db) {
    $group = $_GET['group'] ?? null;
    $cacheKey = 'settings_' . ($group ?: 'all');

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
