<?php
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<aside class="admin-sidebar" id="adminSidebar">
    <div class="sidebar-logo">
        <h2>Ecommerce Admin</h2>
    </div>
    <nav class="sidebar-nav">
        <div class="nav-section">Main</div>
        <a href="dashboard.php" class="<?= $currentPage === 'dashboard.php' ? 'active' : '' ?>">
            <span class="icon">DB</span> Dashboard
        </a>
        
        <div class="nav-section">Catalog</div>
        <a href="products.php" class="<?= $currentPage === 'products.php' || $currentPage === 'product-edit.php' ? 'active' : '' ?>">
            <span class="icon">PR</span> Products
        </a>
        <a href="categories.php" class="<?= $currentPage === 'categories.php' ? 'active' : '' ?>">
            <span class="icon">CT</span> Categories
        </a>
        
        <div class="nav-section">Sales</div>
        <a href="orders.php" class="<?= $currentPage === 'orders.php' ? 'active' : '' ?>">
            <span class="icon">OR</span> Orders
        </a>
        <a href="customers.php" class="<?= $currentPage === 'customers.php' ? 'active' : '' ?>">
            <span class="icon">CU</span> Customers
        </a>
        <a href="coupons.php" class="<?= $currentPage === 'coupons.php' ? 'active' : '' ?>">
            <span class="icon">CO</span> Coupons
        </a>
        
        <div class="nav-section">Content</div>
        <a href="blogs.php" class="<?= $currentPage === 'blogs.php' || $currentPage === 'blog-edit.php' ? 'active' : '' ?>">
            <span class="icon">BL</span> Blog Posts
        </a>
        <a href="banners.php" class="<?= $currentPage === 'banners.php' ? 'active' : '' ?>">
            <span class="icon">BN</span> Banner Slider
        </a>
        <a href="hero-products.php" class="<?= $currentPage === 'hero-products.php' ? 'active' : '' ?>">
            <span class="icon">HP</span> Hero Products
        </a>
        <a href="trending.php" class="<?= $currentPage === 'trending.php' ? 'active' : '' ?>">
            <span class="icon">TR</span> Trending Products
        </a>
        <a href="featured.php" class="<?= $currentPage === 'featured.php' ? 'active' : '' ?>">
            <span class="icon">FT</span> Featured Products
        </a>
        <a href="pages.php" class="<?= $currentPage === 'pages.php' ? 'active' : '' ?>">
            <span class="icon">PG</span> Static Pages
        </a>
        
        <div class="nav-section">Settings</div>
        <a href="delivery.php" class="<?= $currentPage === 'delivery.php' ? 'active' : '' ?>">
            <span class="icon">DV</span> Delivery Settings
        </a>
        <a href="import.php" class="<?= $currentPage === 'import.php' ? 'active' : '' ?>">
            <span class="icon">IM</span> Bulk Import
        </a>
        <a href="stock.php" class="<?= $currentPage === 'stock.php' ? 'active' : '' ?>">
            <span class="icon">ST</span> Bulk Stock Update
        </a>
        <a href="settings.php" class="<?= $currentPage === 'settings.php' ? 'active' : '' ?>">
            <span class="icon">SE</span> Site Settings
        </a>
        <a href="email-settings.php" class="<?= $currentPage === 'email-settings.php' ? 'active' : '' ?>">
            <span class="icon">EM</span> Email Settings
        </a>
        <a href="#" onclick="logout(); return false;">
            <span class="icon">LO</span> Logout
        </a>
    </nav>
</aside>
