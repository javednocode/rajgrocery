<?php $pageTitle = 'Featured Brands'; include 'includes/header.php'; ?>

<div class="toolbar">
    <div>
        <h3 style="font-size:16px;margin:0;">Featured Brands</h3>
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
        
        <hr style="margin:20px 0; border:none; border-top:1px solid var(--admin-border);">
        <h4 style="margin-bottom:15px;">Brands List</h4>
        
        <div id="brandsContainer" style="display:flex; flex-direction:column; gap:15px; margin-bottom:20px;">
            <!-- Brand rows injected here -->
        </div>
        
        <button class="btn btn-outline" onclick="addBrandRow()">+ Add Brand</button>
    </div>
</div>

<script>
let brands = [];

async function loadBrands() {
    try {
        const res = await api('/settings');
        const s = res.data || {};

        document.getElementById('featured_brands_label').value = s['featured_brands_label'] || '';
        document.getElementById('featured_brands_title').value = s['featured_brands_title'] || '';

        const raw = s['featured_brands_data'] || '';
        try { brands = raw ? JSON.parse(raw) : []; } catch(e) { brands = []; }

        renderBrands();
    } catch(e) {
        showAlert('Could not load brand settings', 'danger');
    }
}

function renderBrands() {
    const container = document.getElementById('brandsContainer');
    container.innerHTML = '';
    
    if (brands.length === 0) {
        container.innerHTML = '<p style="color:var(--admin-text-muted);">No brands added yet.</p>';
        return;
    }
    
    brands.forEach((brand, index) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; gap:15px; align-items:flex-end; background:var(--admin-surface-2); padding:15px; border-radius:8px;';
        
        row.innerHTML = `
            <div style="flex:1;">
                <label style="font-size:12px; margin-bottom:5px; display:block;">Brand Name</label>
                <input type="text" class="form-control brand-name" value="${brand.name || ''}" placeholder="e.g. Aashirvaad" onchange="updateBrand(${index}, 'name', this.value)">
            </div>
            <div style="flex:2;">
                <label style="font-size:12px; margin-bottom:5px; display:block;">Logo Image</label>
                <div style="display:flex; gap:10px; align-items:center;">
                    <div style="width:50px; height:50px; background:#fff; border:1px solid var(--admin-border); border-radius:6px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                        ${brand.image ? `<img src="${brand.image.startsWith('http') ? brand.image : '../' + brand.image}" style="max-width:100%; max-height:100%; object-fit:contain;">` : '<span style="color:#ccc; font-size:20px;">🖼️</span>'}
                    </div>
                    <input type="text" class="form-control brand-image" value="${brand.image || ''}" placeholder="/uploads/brands/logo.png" onchange="updateBrand(${index}, 'image', this.value)">
                    <button class="btn btn-outline" style="white-space:nowrap;" onclick="uploadLogo(${index})">Upload</button>
                </div>
            </div>
            <div>
                <button class="btn btn-outline" style="color:var(--admin-danger); border-color:transparent;" onclick="removeBrand(${index})">🗑️</button>
            </div>
        `;
        container.appendChild(row);
    });
}

function updateBrand(index, key, value) {
    brands[index][key] = value;
}

function addBrandRow() {
    brands.push({ name: '', image: '' });
    renderBrands();
}

function removeBrand(index) {
    if (confirm('Remove this brand?')) {
        brands.splice(index, 1);
        renderBrands();
    }
}

function uploadLogo(index) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async e => {
        const file = e.target.files[0];
        if (!file) return;
        
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'brands');
        
        try {
            const res = await api('/upload', 'POST', fd, true);
            if (res.success) {
                brands[index].image = res.data.path;
                renderBrands();
            } else {
                showAlert('Upload failed', 'danger');
            }
        } catch(err) {
            showAlert('Error uploading file', 'danger');
        }
    };
    input.click();
}

async function saveBrands() {
    const fd = new FormData();
    fd.append('featured_brands_label', document.getElementById('featured_brands_label').value);
    fd.append('featured_brands_title', document.getElementById('featured_brands_title').value);
    fd.append('featured_brands_data',  JSON.stringify(brands));

    try {
        await api('/settings', 'POST', fd, true);
        showAlert('Brands saved!', 'success');
        renderBrands();
    } catch(e) {
        showAlert('Error: ' + e.message, 'danger');
    }
}

// Show alert modal logic
function showAlert(msg, type='success') {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed; top:20px; right:20px; padding:15px 25px; border-radius:8px; color:#fff; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.15);`;
    el.style.background = type === 'success' ? 'var(--admin-primary)' : 'var(--admin-danger)';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

loadBrands();
</script>

<?php include 'includes/footer.php'; ?>
