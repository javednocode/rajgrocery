<?php $pageTitle = 'Products'; include 'includes/header.php'; ?>

<style>
/* ── Toolbar ── */
.ptb { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
.ptb-left { display:flex; align-items:center; gap:8px; flex:1; flex-wrap:wrap; min-width:0; }
.ptb-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }

.search-box { position:relative; flex:1; min-width:180px; max-width:300px; }
.search-box input { width:100%; padding:8px 12px 8px 34px; border:1.5px solid var(--admin-border); border-radius:8px; font-size:13px; background:var(--admin-card); color:var(--admin-text); outline:none; }
.search-box input:focus { border-color:var(--admin-primary); }
.search-box .si { position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:13px; color:var(--admin-text-muted); pointer-events:none; }

.filter-select { padding:8px 10px; border:1.5px solid var(--admin-border); border-radius:8px; font-size:13px; background:var(--admin-card); color:var(--admin-text); outline:none; cursor:pointer; }
.filter-select:focus { border-color:var(--admin-primary); }

/* ── Bulk Bar ── */
.bulk-bar {
    display:none; align-items:center; gap:10px; flex-wrap:wrap;
    background:linear-gradient(135deg,#EDE9FF,#E0F2EE);
    border:1.5px solid #C4B5FD; border-radius:10px;
    padding:10px 16px; margin-bottom:12px;
}
.bulk-bar.visible { display:flex; }
.bulk-count { font-size:13px; font-weight:700; color:#2563EB; }
.bulk-select { padding:7px 10px; border:1.5px solid #C4B5FD; border-radius:7px; font-size:13px; background:white; color:#1A1A2E; outline:none; cursor:pointer; min-width:180px; }
.bulk-cat-wrap { display:none; align-items:center; gap:6px; }
.bulk-cat-wrap.show { display:flex; }
.bulk-cat-sel { padding:7px 10px; border:1.5px solid #C4B5FD; border-radius:7px; font-size:13px; background:white; color:#1A1A2E; outline:none; min-width:160px; }
.btn-apply { padding:7px 16px; background:#2563EB; color:white; border:none; border-radius:7px; font-size:13px; font-weight:700; cursor:pointer; transition:background .18s; }
.btn-apply:hover { background:#3a2166; }
.btn-clear-sel { padding:7px 12px; background:transparent; color:#6B7280; border:1.5px solid #D1D5DB; border-radius:7px; font-size:12px; cursor:pointer; transition:all .18s; }
.btn-clear-sel:hover { background:#FEE2E2; color:#991B1B; border-color:#FCA5A5; }

/* ── Table ── */
.products-table-wrap { overflow-x:auto; }
table.pt { width:100%; border-collapse:collapse; font-size:13px; }
table.pt thead th { padding:10px 12px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--admin-text-muted); border-bottom:2px solid var(--admin-border); white-space:nowrap; }
table.pt thead th.sortable { cursor:pointer; user-select:none; }
table.pt thead th.sortable:hover { color:var(--admin-primary); }
table.pt tbody tr { border-bottom:1px solid var(--admin-border); transition:background .12s; }
table.pt tbody tr:hover { background:rgba(37,99,235,.04); }
table.pt tbody tr.selected { background:rgba(37,99,235,.08); }
table.pt td { padding:9px 12px; vertical-align:middle; }

.check-col { width:36px; }
input[type=checkbox] { width:15px; height:15px; accent-color:#2563EB; cursor:pointer; }

.prod-cell { display:flex; align-items:center; gap:10px; }
.prod-thumb { width:40px; height:40px; border-radius:8px; object-fit:cover; flex-shrink:0; border:1px solid var(--admin-border); background:#F8FAFF; }
.prod-name { font-weight:600; color:var(--admin-text); line-height:1.3; }
.prod-sku { font-size:11px; color:var(--admin-text-muted); margin-top:2px; }

.cat-badge { display:inline-block; padding:2px 8px; background:#EDE9FF; color:#2563EB; border-radius:999px; font-size:11px; font-weight:600; margin:1px; }

.sort-arrow { font-size:10px; margin-left:3px; opacity:.5; }
.sort-arrow.asc::after  { content:'▲'; }
.sort-arrow.desc::after { content:'▼'; }

/* ── Stats bar ── */
.stats-bar { display:flex; align-items:center; gap:16px; font-size:12px; color:var(--admin-text-muted); padding:8px 0; }
.stats-bar strong { color:var(--admin-text); }

/* ── Pagination ── */
.pager { display:flex; align-items:center; gap:4px; margin-top:16px; flex-wrap:wrap; }
.pager a, .pager span { display:inline-flex; align-items:center; justify-content:center; min-width:32px; height:32px; padding:0 8px; border-radius:7px; border:1.5px solid var(--admin-border); font-size:13px; font-weight:600; text-decoration:none; color:var(--admin-text); cursor:pointer; transition:all .15s; }
.pager a:hover { border-color:var(--admin-primary); color:var(--admin-primary); }
.pager a.active { background:var(--admin-primary); border-color:var(--admin-primary); color:white; }
.pager span.dots { border:none; color:var(--admin-text-muted); cursor:default; }

/* ── Modal ── */
.modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:9000; align-items:center; justify-content:center; }
.modal-overlay.show { display:flex; }
.modal-box { background:var(--admin-card); border-radius:16px; box-shadow:0 24px 64px rgba(0,0,0,.22); padding:28px 28px 24px; max-width:420px; width:90%; animation:slideUp .2s ease; }
@keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.modal-title { font-size:16px; font-weight:800; color:var(--admin-text); margin-bottom:16px; }
.modal-desc { font-size:13.5px; color:var(--admin-text-muted); margin-bottom:20px; line-height:1.6; }
.modal-select { width:100%; padding:10px 12px; border:1.5px solid var(--admin-border); border-radius:9px; font-size:14px; background:var(--admin-card); color:var(--admin-text); outline:none; margin-bottom:16px; }
.modal-select:focus { border-color:var(--admin-primary); }
.modal-actions { display:flex; gap:10px; justify-content:flex-end; }
.btn-modal-cancel { padding:9px 18px; background:transparent; color:var(--admin-text-muted); border:1.5px solid var(--admin-border); border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; transition:all .15s; }
.btn-modal-cancel:hover { background:var(--admin-border); }
.btn-modal-confirm { padding:9px 20px; background:#2563EB; color:white; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:700; transition:background .15s; }
.btn-modal-confirm:hover { background:#3a2166; }
.btn-modal-danger { background:#DC2626; }
.btn-modal-danger:hover { background:#B91C1C; }
</style>

<!-- ── Toolbar ── -->
<div class="ptb">
    <div class="ptb-left">
        <div class="search-box">
            <span class="si"></span>
            <input type="text" id="searchInput" placeholder="Search products..." oninput="debounceSearch()">
        </div>
        <select id="catFilter" class="filter-select" onchange="loadProducts(1)">
            <option value="">All Categories</option>
        </select>
        <select id="statusFilter" class="filter-select" onchange="loadProducts(1)">
            <option value="">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
        </select>
        <select id="stockFilter" class="filter-select" onchange="loadProducts(1)">
            <option value="">All Stock</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock (≤5)</option>
            <option value="in">In Stock</option>
        </select>
    </div>
    <div class="ptb-right">
        <a href="product-edit.php" class="btn btn-primary">+ Add Product</a>
    </div>
</div>

<!-- ── Bulk Action Bar ── -->
<div class="bulk-bar" id="bulkBar">
    <span class="bulk-count" id="bulkCount">0 selected</span>
    <select class="bulk-select" id="bulkAction" onchange="onBulkActionChange()">
        <option value="">── Bulk Actions ──</option>
        <optgroup label="Status">
            <option value="enable"> Enable Products</option>
            <option value="disable"> Disable Products</option>
        </optgroup>
        <optgroup label="Category">
            <option value="set_category"> Move to Category</option>
            <option value="add_category"> Add to Category</option>
            <option value="remove_category"> Remove from Category</option>
        </optgroup>
        <optgroup label="Featured">
            <option value="mark_featured">⭐ Mark as Featured</option>
            <option value="unmark_featured"> Remove Featured</option>
        </optgroup>
        <optgroup label="Danger">
            <option value="delete"> Delete Selected</option>
        </optgroup>
    </select>
    <div class="bulk-cat-wrap" id="bulkCatWrap">
        <select class="bulk-cat-sel" id="bulkCatSel"></select>
    </div>
    <button class="btn-apply" onclick="applyBulkAction()">Apply</button>
    <button class="btn-clear-sel" onclick="clearSelection()"> Clear</button>
</div>

<!-- ── Stats ── -->
<div class="stats-bar" id="statsBar">
    <span>Showing <strong id="statShowing">—</strong> of <strong id="statTotal">—</strong> products</span>
    <span>|</span>
    <span id="statSel" style="display:none"> <strong id="statSelCount">0</strong> selected</span>
</div>

<!-- ── Table ── -->
<div class="card">
    <div class="card-body" style="padding:0;">
        <div class="products-table-wrap">
            <table class="pt">
                <thead>
                    <tr>
                        <th class="check-col"><input type="checkbox" id="selectAll" onchange="toggleSelectAll(this)"></th>
                        <th class="sortable" onclick="setSort('name')">Product <span class="sort-arrow" id="sort-name"></span></th>
                        <th class="sortable" onclick="setSort('price')">Price <span class="sort-arrow" id="sort-price"></span></th>
                        <th class="sortable" onclick="setSort('stock')">Stock <span class="sort-arrow" id="sort-stock"></span></th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="productsList"></tbody>
            </table>
        </div>
    </div>
</div>
<div class="pager" id="pager"></div>

<!-- ── Confirm Modal ── -->
<div class="modal-overlay" id="bulkModal">
    <div class="modal-box">
        <div class="modal-title" id="modalTitle">Confirm Action</div>
        <div class="modal-desc" id="modalDesc"></div>
        <select class="modal-select" id="modalCatSel" style="display:none"></select>
        <div class="modal-actions">
            <button class="btn-modal-cancel" onclick="closeBulkModal()">Cancel</button>
            <button class="btn-modal-confirm" id="modalConfirmBtn" onclick="executeBulkAction()">Confirm</button>
        </div>
    </div>
</div>

<script>
// ── State ──
let currentPage = 1, sortBy = 'name', sortDir = 'asc';
let allCategories = [];
let selectedIds = new Set();
let pendingAction = '';
let searchTimer;

// ── Load categories into filters ──
async function loadCategories() {
    const res = await api('/categories');
    function flat(cats, prefix='') {
        let out = [];
        (cats||[]).forEach(c => {
            out.push({ id:c.id, name: prefix + c.name, slug:c.slug });
            if (c.children?.length) out = out.concat(flat(c.children, prefix + '— '));
        });
        return out;
    }
    allCategories = flat(res.data||[]);
    const catFilter = document.getElementById('catFilter');
    const bulkCatSel = document.getElementById('bulkCatSel');
    const modalCatSel = document.getElementById('modalCatSel');
    allCategories.forEach(c => {
        [catFilter, bulkCatSel, modalCatSel].forEach(sel => {
            const opt = document.createElement('option');
            opt.value = c.id; opt.textContent = c.name;
            sel.appendChild(opt);
        });
    });
}

// ── Debounce Search ──
function debounceSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadProducts(1), 320);
}

// ── Sort ──
function setSort(col) {
    if (sortBy === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else { sortBy = col; sortDir = 'asc'; }
    document.querySelectorAll('.sort-arrow').forEach(e => { e.className = 'sort-arrow'; });
    const el = document.getElementById('sort-' + col);
    if (el) el.className = 'sort-arrow ' + sortDir;
    loadProducts(currentPage);
}

// ── Load Products ──
async function loadProducts(page = 1) {
    currentPage = page;
    const q       = document.getElementById('searchInput').value;
    const cat     = document.getElementById('catFilter').value;
    const status  = document.getElementById('statusFilter').value;
    const stock   = document.getElementById('stockFilter').value;
    let url = `/products?page=${page}&per_page=20&q=${encodeURIComponent(q)}&sort=${sortBy}&dir=${sortDir}`;
    if (cat)    url += `&category_id=${cat}`;
    if (status !== '') url += `&is_active=${status}`;
    if (stock)  url += `&stock_filter=${stock}`;

    try {
        const res = await api(url);
        const products = res.data || [];
        const pag = res.pagination || {};

        document.getElementById('statShowing').textContent = products.length;
        document.getElementById('statTotal').textContent   = pag.total || 0;

        document.getElementById('productsList').innerHTML = products.length
            ? products.map(p => {
                const isChecked = selectedIds.has(p.id);
                const cats = (p.category_names||'').split(',').filter(Boolean).map(n =>
                    `<span class="cat-badge">${n.trim()}</span>`).join('') || '<span style="color:var(--admin-text-muted)">—</span>';
                return `<tr id="row-${p.id}" class="${isChecked?'selected':''}">
                    <td class="check-col"><input type="checkbox" class="row-check" value="${p.id}" onchange="toggleRow(${p.id},this)" ${isChecked?'checked':''}></td>
                    <td>
                        <div class="prod-cell">
                            <img class="prod-thumb" src="${imgUrl(p.primary_image||p.images?.[0]?.image_path)}" alt="${p.name}" loading="lazy">
                            <div>
                                <div class="prod-name">${p.name}</div>
                                <div class="prod-sku">SKU: ${p.sku||'—'} ${p.is_featured==1?'<span style="color:#F59E0B;font-size:11px;">⭐ Featured</span>':''}</div>
                            </div>
                        </div>
                    </td>
                    <td>${p.sale_price
                        ? `<span style="text-decoration:line-through;color:var(--admin-text-muted);font-size:12px">€${p.price}</span> <strong style="color:var(--admin-success)">€${p.sale_price}</strong>`
                        : `<strong>€${p.price}</strong>`}</td>
                    <td>${p.stock <= 0
                        ? '<span class="badge badge-danger">Out of stock</span>'
                        : p.stock <= 5
                            ? `<span class="badge badge-warning">${p.stock}</span>`
                            : `<span class="badge badge-success">${p.stock}</span>`}</td>
                    <td>${cats}</td>
                    <td>${p.is_active==1
                        ? '<span class="badge badge-success">Active</span>'
                        : '<span class="badge badge-danger">Inactive</span>'}</td>
                    <td style="white-space:nowrap">
                        <a href="product-edit.php?id=${p.id}" class="btn btn-outline btn-sm">Edit</a>
                        <button class="btn btn-danger btn-sm" onclick="confirmDelete('products',${p.id},'${p.name.replace(/'/g,"\\'")}')">Delete</button>
                    </td>
                </tr>`;
            }).join('')
            : '<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--admin-text-muted)">No products found</td></tr>';

        // Pagination
        renderPager(pag, page);

        // Update select-all state
        const allChecks = document.querySelectorAll('.row-check');
        document.getElementById('selectAll').checked =
            allChecks.length > 0 && [...allChecks].every(c => selectedIds.has(parseInt(c.value)));

    } catch(e) { console.error(e); }
}

// ── Pager ──
function renderPager(pag, page) {
    if (!pag.total_pages || pag.total_pages <= 1) {
        document.getElementById('pager').innerHTML = '';
        return;
    }
    let html = '';
    const tp = pag.total_pages;
    const mkLink = i => `<a href="#" class="${i===page?'active':''}" onclick="loadProducts(${i});return false">${i}</a>`;
    if (page > 1) html += `<a href="#" onclick="loadProducts(${page-1});return false">‹ Prev</a>`;
    if (tp <= 7) {
        for (let i=1;i<=tp;i++) html += mkLink(i);
    } else {
        html += mkLink(1);
        if (page > 3) html += '<span class="dots">…</span>';
        for (let i=Math.max(2,page-1);i<=Math.min(tp-1,page+1);i++) html += mkLink(i);
        if (page < tp-2) html += '<span class="dots">…</span>';
        html += mkLink(tp);
    }
    if (page < tp) html += `<a href="#" onclick="loadProducts(${page+1});return false">Next ›</a>`;
    document.getElementById('pager').innerHTML = html;
}

// ── Selection ──
function toggleSelectAll(cb) {
    document.querySelectorAll('.row-check').forEach(c => {
        c.checked = cb.checked;
        const id = parseInt(c.value);
        if (cb.checked) selectedIds.add(id); else selectedIds.delete(id);
        document.getElementById('row-'+id)?.classList.toggle('selected', cb.checked);
    });
    updateBulkBar();
}

function toggleRow(id, cb) {
    if (cb.checked) selectedIds.add(id); else selectedIds.delete(id);
    document.getElementById('row-'+id)?.classList.toggle('selected', cb.checked);
    updateBulkBar();
}

function clearSelection() {
    selectedIds.clear();
    document.querySelectorAll('.row-check').forEach(c => c.checked = false);
    document.getElementById('selectAll').checked = false;
    updateBulkBar();
}

function updateBulkBar() {
    const count = selectedIds.size;
    const bar = document.getElementById('bulkBar');
    document.getElementById('bulkCount').textContent = `${count} selected`;
    bar.classList.toggle('visible', count > 0);
    document.getElementById('statSel').style.display = count > 0 ? '' : 'none';
    document.getElementById('statSelCount').textContent = count;
}

// ── Bulk Action Logic ──
const catActions = ['set_category','add_category','remove_category'];

function onBulkActionChange() {
    const action = document.getElementById('bulkAction').value;
    document.getElementById('bulkCatWrap').classList.toggle('show', catActions.includes(action));
}

function applyBulkAction() {
    const action = document.getElementById('bulkAction').value;
    if (!action) { alert('Please select an action'); return; }
    if (selectedIds.size === 0) { alert('Please select at least one product'); return; }

    const labels = {
        enable: 'Enable', disable: 'Disable', delete: 'Delete',
        mark_featured: 'Mark Featured', unmark_featured: 'Remove Featured',
        set_category: 'Move to Category', add_category: 'Add to Category', remove_category: 'Remove from Category',
    };
    pendingAction = action;

    document.getElementById('modalTitle').textContent = `${labels[action] || action} — ${selectedIds.size} Products`;
    document.getElementById('modalDesc').textContent =
        action === 'delete'
            ? ` This will permanently delete ${selectedIds.size} product(s). This cannot be undone.`
            : `Apply "${labels[action]}" to ${selectedIds.size} selected product(s)?`;

    const catSel = document.getElementById('modalCatSel');
    catSel.style.display = catActions.includes(action) ? 'block' : 'none';

    const confirmBtn = document.getElementById('modalConfirmBtn');
    confirmBtn.textContent = 'Confirm';
    confirmBtn.className = 'btn-modal-confirm' + (action === 'delete' ? ' btn-modal-danger' : '');

    document.getElementById('bulkModal').classList.add('show');
}

function closeBulkModal() {
    document.getElementById('bulkModal').classList.remove('show');
    document.getElementById('bulkAction').value = '';
    document.getElementById('bulkCatWrap').classList.remove('show');
}

async function executeBulkAction() {
    const body = { action: pendingAction, ids: [...selectedIds] };
    if (catActions.includes(pendingAction)) {
        body.category_id = parseInt(document.getElementById('modalCatSel').value);
        if (!body.category_id) { alert('Please select a category'); return; }
    }
    // For MOVE: pass the current category filter as the source
    if (pendingAction === 'set_category') {
        const sourceVal = parseInt(document.getElementById('catFilter').value);
        if (sourceVal) {
            body.source_category_id = sourceVal;
        } else {
            // No category filter active — warn the user
            if (!confirm('No source category is selected in the filter.\\nProducts will be ADDED to the destination without removing from any category.\\n\\nTip: First filter by a category, then use "Move to Category" to move products out of it.\\n\\nProceed anyway?')) {
                return;
            }
        }
    }
    closeBulkModal();
    try {
        await api('/products/bulk', 'POST', body);
        clearSelection();
        loadProducts(currentPage);
        showAlert(` Done — ${selectedIds.size || 'Selected'} product(s) updated`);
    } catch(e) {
        showAlert(' Action failed. Please try again.', 'error');
    }
}

// Close modal on backdrop click
document.getElementById('bulkModal').addEventListener('click', function(e) {
    if (e.target === this) closeBulkModal();
});

// ── Init ──
loadCategories();
loadProducts();
</script>

<?php include 'includes/footer.php'; ?>
