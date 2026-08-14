<?php
/**
 * Customer Addresses API — self-service saved-address CRUD, scoped
 * strictly to the authenticated customer (customer id always comes from
 * the JWT payload, never from the client).
 */

function getMyAddresses($db, $customerId) {
    $stmt = $db->prepare("SELECT * FROM addresses WHERE customer_id = :id ORDER BY is_default DESC, created_at DESC");
    $stmt->execute([':id' => $customerId]);
    successResponse($stmt->fetchAll());
}

function createMyAddress($db, $customerId) {
    $data     = getJsonInput();
    $fullName = trim($data['full_name'] ?? '');
    $phone    = trim($data['phone'] ?? '');
    $line1    = trim($data['address_line1'] ?? '');
    $city     = trim($data['city'] ?? '');
    $state    = trim($data['state'] ?? '');
    $pincode  = trim($data['pincode'] ?? '');

    if (!$fullName || !$phone || !$line1 || !$city || !$state || !$pincode) {
        errorResponse('Full name, phone, address, city, state and pincode are required', 400);
    }

    $countStmt = $db->prepare("SELECT COUNT(*) FROM addresses WHERE customer_id = :id");
    $countStmt->execute([':id' => $customerId]);
    $isFirst = ((int)$countStmt->fetchColumn()) === 0;
    $makeDefault = $isFirst || !empty($data['is_default']);

    if ($makeDefault) {
        $db->prepare("UPDATE addresses SET is_default = 0 WHERE customer_id = :id")->execute([':id' => $customerId]);
    }

    $stmt = $db->prepare("INSERT INTO addresses (customer_id, label, full_name, phone, address_line1, address_line2, city, state, pincode, is_default) VALUES (:cid, :label, :fn, :phone, :l1, :l2, :city, :state, :pin, :def)");
    $stmt->execute([
        ':cid'   => $customerId,
        ':label' => trim($data['label'] ?? '') ?: 'Home',
        ':fn'    => $fullName,
        ':phone' => $phone,
        ':l1'    => $line1,
        ':l2'    => trim($data['address_line2'] ?? '') ?: null,
        ':city'  => $city,
        ':state' => $state,
        ':pin'   => $pincode,
        ':def'   => $makeDefault ? 1 : 0
    ]);

    $sel = $db->prepare("SELECT * FROM addresses WHERE id = :id");
    $sel->execute([':id' => $db->lastInsertId()]);
    successResponse($sel->fetch(), 'Address saved', 201);
}

function updateMyAddress($db, $customerId, $addressId) {
    $own = $db->prepare("SELECT id FROM addresses WHERE id = :aid AND customer_id = :cid");
    $own->execute([':aid' => $addressId, ':cid' => $customerId]);
    if (!$own->fetch()) errorResponse('Address not found', 404);

    $data   = getJsonInput();
    $fields = [];
    $params = [':aid' => $addressId, ':cid' => $customerId];

    $requiredCols = ['full_name', 'phone', 'address_line1', 'city', 'state', 'pincode'];
    $optionalCols = ['label', 'address_line2'];

    foreach (array_merge($requiredCols, $optionalCols) as $col) {
        if (!array_key_exists($col, $data)) continue;
        $val = trim((string)$data[$col]);
        if (in_array($col, $requiredCols, true) && $val === '') {
            errorResponse(ucfirst(str_replace('_', ' ', $col)) . ' cannot be empty', 400);
        }
        if ($col === 'label' && $val === '') $val = 'Home';
        $fields[] = "$col = :$col";
        $params[":$col"] = ($val !== '') ? $val : null;
    }

    if (!empty($fields)) {
        $db->prepare("UPDATE addresses SET " . implode(', ', $fields) . " WHERE id = :aid AND customer_id = :cid")->execute($params);
    }

    // Handled separately from the field loop above: setting a NEW default
    // must atomically clear every other address's default flag for this
    // customer, which a plain per-row UPDATE can't do in one statement.
    if (array_key_exists('is_default', $data)) {
        if (!empty($data['is_default'])) {
            $db->prepare("UPDATE addresses SET is_default = (id = :aid) WHERE customer_id = :cid")
               ->execute([':aid' => $addressId, ':cid' => $customerId]);
        } else {
            $db->prepare("UPDATE addresses SET is_default = 0 WHERE id = :aid AND customer_id = :cid")
               ->execute([':aid' => $addressId, ':cid' => $customerId]);
        }
    }

    $sel = $db->prepare("SELECT * FROM addresses WHERE id = :id");
    $sel->execute([':id' => $addressId]);
    successResponse($sel->fetch(), 'Address updated');
}

function deleteMyAddress($db, $customerId, $addressId) {
    $stmt = $db->prepare("DELETE FROM addresses WHERE id = :aid AND customer_id = :cid");
    $stmt->execute([':aid' => $addressId, ':cid' => $customerId]);
    if ($stmt->rowCount() === 0) errorResponse('Address not found', 404);
    successResponse(['id' => (int)$addressId], 'Address deleted');
}
