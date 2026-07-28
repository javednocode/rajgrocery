<?php
/**
 * Admin Payments Configuration
 * Enable/disable gateways, enter API keys, toggle test mode.
 */
$pageTitle = 'Payment Settings';
include 'includes/header.php';
?>

<div style="max-width:820px;">

<div class="card" style="margin-bottom:20px;">
  <div class="card-header">
    <h3>Payment Gateways</h3>
    <small style="color:var(--admin-muted)">Configure which payment methods are available at checkout. No gateway is ever hardcoded.</small>
  </div>
</div>

<div id="gatewayAlert" style="display:none;padding:12px 16px;border-radius:10px;margin-bottom:16px;font-size:14px;font-weight:500;"></div>
<div id="gatewayCards">
  <div style="text-align:center;padding:40px;color:var(--admin-muted);">Loading gateways...</div>
</div>

<!-- ── Edit Modal ── -->
<div id="editModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:999;align-items:center;justify-content:center;overflow-y:auto;padding:20px 0;">
  <div style="background:var(--admin-surface);border-radius:16px;padding:32px;width:520px;max-width:95vw;max-height:90vh;overflow-y:auto;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h3 style="margin:0;" id="editModalTitle">Configure Gateway</h3>
      <button onclick="closeEdit()" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--admin-muted);">×</button>
    </div>
    <div id="editModalBody"></div>
    <div style="display:flex;gap:8px;margin-top:20px;">
      <button class="btn btn-primary" onclick="saveGateway()">Save Configuration</button>
      <button class="btn btn-outline" onclick="closeEdit()">Cancel</button>
    </div>
  </div>
</div>
</div>

<script>
const GATEWAY_FIELDS = {
  cod: [],
  stripe: [
    { key: 'publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_test_...' },
    { key: 'secret_key',      label: 'Secret Key',      type: 'password', placeholder: 'sk_test_...' },
    { key: 'webhook_secret',  label: 'Webhook Secret',  type: 'password', placeholder: 'whsec_...' },
  ],
  razorpay: [
    { key: 'key_id',         label: 'Key ID',         type: 'text',     placeholder: 'rzp_test_...' },
    { key: 'key_secret',     label: 'Key Secret',     type: 'password', placeholder: 'Your secret key' },
    { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', placeholder: 'Webhook signature secret' },
  ],
  paypal: [
    { key: 'client_id',     label: 'Client ID',     type: 'text',     placeholder: 'PayPal Client ID' },
    { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'PayPal Client Secret' },
    { key: 'environment',   label: 'Environment',   type: 'select',   options: ['sandbox','live'] },
  ],
};

const GATEWAY_ICONS = { cod:'💵', stripe:'🔷', razorpay:'💙', paypal:'🅿️' };

let allGateways = [];
let editingKey = null;

async function loadGateways() {
  try {
    const res = await api('/payments/gateways/all');
    allGateways = res.data || [];
    renderGateways();
  } catch(e) {
    document.getElementById('gatewayCards').innerHTML = `<div style="color:var(--admin-danger);padding:20px;">Failed to load: ${e.message}</div>`;
  }
}

function renderGateways() {
  const container = document.getElementById('gatewayCards');
  container.innerHTML = allGateways.map(gw => `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-body" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
        <div style="font-size:32px;">${GATEWAY_ICONS[gw.gateway_key] || '💳'}</div>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:16px;">${gw.display_name}</div>
          <div style="font-size:12px;color:var(--admin-muted);margin-top:2px;">
            ${gw.is_test_mode ? '🧪 Test Mode' : '🟢 Live Mode'} ·
            Key: <code>${gw.gateway_key}</code>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <div class="toggle-switch ${gw.is_enabled ? 'on' : ''}" onclick="toggleGateway('${gw.gateway_key}', ${gw.is_enabled ? 0 : 1})" id="toggle_${gw.gateway_key}"></div>
            <span style="font-size:13px;font-weight:600;">${gw.is_enabled ? 'Enabled' : 'Disabled'}</span>
          </label>
          <button class="btn btn-outline btn-sm" onclick="openEdit('${gw.gateway_key}')">⚙️ Configure</button>
        </div>
      </div>
      ${gw.is_enabled && gw.is_test_mode ? `
      <div style="background:#FEF3C7;border-top:1px solid #FDE68A;padding:10px 20px;border-radius:0 0 12px 12px;">
        <span style="font-size:12px;color:#92400E;">⚠️ <strong>Test mode is active.</strong> Real payments will not be processed. Switch to Live Mode when ready to accept payments.</span>
      </div>` : ''}
    </div>
  `).join('');
}

async function toggleGateway(key, enabledVal) {
  try {
    await api('/payments/gateways/' + key, 'PUT', { is_enabled: enabledVal });
    showAlert(`${key} ${enabledVal ? 'enabled' : 'disabled'} successfully`, 'success');
    loadGateways();
  } catch(e) { showAlert('Failed: ' + e.message, 'error'); }
}

function openEdit(key) {
  editingKey = key;
  const gw = allGateways.find(g => g.gateway_key === key);
  if (!gw) return;

  document.getElementById('editModalTitle').textContent = 'Configure ' + gw.display_name;

  const fields = GATEWAY_FIELDS[key] || [];
  const config  = gw.config || {};

  let html = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Display Name</label>
        <input type="text" class="form-control" id="edit_display_name" value="${gw.display_name}">
      </div>
      <div class="form-group">
        <label class="form-label">Sort Order</label>
        <input type="number" class="form-control" id="edit_sort_order" value="${gw.sort_order}">
      </div>
    </div>
    <div class="form-group">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px;background:var(--admin-surface-2);border-radius:8px;">
        <input type="checkbox" id="edit_test_mode" ${gw.is_test_mode ? 'checked' : ''}>
        <span><strong>Test Mode</strong> — Use sandbox/test credentials</span>
      </label>
    </div>`;

  if (fields.length > 0) {
    html += '<hr style="border:1px solid var(--admin-border);margin:16px 0;"><h4 style="margin:0 0 12px;font-size:14px;">API Credentials</h4>';
    html += fields.map(f => {
      const val = config[f.key] || '';
      if (f.type === 'select') {
        return `<div class="form-group">
          <label class="form-label">${f.label}</label>
          <select class="form-control" id="edit_${f.key}">
            ${f.options.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')}
          </select>
        </div>`;
      }
      return `<div class="form-group">
        <label class="form-label">${f.label}</label>
        <input type="${f.type}" class="form-control" id="edit_${f.key}" placeholder="${f.placeholder || ''}" value="${val}">
        ${f.type === 'password' ? '<div class="form-hint">Leave blank to keep existing value</div>' : ''}
      </div>`;
    }).join('');
  } else {
    html += '<p style="color:var(--admin-muted);font-size:14px;">No API credentials required for this payment method.</p>';
  }

  document.getElementById('editModalBody').innerHTML = html;
  document.getElementById('editModal').style.display = 'flex';
}

function closeEdit() { document.getElementById('editModal').style.display = 'none'; editingKey = null; }

async function saveGateway() {
  if (!editingKey) return;
  const fields = GATEWAY_FIELDS[editingKey] || [];
  const config  = {};
  fields.forEach(f => {
    const el = document.getElementById('edit_' + f.key);
    if (el && el.value) config[f.key] = el.value;
  });

  const payload = {
    display_name:  document.getElementById('edit_display_name')?.value,
    sort_order:    parseInt(document.getElementById('edit_sort_order')?.value || '0'),
    is_test_mode:  document.getElementById('edit_test_mode')?.checked ? 1 : 0,
    config,
  };

  try {
    await api('/payments/gateways/' + editingKey, 'PUT', payload);
    showAlert('✓ Configuration saved', 'success');
    closeEdit();
    loadGateways();
  } catch(e) { showAlert('Failed: ' + e.message, 'error'); }
}

function showAlert(msg, type) {
  const el = document.getElementById('gatewayAlert');
  el.style.display = 'block';
  el.style.background = type === 'success' ? '#EAF9F0' : '#FEF2F2';
  el.style.color = type === 'success' ? '#1D6B47' : '#B91C1C';
  el.style.border = '1px solid ' + (type === 'success' ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.2)');
  el.textContent = msg;
  setTimeout(() => el.style.display = 'none', 5000);
}

<style>
.toggle-switch { width:44px; height:24px; border-radius:12px; background:var(--admin-border); cursor:pointer; position:relative; transition:background .2s; }
.toggle-switch::after { content:''; position:absolute; width:18px; height:18px; border-radius:9px; background:#fff; top:3px; left:3px; transition:left .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
.toggle-switch.on { background:var(--admin-primary); }
.toggle-switch.on::after { left:23px; }
</style>

loadGateways();
</script>

<?php include 'includes/footer.php'; ?>
