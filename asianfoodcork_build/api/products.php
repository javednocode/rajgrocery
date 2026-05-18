<?php
/**
 * Products API - Full CRUD with filtering, search, pagination
 */

function getProducts($db) {
    [$page, $perPage, $offset] = getPaginationParams();
    $where = ["p.is_active = 1"];
    $params = [];

    if (!empty($_GET['category'])) {
        $where[] = "EXISTS (SELECT 1 FROM product_categories pc JOIN categories c ON pc.category_id = c.id WHERE pc.product_id = p.id AND c.slug = :cat_slug)";
        $params[':cat_slug'] = $_GET['category'];
    }
    if (!empty($_GET['min_price'])) { $where[] = "COALESCE(p.sale_price, p.price) >= :min_price"; $params[':min_price'] = (float)$_GET['min_price']; }
    if (!empty($_GET['max_price'])) { $where[] = "COALESCE(p.sale_price, p.price) <= :max_price"; $params[':max_price'] = (float)$_GET['max_price']; }
    if (!empty($_GET['brand'])) { $where[] = "p.brand = :brand"; $params[':brand'] = $_GET['brand']; }
    if (isset($_GET['in_stock']) && $_GET['in_stock'] === '1') { $where[] = "p.stock > 0"; }
    if (!empty($_GET['q'])) { $where[] = "(p.name LIKE :search OR p.short_description LIKE :search2)"; $params[':search'] = '%'.$_GET['q'].'%'; $params[':search2'] = '%'.$_GET['q'].'%'; }

    $auth = optionalAuth();
    if ($auth) { $where = array_filter($where, fn($w) => $w !== 'p.is_active = 1'); }
    if (empty($where)) $where[] = '1=1';

    $whereClause = 'WHERE ' . implode(' AND ', $where);
    $sortMap = ['price_asc'=>'COALESCE(p.sale_price,p.price) ASC','price_desc'=>'COALESCE(p.sale_price,p.price) DESC','name_asc'=>'p.name ASC','newest'=>'p.created_at DESC','popular'=>'p.sales_count DESC'];
    $sort = $sortMap[$_GET['sort'] ?? 'newest'] ?? 'p.created_at DESC';

    $countStmt = $db->prepare("SELECT COUNT(*) FROM products p $whereClause");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();

    $sql = "SELECT p.*, (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image FROM products p $whereClause ORDER BY $sort LIMIT :lim OFFSET :off";
    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $products = $stmt->fetchAll();

    foreach ($products as &$p) {
        $is = $db->prepare("SELECT image_path, alt_text, is_primary FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC, sort_order ASC");
        $is->execute([':pid' => $p['id']]);
        $p['images'] = $is->fetchAll();
    }
    paginatedResponse($products, $total, $page, $perPage);
}

function getFeaturedProducts($db) {
    $limit = min(20, (int)($_GET['limit'] ?? 8));
    $stmt = $db->prepare("SELECT p.*, (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image FROM products p WHERE p.is_active = 1 AND p.is_featured = 1 ORDER BY p.created_at DESC LIMIT :lim");
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $products = $stmt->fetchAll();
    foreach ($products as &$p) { $is = $db->prepare("SELECT image_path, alt_text, is_primary FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC"); $is->execute([':pid'=>$p['id']]); $p['images']=$is->fetchAll(); }
    successResponse($products);
}

function getTrendingProducts($db) {
    $limit = min(20, (int)($_GET['limit'] ?? 8));
    $stmt = $db->prepare("SELECT p.*, (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image FROM products p WHERE p.is_active = 1 AND (p.is_trending = 1 OR p.sales_count > 0) ORDER BY p.is_trending DESC, p.sales_count DESC LIMIT :lim");
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    successResponse($stmt->fetchAll());
}

function searchProducts($db) {
    $q = $_GET['q'] ?? '';
    if (strlen($q) < 2) errorResponse('Search query too short', 400);
    $stmt = $db->prepare("SELECT p.id, p.name, p.slug, p.price, p.sale_price, (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image FROM products p WHERE p.is_active = 1 AND (p.name LIKE :q1 OR p.brand LIKE :q2) ORDER BY p.sales_count DESC LIMIT 20");
    $s = "%{$q}%";
    $stmt->execute([':q1'=>$s, ':q2'=>$s]);
    successResponse($stmt->fetchAll());
}

function getProductById($db, $id) {
    $stmt = $db->prepare("SELECT * FROM products WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $p = $stmt->fetch();
    if (!$p) errorResponse('Product not found', 404);
    $is = $db->prepare("SELECT * FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC, sort_order ASC");
    $is->execute([':pid' => $id]);
    $p['images'] = $is->fetchAll();
    $cs = $db->prepare("SELECT c.id, c.name, c.slug FROM product_categories pc JOIN categories c ON pc.category_id = c.id WHERE pc.product_id = :pid");
    $cs->execute([':pid' => $id]);
    $p['categories'] = $cs->fetchAll();
    $vs = $db->prepare("SELECT * FROM product_variations WHERE product_id = :pid ORDER BY sort_order ASC, id ASC");
    $vs->execute([':pid' => $id]);
    $p['variations'] = $vs->fetchAll();
    successResponse($p);
}

function getProductBySlug($db, $slug) {
    $stmt = $db->prepare("SELECT * FROM products WHERE slug = :slug AND is_active = 1");
    $stmt->execute([':slug' => $slug]);
    $p = $stmt->fetch();
    if (!$p) errorResponse('Product not found', 404);
    $is = $db->prepare("SELECT * FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC, sort_order ASC");
    $is->execute([':pid' => $p['id']]);
    $p['images'] = $is->fetchAll();
    $cs = $db->prepare("SELECT c.id, c.name, c.slug FROM product_categories pc JOIN categories c ON pc.category_id = c.id WHERE pc.product_id = :pid");
    $cs->execute([':pid' => $p['id']]);
    $p['categories'] = $cs->fetchAll();
    $vs = $db->prepare("SELECT * FROM product_variations WHERE product_id = :pid AND is_active = 1 ORDER BY sort_order ASC, id ASC");
    $vs->execute([':pid' => $p['id']]);
    $p['variations'] = $vs->fetchAll();
    $relStmt = $db->prepare("SELECT DISTINCT p2.id, p2.name, p2.slug, p2.price, p2.sale_price, (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p2.id AND pi.is_primary = 1 LIMIT 1) as primary_image FROM products p2 JOIN product_categories pc ON p2.id = pc.product_id WHERE pc.category_id IN (SELECT category_id FROM product_categories WHERE product_id = :pid) AND p2.id != :pid2 AND p2.is_active = 1 LIMIT 8");
    $relStmt->execute([':pid' => $p['id'], ':pid2' => $p['id']]);
    $p['related_products'] = $relStmt->fetchAll();
    $db->prepare("UPDATE products SET views = views + 1 WHERE id = :id")->execute([':id' => $p['id']]);
    successResponse($p);
}

function createProduct($db) {
    $data = isset($_POST['name']) ? $_POST : getJsonInput();
    $name = trim($data['name'] ?? '');
    if (empty($name)) errorResponse('Product name is required', 400);
    $slug = uniqueSlug($db, 'products', $data['slug'] ?? $name);
    $stmt = $db->prepare("INSERT INTO products (name,slug,short_description,description,price,sale_price,cost_price,sku,barcode,stock,low_stock_threshold,weight,unit,brand,is_active,is_featured,is_trending,is_new,meta_title,meta_description,focus_keyword) VALUES (:name,:slug,:sd,:d,:price,:sp,:cp,:sku,:bar,:stock,:lst,:w,:u,:brand,:a,:f,:t,:n,:mt,:md,:fk)");
    $stmt->execute([':name'=>$name,':slug'=>$slug,':sd'=>$data['short_description']??null,':d'=>$data['description']??null,':price'=>(float)($data['price']??0),':sp'=>!empty($data['sale_price'])?(float)$data['sale_price']:null,':cp'=>!empty($data['cost_price'])?(float)$data['cost_price']:null,':sku'=>$data['sku']??null,':bar'=>$data['barcode']??null,':stock'=>(int)($data['stock']??0),':lst'=>(int)($data['low_stock_threshold']??5),':w'=>!empty($data['weight'])?(float)$data['weight']:null,':u'=>$data['unit']??'piece',':brand'=>$data['brand']??null,':a'=>(int)($data['is_active']??1),':f'=>(int)($data['is_featured']??0),':t'=>(int)($data['is_trending']??0),':n'=>(int)($data['is_new']??0),':mt'=>$data['meta_title']??null,':md'=>$data['meta_description']??null,':fk'=>$data['focus_keyword']??null]);
    $pid = $db->lastInsertId();
    if (!empty($data['categories'])) {
        $catIds = is_array($data['categories']) ? $data['categories'] : json_decode($data['categories'], true);
        if ($catIds) { $cs = $db->prepare("INSERT INTO product_categories (product_id,category_id) VALUES (:p,:c)"); foreach ($catIds as $c) $cs->execute([':p'=>$pid,':c'=>$c]); }
    }
    if (!empty($_FILES['images'])) {
        $files = $_FILES['images'];
        $count = is_array($files['name']) ? count($files['name']) : 1;
        for ($i = 0; $i < $count; $i++) {
            $file = ['name'=>is_array($files['name'])?$files['name'][$i]:$files['name'],'tmp_name'=>is_array($files['tmp_name'])?$files['tmp_name'][$i]:$files['tmp_name'],'size'=>is_array($files['size'])?$files['size'][$i]:$files['size'],'error'=>is_array($files['error'])?$files['error'][$i]:$files['error']];
            if ($file['error']===UPLOAD_ERR_OK) { $r=uploadImage($file,'products'); if($r['success']) { $db->prepare("INSERT INTO product_images (product_id,image_path,is_primary,sort_order) VALUES (:p,:path,:pri,:s)")->execute([':p'=>$pid,':path'=>$r['path'],':pri'=>($i===0)?1:0,':s'=>$i]); } }
        }
    }
    successResponse(['id'=>$pid,'slug'=>$slug], 'Product created', 201);
}

function updateProduct($db, $id) {
    $data = isset($_POST['name']) ? $_POST : getJsonInput();
    $check = $db->prepare("SELECT id FROM products WHERE id = :id"); $check->execute([':id'=>$id]);
    if (!$check->fetch()) errorResponse('Product not found', 404);
    $name = trim($data['name'] ?? '');
    if (empty($name)) errorResponse('Product name is required', 400);
    $slug = uniqueSlug($db, 'products', $data['slug'] ?? $name, $id);
    $stmt = $db->prepare("UPDATE products SET name=:name,slug=:slug,short_description=:sd,description=:d,price=:price,sale_price=:sp,cost_price=:cp,sku=:sku,barcode=:bar,stock=:stock,low_stock_threshold=:lst,weight=:w,unit=:u,brand=:brand,is_active=:a,is_featured=:f,is_trending=:t,is_new=:n,meta_title=:mt,meta_description=:md,focus_keyword=:fk WHERE id=:id");
    $stmt->execute([':id'=>$id,':name'=>$name,':slug'=>$slug,':sd'=>$data['short_description']??null,':d'=>$data['description']??null,':price'=>(float)($data['price']??0),':sp'=>!empty($data['sale_price'])?(float)$data['sale_price']:null,':cp'=>!empty($data['cost_price'])?(float)$data['cost_price']:null,':sku'=>$data['sku']??null,':bar'=>$data['barcode']??null,':stock'=>(int)($data['stock']??0),':lst'=>(int)($data['low_stock_threshold']??5),':w'=>!empty($data['weight'])?(float)$data['weight']:null,':u'=>$data['unit']??'piece',':brand'=>$data['brand']??null,':a'=>(int)($data['is_active']??1),':f'=>(int)($data['is_featured']??0),':t'=>(int)($data['is_trending']??0),':n'=>(int)($data['is_new']??0),':mt'=>$data['meta_title']??null,':md'=>$data['meta_description']??null,':fk'=>$data['focus_keyword']??null]);
    if (isset($data['categories'])) {
        $db->prepare("DELETE FROM product_categories WHERE product_id = :pid")->execute([':pid'=>$id]);
        $catIds = is_array($data['categories'])?$data['categories']:json_decode($data['categories'],true);
        if ($catIds) { $cs=$db->prepare("INSERT INTO product_categories (product_id,category_id) VALUES (:p,:c)"); foreach ($catIds as $c) $cs->execute([':p'=>$id,':c'=>$c]); }
    }
    successResponse(['id'=>$id,'slug'=>$slug], 'Product updated');
}

function deleteProduct($db, $id) {
    $is = $db->prepare("SELECT image_path FROM product_images WHERE product_id = :pid"); $is->execute([':pid'=>$id]);
    while ($img = $is->fetch()) deleteImage($img['image_path']);
    // Delete variation images too
    $vs = $db->prepare("SELECT image_path FROM product_variations WHERE product_id = :pid AND image_path IS NOT NULL"); $vs->execute([':pid'=>$id]);
    while ($v = $vs->fetch()) deleteImage($v['image_path']);
    $stmt = $db->prepare("DELETE FROM products WHERE id = :id"); $stmt->execute([':id'=>$id]);
    if ($stmt->rowCount()===0) errorResponse('Product not found', 404);
    successResponse(null, 'Product deleted');
}

// ============================================
// VARIATION CRUD
// ============================================

function getVariations($db, $productId) {
    $stmt = $db->prepare("SELECT * FROM product_variations WHERE product_id = :pid ORDER BY sort_order ASC, id ASC");
    $stmt->execute([':pid' => $productId]);
    successResponse($stmt->fetchAll());
}

function createVariation($db, $productId) {
    $data = isset($_POST['name']) ? $_POST : getJsonInput();
    $name = trim($data['name'] ?? '');
    if (empty($name)) errorResponse('Variation name is required', 400);
    $imagePath = null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'variations');
        if ($r['success']) $imagePath = $r['path'];
    }
    $stmt = $db->prepare("INSERT INTO product_variations (product_id, name, sku, price, sale_price, stock, image_path, sort_order, is_active) VALUES (:pid,:name,:sku,:price,:sp,:stock,:img,:sort,:active)");
    $stmt->execute([
        ':pid'    => $productId,
        ':name'   => $name,
        ':sku'    => $data['sku'] ?? null,
        ':price'  => (float)($data['price'] ?? 0),
        ':sp'     => !empty($data['sale_price']) ? (float)$data['sale_price'] : null,
        ':stock'  => (int)($data['stock'] ?? 0),
        ':img'    => $imagePath,
        ':sort'   => (int)($data['sort_order'] ?? 0),
        ':active' => (int)($data['is_active'] ?? 1),
    ]);
    successResponse(['id' => $db->lastInsertId(), 'image_path' => $imagePath], 'Variation created', 201);
}

function updateVariation($db, $variationId) {
    $data = isset($_POST['name']) ? $_POST : getJsonInput();
    $check = $db->prepare("SELECT * FROM product_variations WHERE id = :id"); $check->execute([':id'=>$variationId]);
    $existing = $check->fetch();
    if (!$existing) errorResponse('Variation not found', 404);
    $imagePath = $existing['image_path'];
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        if ($imagePath) deleteImage($imagePath);
        $r = uploadImage($_FILES['image'], 'variations');
        if ($r['success']) $imagePath = $r['path'];
    }
    $name = trim($data['name'] ?? $existing['name']);
    $stmt = $db->prepare("UPDATE product_variations SET name=:name, sku=:sku, price=:price, sale_price=:sp, stock=:stock, image_path=:img, sort_order=:sort, is_active=:active WHERE id=:id");
    $stmt->execute([
        ':id'     => $variationId,
        ':name'   => $name,
        ':sku'    => $data['sku'] ?? $existing['sku'],
        ':price'  => (float)($data['price'] ?? $existing['price']),
        ':sp'     => !empty($data['sale_price']) ? (float)$data['sale_price'] : null,
        ':stock'  => (int)($data['stock'] ?? $existing['stock']),
        ':img'    => $imagePath,
        ':sort'   => (int)($data['sort_order'] ?? $existing['sort_order']),
        ':active' => (int)($data['is_active'] ?? $existing['is_active']),
    ]);
    successResponse(['id' => $variationId, 'image_path' => $imagePath], 'Variation updated');
}

function deleteVariation($db, $variationId) {
    $check = $db->prepare("SELECT image_path FROM product_variations WHERE id = :id"); $check->execute([':id'=>$variationId]);
    $v = $check->fetch();
    if (!$v) errorResponse('Variation not found', 404);
    if ($v['image_path']) deleteImage($v['image_path']);
    $db->prepare("DELETE FROM product_variations WHERE id = :id")->execute([':id'=>$variationId]);
    successResponse(null, 'Variation deleted');
}
