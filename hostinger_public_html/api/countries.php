<?php
/**
 * Countries API — the admin-managed marketplace countries.
 *
 * Public:  GET /api/countries            → active countries (cached)
 * Admin:   GET /api/countries?all=1      → every country incl. inactive
 *          POST /api/countries           → create
 *          PUT /api/countries/{id}       → update
 *          DELETE /api/countries/{id}    → delete (unlinks products/categories/banners)
 *          POST /api/countries/{id}/default → make default
 */

function getCountries($db) {
    $all = isset($_GET['all']) && $_GET['all'] == '1';

    if (!$all) {
        $cached = cacheGet('countries_public');
        if ($cached !== null) { successResponse($cached); return; }
    }

    $where = $all ? '' : 'WHERE is_active = 1';
    $rows = $db->query("SELECT * FROM countries $where ORDER BY sort_order ASC, id ASC")->fetchAll();

    foreach ($rows as &$c) {
        $c['id'] = (int)$c['id'];
        $c['is_default'] = (int)$c['is_default'];
        $c['is_active'] = (int)$c['is_active'];
        $c['sort_order'] = (int)$c['sort_order'];
    }
    unset($c);

    if ($all) {
        // Attach usage counts for the admin list
        foreach ($rows as &$c) {
            $pc = $db->prepare("SELECT COUNT(*) FROM product_countries WHERE country_id = :id");
            $pc->execute([':id' => $c['id']]);
            $c['product_count'] = (int)$pc->fetchColumn();
            $cc = $db->prepare("SELECT COUNT(*) FROM category_countries WHERE country_id = :id");
            $cc->execute([':id' => $c['id']]);
            $c['category_count'] = (int)$cc->fetchColumn();
        }
        unset($c);
    } else {
        cacheSet('countries_public', $rows, 300);
    }

    successResponse($rows);
}

function countryPayload(): array {
    $data = !empty($_POST) ? $_POST : getJsonInput();
    return $data ?: [];
}

function createCountry($db) {
    $data = countryPayload();

    // Method override for admin forms that POST with _method=PUT
    if (!empty($data['_method']) && strtoupper($data['_method']) === 'PUT') {
        $id = (int)($data['country_id'] ?? 0);
        if (!$id) errorResponse('Country ID missing for update', 400);
        updateCountry($db, $id, $data);
        return;
    }

    $name = trim($data['name'] ?? '');
    $code = strtolower(trim($data['code'] ?? ''));
    if ($name === '' || $code === '') errorResponse('Country name and code are required', 400);
    if (!preg_match('/^[a-z0-9]{2,8}$/', $code)) errorResponse('Code must be 2–8 letters/numbers (e.g. "in", "tr")', 400);

    $dupe = $db->prepare("SELECT id FROM countries WHERE code = :c");
    $dupe->execute([':c' => $code]);
    if ($dupe->fetch()) errorResponse('A country with this code already exists', 409);

    $stmt = $db->prepare(
        "INSERT INTO countries
         (code, name, flag, headline, subtext, suggestions, currency_symbol, currency_code,
          meta_title, meta_description, contact_email, contact_phone, contact_address,
          delivery_info, is_default, is_active, sort_order)
         VALUES (:code, :name, :flag, :headline, :subtext, :sugg, :cs, :cc,
                 :mt, :md, :ce, :cp, :ca, :di, :def, :act, :sort)"
    );
    $stmt->execute([
        ':code' => $code,
        ':name' => $name,
        ':flag' => trim($data['flag'] ?? ''),
        ':headline' => trim($data['headline'] ?? ''),
        ':subtext' => trim($data['subtext'] ?? ''),
        ':sugg' => trim($data['suggestions'] ?? ''),
        ':cs' => trim($data['currency_symbol'] ?? ''),
        ':cc' => strtoupper(trim($data['currency_code'] ?? '')),
        ':mt' => trim($data['meta_title'] ?? ''),
        ':md' => trim($data['meta_description'] ?? ''),
        ':ce' => trim($data['contact_email'] ?? ''),
        ':cp' => trim($data['contact_phone'] ?? ''),
        ':ca' => trim($data['contact_address'] ?? ''),
        ':di' => trim($data['delivery_info'] ?? ''),
        ':def' => (int)($data['is_default'] ?? 0),
        ':act' => (int)($data['is_active'] ?? 1),
        ':sort' => (int)($data['sort_order'] ?? 0),
    ]);
    $id = (int)$db->lastInsertId();

    if (!empty($data['is_default'])) setDefaultCountryRow($db, $id);

    clearCountryCaches();
    successResponse(['id' => $id, 'code' => $code], 'Country created', 201);
}

function updateCountry($db, $id, $data = null) {
    $id = (int)$id;
    if ($data === null) $data = countryPayload();

    $exists = $db->prepare("SELECT id FROM countries WHERE id = :id");
    $exists->execute([':id' => $id]);
    if (!$exists->fetch()) errorResponse('Country not found', 404);

    $name = trim($data['name'] ?? '');
    $code = strtolower(trim($data['code'] ?? ''));
    if ($name === '' || $code === '') errorResponse('Country name and code are required', 400);
    if (!preg_match('/^[a-z0-9]{2,8}$/', $code)) errorResponse('Code must be 2–8 letters/numbers (e.g. "in", "tr")', 400);

    $dupe = $db->prepare("SELECT id FROM countries WHERE code = :c AND id != :id");
    $dupe->execute([':c' => $code, ':id' => $id]);
    if ($dupe->fetch()) errorResponse('Another country already uses this code', 409);

    $stmt = $db->prepare(
        "UPDATE countries SET
           code=:code, name=:name, flag=:flag, headline=:headline, subtext=:subtext,
           suggestions=:sugg, currency_symbol=:cs, currency_code=:cc,
           meta_title=:mt, meta_description=:md, contact_email=:ce, contact_phone=:cp,
           contact_address=:ca, delivery_info=:di, is_active=:act, sort_order=:sort
         WHERE id=:id"
    );
    $stmt->execute([
        ':id' => $id,
        ':code' => $code,
        ':name' => $name,
        ':flag' => trim($data['flag'] ?? ''),
        ':headline' => trim($data['headline'] ?? ''),
        ':subtext' => trim($data['subtext'] ?? ''),
        ':sugg' => trim($data['suggestions'] ?? ''),
        ':cs' => trim($data['currency_symbol'] ?? ''),
        ':cc' => strtoupper(trim($data['currency_code'] ?? '')),
        ':mt' => trim($data['meta_title'] ?? ''),
        ':md' => trim($data['meta_description'] ?? ''),
        ':ce' => trim($data['contact_email'] ?? ''),
        ':cp' => trim($data['contact_phone'] ?? ''),
        ':ca' => trim($data['contact_address'] ?? ''),
        ':di' => trim($data['delivery_info'] ?? ''),
        ':act' => (int)($data['is_active'] ?? 1),
        ':sort' => (int)($data['sort_order'] ?? 0),
    ]);

    if (!empty($data['is_default'])) setDefaultCountryRow($db, $id);

    clearCountryCaches();
    successResponse(['id' => $id, 'code' => $code], 'Country updated');
}

function setDefaultCountry($db, $id) {
    $id = (int)$id;
    $exists = $db->prepare("SELECT id FROM countries WHERE id = :id");
    $exists->execute([':id' => $id]);
    if (!$exists->fetch()) errorResponse('Country not found', 404);
    setDefaultCountryRow($db, $id);
    clearCountryCaches();
    successResponse(['id' => $id], 'Default country updated');
}

function setDefaultCountryRow($db, int $id): void {
    $db->exec("UPDATE countries SET is_default = 0");
    $db->prepare("UPDATE countries SET is_default = 1, is_active = 1 WHERE id = :id")->execute([':id' => $id]);
}

function deleteCountry($db, $id) {
    $id = (int)$id;
    $check = $db->prepare("SELECT id, is_default FROM countries WHERE id = :id");
    $check->execute([':id' => $id]);
    $row = $check->fetch();
    if (!$row) errorResponse('Country not found', 404);

    $count = (int)$db->query("SELECT COUNT(*) FROM countries")->fetchColumn();
    if ($count <= 1) errorResponse('At least one country must remain', 400);

    try {
        $db->beginTransaction();
        $db->prepare("DELETE FROM product_countries WHERE country_id = :id")->execute([':id' => $id]);
        $db->prepare("DELETE FROM category_countries WHERE country_id = :id")->execute([':id' => $id]);
        $db->prepare("UPDATE banners SET country_id = NULL WHERE country_id = :id")->execute([':id' => $id]);
        $db->prepare("DELETE FROM countries WHERE id = :id")->execute([':id' => $id]);
        // Keep exactly one default
        if ((int)$row['is_default'] === 1) {
            $db->exec("UPDATE countries SET is_default = 1 WHERE id = (SELECT * FROM (SELECT MIN(id) FROM countries) t)");
        }
        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        errorResponse('Delete failed: ' . $e->getMessage(), 500);
    }

    clearCountryCaches();
    successResponse(['id' => $id], 'Country deleted');
}

function clearCountryCaches(): void {
    cacheClearPattern('countries_');
    cacheClearPattern('products_');
    cacheClearPattern('cat_products_');
    cacheClearPattern('categories_');
    cacheClearPattern('search_');
    cacheClearPattern('banners');
}
