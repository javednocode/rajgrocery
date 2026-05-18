<?php
/**
 * Hero Products API
 */

function initHeroProductsTable($db) {
    $db->exec("CREATE TABLE IF NOT EXISTS hero_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        badge VARCHAR(50),
        image VARCHAR(255) NOT NULL,
        link VARCHAR(255),
        sort_order INT DEFAULT 0,
        is_featured TINYINT DEFAULT 0,
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
}

function getHeroProducts($db) {
    try {
        $all = $_GET['all'] ?? false;
        $sql = "SELECT * FROM hero_products";
        if (!$all) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY sort_order ASC, id DESC";
        $stmt = $db->query($sql);
        successResponse($stmt->fetchAll());
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), "Table '") !== false || strpos($e->getMessage(), "hero_products' doesn't exist") !== false) {
            initHeroProductsTable($db);
            successResponse([]);
        }
        errorResponse('Database error: ' . $e->getMessage(), 500);
    }
}

function createHeroProduct($db) {
    initHeroProductsTable($db);
    $data = isset($_POST['product_name']) ? $_POST : getJsonInput();
    $image = null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'hero');
        if ($r['success']) $image = $r['path'];
    }
    if (!$image && empty($data['image'])) errorResponse('Image is required', 400);

    $stmt = $db->prepare("INSERT INTO hero_products (product_name, price, badge, image, link, sort_order, is_featured, is_active) VALUES (:name, :price, :badge, :image, :link, :sort, :feat, :active)");
    $stmt->execute([
        ':name' => $data['product_name'] ?? null,
        ':price' => $data['price'] ?? 0,
        ':badge' => $data['badge'] ?? null,
        ':image' => $image ?? $data['image'],
        ':link' => $data['link'] ?? null,
        ':sort' => (int)($data['sort_order'] ?? 0),
        ':feat' => (int)($data['is_featured'] ?? 0),
        ':active' => (int)($data['is_active'] ?? 1)
    ]);
    successResponse(['id' => $db->lastInsertId()], 'Hero product created', 201);
}

function updateHeroProduct($db, $id) {
    initHeroProductsTable($db);
    $data = isset($_POST['product_name']) ? $_POST : getJsonInput();
    
    $stmt = $db->prepare("SELECT * FROM hero_products WHERE id = ?");
    $stmt->execute([$id]);
    $current = $stmt->fetch();
    if (!$current) errorResponse('Hero product not found', 404);

    $image = $current['image'];
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'hero');
        if ($r['success']) $image = $r['path'];
    }

    $stmt = $db->prepare("UPDATE hero_products SET product_name=:name, price=:price, badge=:badge, image=:img, link=:link, sort_order=:sort, is_featured=:feat, is_active=:active WHERE id=:id");
    $stmt->execute([
        ':name' => $data['product_name'] ?? $current['product_name'],
        ':price' => $data['price'] ?? $current['price'],
        ':badge' => isset($data['badge']) ? $data['badge'] : $current['badge'],
        ':img' => $image,
        ':link' => isset($data['link']) ? $data['link'] : $current['link'],
        ':sort' => isset($data['sort_order']) ? (int)$data['sort_order'] : $current['sort_order'],
        ':feat' => isset($data['is_featured']) ? (int)$data['is_featured'] : $current['is_featured'],
        ':active' => isset($data['is_active']) ? (int)$data['is_active'] : $current['is_active'],
        ':id' => $id
    ]);
    successResponse(null, 'Hero product updated');
}

function deleteHeroProduct($db, $id) {
    initHeroProductsTable($db);
    $stmt = $db->prepare("DELETE FROM hero_products WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount()) successResponse(null, 'Hero product deleted');
    errorResponse('Hero product not found', 404);
}
