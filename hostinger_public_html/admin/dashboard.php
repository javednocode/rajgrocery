<?php $pageTitle = 'Dashboard'; include 'includes/header.php'; ?>

<style>
.country-dash-banner {
    display:flex;align-items:center;gap:12px;padding:12px 18px;border-radius:12px;margin-bottom:20px;
    background:linear-gradient(135deg,rgba(37,99,235,.1),rgba(99,102,241,.07));
    border:1.5px solid rgba(37,99,235,.2);
}
.cdb-flag { font-size:28px; }
.cdb-title { font-size:18px;font-weight:800;color:var(--admin-text); }
.cdb-subtitle { font-size:12px;color:var(--admin-text-muted);margin-top:2px; }
.cdb-switch { margin-left:auto; }
</style>

<div id="dashboardContent">
    <!-- Country context banner -->
    <div id="countryDashBanner" class="country-dash-banner" style="display:none;">
        <div class="cdb-flag" id="cdbFlag"></div>
        <div>
            <div class="cdb-title" id="cdbTitle">Store Dashboard</div>
            <div class="cdb-subtitle" id="cdbSubtitle">Showing all countries</div>
        </div>
        <div class="cdb-switch">
            <a href="javascript:void(0)" onclick="setAdminCountry(null)" class="btn btn-outline btn-sm">← All Countries</a>
        </div>
    </div>

    <div class="stat-grid" id="statCards">
        <div class="stat-card"><div class="stat-icon primary">OR</div><div class="stat-value" id="totalOrders">—</div><div class="stat-label">Total Orders</div></div>
        <div class="stat-card"><div class="stat-icon success">RV</div><div class="stat-value" id="totalRevenue">—</div><div class="stat-label">Total Revenue</div></div>
        <div class="stat-card"><div class="stat-icon warning">PR</div><div class="stat-value" id="totalProducts">—</div><div class="stat-label" id="productsLabel">Products</div></div>
        <div class="stat-card"><div class="stat-icon danger">CU</div><div class="stat-value" id="totalCustomers">—</div><div class="stat-label">Customers</div></div>
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
        <div class="card">
            <div class="card-header"><h3>Revenue (Last 7 Days)</h3></div>
            <div class="card-body"><div class="chart-container"><canvas id="revenueChart"></canvas></div></div>
        </div>
        <div class="card">
            <div class="card-header"><h3>Order Status</h3></div>
            <div class="card-body"><div class="chart-container"><canvas id="statusChart"></canvas></div></div>
        </div>
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
        <div class="card">
            <div class="card-header"><h3>Recent Orders</h3><a href="orders.php" class="btn btn-outline btn-sm">View All</a></div>
            <div class="card-body" style="padding:0;"><table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody id="recentOrders"></tbody></table></div>
        </div>
        <div class="card">
            <div class="card-header"><h3 id="topProductsTitle">Top Products</h3></div>
            <div class="card-body" id="topProducts"></div>
        </div>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);">
        <div class="stat-card"><div class="stat-icon warning">TD</div><div class="stat-value" id="todayOrders">—</div><div class="stat-label">Today's Orders</div></div>
        <div class="stat-card"><div class="stat-icon danger">LS</div><div class="stat-value" id="lowStock">—</div><div class="stat-label" id="lowStockLabel">Low Stock Items</div></div>
        <div class="stat-card"><div class="stat-icon primary">OS</div><div class="stat-value" id="outOfStock">—</div><div class="stat-label" id="oosLabel">Out of Stock</div></div>
    </div>
</div>

<script>
async function loadDashboard() {
    const c = getAdminCountry();

    // Update country banner
    const banner = document.getElementById('countryDashBanner');
    if (c) {
        document.getElementById('cdbFlag').textContent = c.flag || '🌍';
        document.getElementById('cdbTitle').textContent = c.name + ' Store Dashboard';
        document.getElementById('cdbSubtitle').textContent = 'Showing data for ' + c.name + ' only';
        document.getElementById('productsLabel').textContent = 'Products in ' + c.name;
        document.getElementById('lowStockLabel').textContent = 'Low Stock (' + c.name + ')';
        document.getElementById('oosLabel').textContent = 'Out of Stock (' + c.name + ')';
        document.getElementById('topProductsTitle').textContent = 'Top Products — ' + c.name;
        banner.style.display = 'flex';
    } else {
        banner.style.display = 'none';
        document.getElementById('productsLabel').textContent = 'Products';
        document.getElementById('lowStockLabel').textContent = 'Low Stock Items';
        document.getElementById('oosLabel').textContent = 'Out of Stock';
        document.getElementById('topProductsTitle').textContent = 'Top Products';
    }

    try {
        const url = '/dashboard/stats' + (c ? '?country_id=' + c.id : '');
        const res = await api(url);
        const d = res.data;

        document.getElementById('totalOrders').textContent = d.total.orders;
        document.getElementById('totalRevenue').textContent = formatCurrency(d.total.revenue);
        document.getElementById('totalProducts').textContent = d.total.products;
        document.getElementById('totalCustomers').textContent = d.total.customers;
        document.getElementById('todayOrders').textContent = d.today.orders;
        document.getElementById('lowStock').textContent = d.stock.low_stock;
        document.getElementById('outOfStock').textContent = d.stock.out_of_stock;

        new Chart(document.getElementById('revenueChart'), {
            type: 'line',
            data: {
                labels: d.revenue_chart.map(r => new Date(r.date).toLocaleDateString('en-IN', {day:'2-digit',month:'short'})),
                datasets: [{ label: 'Revenue', data: d.revenue_chart.map(r => r.revenue), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 }]
            },
            options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,grid:{color:'#2d3148'},ticks:{color:'#94a3b8'}},x:{grid:{display:false},ticks:{color:'#94a3b8'}}} }
        });

        const statusColors = {pending:'#f59e0b',confirmed:'#3b82f6',processing:'#6366f1',shipped:'#8b5cf6',delivered:'#10b981',cancelled:'#ef4444',returned:'#f97316'};
        new Chart(document.getElementById('statusChart'), {
            type: 'doughnut',
            data: { labels: d.status_breakdown.map(s => s.status), datasets: [{data: d.status_breakdown.map(s => s.count), backgroundColor: d.status_breakdown.map(s => statusColors[s.status] || '#6366f1'), borderWidth: 0}] },
            options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',padding:12}}} }
        });

        document.getElementById('recentOrders').innerHTML = d.recent_orders.map(o => `
            <tr>
                <td><strong>${o.order_number}</strong></td>
                <td>${o.customer_name}</td>
                <td>${formatCurrency(o.total)}</td>
                <td>${getStatusBadge(o.status)}</td>
                <td style="color:var(--admin-text-dim)">${formatDate(o.created_at)}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--admin-text-muted)">No orders yet</td></tr>';

        document.getElementById('topProducts').innerHTML = d.top_products.map(p => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--admin-border)">
                <img src="${imgUrl(p.primary_image)}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;background:var(--admin-surface-2)">
                <div style="flex:1"><div style="font-size:14px;font-weight:500">${p.name}</div><div style="font-size:12px;color:var(--admin-text-muted)">${p.sales_count} sold</div></div>
            </div>
        `).join('') || '<p style="color:var(--admin-text-muted)">No products yet</p>';
    } catch(e) { console.error('Dashboard load error:', e); }
}
(async function() {
    if (typeof checkAuth === 'function') checkAuth();
    const token = localStorage.getItem('admin_token') ||
        (document.cookie.match(/admin_token=([^;]+)/) || [])[1] || '';
    if (!token) { setTimeout(() => { if(!localStorage.getItem('admin_token')) window.location.href='/admin/index.php'; }, 500); return; }
    loadDashboard();
})();
</script>

<?php include 'includes/footer.php'; ?>
