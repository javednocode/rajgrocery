<?php $pageTitle = 'Customers'; include 'includes/header.php'; ?>

<style>
.cust-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
.cust-stat  { background:var(--admin-bg); border:1px solid var(--admin-border); border-radius:10px; padding:12px 16px; }
.cust-stat strong { display:block; font-size:22px; }
.cust-stat span   { font-size:11px; color:var(--admin-text-muted); }
.cust-filter { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.cust-filter select { max-width:160px; }
.pagination { display:flex; align-items:center; gap:6px; padding:14px 16px; border-top:1px solid var(--admin-border); }
.pagination button { padding:5px 11px; border-radius:6px; border:1px solid var(--admin-border); background:var(--admin-bg); color:var(--admin-text); font-size:12px; cursor:pointer; }
.pagination button:disabled { opacity:.4; cursor:default; }
.pagination button.active { background:var(--admin-primary); color:#fff; border-color:var(--admin-primary); }
.pagination-info { font-size:12px; color:var(--admin-text-muted); margin-left:auto; }
.badge-imported { display:inline-block; background:rgba(37,99,235,.12); color:#2563eb; border:1px solid rgba(37,99,235,.25); border-radius:4px; font-size:9px; font-weight:700; padding:1px 5px; vertical-align:middle; margin-left:4px; }
.badge-reset { display:inline-block; background:rgba(234,179,8,.12); color:#ca8a04; border:1px solid rgba(234,179,8,.25); border-radius:4px; font-size:9px; font-weight:700; padding:1px 5px; vertical-align:middle; margin-left:3px; }
@media(max-width:700px){ .cust-stats{grid-template-columns:1fr 1fr;} }
</style>

<div class="toolbar">
    <div class="cust-filter">
        <div class="search-box">
            <span class="search-icon"></span>
            <input type="text" id="searchInput" placeholder="Search name, email, phone…" oninput="debounceLoad()">
        </div>
        <select class="form-control" id="sourceFilter" onchange="goPage(1)">
            <option value="">All Sources</option>
            <option value="csv_import">Imported</option>
            <option value="storefront">Storefront</option>
        </select>
        <select class="form-control" id="perPageSelect" onchange="goPage(1)">
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
            <option value="250">250 / page</option>
            <option value="500">500 / page</option>
        </select>
    </div>
    <a href="customer-import.php" class="btn btn-primary btn-sm">+ Import Customers</a>
</div>

<!-- Quick stats -->
<div class="cust-stats" id="custStats">
    <div class="cust-stat"><strong id="statTotal">—</strong><span>Total Customers</span></div>
    <div class="cust-stat"><strong id="statImported">—</strong><span>Imported</span></div>
    <div class="cust-stat"><strong id="statReset">—</strong><span>Password Reset Pending</span></div>
    <div class="cust-stat"><strong id="statOrders">—</strong><span>With Orders</span></div>
</div>

<div class="card"><div class="card-body" style="padding:0;">
    <table class="data-table">
        <thead><tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Orders</th>
            <th>Total Spent</th>
            <th>Source</th>
            <th>Joined</th>
        </tr></thead>
        <tbody id="customersList"><tr><td colspan="7" style="text-align:center;padding:40px;color:var(--admin-text-muted)">Loading…</td></tr></tbody>
    </table>
    <div class="pagination" id="paginationBar" style="display:none;"></div>
</div></div>

<script>
let currentPage = 1;
let totalPages  = 1;
let totalCount  = 0;
let debTimer    = null;
let statsLoaded = false;

function debounceLoad() {
    clearTimeout(debTimer);
    debTimer = setTimeout(() => goPage(1), 280);
}

function goPage(p) {
    currentPage = p;
    loadCustomers();
}

async function loadCustomers() {
    const q       = document.getElementById('searchInput').value.trim();
    const source  = document.getElementById('sourceFilter').value;
    const perPage = parseInt(document.getElementById('perPageSelect').value, 10);
    const tbody   = document.getElementById('customersList');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--admin-text-muted)">Loading…</td></tr>';

    try {
        let url = `/customers?page=${currentPage}&per_page=${perPage}`;
        if (q)      url += `&q=${encodeURIComponent(q)}`;
        if (source) url += `&source=${encodeURIComponent(source)}`;

        const res = await api(url);
        const customers = res.data || [];
        const meta      = res.meta || {};

        totalCount = meta.total || 0;
        totalPages = meta.total_pages || 1;

        tbody.innerHTML = customers.map(c => `
            <tr>
                <td>
                    <a href="customer-detail.php?id=${c.id}"><strong>${escHtml(c.name || '—')}</strong></a>
                    ${c.source === 'csv_import' ? '<span class="badge-imported">Imported</span>' : ''}
                    ${c.password_reset_required == 1 ? '<span class="badge-reset">PW Reset</span>' : ''}
                </td>
                <td>${escHtml(c.email || '—')}</td>
                <td>${escHtml(c.phone || '—')}</td>
                <td>${c.total_orders || 0}</td>
                <td>${formatCurrency(c.total_spent || 0)}</td>
                <td style="color:var(--admin-text-muted);font-size:11px;">${c.source === 'csv_import' ? 'Imported' : (c.source || 'Storefront')}</td>
                <td style="color:var(--admin-text-dim)">${formatDate(c.created_at)}</td>
            </tr>
        `).join('') || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No customers found</td></tr>';

        renderPagination(meta, perPage);
        if (!statsLoaded) loadStats();

    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#dc2626">${escHtml(e.message)}</td></tr>`;
    }
}

function renderPagination(meta, perPage) {
    const bar = document.getElementById('paginationBar');
    if (!meta.total || meta.total_pages <= 1) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';

    const tp   = meta.total_pages;
    const cp   = currentPage;
    let pages  = [];

    // Always show first, last, current ±2
    const show = new Set([1, tp]);
    for (let i = Math.max(1, cp - 2); i <= Math.min(tp, cp + 2); i++) show.add(i);
    const sorted = [...show].sort((a,b) => a - b);

    let html = `<button onclick="goPage(${cp-1})" ${cp===1?'disabled':''}>← Prev</button>`;
    let prev = 0;
    for (const p of sorted) {
        if (p - prev > 1) html += `<span style="padding:0 4px;color:var(--admin-text-muted)">…</span>`;
        html += `<button class="${p===cp?'active':''}" onclick="goPage(${p})">${p}</button>`;
        prev = p;
    }
    html += `<button onclick="goPage(${cp+1})" ${cp===tp?'disabled':''}>Next →</button>`;
    html += `<span class="pagination-info">Showing ${((cp-1)*perPage)+1}–${Math.min(cp*perPage, meta.total)} of <strong>${meta.total}</strong> customers</span>`;
    bar.innerHTML = html;
}

async function loadStats() {
    statsLoaded = true;
    try {
        // Total
        const all = await api('/customers?per_page=1');
        document.getElementById('statTotal').textContent = (all.meta?.total || 0).toLocaleString();

        // Imported
        const imp = await api('/customers?per_page=1&source=csv_import');
        document.getElementById('statImported').textContent = (imp.meta?.total || 0).toLocaleString();

        // Password reset pending
        const rst = await api('/customers?per_page=1&password_reset=1');
        document.getElementById('statReset').textContent = (rst.meta?.total || 0).toLocaleString();

        // With orders
        const ord = await api('/customers?per_page=1&has_orders=1');
        document.getElementById('statOrders').textContent = (ord.meta?.total || 0).toLocaleString();
    } catch(e) {}
}

function escHtml(s) {
    return (s == null ? '' : String(s))
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Init
loadCustomers();
</script>

<?php include 'includes/footer.php'; ?>
