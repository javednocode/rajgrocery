<?php $pageTitle = 'Featured Brands'; include 'includes/header.php'; ?>

<div class="toolbar">
    <div>
        <h3 style="font-size:16px;margin:0;">Featured Brands</h3>
        <p style="font-size:12px;color:var(--admin-text-muted);margin:4px 0 0;">Edit the brand cards shown on the homepage.</p>
    </div>
    <button class="btn btn-primary" onclick="saveBrands()">Save Brands</button>
</div>

<div class="card" style="max-width:900px;">
    <div class="card-header"><h3>Homepage Brand Section</h3></div>
    <div class="card-body">
        <div class="form-row">
            <div class="form-group">
                <label>Section Label</label>
                <input type="text" id="featured_brands_label" class="form-control" placeholder="Featured Brands">
            </div>
            <div class="form-group">
                <label>Section Title</label>
                <input type="text" id="featured_brands_title" class="form-control" placeholder="Trusted Grocery Brands">
            </div>
        </div>
        <div class="form-group">
            <label>Link Text</label>
            <input type="text" id="featured_brands_link_text" class="form-control" placeholder="Shop Brands">
        </div>
        <div class="form-group">
            <label>Brand Names</label>
            <textarea id="featured_brands_list" class="form-control" rows="10" placeholder="Aashirvaad&#10;Everest&#10;MDH"></textarea>
            <small style="color:var(--admin-text-muted);">Add one brand per line. Comma separated names also work.</small>
        </div>
        <div id="brandPreview" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:16px;"></div>
    </div>
</div>

<script>
const brandFields = ['featured_brands_label','featured_brands_title','featured_brands_link_text','featured_brands_list'];

function brandNames() {
    return (document.getElementById('featured_brands_list').value || '')
        .split(/[\n,]+/)
        .map(v => v.trim())
        .filter(Boolean);
}

function renderPreview() {
    const brands = brandNames();
    document.getElementById('brandPreview').innerHTML = brands.length
        ? brands.map(b => `<div style="padding:18px;border:1px solid var(--admin-border);border-radius:10px;text-align:center;font-weight:700;background:var(--admin-surface-2);">${b}</div>`).join('')
        : '<div style="color:var(--admin-text-muted);font-size:13px;">No brands yet.</div>';
}

async function loadBrands() {
    try {
        const res = await api('/settings');
        const s = res.data || {};
        brandFields.forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = s[key] || '';
        });
        renderPreview();
    } catch(e) {
        showAlert('Could not load brand settings', 'danger');
    }
}

async function saveBrands() {
    const fd = new FormData();
    brandFields.forEach(key => fd.append(key, document.getElementById(key).value || ''));
    try {
        await api('/settings', 'POST', fd, true);
        showAlert('Featured brands saved');
        renderPreview();
    } catch(e) {
        showAlert('Error: ' + e.message, 'danger');
    }
}

document.getElementById('featured_brands_list').addEventListener('input', renderPreview);
loadBrands();
</script>

<?php include 'includes/footer.php'; ?>
