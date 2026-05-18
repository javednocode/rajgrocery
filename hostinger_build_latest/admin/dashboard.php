<?php $pageTitle = 'Dashboard'; include 'includes/header.php'; ?>

<div id="dashboardContent">
    <div class="stat-grid" id="statCards">
        <div class="stat-card"><div class="stat-icon primary">📦</div><div class="stat-value" id="totalOrders">—</div><div class="stat-label">Total Orders</div></div>
        <div class="stat-card"><div class="stat-icon success">💰</div><div class="stat-value" id="totalRevenue">—</div><div class="stat-label">Total Revenue</div></div>
        <div class="stat-card"><div class="stat-icon warning">🛍️</div><div class="stat-value" id="totalProducts">—</div><div class="stat-label">Products</div></div>
        <div class="stat-card"><div class="stat-icon danger">👥</div><div class="stat-value" id="totalCustomers">—</div><div class="stat-label">Customers</div></div>
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
            <div class="card-header"><h3>Top Products</h3></div>
            <div class="card-body" id="topProducts"></div>
        </div>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);">
        <div class="stat-card"><div class="stat-icon warning">📋</div><div class="stat-value" id="todayOrders">—</div><div class="stat-label">Today's Orders</div></div>
        <div class="stat-card"><div class="stat-icon danger">⚠️</div><div class="stat-value" id="lowStock">—</div><div class="stat-label">Low Stock Items</div></div>
        <div class="stat-card"><div class="stat-icon primary">🚫</div><div class="stat-value" id="outOfStock">—</div><div class="stat-label">Out of Stock</div></div>
    </div>
</div>

<script>
async function loadDashboard() {
    try {
        const res = await api('/dashboard/stats');
        const d = res.data;
        
        document.getElementById('totalOrders').textContent = d.total.orders;
        document.getElementById('totalRevenue').textContent = formatCurrency(d.total.revenue);
        document.getElementById('totalProducts').textContent = d.total.products;
        document.getElementById('totalCustomers').textContent = d.total.customers;
        document.getElementById('todayOrders').textContent = d.today.orders;
        document.getElementById('lowStock').textContent = d.stock.low_stock;
        document.getElementById('outOfStock').textContent = d.stock.out_of_stock;

        // Revenue chart
        new Chart(document.getElementById('revenueChart'), {
            type: 'line',
            data: {
                labels: d.revenue_chart.map(r => new Date(r.date).toLocaleDateString('en-IN', {day:'2-digit',month:'short'})),
                datasets: [{
                    label: 'Revenue',
                    data: d.revenue_chart.map(r => r.revenue),
                    borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
                    fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4
                }]
            },
            options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,grid:{color:'#2d3148'},ticks:{color:'#94a3b8'}},x:{grid:{display:false},ticks:{color:'#94a3b8'}}} }
        });

        // Status chart
        const statusColors = {pending:'#f59e0b',confirmed:'#3b82f6',processing:'#6366f1',shipped:'#8b5cf6',delivered:'#10b981',cancelled:'#ef4444',returned:'#f97316'};
        new Chart(document.getElementById('statusChart'), {
            type: 'doughnut',
            data: {
                labels: d.status_breakdown.map(s => s.status),
                datasets: [{data: d.status_breakdown.map(s => s.count), backgroundColor: d.status_breakdown.map(s => statusColors[s.status] || '#6366f1'), borderWidth: 0}]
            },
            options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',padding:12}}} }
        });

        // Recent orders
        document.getElementById('recentOrders').innerHTML = d.recent_orders.map(o => `
            <tr>
                <td><strong>${o.order_number}</strong></td>
                <td>${o.customer_name}</td>
                <td>${formatCurrency(o.total)}</td>
                <td>${getStatusBadge(o.status)}</td>
                <td style="color:var(--admin-text-dim)">${formatDate(o.created_at)}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--admin-text-muted)">No orders yet</td></tr>';

        // Top products
        document.getElementById('topProducts').innerHTML = d.top_products.map(p => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--admin-border)">
                <img src="${imgUrl(p.primary_image)}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;background:var(--admin-surface-2)">
                <div style="flex:1"><div style="font-size:14px;font-weight:500">${p.name}</div><div style="font-size:12px;color:var(--admin-text-muted)">${p.sales_count} sold</div></div>
            </div>
        `).join('') || '<p style="color:var(--admin-text-muted)">No products yet</p>';
    } catch(e) { console.error('Dashboard load error:', e); }
}
loadDashboard();
</script>

<?php include 'includes/footer.php'; ?>
