<?php
/**
 * Banners API — hero slider with desktop + mobile images
 */

function getBanners($db) {
    $position = $_GET['position'] ?? 'hero';
    $all      = isset($_GET['all']) && $_GET['all'] == 1; // admin: get all incl inactive

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
    $stmt = $db->prepare("SELECT * FROM banners WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $b = $stmt->fetch();
    if (!$b) errorResponse('Banner not found', 404);
    successResponse($b);
}


function createBanner($db) {
    $data = $_POST; // FormData always populates $_POST for POST requests

    // ── Method override: POST acting as PUT ──────────────────────
    if (!empty($data['_method']) && strtoupper($data['_method']) === 'PUT') {
        $id = (int)($data['banner_id'] ?? 0);
        if (!$id) errorResponse('Banner ID missing for update', 400);
        updateBannerPost($db, $id, $data);
        return;
    }

    // ── Normal CREATE ────────────────────────────────────────────
    // Desktop image (required for new banners)
    $image = null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'banners');
        if ($r['success']) $image = $r['path'];
    }
    if (!$image && empty($data['image'])) errorResponse('Banner desktop image is required', 400);

    // Mobile image (optional)
    $mobileImage = null;
    if (!empty($_FILES['mobile_image']) && $_FILES['mobile_image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['mobile_image'], 'banners');
        if ($r['success']) $mobileImage = $r['path'];
    }

    $stmt = $db->prepare("INSERT INTO banners
        (title, subtitle, image, mobile_image, link, button_text, button_color, position, sort_order, is_active, starts_at, ends_at)
        VALUES (:title,:sub,:img,:mobile,:link,:btn,:btncolor,:pos,:sort,:active,:starts,:ends)");
    $stmt->execute([
        ':title'    => $data['title']        ?? null,
        ':sub'      => $data['subtitle']     ?? null,
        ':img'      => $image ?? ($data['image'] ?? ''),
        ':mobile'   => $mobileImage,
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
    // Get current record
    $cur = $db->prepare("SELECT * FROM banners WHERE id = :id");
    $cur->execute([':id' => $id]);
    $existing = $cur->fetch();
    if (!$existing) errorResponse('Banner not found', 404);

    // Desktop image — new upload wins, else keep existing_image field, else keep DB value
    $image = $existing['image'];
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'banners');
        if ($r['success']) $image = $r['path'];
    } elseif (!empty($data['existing_image'])) {
        $image = $data['existing_image'];
    }

    // Mobile image
    $mobileImage = $existing['mobile_image'];
    if (!empty($_FILES['mobile_image']) && $_FILES['mobile_image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['mobile_image'], 'banners');
        if ($r['success']) $mobileImage = $r['path'];
    } elseif (array_key_exists('existing_mobile_image', $data)) {
        $mobileImage = $data['existing_mobile_image'] ?: null;
    }

    // Auto-add button_color column if it doesn't exist (Hostinger migration safety)
    try {
        $db->exec("ALTER TABLE banners ADD COLUMN button_color VARCHAR(30) DEFAULT '#e06400' AFTER button_text");
    } catch (\Exception $e) { /* Column already exists — ignore */ }

    try {
        $stmt = $db->prepare("UPDATE banners SET
            title=:title, subtitle=:sub, image=:img, mobile_image=:mobile,
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
    // PHP can't read $_POST/$_FILES for PUT — fall back to raw stream for JSON
    $data = !empty($_POST) ? $_POST : getJsonInput();

    // Get current banner
    $cur = $db->prepare("SELECT * FROM banners WHERE id = :id");
    $cur->execute([':id' => $id]);
    $existing = $cur->fetch();
    if (!$existing) errorResponse('Banner not found', 404);

    // Desktop image
    $image = $existing['image'];
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'banners');
        if ($r['success']) $image = $r['path'];
    }

    // Mobile image
    $mobileImage = $existing['mobile_image'];
    if (!empty($_FILES['mobile_image']) && $_FILES['mobile_image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['mobile_image'], 'banners');
        if ($r['success']) $mobileImage = $r['path'];
    }
    // Allow clearing mobile image
    if (isset($data['clear_mobile']) && $data['clear_mobile'] == '1') $mobileImage = null;

    // Auto-add button_color column if it doesn't exist (Hostinger migration safety)
    try {
        $db->exec("ALTER TABLE banners ADD COLUMN button_color VARCHAR(30) DEFAULT '#e06400' AFTER button_text");
    } catch (\Exception $e) { /* Column already exists — ignore */ }

    try {
        $stmt = $db->prepare("UPDATE banners SET
            title=:title, subtitle=:sub, image=:img, mobile_image=:mobile,
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


function deleteBanner($db, $id) {
    $img = $db->prepare("SELECT image, mobile_image FROM banners WHERE id = :id");
    $img->execute([':id' => $id]);
    $b = $img->fetch();
    if ($b) {
        if ($b['image'])        deleteImage($b['image']);
        if ($b['mobile_image']) deleteImage($b['mobile_image']);
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
