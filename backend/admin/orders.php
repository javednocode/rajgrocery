<?php $pageTitle = 'Orders'; include 'includes/header.php'; ?>

<div class="toolbar">
    <div class="search-box"><span class="search-icon">🔍</span><input type="text" id="searchInput" placeholder="Search orders..." oninput="loadOrders()"></div>
    <select id="statusFilter" class="form-control" style="width:180px;" onchange="loadOrders()">
        <option value="">All Status</option>
        <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
        <option value="processing">Processing</option><option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
    </select>
</div>

<div class="card"><div class="card-body" style="padding:0;">
    <table class="data-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody id="ordersList"></tbody>
    </table>
</div></div>
<div id="pagination" class="pagination"></div>

<!-- Order Detail Modal -->
<div class="modal-overlay" id="orderModal">
    <div class="modal" style="max-width:700px;">
        <div class="modal-header"><h3 id="orderTitle">Order Details</h3><button class="btn btn-icon" onclick="document.getElementById('orderModal').classList.remove('show')">✕</button></div>
        <div class="modal-body" id="orderDetail"></div>
        <div class="modal-footer">
            <select id="updateStatus" class="form-control" style="width:180px;">
                <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option><option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
            </select>
            <button class="btn btn-primary" onclick="updateOrderStatus()">Update Status</button>
        </div>
    </div>
</div>

<script>
let currentOrderId = null;
async function loadOrders(page = 1) {
    const q = document.getElementById('searchInput').value;
    const status = document.getElementById('statusFilter').value;
    try {
        const res = await api(`/orders?page=${page}&per_page=15&q=${encodeURIComponent(q)}&status=${status}`);
        document.getElementById('ordersList').innerHTML = res.data.map(o => `
            <tr onclick="viewOrder(${o.id})" style="cursor:pointer">
                <td><strong>${o.order_number}</strong></td>
                <td>${o.customer_name}<div style="font-size:12px;color:var(--admin-text-muted)">${o.customer_phone}</div></td>
                <td>${o.item_count} items</td>
                <td><strong>${formatCurrency(o.total)}</strong></td>
                <td>${getStatusBadge(o.payment_status)}</td>
                <td>${getStatusBadge(o.status)}</td>
                <td style="color:var(--admin-text-dim)">${formatDate(o.created_at)}</td>
                <td><button class="btn btn-outline btn-sm" onclick="event.stopPropagation();viewOrder(${o.id})">View</button></td>
            </tr>
        `).join('') || '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No orders found</td></tr>';
    } catch(e) {}
}

async function viewOrder(id) {
    currentOrderId = id;
    try {
        const res = await api(`/orders/${id}`);
        const o = res.data;
        document.getElementById('orderTitle').textContent = `Order ${o.order_number}`;
        document.getElementById('updateStatus').value = o.status;
        let addr = o.shipping_address;
        try { addr = JSON.parse(addr); addr = `${addr.address_line1}, ${addr.city}, ${addr.state} - ${addr.pincode}`; } catch(e) {}
        document.getElementById('orderDetail').innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                <div><strong>Customer:</strong> ${o.customer_name}<br><strong>Phone:</strong> ${o.customer_phone}<br><strong>Email:</strong> ${o.customer_email||'—'}</div>
                <div><strong>Payment:</strong> ${o.payment_method?.toUpperCase()} ${getStatusBadge(o.payment_status)}<br><strong>Date:</strong> ${formatDate(o.created_at)}</div>
            </div>
            <div style="margin-bottom:16px;"><strong>Address:</strong> ${addr}</div>
            <table class="data-table"><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead><tbody>
            ${o.items.map(i => `<tr><td><div class="product-cell"><img src="../${i.product_image||'uploads/placeholder.png'}"><span>${i.product_name}</span></div></td><td>${formatCurrency(i.price)}</td><td>${i.quantity}</td><td>${formatCurrency(i.total)}</td></tr>`).join('')}
            </tbody></table>
            <div style="text-align:right;margin-top:16px;font-size:14px;">
                <div>Subtotal: ${formatCurrency(o.subtotal)}</div>
                ${o.discount>0?`<div style="color:var(--admin-success)">Discount: -${formatCurrency(o.discount)}</div>`:''}
                <div>Shipping: ${formatCurrency(o.shipping_charge)}</div>
                <div>Tax: ${formatCurrency(o.tax)}</div>
                <div style="font-size:18px;font-weight:700;margin-top:8px;">Total: ${formatCurrency(o.total)}</div>
            </div>
            ${o.notes?`<div style="margin-top:16px;padding:12px;background:var(--admin-bg);border-radius:8px;font-size:13px;"><strong>Notes:</strong> ${o.notes}</div>`:''}
        `;
        document.getElementById('orderModal').classList.add('show');
    } catch(e) {}
}

async function updateOrderStatus() {
    if (!currentOrderId) return;
    const status = document.getElementById('updateStatus').value;
    try {
        await api(`/orders/${currentOrderId}`, 'PUT', { status });
        showAlert('Order status updated!');
        document.getElementById('orderModal').classList.remove('show');
        loadOrders();
    } catch(e) {}
}

loadOrders();
</script>

<?php include 'includes/footer.php'; ?>
