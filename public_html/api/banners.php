<?php
/**
 * Banners API — hero slider with desktop + mobile images AND video support
 * OPTIMIZED: SHOW COLUMNS replaced with static flag — runs at most once per process
 */

// ── Run schema migration only once per PHP process (static flag) ─────────────
function ensureVideoBannerColumns($db) {
    static $migrated = false;
    if ($migrated) return; // Already ran this request — skip

    // Check file cache before doing DB query
    if (function_exists('cacheGet') && cacheGet('banner_schema_v2') === '1') {
        $migrated = true;
        return; // Schema already applied
    }

    // Check a lightweight settings flag before doing SHOW COLUMNS
    try {
        $flag = $db->query("SELECT setting_value FROM site_settings WHERE setting_key = 'banner_schema_v2' LIMIT 1")->fetchColumn();
        if ($flag === '1') {
            if (function_exists('cacheSet')) cacheSet('banner_schema_v2', '1', 86400 * 30);
            $migrated = true;
            return; // Schema already applied
        }
    } catch (Exception $e) { /* site_settings may not exist yet */ }

    // Only run SHOW COLUMNS if flag not set
    try {
        $existing = $db->query("SHOW COLUMNS FROM banners")->fetchAll(PDO::FETCH_COLUMN);
        if (!in_array('media_type', $existing)) {
            $db->exec("ALTER TABLE banners ADD COLUMN media_type ENUM('image','video') NOT NULL DEFAULT 'image' AFTER mobile_image");
        }
        if (!in_array('video', $existing)) {
            $db->exec("ALTER TABLE banners ADD COLUMN video VARCHAR(500) DEFAULT NULL AFTER media_type");
        }
        if (!in_array('mobile_video', $existing)) {
            $db->exec("ALTER TABLE banners ADD COLUMN mobile_video VARCHAR(500) DEFAULT NULL AFTER video");
        }
        if (!in_array('fallback_image', $existing)) {
            $db->exec("ALTER TABLE banners ADD COLUMN fallback_image VARCHAR(255) DEFAULT NULL AFTER mobile_video");
        }
        if (!in_array('button_color', $existing)) {
            $db->exec("ALTER TABLE banners ADD COLUMN button_color VARCHAR(30) DEFAULT '#e06400' AFTER button_text");
        }
        // Mark as done in site_settings so future requests skip SHOW COLUMNS
        try {
            $db->exec("INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('banner_schema_v2', '1', 'system')
                       ON DUPLICATE KEY UPDATE setting_value = '1'");
        } catch (Exception $e) { /* ignore */ }
    } catch (Exception $e) { /* ignore */ }

    $migrated = true;
}

function getBanners($db) {
    ensureVideoBannerColumns($db);
    $position = $_GET['position'] ?? 'hero';
    $all      = isset($_GET['all']) && $_GET['all'] == 1;

    $sql    = "SELECT * FROM banners";
    $params = [];

    if (!$all) {
        $sql .= " WHERE is_active = 1 AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW())";
    }

    if ($position && !$all) {
        $sql .= " AND position = :pos";
        $params[':pos'] = $position;
    }

    $sql .= " ORDER BY sort_order ASC, id ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    successResponse($stmt->fetchAll());
}

function getBannerById($db, $id) {
    ensureVideoBannerColumns($db);
    $stmt = $db->prepare("SELECT * FROM banners WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $b = $stmt->fetch();
    if (!$b) errorResponse('Banner not found', 404);
    successResponse($b);
}

function getVideoUploadError($file) {
    $code = $file['error'] ?? UPLOAD_ERR_NO_FILE;
    $messages = [
        UPLOAD_ERR_INI_SIZE   => 'Video exceeds the server upload limit',
        UPLOAD_ERR_FORM_SIZE  => 'Video exceeds the form upload limit',
        UPLOAD_ERR_PARTIAL    => 'Video upload was interrupted. Please try again',
        UPLOAD_ERR_NO_TMP_DIR => 'Server upload folder is unavailable',
        UPLOAD_ERR_CANT_WRITE => 'Server could not save the video',
        UPLOAD_ERR_EXTENSION  => 'Server rejected the video upload',
    ];

    return $messages[$code] ?? 'Video upload failed';
}

function uploadBannerVideo($field) {
    if (!isset($_FILES[$field]) || ($_FILES[$field]['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        errorResponse(getVideoUploadError($_FILES[$field]), 400);
    }

    $result = uploadVideo($_FILES[$field], 'banners/videos');
    if (!$result['success']) {
        errorResponse($result['message'] ?? 'Video upload failed', 400);
    }

    return $result['path'];
}


function createBanner($db) {
    ensureVideoBannerColumns($db);
    $data = $_POST;

    // ── Method override: POST acting as PUT ──────────────────────
    if (!empty($data['_method']) && strtoupper($data['_method']) === 'PUT') {
        $id = (int)($data['banner_id'] ?? 0);
        if (!$id) errorResponse('Banner ID missing for update', 400);
        updateBannerPost($db, $id, $data);
        return;
    }

    $mediaType = $data['media_type'] ?? 'image';

    // ── IMAGE mode ───────────────────────────────────────────────
    $image = null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'banners');
        if ($r['success']) $image = $r['path'];
    }
    $mobileImage = null;
    if (!empty($_FILES['mobile_image']) && $_FILES['mobile_image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['mobile_image'], 'banners');
        if ($r['success']) $mobileImage = $r['path'];
    }

    // ── VIDEO mode ───────────────────────────────────────────────
    $video = uploadBannerVideo('video');
    $mobileVideo = uploadBannerVideo('mobile_video');
    $fallbackImage = null;
    if (!empty($_FILES['fallback_image']) && $_FILES['fallback_image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['fallback_image'], 'banners');
        if ($r['success']) $fallbackImage = $r['path'];
    }

    // Validation
    if ($mediaType === 'image' && !$image && empty($data['image'])) {
        errorResponse('Banner desktop image is required', 400);
    }
    if ($mediaType === 'video' && !$video) {
        errorResponse('Desktop video is required for video banners', 400);
    }

    $stmt = $db->prepare("INSERT INTO banners
        (title, subtitle, image, mobile_image, media_type, video, mobile_video, fallback_image,
         link, button_text, button_color, position, sort_order, is_active, starts_at, ends_at)
        VALUES (:title,:sub,:img,:mobile,:mtype,:vid,:mobvid,:fallback,:link,:btn,:btncolor,:pos,:sort,:active,:starts,:ends)");
    $stmt->execute([
        ':title'    => $data['title']        ?? null,
        ':sub'      => $data['subtitle']     ?? null,
        ':img'      => $image ?? ($data['image'] ?? ''),
        ':mobile'   => $mobileImage,
        ':mtype'    => $mediaType,
        ':vid'      => $video,
        ':mobvid'   => $mobileVideo,
        ':fallback' => $fallbackImage,
        ':link'     => $data['link']         ?? null,
        ':btn'      => $data['button_text']  ?? 'Shop Now',
        ':btncolor' => $data['button_color'] ?? '#e06400',
        ':pos'      => $data['position']     ?? 'hero',
        ':sort'     => (int)($data['sort_order'] ?? 0),
        ':active'   => (int)($data['is_active']  ?? 1),
        ':starts'   => !empty($data['starts_at']) ? $data['starts_at'] : null,
        ':ends'     => !empty($data['ends_at'])   ? $data['ends_at']   : null,
    ]);
    successResponse(['id' => $db->lastInsertId()], 'Banner created', 201);
}

// Called internally by createBanner when _method=PUT is present
function updateBannerPost($db, $id, $data) {
    $cur = $db->prepare("SELECT * FROM banners WHERE id = :id");
    $cur->execute([':id' => $id]);
    $existing = $cur->fetch();
    if (!$existing) errorResponse('Banner not found', 404);

    $mediaType = $data['media_type'] ?? ($existing['media_type'] ?? 'image');

    // Desktop image
    $image = $existing['image'] ?? '';
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'banners');
        if ($r['success']) $image = $r['path'];
    } elseif (!empty($data['clear_image'])) {
        $image = ''; // User explicitly cleared it
    } elseif (!empty($data['existing_image'])) {
        $image = $data['existing_image'];
    }
    // else: keep $existing['image'] (no new upload, no clear flag)

    // Mobile image
    $mobileImage = $existing['mobile_image'] ?? null;
    if (!empty($_FILES['mobile_image']) && $_FILES['mobile_image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['mobile_image'], 'banners');
        if ($r['success']) $mobileImage = $r['path'];
    } elseif (array_key_exists('existing_mobile_image', $data)) {
        $mobileImage = $data['existing_mobile_image'] ?: null;
    }

    // Desktop video
    $video = $existing['video'] ?? null;
    $newVideo = uploadBannerVideo('video');
    if ($newVideo) {
        $video = $newVideo;
    } elseif (!empty($data['clear_video'])) {
        $video = null; // User explicitly removed the video
    } elseif (!empty($data['existing_video'])) {
        $video = $data['existing_video']; // Keep existing path
    }
    // else: keep $existing['video'] (no new upload, no clear, no existing sent)

    // Mobile video
    $mobileVideo = $existing['mobile_video'] ?? null;
    $newMobileVideo = uploadBannerVideo('mobile_video');
    if ($newMobileVideo) {
        $mobileVideo = $newMobileVideo;
    } elseif (!empty($data['clear_mobile_video'])) {
        $mobileVideo = null; // User explicitly removed it
    } elseif (!empty($data['existing_mobile_video'])) {
        $mobileVideo = $data['existing_mobile_video'];
    }
    // else: keep $existing['mobile_video']

    // Fallback image
    $fallbackImage = $existing['fallback_image'] ?? null;
    if (!empty($_FILES['fallback_image']) && $_FILES['fallback_image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['fallback_image'], 'banners');
        if ($r['success']) $fallbackImage = $r['path'];
    } elseif (array_key_exists('existing_fallback_image', $data)) {
        $fallbackImage = $data['existing_fallback_image'] ?: null;
    }

    try {
        $stmt = $db->prepare("UPDATE banners SET
            title=:title, subtitle=:sub, image=:img, mobile_image=:mobile,
            media_type=:mtype, video=:vid, mobile_video=:mobvid, fallback_image=:fallback,
            link=:link, button_text=:btn, button_color=:btncolor,
            position=:pos, sort_order=:sort, is_active=:active,
            starts_at=:starts, ends_at=:ends
            WHERE id=:id");
        $stmt->execute([
            ':id'       => $id,
            ':title'    => $data['title']        ?? $existing['title'],
            ':sub'      => $data['subtitle']     ?? $existing['subtitle'],
            ':img'      => $image,
            ':mobile'   => $mobileImage,
            ':mtype'    => $mediaType,
            ':vid'      => $video,
            ':mobvid'   => $mobileVideo,
            ':fallback' => $fallbackImage,
            ':link'     => $data['link']         ?? $existing['link'],
            ':btn'      => $data['button_text']  ?? $existing['button_text'],
            ':btncolor' => $data['button_color'] ?? ($existing['button_color'] ?? '#e06400'),
            ':pos'      => $data['position']     ?? $existing['position'],
            ':sort'     => (int)($data['sort_order'] ?? $existing['sort_order']),
            ':active'   => (int)($data['is_active']  ?? $existing['is_active']),
            ':starts'   => !empty($data['starts_at']) ? $data['starts_at'] : null,
            ':ends'     => !empty($data['ends_at'])   ? $data['ends_at']   : null,
        ]);
        successResponse(['id' => $id], 'Banner updated');
    } catch (\Exception $e) {
        errorResponse('DB error: ' . $e->getMessage(), 500);
    }
}


function updateBanner($db, $id) {
    ensureVideoBannerColumns($db);
    $data = !empty($_POST) ? $_POST : getJsonInput();

    $cur = $db->prepare("SELECT * FROM banners WHERE id = :id");
    $cur->execute([':id' => $id]);
    $existing = $cur->fetch();
    if (!$existing) errorResponse('Banner not found', 404);

    // Same as updateBannerPost but via PUT
    updateBannerPost($db, $id, $data);
}


function deleteBanner($db, $id) {
    $img = $db->prepare("SELECT image, mobile_image, video, mobile_video, fallback_image FROM banners WHERE id = :id");
    $img->execute([':id' => $id]);
    $b = $img->fetch();
    if ($b) {
        if ($b['image'])         deleteImage($b['image']);
        if ($b['mobile_image'])  deleteImage($b['mobile_image']);
        if ($b['fallback_image']) deleteImage($b['fallback_image']);
        if ($b['video'])         deleteImage($b['video']); // deleteImage works for any file
        if ($b['mobile_video'])  deleteImage($b['mobile_video']);
    }
    $stmt = $db->prepare("DELETE FROM banners WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) errorResponse('Banner not found', 404);
    successResponse(null, 'Banner deleted');
}

function reorderBanners($db) {
    $data = getJsonInput();
    if (empty($data['order']) || !is_array($data['order'])) errorResponse('Order array required', 400);
    $stmt = $db->prepare("UPDATE banners SET sort_order = :sort WHERE id = :id");
    foreach ($data['order'] as $i => $bid) {
        $stmt->execute([':sort' => $i, ':id' => (int)$bid]);
    }
    successResponse(null, 'Banners reordered');
}

function toggleBanner($db, $id) {
    $stmt = $db->prepare("UPDATE banners SET is_active = NOT is_active WHERE id = :id");
    $stmt->execute([':id' => $id]);
    successResponse(null, 'Banner toggled');
}
