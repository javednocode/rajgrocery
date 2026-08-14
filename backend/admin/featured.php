<?php $pageTitle = 'Featured Products'; include 'includes/header.php'; ?>

<style>
.trending-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
}
@media (max-width: 900px) { .trending-layout { grid-template-columns: 1fr; } }

.panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 18px; border-bottom: 1px solid var(--admin-border);
    background: var(--admin-surface);
    border-radius: 12px 12px 0 0;
}
.panel-header h3 { margin: 0; font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.panel-count {
    font-size: 11px; font-weight: 700; padding: 3px 10px;
    border-radius: 99px; background: var(--admin-primary); color: #fff;
}
.panel-count-dim { background: var(--admin-surface-2); color: var(--admin-text-muted); }
.panel-body { max-height: 600px; overflow-y: auto; }

.prod-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px; border-bottom: 1px solid var(--admin-border);
    transition: background 0.15s;
}
.prod-row:last-child { border-bottom: none; }
.prod-row:hover { background: var(--admin-hover); }
.prod-row img {
    width: 44px; height: 44px; border-radius: 8px;
    object-fit: cover; background: var(--admin-surface-2); flex-shrink: 0;
}
.prod-info { flex: 1; min-width: 0; }
.prod-info strong { display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prod-info span { font-size: 11px; color: var(--admin-text-muted); }

.btn-add    { background: rgba(99,102,241,0.12); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.btn-add:hover { background: rgba(99,102,241,0.25); }
.btn-remove { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.btn-remove:hover { background: rgba(239,68,68,0.25); }

.search-bar { padding: 10px 14px; border-bottom: 1px solid var(--admin-border); }
.search-bar input { width: 100%; background: var(--admin-surface-2); border: 1px solid var(--admin-border); border-radius: 8px; padding: 7px 12px; color: var(--admin-text); font-size: 13px; }
.search-bar input:focus { outline: none; border-color: var(--admin-primary); }

.empty-state { padding: 40px; text-align: center; color: var(--admin-text-muted); font-size: 13px; }
.loading-spin { display: inline-block; width: 18px; height: 18px; border: 2px solid var(--admin-border); border-top-color: var(--admin-primary); border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

<div class="toolbar">
    <div>
        <h3 style="font-size:16px;margin:0;">⭐ Featured Products</h3>
    </div>
    <button class="btn btn-outline" onclick="clearAllFeatured()" style="color:#ef4444;border-color:rgba(239,68,68,0.4);">Clear All Featured</button>
</div>

<div class="trending-layout">

    <!-- LEFT: Currently Featured -->
    <div class="card" style="padding:0;overflow:hidden;">
        <div class="panel-header">
            <h3>⭐ Currently Featured <span class="panel-count" id="featuredCount">0</span></h3>
            <span style="font-size:11px;color:var(--admin-text-muted);">Showing on homepage</span>
        </div>
        <div class="panel-body" id="featuredPanel">
            <div class="empty-state"><span class="loading-spin"></span></div>
        </div>
    </div>

    <!-- RIGHT: All Products (not featured) -->
    <div class="card" style="padding:0;overflow:hidden;">
        <div class="panel-header">
            <h3>All Products <span class="panel-count panel-count-dim" id="allCount">0</span></h3>
            <span style="font-size:11px;color:var(--admin-text-muted);">Click Add to feature a product</span>
        </div>
        <div class="search-bar">
            <input type="text" placeholder="Search products..." oninput="filterAll(this.value)" id="searchAll">
        </div>
        <div class="panel-body" id="allPanel">
            <div class="empty-state"><span class="loading-spin"></span></div>
        </div>
    </div>
</div>

<script>
let featuredProducts    = [];
let nonFeaturedProducts = [];

async function loadAll() {
    try {
        const [featRes, allRes] = await Promise.all([
            api('/products/featured?limit=200'),
            api('/products?per_page=2000&admin=1')
        ]);
        featuredProducts    = featRes.data || [];
        const allProds      = allRes.data  || [];
        const featIds       = new Set(featuredProducts.map(p => p.id));
        nonFeaturedProducts = allProds.filter(p => !featIds.has(p.id));
        renderFeatured();
        renderAll();
    } catch(e) {
        document.getElementById('featuredPanel').innerHTML = '<div class="empty-state">Error loading products</div>';
    }
}

function getImageUrl(p) {
    const img = p.primary_image || p.image || p.images?.[0]?.image_path;
    if (!img) return 'assets/placeholder-product.svg';
    return img.startsWith('http') ? img : '../' + img;
}

function productRow(p, action) {
    const price = p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;
    const btn = action === 'add'
        ? `<button class="btn-add" onclick="toggleFeatured(${p.id}, true)">+ Add</button>`
        : `<button class="btn-remove" onclick="toggleFeatured(${p.id}, false)"> Remove</button>`;
    return `
        <div class="prod-row" id="row_${p.id}">
            <img src="${getImageUrl(p)}" onerror="this.src='assets/placeholder-product.svg'" alt="">
            <div class="prod-info">
                <strong title="${p.name}">${p.name}</strong>
                <span>${formatCurrency(price||0)} · SKU: ${p.sku||'—'}</span>
            </div>
            ${btn}
        </div>
    `;
}

function renderFeatured() {
    const el = document.getElementById('featuredPanel');
    document.getElementById('featuredCount').textContent = featuredProducts.length;
    el.innerHTML = featuredProducts.length
        ? featuredProducts.map(p => productRow(p, 'remove')).join('')
        : '<div class="empty-state">No featured products yet.<br>Add some from the right panel →</div>';
}

function renderAll(filter = '') {
    const el   = document.getElementById('allPanel');
    const term = filter.toLowerCase();
    const list = term ? nonFeaturedProducts.filter(p => p.name.toLowerCase().includes(term)) : nonFeaturedProducts;
    document.getElementById('allCount').textContent = nonFeaturedProducts.length;
    el.innerHTML = list.length
        ? list.map(p => productRow(p, 'add')).join('')
        : `<div class="empty-state">${term ? 'No products match your search' : 'All products are featured! '}</div>`;
}

function filterAll(val) { renderAll(val); }

async function toggleFeatured(productId, makeF) {
    const btn = document.querySelector(`#row_${productId} button`);
    if (btn) { btn.disabled = true; btn.textContent = '...'; }
    try {
        const body = { is_featured: makeF ? 1 : 0 };
        await apiPost(`/products/${productId}/featured`, body);
        if (makeF) {
            const idx = nonFeaturedProducts.findIndex(p => p.id === productId);
            if (idx >= 0) { const [m] = nonFeaturedProducts.splice(idx, 1); featuredProducts.push(m); }
        } else {
            const idx = featuredProducts.findIndex(p => p.id === productId);
            if (idx >= 0) { const [m] = featuredProducts.splice(idx, 1); nonFeaturedProducts.unshift(m); }
        }
        renderFeatured();
        renderAll(document.getElementById('searchAll').value);
        showAlert(makeF ? '⭐ Added to featured!' : ' Removed from featured');
    } catch(e) {
        showAlert('Error: ' + e.message, 'danger');
        if (btn) { btn.disabled = false; btn.textContent = makeF ? '+ Add' : ' Remove'; }
    }
}

async function clearAllFeatured() {
    if (!confirm(`Remove ALL ${featuredProducts.length} products from featured?`)) return;
    try {
        await apiPost('/products/featured/clear', {});
        nonFeaturedProducts = [...featuredProducts, ...nonFeaturedProducts];
        featuredProducts = [];
        renderFeatured();
        renderAll(document.getElementById('searchAll').value);
        showAlert(' All featured products cleared');
    } catch(e) { showAlert('Error: ' + e.message, 'danger'); }
}

function apiPost(endpoint, body) {
    const token = localStorage.getItem('admin_token');
    return fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(body)
    }).then(r => r.json()).then(j => { if (!j.success) throw new Error(j.message || 'Failed'); return j; });
}

loadAll();
</script>

<?php include 'includes/footer.php'; ?>
