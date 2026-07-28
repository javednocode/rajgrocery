<?php
/**
 * Auth API - Admin Login
 */

function handleLogin($db) {
    try {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            errorResponse('Method not allowed', 405);
        }

        $data = getJsonInput();
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            errorResponse('Email and password are required', 400);
        }

        $stmt = $db->prepare("SELECT id, name, email, password, role, avatar FROM admins WHERE email = :email AND is_active = 1");
        $stmt->execute([':email' => $email]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password'])) {
            errorResponse('Invalid email or password', 401);
        }

        // Update last login
        $db->prepare("UPDATE admins SET last_login = NOW() WHERE id = :id")->execute([':id' => $admin['id']]);

        // Generate token
        $token = generateJWT([
            'id' => $admin['id'],
            'email' => $admin['email'],
            'role' => $admin['role'],
            'name' => $admin['name']
        ]);

        successResponse([
            'token' => $token,
            'admin' => [
                'id' => $admin['id'],
                'name' => $admin['name'],
                'email' => $admin['email'],
                'role' => $admin['role'],
                'avatar' => $admin['avatar']
            ]
        ], 'Login successful');
    } catch (Throwable $e) {
        error_log('Admin login failed: ' . $e->getMessage());
        errorResponse('Admin login database error. Import database/admin_login_repair.sql, then try again.', 500);
    }
}

function updateAdminProfile($db) {
    try {
        $payload = requireAuth();
        $adminId = $payload['id'];
        
        $data = getJsonInput();
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        
        if (empty($name) || empty($email)) {
            errorResponse('Name and email are required', 400);
        }
        
        // Check if email is taken by another admin
        $stmt = $db->prepare("SELECT id FROM admins WHERE email = :email AND id != :id");
        $stmt->execute([':email' => $email, ':id' => $adminId]);
        if ($stmt->fetch()) {
            errorResponse('Email is already in use', 409);
        }
        
        if (!empty($password)) {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $db->prepare("UPDATE admins SET name = :name, email = :email, password = :password WHERE id = :id");
            $stmt->execute([':name' => $name, ':email' => $email, ':password' => $hashed, ':id' => $adminId]);
        } else {
            $stmt = $db->prepare("UPDATE admins SET name = :name, email = :email WHERE id = :id");
            $stmt->execute([':name' => $name, ':email' => $email, ':id' => $adminId]);
        }
        
        // Return a fresh token so the frontend stays logged in
        $token = generateJWT([
            'id' => $adminId,
            'email' => $email,
            'role' => $payload['role'],
            'name' => $name
        ]);
        
        successResponse([
            'token' => $token,
            'admin' => [
                'id' => $adminId,
                'name' => $name,
                'email' => $email,
                'role' => $payload['role']
            ]
        ], 'Profile updated successfully');
        
    } catch (Throwable $e) {
        error_log('Admin profile update failed: ' . $e->getMessage());
        errorResponse('Failed to update profile', 500);
    }
}
