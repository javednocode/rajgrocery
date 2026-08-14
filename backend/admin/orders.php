<?php $pageTitle = 'Orders'; include 'includes/header.php'; ?>
<style>
.inline-status-select {
    appearance: none;
    -webkit-appearance: none;
    border: 1.5px solid transparent;
    border-radius: 20px;
    padding: 3px 22px 3px 10px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    background-repeat: no-repeat;
    background-position: right 6px center;
    background-size: 10px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E");
    transition: box-shadow 0.15s, border-color 0.15s;
    min-width: 90px;
    max-width: 110px;
    outline: none;
}
.inline-status-select:hover { box-shadow: 0 0 0 2px rgba(0,0,0,0.08); }
.inline-status-select:focus { box-shadow: 0 0 0 2.5px rgba(34,197,94,0.35); border-color: #22c55e; }
/* Payment status colours */
.inline-status-select.pay-pending  { background-color: #fff7ed; color: #c2410c; border-color: #fed7aa; }
.inline-status-select.pay-paid     { background-color: #f0fdf4; color: #15803d; border-color: #86efac; }
.inline-status-select.pay-failed   { background-color: #fef2f2; color: #b91c1c; border-color: #fca5a5; }
.inline-status-select.pay-refunded { background-color: #eff6ff; color: #1d4ed8; border-color: #93c5fd; }
/* Order status colours */
.inline-status-select.ord-pending    { background-color: #fff7ed; color: #c2410c; border-color: #fed7aa; }
.inline-status-select.ord-confirmed  { background-color: #eff6ff; color: #1d4ed8; border-color: #93c5fd; }
.inline-status-select.ord-processing { background-color: #faf5ff; color: #7e22ce; border-color: #d8b4fe; }
.inline-status-select.ord-shipped    { background-color: #ecfeff; color: #0e7490; border-color: #67e8f9; }
.inline-status-select.ord-delivered  { background-color: #f0fdf4; color: #15803d; border-color: #86efac; }
.inline-status-select.ord-cancelled  { background-color: #fef2f2; color: #b91c1c; border-color: #fca5a5; }
.inline-status-select.updating { opacity: 0.55; pointer-events: none; }
</style>

<div class="toolbar" style="gap:10px;flex-wrap:wrap;">
    <div class="search-box"><span class="search-icon"></span><input type="text" id="searchInput" placeholder="Search orders..." oninput="loadOrders()"></div>
    <select id="statusFilter" class="form-control" style="width:180px;" onchange="loadOrders()">
        <option value="">All Status</option>
        <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
        <option value="processing">Processing</option><option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
    </select>
    <button id="trashTabBtn" class="btn btn-outline btn-sm" onclick="toggleTrashView()" style="margin-left:auto;display:flex;align-items:center;gap:6px;">
        🗑️ Recycle Bin <span id="trashCount" style="background:#dc2626;color:#fff;border-radius:12px;padding:1px 7px;font-size:11px;display:none;">0</span>
    </button>
</div>

<!-- Orders Panel -->
<div id="ordersPanel">
<div class="card"><div class="card-body" style="padding:0;">
    <table class="data-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Address</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody id="ordersList"></tbody>
    </table>
</div></div>
<div id="pagination" class="pagination"></div>
</div>

<!-- Recycle Bin Panel -->
<div id="trashPanel" style="display:none;">
<div class="card">
    <div class="card-body" style="padding:16px 20px 8px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <span style="font-size:22px;">🗑️</span>
            <div>
                <div style="font-size:16px;font-weight:700;color:var(--admin-text);">Recycle Bin</div>
                <div style="font-size:12px;color:var(--admin-text-muted);">Deleted orders — restore or permanently remove</div>
            </div>
        </div>
    </div>
    <div class="card-body" style="padding:0;">
        <table class="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Order Date</th><th style="color:#dc2626;">Deleted At</th><th>Actions</th></tr></thead>
            <tbody id="trashBody"><tr><td colspan="7" style="text-align:center;padding:40px;color:var(--admin-text-muted);">Loading...</td></tr></tbody>
        </table>
    </div>
</div>
</div>


<!-- Order Detail Modal -->
<div class="modal-overlay" id="orderModal">
    <div class="modal" style="max-width:700px;">
        <div class="modal-header"><h3 id="orderTitle">Order Details</h3><button class="btn btn-icon" onclick="document.getElementById('orderModal').classList.remove('show')"></button></div>
        <div class="modal-body" id="orderDetail"></div>
        <div class="modal-footer">
            <button class="btn btn-outline" id="invoiceBtn" onclick="downloadInvoice()">Download Invoice</button>
            <button class="btn btn-outline" id="emailBtn" onclick="sendOrderEmails()">Send Emails</button>
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
                <td><strong>${escapeHtml(o.order_number)}</strong></td>
                <td>${escapeHtml(o.customer_name)}<div style="font-size:12px;color:var(--admin-text-muted)">${escapeHtml(o.customer_phone || '')}</div></td>
                <td style="max-width:200px;">${formatShippingAddr(o.shipping_address)}</td>
                <td><strong>${formatCurrency(o.total)}</strong></td>
                <td onclick="event.stopPropagation()">
                    <select class="inline-status-select pay-${o.payment_status}"
                            data-order-id="${o.id}"
                            data-has-invoice="${o.has_invoice ? '1' : '0'}"
                            onchange="updatePaymentStatusInline(${o.id}, this.value, this)"
                            onclick="event.stopPropagation()">
                        <option value="pending"  ${o.payment_status==='pending'  ? 'selected' : ''}>Pending</option>
                        <option value="paid"     ${o.payment_status==='paid'     ? 'selected' : ''}>Paid</option>
                        <option value="failed"   ${o.payment_status==='failed'   ? 'selected' : ''}>Failed</option>
                        <option value="refunded" ${o.payment_status==='refunded' ? 'selected' : ''}>Refunded</option>
                    </select>
                </td>
                <td onclick="event.stopPropagation()">
                    <select class="inline-status-select ord-${o.status}"
                            data-order-id="${o.id}"
                            onchange="updateOrderStatusInline(${o.id}, this.value, this)"
                            onclick="event.stopPropagation()">
                        <option value="pending"    ${o.status==='pending'    ? 'selected' : ''}>Pending</option>
                        <option value="confirmed"  ${o.status==='confirmed'  ? 'selected' : ''}>Confirmed</option>
                        <option value="processing" ${o.status==='processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped"    ${o.status==='shipped'    ? 'selected' : ''}>Shipped</option>
                        <option value="delivered"  ${o.status==='delivered'  ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled"  ${o.status==='cancelled'  ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td style="color:var(--admin-text-dim)">${formatDate(o.created_at)}</td>
                <td onclick="event.stopPropagation()">
                    <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start;">
                        <div style="display:flex;gap:6px;align-items:center;">
                            <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();viewOrder(${o.id})">View</button>
                            <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();downloadInvoice(${o.id}, this)">${o.has_invoice ? 'Reprint' : 'Print'} Invoice</button>
                            <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;" onclick="event.stopPropagation();deleteOrder(${o.id},'${escapeJs(o.order_number)}')">🗑️</button>
                        </div>
                        <div style="display:flex;gap:6px;align-items:center;">
                            ${o.has_invoice ? '<span class="has-invoice-badge" style="font-size:11px;color:var(--admin-success);font-weight:600;display:inline-flex;align-items:center;gap:3px;">✓ Printed</span>' : ''}
                        </div>
                    </div>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No orders found</td></tr>';
    } catch(e) {}
}

async function viewOrder(id) {
    currentOrderId = id;
    try {
        const res = await api(`/orders/${id}`);
        const o = res.data;
        document.getElementById('orderTitle').textContent = `Order ${o.order_number}`;
        document.getElementById('updateStatus').value = o.status;
        const addr = formatAddress(o.shipping_address);
        document.getElementById('orderDetail').innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                <div><strong>Customer:</strong> ${escapeHtml(o.customer_name)}<br><strong>Phone:</strong> ${escapeHtml(o.customer_phone)}<br><strong>Email:</strong> ${escapeHtml(o.customer_email || '—')}</div>
                <div><strong>Payment:</strong> ${escapeHtml((o.payment_method || 'cod').toUpperCase())} ${getStatusBadge(o.payment_status)}<br><strong>Date:</strong> ${formatDate(o.created_at)}</div>
            </div>
            <div style="margin-bottom:16px;"><strong>Address:</strong> ${escapeHtml(addr)}</div>
            <table class="data-table"><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead><tbody>
            ${o.items.map(i => `<tr><td><div class="product-cell"><img src="${imgUrl(i.product_image)}"><span>${escapeHtml(i.product_name)}</span></div></td><td>${formatCurrency(i.price)}</td><td>${i.quantity}</td><td>${formatCurrency(i.total)}</td></tr>`).join('')}
            </tbody></table>
            <div style="text-align:right;margin-top:16px;font-size:14px;">
                <div>Subtotal: ${formatCurrency(o.subtotal)}</div>
                ${o.discount>0?`<div style="color:var(--admin-success)">Discount: -${formatCurrency(o.discount)}</div>`:''}
                <div>Shipping: ${formatCurrency(o.shipping_charge)}</div>
                <div>Tax: ${formatCurrency(o.tax)}</div>
                <div style="font-size:18px;font-weight:700;margin-top:8px;">Total: ${formatCurrency(o.total)}</div>
            </div>
            ${(()=>{
                if (!o.notes) return '';
                // Try parse JSON notes
                let notesData = null;
                try { notesData = JSON.parse(o.notes); } catch(e) {}
                let html = '';
                // Customer note
                const custNote = notesData ? (notesData.customer_note || '') : o.notes;
                if (custNote && custNote.trim()) {
                    html += `<div style="margin-top:16px;padding:14px 16px;background:#fffbeb;border:1.5px solid #f59e0b;border-radius:8px;font-size:13px;">
                        <span style="font-weight:700;color:#92400e;">📝 Customer Note:</span>
                        <span style="color:#78350f;margin-left:6px;">${escapeHtml(custNote)}</span>
                    </div>`;
                }
                // Payment proof screenshot
                if (notesData && notesData.payment_proof) {
                    const proofUrl = notesData.payment_proof;
                    const uploadedAt = notesData.payment_proof_uploaded_at ? `Uploaded: ${notesData.payment_proof_uploaded_at}` : '';
                    html += `<div style="margin-top:14px;padding:14px 16px;background:#f0fdf4;border:1.5px solid #16a34a;border-radius:8px;">
                        <div style="font-weight:700;color:#15803d;margin-bottom:10px;font-size:13px;">📎 Payment Proof Screenshot</div>
                        <a href="${escapeHtml(proofUrl)}" target="_blank" title="Click to view full size">
                            <img src="${escapeHtml(proofUrl)}"
                                 style="max-width:100%;max-height:320px;object-fit:contain;border-radius:6px;border:1px solid #86efac;display:block;cursor:zoom-in;"
                                 onerror="this.parentElement.parentElement.innerHTML='<span style=color:#dc2626>⚠️ Image not found on server</span>'"
                                 alt="Payment Proof">
                        </a>
                        ${uploadedAt ? `<div style="font-size:11px;color:#166534;margin-top:6px;">${escapeHtml(uploadedAt)}</div>` : ''}
                    </div>`;
                }
                return html;
            })()}
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

/* ── Inline Payment Status Dropdown ───────────────────────── */
async function updatePaymentStatusInline(id, payStatus, el) {
    const prev = el.dataset.prev || el.value;
    el.dataset.prev = payStatus;
    el.classList.add('updating');
    try {
        await api(`/orders/${id}`, 'PUT', { payment_status: payStatus });
        // Re-colour the select
        el.className = el.className.replace(/\bpay-\S+/g, '') + ' pay-' + payStatus;
        el.classList.remove('updating');
        showAlert('Payment status updated!', 'success');

        // Auto-regenerate invoice if one already exists
        const hasInvoice = el.dataset.hasInvoice === '1';
        if (hasInvoice) {
            try {
                await api(`/orders/${id}/invoice`);
                showAlert('Invoice regenerated with new payment status.', 'success');
            } catch(e) { /* silent */ }
        }
    } catch(e) {
        el.value = prev;
        el.dataset.prev = prev;
        el.classList.remove('updating');
        showAlert('Failed to update payment status', 'danger');
    }
}

/* ── Inline Order Status Dropdown ─────────────────────────── */
async function updateOrderStatusInline(id, status, el) {
    const prev = el.dataset.prev || el.value;
    el.dataset.prev = status;
    el.classList.add('updating');
    try {
        await api(`/orders/${id}`, 'PUT', { status });
        el.className = el.className.replace(/\bord-\S+/g, '') + ' ord-' + status;
        el.classList.remove('updating');
        showAlert('Order status updated!', 'success');
    } catch(e) {
        el.value = prev;
        el.dataset.prev = prev;
        el.classList.remove('updating');
        showAlert('Failed to update order status', 'danger');
    }
}

async function deleteOrder(id = currentOrderId, orderNumber = '') {
    if (!id) return;
    const label = orderNumber ? ` #${orderNumber}` : '';
    if (!confirm(`Move order${label} to Recycle Bin?\n\nYou can restore it later from the Recycle Bin tab.`)) return;

    try {
        await api(`/orders/${id}`, 'DELETE');
        showAlert('🗑️ Order moved to Recycle Bin', 'success');
        document.getElementById('orderModal').classList.remove('show');
        currentOrderId = null;
        loadOrders();
    } catch(e) {}
}

async function downloadInvoice(id = currentOrderId, btn = document.getElementById('invoiceBtn')) {
    if (!id) return;
    const original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Opening...'; }

    try {
        // Get the admin token for authentication
        const token = localStorage.getItem('admin_token') || getCookie('admin_token') || '';
        // Build the print URL — opens as authenticated HTML page
        const printUrl = `/api/orders/${id}/print-invoice`;

        // Open popup window — Chrome will render the HTML invoice and auto-trigger print
        const popup = window.open(
            printUrl,
            `invoice_${id}`,
            'width=860,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no'
        );

        if (!popup) {
            // Popup blocked — fallback: open in new tab
            window.open(printUrl, '_blank');
        }

        // Mark as printed — refresh list after short delay
        setTimeout(() => loadOrders(), 1500);

    } catch(e) {
        showAlert('Could not open invoice', 'danger');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = original; }
    }
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : '';
}

async function sendOrderEmails() {
    if (!currentOrderId) return;
    const btn = document.getElementById('emailBtn');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        const res = await api(`/orders/${currentOrderId}/send-emails`, 'POST');
        const customer = res.data?.customer;
        const admin = res.data?.admin;
        const messages = [];
        messages.push(`Customer: ${customer?.sent ? 'sent' : (customer?.error || customer?.reason || 'skipped')}`);
        messages.push(`Admin: ${admin?.sent ? 'sent' : (admin?.error || admin?.reason || 'skipped')}`);
        showAlert(messages.join(' | '), customer?.sent || admin?.sent ? 'success' : 'danger');
    } catch(e) {
    } finally {
        btn.disabled = false;
        btn.textContent = original;
    }
}

/* ── formatShippingAddr: multi-line address for the table column ── */
function formatShippingAddr(raw) {
    let addr = raw;
    if (typeof raw === 'string') {
        try { addr = JSON.parse(raw); } catch(e) { addr = raw; }
    }

    let line1 = '', line2 = '', cityLine = '', country = '';

    if (addr && typeof addr === 'object') {
        line1    = String(addr.address_line1 || addr.street || addr.address || '').trim();
        line2    = String(addr.address_line2 || '').trim();
        const city    = String(addr.city || addr.town || '').trim();
        const county  = String(addr.county || addr.state || '').trim();
        const code    = String(addr.eircode || addr.postcode || addr.pincode || '').trim();
        country  = String(addr.country || '').trim();
        cityLine = [city, county, code].filter(Boolean).join(', ');
    } else {
        // Plain string fallback — just show as-is, cleaned up
        const clean = String(addr || '')
            .replace(/\bundefined\b/gi, '')
            .replace(/\s*,\s*,/g, ',')
            .replace(/^[\s,]+|[\s,]+$/g, '');
        return clean
            ? `<span style="font-size:12px;color:var(--admin-text);line-height:1.5;">${escapeHtml(clean)}</span>`
            : '<span style="color:var(--admin-text-muted)">—</span>';
    }

    const rows = [line1, line2, cityLine, country].filter(Boolean);
    if (!rows.length) return '<span style="color:var(--admin-text-muted)">—</span>';

    return `<div style="font-size:12px;line-height:1.6;color:var(--admin-text);">`
        + rows.map((r, i) => {
            const style = i === 0
                ? 'font-weight:600;color:var(--admin-text);'
                : 'color:var(--admin-text-muted);';
            return `<div style="${style}">${escapeHtml(r)}</div>`;
        }).join('')
        + `</div>`;
}

function formatAddress(raw) {
    let addr = raw;
    if (typeof raw === 'string') {
        try { addr = JSON.parse(raw); } catch(e) { addr = raw; }
    }

    if (addr && typeof addr === 'object') {
        const parts = [
            addr.address_line1 || addr.street || addr.address,
            addr.address_line2,
            addr.city || addr.town,
            addr.county || addr.state,
            addr.eircode || addr.postcode || addr.pincode,
            addr.country
        ].map(v => String(v || '').trim()).filter(Boolean);
        return parts.join(', ') || '—';
    }

    return String(addr || '—')
        .replace(/\bundefined\b/gi, '')
        .replace(/\s*,\s*,/g, ',')
        .replace(/\s*-\s*$/g, '')
        .replace(/^[\s,]+|[\s,]+$/g, '') || '—';
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function escapeJs(value) {
    return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

loadOrders();
loadTrashCount();

/* ── Recycle Bin ────────────────────────────────────────── */
let trashViewActive = false;

function toggleTrashView() {
    trashViewActive = !trashViewActive;
    document.getElementById('ordersPanel').style.display = trashViewActive ? 'none' : '';
    document.getElementById('trashPanel').style.display  = trashViewActive ? '' : 'none';
    document.getElementById('trashTabBtn').style.background = trashViewActive ? '#fee2e2' : '';
    document.getElementById('trashTabBtn').style.color = trashViewActive ? '#dc2626' : '';
    if (trashViewActive) loadTrash();
}

async function loadTrashCount() {
    try {
        const res = await api('/orders/trash?per_page=1');
        const cnt = res.total || 0;
        const badge = document.getElementById('trashCount');
        badge.textContent = cnt;
        badge.style.display = cnt > 0 ? 'inline' : 'none';
    } catch(e) {}
}

async function loadTrash() {
    const tbody = document.getElementById('trashBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;">Loading...</td></tr>';
    try {
        const res = await api('/orders/trash?per_page=50');
        const orders = res.data || [];
        tbody.innerHTML = orders.map(o => `
            <tr>
                <td><strong>${escapeHtml(o.order_number)}</strong></td>
                <td>${escapeHtml(o.customer_name)}<br><span style="font-size:11px;color:var(--admin-text-muted)">${escapeHtml(o.customer_phone||'')}</span></td>
                <td>${formatCurrency(o.total)}</td>
                <td><span style="font-size:11px;">${escapeHtml(o.status)}</span></td>
                <td style="font-size:12px;color:var(--admin-text-muted)">${formatDate(o.created_at)}</td>
                <td style="font-size:12px;color:#dc2626;">${formatDate(o.deleted_at)}</td>
                <td onclick="event.stopPropagation()">
                    <div style="display:flex;gap:6px;">
                        <button class="btn btn-sm" style="background:#f0fdf4;color:#16a34a;border:1px solid #86efac;" onclick="restoreFromTrash(${o.id},'${escapeJs(o.order_number)}')">↩ Restore</button>
                        <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;" onclick="permanentDelete(${o.id},'${escapeJs(o.order_number)}')">🗑️ Delete Forever</button>
                    </div>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--admin-text-muted)">Recycle Bin is empty 🎉</td></tr>';
    } catch(e) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:red;">Failed to load recycle bin</td></tr>';
    }
}

async function restoreFromTrash(id, orderNumber = '') {
    if (!confirm(`Restore order #${orderNumber} back to active orders?`)) return;
    try {
        await api(`/orders/${id}/restore`, 'POST');
        showAlert(`✅ Order #${orderNumber} restored!`, 'success');
        loadTrash();
        loadTrashCount();
        loadOrders();
    } catch(e) { showAlert('Restore failed', 'danger'); }
}

async function permanentDelete(id, orderNumber = '') {
    if (!confirm(`Permanently delete order #${orderNumber}?\n\n⚠️ This CANNOT be undone!`)) return;
    try {
        await api(`/orders/${id}/permanent`, 'DELETE');
        showAlert(`Order #${orderNumber} permanently deleted`, 'success');
        loadTrash();
        loadTrashCount();
    } catch(e) { showAlert('Delete failed', 'danger'); }
}
</script>

<?php include 'includes/footer.php'; ?>
