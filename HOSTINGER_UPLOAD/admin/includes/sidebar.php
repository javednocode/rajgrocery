<?php
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<aside class="admin-sidebar" id="adminSidebar">
    <div class="sidebar-logo">
        <h2>Asian Food Cork</h2>
    </div>
    <nav class="sidebar-nav">
        <div class="nav-section">Main</div>
        <a href="dashboard.php" class="<?= $currentPage === 'dashboard.php' ? 'active' : '' ?>">
            <span class="icon">📊</span> Dashboard
        </a>
        
        <div class="nav-section">Catalog</div>
        <a href="products.php" class="<?= $currentPage === 'products.php' || $currentPage === 'product-edit.php' ? 'active' : '' ?>">
            <span class="icon">📦</span> Products
        </a>
        <a href="categories.php" class="<?= $currentPage === 'categories.php' ? 'active' : '' ?>">
            <span class="icon">📁</span> Categories
        </a>
        
        <div class="nav-section">Sales</div>
        <a href="orders.php" class="<?= $currentPage === 'orders.php' ? 'active' : '' ?>">
            <span class="icon">🛒</span> Orders
        </a>
        <a href="customers.php" class="<?= $currentPage === 'customers.php' ? 'active' : '' ?>">
            <span class="icon">👥</span> Customers
        </a>
        <a href="coupons.php" class="<?= $currentPage === 'coupons.php' ? 'active' : '' ?>">
            <span class="icon">🎟️</span> Coupons
        </a>
        
        <div class="nav-section">Content</div>
        <a href="blogs.php" class="<?= $currentPage === 'blogs.php' || $currentPage === 'blog-edit.php' ? 'active' : '' ?>">
            <span class="icon">📝</span> Blog Posts
        </a>
        <a href="banners.php" class="<?= $currentPage === 'banners.php' ? 'active' : '' ?>">
            <span class="icon">🖼️</span> Banners
        </a>
        <a href="hero-products.php" class="<?= $currentPage === 'hero-products.php' ? 'active' : '' ?>">
            <span class="icon">🌟</span> Hero Products
        </a>
        
        <div class="nav-section">Settings</div>
        <a href="settings.php" class="<?= $currentPage === 'settings.php' ? 'active' : '' ?>">
            <span class="icon">⚙️</span> Site Settings
        </a>
        <a href="#" onclick="logout(); return false;">
            <span class="icon">🚪</span> Logout
        </a>
    </nav>
</aside>
