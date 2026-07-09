<?php
/**
 * Country marketplace helpers.
 *
 * Countries live in the `countries` table and are fully admin-managed.
 * Products/categories link through pivot tables; banners carry an optional
 * country_id (NULL = every country). Public endpoints accept ?country=<code|id>.
 */

/** Resolve a country code or numeric id to its id. Returns null when unknown/inactive. */
function resolveCountryId($db, $country): ?int {
    if ($country === null || $country === '') return null;
    static $cache = [];
    $key = strtolower(trim((string)$country));
    if (array_key_exists($key, $cache)) return $cache[$key];
    try {
        if (ctype_digit($key)) {
            $stmt = $db->prepare("SELECT id FROM countries WHERE id = :v AND is_active = 1");
        } else {
            $stmt = $db->prepare("SELECT id FROM countries WHERE code = :v AND is_active = 1");
        }
        $stmt->execute([':v' => $key]);
        $id = $stmt->fetchColumn();
        return $cache[$key] = ($id ? (int)$id : null);
    } catch (Exception $e) {
        return $cache[$key] = null; // countries table missing — behave as unfiltered
    }
}

/** product_id => [{id, code, name, flag}] for a set of products. */
function batchLoadProductCountries($db, array $productIds): array {
    if (empty($productIds)) return [];
    $ph = implode(',', array_map('intval', $productIds));
    try {
        $rows = $db->query(
            "SELECT pc.product_id, c.id, c.code, c.name, c.flag
             FROM product_countries pc
             INNER JOIN countries c ON c.id = pc.country_id
             WHERE pc.product_id IN ($ph)
             ORDER BY c.sort_order ASC"
        )->fetchAll();
    } catch (Exception $e) { return []; }
    $map = [];
    foreach ($rows as $r) {
        $map[$r['product_id']][] = [
            'id' => (int)$r['id'], 'code' => $r['code'],
            'name' => $r['name'], 'flag' => $r['flag'],
        ];
    }
    return $map;
}

/** category_id => [country ids] for a set of categories (admin forms). */
function batchLoadCategoryCountryIds($db, array $categoryIds): array {
    if (empty($categoryIds)) return [];
    $ph = implode(',', array_map('intval', $categoryIds));
    try {
        $rows = $db->query("SELECT category_id, country_id FROM category_countries WHERE category_id IN ($ph)")->fetchAll();
    } catch (Exception $e) { return []; }
    $map = [];
    foreach ($rows as $r) $map[$r['category_id']][] = (int)$r['country_id'];
    return $map;
}

/** Replace a product's country assignments. Accepts array of ids or JSON string. */
function syncProductCountries($db, int $productId, $countries): void {
    if (!is_array($countries)) {
        $decoded = json_decode((string)$countries, true);
        if (!is_array($decoded)) return;
        $countries = $decoded;
    }
    $db->prepare("DELETE FROM product_countries WHERE product_id = :p")->execute([':p' => $productId]);
    $ins = $db->prepare("INSERT IGNORE INTO product_countries (product_id, country_id) VALUES (:p, :c)");
    foreach ($countries as $cid) {
        if ((int)$cid > 0) $ins->execute([':p' => $productId, ':c' => (int)$cid]);
    }
}

/** Replace a category's country assignments. Accepts array of ids or JSON string. */
function syncCategoryCountries($db, int $categoryId, $countries): void {
    if (!is_array($countries)) {
        $decoded = json_decode((string)$countries, true);
        if (!is_array($decoded)) return;
        $countries = $decoded;
    }
    $db->prepare("DELETE FROM category_countries WHERE category_id = :c")->execute([':c' => $categoryId]);
    $ins = $db->prepare("INSERT IGNORE INTO category_countries (category_id, country_id) VALUES (:cat, :c)");
    foreach ($countries as $cid) {
        if ((int)$cid > 0) $ins->execute([':cat' => $categoryId, ':c' => (int)$cid]);
    }
}
