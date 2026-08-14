<?php
/**
 * Customers API
 */
function getCustomers($db) {
    [$page, $perPage, $offset] = getPaginationParams();
    $where  = "WHERE 1=1";
    $params = [];

    // Full-text search across name, email, phone, username
    if (!empty($_GET['q'])) {
        $s = '%' . $_GET['q'] . '%';
        $where .= " AND (c.name LIKE :q1 OR c.email LIKE :q2 OR c.phone LIKE :q3 OR c.username LIKE :q4)";
        $params[':q1'] = $s; $params[':q2'] = $s; $params[':q3'] = $s; $params[':q4'] = $s;
    }

    // Filter by source (csv_import, storefront, …)
    if (!empty($_GET['source'])) {
        $where .= " AND c.source = :source";
        $params[':source'] = $_GET['source'];
    }

    // Filter: password reset pending
    if (!empty($_GET['password_reset'])) {
        $where .= " AND c.password_reset_required = 1";
    }

    // Filter: customers with at least one order
    if (!empty($_GET['has_orders'])) {
        $where .= " AND c.total_orders > 0";
    }

    $countStmt = $db->prepare("SELECT COUNT(*) FROM customers c $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $sql  = "SELECT c.* FROM customers c $where ORDER BY c.created_at DESC LIMIT :lim OFFSET :off";
    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset,  PDO::PARAM_INT);
    $stmt->execute();
    paginatedResponse($stmt->fetchAll(), $total, $page, $perPage);
}

/**
 * Single customer profile — personal/billing/shipping details plus
 * order aggregates computed LIVE from the orders table rather than the
 * customers.total_orders/total_spent snapshot columns. This is what
 * makes requirement #11 (future order import linking by customer_id)
 * work with zero extra code later: the moment an order-import writes
 * orders.customer_id for this customer, this endpoint reflects it
 * automatically — nothing to backfill or resync.
 */
function getCustomer($db, $id) {
    $stmt = $db->prepare("SELECT * FROM customers WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $customer = $stmt->fetch();
    if (!$customer) errorResponse('Customer not found', 404);

    $agg = $db->prepare("SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total), 0) AS lifetime_spend,
        MAX(created_at) AS last_order_date
        FROM orders WHERE customer_id = :id");
    $agg->execute([':id' => $id]);
    $stats = $agg->fetch() ?: ['total_orders' => 0, 'lifetime_spend' => 0, 'last_order_date' => null];

    $importJob = null;
    if (!empty($customer['import_job_id'])) {
        $j = $db->prepare("SELECT id, batch_id, filename, created_at FROM customer_import_jobs WHERE id = :id");
        $j->execute([':id' => $customer['import_job_id']]);
        $importJob = $j->fetch() ?: null;
    }

    successResponse([
        'customer'   => $customer,
        'stats'      => [
            'total_orders'    => (int)$stats['total_orders'],
            'lifetime_spend'  => (float)$stats['lifetime_spend'],
            'last_order_date' => $stats['last_order_date'],
        ],
        'import_job' => $importJob,
    ]);
}

function registerCustomer($db) {
    $data = getJsonInput();
    if (empty($data['email']) || empty($data['name'])) errorResponse('Name and email are required', 400);
    // Check duplicate
    $check = $db->prepare("SELECT id FROM customers WHERE email = :email");
    $check->execute([':email' => $data['email']]);
    if ($check->fetch()) errorResponse('An account with this email already exists', 409);
    $stmt = $db->prepare("INSERT INTO customers (name, email, phone, created_at) VALUES (:name, :email, :phone, NOW())");
    $stmt->execute([
        ':name'  => $data['name'],
        ':email' => $data['email'],
        ':phone' => $data['phone'] ?? ''
    ]);
    successResponse(['id' => $db->lastInsertId()], 'Account created successfully');
}

/**
 * Admin: Reset a customer's password.
 * PUT /api/customers/{id}/password
 */
function adminResetCustomerPassword($db, $id) {
    $data = getJsonInput();
    $newPassword = $data['new_password'] ?? '';

    if (strlen($newPassword) < 8) {
        errorResponse('New password must be at least 8 characters.', 400);
    }

    // Verify customer exists
    $stmt = $db->prepare("SELECT id, email, name FROM customers WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $customer = $stmt->fetch();
    if (!$customer) {
        errorResponse('Customer not found.', 404);
    }

    // Update password
    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $db->prepare("UPDATE customers SET password = :pw, password_reset_required = 0 WHERE id = :id")
       ->execute([':pw' => $hash, ':id' => $id]);

    successResponse(null, 'Password reset successfully for ' . ($customer['name'] ?: $customer['email']));
}

