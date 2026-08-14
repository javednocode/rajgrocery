<?php
/**
 * Customer Auth API — storefront self-service register/login/profile.
 * Separate from api/auth.php (admin-only) and from the admin-facing
 * customer management in api/customers.php.
 */

/**
 * Canonical safe customer projection — never selects `password`.
 * Every response in this file goes through this so there is exactly one
 * place that decides what a customer is allowed to see about themselves.
 */
function fetchCustomerPublic($db, $id) {
    $stmt = $db->prepare("SELECT id, name, first_name, last_name, email, phone, is_guest, total_orders, total_spent, created_at FROM customers WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch();
}

function customerRegister($db) {
    $data = getJsonInput();
    $email     = trim(strtolower($data['email'] ?? ''));
    $password  = $data['password'] ?? '';
    $firstName = trim($data['first_name'] ?? '');
    $lastName  = trim($data['last_name'] ?? '');
    $phone     = trim($data['phone'] ?? '');

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        errorResponse('A valid email is required', 400);
    }
    if (strlen($password) < 8) {
        errorResponse('Password must be at least 8 characters', 400);
    }
    if (!$firstName || !$lastName) {
        errorResponse('First and last name are required', 400);
    }
    if (!$phone) {
        errorResponse('Phone number is required', 400);
    }
    if (!checkRateLimit(getClientIp(), 'customer_register', 10, 60)) {
        errorResponse('Too many attempts. Please try again in a minute.', 429);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    try {
        // Ensure required columns exist (auto-repair for deployments that
        // ran schema.sql before the account-system migration added them)
        try {
            $db->exec("ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT NULL");
            $db->exec("ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT NULL");
            $db->exec("ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_guest TINYINT(1) DEFAULT 0");
            $db->exec("ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1");
            $db->exec("ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login_at DATETIME DEFAULT NULL");
            $db->exec("ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_reset_required TINYINT(1) DEFAULT 0");
        } catch (\Throwable $colErr) {
            // Columns may already exist — safe to ignore
            error_log('customer_register col check: ' . $colErr->getMessage());
        }

        $existing = $db->prepare("SELECT id, password, first_name, last_name, phone FROM customers WHERE email = :email");
        $existing->execute([':email' => $email]);
        $row = $existing->fetch();

        if ($row) {
            if (!empty($row['password'])) {
                errorResponse('An account with this email already exists. Please log in instead.', 409);
            }
            // Claim an existing passwordless record (e.g. a CSV/WooCommerce
            // import) rather than bouncing on the UNIQUE email index — keep
            // whichever of name/phone the form left blank.
            $id = $row['id'];
            $finalFirst = $firstName ?: $row['first_name'];
            $finalLast  = $lastName ?: $row['last_name'];
            $finalPhone = $phone ?: $row['phone'];
            $db->prepare("UPDATE customers SET password = :pw, first_name = :fn, last_name = :ln, name = :name, phone = :phone, is_guest = 0, password_reset_required = 0, last_login_at = NOW() WHERE id = :id")
               ->execute([
                   ':pw' => $hash, ':fn' => $finalFirst, ':ln' => $finalLast,
                   ':name' => trim("$finalFirst $finalLast"), ':phone' => $finalPhone, ':id' => $id
               ]);
        } else {
            $db->prepare("INSERT INTO customers (name, first_name, last_name, email, phone, password, is_guest, is_active, last_login_at) VALUES (:name, :fn, :ln, :email, :phone, :pw, 0, 1, NOW())")
               ->execute([
                   ':name' => trim("$firstName $lastName"), ':fn' => $firstName, ':ln' => $lastName,
                   ':email' => $email, ':phone' => $phone, ':pw' => $hash
               ]);
            $id = $db->lastInsertId();
        }

        $customer = fetchCustomerPublic($db, $id);
        $token = generateJWT(['id' => (int)$id, 'email' => $email, 'name' => $customer['name'], 'type' => 'customer']);

        successResponse(['token' => $token, 'customer' => $customer], 'Account created successfully', 201);

    } catch (\Throwable $e) {
        error_log('customerRegister error: ' . $e->getMessage() . ' | SQL: ' . $e->getTraceAsString());
        errorResponse('Could not create your account: ' . $e->getMessage(), 500);
    }
}

function customerLogin($db) {
    $data     = getJsonInput();
    $email    = trim(strtolower($data['email'] ?? ''));
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        errorResponse('Email and password are required', 400);
    }
    if (!checkRateLimit(getClientIp(), 'customer_login', 10, 60)) {
        errorResponse('Too many attempts. Please try again in a minute.', 429);
    }

    $stmt = $db->prepare("SELECT id, name, email, password FROM customers WHERE email = :email AND is_active = 1");
    $stmt->execute([':email' => $email]);
    $row = $stmt->fetch();

    if (!$row) {
        errorResponse('Invalid email or password', 401);
    }
    if (empty($row['password'])) {
        errorResponse('This account does not have a password set yet. Please register with this email to set one.', 403);
    }
    if (!password_verify($password, $row['password'])) {
        errorResponse('Invalid email or password', 401);
    }

    $db->prepare("UPDATE customers SET last_login_at = NOW() WHERE id = :id")->execute([':id' => $row['id']]);

    $customer = fetchCustomerPublic($db, $row['id']);
    $token = generateJWT(['id' => (int)$row['id'], 'email' => $row['email'], 'name' => $row['name'], 'type' => 'customer']);

    successResponse(['token' => $token, 'customer' => $customer], 'Login successful');
}

function getMyProfile($db, $customerId) {
    $customer = fetchCustomerPublic($db, $customerId);
    if (!$customer) errorResponse('Customer not found', 404);
    successResponse($customer);
}

function updateMyProfile($db, $customerId) {
    $data   = getJsonInput();
    $fields = [];
    $params = [':id' => $customerId];

    if (array_key_exists('first_name', $data) || array_key_exists('last_name', $data)) {
        $cur = $db->prepare("SELECT first_name, last_name FROM customers WHERE id = :id");
        $cur->execute([':id' => $customerId]);
        $curRow = $cur->fetch() ?: ['first_name' => '', 'last_name' => ''];
        $fn = array_key_exists('first_name', $data) ? trim($data['first_name']) : $curRow['first_name'];
        $ln = array_key_exists('last_name', $data) ? trim($data['last_name']) : $curRow['last_name'];
        if (!$fn || !$ln) errorResponse('First and last name cannot be empty', 400);
        $fields[] = "first_name = :fn"; $params[':fn'] = $fn;
        $fields[] = "last_name = :ln";  $params[':ln'] = $ln;
        $fields[] = "name = :name";     $params[':name'] = trim("$fn $ln");
    }

    if (array_key_exists('phone', $data)) {
        $phone = trim($data['phone']);
        if (!$phone) errorResponse('Phone number cannot be empty', 400);
        $fields[] = "phone = :phone"; $params[':phone'] = $phone;
    }

    if (array_key_exists('email', $data)) {
        $email = trim(strtolower($data['email']));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) errorResponse('A valid email is required', 400);
        $dupe = $db->prepare("SELECT id FROM customers WHERE email = :email AND id != :id");
        $dupe->execute([':email' => $email, ':id' => $customerId]);
        if ($dupe->fetch()) errorResponse('Email is already in use', 409);
        $fields[] = "email = :email"; $params[':email'] = $email;
    }

    if (!empty($data['new_password'])) {
        $cur = $db->prepare("SELECT password FROM customers WHERE id = :id");
        $cur->execute([':id' => $customerId]);
        $row = $cur->fetch();
        if (!$row || empty($data['current_password']) || !password_verify($data['current_password'], $row['password'])) {
            errorResponse('Current password is incorrect', 401);
        }
        if (strlen($data['new_password']) < 8) errorResponse('New password must be at least 8 characters', 400);
        $fields[] = "password = :pw"; $params[':pw'] = password_hash($data['new_password'], PASSWORD_DEFAULT);
    }

    if (empty($fields)) errorResponse('No fields to update', 400);

    $db->prepare("UPDATE customers SET " . implode(', ', $fields) . " WHERE id = :id")->execute($params);

    successResponse(fetchCustomerPublic($db, $customerId), 'Profile updated successfully');
}
