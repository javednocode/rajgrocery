<?php
/**
 * Hero Products API
 * Supports selecting an existing product OR manually entering details.
 */

function initHeroProductsTable($db) {
    $db->exec("CREATE TABLE IF NOT EXISTS hero_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NULL,
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
    // Ensure product_id column exists on older tables
    try {
        $db->exec("ALTER TABLE hero_products ADD COLUMN product_id INT NULL AFTER id");
    } catch (\Throwable $e) {}
}

function getHeroProducts($db) {
    try {
        $all = $_GET['all'] ?? false;
        $sql = "SELECT hp.*, p.slug as product_slug
                FROM hero_products hp
                LEFT JOIN products p ON hp.product_id = p.id";
        if (!$all) $sql .= " WHERE hp.is_active = 1";
        $sql .= " ORDER BY hp.sort_order ASC, hp.id DESC";
        $stmt = $db->query($sql);
        successResponse($stmt->fetchAll());
    } catch (\PDOException $e) {
        if (strpos($e->getMessage(), "Table '") !== false) {
            initHeroProductsTable($db);
            successResponse([]);
        }
        errorResponse('Database error: ' . $e->getMessage(), 500);
    }
}

function createHeroProduct($db) {
    initHeroProductsTable($db);
    $data = !empty($_POST) ? $_POST : getJsonInput();

    // _method=PUT override
    if (!empty($data['_method']) && strtoupper($data['_method']) === 'PUT') {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/hero-products/(\d+)#', $uri, $m);
        $id = (int)($m[1] ?? 0);
        if (!$id) errorResponse('Hero product ID missing', 400);
        updateHeroProduct($db, $id);
        return;
    }

    // If product_id given, pull details from products table
    $resolved = resolveHeroData($db, $data);

    $image = null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'hero');
        if ($r['success']) $image = $r['path'];
    }
    $image = $image ?? $resolved['image'] ?? null;
    if (!$image) errorResponse('Image is required', 400);

    $stmt = $db->prepare("INSERT INTO hero_products (product_id, product_name, price, badge, image, link, sort_order, is_featured, is_active)
                          VALUES (:pid, :name, :price, :badge, :image, :link, :sort, :feat, :active)");
    $stmt->execute([
        ':pid'    => $resolved['product_id'],
        ':name'   => $resolved['product_name'],
        ':price'  => $resolved['price'],
        ':badge'  => $data['badge'] ?? null,
        ':image'  => $image,
        ':link'   => $resolved['link'],
        ':sort'   => (int)($data['sort_order'] ?? 0),
        ':feat'   => (int)($data['is_featured'] ?? 0),
        ':active' => (int)($data['is_active'] ?? 1),
    ]);
    successResponse(['id' => $db->lastInsertId()], 'Hero product created', 201);
}

function updateHeroProduct($db, $id) {
    initHeroProductsTable($db);
    $data = !empty($_POST) ? $_POST : getJsonInput();

    $stmt = $db->prepare("SELECT * FROM hero_products WHERE id = ?");
    $stmt->execute([$id]);
    $current = $stmt->fetch();
    if (!$current) errorResponse('Hero product not found', 404);

    // Resolve live product details if product_id changed/provided
    $resolved = resolveHeroData($db, $data, $current);

    $image = $current['image'];
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'hero');
        if ($r['success']) $image = $r['path'];
    } elseif (!empty($resolved['image']) && $resolved['image'] !== $current['image']) {
        // New product selected — use its image
        $image = $resolved['image'];
    }

    $stmt = $db->prepare("UPDATE hero_products SET product_id=:pid, product_name=:name, price=:price, badge=:badge, image=:img, link=:link, sort_order=:sort, is_featured=:feat, is_active=:active WHERE id=:id");
    $stmt->execute([
        ':pid'    => $resolved['product_id'],
        ':name'   => $resolved['product_name'],
        ':price'  => $resolved['price'],
        ':badge'  => $data['badge'] ?? $current['badge'],
        ':img'    => $image,
        ':link'   => $resolved['link'],
        ':sort'   => isset($data['sort_order']) ? (int)$data['sort_order'] : $current['sort_order'],
        ':feat'   => isset($data['is_featured']) ? (int)$data['is_featured'] : $current['is_featured'],
        ':active' => isset($data['is_active']) ? (int)$data['is_active'] : $current['is_active'],
        ':id'     => $id,
    ]);
    successResponse(null, 'Hero product updated');
}

/**
 * If product_id is provided, pull name/price/image/link from products table.
 * Otherwise use manually entered values.
 */
function resolveHeroData($db, $data, $current = []) {
    $productId = !empty($data['product_id']) ? (int)$data['product_id'] : ($current['product_id'] ?? null);

    if ($productId) {
        $p = $db->prepare("SELECT name, price, slug FROM products WHERE id = :id LIMIT 1");
        $p->execute([':id' => $productId]);
        $product = $p->fetch();

        // Get product primary image
        $img = $db->prepare("SELECT image_path FROM product_images WHERE product_id = :id AND is_primary = 1 LIMIT 1");
        $img->execute([':id' => $productId]);
        $imgRow = $img->fetch();
        $imagePath = $imgRow['image_path'] ?? null;

        if ($product) {
            return [
                'product_id'   => $productId,
                'product_name' => $data['product_name'] ?: $product['name'],
                'price'        => !empty($data['price']) ? $data['price'] : $product['price'],
                'image'        => $imagePath ?? ($current['image'] ?? null),
                'link'         => $data['link'] ?? ('/product/' . $product['slug']),
            ];
        }
    }

    return [
        'product_id'   => null,
        'product_name' => $data['product_name'] ?? ($current['product_name'] ?? ''),
        'price'        => $data['price'] ?? ($current['price'] ?? 0),
        'image'        => $current['image'] ?? null,
        'link'         => $data['link'] ?? ($current['link'] ?? null),
    ];
}

function deleteHeroProduct($db, $id) {
    initHeroProductsTable($db);
    $stmt = $db->prepare("DELETE FROM hero_products WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount()) successResponse(null, 'Hero product deleted');
    errorResponse('Hero product not found', 404);
}
