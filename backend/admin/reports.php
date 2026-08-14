<?php
/**
 * Admin Reports Dashboard
 * Revenue charts, top products, customer stats, CSV exports.
 */
$pageTitle = 'Reports';
include 'includes/header.php';
?>

<style>
.report-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; margin-bottom:24px; }
.kpi-card {
    background:var(--glass-bg); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur);
    border:1px solid var(--glass-border); box-shadow:var(--glass-shadow);
    border-radius:var(--admin-radius); padding:20px;
    transition:transform .25s ease, box-shadow .25s ease;
}
.kpi-card:hover { transform:translateY(-2px); }
.kpi-card .kpi-val { font-size:26px; font-weight:800; color:var(--admin-text); }
.kpi-card .kpi-label { font-size:12px; color:var(--admin-muted); margin-top:2px; }
.kpi-card .kpi-change { font-size:12px; font-weight:600; margin-top:6px; }
.kpi-change.up { color:#10B981; }
.kpi-change.down { color:#EF4444; }
.chart-container { position:relative; width:100%; height:280px; }
.period-btn { padding:6px 14px; border-radius:8px; border:1px solid var(--admin-border); background:transparent; font-size:12px; cursor:pointer; color:var(--admin-text); transition:all .15s; }
.period-btn.active { background:var(--admin-primary); color:#fff; border-color:var(--admin-primary); }
</style>

<!-- Chart.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- ── KPI Summary Cards ── -->
<div class="report-grid" id="kpiGrid">
  <div class="kpi-card"><div class="kpi-val" id="kpiRevMonth">—</div><div class="kpi-label">Revenue This Month</div><div class="kpi-change" id="kpiRevChange"></div></div>
  <div class="kpi-card"><div class="kpi-val" id="kpiOrdersMonth">—</div><div class="kpi-label">Orders This Month</div></div>
  <div class="kpi-card"><div class="kpi-val" id="kpiOrdersToday">—</div><div class="kpi-label">Orders Today</div></div>
  <div class="kpi-card"><div class="kpi-val" id="kpiCustomers">—</div><div class="kpi-label">Total Customers</div></div>
  <div class="kpi-card"><div class="kpi-val" id="kpiProducts">—</div><div class="kpi-label">Active Products</div></div>
  <div class="kpi-card"><div class="kpi-val" id="kpiPending">—</div><div class="kpi-label">Pending Orders</div></div>
</div>

<div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px;" id="mainReportGrid">

  <!-- Revenue Chart -->
  <div class="card">
    <div class="card-header" style="flex-wrap:wrap;gap:8px;">
      <h3>Revenue</h3>
      <div style="display:flex;gap:6px;">
        <button class="period-btn active" onclick="loadRevenue('day',this)">Daily</button>
        <button class="period-btn" onclick="loadRevenue('week',this)">Weekly</button>
        <button class="period-btn" onclick="loadRevenue('month',this)">Monthly</button>
      </div>
    </div>
    <div class="card-body">
      <div class="chart-container"><canvas id="revenueChart"></canvas></div>
    </div>
  </div>

  <!-- Conversion -->
  <div class="card">
    <div class="card-header"><h3>Order Status</h3></div>
    <div class="card-body">
      <div class="chart-container"><canvas id="conversionChart"></canvas></div>
    </div>
  </div>

</div>

<!-- Top Products -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">

  <div class="card">
    <div class="card-header">
      <h3>Top Products</h3>
      <a href="#" onclick="exportData('products')" class="btn btn-outline btn-sm">📥 CSV</a>
    </div>
    <div class="card-body" style="padding:0;">
      <table class="admin-table" id="topProdTable">
        <thead><tr><th>#</th><th>Product</th><th>Units</th><th>Revenue</th></tr></thead>
        <tbody id="topProdBody"><tr><td colspan="4" style="text-align:center;padding:24px;color:var(--admin-muted);">Loading...</td></tr></tbody>
      </table>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>Top Customers</h3>
      <a href="#" onclick="exportData('customers')" class="btn btn-outline btn-sm">📥 CSV</a>
    </div>
    <div class="card-body" style="padding:0;">
      <table class="admin-table" id="topCustTable">
        <thead><tr><th>#</th><th>Customer</th><th>Orders</th><th>Spend</th></tr></thead>
        <tbody id="topCustBody"><tr><td colspan="4" style="text-align:center;padding:24px;color:var(--admin-muted);">Loading...</td></tr></tbody>
      </table>
    </div>
  </div>

</div>

<!-- Export Row -->
<div class="card">
  <div class="card-header"><h3>Export Reports</h3></div>
  <div class="card-body" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
    <div class="form-group" style="margin:0;">
      <input type="date" class="form-control" id="exportFrom" value="<?= date('Y-m-01') ?>">
    </div>
    <span style="color:var(--admin-muted);">to</span>
    <div class="form-group" style="margin:0;">
      <input type="date" class="form-control" id="exportTo" value="<?= date('Y-m-t') ?>">
    </div>
    <button class="btn btn-outline" onclick="exportData('orders')">📥 Orders CSV</button>
    <button class="btn btn-outline" onclick="exportData('products')">📥 Products CSV</button>
    <button class="btn btn-outline" onclick="exportData('customers')">📥 Customers CSV</button>
  </div>
</div>

<script>
let revenueChart, conversionChart;

async function loadSummary() {
  try {
    const res = await api('/reports/summary');
    const d = res.data;
    const currency = window.CURRENCY_SYMBOL || '$';

    document.getElementById('kpiRevMonth').textContent   = currency + parseFloat(d.this_month.revenue).toFixed(0);
    document.getElementById('kpiOrdersMonth').textContent = d.this_month.orders;
    document.getElementById('kpiOrdersToday').textContent = d.today.orders;
    document.getElementById('kpiCustomers').textContent   = d.totals.customers;
    document.getElementById('kpiProducts').textContent    = d.totals.products;
    document.getElementById('kpiPending').textContent     = d.totals.pending_orders;

    const change = d.this_month.revenue_change;
    const changeEl = document.getElementById('kpiRevChange');
    changeEl.textContent = (change >= 0 ? '▲' : '▼') + ' ' + Math.abs(change) + '% vs last month';
    changeEl.className = 'kpi-change ' + (change >= 0 ? 'up' : 'down');
  } catch(e) { console.warn('Summary failed:', e.message); }
}

async function loadRevenue(period, btn) {
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const from = new Date();
  from.setMonth(from.getMonth() - (period === 'month' ? 12 : period === 'week' ? 3 : 1));
  const fromStr = from.toISOString().split('T')[0];
  const toStr   = new Date().toISOString().split('T')[0];

  try {
    const res = await api('/reports/revenue?period=' + period + '&from=' + fromStr + '&to=' + toStr);
    const data = res.data || [];

    const labels   = data.map(r => r.period);
    const revenues = data.map(r => parseFloat(r.revenue));
    const orders   = data.map(r => parseInt(r.orders));

    if (revenueChart) revenueChart.destroy();
    const ctx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Revenue', data: revenues, backgroundColor: 'rgba(29,111,163,.75)', borderRadius: 6, yAxisID: 'y' },
          { label: 'Orders', data: orders, type: 'line', borderColor: '#C78122', backgroundColor: 'transparent', pointBackgroundColor: '#C78122', pointRadius: 4, tension: .3, yAxisID: 'y1' },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { size: 12 } } } },
        scales: {
          y:  { position: 'left',  ticks: { callback: v => '$' + v } },
          y1: { position: 'right', grid: { drawOnChartArea: false } },
        },
      },
    });
  } catch(e) { console.warn('Revenue chart failed:', e.message); }
}

async function loadConversion() {
  try {
    const res = await api('/reports/conversion');
    const data = res.data?.by_status || [];

    if (conversionChart) conversionChart.destroy();
    const colors = { pending:'#F2A93B', processing:'#1D6FA3', completed:'#10B981', cancelled:'#C0392B', delivered:'#6366F1' };
    const ctx = document.getElementById('conversionChart').getContext('2d');
    conversionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels:   data.map(s => s.status),
        datasets: [{ data: data.map(s => s.count), backgroundColor: data.map(s => colors[s.status] || '#94A3B8'), borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 12 } } },
      },
    });
  } catch(e) { console.warn('Conversion chart failed:', e.message); }
}

async function loadTopProducts() {
  try {
    const res = await api('/reports/products?limit=8');
    const data = res.data || [];
    const currency = window.CURRENCY_SYMBOL || '$';
    document.getElementById('topProdBody').innerHTML = data.map((p, i) => `<tr>
      <td style="color:var(--admin-muted);">${i + 1}</td>
      <td>${p.product_name || '—'}</td>
      <td>${p.units_sold}</td>
      <td style="font-weight:600;">${currency}${parseFloat(p.revenue).toFixed(2)}</td>
    </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--admin-muted);">No data yet</td></tr>';
  } catch(e) {}
}

async function loadTopCustomers() {
  try {
    const res = await api('/reports/customers');
    const data = res.data?.top_customers || [];
    const currency = window.CURRENCY_SYMBOL || '$';
    document.getElementById('topCustBody').innerHTML = data.map((c, i) => `<tr>
      <td style="color:var(--admin-muted);">${i + 1}</td>
      <td><div style="font-weight:600;">${c.customer_name}</div><div style="font-size:11px;color:var(--admin-muted);">${c.customer_email}</div></td>
      <td>${c.orders}</td>
      <td style="font-weight:600;">${currency}${parseFloat(c.total_spend).toFixed(2)}</td>
    </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--admin-muted);">No customers yet</td></tr>';
  } catch(e) {}
}

function exportData(type) {
  const from = document.getElementById('exportFrom')?.value || '';
  const to   = document.getElementById('exportTo')?.value || '';
  const token = localStorage.getItem('admin_token') || '';
  window.open(`/api/reports/export?type=${type}&from=${from}&to=${to}&_t=${token}`, '_blank');
}

// Initial load
loadSummary();
loadRevenue('day', document.querySelector('.period-btn'));
loadConversion();
loadTopProducts();
loadTopCustomers();
</script>

<?php include 'includes/footer.php'; ?>
