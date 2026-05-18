<?php
/**
 * Settings API
 */

function getSettings($db) {
    $group = $_GET['group'] ?? null;
    $sql = "SELECT setting_key, setting_value, setting_type, setting_group FROM site_settings";
    $params = [];
    if ($group) { $sql .= " WHERE setting_group = :group"; $params[':group'] = $group; }
    $stmt = $db->prepare($sql); $stmt->execute($params);
    $rows = $stmt->fetchAll();
    $settings = [];
    foreach ($rows as $row) { $settings[$row['setting_key']] = $row['setting_value']; }
    successResponse($settings);
}

function getSetting($db, $key) {
    $stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE setting_key = :key");
    $stmt->execute([':key' => $key]);
    $row = $stmt->fetch();
    if (!$row) errorResponse('Setting not found', 404);
    successResponse(['key' => $key, 'value' => $row['setting_value']]);
}

function updateSettings($db) {
    $data = getJsonInput();
    if (empty($data)) errorResponse('No settings provided', 400);
    $stmt = $db->prepare("UPDATE site_settings SET setting_value = :val WHERE setting_key = :key");
    foreach ($data as $key => $value) {
        $stmt->execute([':key' => $key, ':val' => $value]);
    }
    // Handle logo upload
    if (!empty($_FILES['site_logo']) && $_FILES['site_logo']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['site_logo'], 'branding');
        if ($r['success']) {
            $stmt->execute([':key' => 'site_logo', ':val' => $r['path']]);
        }
    }
    successResponse(null, 'Settings updated');
}
