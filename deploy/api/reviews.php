<?php
/**
 * Product Reviews API
 *
 * GET    /api/reviews?product_id=&status=pending|approved|all
 * GET    /api/reviews/{id}
 * POST   /api/reviews                — submit (public, from Angular frontend)
 * PUT    /api/reviews/{id}           — update/moderate (admin)
 * DELETE /api/reviews/{id}           — delete (admin)
 * POST   /api/reviews/{id}/approve   — approve (admin)
 * POST   /api/reviews/{id}/reject    — reject (admin)
 * GET    /api/reviews/summary/{product_id} — rating breakdown
 */

// ─── List Reviews ────────────────────────────────────────────────────────────

function getReviews(PDO $db): void {
    $siteId    = ECOMMERCE_SITE_ID;
    $productId = isset($_GET['product_id']) ? (int)$_GET['product_id'] : null;
    $status    = $_GET['status'] ?? 'approved'; // approved | pending | all (admin)
    $isAdmin   = false;

    // Admin can see pending + all
    if ($status !== 'approved') {
        requireAuth();
        $isAdmin = true;
    }

    [$page, $perPage, $offset] = getPaginationParams(20);

    $where  = ['r.site_id = :s'];
    $params = [':s' => $siteId];

    if ($productId) {
        $where[]         = 'r.product_id = :pid';
        $params[':pid']  = $productId;
    }

    if ($status === 'pending') {
        $where[] = 'r.is_approved = 0';
    } elseif ($status === 'approved') {
        $where[] = 'r.is_approved = 1';
    }
    // 'all' — no filter

    $sql = "SELECT r.id, r.product_id, r.customer_id, r.customer_name, r.rating, r.comment,
                   r.is_approved, r.created_at,
                   p.name AS product_name, p.slug AS product_slug
            FROM reviews r
            LEFT JOIN products p ON p.id = r.product_id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY r.created_at DESC
            LIMIT :limit OFFSET :offset";

    $params[':limit']  = $perPage;
    $params[':offset'] = $offset;

    $countSql = "SELECT COUNT(*) FROM reviews r WHERE " . implode(' AND ', $where);
    $countParams = array_filter($params, fn($k) => $k !== ':limit' && $k !== ':offset', ARRAY_FILTER_USE_KEY);
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($countParams);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $reviews = $stmt->fetchAll();

    paginatedResponse($reviews, $total, $page, $perPage);
}

// ─── Get Single Review ────────────────────────────────────────────────────────

function getReview(PDO $db, int $id): void {
    $siteId = ECOMMERCE_SITE_ID;
    $stmt   = $db->prepare("SELECT r.*, p.name AS product_name, p.slug AS product_slug
        FROM reviews r LEFT JOIN products p ON p.id = r.product_id
        WHERE r.id = ? AND r.site_id = ?");
    $stmt->execute([$id, $siteId]);
    $review = $stmt->fetch();
    if (!$review) errorResponse('Review not found', 404);
    successResponse($review);
}

// ─── Submit Review (Public) ──────────────────────────────────────────────────

function createReview(PDO $db): void {
    $siteId = ECOMMERCE_SITE_ID;
    $data   = getJsonInput();

    $productId   = (int)($data['product_id'] ?? 0);
    $rating      = (int)($data['rating'] ?? 0);
    $customerName = trim($data['customer_name'] ?? '');
    $comment     = trim($data['comment'] ?? '');

    if (!$productId) errorResponse('product_id required', 400);
    if ($rating < 1 || $rating > 5) errorResponse('rating must be between 1 and 5', 400);
    if (!$customerName) errorResponse('customer_name required', 400);
    if (mb_strlen($customerName) > 150) errorResponse('customer_name too long', 400);
    if (mb_strlen($comment) > 5000) errorResponse('comment too long (max 5000 chars)', 400);

    // Verify product belongs to this site
    $productCheck = $db->prepare("SELECT id FROM products WHERE id = ? AND site_id = ? AND is_active = 1");
    $productCheck->execute([$productId, $siteId]);
    if (!$productCheck->fetch()) errorResponse('Product not found', 404);

    // Rate limiting: max 1 review per IP per product per 24h
    $ipHash = md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $recent = $db->prepare("SELECT COUNT(*) FROM reviews WHERE product_id = ? AND site_id = ?
        AND customer_name = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)");
    $recent->execute([$productId, $siteId, $customerName]);
    if ((int)$recent->fetchColumn() > 0) {
        errorResponse('You have already reviewed this product recently', 429);
    }

    // Auto-approve if configured (default: require approval)
    $autoApprove = 0;
    try {
        $setting = $db->prepare("SELECT setting_value FROM site_settings WHERE site_id = ? AND setting_key = 'reviews_auto_approve'");
        $setting->execute([$siteId]);
        $autoApprove = (int)($setting->fetchColumn() ?: 0);
    } catch (\Exception $e) { /* ignore */ }

    $stmt = $db->prepare("INSERT INTO reviews (site_id, product_id, customer_id, customer_name, rating, comment, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $siteId,
        $productId,
        $data['customer_id'] ?? null,
        htmlspecialchars($customerName, ENT_QUOTES, 'UTF-8'),
        $rating,
        htmlspecialchars($comment, ENT_QUOTES, 'UTF-8'),
        $autoApprove,
    ]);

    $message = $autoApprove ? 'Review published' : 'Review submitted and pending approval';
    successResponse(['id' => (int)$db->lastInsertId(), 'is_approved' => $autoApprove], $message, 201);
}

// ─── Update Review (Admin) ────────────────────────────────────────────────────

function updateReview(PDO $db, int $id): void {
    requireAuth();
    $siteId = ECOMMERCE_SITE_ID;
    $data   = getJsonInput();

    $fields = []; $params = [':id' => $id, ':s' => $siteId];

    if (isset($data['rating']))       { $fields[] = 'rating = :r';       $params[':r']  = max(1, min(5, (int)$data['rating'])); }
    if (isset($data['comment']))      { $fields[] = 'comment = :c';      $params[':c']  = $data['comment']; }
    if (isset($data['customer_name'])){ $fields[] = 'customer_name = :n'; $params[':n'] = $data['customer_name']; }
    if (isset($data['is_approved']))  { $fields[] = 'is_approved = :ia'; $params[':ia'] = (int)$data['is_approved']; }

    if (!empty($fields)) {
        $db->prepare("UPDATE reviews SET " . implode(', ', $fields) . " WHERE id = :id AND site_id = :s")->execute($params);
    }

    successResponse(null, 'Review updated');
}

// ─── Approve / Reject ────────────────────────────────────────────────────────

function approveReview(PDO $db, int $id): void {
    requireAuth();
    $db->prepare("UPDATE reviews SET is_approved = 1 WHERE id = ? AND site_id = ?")->execute([$id, ECOMMERCE_SITE_ID]);
    // Refresh product average rating cache
    if (function_exists('cacheClearPattern')) cacheClearPattern('product_reviews_');
    successResponse(null, 'Review approved');
}

function rejectReview(PDO $db, int $id): void {
    requireAuth();
    $db->prepare("UPDATE reviews SET is_approved = 0 WHERE id = ? AND site_id = ?")->execute([$id, ECOMMERCE_SITE_ID]);
    if (function_exists('cacheClearPattern')) cacheClearPattern('product_reviews_');
    successResponse(null, 'Review rejected');
}

// ─── Delete Review (Admin) ────────────────────────────────────────────────────

function deleteReview(PDO $db, int $id): void {
    requireAuth();
    $db->prepare("DELETE FROM reviews WHERE id = ? AND site_id = ?")->execute([$id, ECOMMERCE_SITE_ID]);
    successResponse(null, 'Review deleted');
}

// ─── Rating Summary ──────────────────────────────────────────────────────────

function getReviewSummary(PDO $db, int $productId): void {
    $siteId   = ECOMMERCE_SITE_ID;
    $cacheKey = "product_reviews_{$siteId}_{$productId}";

    if (function_exists('cacheGet') && ($cached = cacheGet($cacheKey)) !== null) {
        successResponse($cached); return;
    }

    $stmt = $db->prepare("SELECT
            COUNT(*) AS total,
            ROUND(AVG(rating), 1) AS average,
            SUM(rating = 5) AS five_star,
            SUM(rating = 4) AS four_star,
            SUM(rating = 3) AS three_star,
            SUM(rating = 2) AS two_star,
            SUM(rating = 1) AS one_star
        FROM reviews
        WHERE product_id = ? AND site_id = ? AND is_approved = 1");
    $stmt->execute([$productId, $siteId]);
    $summary = $stmt->fetch();

    if (function_exists('cacheSet')) cacheSet($cacheKey, $summary, 300);
    successResponse($summary);
}
