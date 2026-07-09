<?php
/**
 * Categories API — Optimized with file-based caching
 */

function getCategories($db) {
    $isAdmin = isset($_GET['admin']) && $_GET['admin'] == '1';
    $countryParam = strtolower(preg_replace('/[^a-z0-9]/', '', $_GET['country'] ?? ''));
    $cacheKey = $isAdmin ? 'categories_all_admin' : "categories_all_public_c{$countryParam}";

    // Cache public categories for 10 minutes (categories rarely change)
    if (!$isAdmin) {
        $cached = cacheGet($cacheKey);
        if ($cached !== null) {
            successResponse($cached);
            return;
        }
    }

    $join = '';
    $where = $isAdmin ? '' : 'WHERE c.is_active = 1';
    if (!$isAdmin && $countryParam !== '') {
        $countryId = resolveCountryId($db, $countryParam);
        if (!$countryId) { successResponse([]); return; }
        $join = "INNER JOIN category_countries ccty ON ccty.category_id = c.id AND ccty.country_id = " . (int)$countryId;
    }

    $sql = "SELECT c.id, c.name, c.slug, c.description, c.image, c.icon, c.parent_id,
                c.sort_order, c.is_active, c.is_featured, c.meta_title, c.meta_description
            FROM categories c $join $where
            ORDER BY c.sort_order ASC, c.name ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $categories = $stmt->fetchAll();

    // Batch load product counts
    if (!empty($categories)) {
        $catIds = array_column($categories, 'id');
        $placeholders = implode(',', array_fill(0, count($catIds), '?'));
        $countStmt = $db->prepare("SELECT category_id, COUNT(*) as cnt FROM product_categories WHERE category_id IN ($placeholders) GROUP BY category_id");
        $countStmt->execute($catIds);
        $counts = $countStmt->fetchAll(PDO::FETCH_KEY_PAIR);
        foreach ($categories as &$c) {
            $c['product_count'] = (int)($counts[$c['id']] ?? 0);
        }
        unset($c);

        // Admin needs current country assignments for the edit form
        if ($isAdmin) {
            $countryIdMap = batchLoadCategoryCountryIds($db, $catIds);
            foreach ($categories as &$c) {
                $c['country_ids'] = $countryIdMap[$c['id']] ?? [];
            }
            unset($c);
        }
    }

    // When filtering by country, orphaned children (parent not assigned)
    // still belong in the list — flatten them to the root of the tree.
    $tree = buildCategoryTree($categories);
    if (!$isAdmin && $countryParam !== '') {
        $inTree = [];
        $collect = function ($nodes) use (&$collect, &$inTree) {
            foreach ($nodes as $n) { $inTree[] = $n['id']; $collect($n['children'] ?? []); }
        };
        $collect($tree);
        foreach ($categories as $c) {
            if (!in_array($c['id'], $inTree)) { $c['children'] = []; $tree[] = $c; }
        }
    }

    if (!$isAdmin) {
        cacheSet($cacheKey, $tree, 600); // 10 minutes
    }

    successResponse($tree);
}

function getFeaturedCategories($db) {
    $countryParam = strtolower(preg_replace('/[^a-z0-9]/', '', $_GET['country'] ?? ''));
    $cacheKey = "categories_featured_c{$countryParam}";
    $cached = cacheGet($cacheKey);
    if ($cached !== null) {
        successResponse($cached);
        return;
    }

    $join = '';
    if ($countryParam !== '') {
        $countryId = resolveCountryId($db, $countryParam);
        if (!$countryId) { successResponse([]); return; }
        $join = "INNER JOIN category_countries ccty ON ccty.category_id = c.id AND ccty.country_id = " . (int)$countryId;
    }

    $stmt = $db->prepare("
        SELECT c.id, c.name, c.slug, c.image, c.icon, c.sort_order, c.is_featured
        FROM categories c
        $join
        WHERE c.is_active = 1 AND c.is_featured = 1
        ORDER BY c.sort_order ASC
        LIMIT 12
    ");
    $stmt->execute();
    $result = $stmt->fetchAll();

    // Batch load product counts
    if (!empty($result)) {
        $catIds = array_column($result, 'id');
        $placeholders = implode(',', array_fill(0, count($catIds), '?'));
        $countStmt = $db->prepare("SELECT category_id, COUNT(*) as cnt FROM product_categories WHERE category_id IN ($placeholders) GROUP BY category_id");
        $countStmt->execute($catIds);
        $counts = $countStmt->fetchAll(PDO::FETCH_KEY_PAIR);
        foreach ($result as &$c) {
            $c['product_count'] = (int)($counts[$c['id']] ?? 0);
        }
        unset($c);
    }

    cacheSet($cacheKey, $result, 600); // 10 minutes
    successResponse($result);
}

function buildCategoryTree($categories, $parentId = null) {
    $tree = [];
    foreach ($categories as $cat) {
        if ($cat['parent_id'] == $parentId) {
            $cat['children'] = buildCategoryTree($categories, $cat['id']);
            $tree[] = $cat;
        }
    }
    return $tree;
}

function getCategoryById($db, $id) {
    $stmt = $db->prepare("SELECT * FROM categories WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $cat = $stmt->fetch();
    if (!$cat) errorResponse('Category not found', 404);
    $sub = $db->prepare("SELECT id, name, slug, image, sort_order FROM categories WHERE parent_id = :id AND is_active = 1 ORDER BY sort_order ASC");
    $sub->execute([':id' => $id]);
    $cat['subcategories'] = $sub->fetchAll();
    $ctyMap = batchLoadCategoryCountryIds($db, [(int)$id]);
    $cat['country_ids'] = $ctyMap[(int)$id] ?? [];
    successResponse($cat);
}

function getCategoryBySlug($db, $slug) {
    $cacheKey = "category_slug_{$slug}";
    $cached = cacheGet($cacheKey);
    if ($cached !== null) {
        successResponse($cached);
        return;
    }

    $stmt = $db->prepare("SELECT * FROM categories WHERE slug = :slug AND is_active = 1");
    $stmt->execute([':slug' => $slug]);
    $cat = $stmt->fetch();
    if (!$cat) errorResponse('Category not found', 404);
    $sub = $db->prepare("SELECT id, name, slug, image, sort_order FROM categories WHERE parent_id = :id AND is_active = 1 ORDER BY sort_order ASC");
    $sub->execute([':id' => $cat['id']]);
    $cat['subcategories'] = $sub->fetchAll();

    cacheSet($cacheKey, $cat, 300); // 5 minutes
    successResponse($cat);
}

function createCategory($db) {
    $data = !empty($_POST) ? $_POST : getJsonInput();

    if (!empty($data['_method']) && strtoupper($data['_method']) === 'PUT') {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/categories/(\d+)#', $uri, $m);
        $id = (int)($m[1] ?? 0);
        if (!$id) errorResponse('Category ID missing for update', 400);
        updateCategory($db, $id);
        return;
    }

    $name = trim($data['name'] ?? '');
    if (empty($name)) errorResponse('Category name is required', 400);
    $slug = uniqueSlug($db, 'categories', $data['slug'] ?? $name);
    $image = null;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['image'], 'categories');
        if ($r['success']) $image = $r['path'];
    }
    $stmt = $db->prepare("INSERT INTO categories (name,slug,description,image,icon,parent_id,sort_order,is_active,is_featured,meta_title,meta_description,focus_keyword) VALUES (:name,:slug,:desc,:img,:icon,:pid,:sort,:active,:feat,:mt,:md,:fk)");
    $stmt->execute([':name'=>$name,':slug'=>$slug,':desc'=>$data['description']??null,':img'=>$image??($data['image']??null),':icon'=>$data['icon']??null,':pid'=>!empty($data['parent_id'])?(int)$data['parent_id']:null,':sort'=>(int)($data['sort_order']??0),':active'=>(int)($data['is_active']??1),':feat'=>(int)($data['is_featured']??0),':mt'=>$data['meta_title']??null,':md'=>$data['meta_description']??null,':fk'=>$data['focus_keyword']??null]);

    $newId = (int)$db->lastInsertId();
    if (isset($data['countries'])) {
        syncCategoryCountries($db, $newId, $data['countries']);
    }

    // Clear category caches
    cacheClearPattern('categories_');
    successResponse(['id'=>$newId,'slug'=>$slug], 'Category created', 201);
}


function updateCategory($db, $id) {
    $rawInput = file_get_contents('php://input');
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $data = [];
    $uploadedFile = null;

    if (!empty($_POST)) {
        $data = $_POST;
        $uploadedFile = !empty($_FILES['image']) ? $_FILES['image'] : null;
    } elseif (strpos($contentType, 'multipart/form-data') !== false) {
        preg_match('/boundary=([^;]+)/', $contentType, $bm);
        if (!empty($bm[1])) {
            $boundary = trim($bm[1]);
            $parts = array_slice(explode('--' . $boundary, $rawInput), 1);
            foreach ($parts as $part) {
                if (trim($part) === '--') break;
                if (strpos($part, "\r\n\r\n") === false) continue;
                list($rawHeaders, $body) = explode("\r\n\r\n", $part, 2);
                $body = rtrim($body, "\r\n");
                $headers = [];
                foreach (explode("\r\n", $rawHeaders) as $hline) {
                    if (strpos($hline, ':') === false) continue;
                    list($hk, $hv) = explode(':', $hline, 2);
                    $headers[strtolower(trim($hk))] = trim($hv);
                }
                $disposition = $headers['content-disposition'] ?? '';
                preg_match('/name="([^"]+)"/', $disposition, $nm);
                if (empty($nm[1])) continue;
                $fieldName = $nm[1];
                preg_match('/filename="([^"]+)"/', $disposition, $fm);
                if (!empty($fm[1]) && !empty($headers['content-type'])) {
                    $tmpFile = tempnam(sys_get_temp_dir(), 'upload_');
                    file_put_contents($tmpFile, $body);
                    $uploadedFile = [
                        'name'     => $fm[1],
                        'type'     => $headers['content-type'],
                        'tmp_name' => $tmpFile,
                        'error'    => UPLOAD_ERR_OK,
                        'size'     => strlen($body)
                    ];
                } else {
                    $data[$fieldName] = $body;
                }
            }
        }
    } elseif (strpos($contentType, 'application/json') !== false) {
        $data = json_decode($rawInput, true) ?: [];
    }

    $name = trim($data['name'] ?? '');
    if (empty($name)) errorResponse('Category name is required', 400);
    $slug = uniqueSlug($db, 'categories', $data['slug'] ?? $name, $id);

    $existingStmt = $db->prepare('SELECT image FROM categories WHERE id = :id');
    $existingStmt->execute([':id' => $id]);
    $existing = $existingStmt->fetch();
    $image = $existing['image'] ?? null;

    if ($uploadedFile && $uploadedFile['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($uploadedFile, 'categories');
        if ($r['success']) $image = $r['path'];
    }

    $stmt = $db->prepare('UPDATE categories SET name=:name,slug=:slug,description=:desc,image=:img,icon=:icon,parent_id=:pid,sort_order=:sort,is_active=:active,is_featured=:feat,meta_title=:mt,meta_description=:md,focus_keyword=:fk WHERE id=:id');
    $stmt->execute([':id'=>$id,':name'=>$name,':slug'=>$slug,':desc'=>$data['description']??null,':img'=>$image,':icon'=>$data['icon']??null,':pid'=>!empty($data['parent_id'])?(int)$data['parent_id']:null,':sort'=>(int)($data['sort_order']??0),':active'=>(int)($data['is_active']??1),':feat'=>(int)($data['is_featured']??0),':mt'=>$data['meta_title']??null,':md'=>$data['meta_description']??null,':fk'=>$data['focus_keyword']??null]);

    if (isset($data['countries'])) {
        syncCategoryCountries($db, (int)$id, $data['countries']);
    }

    // Clear all category caches including slug cache
    cacheClearPattern('categories_');
    cacheClearPattern('category_slug_');
    successResponse(['id'=>$id,'slug'=>$slug], 'Category updated');
}

function deleteCategory($db, $id) {
    $check = $db->prepare("SELECT id, name FROM categories WHERE id = :id");
    $check->execute([':id' => $id]);
    $cat = $check->fetch();
    if (!$cat) errorResponse('Category not found', 404);

    try {
        $db->beginTransaction();
        $db->prepare("DELETE FROM product_categories WHERE category_id = :id")->execute([':id' => $id]);
        try { $db->prepare("DELETE FROM category_countries WHERE category_id = :id")->execute([':id' => $id]); } catch (Exception $e) {}
        $db->prepare("UPDATE categories SET parent_id = NULL WHERE parent_id = :id")->execute([':id' => $id]);
        $db->prepare("DELETE FROM categories WHERE id = :id")->execute([':id' => $id]);
        $db->commit();
        cacheClearPattern('categories_');
        cacheClearPattern('category_slug_');
        successResponse(['id' => $id], 'Category deleted');
    } catch (Exception $e) {
        $db->rollBack();
        errorResponse('Delete failed: ' . $e->getMessage(), 500);
    }
}
