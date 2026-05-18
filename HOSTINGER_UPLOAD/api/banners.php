<?php
/**
 * Banners API
 */

function getBanners($db) {
    $position = $_GET['position'] ?? null;
    $sql = "SELECT * FROM banners WHERE is_active = 1 AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW())";
    $params = [];
    if ($position) { $sql .= " AND position = :pos"; $params[':pos'] = $position; }
    $sql .= " ORDER BY sort_order ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    successResponse($stmt->fetchAll());
}

function createBanner($db) {
    $data = isset($_POST['title']) ? $_POST : getJsonInput();
    $image = null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'banners');
        if ($r['success']) $image = $r['path'];
    }
    if (!$image && empty($data['image'])) errorResponse('Banner image is required', 400);
    $stmt = $db->prepare("INSERT INTO banners (title,subtitle,image,mobile_image,link,button_text,position,sort_order,is_active,starts_at,ends_at) VALUES (:title,:sub,:img,:mobile,:link,:btn,:pos,:sort,:active,:starts,:ends)");
    $stmt->execute([':title'=>$data['title']??null,':sub'=>$data['subtitle']??null,':img'=>$image??$data['image'],':mobile'=>$data['mobile_image']??null,':link'=>$data['link']??null,':btn'=>$data['button_text']??null,':pos'=>$data['position']??'hero',':sort'=>(int)($data['sort_order']??0),':active'=>(int)($data['is_active']??1),':starts'=>$data['starts_at']??null,':ends'=>$data['ends_at']??null]);
    successResponse(['id'=>$db->lastInsertId()], 'Banner created', 201);
}

function updateBanner($db, $id) {
    $data = isset($_POST['title']) ? $_POST : getJsonInput();
    $image = $data['image'] ?? null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'banners');
        if ($r['success']) $image = $r['path'];
    }
    $sql = "UPDATE banners SET title=:title,subtitle=:sub,link=:link,button_text=:btn,position=:pos,sort_order=:sort,is_active=:active,starts_at=:starts,ends_at=:ends";
    $params = [':id'=>$id,':title'=>$data['title']??null,':sub'=>$data['subtitle']??null,':link'=>$data['link']??null,':btn'=>$data['button_text']??null,':pos'=>$data['position']??'hero',':sort'=>(int)($data['sort_order']??0),':active'=>(int)($data['is_active']??1),':starts'=>$data['starts_at']??null,':ends'=>$data['ends_at']??null];
    if ($image) { $sql .= ",image=:img"; $params[':img'] = $image; }
    $sql .= " WHERE id=:id";
    $stmt = $db->prepare($sql); $stmt->execute($params);
    successResponse(['id'=>$id], 'Banner updated');
}

function deleteBanner($db, $id) {
    $img = $db->prepare("SELECT image FROM banners WHERE id = :id"); $img->execute([':id'=>$id]); $b = $img->fetch();
    if ($b) deleteImage($b['image']);
    $stmt = $db->prepare("DELETE FROM banners WHERE id = :id"); $stmt->execute([':id'=>$id]);
    if ($stmt->rowCount()===0) errorResponse('Banner not found', 404);
    successResponse(null, 'Banner deleted');
}
