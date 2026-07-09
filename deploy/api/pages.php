<?php
/**
 * Static Pages API
 * CRUD for footer help pages: Privacy Policy, Terms, Delivery Info, Returns, FAQ etc.
 */

function getPages($db) {
    $active = isset($_GET['active']) ? (int)$_GET['active'] : null;
    $sql = "SELECT id, title, slug, meta_title, meta_description, is_active, created_at, updated_at FROM pages";
    if ($active !== null) $sql .= " WHERE is_active = $active";
    $sql .= " ORDER BY title ASC";
    $stmt = $db->query($sql);
    successResponse($stmt->fetchAll());
}

function getPageBySlug($db, $slug) {
    $stmt = $db->prepare("SELECT * FROM pages WHERE slug = ? AND is_active = 1");
    $stmt->execute([$slug]);
    $page = $stmt->fetch();
    if (!$page) { errorResponse('Page not found', 404); return; }
    successResponse($page);
}

function getPageById($db, $id) {
    $stmt = $db->prepare("SELECT * FROM pages WHERE id = ?");
    $stmt->execute([$id]);
    $page = $stmt->fetch();
    if (!$page) { errorResponse('Page not found', 404); return; }
    successResponse($page);
}

function createPage($db) {
    $data = getJsonInput();
    if (empty($data['title'])) { errorResponse('Title is required', 400); return; }

    $slug = generateSlug($data['title'], $db, 'pages');
    if (!empty($data['slug'])) {
        $slug = generateSlug($data['slug'], $db, 'pages');
    }

    $stmt = $db->prepare("INSERT INTO pages (title, slug, content, meta_title, meta_description, is_active) VALUES (?,?,?,?,?,?)");
    $stmt->execute([
        $data['title'],
        $slug,
        $data['content'] ?? '',
        $data['meta_title'] ?? $data['title'],
        $data['meta_description'] ?? '',
        isset($data['is_active']) ? (int)$data['is_active'] : 1,
    ]);
    $id = $db->lastInsertId();
    getPageById($db, $id);
}

function updatePage($db, $id) {
    $data = !empty($_POST) ? $_POST : getJsonInput();
    if (empty($data)) { errorResponse('No data provided', 400); return; }

    $stmt = $db->prepare("SELECT id, slug FROM pages WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch();
    if (!$existing) { errorResponse('Page not found', 404); return; }

    $slug = $existing['slug'];
    if (!empty($data['slug']) && $data['slug'] !== $existing['slug']) {
        $slug = generateSlug($data['slug'], $db, 'pages', $id);
    } elseif (!empty($data['title']) && empty($data['slug'])) {
        // Only auto-generate slug if slug field not provided
        $slug = $existing['slug'];
    }

    $fields = [];
    $params = [];
    $allowed = ['title','slug','content','meta_title','meta_description','is_active'];
    foreach ($allowed as $f) {
        if (isset($data[$f])) {
            $fields[] = "$f = ?";
            $params[] = $f === 'slug' ? $slug : ($f === 'is_active' ? (int)$data[$f] : $data[$f]);
        }
    }
    if (empty($fields)) { errorResponse('No valid fields to update', 400); return; }
    $params[] = $id;
    $db->prepare("UPDATE pages SET " . implode(',', $fields) . " WHERE id = ?")->execute($params);
    getPageById($db, $id);
}

function deletePage($db, $id) {
    $stmt = $db->prepare("DELETE FROM pages WHERE id = ?");
    $stmt->execute([$id]);
    successResponse(null, 'Page deleted');
}

function seedDefaultPages($db) {
    $defaults = [
        ['Privacy Policy',     'privacy-policy',    '<h2>Privacy Policy</h2><p>We value your privacy. This policy explains how we collect, use, and protect your personal data.</p><p>We do not sell or share your information with third parties without your consent.</p>'],
        ['Terms & Conditions', 'terms-conditions',  '<h2>Terms &amp; Conditions</h2><p>By using our website and services, you agree to these terms and conditions.</p><p>We reserve the right to update these terms at any time.</p>'],
        ['Returns Policy',     'returns-policy',    '<h2>Returns Policy</h2><p>We accept returns within 7 days of delivery for non-perishable items.</p><p>Fresh products cannot be returned. Please contact us if you have any issues.</p>'],
        ['Delivery Info',      'delivery-info',     '<h2>Delivery Information</h2><p>We offer free delivery on orders over €50. Standard delivery is €5.</p><p>Same-day delivery is available for orders placed before 12 noon.</p>'],
        ['FAQ',                'faq',               '<h2>Frequently Asked Questions</h2><h3>How do I track my order?</h3><p>You can track your order using the order number sent in your confirmation email.</p><h3>What payment methods do you accept?</h3><p>We accept all major credit/debit cards and PayPal.</p>'],
    ];

    $check = $db->prepare("SELECT id FROM pages WHERE slug = ?");
    $ins   = $db->prepare("INSERT INTO pages (title, slug, content, meta_title, is_active) VALUES (?,?,?,?,1)");

    foreach ($defaults as [$title, $slug, $content]) {
        $check->execute([$slug]);
        if (!$check->fetch()) {
            $ins->execute([$title, $slug, $content, $title]);
        }
    }
}
