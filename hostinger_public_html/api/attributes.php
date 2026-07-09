<?php
/**
 * Product Attributes & Variants API
 *
 * GET    /api/attributes                      — list all attributes
 * POST   /api/attributes                      — create attribute
 * PUT    /api/attributes/{id}                 — update attribute
 * DELETE /api/attributes/{id}                 — delete attribute
 *
 * GET    /api/attributes/{id}/values          — list values for attribute
 * POST   /api/attributes/{id}/values          — add a value
 * DELETE /api/attributes/values/{valueId}     — delete a value
 *
 * GET    /api/products/{productId}/variants   — list product variants
 * POST   /api/products/{productId}/variants   — create a variant
 * PUT    /api/variants/{variantId}            — update variant
 * DELETE /api/variants/{variantId}            — delete variant
 */

// ─── ATTRIBUTES ───────────────────────────────────────────────────────────────

function getAttributes(PDO $db): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $cacheKey = "attributes_{$siteId}";

    if (function_exists('cacheGet') && ($cached = cacheGet($cacheKey)) !== null) {
        successResponse($cached); return;
    }

    $stmt = $db->prepare("SELECT a.*, COUNT(v.id) AS value_count
        FROM product_attributes a
        LEFT JOIN product_attribute_values v ON v.attribute_id = a.id
        WHERE a.site_id = :s GROUP BY a.id ORDER BY a.sort_order, a.name");
    $stmt->execute([':s' => $siteId]);
    $attrs = $stmt->fetchAll();

    foreach ($attrs as &$attr) {
        $vStmt = $db->prepare("SELECT * FROM product_attribute_values WHERE attribute_id = :aid ORDER BY sort_order, value");
        $vStmt->execute([':aid' => $attr['id']]);
        $attr['values'] = $vStmt->fetchAll();
    }

    if (function_exists('cacheSet')) cacheSet($cacheKey, $attrs, 600);
    successResponse($attrs);
}

function createAttribute(PDO $db): void {
    $data   = getJsonInput();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    $name = trim($data['name'] ?? '');
    if (!$name) errorResponse('Attribute name required', 400);

    require_once __DIR__ . '/../helpers/slug.php';
    $slug = generateSlug($name);
    $type = in_array($data['type'] ?? '', ['select','color','text','number']) ? $data['type'] : 'select';

    $db->prepare("INSERT INTO product_attributes (site_id, name, slug, type, sort_order, is_required, is_filterable)
        VALUES (:s, :n, :sl, :t, :so, :ir, :if)")
       ->execute([
           ':s' => $siteId, ':n' => $name, ':sl' => $slug, ':t' => $type,
           ':so' => (int)($data['sort_order'] ?? 0),
           ':ir' => (int)($data['is_required'] ?? 0),
           ':if' => (int)($data['is_filterable'] ?? 1),
       ]);

    if (function_exists('cacheClear')) cacheClear("attributes_{$siteId}");
    successResponse(['id' => (int)$db->lastInsertId()], 'Attribute created', 201);
}

function updateAttribute(PDO $db, int $id): void {
    $data   = getJsonInput();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    $fields = []; $params = [':id' => $id, ':s' => $siteId];
    if (isset($data['name']))          { $fields[] = 'name = :n';  $params[':n'] = trim($data['name']); }
    if (isset($data['type']))          { $fields[] = 'type = :t';  $params[':t'] = $data['type']; }
    if (isset($data['sort_order']))    { $fields[] = 'sort_order = :so'; $params[':so'] = (int)$data['sort_order']; }
    if (isset($data['is_required']))   { $fields[] = 'is_required = :ir'; $params[':ir'] = (int)$data['is_required']; }
    if (isset($data['is_filterable'])) { $fields[] = 'is_filterable = :if'; $params[':if'] = (int)$data['is_filterable']; }
    if (isset($data['is_active']))     { $fields[] = 'is_active = :ia'; $params[':ia'] = (int)$data['is_active']; }

    if (!$fields) errorResponse('Nothing to update', 400);

    $db->prepare("UPDATE product_attributes SET " . implode(', ', $fields) . " WHERE id = :id AND site_id = :s")
       ->execute($params);

    if (function_exists('cacheClear')) cacheClear("attributes_{$siteId}");
    successResponse(null, 'Attribute updated');
}

function deleteAttribute(PDO $db, int $id): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    $stmt = $db->prepare("SELECT COUNT(*) FROM product_attribute_values WHERE attribute_id = :id");
    $stmt->execute([':id' => $id]);
    if ($stmt->fetchColumn() > 0) errorResponse('Cannot delete attribute with existing values', 409);

    $db->prepare("DELETE FROM product_attributes WHERE id = :id AND site_id = :s AND is_active IS NOT NULL")
       ->execute([':id' => $id, ':s' => $siteId]);

    if (function_exists('cacheClear')) cacheClear("attributes_{$siteId}");
    successResponse(null, 'Attribute deleted');
}

// ─── ATTRIBUTE VALUES ─────────────────────────────────────────────────────────

function getAttributeValues(PDO $db, int $attrId): void {
    $stmt = $db->prepare("SELECT * FROM product_attribute_values WHERE attribute_id = :aid ORDER BY sort_order, value");
    $stmt->execute([':aid' => $attrId]);
    successResponse($stmt->fetchAll());
}

function createAttributeValue(PDO $db, int $attrId): void {
    $data  = getJsonInput();
    $value = trim($data['value'] ?? '');
    if (!$value) errorResponse('Value required', 400);

    $db->prepare("INSERT INTO product_attribute_values (attribute_id, value, label, color_hex, sort_order)
        VALUES (:aid, :v, :l, :c, :so)")
       ->execute([
           ':aid' => $attrId,
           ':v'   => $value,
           ':l'   => $data['label'] ?? null,
           ':c'   => $data['color_hex'] ?? null,
           ':so'  => (int)($data['sort_order'] ?? 0),
       ]);
    successResponse(['id' => (int)$db->lastInsertId()], 'Value added', 201);
}

function deleteAttributeValue(PDO $db, int $valueId): void {
    // Check if value is used in any variants
    $stmt = $db->prepare("SELECT COUNT(*) FROM variant_attribute_values WHERE value_id = :vid");
    $stmt->execute([':vid' => $valueId]);
    if ($stmt->fetchColumn() > 0) errorResponse('Value is used in product variants — remove variants first', 409);

    $db->prepare("DELETE FROM product_attribute_values WHERE id = :vid")->execute([':vid' => $valueId]);
    successResponse(null, 'Value deleted');
}

// ─── VARIANTS ─────────────────────────────────────────────────────────────────

function getProductVariants(PDO $db, int $productId): void {
    $stmt = $db->prepare("SELECT v.*,
        GROUP_CONCAT(CONCAT(a.name, ':', av.value) ORDER BY a.sort_order SEPARATOR ', ') AS attribute_summary
        FROM product_variants v
        LEFT JOIN variant_attribute_values vav ON vav.variant_id = v.id
        LEFT JOIN product_attribute_values av  ON av.id = vav.value_id
        LEFT JOIN product_attributes a         ON a.id  = vav.attribute_id
        WHERE v.product_id = :pid
        GROUP BY v.id
        ORDER BY v.sort_order, v.id");
    $stmt->execute([':pid' => $productId]);
    $variants = $stmt->fetchAll();

    foreach ($variants as &$v) {
        $avStmt = $db->prepare("SELECT vav.attribute_id, a.name AS attribute_name, vav.value_id, av.value, av.label, av.color_hex
            FROM variant_attribute_values vav
            JOIN product_attribute_values av ON av.id = vav.value_id
            JOIN product_attributes a ON a.id = vav.attribute_id
            WHERE vav.variant_id = :vid ORDER BY a.sort_order");
        $avStmt->execute([':vid' => $v['id']]);
        $v['attributes'] = $avStmt->fetchAll();
    }

    successResponse($variants);
}

function createVariant(PDO $db, int $productId): void {
    $data   = getJsonInput();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    // Validate product exists
    $chk = $db->prepare("SELECT id FROM products WHERE id = :pid AND site_id = :s");
    $chk->execute([':pid' => $productId, ':s' => $siteId]);
    if (!$chk->fetch()) errorResponse('Product not found', 404);

    $db->prepare("INSERT INTO product_variants
        (product_id, site_id, sku, barcode, price, sale_price, cost_price, stock, low_stock_threshold, weight, image_path, is_active, sort_order)
        VALUES (:pid, :s, :sku, :bar, :price, :sp, :cp, :stock, :lst, :wt, :img, :ia, :so)")
       ->execute([
           ':pid'   => $productId,
           ':s'     => $siteId,
           ':sku'   => $data['sku'] ?? null,
           ':bar'   => $data['barcode'] ?? null,
           ':price' => (float)($data['price'] ?? 0),
           ':sp'    => isset($data['sale_price']) ? (float)$data['sale_price'] : null,
           ':cp'    => isset($data['cost_price']) ? (float)$data['cost_price'] : null,
           ':stock' => (int)($data['stock'] ?? 0),
           ':lst'   => (int)($data['low_stock_threshold'] ?? 5),
           ':wt'    => isset($data['weight']) ? (float)$data['weight'] : null,
           ':img'   => $data['image_path'] ?? null,
           ':ia'    => (int)($data['is_active'] ?? 1),
           ':so'    => (int)($data['sort_order'] ?? 0),
       ]);

    $variantId = (int)$db->lastInsertId();

    // Link attribute values
    if (!empty($data['attribute_values']) && is_array($data['attribute_values'])) {
        $ins = $db->prepare("INSERT IGNORE INTO variant_attribute_values (variant_id, attribute_id, value_id) VALUES (:vid, :aid, :avid)");
        foreach ($data['attribute_values'] as $av) {
            if (isset($av['attribute_id'], $av['value_id'])) {
                $ins->execute([':vid' => $variantId, ':aid' => (int)$av['attribute_id'], ':avid' => (int)$av['value_id']]);
            }
        }
    }

    successResponse(['id' => $variantId], 'Variant created', 201);
}

function updateVariantFull(PDO $db, int $variantId): void {
    $data   = getJsonInput() ?: parseMultipartPut();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    $fields = []; $params = [':vid' => $variantId, ':s' => $siteId];
    $map = [
        'sku'                 => ':sku',
        'barcode'             => ':bar',
        'price'               => ':price',
        'sale_price'          => ':sp',
        'cost_price'          => ':cp',
        'stock'               => ':stock',
        'low_stock_threshold' => ':lst',
        'weight'              => ':wt',
        'image_path'          => ':img',
        'is_active'           => ':ia',
        'sort_order'          => ':so',
    ];

    foreach ($map as $col => $placeholder) {
        if (array_key_exists($col, $data)) {
            $fields[] = "$col = $placeholder";
            $params[$placeholder] = is_numeric($data[$col]) ? ($data[$col] + 0) : $data[$col];
        }
    }

    if ($fields) {
        $db->prepare("UPDATE product_variants SET " . implode(', ', $fields) . " WHERE id = :vid")
           ->execute($params);
    }

    // Re-link attribute values if provided
    if (isset($data['attribute_values']) && is_array($data['attribute_values'])) {
        $db->prepare("DELETE FROM variant_attribute_values WHERE variant_id = :vid")->execute([':vid' => $variantId]);
        $ins = $db->prepare("INSERT IGNORE INTO variant_attribute_values (variant_id, attribute_id, value_id) VALUES (:vid, :aid, :avid)");
        foreach ($data['attribute_values'] as $av) {
            if (isset($av['attribute_id'], $av['value_id'])) {
                $ins->execute([':vid' => $variantId, ':aid' => (int)$av['attribute_id'], ':avid' => (int)$av['value_id']]);
            }
        }
    }

    successResponse(null, 'Variant updated');
}

function deleteVariantFull(PDO $db, int $variantId): void {
    // Check if variant is used in any orders
    $stmt = $db->prepare("SELECT COUNT(*) FROM order_items WHERE variant_id = :vid");
    $stmt->execute([':vid' => $variantId]);
    if ($stmt->fetchColumn() > 0) errorResponse('Variant is used in existing orders — cannot delete', 409);

    $db->prepare("DELETE FROM product_variants WHERE id = :vid")->execute([':vid' => $variantId]);
    successResponse(null, 'Variant deleted');
}

/**
 * Shared helper — available to products.php
 */
function loadVariantsForProduct(PDO $db, int $productId): array {
    $stmt = $db->prepare("SELECT v.*,
        GROUP_CONCAT(CONCAT(a.name, ':', av.value) ORDER BY a.sort_order SEPARATOR ' / ') AS label
        FROM product_variants v
        LEFT JOIN variant_attribute_values vav ON vav.variant_id = v.id
        LEFT JOIN product_attribute_values av  ON av.id = vav.value_id
        LEFT JOIN product_attributes a         ON a.id  = vav.attribute_id
        WHERE v.product_id = :pid AND v.is_active = 1
        GROUP BY v.id ORDER BY v.sort_order");
    $stmt->execute([':pid' => $productId]);
    return $stmt->fetchAll() ?: [];
}
