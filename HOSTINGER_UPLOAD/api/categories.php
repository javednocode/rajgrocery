<?php
/**
 * Categories API
 */

function getCategories($db) {
    $isAdmin = isset($_GET['admin']) && $_GET['admin'] == '1';
    $where = $isAdmin ? '' : 'WHERE c.is_active = 1';
    $sql = "SELECT c.*, (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) as product_count FROM categories c $where ORDER BY c.sort_order ASC, c.name ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $categories = $stmt->fetchAll();
    $tree = buildCategoryTree($categories);
    successResponse($tree);
}

function getFeaturedCategories($db) {
    $stmt = $db->prepare("SELECT c.*, (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) as product_count FROM categories c WHERE c.is_active = 1 AND c.is_featured = 1 ORDER BY c.sort_order ASC LIMIT 12");
    $stmt->execute();
    successResponse($stmt->fetchAll());
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
    // Get subcategories
    $sub = $db->prepare("SELECT * FROM categories WHERE parent_id = :id AND is_active = 1 ORDER BY sort_order ASC");
    $sub->execute([':id' => $id]);
    $cat['subcategories'] = $sub->fetchAll();
    successResponse($cat);
}

function getCategoryBySlug($db, $slug) {
    $stmt = $db->prepare("SELECT * FROM categories WHERE slug = :slug AND is_active = 1");
    $stmt->execute([':slug' => $slug]);
    $cat = $stmt->fetch();
    if (!$cat) errorResponse('Category not found', 404);
    $sub = $db->prepare("SELECT * FROM categories WHERE parent_id = :id AND is_active = 1 ORDER BY sort_order ASC");
    $sub->execute([':id' => $cat['id']]);
    $cat['subcategories'] = $sub->fetchAll();
    successResponse($cat);
}

function createCategory($db) {
    $data = isset($_POST['name']) ? $_POST : getJsonInput();
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
    successResponse(['id'=>$db->lastInsertId(),'slug'=>$slug], 'Category created', 201);
}

function updateCategory($db, $id) {
    // PHP does not natively populate $_POST / $_FILES for PUT requests.
    // Admin sends multipart/form-data — we read & parse the raw stream.
    $rawInput = file_get_contents('php://input');
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $data = [];
    $uploadedFile = null;

    if (strpos($contentType, 'multipart/form-data') !== false) {
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
                // Check if it's a file
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
    } else {
        // Regular POST (fallback)
        $data = $_POST;
        $uploadedFile = !empty($_FILES['image']) ? $_FILES['image'] : null;
    }

    $name = trim($data['name'] ?? '');
    if (empty($name)) errorResponse('Category name is required', 400);
    $slug = uniqueSlug($db, 'categories', $data['slug'] ?? $name, $id);

    // Keep existing image unless a new one is uploaded
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
    successResponse(['id'=>$id,'slug'=>$slug], 'Category updated');
}

function deleteCategory($db, $id) {
    $stmt = $db->prepare("DELETE FROM categories WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) errorResponse('Category not found', 404);
    successResponse(['id' => $id], 'Category deleted');
}
