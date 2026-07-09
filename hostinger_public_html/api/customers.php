<?php
/**
 * Customers API
 */
function getCustomers($db) {
    [$page, $perPage, $offset] = getPaginationParams();
    $where = "WHERE 1=1";
    $params = [];
    if (!empty($_GET['q'])) { $where .= " AND (c.name LIKE :q1 OR c.email LIKE :q2 OR c.phone LIKE :q3)"; $s='%'.$_GET['q'].'%'; $params[':q1']=$s; $params[':q2']=$s; $params[':q3']=$s; }
    $countStmt = $db->prepare("SELECT COUNT(*) FROM customers c $where"); $countStmt->execute($params); $total=$countStmt->fetchColumn();
    $sql = "SELECT c.* FROM customers c $where ORDER BY c.created_at DESC LIMIT :lim OFFSET :off";
    $stmt = $db->prepare($sql);
    foreach ($params as $k=>$v) $stmt->bindValue($k,$v);
    $stmt->bindValue(':lim',$perPage,PDO::PARAM_INT);
    $stmt->bindValue(':off',$offset,PDO::PARAM_INT);
    $stmt->execute();
    paginatedResponse($stmt->fetchAll(), $total, $page, $perPage);
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
