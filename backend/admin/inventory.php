<?php
/**
 * Admin Inventory Dashboard
 * Real-time stock monitoring, adjustments, history, and alerts.
 */
$pageTitle = 'Inventory';
include 'includes/header.php';
?>

<style>
.inv-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); gap:16px; margin-bottom:24px; }
.inv-stat { background:var(--admin-surface); border:1px solid var(--admin-border); border-radius:12px; padding:20px; display:flex; align-items:center; gap:14px; }
.inv-stat .stat-icon { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
.inv-stat .stat-body strong { display:block; font-size:22px; font-weight:700; color:var(--admin-text); }
.inv-stat .stat-body span { font-size:12px; color:var(--admin-muted); }
.stock-bar { height:6px; border-radius:3px; background:var(--admin-border); overflow:hidden; margin-top:4px; }
.stock-bar-fill { height:100%; border-radius:3px; transition:width .4s; }
.filter-tabs { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
.filter-tab { padding:8px 16px; border-radius:8px; border:1px solid var(--admin-border); background:var(--admin-surface); font-size:13px; cursor:pointer; color:var(--admin-text); transition:all .15s; }
.filter-tab.active { background:var(--admin-primary); color:#fff; border-color:var(--admin-primary); }
</style>

<!-- ── KPI Stats ── -->
<div class="inv-grid" id="invStats">
  <div class="inv-stat">
    <div class="stat-icon" style="background:#EDF9F3">📦</div>
    <div class="stat-body"><strong id="statTotal">—</strong><span>Total Products</span></div>
  </div>
  <div class="inv-stat">
    <div class="stat-icon" style="background:#FEF3C7">⚠️</div>
    <div class="stat-body"><strong id="statLow">—</strong><span>Low Stock</span></div>
  </div>
  <div class="inv-stat">
    <div class="stat-icon" style="background:#FEE2E2">🚫</div>
    <div class="stat-body"><strong id="statOut">—</strong><span>Out of Stock</span></div>
  </div>
</div>

<!-- ── Adjust Modal ── -->
<div id="adjustModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:999;align-items:center;justify-content:center;">
  <div style="background:var(--admin-surface);border-radius:16px;padding:32px;width:420px;max-width:95vw;">
    <h3 style="margin:0 0 20px;">Adjust Stock</h3>
    <input type="hidden" id="adjProductId">
    <div class="form-group">
      <label class="form-label">Product</label>
      <div id="adjProductName" style="font-weight:600;padding:8px;background:var(--admin-surface-2);border-radius:6px;"></div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Qty Change <small>(+add / -remove)</small></label>
        <input type="number" class="form-control" id="adjQty" placeholder="+10 or -5">
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-control" id="adjType">
          <option value="adjustment">Manual Adjustment</option>
          <option value="import">Stock Import</option>
          <option value="return">Customer Return</option>
          <option value="damage">Damage/Write-off</option>
          <option value="expiry">Expiry</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Note (optional)</label>
      <input type="text" class="form-control" id="adjNote" placeholder="Reason for adjustment...">
    </div>
    <div id="adjAlert" style="display:none;padding:10px;border-radius:8px;font-size:13px;margin-bottom:12px;"></div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-primary" onclick="submitAdjustment()">Save Adjustment</button>
      <button class="btn btn-outline" onclick="closeAdjust()">Cancel</button>
    </div>
  </div>
</div>

<!-- ── Filter Tabs ── -->
<div class="filter-tabs">
  <button class="filter-tab active" onclick="setFilter('all', this)">All Products</button>
  <button class="filter-tab" onclick="setFilter('low', this)">⚠️ Low Stock</button>
  <button class="filter-tab" onclick="setFilter('out', this)">🚫 Out of Stock</button>
</div>

<!-- ── Search ── -->
<div class="card" style="margin-bottom:16px;">
  <div class="card-body" style="display:flex;gap:12px;padding:12px 16px;align-items:center;">
    <input type="text" class="form-control" id="invSearch" placeholder="Search products..." style="max-width:300px;" oninput="debounceLoad()">
    <button class="btn btn-outline btn-sm" onclick="loadInventory()">🔄 Refresh</button>
    <a href="?view=history" class="btn btn-outline btn-sm">📋 View History</a>
  </div>
</div>

<!-- ── Product Table ── -->
<div class="card">
  <div class="card-body" style="padding:0;">
    <table class="admin-table" id="invTable">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Stock Level</th>
          <th>Status</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="invBody">
        <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--admin-muted);">Loading...</td></tr>
      </tbody>
    </table>
  </div>
</div>
<div id="invPagination" style="display:flex;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap;"></div>

<!-- ── History View ── -->
<?php if (($_GET['view'] ?? '') === 'history'): ?>
<div class="card" style="margin-top:24px;">
  <div class="card-header">
    <h3>Inventory Movement History</h3>
    <a href="inventory.php" class="btn btn-outline btn-sm">← Back to Stock</a>
  </div>
  <div class="card-body" style="padding:0;">
    <table class="admin-table" id="histTable">
      <thead><tr><th>Product</th><th>Type</th><th>Change</th><th>Before</th><th>After</th><th>Reference</th><th>Admin</th><th>Date</th></tr></thead>
      <tbody id="histBody"><tr><td colspan="8" style="text-align:center;padding:32px;color:var(--admin-muted);">Loading...</td></tr></tbody>
    </table>
  </div>
</div>
<?php endif; ?>

<script>
let currentFilter = 'all', currentPage = 1, searchTimer;

function setFilter(f, btn) {
  currentFilter = f; currentPage = 1;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadInventory();
}

function debounceLoad() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadInventory, 350);
}

async function loadInventory() {
  const q = document.getElementById('invSearch').value;
  try {
    const res = await api('/inventory?filter=' + currentFilter + '&q=' + encodeURIComponent(q) + '&page=' + currentPage + '&per_page=20');
    const data = res.data || [];
    const meta = res.meta || {};

    // Update stats
    if (meta.alerts) {
      document.getElementById('statOut').textContent = meta.alerts.out_of_stock;
      document.getElementById('statLow').textContent = meta.alerts.low_stock;
    }
    document.getElementById('statTotal').textContent = meta.total || data.length;

    const tbody = document.getElementById('invBody');
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--admin-muted);">No products found</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(p => {
      const threshold = p.low_stock_threshold || 5;
      const pct = p.stock > 0 ? Math.min(100, Math.round((p.stock / (threshold * 4)) * 100)) : 0;
      const barColor = p.stock === 0 ? '#EF4444' : p.stock <= threshold ? '#F59E0B' : '#10B981';
      const badge = p.stock === 0 ? '<span class="badge badge-danger">Out of Stock</span>'
                  : p.stock <= threshold ? '<span class="badge badge-warning">Low Stock</span>'
                  : '<span class="badge badge-success">In Stock</span>';
      return `<tr>
        <td><div style="font-weight:600;">${p.name}</div><div style="font-size:11px;color:var(--admin-muted);">${p.variant_count > 0 ? p.variant_count + ' variants' : 'No variants'}</div></td>
        <td><code style="font-size:12px;">${p.sku || '—'}</code></td>
        <td>
          <div style="font-size:16px;font-weight:700;">${p.stock}</div>
          <div class="stock-bar" style="width:100px;">
            <div class="stock-bar-fill" style="width:${pct}%;background:${barColor};"></div>
          </div>
          <div style="font-size:11px;color:var(--admin-muted);">threshold: ${threshold}</div>
        </td>
        <td>${badge}</td>
        <td>$${parseFloat(p.price).toFixed(2)}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openAdjust(${p.id}, '${p.name.replace(/'/g,'&apos;')}')">± Adjust</button>
          <a href="products.php?edit=${p.id}" class="btn btn-outline btn-sm">✏️ Edit</a>
        </td>
      </tr>`;
    }).join('');

    // Pagination
    renderPagination(meta.page || 1, meta.last_page || 1);
  } catch(e) {
    document.getElementById('invBody').innerHTML = `<tr><td colspan="6" style="color:var(--admin-danger);padding:24px;text-align:center;">Error: ${e.message}</td></tr>`;
  }
}

function renderPagination(current, total) {
  const el = document.getElementById('invPagination');
  if (total <= 1) { el.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= total; i++) {
    html += `<button class="btn btn-sm ${i === current ? 'btn-primary' : 'btn-outline'}" onclick="currentPage=${i};loadInventory()">${i}</button>`;
  }
  el.innerHTML = html;
}

function openAdjust(id, name) {
  document.getElementById('adjProductId').value = id;
  document.getElementById('adjProductName').textContent = name;
  document.getElementById('adjQty').value = '';
  document.getElementById('adjNote').value = '';
  document.getElementById('adjAlert').style.display = 'none';
  document.getElementById('adjustModal').style.display = 'flex';
}

function closeAdjust() {
  document.getElementById('adjustModal').style.display = 'none';
}

async function submitAdjustment() {
  const productId = document.getElementById('adjProductId').value;
  const qty       = parseInt(document.getElementById('adjQty').value);
  const type      = document.getElementById('adjType').value;
  const note      = document.getElementById('adjNote').value;
  const alert     = document.getElementById('adjAlert');

  if (isNaN(qty) || qty === 0) {
    alert.style.display = 'block'; alert.style.background = '#FEE2E2'; alert.style.color = '#B91C1C';
    alert.textContent = 'Please enter a non-zero quantity change.'; return;
  }

  try {
    await api('/inventory/adjust', 'POST', { product_id: parseInt(productId), qty_change: qty, type, note });
    closeAdjust();
    loadInventory();
  } catch(e) {
    alert.style.display = 'block'; alert.style.background = '#FEE2E2'; alert.style.color = '#B91C1C';
    alert.textContent = 'Failed: ' + e.message;
  }
}

<?php if (($_GET['view'] ?? '') === 'history'): ?>
async function loadHistory() {
  const res = await api('/inventory/history?per_page=50');
  const data = res.data || [];
  document.getElementById('histBody').innerHTML = data.map(h => `<tr>
    <td>${h.product_name || '—'}</td>
    <td><span class="badge badge-${h.type === 'sale' ? 'primary' : h.type === 'damage' ? 'danger' : 'default'}">${h.type}</span></td>
    <td style="font-weight:700;color:${h.qty_change > 0 ? '#10B981' : '#EF4444'}">${h.qty_change > 0 ? '+' : ''}${h.qty_change}</td>
    <td>${h.qty_before}</td>
    <td>${h.qty_after}</td>
    <td><code>${h.reference || '—'}</code></td>
    <td>${h.admin_name || 'System'}</td>
    <td>${new Date(h.created_at).toLocaleString()}</td>
  </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--admin-muted);">No history found</td></tr>';
}
loadHistory();
<?php endif; ?>

loadInventory();
</script>

<?php include 'includes/footer.php'; ?>
