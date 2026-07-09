<?php
/**
 * Product Migration API
 * Routes are mounted from backend/index.php under /api/product-migration.
 */

requireAuth();
require_once __DIR__ . '/../helpers/import_queue.php';
if (!class_exists('SimpleXLSX')) {
    require_once __DIR__ . '/../helpers/SimpleXLSX.php';
}

function productMigrationHandle(PDO $db, string $method, string $uri): void {
    pm_ensure_schema($db);

    if ($method === 'POST' && preg_match('#^/api/product-migration/jobs/?$#', $uri)) {
        productMigrationCreateJob($db);
        return;
    }
    if ($method === 'GET' && preg_match('#^/api/product-migration/jobs/?$#', $uri)) {
        successResponse(pm_list_jobs($db, 80));
        return;
    }
    if ($method === 'GET' && preg_match('#^/api/product-migration/jobs/(\d+)/?$#', $uri, $m)) {
        successResponse(pm_get_job($db, (int)$m[1]));
        return;
    }
    if ($method === 'POST' && preg_match('#^/api/product-migration/jobs/(\d+)/process/?$#', $uri, $m)) {
        $body = productMigrationInput();
        successResponse(pm_process_job($db, (int)$m[1], (int)($body['limit'] ?? 25)));
        return;
    }
    if ($method === 'GET' && preg_match('#^/api/product-migration/jobs/(\d+)/logs/?$#', $uri, $m)) {
        successResponse(pm_get_logs($db, (int)$m[1], (int)($_GET['limit'] ?? 300)));
        return;
    }
    if ($method === 'POST' && preg_match('#^/api/product-migration/jobs/(\d+)/rollback/?$#', $uri, $m)) {
        require_once __DIR__ . '/products.php';
        successResponse(productMigrationRollback($db, (int)$m[1]));
        return;
    }
    if ($method === 'GET' && preg_match('#^/api/product-migration/jobs/(\d+)/report/?$#', $uri, $m)) {
        productMigrationReport($db, (int)$m[1]);
        return;
    }
    if ($method === 'GET' && preg_match('#^/api/product-migration/mappings/?$#', $uri)) {
        productMigrationMappings($db);
        return;
    }
    if ($method === 'POST' && preg_match('#^/api/product-migration/mappings/?$#', $uri)) {
        productMigrationSaveMapping($db);
        return;
    }

    errorResponse('Unknown product migration route', 404);
}

function productMigrationInput(): array {
    if (!empty($_POST)) return $_POST;
    $json = json_decode(file_get_contents('php://input'), true);
    return is_array($json) ? $json : [];
}

function productMigrationCreateJob(PDO $db): void {
    $data = productMigrationInput();
    $method = strtolower(trim((string)($data['method'] ?? $_POST['method'] ?? '')));
    $duplicate = $data['duplicate_strategy'] ?? 'skip';
    if (!in_array($duplicate, ['skip','update','copy'], true)) $duplicate = 'skip';
    if (!in_array($method, ['scraper','woocommerce','shopify','csv','xml'], true)) {
        errorResponse('Unsupported import method', 400);
    }

    $max = max(1, min(10000, (int)($data['limit'] ?? 500)));
    $sourceUrl = trim((string)($data['source_url'] ?? $data['url'] ?? ''));
    $importType = (string)($data['import_type'] ?? 'entire');
    $options = $data;

    try {
        $products = match ($method) {
            'scraper' => productMigrationScraperProducts($data, $max),
            'woocommerce' => productMigrationWooProducts($data, $max),
            'shopify' => productMigrationShopifyProducts($data, $max),
            'csv' => productMigrationCsvProducts($data),
            'xml' => productMigrationXmlProducts($data, $max),
        };
    } catch (Throwable $e) {
        errorResponse($e->getMessage(), 422);
    }

    if (!$products) errorResponse('No products found for import', 422);

    $mappingToSave = $data['mapping'] ?? null;
    if (is_string($mappingToSave)) $mappingToSave = json_decode($mappingToSave, true);
    if (!empty($data['mapping_name']) && is_array($mappingToSave) && $mappingToSave && in_array($method, ['csv','xml'], true)) {
        productMigrationStoreMapping($db, (string)$data['mapping_name'], $method, $mappingToSave);
    }

    $job = pm_create_job($db, $method, $sourceUrl ?: null, $importType, $duplicate, $products, $options);
    successResponse($job, 'Migration job created', 201);
}

function productMigrationScraperProducts(array $data, int $max): array {
    $url = pm_validate_public_url((string)($data['source_url'] ?? $data['url'] ?? ''));
    $type = (string)($data['import_type'] ?? 'entire');
    $type = match ($type) {
        'selected_category', 'category' => 'category',
        'single_product', 'single' => 'single',
        default => 'entire',
    };

    if ($type !== 'single') {
        $wooPublicProducts = productMigrationWooStorePublicProducts($url, $max);
        if ($wooPublicProducts) return $wooPublicProducts;

        $shopifyPublicProducts = productMigrationShopifyPublicProducts(
            $url,
            $type === 'category' ? ($data['category_url'] ?? null) : null,
            $max
        );
        if ($shopifyPublicProducts) return $shopifyPublicProducts;
    }

    $urls = pm_discover_product_urls(
        $url,
        $type,
        $data['category_url'] ?? null,
        $data['product_url'] ?? null,
        $max
    );
    return array_map(fn($productUrl) => [
        '_scrape' => 1,
        'source_url' => $productUrl,
        'name' => '',
    ], $urls);
}

function productMigrationWooStorePublicProducts(string $store, int $max): array {
    $store = rtrim(pm_validate_public_url($store), '/');
    $products = [];
    $page = 1;

    while (count($products) < $max && $page <= 100) {
        $url = $store . '/wp-json/wc/store/v1/products?' . http_build_query([
            'per_page' => min(100, $max - count($products)),
            'page' => $page,
        ]);
        $body = pm_http_get($url, 25);
        if (!$body) break;

        $rows = json_decode($body, true);
        if (!is_array($rows) || !$rows) break;

        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $products[] = productMigrationFromWooStorePublic($row, $store);
            if (count($products) >= $max) break;
        }
        if (count($rows) < 100) break;
        $page++;
    }

    return $products;
}

function productMigrationFromWooStorePublic(array $p, string $store): array {
    $images = [];
    foreach (($p['images'] ?? []) as $img) {
        if (is_array($img) && !empty($img['src'])) $images[] = $img['src'];
    }

    $categories = [];
    foreach (($p['categories'] ?? []) as $cat) {
        if (is_array($cat) && !empty($cat['name'])) $categories[] = html_entity_decode(strip_tags((string)$cat['name']), ENT_QUOTES);
    }

    $prices = is_array($p['prices'] ?? null) ? $p['prices'] : [];
    $minorUnit = isset($prices['currency_minor_unit']) ? max(0, (int)$prices['currency_minor_unit']) : 2;
    $regular = productMigrationWooStorePrice($prices['regular_price'] ?? $prices['price'] ?? '', $minorUnit);
    $sale = productMigrationWooStorePrice($prices['sale_price'] ?? '', $minorUnit);

    return [
        'source_url' => $p['permalink'] ?? ($store . '/?p=' . ($p['id'] ?? '')),
        'name' => html_entity_decode(strip_tags((string)($p['name'] ?? '')), ENT_QUOTES),
        'description' => $p['description'] ?? '',
        'short_description' => $p['short_description'] ?? '',
        'images' => array_values(array_unique(array_filter($images))),
        'categories' => array_values(array_unique(array_filter($categories))),
        'price' => $regular ?: $sale,
        'sale_price' => $sale && $regular && $sale < $regular ? $sale : '',
        'sku' => $p['sku'] ?? '',
        'brand' => '',
        'stock' => !empty($p['is_in_stock']) ? 1 : 0,
        'weight' => '',
        'meta_title' => html_entity_decode(strip_tags((string)($p['name'] ?? '')), ENT_QUOTES),
        'meta_description' => pm_short_text(trim(strip_tags((string)($p['short_description'] ?? $p['description'] ?? ''))), 160),
        'attributes' => [],
        'variations' => [],
    ];
}

function productMigrationWooStorePrice($value, int $minorUnit): string {
    if ($value === '' || $value === null) return '';
    $numeric = preg_replace('/[^\d.-]/', '', (string)$value);
    if ($numeric === '' || !is_numeric($numeric)) return '';
    $divisor = 10 ** $minorUnit;
    return $divisor > 1 ? (string)(((float)$numeric) / $divisor) : (string)((float)$numeric);
}

function productMigrationShopifyPublicProducts(string $store, ?string $categoryUrl, int $max): array {
    $store = rtrim(pm_validate_public_url($store), '/');
    $base = parse_url($store);
    $origin = ($base['scheme'] ?? 'https') . '://' . ($base['host'] ?? '');
    $endpointBase = $origin . '/products.json';

    if ($categoryUrl) {
        try {
            $categoryUrl = pm_validate_public_url($categoryUrl);
            $path = trim((string)(parse_url($categoryUrl, PHP_URL_PATH) ?? ''), '/');
            if (preg_match('#(?:^|/)collections/([^/]+)#', $path, $m)) {
                $endpointBase = $origin . '/collections/' . rawurlencode($m[1]) . '/products.json';
            }
        } catch (Throwable $e) {
            $endpointBase = $origin . '/products.json';
        }
    }

    $products = [];
    $shopifyIds = [];
    $page = 1;
    while (count($products) < $max && $page <= 100) {
        $url = $endpointBase . '?' . http_build_query([
            'limit' => min(250, $max - count($products)),
            'page' => $page,
        ]);
        $body = pm_http_get($url, 25);
        if (!$body) break;

        $json = json_decode($body, true);
        $rows = is_array($json) ? ($json['products'] ?? []) : [];
        if (!is_array($rows) || !$rows) break;

        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $product = productMigrationFromShopify($row, $origin);
            if (!empty($row['id'])) {
                $product['_shopify_id'] = (string)$row['id'];
                $shopifyIds[] = (string)$row['id'];
            }
            $products[] = $product;
            if (count($products) >= $max) break;
        }
        if (count($rows) < 250) break;
        $page++;
    }

    if ($products && $categoryUrl) {
        $path = trim((string)(parse_url((string)$categoryUrl, PHP_URL_PATH) ?? ''), '/');
        if (preg_match('#(?:^|/)collections/([^/]+)#', $path, $m)) {
            $collectionName = ucwords(str_replace('-', ' ', $m[1]));
            foreach ($products as &$product) {
                $product['categories'] = array_values(array_unique(array_filter(array_merge(
                    is_array($product['categories'] ?? null) ? $product['categories'] : [],
                    [$collectionName]
                ))));
            }
            unset($product);
        }
    }

    return $products;
}

function productMigrationShopifyCollectionMap(string $origin, array $productIds, int $timeBudgetSeconds = 22): array {
    $wanted = array_fill_keys(array_values(array_unique(array_filter($productIds))), true);
    if (!$wanted) return [];
    $deadline = microtime(true) + max(5, $timeBudgetSeconds);

    $collections = [];
    for ($page = 1; $page <= 20; $page++) {
        if (microtime(true) >= $deadline) break;
        $url = $origin . '/collections.json?' . http_build_query(['limit' => 250, 'page' => $page]);
        $body = pm_http_get($url, 20);
        if (!$body) break;
        $json = json_decode($body, true);
        $rows = is_array($json) ? ($json['collections'] ?? []) : [];
        if (!is_array($rows) || !$rows) break;
        foreach ($rows as $collection) {
            if (!is_array($collection)) continue;
            $title = trim(strip_tags((string)($collection['title'] ?? '')));
            $handle = trim((string)($collection['handle'] ?? ''));
            if ($title === '' || $handle === '') continue;
            if (preg_match('/^(all|all product|all products|frontpage|home)$/i', $title) || preg_match('/^(all|all-products|frontpage|home)$/i', $handle)) {
                continue;
            }
            $collections[] = ['title' => html_entity_decode($title, ENT_QUOTES), 'handle' => $handle];
        }
        if (count($rows) < 250) break;
    }

    $map = [];
    foreach ($collections as $collection) {
        if (microtime(true) >= $deadline) break;
        for ($page = 1; $page <= 20; $page++) {
            if (microtime(true) >= $deadline) break 2;
            $url = $origin . '/collections/' . rawurlencode($collection['handle']) . '/products.json?' . http_build_query([
                'limit' => 250,
                'page' => $page,
            ]);
            $body = pm_http_get($url, 20);
            if (!$body) break;
            $json = json_decode($body, true);
            $rows = is_array($json) ? ($json['products'] ?? []) : [];
            if (!is_array($rows) || !$rows) break;
            foreach ($rows as $row) {
                $id = (string)($row['id'] ?? '');
                if ($id !== '' && isset($wanted[$id])) {
                    if (!isset($map[$id])) $map[$id] = [];
                    $map[$id][] = $collection['title'];
                }
            }
            if (count($rows) < 250) break;
        }
    }

    foreach ($map as &$categories) {
        $categories = array_values(array_unique($categories));
    }
    unset($categories);
    return $map;
}

function productMigrationWooProducts(array $data, int $max): array {
    $store = rtrim(pm_validate_public_url((string)($data['store_url'] ?? $data['source_url'] ?? '')), '/');
    $ck = trim((string)($data['consumer_key'] ?? ''));
    $cs = trim((string)($data['consumer_secret'] ?? ''));
    if ($ck === '' || $cs === '') throw new RuntimeException('WooCommerce consumer key and secret are required');

    $products = [];
    $page = 1;
    while (count($products) < $max) {
        $url = $store . '/wp-json/wc/v3/products?' . http_build_query([
            'consumer_key' => $ck,
            'consumer_secret' => $cs,
            'per_page' => min(100, $max - count($products)),
            'page' => $page,
            'status' => 'publish',
        ]);
        $body = pm_http_get($url, 30);
        if (!$body) break;
        $rows = json_decode($body, true);
        if (!is_array($rows) || !$rows) break;
        foreach ($rows as $row) {
            $products[] = productMigrationFromWoo($row, $store);
            if (count($products) >= $max) break;
        }
        $page++;
    }
    return $products;
}

function productMigrationFromWoo(array $p, string $store): array {
    $images = [];
    foreach (($p['images'] ?? []) as $img) {
        if (!empty($img['src'])) $images[] = $img['src'];
    }
    $categories = [];
    foreach (($p['categories'] ?? []) as $cat) {
        if (!empty($cat['name'])) $categories[] = $cat['name'];
    }
    $attributes = [];
    foreach (($p['attributes'] ?? []) as $attr) {
        $attributes[$attr['name'] ?? 'attribute'] = $attr['options'] ?? [];
    }
    return [
        'source_url' => $p['permalink'] ?? ($store . '/?p=' . ($p['id'] ?? '')),
        'name' => $p['name'] ?? '',
        'description' => $p['description'] ?? '',
        'short_description' => $p['short_description'] ?? '',
        'images' => $images,
        'categories' => $categories,
        'price' => ($p['regular_price'] ?? '') !== '' ? $p['regular_price'] : ($p['price'] ?? 0),
        'sale_price' => $p['sale_price'] ?? '',
        'sku' => $p['sku'] ?? '',
        'brand' => productMigrationWooBrand($p),
        'stock' => isset($p['stock_quantity']) ? (int)$p['stock_quantity'] : (($p['stock_status'] ?? '') === 'instock' ? 1 : 0),
        'weight' => $p['weight'] ?? '',
        'meta_title' => productMigrationMeta($p['meta_data'] ?? [], '_yoast_wpseo_title') ?: ($p['name'] ?? ''),
        'meta_description' => productMigrationMeta($p['meta_data'] ?? [], '_yoast_wpseo_metadesc'),
        'attributes' => $attributes,
        'variations' => $p['variations'] ?? [],
    ];
}

function productMigrationWooBrand(array $p): string {
    foreach (($p['brands'] ?? []) as $brand) {
        if (!empty($brand['name'])) return (string)$brand['name'];
    }
    foreach (($p['attributes'] ?? []) as $attr) {
        if (strtolower((string)($attr['name'] ?? '')) === 'brand') {
            return implode(', ', (array)($attr['options'] ?? []));
        }
    }
    return '';
}

function productMigrationMeta(array $meta, string $key): string {
    foreach ($meta as $m) {
        if (($m['key'] ?? '') === $key) return (string)($m['value'] ?? '');
    }
    return '';
}

function productMigrationShopifyProducts(array $data, int $max): array {
    $store = rtrim(pm_validate_public_url((string)($data['store_url'] ?? $data['source_url'] ?? '')), '/');
    $token = trim((string)($data['access_token'] ?? ''));
    if ($token === '') throw new RuntimeException('Shopify access token is required');

    $url = $store . '/admin/api/2024-04/products.json?limit=' . min(250, $max);
    $body = productMigrationHttpJson($url, ['X-Shopify-Access-Token: ' . $token]);
    $rows = $body['products'] ?? [];
    $products = [];
    foreach (array_slice($rows, 0, $max) as $row) {
        $products[] = productMigrationFromShopify($row, $store);
    }
    return $products;
}

function productMigrationFromShopify(array $p, string $store): array {
    $images = [];
    foreach (($p['images'] ?? []) as $img) {
        if (!empty($img['src'])) $images[] = $img['src'];
    }
    $variant = $p['variants'][0] ?? [];
    $handle = $p['handle'] ?? '';
    $name = (string)($p['title'] ?? '');
    $productType = trim((string)($p['product_type'] ?? ''));
    $categories = array_values(array_unique(array_filter(array_merge(
        $productType !== '' ? [$productType] : [],
        productMigrationInferShopifyCategories($p)
    ))));
    return [
        'source_url' => $handle ? $store . '/products/' . $handle : $store,
        'name' => $name,
        'description' => $p['body_html'] ?? '',
        'short_description' => pm_short_text(strip_tags((string)($p['body_html'] ?? '')), 500),
        'images' => $images,
        'categories' => $categories,
        'price' => ($variant['compare_at_price'] ?? '') !== '' ? $variant['compare_at_price'] : ($variant['price'] ?? 0),
        'sale_price' => ($variant['compare_at_price'] ?? '') !== '' ? ($variant['price'] ?? '') : '',
        'sku' => $variant['sku'] ?? '',
        'brand' => $p['vendor'] ?? '',
        'stock' => (int)($variant['inventory_quantity'] ?? 0),
        'weight' => $variant['grams'] ?? '',
        'meta_title' => $p['title'] ?? '',
        'meta_description' => pm_short_text(strip_tags((string)($p['body_html'] ?? '')), 160),
        'variations' => $p['variants'] ?? [],
    ];
}

function productMigrationInferShopifyCategories(array $p): array {
    $text = strtolower(trim(implode(' ', array_filter([
        $p['title'] ?? '',
        $p['product_type'] ?? '',
        implode(' ', (array)($p['tags'] ?? [])),
    ]))));
    if ($text === '') return [];

    $rules = [
        'Rice' => ['rice', 'basmati', 'sona masoori', 'ponni', 'idli rice'],
        'Atta' => ['atta', 'flour', 'maida', 'besan', 'sooji', 'semolina', 'rava'],
        'Spices' => ['masala', 'spice', 'chilli', 'chili', 'turmeric', 'haldi', 'jeera', 'cumin', 'coriander', 'dhaniya', 'cardamom', 'elaichi', 'clove', 'pepper', 'garam', 'ginger', 'methi', 'mustard seed', 'ajwain', 'hing', 'asafoetida'],
        'Lentils & Beans' => ['dal', 'dhal', 'daal', 'lentil', 'beans', 'chana', 'rajma', 'moong', 'toor', 'urad', 'masoor', 'peas'],
        'Oil & Ghee' => ['oil', 'ghee', 'butter'],
        'Snacks' => ['snack', 'namkeen', 'sev', 'bhujia', 'chips', 'mixture', 'murukku', 'papad', 'popcorn'],
        'Sweets' => ['sweet', 'mithai', 'laddu', 'ladoo', 'halwa', 'barfi', 'gulab', 'rasgulla', 'soan'],
        'Drinks' => ['drink', 'juice', 'soda', 'syrup', 'lassi', 'thums', 'limca', 'frooti'],
        'Tea & Coffee' => ['tea', 'chai', 'coffee'],
        'Noodles' => ['noodle', 'noodles', 'maggi', 'wai wai', 'ramen'],
        'Pickles' => ['pickle', 'achar', 'achaar', 'chutney', 'paste'],
        'Fresh Foods' => ['fresh', 'vegetable', 'fruit', 'plant', 'leaf', 'leaves', 'coriander bunch', 'methi bunch', 'paneer'],
        'Frozen Foods' => ['frozen', 'paratha', 'naan', 'roti', 'samosa', 'kebab', 'momo'],
        'Cultural Items' => ['pooja', 'puja', 'diya', 'agarbatti', 'incense', 'rakhi', 'kumkum'],
        'Kitchenware' => ['utensil', 'pan', 'tawa', 'pressure cooker', 'cooker', 'kadai', 'knife', 'plate', 'bowl'],
        'Health & Beauty' => ['soap', 'shampoo', 'hair', 'cream', 'toothpaste', 'ayurvedic'],
        'Biscuits & Bakery' => ['biscuit', 'cookie', 'cake', 'rusk', 'toast'],
    ];

    $categories = [];
    foreach ($rules as $category => $keywords) {
        foreach ($keywords as $keyword) {
            if (productMigrationTextHasKeyword($text, $keyword)) {
                $categories[] = $category;
                break;
            }
        }
    }

    return array_values(array_unique($categories));
}

function productMigrationTextHasKeyword(string $text, string $keyword): bool {
    $keyword = strtolower(trim($keyword));
    if ($keyword === '') return false;
    return (bool)preg_match('/(?<![a-z0-9])' . preg_quote($keyword, '/') . '(?![a-z0-9])/i', $text);
}

function productMigrationHttpJson(string $url, array $headers = []): array {
    pm_validate_public_url($url);
    if (!function_exists('curl_init')) {
        $body = @file_get_contents($url, false, stream_context_create([
            'http' => [
                'timeout' => 35,
                'header' => $headers ? implode("\r\n", $headers) . "\r\n" : '',
                'user_agent' => 'ReuseEcomProductMigration/1.0',
            ],
        ]));
        if (!$body) throw new RuntimeException('Remote API request failed');
        $json = json_decode($body, true);
        if (!is_array($json)) throw new RuntimeException('Remote API returned invalid JSON');
        return $json;
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 35,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_USERAGENT => 'ReuseEcomProductMigration/1.0',
    ]);
    $body = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    pm_curl_close($ch);
    if ($body === false || $code < 200 || $code >= 400) {
        throw new RuntimeException('Remote API request failed');
    }
    $json = json_decode($body, true);
    if (!is_array($json)) throw new RuntimeException('Remote API returned invalid JSON');
    return $json;
}

function productMigrationCsvProducts(array $data): array {
    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('CSV file is required');
    }
    $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['csv','xlsx','xls'], true)) throw new RuntimeException('Only CSV/XLSX files are allowed');

    $tmp = $_FILES['file']['tmp_name'];
    $rows = $ext === 'csv' ? productMigrationReadCsv($tmp) : productMigrationReadXlsx($tmp);
    if (!$rows || count($rows) < 2) return [];
    $headers = array_map('productMigrationHeaderKey', array_shift($rows));
    $mapping = is_string($data['mapping'] ?? null) ? json_decode($data['mapping'], true) : ($data['mapping'] ?? []);
    if (!$mapping) $mapping = productMigrationAutoMapping($headers);

    $products = [];
    foreach ($rows as $row) {
        $products[] = productMigrationMappedRow($headers, $row, $mapping);
    }
    return array_values(array_filter($products, fn($p) => trim((string)($p['name'] ?? '')) !== ''));
}

function productMigrationReadCsv(string $path): array {
    $rows = [];
    $fp = fopen($path, 'r');
    if (!$fp) return [];
    $line = fgets($fp) ?: '';
    rewind($fp);
    $delimiter = substr_count($line, "\t") > substr_count($line, ',') ? "\t" : ',';
    while (($row = fgetcsv($fp, null, $delimiter)) !== false) $rows[] = $row;
    fclose($fp);
    return $rows;
}

function productMigrationReadXlsx(string $path): array {
    $xlsx = SimpleXLSX::parse($path);
    return $xlsx ? $xlsx->rows(0) : [];
}

function productMigrationHeaderKey($value): string {
    return strtolower(trim(preg_replace('/[^a-z0-9]+/i', '_', (string)$value), '_'));
}

function productMigrationAutoMapping(array $headers): array {
    $aliases = [
        'name' => ['name','title','product_name','post_title'],
        'description' => ['description','body_html','content','post_content'],
        'short_description' => ['short_description','summary','excerpt'],
        'price' => ['price','regular_price','regular_price_gbp','amount'],
        'sale_price' => ['sale_price','sale','special_price'],
        'sku' => ['sku','product_sku'],
        'brand' => ['brand','vendor','manufacturer'],
        'stock' => ['stock','stock_quantity','qty','inventory_quantity'],
        'weight' => ['weight','weight_kg','grams'],
        'categories' => ['categories','category','product_category'],
        'images' => ['images','image','featured_image','gallery'],
        'source_url' => ['url','permalink','product_url'],
        'meta_title' => ['meta_title','seo_title'],
        'meta_description' => ['meta_description','seo_description'],
    ];
    $mapping = [];
    foreach ($aliases as $field => $names) {
        foreach ($names as $name) {
            if (in_array($name, $headers, true)) {
                $mapping[$field] = $name;
                break;
            }
        }
    }
    return $mapping;
}

function productMigrationMappedRow(array $headers, array $row, array $mapping): array {
    $raw = [];
    foreach ($headers as $i => $header) $raw[$header] = trim((string)($row[$i] ?? ''));
    $out = [];
    foreach ($mapping as $field => $header) {
        $out[$field] = $raw[$header] ?? '';
    }
    return $out;
}

function productMigrationXmlProducts(array $data, int $max): array {
    $url = pm_validate_public_url((string)($data['xml_url'] ?? $data['source_url'] ?? ''));
    $xmlText = pm_http_get($url, 40);
    if (!$xmlText) throw new RuntimeException('Could not fetch XML feed');
    $xml = @simplexml_load_string($xmlText, 'SimpleXMLElement', LIBXML_NOCDATA);
    if (!$xml) throw new RuntimeException('Invalid XML feed');

    $mapping = is_array($data['mapping'] ?? null) ? $data['mapping'] : [];
    $items = $xml->xpath('//item') ?: $xml->xpath('//product') ?: [];
    $products = [];
    foreach (array_slice($items, 0, $max) as $item) {
        $flat = productMigrationFlattenXml($item);
        if (!$mapping) $mapping = productMigrationAutoMapping(array_keys($flat));
        $products[] = productMigrationMappedXml($flat, $mapping);
    }
    return array_values(array_filter($products, fn($p) => trim((string)($p['name'] ?? '')) !== ''));
}

function productMigrationFlattenXml(SimpleXMLElement $node, string $prefix = ''): array {
    $out = [];
    foreach ($node->children() as $key => $child) {
        $name = productMigrationHeaderKey($prefix ? $prefix . '_' . $key : $key);
        if ($child->count()) {
            $out += productMigrationFlattenXml($child, $name);
        } else {
            $out[$name] = trim((string)$child);
        }
    }
    return $out;
}

function productMigrationMappedXml(array $flat, array $mapping): array {
    $out = [];
    foreach ($mapping as $field => $key) $out[$field] = $flat[$key] ?? '';
    return $out;
}

function productMigrationStoreMapping(PDO $db, string $name, string $method, array $mapping): void {
    $stmt = $db->prepare("INSERT INTO import_column_mappings (name, method, mapping_json)
        VALUES (:n,:m,:j)
        ON DUPLICATE KEY UPDATE mapping_json=VALUES(mapping_json)");
    $stmt->execute([':n' => $name, ':m' => $method, ':j' => json_encode($mapping, JSON_UNESCAPED_SLASHES)]);
}

function productMigrationMappings(PDO $db): void {
    $stmt = $db->query("SELECT id, name, method, mapping_json, updated_at FROM import_column_mappings ORDER BY updated_at DESC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$row) $row['mapping'] = json_decode($row['mapping_json'] ?? '{}', true) ?: [];
    successResponse($rows);
}

function productMigrationSaveMapping(PDO $db): void {
    $data = productMigrationInput();
    $name = trim((string)($data['name'] ?? ''));
    $method = (string)($data['method'] ?? 'csv');
    $mapping = is_array($data['mapping'] ?? null) ? $data['mapping'] : [];
    if ($name === '' || !$mapping || !in_array($method, ['csv','xml'], true)) errorResponse('Valid mapping name, method, and mapping are required', 400);
    productMigrationStoreMapping($db, $name, $method, $mapping);
    successResponse(null, 'Mapping saved');
}

function productMigrationRollback(PDO $db, int $jobId): array {
    $job = pm_get_job($db, $jobId);
    if ($job['status'] === 'rolled_back') return $job;

    $stmt = $db->prepare("SELECT DISTINCT product_id FROM import_job_items WHERE job_id=:j AND action='imported' AND product_id IS NOT NULL");
    $stmt->execute([':j' => $jobId]);
    $ids = array_map('intval', array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'product_id'));
    foreach ($ids as $pid) {
        $imgs = $db->prepare("SELECT image_path FROM product_images WHERE product_id=:p");
        $imgs->execute([':p' => $pid]);
        while ($img = $imgs->fetch(PDO::FETCH_ASSOC)) {
            if (function_exists('deleteImage')) deleteImage($img['image_path']);
        }
        $db->prepare("DELETE FROM products WHERE id=:id")->execute([':id' => $pid]);
    }
    $db->prepare("UPDATE import_jobs SET status='rolled_back', finished_at=NOW() WHERE id=:id")->execute([':id' => $jobId]);
    pm_log($db, $jobId, $job['batch_id'], 'warning', 'Rollback completed. Products removed: ' . count($ids));
    return pm_get_job($db, $jobId);
}

function productMigrationReport(PDO $db, int $jobId): void {
    $job = pm_get_job($db, $jobId);
    $stmt = $db->prepare("SELECT source_name, source_sku, source_url, product_id, action, status, error, created_at FROM import_job_items WHERE job_id=:j ORDER BY id ASC");
    $stmt->execute([':j' => $jobId]);
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="product_migration_' . $job['batch_id'] . '.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['Product', 'SKU', 'Source URL', 'Product ID', 'Action', 'Status', 'Error', 'Created At']);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) fputcsv($out, $row);
    fclose($out);
    exit;
}
