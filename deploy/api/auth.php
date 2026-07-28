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
