<?php
$pageTitle = 'Help Center';
include 'includes/header.php';
?>

<style>
.help-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
}

.help-header {
    text-align: center;
    margin-bottom: 40px;
}

.help-header h2 {
    font-size: 28px;
    color: var(--admin-text);
    margin-bottom: 12px;
}

.help-header p {
    font-size: 16px;
    color: var(--admin-text-muted);
}

.dev-card {
    background: #fff;
    border-radius: 12px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border: 1px solid var(--admin-border);
    margin-bottom: 40px;
}

.dev-card h3 {
    font-size: 22px;
    margin-bottom: 16px;
    color: var(--admin-primary);
}

.dev-card p {
    font-size: 15px;
    line-height: 1.6;
    color: var(--admin-text);
    margin-bottom: 24px;
}

.contact-info {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 20px;
}

.contact-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 30px;
    font-weight: 500;
    color: var(--admin-text);
    text-decoration: none;
    transition: all 0.2s;
}

.contact-pill:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    transform: translateY(-2px);
}

.contact-pill svg {
    color: var(--admin-primary);
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
}

.feature-box {
    background: #fff;
    padding: 24px;
    border-radius: 10px;
    border: 1px solid var(--admin-border);
    transition: box-shadow 0.2s;
}

.feature-box:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.feature-box h4 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    margin-bottom: 12px;
    color: var(--admin-text);
}

.feature-box h4 svg {
    color: var(--admin-primary);
}

.feature-box p {
    font-size: 14px;
    color: var(--admin-text-muted);
    line-height: 1.5;
}

.help-footer {
    text-align: center;
    padding: 30px;
    background: #eff6ff;
    border-radius: 12px;
    color: #1e3a8a;
}

.help-footer h4 {
    font-size: 18px;
    margin-bottom: 10px;
}

.help-footer p {
    font-size: 15px;
}
</style>

<div class="help-container">
    
    <div class="help-header">
        <h2>Welcome to Your Admin Help Center</h2>
        <p>Everything you need to manage your store effectively.</p>
    </div>

    <div class="dev-card">
        <h3>Designed & Developed by Webcrafts Technology</h3>
        <p>We are dedicated to providing you with the best e-commerce solutions. This admin panel has been tailored specifically for your store to ensure smooth operations, easy management, and robust performance. If you need any assistance, face any issues, or require new features, our team is always here to help.</p>
        
        <div class="contact-info">
            <a href="https://webcraftstech.in" target="_blank" class="contact-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                webcraftstech.in
            </a>
            <a href="mailto:info@webcraftstech.in" class="contact-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                info@webcraftstech.in
            </a>
        </div>
    </div>

    <h3 style="margin-bottom:20px; font-size:20px;">Admin Panel Features overview</h3>
    
    <div class="features-grid">
        <div class="feature-box">
            <h4><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg> Catalog Management</h4>
            <p>Manage your Products, Categories, and real-time Inventory easily. Add variations, track stock levels, and update product details.</p>
        </div>
        <div class="feature-box">
            <h4><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1"></rect><path d="M9 12h6"></path><path d="M9 16h4"></path></svg> Sales & Orders</h4>
            <p>View and manage all customer Orders. Update payment and order statuses directly from the list, print invoices, and manage Coupons.</p>
        </div>
        <div class="feature-box">
            <h4><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 9h18"></path></svg> Content & Banners</h4>
            <p>Control your website's visual content. Manage Banner Sliders, Promo Banners, Hero Products, Featured items, and publish Blog posts.</p>
        </div>
        <div class="feature-box">
            <h4><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Settings & Configuration</h4>
            <p>Customize Site Settings, Payment methods, Email configurations, SEO meta tags, and Delivery zones to fine-tune your store operations.</p>
        </div>
        <div class="feature-box">
            <h4><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> Tools & Backup</h4>
            <p>Use powerful tools for Bulk Import, Stock Updates, Customer Imports, and secure your data with the Backup & Restore feature.</p>
        </div>
        <div class="feature-box">
            <h4><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> Media Management</h4>
            <p>Organize all your images through the Media Library. Use the Image to WebP converter to ensure your store remains fast and optimized.</p>
        </div>
    </div>

    <div class="help-footer">
        <h4>Need further assistance?</h4>
        <p>If you encounter any bugs, need a new feature, or simply require guidance, don't hesitate to reach out to us at <a href="mailto:info@webcraftstech.in" style="font-weight:600; color:#1d4ed8; text-decoration:none;">info@webcraftstech.in</a>.</p>
    </div>

</div>

<?php include 'includes/footer.php'; ?>
