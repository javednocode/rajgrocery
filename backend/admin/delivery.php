<?php $pageTitle = 'Delivery Settings & HK Town Dropdown'; include 'includes/header.php'; ?>

<style>
.delivery-grid { display:grid; grid-template-columns: 2fr 1fr; gap:20px; }
@media(max-width:900px){ .delivery-grid{grid-template-columns:1fr;} }

.dcard { background:var(--card-bg,#1a2332); border-radius:12px; padding:24px; border:1px solid rgba(255,255,255,.07); height: fit-content; }
.dcard h3 { margin:0 0 18px; color:#e2e8f0; font-size:16px; font-weight:800; display:flex; align-items:center; gap:8px; letter-spacing: -0.01em; }

.form-group { margin-bottom:16px; }
.form-group label { display:block; font-size:12px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.7px; margin-bottom:6px; }
.form-group input[type=number], .form-group input[type=text] {
  width:100%; padding:10px 12px; background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1); border-radius:8px;
  color:#e2e8f0; font-size:13px; box-sizing:border-box; outline:none;
  transition:all .2s; font-family:inherit;
}
.form-group input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.15); }
.field-hint { font-size:11px; color:#64748b; margin-top:4px; line-height: 1.4; }

.hkd-wrap { position:relative; }
.hkd-wrap::before { content:'HK$'; position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#64748b; pointer-events:none; font-size:13px; font-weight: 700; }
.hkd-wrap input { padding-left:46px !important; }

.toggle-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.06); margin-bottom:14px; }
.toggle-row:last-of-type { border-bottom:none; margin-bottom:4px; }
.toggle-label { font-size:13px; color:#cbd5e1; font-weight:600; }
.toggle-label small { display:block; color:#64748b; font-size:11px; margin-top:2px; font-weight:400; }

/* Toggle switch */
.tswitch { position:relative; display:inline-block; width:44px; height:24px; flex-shrink:0; }
.tswitch input { opacity:0; width:0; height:0; }
.tslider { position:absolute; inset:0; background:#374151; border-radius:24px; cursor:pointer; transition:background .2s; }
.tslider::before { content:''; position:absolute; width:16px; height:16px; border-radius:50%; background:#fff; left:4px; top:4px; transition:transform .2s; }
.tswitch input:checked + .tslider { background:#22c55e; }
.tswitch input:checked + .tslider::before { transform:translateX(20px); }

/* Table for cities */
.city-table { width:100%; border-collapse:collapse; margin-bottom:18px; }
.city-table th { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.08em; padding:12px 8px; border-bottom:1px solid rgba(255,255,255,.1); text-align:left; }
.city-table td { padding:10px 8px; border-bottom:1px solid rgba(255,255,255,.05); vertical-align:middle; }
.city-table input { width:100%; padding:9px 12px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:8px; color:#f1f5f9; font-size:13px; font-weight:600; outline:none; transition:border-color .2s; }
.city-table input:focus { border-color:#3b82f6; }
.city-fee-input, .city-min-input { width: 110px !important; }

.btn-add-row {
  background:rgba(59,130,246,.15); color:#60a5fa; border:1px dashed rgba(59,130,246,.4);
  border-radius:8px; padding:10px 18px; font-size:13px; font-weight:700; cursor:pointer; transition:all .2s;
  display: inline-flex; align-items: center; gap: 8px;
}
.btn-add-row:hover { background:rgba(59,130,246,.25); color:#93c5fd; border-color: #60a5fa; }

.btn-delete-row {
  background:rgba(239,68,68,.15); color:#f87171; border:none; width:34px; height:34px;
  border-radius:8px; display:grid; place-items:center; cursor:pointer; transition:all .2s;
}
.btn-delete-row:hover { background:rgba(239,68,68,.25); transform:scale(1.05); }

/* Save bar */
.save-bar { display:flex; align-items:center; justify-content:space-between; margin-top:24px; padding:18px 24px; background: rgba(15, 23, 42, 0.6); border:1px solid rgba(255,255,255,.08); border-radius: 12px; }
.btn-save-delivery { background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; border:none; border-radius:10px; padding:12px 36px; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); }
.btn-save-delivery:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(37, 99, 235, 0.5); }
.btn-save-delivery:disabled { opacity:.6; cursor:not-allowed; transform:none; }
.save-status { font-size:14px; font-weight:600; display:flex; align-items:center; gap:8px; }
.save-ok  { color:#4ade80; }
.save-err { color:#f87171; }

.info-banner {
  background: linear-gradient(135deg, rgba(59,130,246,.15), rgba(30,58,138,.2));
  border: 1px solid rgba(59,130,246,.3); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;
  color: #93c5fd; font-size: 13.5px; line-height: 1.5; display: flex; align-items: center; gap: 14px;
}
</style>

<div style="margin-bottom:22px">
  <div style="font-size:24px;font-weight:800;color:#f1f5f9;margin-bottom:4px">📍 Hong Kong Town / City Delivery Charges</div>
  <div style="font-size:14px;color:#64748b">Manage the town/city dropdown options displayed during customer checkout and set dynamic shipping fees per region.</div>
</div>

<div class="info-banner">
  <span style="font-size: 22px;">💡</span>
  <div>
    <strong>Dynamic Checkout Integration:</strong> The towns and delivery charges you define below directly power the town/city dropdown menu on the customer checkout page. When a customer selects their region, the shipping fee will adjust automatically. The <em>"Free Delivery Above"</em> column sets the cart threshold above which delivery becomes <strong>FREE</strong> for that area — it does <em>not</em> block orders below that amount.
  </div>
</div>

<div class="delivery-grid">
  <!-- Left: City / Town Rates Manager -->
  <div class="dcard">
    <h3>🏙️ Checkout Town / City Dropdown & Fees</h3>
    <p style="font-size:13px;color:#94a3b8;margin-bottom:16px;">Add or modify Hong Kong areas, districts, or cities. Customers will pick from these options at checkout.</p>
    
    <table class="city-table" id="cityTable">
      <thead>
        <tr>
          <th>Hong Kong Town / City / Region</th>
          <th>Delivery Fee (HK$)</th>
          <th>Free Delivery Above (HK$)</th>
          <th style="width:50px;text-align:center;">Action</th>
        </tr>
      </thead>
      <tbody id="cityRows">
        <!-- populated by JS -->
      </tbody>
    </table>

    <button type="button" class="btn-add-row" onclick="addNewRow('', 40, 500)">
      <span>➕</span> Add New Town / City Option
    </button>
  </div>

  <!-- Right: General & Free Delivery Rules -->
  <div class="dcard">
    <h3>🎉 Free Delivery & Default Settings</h3>
    
    <div class="toggle-row">
      <div class="toggle-label">
        Enable Free Delivery Threshold
        <small>Orders exceeding the threshold amount get FREE delivery across all towns</small>
      </div>
      <label class="tswitch">
        <input type="checkbox" id="delivery_free_enabled">
        <span class="tslider"></span>
      </label>
    </div>

    <div class="form-group">
      <label>Free Delivery Order Minimum</label>
      <div class="hkd-wrap">
        <input type="number" id="delivery_free_above" step="1" min="0" placeholder="400">
      </div>
      <div class="field-hint">When cart subtotal reaches this amount, delivery fee becomes HK$0.00.</div>
    </div>

    <div style="margin:24px 0;height:1px;background:rgba(255,255,255,.08)"></div>

    <div class="form-group">
      <label>Default / Starting Delivery Fee</label>
      <div class="hkd-wrap">
        <input type="number" id="shipping_charge" step="1" min="0" placeholder="40">
      </div>
      <div class="field-hint">Fallback shipping rate shown in shopping cart before the customer selects their town/city.</div>
    </div>
  </div>
</div>

<!-- Save Bar -->
<div class="save-bar">
  <span class="save-status" id="saveStatus"></span>
  <button class="btn-save-delivery" id="saveBtn" onclick="saveDeliverySettings()">💾 Save Delivery Settings</button>
</div>

<script>
const API = window.location.origin + '/api';

const DEFAULT_CITIES = [
  { name: 'Kowloon', fee: 40, minAmount: 500 },
  { name: 'Hong Kong Island', fee: 50, minAmount: 500 },
  { name: 'New Territories', fee: 60, minAmount: 500 },
  { name: 'Tsuen Wan / Kwai Tsing', fee: 45, minAmount: 500 },
  { name: 'Sha Tin / Tai Po', fee: 55, minAmount: 500 },
  { name: 'Tuen Mun / Yuen Long', fee: 60, minAmount: 500 },
  { name: 'Lantau Island / Tung Chung', fee: 80, minAmount: 500 },
  { name: 'Discovery Bay / Outlying Islands', fee: 120, minAmount: 500 }
];

async function loadDeliverySettings() {
  try {
    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch(`${API}/settings`, { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    const s = data.success ? data.data : {};

    // Populate general settings
    setVal('delivery_free_above', s.delivery_free_above || s.shipping_free_above || '400');
    setVal('shipping_charge',     s.shipping_charge     || s.delivery_local_fee   || '40');
    setChk('delivery_free_enabled', s.delivery_free_enabled !== '0');

    // Populate cities
    let cities = DEFAULT_CITIES;
    if (s.hk_delivery_cities) {
      try {
        const parsed = typeof s.hk_delivery_cities === 'string' ? JSON.parse(s.hk_delivery_cities) : s.hk_delivery_cities;
        if (Array.isArray(parsed) && parsed.length > 0) {
          cities = parsed;
        }
      } catch (e) {
        console.error('Failed to parse hk_delivery_cities, using defaults', e);
      }
    }
    
    renderCities(cities);
  } catch(e) {
    console.error('Load error:', e);
    renderCities(DEFAULT_CITIES);
  }
}

function renderCities(cities) {
  const tbody = document.getElementById('cityRows');
  tbody.innerHTML = '';
  cities.forEach(c => {
    let amt = c.minAmount ?? c.min_amount;
    if (amt === undefined || (amt === 0 && (c.minQty || c.min_qty))) {
      amt = c.minQty || c.min_qty;
    }
    addNewRow(c.name, c.fee, amt !== undefined ? amt : 500);
  });
}

function addNewRow(name = '', fee = 40, minAmount = 500) {
  const tbody = document.getElementById('cityRows');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="city-name-field" placeholder="e.g. Kowloon, Hong Kong Island" value="${name.replace(/"/g, '&quot;')}"></td>
    <td>
      <div class="hkd-wrap">
        <input type="number" class="city-fee-field city-fee-input" step="1" min="0" value="${fee}">
      </div>
    </td>
    <td>
      <div class="hkd-wrap">
        <input type="number" class="city-minamount-field city-min-input" step="1" min="0" value="${minAmount}" placeholder="0" title="Cart subtotal above which delivery becomes FREE for this area (0 = use global threshold)">
      </div>
    </td>
    <td style="text-align:center;">
      <button type="button" class="btn-delete-row" title="Remove row" onclick="this.closest('tr').remove();">🗑️</button>
    </td>
  `;
  tbody.appendChild(tr);
}

function setVal(id, val) { const el = document.getElementById(id); if(el) el.value = val; }
function setChk(id, val) { const el = document.getElementById(id); if(el) el.checked = !!val; }
function getVal(id) { return document.getElementById(id)?.value || ''; }
function getChk(id) { return document.getElementById(id)?.checked ? '1' : '0'; }

async function saveDeliverySettings() {
  const btn = document.getElementById('saveBtn');
  const status = document.getElementById('saveStatus');
  btn.disabled = true;
  btn.textContent = 'Saving Settings...';
  status.textContent = '';

  // Gather cities from table
  const rows = document.querySelectorAll('#cityRows tr');
  const cities = [];
  rows.forEach(r => {
    const name = r.querySelector('.city-name-field')?.value?.trim();
    const fee = parseFloat(r.querySelector('.city-fee-field')?.value || '0');
    const minAmount = parseFloat(r.querySelector('.city-minamount-field')?.value || '0');
    if (name) {
      cities.push({
        name,
        fee: isNaN(fee) ? 40 : fee,
        minAmount: isNaN(minAmount) ? 500 : minAmount
      });
    }
  });

  if (cities.length === 0) {
    alert('Please add at least one town / city option for checkout.');
    btn.disabled = false;
    btn.textContent = '💾 Save Delivery Settings';
    return;
  }

  const freeAbove = getVal('delivery_free_above') || '400';
  const defaultFee = getVal('shipping_charge') || (cities[0] ? cities[0].fee : '40');

  const payload = {
    hk_delivery_cities: JSON.stringify(cities),
    delivery_free_above: freeAbove,
    shipping_free_above: freeAbove,
    delivery_free_enabled: getChk('delivery_free_enabled'),
    shipping_charge: defaultFee,
    delivery_local_fee: defaultFee,
    delivery_standard_fee: defaultFee
  };

  try {
    const token = localStorage.getItem('admin_token') || '';
    const res  = await fetch(`${API}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      status.className = 'save-status save-ok';
      status.innerHTML = '✅ Delivery charges and HK Town dropdown saved successfully!';
    } else {
      status.className = 'save-status save-err';
      status.textContent = '❌ ' + (data.message || 'Save failed');
    }
  } catch(e) {
    status.className = 'save-status save-err';
    status.textContent = '❌ Network error — please try again';
  }

  btn.disabled = false;
  btn.textContent = '💾 Save Delivery Settings';
}

document.addEventListener('DOMContentLoaded', () => {
  loadDeliverySettings();
});
</script>

<?php include 'includes/footer.php'; ?>
