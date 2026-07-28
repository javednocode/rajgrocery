<?php
require_once __DIR__ . '/backend/config/database.php';
$db = (new Database())->getConnection();
try {
    $stmt = $db->prepare("SELECT p.id, p.name, p.sku, p.stock, p.low_stock_threshold,
        p.is_active, p.price, p.image_path,
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id AND is_active = 1) AS variant_count
        FROM products p WHERE p.site_id = 1
        ORDER BY p.stock ASC, p.name ASC
        LIMIT 20 OFFSET 0");
    $stmt->execute();
    echo "Query OK\n";
} catch (Exception $e) {
    echo "Query Error: " . $e->getMessage() . "\n";
}
