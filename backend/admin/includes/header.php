<?php
/**
 * Admin header include
 * Auth guard: validates admin session/token. Redirects to login.php if not authenticated.
 */

// ── Auth Guard ──────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) session_start();

$_adminAuthenticated = false;

// Check PHP session (set on admin login)
if (!empty($_SESSION['admin_id']) && !empty($_SESSION['admin_role'])) {
    $_adminAuthenticated = true;
}

// Check cookie token (SPA-style — admin.js sets admin_token cookie)
if (!$_adminAuthenticated && !empty($_COOKIE['admin_token'])) {
    $token = $_COOKIE['admin_token'];
    // Decode JWT payload (middle segment) to check expiry without full verification
    $parts = explode('.', $token);
    if (count($parts) === 3) {
        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
        if ($payload && (!isset($payload['exp']) || $payload['exp'] > time())) {
            $_adminAuthenticated = true;
            // Populate session from token for PHP-side checks
            $_SESSION['admin_id']   = $payload['id']   ?? 0;
            $_SESSION['admin_role'] = $payload['role'] ?? 'unknown';
        }
    }
}

// Current page (login page doesn't need auth)
$_currentPage = basename($_SERVER['PHP_SELF']);
if (!$_adminAuthenticated && $_currentPage !== 'index.php') {
    header('Location: index.php?expired=1');
    exit;
}

// ── Load branding from settings (white-label) ─────────────────────────────
$_sidebarName = 'Store'; // Default — overridden by JS from /api/settings
?>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'Admin' ?> — <?= htmlspecialchars($_sidebarName ?? 'Store') ?> Admin</title>
    <link rel="stylesheet" href="assets/admin.css?v=6">
    <script src="assets/admin.js?v=6"></script>
    <?php if (($pageTitle ?? '') === 'Dashboard'): ?>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <?php endif; ?>
    <?php if (in_array(($pageTitle ?? ''), ['Add Product', 'Edit Product', 'Add Blog', 'Edit Blog', 'Settings'], true)): ?>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css">
        <script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"></script>
    <?php endif; ?>

</head>
<body>
<div class="admin-layout">
    <?php include 'includes/sidebar.php'; ?>
    <div class="admin-main">
        <header class="admin-header">
            <div style="display:flex;align-items:center;gap:16px;">
                <button class="mobile-menu-toggle" onclick="toggleSidebar()" aria-label="Open menu"><span></span></button>
                <h1><?= $pageTitle ?? 'Dashboard' ?></h1>
            </div>
            <div class="header-actions">
                <div class="admin-avatar">A</div>
            </div>
        </header>
        <div class="admin-content">
