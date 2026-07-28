<?php
/**
 * Products API - Full CRUD with filtering, search, pagination
 * OPTIMIZED v2: 
 *   - getProducts() now uses JOIN instead of EXISTS subquery for category filter
 *   - Removed per-row correlated subqueries (category_names, primary_image)
 *   - Added file-based caching for category product pages (3 min TTL)
 *   - Slimmed public response payload (removed admin-only fields)
 *   - batchLoadImages uses N+1 fix
 */

/**
 * PHP doesn't parse multipart/form-data for PUT requests like it does for POST.
 * This helper manually reads & parses the raw input so PUT saves work correctly.
 */
function parseMultipartPut(): array {
    if (!empty($_POST)) return $_POST;
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $ct = $_SERVER['CONTENT_TYPE'] ?? '';
    if (!preg_match('/boundary=(.*)$/', $ct, $m)) return [];
    $boundary = '--' . trim($m[1]);
    $parts = array_slice(explode($boundary, $raw), 1);
    $data = [];
    foreach ($parts as $part) {
        if (trim($part) === '--') continue;
        [$headers, $body] = explode("\r\n\r\n", $part, 2);
        $body = rtrim($body, "\r\n");
        if (preg_match('/name="([^"]+)"/', $headers, $nm)) {
            $key = $nm[1];
            if (substr($key, -2) === '[]') {
                $k = substr($key, 0, -2);
                if (!isset($data[$k])) $data[$k] = [];
                $data[$k][] = $body;
            } else {
                $data[$key] = $body;
            }
        }
    }
    return $data;
}

/**
 * Batch-load product images for an array of product IDs.
 * Returns associative array: product_id => [images]
 * FIXES N+1 query problem
 */
function batchLoadImages($db, array $productIds): array {
    if (empty($productIds)) return [];
    $placeholders = implode(',', array_map('intval', $productIds));
    $stmt = $db->prepare(
        "SELECT product_id, image_path, alt_text, is_primary, sort_order
         FROM product_images
         WHERE product_id IN ($placeholders)
         ORDER BY product_id ASC, is_primary DESC, sort_order ASC"
    );
    $stmt->execute();
    $rows = $stmt->fetchAll();
    $map = [];
    foreach ($rows as $row) {
        $pid = $row['product_id'];
        if (!isset($map[$pid])) $map[$pid] = [];
        $map[$pid][] = $row;
    }
    return $map;
}

/**
 * Batch-load primary image only for product listing (lighter than full image batch)
 */
function batchLoadPrimaryImages($db, array $productIds): array {
    if (empty($productIds)) return [];
    $placeholders = implode(',', array_map('intval', $productIds));
    // One query: get the primary image (or first image) for each product
    $stmt = $db->prepare(
        "SELECT pi.product_id, pi.image_path 
         FROM product_images pi
         INNER JOIN (
             SELECT product_id, MIN(CASE WHEN is_primary = 1 THEN id ELSE id + 999999 END) as best_id
             FROM product_images 
             WHERE product_id IN ($placeholders)
             GROUP BY product_id
         ) best ON pi.product_id = best.product_id AND pi.id = best.best_id"
    );
    $stmt->execute();
    $rows = $stmt->fetchAll();
    $map = [];
    foreach ($rows as $row) {
        $map[$row['product_id']] = $row['image_path'];
    }
    return $map;
}

function batchLoadCategoryNames($db, array $productIds): array {
    if (empty($productIds)) return [];
    $placeholders = implode(',', array_map('intval', $productIds));
    $stmt = $db->prepare(
        "SELECT pc.product_id, GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ', ') as category_names
         FROM product_categories pc
         INNER JOIN categories c ON c.id = pc.category_id
         WHERE pc.product_id IN ($placeholders)
         GROUP BY pc.product_id"
    );
    $stmt->execute();
    $rows = $stmt->fetchAll();
    $map = [];
    foreach ($rows as $row) {
        $map[$row['product_id']] = $row['category_names'];
    }
    return $map;
}

function getProducts($db) {
    [$page, $perPage, $offset] = getPaginationParams();
    $where = [];
    $params = [];
    $joins = [];

    // Auth check: admin can see all, public only sees active
    $auth = optionalAuth();
    $isPublic = !$auth;

    if ($isPublic) {
        $where[] = "p.is_active = 1";
    }

    // Filter: is_active override (admin)
    if ($auth && isset($_GET['is_active']) && $_GET['is_active'] !== '') {
        $where[] = "p.is_active = :is_active";
        $params[':is_active'] = (int)$_GET['is_active'];
    }

    // Filter: category by slug — OPTIMIZED: use JOIN instead of correlated EXISTS subquery
    $hasCategoryFilter = false;
    if (!empty($_GET['category'])) {
        $hasCategoryFilter = true;
        $joins[] = "INNER JOIN product_categories pc_filter ON pc_filter.product_id = p.id";
        $joins[] = "INNER JOIN categories c_filter ON pc_filter.category_id = c_filter.id";
        $where[] = "c_filter.slug = :cat_slug";
        $params[':cat_slug'] = $_GET['category'];
    }

    // Filter: category by ID (admin)
    if (!empty($_GET['category_id'])) {
        if (!$hasCategoryFilter) {
            $joins[] = "INNER JOIN product_categories pc_filter ON pc_filter.product_id = p.id";
        }
        $where[] = "pc_filter.category_id = :cat_id";
        $params[':cat_id'] = (int)$_GET['category_id'];
    }

    // Filter: country marketplace — accepts ?country=code OR ?country_id=N (admin usage)
    // Only show products explicitly assigned to the selected country.
    $countryParam = $_GET['country'] ?? '';
    $countryIdDirect = (int)($_GET['country_id'] ?? 0);
    if ($countryIdDirect > 0) {
        // Admin panel: strict filter by country ID
        $joins[] = "INNER JOIN product_countries pcty ON pcty.product_id = p.id AND pcty.country_id = " . $countryIdDirect;
    } elseif ($countryParam !== '') {
        $countryId = resolveCountryId($db, $countryParam);
        if ($countryId) {
            $joins[] = "INNER JOIN product_countries pcty ON pcty.product_id = p.id AND pcty.country_id = " . (int)$countryId;
        }
        // If country code can't be resolved, show all products (no filter applied)
    }

    // Filter: stock
    if (!empty($_GET['stock_filter'])) {
        switch ($_GET['stock_filter']) {
            case 'out': $where[] = "p.stock <= 0"; break;
            case 'low': $where[] = "p.stock > 0 AND p.stock <= 5"; break;
            case 'in':  $where[] = "p.stock > 5"; break;
        }
    }

    if (!empty($_GET['min_price'])) { $where[] = "COALESCE(p.sale_price, p.price) >= :min_price"; $params[':min_price'] = (float)$_GET['min_price']; }
    if (!empty($_GET['max_price'])) { $where[] = "COALESCE(p.sale_price, p.price) <= :max_price"; $params[':max_price'] = (float)$_GET['max_price']; }
    if (!empty($_GET['brand'])) { $where[] = "p.brand = :brand"; $params[':brand'] = $_GET['brand']; }
    if (isset($_GET['in_stock']) && $_GET['in_stock'] === '1') { $where[] = "p.stock > 0"; }
    
    // Filter: sale products
    if (isset($_GET['is_sale']) && $_GET['is_sale'] == '1') {
        $where[] = "p.sale_price IS NOT NULL AND p.sale_price > 0";
    }

    // Search — use LIKE
    if (!empty($_GET['q'])) {
        $q = trim($_GET['q']);
        $where[] = "(p.name LIKE :search OR p.sku LIKE :search2 OR p.short_description LIKE :search3)";
        $params[':search']  = '%' . $q . '%';
        $params[':search2'] = '%' . $q . '%';
        $params[':search3'] = '%' . $q . '%';
    }

    if (empty($where)) $where[] = '1=1';
    $whereClause = 'WHERE ' . implode(' AND ', $where);
    $joinClause = implode(' ', $joins);

    // Sort
    $sortCol = $_GET['sort'] ?? 'newest';
    $sortDir = strtolower($_GET['dir'] ?? 'asc') === 'desc' ? 'DESC' : 'ASC';
    $sortMap = [
        'name'       => "p.name $sortDir",
        'price'      => "COALESCE(p.sale_price,p.price) $sortDir",
        'stock'      => "p.stock $sortDir",
        'price_asc'  => 'COALESCE(p.sale_price,p.price) ASC',
        'price_desc' => 'COALESCE(p.sale_price,p.price) DESC',
        'name_asc'   => 'p.name ASC',
        'newest'     => 'p.created_at DESC',
        'popular'    => 'p.sales_count DESC',
    ];
    $sort = $sortMap[$sortCol] ?? 'p.created_at DESC';

    // Try cache for public category pages (the most common case)
    $cacheKey = null;
    if ($isPublic && $hasCategoryFilter) {
        $cacheKey = "cat_products_{$_GET['category']}_{$sortCol}_{$page}_{$perPage}_c" . preg_replace('/[^a-z0-9]/', '', strtolower($countryParam));
        $cached = cacheGet($cacheKey);
        if ($cached !== null) {
            // Return cached response directly
            jsonResponse($cached);
            return;
        }
    }

    // COUNT — use same JOIN for accuracy
    $countStmt = $db->prepare("SELECT COUNT(*) FROM products p $joinClause $whereClause");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();

    // PUBLIC: slim query (only fields the frontend actually uses)
    if ($isPublic) {
        $sql = "SELECT p.id, p.name, p.slug, p.short_description, p.price, p.sale_price,
            p.stock, p.unit, p.brand, p.is_featured, p.is_trending, p.is_new
            FROM products p $joinClause $whereClause ORDER BY $sort LIMIT :lim OFFSET :off";
    } else {
        // ADMIN: full query with all fields. Images/categories are batched below.
        $sql = "SELECT p.id, p.name, p.slug, p.short_description, p.price, p.sale_price,
            p.cost_price, p.sku, p.stock, p.low_stock_threshold, p.weight, p.unit,
            p.brand, p.is_active, p.is_featured, p.is_trending, p.is_new,
            p.sales_count, p.views, p.created_at, p.updated_at,
            p.meta_title, p.meta_description
            FROM products p $joinClause $whereClause ORDER BY $sort LIMIT :lim OFFSET :off";
    }

    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $products = $stmt->fetchAll();

    // For PUBLIC: batch-load primary images only (product cards only need 1 image)
    if ($isPublic && !empty($products)) {
        $productIds = array_column($products, 'id');
        $primaryMap = batchLoadPrimaryImages($db, $productIds);
        $countryMap = batchLoadProductCountries($db, $productIds);
        foreach ($products as &$p) {
            $p['primary_image'] = $primaryMap[$p['id']] ?? null;
            $p['countries'] = $countryMap[$p['id']] ?? [];
        }
        unset($p);
    }

    if (!$isPublic && !empty($products)) {
        $productIds = array_column($products, 'id');
        $primaryMap = batchLoadPrimaryImages($db, $productIds);
        $categoryMap = batchLoadCategoryNames($db, $productIds);
        $countryMap = batchLoadProductCountries($db, $productIds);
        foreach ($products as &$p) {
            $p['primary_image'] = $primaryMap[$p['id']] ?? null;
            $p['category_names'] = $categoryMap[$p['id']] ?? '';
            $p['countries'] = $countryMap[$p['id']] ?? [];
        }
        unset($p);
    }

    $response = [
        'success' => true,
        'data' => $products,
        'pagination' => [
            'total' => (int)$total,
            'page' => (int)$page,
            'per_page' => (int)$perPage,
            'total_pages' => ceil($total / $perPage)
        ]
    ];

    // Cache public category pages for 3 minutes
    if ($cacheKey) {
        cacheSet($cacheKey, $response, 180);
    }

    jsonResponse($response);
}

/**
 * Auto-create country_product_flags table if it doesn't exist.
 */
function ensureCountryFlagsTable(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    $db->exec("CREATE TABLE IF NOT EXISTS country_product_flags (
        id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        country_id  INT NOT NULL,
        product_id  INT NOT NULL,
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        is_trending TINYINT(1) NOT NULL DEFAULT 0,
        sort_order  INT NOT NULL DEFAULT 0,
        UNIQUE KEY uniq_country_product (country_id, product_id),
        KEY idx_country_featured (country_id, is_featured),
        KEY idx_country_trending (country_id, is_trending)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

function getFeaturedProducts($db) {
    $limit = min(20, (int)($_GET['limit'] ?? 8));
    $countryParam = strtolower(preg_replace('/[^a-z0-9]/', '', $_GET['country'] ?? ''));
    $cacheKey = "products_featured_{$limit}_c{$countryParam}";

    $cached = cacheGet($cacheKey);
    if ($cached !== null) { successResponse($cached); return; }

    if ($countryParam !== '') {
        // Per-country: read from country_product_flags
        ensureCountryFlagsTable($db);
        $countryId = resolveCountryId($db, $countryParam);
        if (!$countryId) { successResponse([]); return; }

        $stmt = $db->prepare("
            SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.stock,
                p.brand, p.is_featured, p.sales_count, p.unit
            FROM products p
            INNER JOIN country_product_flags cpf ON cpf.product_id = p.id
                AND cpf.country_id = :cid AND cpf.is_featured = 1
            WHERE p.is_active = 1
            ORDER BY cpf.sort_order ASC, p.created_at DESC
            LIMIT :lim
        ");
        $stmt->bindValue(':cid', $countryId, PDO::PARAM_INT);
    } else {
        // Global fallback: use is_featured flag on products table
        $stmt = $db->prepare("
            SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.stock,
                p.brand, p.is_featured, p.sales_count, p.unit
            FROM products p
            WHERE p.is_active = 1 AND p.is_featured = 1
            ORDER BY p.created_at DESC
            LIMIT :lim
        ");
    }
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $products = $stmt->fetchAll();

    if (!empty($products)) {
        $primaryMap = batchLoadPrimaryImages($db, array_column($products, 'id'));
        $countryMap = batchLoadProductCountries($db, array_column($products, 'id'));
        foreach ($products as &$p) {
            $p['primary_image'] = $primaryMap[$p['id']] ?? null;
            $p['countries'] = $countryMap[$p['id']] ?? [];
        }
        unset($p);
    }

    cacheSet($cacheKey, $products, 300);
    successResponse($products);
}

function toggleProductFeatured($db, $id) {
    $data      = getJsonInput();
    $val       = isset($data['is_featured']) ? (int)$data['is_featured'] : null;
    $countryId = !empty($data['country_id']) ? (int)$data['country_id'] : null;
    if ($val === null) errorResponse('is_featured value required (0 or 1)', 400);

    if ($countryId) {
        // Per-country flag
        ensureCountryFlagsTable($db);
        $db->prepare("INSERT INTO country_product_flags (country_id, product_id, is_featured)
            VALUES (:c, :p, :f)
            ON DUPLICATE KEY UPDATE is_featured = :f2")
           ->execute([':c' => $countryId, ':p' => (int)$id, ':f' => $val, ':f2' => $val]);
    } else {
        // Global flag fallback
        $stmt = $db->prepare("UPDATE products SET is_featured = :f WHERE id = :id");
        $stmt->execute([':f' => $val, ':id' => (int)$id]);
        if ($stmt->rowCount() === 0) errorResponse('Product not found', 404);
    }
    cacheClearPattern('products_featured_');
    successResponse(['id' => (int)$id, 'is_featured' => $val, 'country_id' => $countryId],
        $val ? 'Product added to featured' : 'Product removed from featured');
}

function clearAllFeatured($db) {
    $data      = getJsonInput();
    $countryId = !empty($data['country_id']) ? (int)$data['country_id'] : null;

    if ($countryId) {
        ensureCountryFlagsTable($db);
        $stmt = $db->prepare("UPDATE country_product_flags SET is_featured = 0 WHERE country_id = :c AND is_featured = 1");
        $stmt->execute([':c' => $countryId]);
    } else {
        $stmt = $db->prepare("UPDATE products SET is_featured = 0 WHERE is_featured = 1");
        $stmt->execute();
    }
    cacheClearPattern('products_featured_');
    successResponse(['cleared' => $stmt->rowCount()], 'All featured products cleared');
}

function getTrendingProducts($db) {
    $limit = min(50, (int)($_GET['limit'] ?? 12));
    $countryParam = strtolower(preg_replace('/[^a-z0-9]/', '', $_GET['country'] ?? ''));
    $cacheKey = "products_trending_{$limit}_c{$countryParam}";

    $cached = cacheGet($cacheKey);
    if ($cached !== null) { successResponse($cached); return; }

    if ($countryParam !== '') {
        ensureCountryFlagsTable($db);
        $countryId = resolveCountryId($db, $countryParam);
        if (!$countryId) { successResponse([]); return; }

        $stmt = $db->prepare("
            SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.stock,
                p.brand, p.is_trending, p.sales_count, p.unit
            FROM products p
            INNER JOIN country_product_flags cpf ON cpf.product_id = p.id
                AND cpf.country_id = :cid AND cpf.is_trending = 1
            WHERE p.is_active = 1
            ORDER BY cpf.sort_order ASC, p.sales_count DESC
            LIMIT :lim
        ");
        $stmt->bindValue(':cid', $countryId, PDO::PARAM_INT);
    } else {
        $stmt = $db->prepare("
            SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.stock,
                p.brand, p.is_trending, p.sales_count, p.unit
            FROM products p
            WHERE p.is_active = 1 AND p.is_trending = 1
            ORDER BY p.sales_count DESC, p.id ASC
            LIMIT :lim
        ");
    }
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $products = $stmt->fetchAll();

    if (!empty($products)) {
        $primaryMap = batchLoadPrimaryImages($db, array_column($products, 'id'));
        $countryMap = batchLoadProductCountries($db, array_column($products, 'id'));
        foreach ($products as &$p) {
            $p['primary_image'] = $primaryMap[$p['id']] ?? null;
            $p['countries'] = $countryMap[$p['id']] ?? [];
        }
        unset($p);
    }

    cacheSet($cacheKey, $products, 300);
    successResponse($products);
}

/**
 * Toggle a single product's is_trending flag (per-country or global)
 */
function toggleProductTrending($db, $id) {
    $data      = getJsonInput();
    $val       = isset($data['is_trending']) ? (int)$data['is_trending'] : null;
    $countryId = !empty($data['country_id']) ? (int)$data['country_id'] : null;
    if ($val === null) errorResponse('is_trending value required (0 or 1)', 400);

    if ($countryId) {
        ensureCountryFlagsTable($db);
        $db->prepare("INSERT INTO country_product_flags (country_id, product_id, is_trending)
            VALUES (:c, :p, :t)
            ON DUPLICATE KEY UPDATE is_trending = :t2")
           ->execute([':c' => $countryId, ':p' => (int)$id, ':t' => $val, ':t2' => $val]);
    } else {
        $stmt = $db->prepare("UPDATE products SET is_trending = :t WHERE id = :id");
        $stmt->execute([':t' => $val, ':id' => (int)$id]);
        if ($stmt->rowCount() === 0) errorResponse('Product not found', 404);
    }
    cacheClearPattern('products_trending_');
    successResponse(['id' => (int)$id, 'is_trending' => $val, 'country_id' => $countryId],
        $val ? 'Product added to trending' : 'Product removed from trending');
}

function clearAllTrending($db) {
    $data      = getJsonInput();
    $countryId = !empty($data['country_id']) ? (int)$data['country_id'] : null;

    if ($countryId) {
        ensureCountryFlagsTable($db);
        $stmt = $db->prepare("UPDATE country_product_flags SET is_trending = 0 WHERE country_id = :c AND is_trending = 1");
        $stmt->execute([':c' => $countryId]);
    } else {
        $stmt = $db->prepare("UPDATE products SET is_trending = 0 WHERE is_trending = 1");
        $stmt->execute();
    }
    cacheClearPattern('products_trending_');
    successResponse(['cleared' => $stmt->rowCount()], 'All trending products cleared');
}

function searchProducts($db) {
    $q = trim($_GET['q'] ?? '');
    if (strlen($q) < 2) errorResponse('Search query too short', 400);

    $countryParam = strtolower(preg_replace('/[^a-z0-9]/', '', $_GET['country'] ?? ''));
    $cacheKey = 'search_' . md5($q . '|' . $countryParam);
    $cached = cacheGet($cacheKey);
    if ($cached !== null) {
        successResponse($cached);
        return;
    }

    $join = '';
    if ($countryParam !== '') {
        $countryId = resolveCountryId($db, $countryParam);
        if (!$countryId) { successResponse([]); return; }
        $join = "INNER JOIN product_countries pcty ON pcty.product_id = p.id AND pcty.country_id = " . (int)$countryId;
    }

    // Clean query — no correlated subqueries
    $stmt = $db->prepare("
        SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.stock, p.brand, p.unit
        FROM products p
        $join
        WHERE p.is_active = 1
          AND (p.name LIKE :q1 OR p.brand LIKE :q2 OR p.short_description LIKE :q3)
        ORDER BY
            CASE WHEN p.name LIKE :q4 THEN 0 ELSE 1 END,
            p.sales_count DESC
        LIMIT 15
    ");
    $s = "%{$q}%";
    $sStart = "{$q}%";
    $stmt->execute([':q1' => $s, ':q2' => $s, ':q3' => $s, ':q4' => $sStart]);
    $results = $stmt->fetchAll();

    // Batch primary images + countries
    if (!empty($results)) {
        $primaryMap = batchLoadPrimaryImages($db, array_column($results, 'id'));
        $countryMap = batchLoadProductCountries($db, array_column($results, 'id'));
        foreach ($results as &$r) {
            $r['primary_image'] = $primaryMap[$r['id']] ?? null;
            $r['countries'] = $countryMap[$r['id']] ?? [];
        }
        unset($r);
    }

    cacheSet($cacheKey, $results, 120);
    successResponse($results);
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
    $ctyMap = batchLoadProductCountries($db, [(int)$id]);
    $p['countries'] = $ctyMap[(int)$id] ?? [];
    try {
        $vs = $db->prepare("SELECT * FROM product_variations WHERE product_id = :pid ORDER BY sort_order ASC, id ASC");
        $vs->execute([':pid' => $id]);
        $p['variations'] = $vs->fetchAll();
    } catch (Exception $e) { $p['variations'] = []; }
    successResponse($p);
}

function getProductBySlug($db, $slug) {
    // Cache product detail pages (2 minute TTL)
    $cacheKey = "product_detail_{$slug}";
    $cached = cacheGet($cacheKey);
    if ($cached !== null) {
        // Fire-and-forget view increment (non-blocking)
        try { $db->prepare("UPDATE products SET views = views + 1 WHERE slug = :s")->execute([':s' => $slug]); } catch (Exception $e) {}
        successResponse($cached);
        return;
    }

    $stmt = $db->prepare("SELECT * FROM products WHERE slug = :slug AND is_active = 1");
    $stmt->execute([':slug' => $slug]);
    $p = $stmt->fetch();
    if (!$p) errorResponse('Product not found', 404);

    $pid = $p['id'];

    // 1 query: images + categories + variations combined via multi-statement
    // Images
    $is = $db->prepare("SELECT * FROM product_images WHERE product_id = :pid ORDER BY is_primary DESC, sort_order ASC");
    $is->execute([':pid' => $pid]);
    $p['images'] = $is->fetchAll();

    // Categories
    $cs = $db->prepare("SELECT c.id, c.name, c.slug FROM product_categories pc JOIN categories c ON pc.category_id = c.id WHERE pc.product_id = :pid");
    $cs->execute([':pid' => $pid]);
    $p['categories'] = $cs->fetchAll();

    // Countries (origin worlds)
    $ctyMap = batchLoadProductCountries($db, [(int)$pid]);
    $p['countries'] = $ctyMap[(int)$pid] ?? [];

    // Variations
    try {
        $vs = $db->prepare("SELECT * FROM product_variations WHERE product_id = :pid AND is_active = 1 ORDER BY sort_order ASC, id ASC");
        $vs->execute([':pid' => $pid]);
        $p['variations'] = $vs->fetchAll();
    } catch (Exception $e) { $p['variations'] = []; }

    // Related products — clean query, no correlated subqueries
    // Use category IDs we already have to avoid a nested SELECT
    $catIds = array_column($p['categories'], 'id');
    if (!empty($catIds)) {
        $catPlaceholders = implode(',', array_map('intval', $catIds));
        $relStmt = $db->prepare("
            SELECT DISTINCT p2.id, p2.name, p2.slug, p2.price, p2.sale_price, p2.stock, p2.unit
            FROM products p2
            INNER JOIN product_categories pc ON p2.id = pc.product_id
            WHERE pc.category_id IN ($catPlaceholders)
              AND p2.id != :pid
              AND p2.is_active = 1
            ORDER BY p2.sales_count DESC
            LIMIT 6
        ");
        $relStmt->execute([':pid' => $pid]);
        $related = $relStmt->fetchAll();

        // Batch images for related products (1 query instead of 6 subqueries)
        if (!empty($related)) {
            $relPrimaryMap = batchLoadPrimaryImages($db, array_column($related, 'id'));
            foreach ($related as &$r) {
                $r['primary_image'] = $relPrimaryMap[$r['id']] ?? null;
            }
            unset($r);
        }
        $p['related_products'] = $related;
    } else {
        $p['related_products'] = [];
    }

    // Cache for 2 minutes
    cacheSet($cacheKey, $p, 120);

    // View increment (non-critical)
    try { $db->prepare("UPDATE products SET views = views + 1 WHERE id = :id")->execute([':id' => $pid]); } catch (Exception $e) {}

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
    if (isset($data['countries'])) {
        syncProductCountries($db, (int)$pid, $data['countries']);
    }
    if (!empty($_FILES['images'])) {
        $files = $_FILES['images'];
        $count = is_array($files['name']) ? count($files['name']) : 1;
        for ($i = 0; $i < $count; $i++) {
            $file = ['name'=>is_array($files['name'])?$files['name'][$i]:$files['name'],'tmp_name'=>is_array($files['tmp_name'])?$files['tmp_name'][$i]:$files['tmp_name'],'size'=>is_array($files['size'])?$files['size'][$i]:$files['size'],'error'=>is_array($files['error'])?$files['error'][$i]:$files['error']];
            if ($file['error']===UPLOAD_ERR_OK) { $r=uploadImage($file,'products'); if($r['success']) { $db->prepare("INSERT INTO product_images (product_id,image_path,is_primary,sort_order) VALUES (:p,:path,:pri,:s)")->execute([':p'=>$pid,':path'=>$r['path'],':pri'=>($i===0)?1:0,':s'=>$i]); } }
        }
    }
    // Clear all product caches on create
    cacheClearPattern('products_');
    cacheClearPattern('cat_products_');
    successResponse(['id'=>$pid,'slug'=>$slug], 'Product created', 201);
}

function updateProduct($db, $id) {
    $method = $_SERVER['REQUEST_METHOD'];
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (!empty($_POST)) {
        $data = $_POST;
    } elseif ($method === 'PUT' && strpos($contentType, 'multipart') !== false) {
        $data = parseMultipartPut();
    } else {
        $data = getJsonInput();
    }

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
    if (isset($data['countries'])) {
        syncProductCountries($db, (int)$id, $data['countries']);
    }
    if (!empty($_FILES['images']['name'][0]) || !empty($_FILES['images']['name'])) {
        $files = $_FILES['images'];
        $count = is_array($files['name']) ? count($files['name']) : 1;
        $hasPrimary = $db->prepare("SELECT COUNT(*) FROM product_images WHERE product_id = :pid AND is_primary = 1");
        $hasPrimary->execute([':pid' => $id]);
        $primaryExists = (int)$hasPrimary->fetchColumn() > 0;
        for ($i = 0; $i < $count; $i++) {
            $file = [
                'name'     => is_array($files['name'])     ? $files['name'][$i]     : $files['name'],
                'tmp_name' => is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'],
                'size'     => is_array($files['size'])     ? $files['size'][$i]     : $files['size'],
                'error'    => is_array($files['error'])    ? $files['error'][$i]    : $files['error'],
            ];
            if ($file['error'] === UPLOAD_ERR_OK) {
                $r = uploadImage($file, 'products');
                if ($r['success']) {
                    $makePrimary = (!$primaryExists && $i === 0) ? 1 : 0;
                    $is = $db->prepare("INSERT INTO product_images (product_id,image_path,is_primary,sort_order) VALUES (:p,:path,:pri,:s)");
                    $is->execute([':p' => $id, ':path' => $r['path'], ':pri' => $makePrimary, ':s' => $i]);
                    if ($makePrimary) $primaryExists = true;
                }
            }
        }
    }
    // Invalidate caches
    cacheClearPattern('products_');
    cacheClearPattern('cat_products_');
    successResponse(['id'=>$id,'slug'=>$slug], 'Product updated');
}

function deleteProduct($db, $id) {
    $is = $db->prepare("SELECT image_path FROM product_images WHERE product_id = :pid"); $is->execute([':pid'=>$id]);
    while ($img = $is->fetch()) deleteImage($img['image_path']);
    $vs = $db->prepare("SELECT image_path FROM product_variations WHERE product_id = :pid AND image_path IS NOT NULL"); $vs->execute([':pid'=>$id]);
    while ($v = $vs->fetch()) deleteImage($v['image_path']);
    try { $db->prepare("DELETE FROM product_countries WHERE product_id = :pid")->execute([':pid'=>$id]); } catch (Exception $e) {}
    $stmt = $db->prepare("DELETE FROM products WHERE id = :id"); $stmt->execute([':id'=>$id]);
    if ($stmt->rowCount()===0) errorResponse('Product not found', 404);
    cacheClearPattern('products_');
    cacheClearPattern('cat_products_');
    successResponse(null, 'Product deleted');
}

function deleteProductImage($db, $imageId) {
    $stmt = $db->prepare("SELECT * FROM product_images WHERE id = :id");
    $stmt->execute([':id' => $imageId]);
    $img = $stmt->fetch();
    if (!$img) errorResponse('Image not found', 404);
    deleteImage($img['image_path']);
    $db->prepare("DELETE FROM product_images WHERE id = :id")->execute([':id' => $imageId]);
    if ($img['is_primary']) {
        $next = $db->prepare("SELECT id FROM product_images WHERE product_id = :pid ORDER BY sort_order ASC LIMIT 1");
        $next->execute([':pid' => $img['product_id']]);
        $n = $next->fetch();
        if ($n) {
            $db->prepare("UPDATE product_images SET is_primary = 1 WHERE id = :id")->execute([':id' => $n['id']]);
        }
    }
    successResponse(null, 'Image deleted');
}

// ============================================
// VARIATION CRUD — table creation moved to migration SQL
// ============================================

function ensureVariationsTable($db) {
    static $checked = false;
    if ($checked) return;
    $checked = true;
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS product_variations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            sku VARCHAR(100) DEFAULT NULL,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            sale_price DECIMAL(10,2) DEFAULT NULL,
            stock INT NOT NULL DEFAULT 0,
            image_path VARCHAR(500) DEFAULT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (Exception $e) { /* ignore if already exists */ }
}

function getVariations($db, $productId) {
    ensureVariationsTable($db);
    try {
        $stmt = $db->prepare("SELECT * FROM product_variations WHERE product_id = :pid ORDER BY sort_order ASC, id ASC");
        $stmt->execute([':pid' => $productId]);
        successResponse($stmt->fetchAll());
    } catch (Exception $e) {
        successResponse([]);
    }
}

function createVariation($db, $productId) {
    ensureVariationsTable($db);
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
    // PHP does NOT populate $_POST or $_FILES for PUT multipart requests.
    // The frontend sends FormData via PUT, so we must parse php://input manually.
    $method = $_SERVER['REQUEST_METHOD'];
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (!empty($_POST['name'])) {
        $data = $_POST;
    } elseif ($method === 'PUT' && strpos($contentType, 'multipart') !== false) {
        $data = parseMultipartPut();
        // Also parse files from raw multipart for PUT
        if (!empty($_FILES['image'])) {
            // $_FILES may work on some servers for PUT — keep as-is
        }
    } else {
        $data = getJsonInput();
    }
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

function bulkProductAction($db) {
    $data = getJsonInput();
    $action = $data['action'] ?? '';
    $ids    = $data['ids'] ?? [];
    if (empty($ids) || !is_array($ids)) errorResponse('No product IDs provided', 400);
    $ids = array_filter(array_map('intval', $ids));
    if (empty($ids)) errorResponse('Invalid product IDs', 400);
    $placeholders = implode(',', $ids);

    switch ($action) {
        case 'enable':
            $db->exec("UPDATE products SET is_active = 1 WHERE id IN ($placeholders)");
            cacheClearPattern('products_');
            cacheClearPattern('cat_products_');
            successResponse(['affected' => count($ids)], 'Products enabled');
            break;
        case 'disable':
            $db->exec("UPDATE products SET is_active = 0 WHERE id IN ($placeholders)");
            cacheClearPattern('products_');
            cacheClearPattern('cat_products_');
            successResponse(['affected' => count($ids)], 'Products disabled');
            break;
        case 'delete':
            $db->exec("DELETE FROM product_categories WHERE product_id IN ($placeholders)");
            $db->exec("DELETE FROM products WHERE id IN ($placeholders)");
            cacheClearPattern('products_');
            cacheClearPattern('cat_products_');
            successResponse(['affected' => count($ids)], 'Products deleted');
            break;
        case 'mark_featured':
            $db->exec("UPDATE products SET is_featured = 1 WHERE id IN ($placeholders)");
            cacheClearPattern('products_featured_');
            cacheClearPattern('cat_products_');
            successResponse(['affected' => count($ids)], 'Products marked featured');
            break;
        case 'unmark_featured':
            $db->exec("UPDATE products SET is_featured = 0 WHERE id IN ($placeholders)");
            cacheClearPattern('products_featured_');
            cacheClearPattern('cat_products_');
            successResponse(['affected' => count($ids)], 'Products removed from featured');
            break;
        case 'set_category':
            $categoryId = intval($data['category_id'] ?? 0);
            $sourceCategoryId = intval($data['source_category_id'] ?? 0);
            if (!$categoryId) errorResponse('Category ID required', 400);
            $catCheck = $db->prepare("SELECT id FROM categories WHERE id = :id");
            $catCheck->execute([':id' => $categoryId]);
            if (!$catCheck->fetch()) errorResponse('Category not found', 404);
            if ($sourceCategoryId && $sourceCategoryId !== $categoryId) {
                $delStmt = $db->prepare("DELETE FROM product_categories WHERE product_id IN ($placeholders) AND category_id = :scid");
                $delStmt->execute([':scid' => $sourceCategoryId]);
            }
            $stmt = $db->prepare("INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (:pid, :cid)");
            foreach ($ids as $pid) { $stmt->execute([':pid' => $pid, ':cid' => $categoryId]); }
            cacheClearPattern('cat_products_');
            $msg = $sourceCategoryId ? 'Products moved to new category' : 'Category assigned to products';
            successResponse(['affected' => count($ids)], $msg);
            break;
        case 'add_category':
            $categoryId = intval($data['category_id'] ?? 0);
            if (!$categoryId) errorResponse('Category ID required', 400);
            $stmt = $db->prepare("INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (:pid, :cid)");
            foreach ($ids as $pid) { $stmt->execute([':pid' => $pid, ':cid' => $categoryId]); }
            cacheClearPattern('cat_products_');
            successResponse(['affected' => count($ids)], 'Category added to products');
            break;
        case 'remove_category':
            $categoryId = intval($data['category_id'] ?? 0);
            if (!$categoryId) errorResponse('Category ID required', 400);
            $stmt = $db->prepare("DELETE FROM product_categories WHERE product_id IN ($placeholders) AND category_id = :cid");
            $stmt->execute([':cid' => $categoryId]);
            cacheClearPattern('cat_products_');
            successResponse(['affected' => count($ids)], 'Category removed from products');
            break;
        case 'set_stock':
            $stock = intval($data['stock'] ?? 0);
            $db->exec("UPDATE products SET stock = $stock WHERE id IN ($placeholders)");
            cacheClearPattern('cat_products_');
            successResponse(['affected' => count($ids)], 'Stock updated');
            break;
        default:
            errorResponse("Unknown action: $action", 400);
    }
}
