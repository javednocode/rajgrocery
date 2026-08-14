<?php
$currentPage = basename($_SERVER['PHP_SELF']);

// Load site name & logo from DB for the sidebar header
$_sidebarName = 'Store Admin';
$_sidebarLogo = '';
try {
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../helpers/branding.php';
    $_sidebarDb   = (new Database())->getConnection();
    $_sidebarData = loadSiteSettings($_sidebarDb);
    $_sidebarName = !empty($_sidebarData['site_name']) ? $_sidebarData['site_name'] : 'Store Admin';
    $_sidebarLogo = !empty($_sidebarData['site_logo']) ? $_sidebarData['site_logo'] : '';
} catch (\Throwable $_e) {}

// Helper: check if current page matches a list of pages
function isActivePage(string ...$pages): string {
    global $currentPage;
    return in_array($currentPage, $pages, true) ? 'active' : '';
}
?>
<aside class="admin-sidebar" id="adminSidebar">
    <div class="sidebar-logo">
        <?php if ($_sidebarLogo): ?>
            <img src="../<?= htmlspecialchars(ltrim($_sidebarLogo, '/')) ?>"
                 alt="<?= htmlspecialchars($_sidebarName) ?>"
                 style="max-height:44px;max-width:160px;object-fit:contain;display:block;margin-bottom:4px;">
        <?php else: ?>
            <h2><?= htmlspecialchars($_sidebarName) ?></h2>
        <?php endif; ?>
        <span style="font-size:11px;opacity:.5;font-weight:500;letter-spacing:.06em;">ADMIN PANEL</span>
    </div>

    <nav class="sidebar-nav">
        <!-- ─── MAIN ─── -->
        <div class="nav-section">Main</div>
        <a href="dashboard.php" class="<?= isActivePage('dashboard.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
        </a>

        <!-- ─── CATALOG ─── -->
        <div class="nav-section">Catalog</div>
        <a href="products.php" class="<?= isActivePage('products.php','product-edit.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            Products
        </a>
        <a href="categories.php" class="<?= isActivePage('categories.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
            Categories
        </a>
        <a href="inventory.php" class="<?= isActivePage('inventory.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3h18v4H3z"/><path d="M3 11h18v4H3z"/><path d="M3 19h18v2H3z"/></svg>
            Inventory
        </a>

        <!-- ─── SALES ─── -->
        <div class="nav-section">Sales</div>
        <a href="orders.php" class="<?= isActivePage('orders.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
            Orders
        </a>
        <a href="customers.php" class="<?= isActivePage('customers.php', 'customer-detail.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-3.6 4.4-5 8-5s6.6 1.4 8 5"/></svg>
            Customers
        </a>
        <a href="coupons.php" class="<?= isActivePage('coupons.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1" fill="currentColor" stroke="none"/></svg>
            Coupons
        </a>
        <a href="reports.php" class="<?= isActivePage('reports.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Reports
        </a>

        <!-- ─── CONTENT ─── -->
        <div class="nav-section">Content</div>
        <a href="banners.php" class="<?= isActivePage('banners.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg>
            Banner Slider
        </a>
        <a href="promo-banners.php" class="<?= isActivePage('promo-banners.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h10M7 12h6"/></svg>
            Promo Banners
        </a>
        <a href="hero-products.php" class="<?= isActivePage('hero-products.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 3.9 2.4-7.4L2 9.4h7.6z"/></svg>
            Hero Products
        </a>
        <a href="featured.php" class="<?= isActivePage('featured.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 3h14a2 2 0 0 1 2 2v14l-9-4-9 4V5a2 2 0 0 1 2-2z"/></svg>
            Featured Products
        </a>
        <a href="new-arrivals.php" class="<?= isActivePage('new-arrivals.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v18M3 12h18"/></svg>
            New Arrivals
        </a>
        <a href="trending.php" class="<?= isActivePage('trending.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            Best Sellers
        </a>
        <a href="featured-brands.php" class="<?= isActivePage('featured-brands.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
            Featured Brands
        </a>
        <a href="blogs.php" class="<?= isActivePage('blogs.php','blog-edit.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Blog Posts
        </a>
        <a href="pages.php" class="<?= isActivePage('pages.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Static Pages
        </a>
        <a href="reviews.php" class="<?= isActivePage('reviews.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Reviews
        </a>

        <!-- ─── MEDIA ─── -->
        <div class="nav-section">Media</div>
        <a href="media-library.php" class="<?= isActivePage('media-library.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Media Library
        </a>
        <a href="convert-images.php" class="<?= isActivePage('convert-images.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Image → WebP
        </a>

        <!-- ─── TOOLS ─── -->
        <div class="nav-section">Tools</div>
        <a href="product-migration.php" class="<?= isActivePage('product-migration.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/><path d="M4 4h4M16 4h4"/></svg>
            Product Migration
        </a>
        <a href="customer-import.php" class="<?= isActivePage('customer-import.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
            Customer Import
        </a>

        <!-- ─── SETTINGS ─── -->
        <div class="nav-section">Settings</div>
        <a href="settings.php" class="<?= isActivePage('settings.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Site Settings
        </a>
        <a href="site-manager.php" class="<?= isActivePage('site-manager.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            Site Manager
        </a>
        <a href="payments-config.php" class="<?= isActivePage('payments-config.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Payments
        </a>
        <a href="seo-manager.php" class="<?= isActivePage('seo-manager.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 7v8M7 11h8"/></svg>
            SEO Manager
        </a>
        <a href="email-settings.php" class="<?= isActivePage('email-settings.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Email Settings
        </a>
        <a href="delivery.php" class="<?= isActivePage('delivery.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="1.5"/><circle cx="18.5" cy="18.5" r="1.5"/></svg>
            Delivery Settings
        </a>
        <a href="import.php" class="<?= isActivePage('import.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Bulk Import
        </a>
        <a href="stock.php" class="<?= isActivePage('stock.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Bulk Stock Update
        </a>
        <a href="bulk-out-of-stock.php" class="<?= isActivePage('bulk-out-of-stock.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Bulk Out of Stock by List
        </a>
        <a href="backup.php" class="<?= isActivePage('backup.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Backup &amp; Restore
        </a>
        <a href="help-center.php" class="<?= isActivePage('help-center.php') ?>">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Help Center
        </a>
        <a href="ai-logs.php" class="<?= isActivePage('ai-logs.php') ?>" style="background:linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.08));border-left:3px solid #6366f1;color:#6366f1;font-weight:600;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            AI Intelligence System
        </a>

        <!-- ─── ACCOUNT ─── -->
        <div class="nav-section">Account</div>
        <a href="#" onclick="logout(); return false;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
        </a>
    </nav>
</aside>
