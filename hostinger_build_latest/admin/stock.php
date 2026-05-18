<?php $pageTitle = 'Bulk Stock Update'; include 'includes/header.php'; ?>

<style>
.stock-hero {
    background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 14px; padding: 28px 28px 24px; margin-bottom: 24px;
    display: flex; align-items: center; gap: 20px;
}
.stock-hero .hero-icon { font-size: 48px; flex-shrink: 0; }
.stock-hero h2 { font-size: 18px; font-weight: 800; margin: 0 0 4px; }
.stock-hero p  { font-size: 13px; color: var(--admin-text-muted); margin: 0; }

.mode-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 24px; }
.mode-card {
    background: var(--admin-card); border: 2px solid var(--admin-border);
    border-radius: 12px; padding: 18px 16px; cursor: pointer; transition: all 0.2s;
    text-align: center;
}
.mode-card:hover { border-color: var(--admin-primary); background: rgba(99,102,241,0.06); }
.mode-card.active { border-color: var(--admin-primary); background: rgba(99,102,241,0.1); }
.mode-card .mc-icon { font-size: 28px; margin-bottom: 8px; }
.mode-card h4 { font-size: 14px; font-weight: 700; margin: 0 0 4px; }
.mode-card p  { font-size: 12px; color: var(--admin-text-muted); margin: 0; }

.qty-row { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.qty-input-wrap { flex: 1; min-width: 160px; }
.qty-presets { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.preset-btn { padding: 5px 14px; border: 1px solid var(--admin-border); border-radius: 99px; font-size: 12px; font-weight: 600; cursor: pointer; background: var(--admin-hover); transition: all 0.15s; }
.preset-btn:hover { border-color: var(--admin-primary); color: var(--admin-primary); }

.product-picker { max-height: 320px; overflow-y: auto; border: 1px solid var(--admin-border); border-radius: 10px; }
.product-picker-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--admin-border); font-size: 13px; }
.product-picker-item:last-child { border-bottom: none; }
.product-picker-item input[type=checkbox] { width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
.product-picker-item img { width: 36px; height: 36px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
.picker-search { width: 100%; margin-bottom: 8px; }

.result-box {
    background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.3);
    border-radius: 10px; padding: 16px; margin-top: 20px; display: none;
}
.result-box.error { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3); }

/* Confirm overlay */
.confirm-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999;
    display: flex; align-items: center; justify-content: center; display: none;
}
.confirm-box {
    background: var(--admin-card); border-radius: 16px; padding: 32px;
    max-width: 420px; width: 90%; text-align: center;
    border: 1px solid var(--admin-border);
    box-shadow: 0 24px 80px rgba(0,0,0,0.5);
}
.confirm-box h3 { font-size: 18px; margin: 0 0 10px; }
.confirm-box p  { font-size: 14px; color: var(--admin-text-muted); margin: 0 0 24px; line-height: 1.6; }
.confirm-buttons { display: flex; gap: 12px; justify-content: center; }
</style>

<!-- Hero -->
<div class="stock-hero">
    <div class="hero-icon">📦</div>
    <div>
        <h2>Bulk Stock Update</h2>
        <p>Set stock quantities for all products, by category, or for selected products only. After WooCommerce import, use this to instantly make all products "In Stock".</p>
    </div>
</div>

<!-- Quick action banner -->
<div class="card" style="border-color:rgba(251,191,36,0.4);background:rgba(251,191,36,0.05);margin-bottom:20px;">
    <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
            <strong style="font-size:14px;">⚡ Quick Action: Set ALL products to 999 stock</strong>
            <div style="font-size:12px;color:var(--admin-text-muted);margin-top:2px;">Most common after WooCommerce import — one click, all done</div>
        </div>
        <button class="btn btn-primary" onclick="quickSetAll(999)">Set All → 999 In Stock</button>
    </div>
</div>

<div class="card"><div class="card-body">
    <h4 style="margin:0 0 16px;font-size:15px;">⚙️ Custom Bulk Update</h4>

    <!-- Mode selector -->
    <div class="mode-grid">
        <div class="mode-card active" id="mode_all" onclick="setMode('all')">
            <div class="mc-icon">🌐</div>
            <h4>All Products</h4>
            <p>Update every product in the catalog</p>
        </div>
        <div class="mode-card" id="mode_category" onclick="setMode('category')">
            <div class="mc-icon">📁</div>
            <h4>By Category</h4>
            <p>Update only products in a specific category</p>
        </div>
        <div class="mode-card" id="mode_selected" onclick="setMode('selected')">
            <div class="mc-icon">☑️</div>
            <h4>Selected Products</h4>
            <p>Hand-pick specific products to update</p>
        </div>
    </div>

    <!-- Category picker (hidden unless mode=category) -->
    <div id="categoryPicker" style="display:none;margin-bottom:20px;">
        <label class="form-label">Select Category</label>
        <select id="categorySelect" class="form-control">
            <option value="">Loading categories...</option>
        </select>
        <div style="font-size:12px;color:var(--admin-text-muted);margin-top:6px;">⚡ Also updates all subcategories automatically</div>
    </div>

    <!-- Product picker (hidden unless mode=selected) -->
    <div id="productPicker" style="display:none;margin-bottom:20px;">
        <label class="form-label">Select Products</label>
        <input type="text" class="form-control picker-search" placeholder="Search products..." oninput="filterPicker(this.value)">
        <div class="product-picker" id="productList">
            <div style="padding:20px;text-align:center;color:var(--admin-text-muted);">Loading products...</div>
        </div>
        <div style="font-size:12px;color:var(--admin-text-muted);margin-top:6px;">
            <span id="selectedCount">0</span> products selected
            &nbsp;·&nbsp; <a href="#" onclick="selectAllProducts(true);return false;">Select All</a>
            &nbsp;·&nbsp; <a href="#" onclick="selectAllProducts(false);return false;">Clear</a>
        </div>
    </div>

    <!-- Quantity input -->
    <div class="qty-row">
        <div class="qty-input-wrap">
            <label class="form-label">New Stock Quantity</label>
            <input type="number" id="stockQty" class="form-control" value="999" min="0" style="font-size:22px;font-weight:800;max-width:180px;">
            <div class="qty-presets">
                <button class="preset-btn" onclick="setQty(0)">Out of Stock (0)</button>
                <button class="preset-btn" onclick="setQty(10)">10</button>
                <button class="preset-btn" onclick="setQty(50)">50</button>
                <button class="preset-btn" onclick="setQty(100)">100</button>
                <button class="preset-btn" onclick="setQty(999)">999</button>
            </div>
        </div>
        <div>
            <button class="btn btn-primary" style="padding:12px 28px;font-size:15px;" onclick="confirmUpdate()">
                🚀 Apply Bulk Update
            </button>
        </div>
    </div>

    <!-- Result -->
    <div id="resultBox" class="result-box">
        <strong id="resultMsg"></strong>
    </div>
</div></div>

<!-- Confirmation Dialog -->
<div class="confirm-overlay" id="confirmOverlay">
    <div class="confirm-box">
        <div style="font-size:40px;margin-bottom:12px;">⚠️</div>
        <h3>Confirm Bulk Update</h3>
        <p id="confirmText"></p>
        <div class="confirm-buttons">
            <button class="btn btn-outline" onclick="closeConfirm()">Cancel</button>
            <button class="btn btn-primary" id="confirmBtn" onclick="doUpdate()">Yes, Update</button>
        </div>
    </div>
</div>

<script>
let currentMode = 'all';
let allProducts  = [];
let allCategories = [];

function setMode(mode) {
    currentMode = mode;
    ['all','category','selected'].forEach(m => {
        document.getElementById('mode_' + m).classList.toggle('active', m === mode);
    });
    document.getElementById('categoryPicker').style.display = mode === 'category' ? 'block' : 'none';
    document.getElementById('productPicker').style.display  = mode === 'selected'  ? 'block' : 'none';
    if (mode === 'category' && !allCategories.length) loadCategories();
    if (mode === 'selected' && !allProducts.length)  loadProducts();
}

function setQty(n) { document.getElementById('stockQty').value = n; }

// ── Load data ────────────────────────────────────────────────────────────────
async function loadCategories() {
    try {
        const res = await api('/categories?admin=1');
        allCategories = flattenCats(res.data);
        document.getElementById('categorySelect').innerHTML =
            '<option value="">— Select Category —</option>' +
            allCategories.map(c => `<option value="${c.id}">${c.prefix}${c.name}</option>`).join('');
    } catch(e) {}
}

async function loadProducts() {
    try {
        const res = await api('/products?per_page=500&admin=1');
        allProducts = res.data || [];
        renderProductPicker(allProducts);
    } catch(e) {}
}

function renderProductPicker(products) {
    document.getElementById('productList').innerHTML = products.length ?
        products.map(p => `
            <div class="product-picker-item" data-id="${p.id}" data-name="${p.name.toLowerCase()}">
                <input type="checkbox" class="prod-chk" value="${p.id}" onchange="updateCount()">
                <div>
                    <div style="font-weight:600;">${p.name}</div>
                    <div style="font-size:11px;color:var(--admin-text-muted);">SKU: ${p.sku||'—'} · Stock: ${p.stock}</div>
                </div>
            </div>
        `).join('') :
        '<div style="padding:20px;text-align:center;color:var(--admin-text-muted);">No products found</div>';
    updateCount();
}

function filterPicker(q) {
    const term = q.toLowerCase();
    document.querySelectorAll('#productList .product-picker-item').forEach(el => {
        el.style.display = !term || el.dataset.name.includes(term) ? '' : 'none';
    });
}

function selectAllProducts(check) {
    document.querySelectorAll('.prod-chk').forEach(cb => cb.checked = check);
    updateCount();
}

function updateCount() {
    document.getElementById('selectedCount').textContent = document.querySelectorAll('.prod-chk:checked').length;
}

function flattenCats(cats, prefix='') {
    let r=[]; cats.forEach(c=>{r.push({...c,prefix}); if(c.children?.length) r.push(...flattenCats(c.children,prefix+'— '));});return r;
}

// ── Confirm & run ─────────────────────────────────────────────────────────────
function confirmUpdate() {
    const qty = parseInt(document.getElementById('stockQty').value);
    if (isNaN(qty) || qty < 0) { showAlert('Enter a valid stock quantity (0 or more)', 'danger'); return; }

    let modeLabel = '';
    if (currentMode === 'all') modeLabel = 'ALL products';
    else if (currentMode === 'category') {
        const sel = document.getElementById('categorySelect');
        const cat = sel.options[sel.selectedIndex]?.text;
        if (!document.getElementById('categorySelect').value) { showAlert('Please select a category', 'danger'); return; }
        modeLabel = `all products in "${cat}" (and subcategories)`;
    } else {
        const ids = [...document.querySelectorAll('.prod-chk:checked')].map(c=>c.value);
        if (!ids.length) { showAlert('Select at least one product', 'danger'); return; }
        modeLabel = `${ids.length} selected product(s)`;
    }

    document.getElementById('confirmText').innerHTML =
        `This will set stock to <strong>${qty}</strong> and mark <strong>In Stock</strong> for <strong>${modeLabel}</strong>.<br><br>This cannot be undone.`;
    document.getElementById('confirmOverlay').style.display = 'flex';
}

function closeConfirm() {
    document.getElementById('confirmOverlay').style.display = 'none';
}

async function doUpdate() {
    closeConfirm();
    const qty = parseInt(document.getElementById('stockQty').value);
    const body = { quantity: qty, mode: currentMode };

    if (currentMode === 'category') {
        body.category_id = parseInt(document.getElementById('categorySelect').value);
    } else if (currentMode === 'selected') {
        body.product_ids = [...document.querySelectorAll('.prod-chk:checked')].map(c => parseInt(c.value));
    }

    const btn = document.querySelector('.qty-row .btn-primary');
    btn.textContent = '⏳ Updating...';
    btn.disabled = true;

    try {
        const res = await api('/stock/update', 'POST', body);
        const box = document.getElementById('resultBox');
        box.className = 'result-box';
        box.style.display = 'block';
        document.getElementById('resultMsg').innerHTML =
            `✅ <strong>${res.data.affected} product(s)</strong> updated → stock set to <strong>${qty}</strong>, all marked <strong>In Stock</strong>`;
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Reload product list if in selected mode
        if (currentMode === 'selected') { allProducts = []; loadProducts(); }
    } catch(e) {
        const box = document.getElementById('resultBox');
        box.className = 'result-box error';
        box.style.display = 'block';
        document.getElementById('resultMsg').textContent = '❌ Error: ' + e.message;
    }

    btn.textContent = '🚀 Apply Bulk Update';
    btn.disabled = false;
}

// Quick action for the banner button
async function quickSetAll(qty) {
    document.getElementById('stockQty').value = qty;
    setMode('all');
    confirmUpdate();
}
</script>

<?php include 'includes/footer.php'; ?>
