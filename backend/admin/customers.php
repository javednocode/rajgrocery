<?php $pageTitle = 'Customers'; include 'includes/header.php'; ?>

<div class="toolbar">
    <div class="search-box"><span class="search-icon"></span><input type="text" id="searchInput" placeholder="Search customers..." oninput="loadCustomers()"></div>
</div>

<div class="card"><div class="card-body" style="padding:0;">
    <table class="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Joined</th></tr></thead>
        <tbody id="customersList"></tbody>
    </table>
</div></div>

<script>
async function loadCustomers() {
    const q = document.getElementById('searchInput').value;
    try {
        const res = await api(`/customers?q=${encodeURIComponent(q)}&per_page=50`);
        document.getElementById('customersList').innerHTML = res.data.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.email||'—'}</td>
                <td>${c.phone}</td>
                <td>${c.total_orders}</td>
                <td>${formatCurrency(c.total_spent)}</td>
                <td style="color:var(--admin-text-dim)">${formatDate(c.created_at)}</td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No customers yet</td></tr>';
    } catch(e) {}
}
loadCustomers();
</script>

<?php include 'includes/footer.php'; ?>
