<?php
/**
 * Product migration queue and import helpers.
 */

require_once __DIR__ . '/scraper.php';
require_once __DIR__ . '/slug.php';

function pm_site_id(): int {
    return defined('ECOMMERCE_SITE_ID') ? (int)ECOMMERCE_SITE_ID : 1;
}

function pm_table_columns(PDO $db, string $table): array {
    static $cache = [];
    if (isset($cache[$table])) return $cache[$table];
    try {
        $stmt = $db->query("SHOW COLUMNS FROM `$table`");
        return $cache[$table] = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'Field');
    } catch (Throwable $e) {
        return $cache[$table] = [];
    }
}

function pm_has_column(PDO $db, string $table, string $column): bool {
    return in_array($column, pm_table_columns($db, $table), true);
}

function pm_ensure_schema(PDO $db): void {
    $db->exec("CREATE TABLE IF NOT EXISTS import_jobs (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        batch_id VARCHAR(64) NOT NULL UNIQUE,
        method ENUM('scraper','woocommerce','shopify','csv','xml') NOT NULL,
        source_url VARCHAR(500) DEFAULT NULL,
        import_type VARCHAR(50) DEFAULT 'entire',
        duplicate_strategy ENUM('skip','update','copy') DEFAULT 'skip',
        status ENUM('pending','running','completed','failed','rolled_back') DEFAULT 'pending',
        total INT DEFAULT 0,
        processed INT DEFAULT 0,
        imported INT DEFAULT 0,
        updated INT DEFAULT 0,
        skipped INT DEFAULT 0,
        failed INT DEFAULT 0,
        options_json LONGTEXT,
        report_json LONGTEXT,
        started_at DATETIME DEFAULT NULL,
        finished_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_status (status),
        KEY idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $db->exec("CREATE TABLE IF NOT EXISTS import_logs (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        batch_id VARCHAR(64) NOT NULL,
        level ENUM('info','success','warning','error') DEFAULT 'info',
        message TEXT NOT NULL,
        context_json LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_job_id (job_id),
        KEY idx_batch_id (batch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $db->exec("CREATE TABLE IF NOT EXISTS import_job_items (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        batch_id VARCHAR(64) NOT NULL,
        product_id INT DEFAULT NULL,
        source_url VARCHAR(500) DEFAULT NULL,
        source_sku VARCHAR(150) DEFAULT NULL,
        source_name VARCHAR(255) DEFAULT NULL,
        action ENUM('imported','updated','skipped','failed') NOT NULL,
        status ENUM('ok','error') DEFAULT 'ok',
        error TEXT DEFAULT NULL,
        image_paths_json LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_job_id (job_id),
        KEY idx_batch_id (batch_id),
        KEY idx_product_id (product_id),
        KEY idx_source_sku (source_sku)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $db->exec("CREATE TABLE IF NOT EXISTS import_column_mappings (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        method ENUM('csv','xml') NOT NULL,
        mapping_json LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY idx_name_method (name, method)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

function pm_log(PDO $db, int $jobId, string $batchId, string $level, string $message, array $context = []): void {
    $stmt = $db->prepare("INSERT INTO import_logs (job_id, batch_id, level, message, context_json) VALUES (:j,:b,:l,:m,:c)");
    $stmt->execute([
        ':j' => $jobId,
        ':b' => $batchId,
        ':l' => in_array($level, ['info','success','warning','error'], true) ? $level : 'info',
        ':m' => $message,
        ':c' => $context ? json_encode($context, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : null,
    ]);
}

function pm_payload_dir(): string {
    $dir = __DIR__ . '/../uploads/imports/';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    return $dir;
}

function pm_write_payload(string $batchId, array $products): string {
    $path = pm_payload_dir() . $batchId . '.json';
    file_put_contents($path, json_encode($products, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    return $path;
}

function pm_read_payload(string $path): array {
    if (!$path || !is_file($path)) return [];
    $data = json_decode((string)file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function pm_create_job(PDO $db, string $method, ?string $sourceUrl, string $importType, string $duplicate, array $products, array $options = []): array {
    pm_ensure_schema($db);
    $batchId = 'batch_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4));
    $payloadFile = pm_write_payload($batchId, $products);
    $options['payload_file'] = $payloadFile;
    $options['created_from'] = $method;

    $stmt = $db->prepare("INSERT INTO import_jobs
        (batch_id, method, source_url, import_type, duplicate_strategy, status, total, options_json)
        VALUES (:b,:m,:u,:t,:d,'pending',:total,:o)");
    $stmt->execute([
        ':b' => $batchId,
        ':m' => $method,
        ':u' => $sourceUrl,
        ':t' => $importType,
        ':d' => $duplicate,
        ':total' => count($products),
        ':o' => json_encode($options, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    ]);
    $jobId = (int)$db->lastInsertId();
    pm_log($db, $jobId, $batchId, 'info', 'Import job created. Products queued: ' . count($products));
    return pm_get_job($db, $jobId);
}

function pm_get_job(PDO $db, int $jobId): array {
    pm_ensure_schema($db);
    $stmt = $db->prepare("SELECT * FROM import_jobs WHERE id = :id");
    $stmt->execute([':id' => $jobId]);
    $job = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$job) throw new RuntimeException('Import job not found');
    $job['options'] = json_decode($job['options_json'] ?? '{}', true) ?: [];
    $job['report'] = json_decode($job['report_json'] ?? '{}', true) ?: [];
    $job['progress_percent'] = (int)$job['total'] > 0 ? round(((int)$job['processed'] / (int)$job['total']) * 100, 2) : 0;
    return $job;
}

function pm_list_jobs(PDO $db, int $limit = 50): array {
    pm_ensure_schema($db);
    $stmt = $db->prepare("SELECT * FROM import_jobs ORDER BY created_at DESC LIMIT :lim");
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function pm_get_logs(PDO $db, int $jobId, int $limit = 300): array {
    pm_ensure_schema($db);
    $stmt = $db->prepare("SELECT level, message, context_json, created_at FROM import_logs WHERE job_id = :j ORDER BY id DESC LIMIT :lim");
    $stmt->bindValue(':j', $jobId, PDO::PARAM_INT);
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function pm_parse_price($value): float {
    $value = preg_replace('/[^\d.,-]/', '', (string)$value);
    $value = str_replace(',', '.', $value);
    return is_numeric($value) ? (float)$value : 0.0;
}

function pm_normalize_product(array $p): array {
    $images = $p['images'] ?? [];
    if (is_string($images)) $images = preg_split('/\s*,\s*/', $images) ?: [];
    $categories = $p['categories'] ?? [];
    if (is_string($categories)) $categories = preg_split('/\s*,\s*/', $categories) ?: [];
    return [
        'source_url' => trim((string)($p['source_url'] ?? $p['url'] ?? '')),
        'name' => trim((string)($p['name'] ?? $p['title'] ?? '')),
        'description' => pm_clean_html($p['description'] ?? ''),
        'short_description' => pm_short_text(trim(strip_tags((string)($p['short_description'] ?? $p['description'] ?? ''))), 500),
        'images' => array_values(array_filter(array_map('trim', $images))),
        'categories' => array_values(array_filter(array_map('trim', $categories))),
        'price' => pm_parse_price($p['price'] ?? 0),
        'sale_price' => ($p['sale_price'] ?? '') !== '' ? pm_parse_price($p['sale_price']) : null,
        'sku' => trim((string)($p['sku'] ?? '')),
        'brand' => trim((string)($p['brand'] ?? '')),
        'stock' => (int)($p['stock'] ?? 0),
        'weight' => ($p['weight'] ?? '') !== '' && is_numeric($p['weight']) ? (float)$p['weight'] : null,
        'meta_title' => trim((string)($p['meta_title'] ?? $p['name'] ?? '')),
        'meta_description' => trim((string)($p['meta_description'] ?? $p['short_description'] ?? '')),
        'attributes' => $p['attributes'] ?? [],
        'variations' => $p['variations'] ?? [],
    ];
}

function pm_unique_slug(PDO $db, string $name, ?int $excludeId = null): string {
    $slug = generateSlug($name);
    if ($slug === '') $slug = 'product';
    $base = $slug;
    $i = 1;
    $hasSite = pm_has_column($db, 'products', 'site_id');
    while (true) {
        $sql = "SELECT id FROM products WHERE slug = :slug";
        $params = [':slug' => $slug];
        if ($hasSite) {
            $sql .= " AND site_id = :site";
            $params[':site'] = pm_site_id();
        }
        if ($excludeId) {
            $sql .= " AND id != :id";
            $params[':id'] = $excludeId;
        }
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        if (!$stmt->fetch()) return $slug;
        $slug = $base . '-' . $i++;
    }
}

function pm_find_existing_product(PDO $db, array $p): ?int {
    $hasSite = pm_has_column($db, 'products', 'site_id');
    $siteSql = $hasSite ? " AND site_id = :site" : "";
    $siteParam = $hasSite ? [':site' => pm_site_id()] : [];

    if ($p['sku'] !== '') {
        $stmt = $db->prepare("SELECT id FROM products WHERE sku = :sku $siteSql LIMIT 1");
        $stmt->execute([':sku' => $p['sku']] + $siteParam);
        $id = $stmt->fetchColumn();
        if ($id) return (int)$id;
    }

    if ($p['source_url'] !== '') {
        $stmt = $db->prepare("SELECT product_id FROM import_job_items WHERE source_url = :url AND product_id IS NOT NULL ORDER BY id DESC LIMIT 1");
        $stmt->execute([':url' => $p['source_url']]);
        $id = $stmt->fetchColumn();
        if ($id) return (int)$id;
    }

    $stmt = $db->prepare("SELECT id FROM products WHERE name = :name $siteSql LIMIT 1");
    $stmt->execute([':name' => $p['name']] + $siteParam);
    $id = $stmt->fetchColumn();
    return $id ? (int)$id : null;
}

function pm_resolve_categories(PDO $db, array $categories): array {
    $ids = [];
    $hasSite = pm_has_column($db, 'categories', 'site_id');
    foreach ($categories as $path) {
        $segments = preg_split('/\s*>\s*/', $path) ?: [];
        $parentId = null;
        foreach ($segments as $name) {
            $name = trim($name);
            if ($name === '') continue;
            $slug = generateSlug($name);
            $sql = "SELECT id FROM categories WHERE slug = :slug";
            $params = [':slug' => $slug];
            if ($hasSite) {
                $sql .= " AND site_id = :site";
                $params[':site'] = pm_site_id();
            }
            $sql .= " LIMIT 1";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $catId = $stmt->fetchColumn();
            if (!$catId) {
                $cols = ['name','slug','parent_id','is_active'];
                $vals = [':name',':slug',':parent','1'];
                $data = [':name' => $name, ':slug' => $slug, ':parent' => $parentId];
                if ($hasSite) {
                    array_unshift($cols, 'site_id');
                    array_unshift($vals, ':site');
                    $data[':site'] = pm_site_id();
                }
                $db->prepare("INSERT INTO categories (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")")->execute($data);
                $catId = (int)$db->lastInsertId();
            }
            $parentId = (int)$catId;
        }
        if ($parentId) $ids[] = $parentId;
    }
    return array_values(array_unique($ids));
}

function pm_download_image(string $url, string $nameSeed): ?array {
    if (!filter_var($url, FILTER_VALIDATE_URL)) return null;
    try { pm_validate_public_url($url); } catch (Throwable $e) { return null; }

    $path = parse_url($url, PHP_URL_PATH) ?: '';
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg','jpeg','png','gif','webp'], true)) $ext = 'jpg';
    $dir = __DIR__ . '/../uploads/products/';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $base = generateSlug($nameSeed) ?: 'product';
    $filename = $base . '_' . substr(md5($url), 0, 12) . '.' . $ext;
    $dest = $dir . $filename;
    $public = '/uploads/products/' . $filename;

    if (!file_exists($dest)) {
        $data = null;
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 4,
                CURLOPT_TIMEOUT => 25,
                CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; ReuseEcomProductMigration/1.0)',
            ]);
            $data = curl_exec($ch);
            $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            pm_curl_close($ch);
            if ($code < 200 || $code >= 400) $data = null;
        } else {
            $data = @file_get_contents($url);
        }
        if (!$data) return null;
        file_put_contents($dest, $data);
    }

    $variants = pm_generate_image_variants($dest, $base . '_' . substr(md5($url), 0, 12));
    return ['path' => $public, 'variants' => $variants];
}

function pm_generate_image_variants(string $source, string $base): array {
    $variants = [];
    if (!extension_loaded('gd')) return $variants;
    $info = @getimagesize($source);
    if (!$info) return $variants;
    [$width, $height] = $info;
    $mime = $info['mime'] ?? '';
    $create = match ($mime) {
        'image/jpeg' => 'imagecreatefromjpeg',
        'image/png' => 'imagecreatefrompng',
        'image/webp' => 'imagecreatefromwebp',
        'image/gif' => 'imagecreatefromgif',
        default => null,
    };
    if (!$create || !function_exists($create)) return $variants;
    $src = @$create($source);
    if (!$src) return $variants;
    $dir = dirname($source) . '/';
    foreach (['thumb' => 300, 'medium' => 800, 'large' => 1400] as $label => $max) {
        $ratio = min(1, $max / max($width, $height));
        $nw = max(1, (int)round($width * $ratio));
        $nh = max(1, (int)round($height * $ratio));
        $dst = imagecreatetruecolor($nw, $nh);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $width, $height);
        $file = $dir . $base . '_' . $label . '.webp';
        if (function_exists('imagewebp') && imagewebp($dst, $file, 82)) {
            $variants[$label] = '/uploads/products/' . basename($file);
        }
        imagedestroy($dst);
    }
    imagedestroy($src);
    return $variants;
}

function pm_import_product(PDO $db, int $jobId, string $batchId, array $raw, string $duplicateStrategy): array {
    if (!empty($raw['_scrape']) && !empty($raw['source_url'])) {
        $html = pm_http_get((string)$raw['source_url'], 20);
        if (!$html) throw new RuntimeException('Could not fetch product page');
        $raw = pm_extract_product_from_html((string)$raw['source_url'], $html);
    }

    $p = pm_normalize_product($raw);
    if ($p['name'] === '') throw new RuntimeException('Product name missing');

    $existingId = pm_find_existing_product($db, $p);
    if ($existingId && $duplicateStrategy === 'skip') {
        pm_record_item($db, $jobId, $batchId, null, $p, 'skipped', 'ok');
        return ['action' => 'skipped', 'name' => $p['name']];
    }

    $downloadedImages = [];
    foreach (array_slice($p['images'], 0, 8) as $imageUrl) {
        $downloaded = pm_download_image($imageUrl, $p['name']);
        if ($downloaded) $downloadedImages[] = $downloaded;
    }
    $imagePaths = array_values(array_filter(array_map(fn($img) => $img['path'] ?? null, $downloadedImages)));

    $catIds = pm_resolve_categories($db, $p['categories']);
    $hasSite = pm_has_column($db, 'products', 'site_id');
    $copy = $existingId && $duplicateStrategy === 'copy';
    $targetId = ($existingId && !$copy) ? $existingId : null;
    $slug = pm_unique_slug($db, $p['name'], $targetId);

    if ($targetId) {
        $stmt = $db->prepare("UPDATE products SET
            name=:name, slug=:slug, short_description=:short, description=:desc, price=:price,
            sale_price=:sale, sku=:sku, stock=:stock, weight=:weight, brand=:brand,
            meta_title=:mt, meta_description=:md, is_active=1
            WHERE id=:id");
        $stmt->execute([
            ':id' => $targetId,
            ':name' => $p['name'],
            ':slug' => $slug,
            ':short' => $p['short_description'],
            ':desc' => $p['description'],
            ':price' => $p['price'],
            ':sale' => $p['sale_price'],
            ':sku' => $p['sku'] ?: null,
            ':stock' => $p['stock'],
            ':weight' => $p['weight'],
            ':brand' => $p['brand'] ?: null,
            ':mt' => $p['meta_title'] ?: $p['name'],
            ':md' => $p['meta_description'] ?: $p['short_description'],
        ]);
        $action = 'updated';
        $productId = $targetId;
    } else {
        $cols = ['name','slug','short_description','description','price','sale_price','sku','stock','weight','brand','meta_title','meta_description','is_active','is_new'];
        $vals = [':name',':slug',':short',':desc',':price',':sale',':sku',':stock',':weight',':brand',':mt',':md','1','1'];
        $params = [
            ':name' => $p['name'],
            ':slug' => $slug,
            ':short' => $p['short_description'],
            ':desc' => $p['description'],
            ':price' => $p['price'],
            ':sale' => $p['sale_price'],
            ':sku' => $p['sku'] ?: null,
            ':stock' => $p['stock'],
            ':weight' => $p['weight'],
            ':brand' => $p['brand'] ?: null,
            ':mt' => $p['meta_title'] ?: $p['name'],
            ':md' => $p['meta_description'] ?: $p['short_description'],
        ];
        if ($hasSite) {
            array_unshift($cols, 'site_id');
            array_unshift($vals, ':site');
            $params[':site'] = pm_site_id();
        }
        $db->prepare("INSERT INTO products (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")")->execute($params);
        $productId = (int)$db->lastInsertId();
        $action = 'imported';
    }

    if ($catIds) {
        $db->prepare("DELETE FROM product_categories WHERE product_id = :p")->execute([':p' => $productId]);
        $stmt = $db->prepare("INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (:p,:c)");
        foreach ($catIds as $cid) $stmt->execute([':p' => $productId, ':c' => $cid]);
    }

    if ($imagePaths) {
        if ($action === 'updated') {
            $old = $db->prepare("SELECT image_path FROM product_images WHERE product_id = :p");
            $old->execute([':p' => $productId]);
            while ($img = $old->fetch(PDO::FETCH_ASSOC)) {
                if (function_exists('deleteImage')) deleteImage($img['image_path']);
            }
            $db->prepare("DELETE FROM product_images WHERE product_id = :p")->execute([':p' => $productId]);
        }
        $stmt = $db->prepare("INSERT INTO product_images (product_id, image_path, alt_text, sort_order, is_primary) VALUES (:p,:path,:alt,:sort,:primary)");
        foreach ($imagePaths as $i => $path) {
            $stmt->execute([':p' => $productId, ':path' => $path, ':alt' => $p['name'], ':sort' => $i, ':primary' => $i === 0 ? 1 : 0]);
        }
    }

    pm_record_item($db, $jobId, $batchId, $productId, $p, $action, 'ok', null, $downloadedImages);
    return ['action' => $action, 'product_id' => $productId, 'name' => $p['name']];
}

function pm_record_item(PDO $db, int $jobId, string $batchId, ?int $productId, array $p, string $action, string $status, ?string $error = null, array $images = []): void {
    $stmt = $db->prepare("INSERT INTO import_job_items
        (job_id,batch_id,product_id,source_url,source_sku,source_name,action,status,error,image_paths_json)
        VALUES (:j,:b,:p,:url,:sku,:name,:a,:s,:e,:imgs)");
    $stmt->execute([
        ':j' => $jobId,
        ':b' => $batchId,
        ':p' => $productId,
        ':url' => $p['source_url'] ?: null,
        ':sku' => $p['sku'] ?: null,
        ':name' => $p['name'] ?: null,
        ':a' => $action,
        ':s' => $status,
        ':e' => $error,
        ':imgs' => $images ? json_encode($images, JSON_UNESCAPED_SLASHES) : null,
    ]);
}

function pm_process_job(PDO $db, int $jobId, int $limit = 25): array {
    $job = pm_get_job($db, $jobId);
    if (in_array($job['status'], ['completed','failed','rolled_back'], true)) return $job;

    $products = pm_read_payload($job['options']['payload_file'] ?? '');
    $offset = (int)$job['processed'];
    $chunk = array_slice($products, $offset, max(1, min($limit, 100)));

    if ($job['status'] === 'pending') {
        $db->prepare("UPDATE import_jobs SET status='running', started_at=COALESCE(started_at, NOW()) WHERE id=:id")->execute([':id' => $jobId]);
        pm_log($db, $jobId, $job['batch_id'], 'info', 'Import processing started');
    }

    $stats = ['processed' => 0, 'imported' => 0, 'updated' => 0, 'skipped' => 0, 'failed' => 0];
    foreach ($chunk as $raw) {
        try {
            $result = pm_import_product($db, $jobId, $job['batch_id'], $raw, $job['duplicate_strategy']);
            $action = $result['action'] ?? 'skipped';
            $stats[$action === 'imported' ? 'imported' : ($action === 'updated' ? 'updated' : 'skipped')]++;
            $name = $result['name'] ?? $raw['name'] ?? $raw['title'] ?? $raw['source_url'] ?? 'Product';
            pm_log($db, $jobId, $job['batch_id'], $action === 'skipped' ? 'warning' : 'success', ucfirst($action) . ': ' . $name);
        } catch (Throwable $e) {
            $stats['failed']++;
            $p = pm_normalize_product($raw);
            pm_record_item($db, $jobId, $job['batch_id'], null, $p, 'failed', 'error', $e->getMessage());
            pm_log($db, $jobId, $job['batch_id'], 'error', 'Failed: ' . (($raw['name'] ?? $raw['title'] ?? $raw['source_url'] ?? 'row')) . ' - ' . $e->getMessage());
        }
        $stats['processed']++;
    }

    $done = ($offset + $stats['processed']) >= count($products);
    $status = $done ? 'completed' : 'running';
    $finish = $done ? ', finished_at=NOW()' : '';
    $stmt = $db->prepare("UPDATE import_jobs SET
        status=:status,
        processed=processed+:processed,
        imported=imported+:imported,
        updated=updated+:updated,
        skipped=skipped+:skipped,
        failed=failed+:failed
        $finish
        WHERE id=:id");
    $stmt->execute([
        ':status' => $status,
        ':processed' => $stats['processed'],
        ':imported' => $stats['imported'],
        ':updated' => $stats['updated'],
        ':skipped' => $stats['skipped'],
        ':failed' => $stats['failed'],
        ':id' => $jobId,
    ]);
    if ($done) pm_log($db, $jobId, $job['batch_id'], 'success', 'Import completed');

    if (function_exists('cacheClearPattern')) {
        cacheClearPattern('products_');
        cacheClearPattern('cat_products_');
    }

    return pm_get_job($db, $jobId);
}

function pm_rollback_job(PDO $db, int $jobId): array {
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
