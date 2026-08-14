<?php $pageTitle = 'Customer Profile'; include 'includes/header.php'; ?>

<style>
.cd-head { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:16px; }
.cd-name { font-size:20px; font-weight:800; margin:0; }
.cd-badges { display:flex; gap:8px; margin-top:6px; flex-wrap:wrap; }
.cd-grid { display:grid; grid-template-columns: 1.3fr 1fr; gap:16px; align-items:start; }
.cd-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
.cd-stat { border:1px solid var(--admin-border); background:var(--admin-bg); border-radius:10px; padding:14px; }
.cd-stat strong { display:block; font-size:20px; }
.cd-stat span { display:block; color:var(--admin-text-muted); font-size:11px; margin-top:3px; text-transform:uppercase; letter-spacing:.04em; }
.cd-field-row { display:flex; padding:9px 0; border-bottom:1px solid var(--admin-border); font-size:13px; }
.cd-field-row:last-child { border-bottom:none; }
.cd-field-row label { flex:0 0 160px; color:var(--admin-text-muted); font-weight:600; }
.cd-field-row div { flex:1; }
.cd-addr-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.cd-addr-empty { color:var(--admin-text-muted); font-size:12.5px; font-style:italic; }
@media(max-width:900px){ .cd-grid,.cd-addr-grid{grid-template-columns:1fr;} }
</style>

<div class="toolbar">
  <a href="customers.php" class="btn btn-outline btn-sm">← Back to Customers</a>
</div>

<div id="loadingState" style="padding:40px;text-align:center;color:var(--admin-text-muted);">Loading customer…</div>
<div id="errorState" style="display:none;padding:40px;text-align:center;color:var(--admin-danger);"></div>

<div id="content" style="display:none;">
  <div class="card">
    <div class="card-body">
      <div class="cd-head">
        <div>
          <h2 class="cd-name" id="custName">—</h2>
          <div class="cd-badges" id="custBadges"></div>
        </div>
      </div>

      <div class="cd-grid">
        <div>
          <h4 style="font-size:13px;margin-bottom:6px;">Personal Details</h4>
          <div id="personalRows"></div>
        </div>
        <div class="cd-stats">
          <div class="cd-stat"><strong id="statOrders">0</strong><span>Total Orders</span></div>
          <div class="cd-stat"><strong id="statSpend">—</strong><span>Lifetime Spend</span></div>
          <div class="cd-stat"><strong id="statLastOrder">—</strong><span>Last Order Date</span></div>
          <div class="cd-stat"><strong id="statStatus">—</strong><span>Account Status</span></div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:16px;">
    <div class="card-body">
      <div class="cd-addr-grid">
        <div>
          <h4 style="font-size:13px;margin-bottom:8px;">Billing Address</h4>
          <div id="billingAddr"></div>
        </div>
        <div>
          <h4 style="font-size:13px;margin-bottom:8px;">Shipping Address</h4>
          <div id="shippingAddr"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Password Reset -->
  <div class="card" style="margin-top:16px;">
    <div class="card-body">
      <h4 style="font-size:13px;margin-bottom:12px;">🔑 Reset Customer Password</h4>
      <div id="resetPwForm">
        <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <label style="display:block;font-size:11px;font-weight:600;color:var(--admin-text-muted);margin-bottom:4px;">New Password (min 8 chars)</label>
            <input type="password" id="resetPwInput" class="form-control" placeholder="Enter new password" minlength="8" style="font-size:13px;" />
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="resetPwBtn" onclick="resetPassword()">Reset Password</button>
        </div>
        <div id="resetPwMsg" style="margin-top:8px;font-size:12.5px;display:none;"></div>
      </div>
    </div>
  </div>

  <div class="card" id="importCard" style="display:none;margin-top:16px;">
    <div class="card-body" style="font-size:12.5px;color:var(--admin-text-muted);">
      Imported via <a id="importJobLink" href="customer-import.php">customer import</a> on <span id="importDate"></span>.
    </div>
  </div>
</div>

<script>
const customerId = new URLSearchParams(window.location.search).get('id');

function addrBlock(c, prefix, label) {
  const lines = [c[prefix + '_address'], [c[prefix + '_city'], c[prefix + '_state'], c[prefix + '_postal_code']].filter(Boolean).join(', '), c[prefix + '_country']]
    .filter(v => v && String(v).trim() !== '');
  if (!lines.length) return `<div class="cd-addr-empty">No ${label.toLowerCase()} on file.</div>`;
  return lines.map(l => `<div>${escHtml(l)}</div>`).join('');
}

function row(label, value) {
  return `<div class="cd-field-row"><label>${label}</label><div>${value ? escHtml(value) : '<span class="cd-addr-empty">—</span>'}</div></div>`;
}

async function load() {
  if (!customerId) { showError('No customer specified.'); return; }
  try {
    const res = await api(`/customers/${customerId}`);
    if (!res.success) { showError(res.message || 'Customer not found'); return; }
    render(res.data);
  } catch (e) {
    showError('Could not load customer: ' + e.message);
  }
}

function showError(msg) {
  document.getElementById('loadingState').style.display = 'none';
  const el = document.getElementById('errorState');
  el.textContent = msg; el.style.display = 'block';
}

function render(data) {
  const c = data.customer, stats = data.stats;
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('content').style.display = 'block';

  document.getElementById('custName').textContent = c.name || '(no name)';
  document.getElementById('custBadges').innerHTML = [
    `<span class="badge badge-${c.is_active == 1 ? 'success' : 'danger'}">${c.is_active == 1 ? 'Active' : 'Inactive'}</span>`,
    c.source === 'csv_import'
      ? '<span class="badge badge-info">Imported</span>'
      : '<span class="badge badge-primary">Storefront Signup</span>',
  ].join(' ');

  document.getElementById('personalRows').innerHTML = [
    row('First Name', c.first_name),
    row('Last Name', c.last_name),
    row('Email', c.email),
    row('Phone', c.phone),
    row('Company', c.company),
    row('Account Created', c.account_created_at ? formatDate(c.account_created_at) : null),
    row('Added to System', c.created_at ? formatDate(c.created_at) : null),
  ].join('');

  document.getElementById('statOrders').textContent = stats.total_orders;
  document.getElementById('statSpend').textContent = formatCurrency(stats.lifetime_spend || 0);
  document.getElementById('statLastOrder').textContent = stats.last_order_date ? formatDate(stats.last_order_date) : '—';
  document.getElementById('statStatus').textContent = c.is_active == 1 ? 'Active' : 'Inactive';

  document.getElementById('billingAddr').innerHTML = addrBlock(c, 'billing', 'Billing');
  document.getElementById('shippingAddr').innerHTML = addrBlock(c, 'shipping', 'Shipping');

  if (data.import_job) {
    document.getElementById('importCard').style.display = 'block';
    document.getElementById('importDate').textContent = formatDate(data.import_job.created_at);
  }
}

function escHtml(s) { return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

async function resetPassword() {
  const pw = document.getElementById('resetPwInput').value.trim();
  const msgEl = document.getElementById('resetPwMsg');
  if (pw.length < 8) {
    msgEl.style.display = 'block';
    msgEl.style.color = 'var(--admin-danger)';
    msgEl.textContent = 'Password must be at least 8 characters.';
    return;
  }
  const btn = document.getElementById('resetPwBtn');
  btn.disabled = true;
  btn.textContent = 'Resetting…';
  msgEl.style.display = 'none';
  try {
    const res = await api(`/customers/${customerId}/password`, 'PUT', { new_password: pw });
    msgEl.style.display = 'block';
    if (res.success) {
      msgEl.style.color = 'var(--admin-success, #16a34a)';
      msgEl.textContent = '✅ ' + (res.message || 'Password reset successfully.');
      document.getElementById('resetPwInput').value = '';
    } else {
      msgEl.style.color = 'var(--admin-danger)';
      msgEl.textContent = '❌ ' + (res.message || 'Failed to reset password.');
    }
  } catch (e) {
    msgEl.style.display = 'block';
    msgEl.style.color = 'var(--admin-danger)';
    msgEl.textContent = '❌ Error: ' + e.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Reset Password';
  }
}

load();
</script>

<?php include 'includes/footer.php'; ?>
