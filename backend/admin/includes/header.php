<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'Admin' ?> - Ecommerce Admin</title>
    <link rel="stylesheet" href="assets/admin.css?v=3">
    <script src="assets/admin.js?v=3"></script>
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
                <button class="mobile-menu-toggle" onclick="toggleSidebar()">☰</button>
                <h1><?= $pageTitle ?? 'Dashboard' ?></h1>
            </div>
            <div class="header-actions">
                <div class="admin-avatar"></div>
            </div>
        </header>
        <div class="admin-content">
