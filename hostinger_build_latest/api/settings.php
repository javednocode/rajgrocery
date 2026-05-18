<?php
/**
 * Settings API — MySQL compatible
 */

// ── Auto-seed contact settings if not present ─────────────────────────────
function seedContactSettings($db) {
    $defaults = [
        ['contact_email',     'info@asianfoodcork.ie',              'text',     'contact'],
        ['contact_address',   '123 Patrick Street, Cork, Ireland',  'text',     'contact'],
        ['contact_hours',     'Mon–Sun: 9am – 9pm',                 'textarea', 'contact'],
        ['contact_map_embed', '',                                    'textarea', 'contact'],
    ];
    // MySQL-compatible INSERT IGNORE
    $stmt = $db->prepare("INSERT IGNORE INTO site_settings
        (setting_key, setting_value, setting_type, setting_group)
        VALUES (:key, :val, :type, :grp)");
    foreach ($defaults as $d) {
        try {
            $stmt->execute([':key'=>$d[0],':val'=>$d[1],':type'=>$d[2],':grp'=>$d[3]]);
        } catch (\Exception $e) { /* ignore */ }
    }
}

function getSettings($db) {
    try {
        seedContactSettings($db);
    } catch (\Exception $e) { /* non-fatal */ }

    $group  = $_GET['group'] ?? null;
    $sql    = "SELECT setting_key, setting_value, setting_type, setting_group FROM site_settings";
    $params = [];
    if ($group) { $sql .= " WHERE setting_group = :group"; $params[':group'] = $group; }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
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
    // Support both JSON body and multipart FormData (for logo uploads)
    $data = !empty($_POST) ? $_POST : getJsonInput();

    if (empty($data) && empty($_FILES)) errorResponse('No settings provided', 400);

    // MySQL-compatible upsert: INSERT ... ON DUPLICATE KEY UPDATE
    $upsert = $db->prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group)
        VALUES (:key, :val, 'general')
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");

    if (!empty($data)) {
        foreach ($data as $key => $value) {
            if (is_string($key) && $key !== '') {
                try {
                    $upsert->execute([':key' => $key, ':val' => $value]);
                } catch (\Exception $e) { /* skip bad keys */ }
            }
        }
    }

    // Handle logo upload
    if (!empty($_FILES['site_logo']) && $_FILES['site_logo']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['site_logo'], 'branding');
        if ($r['success']) {
            $upsert->execute([':key' => 'site_logo', ':val' => $r['path']]);
        }
    }

    // Handle favicon upload
    if (!empty($_FILES['site_favicon']) && $_FILES['site_favicon']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['site_favicon'], 'branding');
        if ($r['success']) {
            $upsert->execute([':key' => 'site_favicon', ':val' => $r['path']]);
        }
    }

    successResponse(null, 'Settings updated');
}
