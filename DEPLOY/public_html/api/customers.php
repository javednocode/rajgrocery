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
