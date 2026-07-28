<?php
/**
 * Inventory Management API
 *
 * GET  /api/inventory                — all products with stock levels + alerts
 * GET  /api/inventory/alerts         — low stock and out-of-stock products
 * GET  /api/inventory/history        — stock movement audit trail
 * POST /api/inventory/adjust         — manual adjustment (admin only)
 * GET  /api/inventory/product/{id}   — stock for a specific product + its variants
 */

/**
 * Core function to record a stock movement and update stock level.
 * Used internally and by orders, imports, etc.
 */
function adjustStock(
    PDO    $db,
    int    $productId,
    int    $qtyChange,
    string $type       = 'adjustment',
    string $reference  = '',
    string $note       = '',
    ?int   $variantId  = null,
    ?int   $adminId    = null
): array {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    if ($variantId) {
        $row = $db->prepare("SELECT stock FROM product_variants WHERE id = :vid FOR UPDATE");
        $row->execute([':vid' => $variantId]);
        $cur = $row->fetch();
        if (!$cur) return ['success' => false, 'error' => 'Variant not found'];

        $before = (int)$cur['stock'];
        $after  = max(0, $before + $qtyChange);

        $db->prepare("UPDATE product_variants SET stock = :s WHERE id = :vid")
           ->execute([':s' => $after, ':vid' => $variantId]);
    } else {
        $row = $db->prepare("SELECT stock FROM products WHERE id = :pid AND site_id = :s FOR UPDATE");
        $row->execute([':pid' => $productId, ':s' => $siteId]);
        $cur = $row->fetch();
        if (!$cur) return ['success' => false, 'error' => 'Product not found'];

        $before = (int)$cur['stock'];
        $after  = max(0, $before + $qtyChange);

        $db->prepare("UPDATE products SET stock = :s WHERE id = :pid AND site_id = :sid")
           ->execute([':s' => $after, ':pid' => $productId, ':sid' => $siteId]);
    }

    // Write audit trail
    $db->prepare("INSERT INTO inventory_history
        (site_id, product_id, variant_id, type, qty_before, qty_change, qty_after, reference, note, admin_id)
        VALUES (:s, :pid, :vid, :type, :before, :change, :after, :ref, :note, :aid)")
       ->execute([
           ':s'      => $siteId,
           ':pid'    => $productId,
           ':vid'    => $variantId,
           ':type'   => $type,
           ':before' => $before,
           ':change' => $qtyChange,
           ':after'  => $after,
           ':ref'    => $reference ?: null,
           ':note'   => $note ?: null,
           ':aid'    => $adminId,
       ]);

    // Queue low-stock alert if threshold crossed
    $threshold = 5; // default
    if ($after <= $threshold && $before > $threshold && function_exists('dispatch')) {
        dispatch('send_low_stock_alert', [
            'product_id'    => $productId,
            'variant_id'    => $variantId,
            'current_stock' => $after,
            'threshold'     => $threshold,
        ]);
    }

    return ['success' => true, 'before' => $before, 'after' => $after, 'change' => $qtyChange];
}

function getInventory(PDO $db): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    [$page, $perPage, $offset] = getPaginationParams();

    $filter = $_GET['filter'] ?? 'all'; // all | low | out
    $q      = $_GET['q'] ?? '';

    $where  = ["p.site_id = :s"];
    $params = [':s' => $siteId];

    if ($filter === 'out')  $where[] = "p.stock = 0";
    if ($filter === 'low')  $where[] = "p.stock > 0 AND p.stock <= COALESCE(p.low_stock_threshold, 5)";
    if ($q) { $where[] = "p.name LIKE :q"; $params[':q'] = '%' . $q . '%'; }

    $clause = 'WHERE ' . implode(' AND ', $where);
    $count  = $db->prepare("SELECT COUNT(*) FROM products p $clause");
    $count->execute($params);
    $total  = (int)$count->fetchColumn();

    $stmt = $db->prepare("SELECT p.id, p.name, p.sku, p.stock, p.low_stock_threshold,
        p.is_active, p.price, p.image_path,
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id AND is_active = 1) AS variant_count
        FROM products p $clause
        ORDER BY p.stock ASC, p.name ASC
        LIMIT :lim OFFSET :off");

    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset,  PDO::PARAM_INT);
    $stmt->execute();

    $products = $stmt->fetchAll();

    // Alerts summary
    $alertStmt = $db->prepare("SELECT
        SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS out_of_stock,
        SUM(CASE WHEN stock > 0 AND stock <= COALESCE(low_stock_threshold, 5) THEN 1 ELSE 0 END) AS low_stock
        FROM products WHERE site_id = :s AND is_active = 1");
    $alertStmt->execute([':s' => $siteId]);
    $alerts = $alertStmt->fetch();

    paginatedResponse($products, $total, $page, $perPage, [
        'alerts' => [
            'out_of_stock' => (int)($alerts['out_of_stock'] ?? 0),
            'low_stock'    => (int)($alerts['low_stock']    ?? 0),
        ]
    ]);
}

function getInventoryAlerts(PDO $db): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    $stmt = $db->prepare("SELECT p.id, p.name, p.sku, p.stock, p.low_stock_threshold,
        CASE WHEN p.stock = 0 THEN 'out_of_stock'
             WHEN p.stock <= COALESCE(p.low_stock_threshold, 5) THEN 'low_stock'
             ELSE 'ok' END AS stock_status
        FROM products p
        WHERE p.site_id = :s AND p.is_active = 1
          AND (p.stock = 0 OR p.stock <= COALESCE(p.low_stock_threshold, 5))
        ORDER BY p.stock ASC, p.name");
    $stmt->execute([':s' => $siteId]);
    successResponse($stmt->fetchAll());
}

function getInventoryHistory(PDO $db): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;
    [$page, $perPage, $offset] = getPaginationParams();

    $productId = (int)($_GET['product_id'] ?? 0);
    $type      = $_GET['type'] ?? '';

    $where  = ["h.site_id = :s"];
    $params = [':s' => $siteId];
    if ($productId) { $where[] = "h.product_id = :pid"; $params[':pid'] = $productId; }
    if ($type)      { $where[] = "h.type = :type"; $params[':type'] = $type; }

    $clause = 'WHERE ' . implode(' AND ', $where);
    $count  = $db->prepare("SELECT COUNT(*) FROM inventory_history h $clause");
    $count->execute($params);
    $total  = (int)$count->fetchColumn();

    $stmt = $db->prepare("SELECT h.*, p.name AS product_name,
        COALESCE(a.name, 'N/A') AS admin_name
        FROM inventory_history h
        LEFT JOIN products p ON p.id = h.product_id
        LEFT JOIN admins a   ON a.id = h.admin_id
        $clause
        ORDER BY h.created_at DESC
        LIMIT :lim OFFSET :off");

    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset,  PDO::PARAM_INT);
    $stmt->execute();

    paginatedResponse($stmt->fetchAll(), $total, $page, $perPage);
}

function getProductInventory(PDO $db, int $productId): void {
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    $prodStmt = $db->prepare("SELECT id, name, sku, stock, low_stock_threshold FROM products WHERE id = :pid AND site_id = :s");
    $prodStmt->execute([':pid' => $productId, ':s' => $siteId]);
    $product = $prodStmt->fetch();
    if (!$product) errorResponse('Product not found', 404);

    $varStmt = $db->prepare("SELECT v.id, v.sku, v.stock, v.reserved_stock, v.low_stock_threshold,
        GROUP_CONCAT(CONCAT(a.name, ':', av.value) SEPARATOR ' / ') AS label
        FROM product_variants v
        LEFT JOIN variant_attribute_values vav ON vav.variant_id = v.id
        LEFT JOIN product_attribute_values av  ON av.id = vav.value_id
        LEFT JOIN product_attributes a         ON a.id  = vav.attribute_id
        WHERE v.product_id = :pid GROUP BY v.id ORDER BY v.sort_order");
    $varStmt->execute([':pid' => $productId]);
    $product['variants'] = $varStmt->fetchAll();

    $histStmt = $db->prepare("SELECT type, qty_before, qty_change, qty_after, reference, note, created_at
        FROM inventory_history WHERE product_id = :pid AND site_id = :s ORDER BY created_at DESC LIMIT 20");
    $histStmt->execute([':pid' => $productId, ':s' => $siteId]);
    $product['recent_history'] = $histStmt->fetchAll();

    successResponse($product);
}

function adjustStockApi(PDO $db): void {
    $admin  = requireAuth();
    $data   = getJsonInput();
    $siteId = defined('ECOMMERCE_SITE_ID') ? ECOMMERCE_SITE_ID : 1;

    $productId = (int)($data['product_id'] ?? 0);
    $variantId = isset($data['variant_id']) ? (int)$data['variant_id'] : null;
    $qtyChange = (int)($data['qty_change'] ?? 0);
    $type      = $data['type'] ?? 'adjustment';
    $note      = $data['note'] ?? '';
    $reference = $data['reference'] ?? '';

    if (!$productId) errorResponse('product_id required', 400);
    if ($qtyChange === 0) errorResponse('qty_change cannot be zero', 400);

    $allowedTypes = ['adjustment','import','damage','expiry','return'];
    if (!in_array($type, $allowedTypes)) $type = 'adjustment';

    $db->beginTransaction();
    try {
        $result = adjustStock($db, $productId, $qtyChange, $type, $reference, $note, $variantId, $admin['id'] ?? null);
        if (!$result['success']) { $db->rollBack(); errorResponse($result['error'], 400); }
        $db->commit();

        // Audit log
        if (function_exists('addAuditLog')) {
            addAuditLog($db, 'UPDATE', 'inventory', $productId,
                ['stock' => $result['before']],
                ['stock' => $result['after'], 'change' => $qtyChange, 'type' => $type],
                $admin
            );
        }

        successResponse($result, 'Stock adjusted');
    } catch (\Throwable $e) {
        $db->rollBack();
        errorResponse('Stock adjustment failed: ' . $e->getMessage(), 500);
    }
}

// Helper for pagination params (if not already defined in response.php)
if (!function_exists('getPaginationParams')) {
    function getPaginationParams(): array {
        $page    = max(1, (int)($_GET['page'] ?? 1));
        $perPage = min(100, max(1, (int)($_GET['per_page'] ?? 20)));
        return [$page, $perPage, ($page - 1) * $perPage];
    }
}
