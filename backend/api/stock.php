<?php
/**
 * Bulk Stock Update API
 * POST /api/stock/update
 * Body (JSON): { quantity, mode: 'all'|'category'|'selected', category_id?, product_ids? }
 */

requireAuth();
global $db;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('POST required', 405);
}

$data = getJsonInput();

$qty       = isset($data['quantity']) ? (int)$data['quantity'] : null;
$mode      = $data['mode'] ?? 'all';        // all | category | selected
$catId     = !empty($data['category_id']) ? (int)$data['category_id'] : null;
$productIds = $data['product_ids'] ?? [];   // array of ints
// Default OFF on purpose: without it, this endpoint had no idea a product's
// stock=0 was a deliberate "out of stock" call (set via the Products/
// Inventory pages) rather than just "hasn't been restocked yet" — a routine
// "restock category X" run here would silently un-zero it. Skipping
// stock=0 rows unless explicitly opted in preserves that intent.
$includeOutOfStock = !empty($data['include_out_of_stock']);

if ($qty === null || $qty < 0) {
    errorResponse('Invalid quantity value', 400);
}

try {
    switch ($mode) {

        case 'all':
            $where = $includeOutOfStock ? '' : 'WHERE stock > 0';
            $stmt = $db->prepare("UPDATE products SET stock = :qty, is_active = 1 $where");
            $stmt->execute([':qty' => $qty]);
            $affected = $stmt->rowCount();
            break;

        case 'category':
            if (!$catId) errorResponse('category_id required for category mode', 400);
            // Also include child categories
            $childIds = getDescendantCategoryIds($db, $catId);
            $allCatIds = array_merge([$catId], $childIds);
            $placeholders = implode(',', array_fill(0, count($allCatIds), '?'));
            $stockFilter = $includeOutOfStock ? '' : 'AND p.stock > 0';
            $stmt = $db->prepare(
                "UPDATE products p
                 INNER JOIN product_categories pc ON pc.product_id = p.id
                 SET p.stock = ?, p.is_active = 1
                 WHERE pc.category_id IN ($placeholders) $stockFilter"
            );
            $stmt->execute(array_merge([$qty], $allCatIds));
            $affected = $stmt->rowCount();
            break;

        case 'selected':
            if (empty($productIds)) errorResponse('product_ids required for selected mode', 400);
            $productIds = array_map('intval', $productIds);
            $placeholders = implode(',', array_fill(0, count($productIds), '?'));
            $stockFilter = $includeOutOfStock ? '' : 'AND stock > 0';
            $stmt = $db->prepare(
                "UPDATE products SET stock = ?, is_active = 1 WHERE id IN ($placeholders) $stockFilter"
            );
            $stmt->execute(array_merge([$qty], $productIds));
            $affected = $stmt->rowCount();
            break;

        default:
            errorResponse('Invalid mode', 400);
    }

    successResponse([
        'affected' => $affected,
        'quantity' => $qty,
        'mode'     => $mode,
        'included_out_of_stock' => $includeOutOfStock,
    ], "Stock updated: $affected product(s) set to $qty units and marked In Stock");

} catch (\Throwable $e) {
    errorResponse('Stock update failed: ' . $e->getMessage(), 500);
}

// ── Helper: get all descendant category IDs ──────────────────────────────────
function getDescendantCategoryIds($db, $parentId) {
    $ids = [];
    $stack = [$parentId];
    while ($stack) {
        $current = array_pop($stack);
        $rows = $db->prepare("SELECT id FROM categories WHERE parent_id = ?");
        $rows->execute([$current]);
        foreach ($rows->fetchAll() as $row) {
            $ids[] = (int)$row['id'];
            $stack[] = (int)$row['id'];
        }
    }
    return $ids;
}
