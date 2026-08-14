<?php
/**
 * Bulk Product Import API
 * NOTE: config, database, response, auth_middleware, upload are already
 * loaded by index.php — do NOT re-require them here.
 */

// Capture any stray PHP warnings so they don't corrupt our JSON output
ob_start();

// Ensure JSON headers are set (index.php sets them, but just in case)
if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
}

// Only load our extra helper
if (!class_exists('SimpleXLSX')) {
    require_once __DIR__ . '/../helpers/SimpleXLSX.php';
}

// Auth check (requireAuth is defined in auth_middleware.php, already loaded)
requireAuth();

// Use the $db connection already created by index.php (in global scope)
global $db;

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$seg    = explode('/', trim($uri, '/'));
$action = end($seg); // preview | process | status | import


// ── Route ────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'preview')  { doPreview($db);  exit; }
if ($method === 'POST' && $action === 'process')  { doProcess($db);  exit; }
if ($method === 'GET'  && $action === 'status')   { doStatus();      exit; }
if ($method === 'POST' && $action === 'import')   { doProcess($db);  exit; }

errorResponse('Unknown import action', 400);

// ═══════════════════════════════════════════════════════════════════════════
// PREVIEW — parse file, return first N rows without writing to DB
// ═══════════════════════════════════════════════════════════════════════════
function doPreview($db) {
    $file = uploadImportFile();
    $rows = parseFile($file['path'], $file['ext']);
    if (!$rows) errorResponse('Could not parse file — check format', 422);

    $headers = array_shift($rows); // first row = headers
    $headers = normaliseHeaders($headers);

    $preview = [];
    foreach (array_slice($rows, 0, 30) as $row) {
        $mapped = mapRow($headers, $row);
        if (empty(trim($mapped['name'] ?? ''))) continue;
        $preview[] = $mapped;
    }

    // Store file path in session for process step
    session_start();
    $_SESSION['import_file'] = $file['path'];
    $_SESSION['import_ext']  = $file['ext'];
    $_SESSION['import_total'] = count($rows);

    successResponse([
        'headers'   => $headers,
        'preview'   => $preview,
        'total_rows'=> count($rows),
        'file_token'=> base64_encode($file['path']),
    ], 'File parsed successfully');
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS — import into DB (supports chunked batches via batch_offset/batch_limit)
// ═══════════════════════════════════════════════════════════════════════════
function doProcess($db) {
    // Discard any buffered output (PHP warnings etc.) before our JSON
    if (ob_get_level()) ob_clean();

    $opts = json_decode(file_get_contents('php://input'), true) ?? [];
    $filePath  = base64_decode($opts['file_token'] ?? '');
    $fileExt   = $opts['file_ext'] ?? 'csv';
    $duplicate = $opts['duplicate'] ?? 'skip'; // skip | update
    $download  = $opts['download_images'] ?? true;
    // Same guard as the Bulk Stock Update tool: an "update" import shouldn't
    // silently un-zero a product that was deliberately marked Out of Stock
    // in the admin panel — the import file's stock figure isn't aware of
    // that local decision. Off by default; the import UI has to opt in.
    $includeOutOfStock = !empty($opts['include_out_of_stock']);

    // Chunked batch support
    $batchOffset = max(0, intval($opts['batch_offset'] ?? 0));
    $batchLimit  = max(1, intval($opts['batch_limit']  ?? 9999));

    if (!$filePath || !file_exists($filePath)) {
        errorResponse('Import file not found — please re-upload', 400);
    }

    $allRows = parseFile($filePath, $fileExt);
    if (!$allRows) errorResponse('Cannot parse file', 422);

    $headers = normaliseHeaders(array_shift($allRows));

    // Slice to the requested batch
    $rows = array_slice($allRows, $batchOffset, $batchLimit);
    $isLastBatch = ($batchOffset + $batchLimit) >= count($allRows);

    $log      = [];
    $imported = 0;
    $skipped  = 0;
    $updated  = 0;
    $errors   = 0;
    $startTime = time();

    // ── Ensure uploads/products dir ──────────────────────────────────────────
    @mkdir(__DIR__ . '/../uploads/products', 0755, true);

    foreach ($rows as $idx => $row) {
        $p = mapRow($headers, $row);
        if (empty(trim($p['name'] ?? ''))) continue;

        // Hard timeout guard — stop 20s before Hostinger's limit
        if ((time() - $startTime) >= 150) {
            $log[] = ['warn', "⚠ Time limit approaching — stopping batch early at row " . ($batchOffset + $idx + 1)];
            break;
        }

        try {
            $result = importProduct($db, $p, $duplicate, $download, $includeOutOfStock);
            if ($result === 'imported') { $imported++; $log[] = ['ok', "✓ Imported: " . $p['name']]; }
            elseif ($result === 'updated') { $updated++;  $log[] = ['ok', "↻ Updated: " . $p['name']]; }
            elseif ($result === 'skipped') { $skipped++;  $log[] = ['skip', "⊘ Skipped (duplicate): " . $p['name']]; }
        } catch (\Throwable $e) {
            $errors++;
            $log[] = ['error', "✗ Error on \"" . ($p['name'] ?? "row $idx") . "\": " . $e->getMessage()];
        }
    }

    // Only delete the temp file after the LAST batch
    if ($isLastBatch) {
        @unlink($filePath);
    }

    successResponse([
        'imported' => $imported,
        'updated'  => $updated,
        'skipped'  => $skipped,
        'errors'   => $errors,
        'total'    => $imported + $updated + $skipped + $errors,
        'log'      => array_slice($log, 0, 200), // cap log size
    ], "Batch done: $imported imported, $updated updated, $skipped skipped, $errors errors");
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS (future chunked imports)
// ═══════════════════════════════════════════════════════════════════════════
function doStatus() {
    session_start();
    successResponse([
        'progress' => $_SESSION['import_progress'] ?? 0,
        'total'    => $_SESSION['import_total']    ?? 0,
    ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
function uploadImportFile() {
    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        errorResponse('No file uploaded or upload error', 400);
    }
    $ext  = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['csv', 'xlsx', 'xls'])) errorResponse('Only CSV and XLSX files supported', 415);

    @mkdir(__DIR__ . '/../uploads/imports', 0755, true);
    $dest = __DIR__ . '/../uploads/imports/' . uniqid('import_') . '.' . $ext;
    if (!move_uploaded_file($_FILES['file']['tmp_name'], $dest)) errorResponse('Failed to save uploaded file', 500);

    return ['path' => $dest, 'ext' => $ext];
}

function parseFile($path, $ext) {
    if ($ext === 'xlsx' || $ext === 'xls') {
        $xlsx = SimpleXLSX::parse($path);
        if (!$xlsx) return false;
        return $xlsx->rows(0);
    }
    // CSV — auto-detect delimiter, strip UTF-8 BOM
    $rows = [];
    $fp = fopen($path, 'r');
    if (!$fp) return false;
    // Strip BOM if present (WooCommerce exports sometimes add it)
    $bom = fread($fp, 3);
    if ($bom !== "\xEF\xBB\xBF") rewind($fp); // no BOM — rewind
    // Sniff delimiter from first line
    $line = fgets($fp);
    rewind($fp);
    if ($bom === "\xEF\xBB\xBF") fread($fp, 3); // re-skip BOM
    $delim = substr_count($line, "\t") > substr_count($line, ',') ? "\t" : ',';
    // PHP 8.1+ fgetcsv: omit the deprecated length param
    while (($row = fgetcsv($fp, null, $delim)) !== false) $rows[] = $row;
    fclose($fp);
    return $rows;
}

/**
 * Normalise header row — map WooCommerce headers to internal keys.
 */
function normaliseHeaders($headerRow) {
    $map = [
        // WooCommerce standard export columns
        'id'                              => 'woo_id',
        'name'                            => 'name',
        'post title'                      => 'name',
        'product name'                    => 'name',
        'type'                            => 'type',
        'sku'                             => 'sku',
        'short description'               => 'short_description',
        'description'                     => 'description',
        'regular price'                   => 'price',
        'price'                           => 'price',
        'sale price'                      => 'sale_price',
        'stock'                           => 'stock',
        'in stock?'                       => 'in_stock',
        'stock quantity'                  => 'stock',
        'categories'                      => 'categories',
        'category'                        => 'categories',
        'tags'                            => 'tags',
        'images'                          => 'images',
        'image'                           => 'images',
        'featured image'                  => 'images',
        'slug'                            => 'slug',
        'post name'                       => 'slug',
        'is featured?'                    => 'is_featured',
        'featured'                        => 'is_featured',
        'weight (kg)'                     => 'weight',
        'weight'                          => 'weight',
        'brand'                           => 'brand',
        'meta: _yoast_wpseo_title'        => 'meta_title',
        'meta title'                      => 'meta_title',
        'meta: _yoast_wpseo_metadesc'     => 'meta_description',
        'meta description'                => 'meta_description',
        'meta: _yoast_wpseo_focuskw'      => 'focus_keyword',
        'focus keyword'                   => 'focus_keyword',
        'published'                       => 'is_active',
        'visibility in catalog'           => 'visibility',
        'tax status'                      => '_skip',
        'tax class'                       => '_skip',
        'backorders allowed?'             => '_skip',
        'sold individually?'              => '_skip',
        'allow customer reviews?'         => '_skip',
        'purchase note'                   => '_skip',
        'position'                        => 'sort_order',
        'parent'                          => '_skip',
    ];

    $normalised = [];
    foreach ($headerRow as $h) {
        $key = trim(strtolower((string)$h));
        $normalised[] = $map[$key] ?? $key;
    }
    return $normalised;
}

function mapRow($headers, $row) {
    $data = [];
    foreach ($headers as $i => $key) {
        $data[$key] = isset($row[$i]) ? trim((string)$row[$i]) : '';
    }
    return $data;
}

/**
 * Import a single product row into the DB.
 * Returns 'imported' | 'updated' | 'skipped'
 */
function importProduct($db, $p, $duplicate, $downloadImages, $includeOutOfStock = false) {
    $name = trim($p['name'] ?? '');
    if (!$name) return 'skipped';

    // Skip WooCommerce variation rows (type = variation)
    $type = strtolower($p['type'] ?? '');
    if ($type === 'variation') return 'skipped';

    $sku  = trim($p['sku'] ?? '') ?: null;
    $slug = slugify($p['slug'] ?? $name);
    $price = parsePrice($p['price'] ?? $p['regular_price'] ?? '0');
    $salePrice = parsePrice($p['sale_price'] ?? '');
    $stock = (int)($p['stock'] ?? $p['stock_quantity'] ?? 0);
    $inStock = isset($p['in_stock']) ? (strtolower($p['in_stock']) === 'yes' ? 1 : 0) : ($stock > 0 ? 1 : 1);
    $isActive = 1;
    if (isset($p['is_active']) && $p['is_active'] !== '') {
        $isActive = ($p['is_active'] == '1' || strtolower($p['is_active']) === 'yes' || strtolower($p['is_active']) === 'publish') ? 1 : 0;
    }
    $isFeatured = ($p['is_featured'] ?? 'no') === 'yes' ? 1 : 0;

    // ── Duplicate check ──────────────────────────────────────────────────────
    $existing = null;
    if ($sku) {
        $s = $db->prepare("SELECT id, stock FROM products WHERE sku = :sku LIMIT 1");
        $s->execute([':sku' => $sku]);
        $existing = $s->fetch();
    }
    if (!$existing) {
        $s = $db->prepare("SELECT id, stock FROM products WHERE slug = :slug LIMIT 1");
        $s->execute([':slug' => $slug]);
        $existing = $s->fetch();
    }

    if ($existing && $duplicate === 'skip') return 'skipped';

    // Existing product deliberately at 0 and the import wasn't told to
    // override that — keep it at 0 instead of taking the file's figure.
    if ($existing && (int)$existing['stock'] <= 0 && !$includeOutOfStock) {
        $stock = (int)$existing['stock'];
    }

    // ── Categories ────────────────────────────────────────────────────────────
    $catIds = resolveCategories($db, $p['categories'] ?? '');

    // ── Images ────────────────────────────────────────────────────────────────
    $imageUrls  = array_filter(array_map('trim', explode(',', $p['images'] ?? '')));
    $localImages = [];
    if ($downloadImages && count($imageUrls)) {
        foreach (array_slice($imageUrls, 0, 5) as $url) {
            $local = downloadImage($url);
            if ($local) $localImages[] = $local;
        }
    } else {
        $localImages = $imageUrls; // store URLs as-is if not downloading
    }
    $primaryImage = $localImages[0] ?? null;

    // ── Build product data ────────────────────────────────────────────────────
    $shortDesc = strip_tags($p['short_description'] ?? '');
    if (strlen($shortDesc) > 500) $shortDesc = substr($shortDesc, 0, 497) . '...';

    $data = [
        ':name'             => $name,
        ':slug'             => makeUniqueSlug($db, $slug, $existing['id'] ?? null),
        ':sku'              => $sku,
        ':short_description'=> $shortDesc,
        ':description'      => $p['description'] ?? null,
        ':price'            => $price ?: 0,
        ':sale_price'       => $salePrice ?: null,
        ':stock'            => $stock,
        ':brand'            => $p['brand'] ?? null,
        ':weight'           => is_numeric($p['weight'] ?? '') ? (float)$p['weight'] : null,
        ':is_active'        => $isActive,
        ':is_featured'      => $isFeatured,
        ':meta_title'       => $p['meta_title'] ?? null,
        ':meta_description' => $p['meta_description'] ?? null,
        ':focus_keyword'    => $p['focus_keyword'] ?? null,
        ':image'            => $primaryImage,
    ];

    if ($existing && $duplicate === 'update') {
        $pid = (int)$existing['id'];
        $db->prepare("UPDATE products SET
            name=:name, slug=:slug, sku=:sku, short_description=:short_description,
            description=:description, price=:price, sale_price=:sale_price,
            stock=:stock, brand=:brand, weight=:weight, is_active=:is_active,
            is_featured=:is_featured, meta_title=:meta_title,
            meta_description=:meta_description, focus_keyword=:focus_keyword
            WHERE id=$pid")->execute(array_filter($data, fn($k) => $k !== ':image', ARRAY_FILTER_USE_KEY));
        $action = 'updated';
    } else {
        // INSERT
        $db->prepare("INSERT INTO products
            (name, slug, sku, short_description, description, price, sale_price, stock,
             brand, weight, is_active, is_featured, meta_title, meta_description, focus_keyword)
            VALUES
            (:name,:slug,:sku,:short_description,:description,:price,:sale_price,:stock,
             :brand,:weight,:is_active,:is_featured,:meta_title,:meta_description,:focus_keyword)"
        )->execute(array_filter($data, fn($k) => $k !== ':image', ARRAY_FILTER_USE_KEY));
        $pid    = (int)$db->lastInsertId();
        $action = 'imported';
    }

    // ── Assign categories ──────────────────────────────────────────────────────
    if ($catIds) {
        // Remove old category links for this product (re-link)
        $db->prepare("DELETE FROM product_categories WHERE product_id = :pid")->execute([':pid' => $pid]);
        $ins = $db->prepare("INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (:pid, :cid)");
        foreach ($catIds as $cid) $ins->execute([':pid' => $pid, ':cid' => $cid]);
    }

    // ── Store images ───────────────────────────────────────────────────────────
    if ($localImages && $action === 'imported') {
        // For updates, optionally skip to avoid duplicates
        $imgStmt = $db->prepare("INSERT INTO product_images (product_id, image_path, alt_text, sort_order, is_primary) VALUES (:pid,:path,:alt,:ord,:primary)");
        foreach ($localImages as $i => $img) {
            $imgStmt->execute([
                ':pid'     => $pid,
                ':path'    => $img,
                ':alt'     => $name,
                ':ord'     => $i,
                ':primary' => $i === 0 ? 1 : 0,
            ]);
        }
    }

    return $action;
}

/**
 * Parse WooCommerce category string like "Parent Category > Child Category, Another Category"
 * Returns array of category IDs, creating missing ones.
 */
function resolveCategories($db, $catString) {
    if (!$catString) return [];
    // WooCommerce uses comma-separated categories, with > for hierarchy
    $parts = array_filter(array_map('trim', explode(',', $catString)));
    $ids   = [];
    foreach ($parts as $part) {
        // "Parent > Child" hierarchy
        $segments = array_map('trim', explode('>', $part));
        $parentId = null;
        foreach ($segments as $seg) {
            if (!$seg) continue;
            $slug = slugify($seg);
            $row = $db->prepare("SELECT id FROM categories WHERE slug = :slug OR name = :name LIMIT 1");
            $row->execute([':slug' => $slug, ':name' => $seg]);
            $cat = $row->fetch();
            if (!$cat) {
                // Create new category
                $db->prepare("INSERT INTO categories (name, slug, parent_id, is_active) VALUES (:n,:s,:p,1)")
                   ->execute([':n' => $seg, ':s' => $slug, ':p' => $parentId]);
                $catId = (int)$db->lastInsertId();
            } else {
                $catId = (int)$cat['id'];
            }
            $parentId = $catId;
        }
        $ids[] = $catId ?? null;
    }
    return array_filter($ids);
}

function downloadImage($url) {
    if (!filter_var($url, FILTER_VALIDATE_URL)) return null;
    $ext  = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) $ext = 'jpg';

    $dir  = __DIR__ . '/../uploads/products/';
    @mkdir($dir, 0755, true);
    $name = 'woo_' . md5($url) . '.' . $ext;
    $dest = $dir . $name;

    // Skip if already downloaded
    if (file_exists($dest)) return 'uploads/products/' . $name;

    // Try curl first, then file_get_contents
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT        => 20,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; importer/1.0)',
        ]);
        $data = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($data && $code === 200) {
            file_put_contents($dest, $data);
            return 'uploads/products/' . $name;
        }
    } else {
        $ctx  = stream_context_create(['http' => ['timeout' => 15, 'user_agent' => 'Mozilla/5.0']]);
        $data = @file_get_contents($url, false, $ctx);
        if ($data) {
            file_put_contents($dest, $data);
            return 'uploads/products/' . $name;
        }
    }
    return null;
}

function slugify($text) {
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-');
}

function makeUniqueSlug($db, $slug, $excludeId = null) {
    $base = $slug;
    $i    = 1;
    while (true) {
        $q = "SELECT id FROM products WHERE slug = :slug" . ($excludeId ? " AND id != $excludeId" : '');
        $s = $db->prepare($q);
        $s->execute([':slug' => $slug]);
        if (!$s->fetch()) return $slug;
        $slug = $base . '-' . $i++;
    }
}

function parsePrice($val) {
    $val = preg_replace('/[^\d.]/', '', $val);
    return is_numeric($val) ? (float)$val : null;
}
