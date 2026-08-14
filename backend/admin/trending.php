<?php $pageTitle = 'Trending Products'; include 'includes/header.php'; ?>

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

.btn-add    { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.btn-add:hover { background: rgba(34,197,94,0.25); }
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
        <h3 style="font-size:16px;margin:0;">Trending Products</h3>
    </div>
    <button class="btn btn-outline" onclick="clearAllTrending()" style="color:#ef4444;border-color:rgba(239,68,68,0.4);">Clear All Trending</button>
</div>

<div class="trending-layout">

    <!-- LEFT: Currently Trending -->
    <div class="card" style="padding:0;overflow:hidden;">
        <div class="panel-header">
            <h3>Currently Trending <span class="panel-count" id="trendingCount">0</span></h3>
            <span style="font-size:11px;color:var(--admin-text-muted);">Showing on homepage</span>
        </div>
        <div class="panel-body" id="trendingPanel">
            <div class="empty-state"><span class="loading-spin"></span></div>
        </div>
    </div>

    <!-- RIGHT: All Products (not trending) -->
    <div class="card" style="padding:0;overflow:hidden;">
        <div class="panel-header">
            <h3>All Products <span class="panel-count" id="allCount" style="background:var(--admin-surface-2);color:var(--admin-text-muted);">0</span></h3>
            <span style="font-size:11px;color:var(--admin-text-muted);">Click Add to move a product into trending</span>
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
let trendingProducts    = [];
let nonTrendingProducts = [];

async function loadAll() {
    try {
        const tr  = await api('/products/trending?limit=200');
        trendingProducts = tr.data || [];

        const all = await api('/products?per_page=2000&admin=1');
        const allProds = all.data || [];

        const trendingIds = new Set(trendingProducts.map(p => p.id));
        nonTrendingProducts = allProds.filter(p => !trendingIds.has(p.id));

        renderTrending();
        renderAll();
    } catch(e) {
        document.getElementById('trendingPanel').innerHTML = '<div class="empty-state">Error loading products</div>';
    }
}

function getImageUrl(p) {
    const img = p.primary_image || p.image || p.images?.[0]?.image_path;
    if (!img) return 'assets/placeholder-product.svg';
    return img.startsWith('http') ? img : (window.MEDIA_URL || '../') + img;
}

function productRow(p, action) {
    const price = p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;
    const btn = action === 'add'
        ? `<button class="btn-add" onclick="toggleTrending(${p.id}, true)">+ Add</button>`
        : `<button class="btn-remove" onclick="toggleTrending(${p.id}, false)"> Remove</button>`;
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

function renderTrending() {
    const el = document.getElementById('trendingPanel');
    document.getElementById('trendingCount').textContent = trendingProducts.length;
    if (!trendingProducts.length) {
        el.innerHTML = '<div class="empty-state">No trending products yet.<br>Add some from the right panel →</div>';
        return;
    }
    el.innerHTML = trendingProducts.map(p => productRow(p, 'remove')).join('');
}

function renderAll(filter = '') {
    const el = document.getElementById('allPanel');
    const term = filter.toLowerCase();
    const list = term ? nonTrendingProducts.filter(p => p.name.toLowerCase().includes(term)) : nonTrendingProducts;
    document.getElementById('allCount').textContent = nonTrendingProducts.length;
    if (!list.length) {
        el.innerHTML = `<div class="empty-state">${term ? 'No products match your search' : 'All products are trending! '}</div>`;
        return;
    }
    el.innerHTML = list.map(p => productRow(p, 'add')).join('');
}

function filterAll(val) { renderAll(val); }

async function toggleTrending(productId, makeTrending) {
    const btn = document.querySelector(`#row_${productId} button`);
    if (btn) { btn.disabled = true; btn.textContent = '...'; }
    try {
        const body = { is_trending: makeTrending ? 1 : 0 };
        await apiPatch(`/products/${productId}/trending`, body);

        if (makeTrending) {
            const idx = nonTrendingProducts.findIndex(p => p.id === productId);
            if (idx >= 0) { const [moved] = nonTrendingProducts.splice(idx, 1); trendingProducts.push(moved); }
        } else {
            const idx = trendingProducts.findIndex(p => p.id === productId);
            if (idx >= 0) { const [moved] = trendingProducts.splice(idx, 1); nonTrendingProducts.unshift(moved); }
        }

        renderTrending();
        renderAll(document.getElementById('searchAll').value);
        showAlert(makeTrending ? ' Added to trending!' : ' Removed from trending');
    } catch(e) {
        showAlert('Error: ' + e.message, 'danger');
        if (btn) { btn.disabled = false; btn.textContent = makeTrending ? '+ Add' : ' Remove'; }
    }
}

async function clearAllTrending() {
    if (!confirm(`Remove ALL ${trendingProducts.length} products from trending?`)) return;
    try {
        await apiPatch('/products/trending/clear', {});
        nonTrendingProducts = [...trendingProducts, ...nonTrendingProducts];
        trendingProducts = [];
        renderTrending();
        renderAll(document.getElementById('searchAll').value);
        showAlert(' All trending products cleared');
    } catch(e) {
        showAlert('Error: ' + e.message, 'danger');
    }
}

async function apiPatch(endpoint, body) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ ...body, _method: 'PATCH' })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Request failed');
    return json;
}

loadAll();
</script>

<?php include 'includes/footer.php'; ?>
