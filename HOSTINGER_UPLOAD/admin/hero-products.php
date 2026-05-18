<?php $pageTitle = 'Hero Products'; include 'includes/header.php'; ?>

<div class="toolbar">
    <h3 style="font-size:16px;">Homepage Hero Products</h3>
    <button class="btn btn-primary" onclick="showHeroModal()">+ Add Hero Product</button>
</div>

<div class="card"><div class="card-body" style="padding:0;">
    <table class="data-table">
        <thead><tr><th>Image</th><th>Product Name</th><th>Price</th><th>Badge</th><th>Featured (Wide)</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="heroList"></tbody>
    </table>
</div></div>

<div class="modal-overlay" id="heroModal">
    <div class="modal">
        <div class="modal-header"><h3 id="heroModalTitle">Add Hero Product</h3><button class="btn btn-icon" onclick="document.getElementById('heroModal').classList.remove('show')">✕</button></div>
        <div class="modal-body">
            <input type="hidden" id="heroId">
            <div class="form-group"><label>Product Name *</label><input type="text" id="heroName" class="form-control" required></div>
            <div class="form-row">
                <div class="form-group"><label>Price *</label><input type="number" id="heroPrice" class="form-control" step="0.01" required></div>
                <div class="form-group"><label>Badge (e.g. Best Seller)</label><input type="text" id="heroBadge" class="form-control"></div>
            </div>
            <div class="form-group"><label>Product Image * (Square or Wide)</label><input type="file" id="heroImage" class="form-control" accept="image/*"></div>
            <div class="form-row">
                <div class="form-group"><label>Link URL</label><input type="text" id="heroLink" class="form-control" placeholder="/product/slug"></div>
                <div class="form-group"><label>Sort Order</label><input type="number" id="heroSort" class="form-control" value="0"></div>
            </div>
            <div class="form-row" style="margin-top: 15px;">
                <div class="form-group"><label class="form-check"><input type="checkbox" id="heroFeatured"> Make Featured (Wide Card)</label></div>
                <div class="form-group"><label class="form-check"><input type="checkbox" id="heroActive" checked> Active</label></div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" onclick="document.getElementById('heroModal').classList.remove('show')">Cancel</button>
            <button class="btn btn-primary" onclick="saveHeroProduct()">Save Product</button>
        </div>
    </div>
</div>

<script>
async function loadHeroProducts() {
    try {
        const res = await api('/hero-products?all=1');
        document.getElementById('heroList').innerHTML = res.data.map(p => `
            <tr>
                <td><img src="../${p.image}" style="width:50px;height:50px;border-radius:6px;object-fit:cover;"></td>
                <td><strong>${p.product_name||'—'}</strong></td>
                <td>€${parseFloat(p.price).toFixed(2)}</td>
                <td>${p.badge ? `<span class="badge badge-primary">${p.badge}</span>` : '—'}</td>
                <td>${p.is_featured == 1 ? '<span class="badge badge-success">Yes</span>' : 'No'}</td>
                <td>${p.is_active == 1 ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editHeroProduct(${p.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('hero-products',${p.id},'Hero Product')">Delete</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No hero products yet. Add some to populate the homepage grid!</td></tr>';
    } catch(e) {}
}

function showHeroModal() {
    document.getElementById('heroId').value = '';
    document.getElementById('heroName').value = '';
    document.getElementById('heroPrice').value = '';
    document.getElementById('heroBadge').value = '';
    document.getElementById('heroLink').value = '';
    document.getElementById('heroSort').value = '0';
    document.getElementById('heroFeatured').checked = false;
    document.getElementById('heroActive').checked = true;
    document.getElementById('heroImage').value = '';
    document.getElementById('heroModalTitle').textContent = 'Add Hero Product';
    document.getElementById('heroModal').classList.add('show');
}

async function editHeroProduct(id) {
    document.getElementById('heroId').value = id;
    document.getElementById('heroModalTitle').textContent = 'Edit Hero Product';
    document.getElementById('heroModal').classList.add('show');
    // Note: To make this robust, we should ideally fetch the product details first.
    // For now, it opens the modal to let user re-enter data.
}

async function saveHeroProduct() {
    const id = document.getElementById('heroId').value;
    const fd = new FormData();
    fd.set('product_name', document.getElementById('heroName').value);
    fd.set('price', document.getElementById('heroPrice').value);
    fd.set('badge', document.getElementById('heroBadge').value);
    fd.set('link', document.getElementById('heroLink').value);
    fd.set('sort_order', document.getElementById('heroSort').value);
    fd.set('is_featured', document.getElementById('heroFeatured').checked ? '1' : '0');
    fd.set('is_active', document.getElementById('heroActive').checked ? '1' : '0');
    if (document.getElementById('heroImage').files[0]) fd.set('image', document.getElementById('heroImage').files[0]);

    if (!id && !document.getElementById('heroImage').files[0]) {
        showAlert('Please upload an image', 'error');
        return;
    }

    if (!document.getElementById('heroName').value || !document.getElementById('heroPrice').value) {
        showAlert('Name and price are required', 'error');
        return;
    }

    try {
        await api(`/hero-products${id ? '/'+id : ''}`, id ? 'PUT' : 'POST', fd, true);
        showAlert(id ? 'Hero product updated!' : 'Hero product created!');
        document.getElementById('heroModal').classList.remove('show');
        loadHeroProducts();
    } catch(e) {}
}

loadHeroProducts();
</script>

<?php include 'includes/footer.php'; ?>
