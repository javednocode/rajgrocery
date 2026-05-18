<?php $pageTitle = 'Hero Products'; include 'includes/header.php'; ?>

<div class="toolbar">
    <div>
        <h3 style="font-size:16px;margin:0;">🌟 Homepage Hero Products</h3>
        <p style="font-size:12px;color:var(--admin-text-muted);margin:4px 0 0;">Select products from your catalog to feature on the homepage</p>
    </div>
    <button class="btn btn-primary" onclick="showHeroModal()">+ Add Hero Product</button>
</div>

<div class="card"><div class="card-body" style="padding:0;">
    <table class="data-table">
        <thead><tr><th>Image</th><th>Product Name</th><th>Price</th><th>Badge</th><th>From Catalog</th><th>Featured</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="heroList"></tbody>
    </table>
</div></div>

<!-- Modal -->
<div class="modal-overlay" id="heroModal">
    <div class="modal" style="max-width:560px;">
        <div class="modal-header">
            <h3 id="heroModalTitle">Add Hero Product</h3>
            <button class="btn btn-icon" onclick="closeHeroModal()">✕</button>
        </div>
        <div class="modal-body">
            <input type="hidden" id="heroId">
            <input type="hidden" id="heroProductId">

            <!-- Product selector -->
            <div class="form-group">
                <label>Select from Catalog <span style="color:var(--admin-text-muted);font-weight:400;">(recommended)</span></label>
                <div style="position:relative;">
                    <input type="text" id="productSearch" class="form-control" placeholder="Search products by name..." autocomplete="off"
                           oninput="searchProducts(this.value)">
                    <div id="productDropdown" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:8px;max-height:220px;overflow-y:auto;z-index:100;box-shadow:0 8px 30px rgba(0,0,0,0.3);margin-top:4px;"></div>
                </div>
                <div id="selectedProductBadge" style="display:none;margin-top:8px;padding:8px 12px;background:rgba(99,102,241,0.1);border:1px solid var(--admin-primary);border-radius:8px;font-size:13px;display:flex;align-items:center;justify-content:space-between;">
                    <span id="selectedProductName" style="font-weight:600;"></span>
                    <button onclick="clearProduct()" style="background:none;border:none;cursor:pointer;color:var(--admin-text-muted);font-size:16px;">✕</button>
                </div>
            </div>

            <div style="display:flex;align-items:center;gap:12px;margin:4px 0 16px;">
                <div style="flex:1;height:1px;background:var(--admin-border);"></div>
                <span style="font-size:12px;color:var(--admin-text-muted);">or enter manually</span>
                <div style="flex:1;height:1px;background:var(--admin-border);"></div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Product Name *</label>
                    <input type="text" id="heroName" class="form-control" placeholder="Auto-filled from catalog">
                </div>
                <div class="form-group">
                    <label>Price (€) *</label>
                    <input type="number" id="heroPrice" class="form-control" step="0.01" placeholder="0.00">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Badge <span style="color:var(--admin-text-muted);font-weight:400;">(e.g. Best Seller)</span></label>
                    <input type="text" id="heroBadge" class="form-control" placeholder="Optional">
                </div>
                <div class="form-group">
                    <label>Link URL <span style="color:var(--admin-text-muted);font-weight:400;">(auto-filled)</span></label>
                    <input type="text" id="heroLink" class="form-control" placeholder="/product/slug">
                </div>
            </div>

            <div class="form-group">
                <label>Custom Image <span style="color:var(--admin-text-muted);font-weight:400;">(leave blank to use product image)</span></label>
                <input type="file" id="heroImage" class="form-control" accept="image/*">
                <div id="heroImgPreview" style="margin-top:8px;display:none;">
                    <img id="heroImgThumb" style="height:60px;border-radius:6px;object-fit:cover;">
                </div>
            </div>

            <div class="form-row" style="margin-top:4px;">
                <div class="form-group">
                    <label>Sort Order</label>
                    <input type="number" id="heroSort" class="form-control" value="0">
                </div>
                <div class="form-group" style="display:flex;align-items:flex-end;gap:16px;padding-bottom:4px;">
                    <label class="form-check" style="margin:0;"><input type="checkbox" id="heroFeatured"> Wide Card</label>
                    <label class="form-check" style="margin:0;"><input type="checkbox" id="heroActive" checked> Active</label>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeHeroModal()">Cancel</button>
            <button class="btn btn-primary" onclick="saveHeroProduct()">Save Product</button>
        </div>
    </div>
</div>

<script>
let allProducts = []; // cache for search

async function loadHeroProducts() {
    try {
        const res = await api('/hero-products?all=1');
        document.getElementById('heroList').innerHTML = res.data.length ? res.data.map(p => `
            <tr style="opacity:${p.is_active==1?'1':'0.55'}">
                <td><img src="../${p.image}" onerror="this.src='assets/placeholder.jpg'" style="width:52px;height:52px;border-radius:8px;object-fit:cover;"></td>
                <td>
                    <strong>${p.product_name}</strong>
                    ${p.product_id ? '<br><span style="font-size:11px;color:var(--admin-primary)">📦 From catalog</span>' : ''}
                </td>
                <td>€${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.badge ? `<span class="badge badge-primary">${p.badge}</span>` : '—'}</td>
                <td>${p.product_id ? `<span class="badge badge-success">Yes #${p.product_id}</span>` : '—'}</td>
                <td>${p.is_featured==1 ? '<span class="badge badge-success">Wide</span>' : 'Normal'}</td>
                <td>${p.is_active==1 ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editHeroProduct(${p.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('hero-products',${p.id},'${p.product_name.replace(/'/g,"\\'")}')">Delete</button>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No hero products yet. Add some above!</td></tr>';
    } catch(e) {}
}

// ── Product search ───────────────────────────────────────────────────────────
async function loadAllProducts() {
    if (allProducts.length) return;
    try {
        const res = await api('/products?per_page=200');
        allProducts = res.data || [];
    } catch(e) {}
}

function searchProducts(q) {
    const dd = document.getElementById('productDropdown');
    if (!q.trim()) { dd.style.display = 'none'; return; }
    const matches = allProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 10);
    if (!matches.length) { dd.style.display = 'none'; return; }
    dd.innerHTML = matches.map(p => `
        <div onclick="selectProduct(${p.id}, '${p.name.replace(/'/g,"\\'")}', ${p.sale_price || p.price}, '${p.slug}')"
             style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--admin-border);transition:background 0.15s;"
             onmouseover="this.style.background='var(--admin-hover)'" onmouseout="this.style.background=''">
            <div style="font-weight:600;font-size:13px;">${p.name}</div>
            <div style="font-size:12px;color:var(--admin-text-muted);">€${parseFloat(p.sale_price || p.price).toFixed(2)} • SKU: ${p.sku || 'N/A'}</div>
        </div>
    `).join('');
    dd.style.display = 'block';
}

function selectProduct(id, name, price, slug) {
    document.getElementById('heroProductId').value = id;
    document.getElementById('heroName').value = name;
    document.getElementById('heroPrice').value = parseFloat(price).toFixed(2);
    document.getElementById('heroLink').value = '/product/' + slug;
    document.getElementById('productSearch').value = '';
    document.getElementById('productDropdown').style.display = 'none';
    // Show badge
    const badge = document.getElementById('selectedProductBadge');
    document.getElementById('selectedProductName').textContent = '📦 ' + name + ' selected from catalog';
    badge.style.display = 'flex';
}

function clearProduct() {
    document.getElementById('heroProductId').value = '';
    document.getElementById('selectedProductBadge').style.display = 'none';
}

// ── Modal ────────────────────────────────────────────────────────────────────
function showHeroModal() {
    document.getElementById('heroId').value = '';
    document.getElementById('heroProductId').value = '';
    document.getElementById('productSearch').value = '';
    document.getElementById('heroName').value = '';
    document.getElementById('heroPrice').value = '';
    document.getElementById('heroBadge').value = '';
    document.getElementById('heroLink').value = '';
    document.getElementById('heroSort').value = '0';
    document.getElementById('heroFeatured').checked = false;
    document.getElementById('heroActive').checked = true;
    document.getElementById('heroImage').value = '';
    document.getElementById('heroImgPreview').style.display = 'none';
    document.getElementById('selectedProductBadge').style.display = 'none';
    document.getElementById('productDropdown').style.display = 'none';
    document.getElementById('heroModalTitle').textContent = 'Add Hero Product';
    document.getElementById('heroModal').classList.add('show');
    loadAllProducts();
}

function closeHeroModal() {
    document.getElementById('heroModal').classList.remove('show');
}

async function editHeroProduct(id) {
    try {
        const res = await api('/hero-products?all=1');
        const p = res.data.find(x => x.id == id);
        if (!p) return;
        document.getElementById('heroId').value = p.id;
        document.getElementById('heroProductId').value = p.product_id || '';
        document.getElementById('heroName').value = p.product_name;
        document.getElementById('heroPrice').value = parseFloat(p.price).toFixed(2);
        document.getElementById('heroBadge').value = p.badge || '';
        document.getElementById('heroLink').value = p.link || '';
        document.getElementById('heroSort').value = p.sort_order;
        document.getElementById('heroFeatured').checked = p.is_featured == 1;
        document.getElementById('heroActive').checked = p.is_active == 1;
        document.getElementById('heroImage').value = '';
        document.getElementById('heroModalTitle').textContent = 'Edit Hero Product';
        if (p.product_id) {
            document.getElementById('selectedProductName').textContent = '📦 ' + p.product_name + ' (from catalog)';
            document.getElementById('selectedProductBadge').style.display = 'flex';
        } else {
            document.getElementById('selectedProductBadge').style.display = 'none';
        }
        if (p.image) {
            document.getElementById('heroImgThumb').src = '../' + p.image;
            document.getElementById('heroImgPreview').style.display = 'block';
        }
        document.getElementById('productDropdown').style.display = 'none';
        document.getElementById('heroModal').classList.add('show');
        loadAllProducts();
    } catch(e) { showAlert('Error loading product', 'danger'); }
}

// Image preview
document.getElementById('heroImage').addEventListener('change', function() {
    if (this.files[0]) {
        document.getElementById('heroImgThumb').src = URL.createObjectURL(this.files[0]);
        document.getElementById('heroImgPreview').style.display = 'block';
    }
});

// Close dropdown on outside click
document.addEventListener('click', e => {
    if (!e.target.closest('#productSearch') && !e.target.closest('#productDropdown')) {
        document.getElementById('productDropdown').style.display = 'none';
    }
});

async function saveHeroProduct() {
    const id = document.getElementById('heroId').value;
    const name = document.getElementById('heroName').value.trim();
    const price = document.getElementById('heroPrice').value;

    if (!name) { showAlert('Product name is required', 'danger'); return; }
    if (!price) { showAlert('Price is required', 'danger'); return; }
    if (!id && !document.getElementById('heroImage').files[0] && !document.getElementById('heroProductId').value) {
        showAlert('Please select a product from catalog (which has an image) or upload a custom image', 'danger'); return;
    }

    const fd = new FormData();
    if (id) fd.set('_method', 'PUT');
    fd.set('product_id', document.getElementById('heroProductId').value);
    fd.set('product_name', name);
    fd.set('price', price);
    fd.set('badge', document.getElementById('heroBadge').value);
    fd.set('link', document.getElementById('heroLink').value);
    fd.set('sort_order', document.getElementById('heroSort').value);
    fd.set('is_featured', document.getElementById('heroFeatured').checked ? '1' : '0');
    fd.set('is_active', document.getElementById('heroActive').checked ? '1' : '0');
    if (document.getElementById('heroImage').files[0]) fd.set('image', document.getElementById('heroImage').files[0]);

    try {
        await api(`/hero-products${id ? '/' + id : ''}`, 'POST', fd, true);
        showAlert(id ? 'Hero product updated!' : 'Hero product added!');
        closeHeroModal();
        loadHeroProducts();
    } catch(e) { showAlert('Error: ' + e.message, 'danger'); }
}

loadHeroProducts();
</script>

<?php include 'includes/footer.php'; ?>
