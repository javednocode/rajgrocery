<?php $pageTitle = 'Delivery Settings'; include 'includes/header.php'; ?>

<style>
.delivery-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
@media(max-width:640px){ .delivery-grid{grid-template-columns:1fr;} }

.dcard { background:var(--card-bg,#1a2332); border-radius:12px; padding:24px; border:1px solid rgba(255,255,255,.07); }
.dcard-full { grid-column:1/-1; }
.dcard h3 { margin:0 0 18px; color:#e2e8f0; font-size:14px; font-weight:700; display:flex; align-items:center; gap:8px; }

.form-group { margin-bottom:16px; }
.form-group label { display:block; font-size:12px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.7px; margin-bottom:6px; }
.form-group input[type=number], .form-group input[type=text] {
  width:100%; padding:10px 12px; background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1); border-radius:8px;
  color:#e2e8f0; font-size:13px; box-sizing:border-box; outline:none;
  transition:border-color .2s; font-family:inherit;
}
.form-group input:focus { border-color:#3b82f6; }
.field-hint { font-size:11px; color:#64748b; margin-top:4px; }
.euro-wrap { position:relative; }
.euro-wrap::before { content:'€'; position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#64748b; pointer-events:none; font-size:13px; }
.euro-wrap input { padding-left:26px !important; }

.toggle-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.06); margin-bottom:14px; }
.toggle-row:last-of-type { margin-bottom:14px; }
.toggle-label { font-size:13px; color:#cbd5e1; font-weight:600; }
.toggle-label small { display:block; color:#64748b; font-size:11px; margin-top:2px; font-weight:400; }

/* Toggle switch */
.tswitch { position:relative; display:inline-block; width:44px; height:24px; flex-shrink:0; }
.tswitch input { opacity:0; width:0; height:0; }
.tslider { position:absolute; inset:0; background:#374151; border-radius:24px; cursor:pointer; transition:background .2s; }
.tslider::before { content:''; position:absolute; width:16px; height:16px; border-radius:50%; background:#fff; left:4px; top:4px; transition:transform .2s; }
.tswitch input:checked + .tslider { background:#22c55e; }
.tswitch input:checked + .tslider::before { transform:translateX(20px); }

/* Zone chips */
.zones-row { display:flex; gap:12px; }
.zone-chip { flex:1; padding:16px 12px; border-radius:10px; text-align:center; }
.zone-icon { font-size:24px; margin-bottom:6px; }
.zone-name { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; }
.zone-fee  { font-size:20px; font-weight:800; color:#f1f5f9; margin-top:4px; }
.zone-note { font-size:10px; color:#64748b; margin-top:3px; }
.zone-cork    { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.2); }
.zone-outside { background:rgba(251,146,60,.1); border:1px solid rgba(251,146,60,.2); }

/* Preview */
.preview-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.05); font-size:13px; }
.preview-row:last-child { border:none; }
.pv-free { color:#4ade80; font-weight:700; }
.pv-fee  { color:#fb923c; font-weight:700; }

/* Save bar */
.save-bar { display:flex; align-items:center; justify-content:space-between; margin-top:24px; padding-top:20px; border-top:1px solid rgba(255,255,255,.06); }
.btn-save-delivery { background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border:none; border-radius:10px; padding:12px 32px; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; }
.btn-save-delivery:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(59,130,246,.4); }
.btn-save-delivery:disabled { opacity:.6; cursor:not-allowed; transform:none; }
.save-status { font-size:13px; font-weight:600; }
.save-ok  { color:#4ade80; }
.save-err { color:#f87171; }
.detection-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
</style>

<div style="margin-bottom:22px">
  <div style="font-size:22px;font-weight:800;color:#f1f5f9;margin-bottom:4px">🚚 Delivery Settings</div>
  <div style="font-size:14px;color:#64748b">Configure delivery zones, fees and free delivery thresholds</div>
</div>

<div id="pageMsg" style="display:none;margin-bottom:16px;padding:12px 16px;border-radius:8px;font-size:13px;font-weight:600"></div>

<!-- Zone Overview (live preview) -->
<div class="dcard" style="margin-bottom:20px">
  <h3>🗺️ Current Zone Overview</h3>
  <div class="zones-row">
    <div class="zone-chip zone-cork">
      <div class="zone-icon">🏙️</div>
      <div class="zone-name">Cork City</div>
      <div class="zone-fee" id="previewCorkFee">€2.95</div>
      <div class="zone-note">Free above <span id="previewFreeAbove">€50</span></div>
    </div>
    <div class="zone-chip zone-outside">
      <div class="zone-icon">🚐</div>
      <div class="zone-name">Outside Cork</div>
      <div class="zone-fee" id="previewOutsideFee">€4.95</div>
      <div class="zone-note">+<span id="previewSmallFee">€1.50</span> for orders under <span id="previewSmallMin">€25</span></div>
    </div>
  </div>
</div>

<div class="delivery-grid">

  <!-- Free Delivery -->
  <div class="dcard">
    <h3>🎁 Free Delivery</h3>
    <div class="toggle-row">
      <div class="toggle-label">
        Enable Free Delivery
        <small>Cork City orders above threshold get free delivery</small>
      </div>
      <label class="tswitch">
        <input type="checkbox" id="delivery_free_enabled">
        <span class="tslider"></span>
      </label>
    </div>
    <div class="form-group">
      <label>Free Delivery Threshold</label>
      <div class="euro-wrap">
        <input type="number" id="delivery_free_above" step="0.01" min="0" placeholder="50">
      </div>
      <div class="field-hint">Cork City orders above this = free delivery</div>
    </div>
  </div>

  <!-- Delivery Fees -->
  <div class="dcard">
    <h3>💰 Delivery Fees</h3>
    <div class="form-group">
      <label>Cork City Fee</label>
      <div class="euro-wrap">
        <input type="number" id="delivery_cork_city_fee" step="0.01" min="0" placeholder="2.95">
      </div>
      <div class="field-hint">Charged when order is below free delivery threshold</div>
    </div>
    <div class="form-group">
      <label>Outside Cork City Fee</label>
      <div class="euro-wrap">
        <input type="number" id="delivery_outside_cork_fee" step="0.01" min="0" placeholder="4.95">
      </div>
      <div class="field-hint">Always charged for non-Cork-City locations</div>
    </div>
  </div>

  <!-- Small Order Surcharge -->
  <div class="dcard">
    <h3>📦 Small Order Surcharge</h3>
    <div class="toggle-row">
      <div class="toggle-label">
        Enable Small Order Fee
        <small>Extra fee for small orders outside Cork City</small>
      </div>
      <label class="tswitch">
        <input type="checkbox" id="delivery_small_order_enabled">
        <span class="tslider"></span>
      </label>
    </div>
    <div class="form-group">
      <label>Small Order Minimum</label>
      <div class="euro-wrap">
        <input type="number" id="delivery_small_order_min" step="0.01" min="0" placeholder="25">
      </div>
      <div class="field-hint">Orders below this get the extra fee</div>
    </div>
    <div class="form-group">
      <label>Small Order Extra Fee</label>
      <div class="euro-wrap">
        <input type="number" id="delivery_small_order_fee" step="0.01" min="0" placeholder="1.50">
      </div>
      <div class="field-hint">Added on top of delivery fee for small orders</div>
    </div>
  </div>

  <!-- Pricing Preview -->
  <div class="dcard">
    <h3>👁️ Pricing Preview</h3>
    <div class="preview-row"><span style="color:#94a3b8">🏙️ Cork City — €55 order</span><span class="pv-free">FREE</span></div>
    <div class="preview-row"><span style="color:#94a3b8">🏙️ Cork City — €30 order</span><span class="pv-fee" id="prev2">€2.95</span></div>
    <div class="preview-row"><span style="color:#94a3b8">🚐 Outside Cork — €40 order</span><span class="pv-fee" id="prev3">€4.95</span></div>
    <div class="preview-row"><span style="color:#94a3b8">🚐 Outside Cork — €18 order</span><span class="pv-fee" id="prev4">€6.45</span></div>
  </div>

</div><!-- /delivery-grid -->

<!-- Detection Info -->
<div class="dcard" style="margin-top:20px">
  <h3>📍 Cork City Detection Rules</h3>
  <div class="detection-grid">
    <div style="background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.15);border-radius:10px;padding:14px">
      <div style="font-size:12px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">✅ Detected as Cork City</div>
      <div style="font-size:12px;color:#94a3b8;line-height:2">
        Eircode starts with <strong style="color:#e2e8f0">T</strong> (T12, T23, T34...)<br>
        OR City contains <strong style="color:#e2e8f0">"Cork"</strong><br>
        OR County = <strong style="color:#e2e8f0">Cork</strong>
      </div>
    </div>
    <div style="background:rgba(251,146,60,.07);border:1px solid rgba(251,146,60,.15);border-radius:10px;padding:14px">
      <div style="font-size:12px;font-weight:700;color:#fb923c;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">🚐 Detected as Outside Cork</div>
      <div style="font-size:12px;color:#94a3b8;line-height:2">
        Eircode starts with any other letter<br>
        OR County ≠ Cork<br>
        OR City does not contain "Cork"
      </div>
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
const DELIVERY_KEYS = [
  'delivery_free_above','delivery_free_enabled',
  'delivery_cork_city_fee','delivery_outside_cork_fee',
  'delivery_small_order_min','delivery_small_order_fee',
  'delivery_small_order_enabled'
];

async function loadDeliverySettings() {
  try {
    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch(`${API}/settings`, { headers: { 'Authorization': 'Bearer ' + token } });
    const data = await res.json();
    if (!data.success) return;
    const s = data.data;

    // Populate fields
    setVal('delivery_free_above',        s.delivery_free_above        || '50');
    setVal('delivery_cork_city_fee',     s.delivery_cork_city_fee     || '2.95');
    setVal('delivery_outside_cork_fee',  s.delivery_outside_cork_fee  || '4.95');
    setVal('delivery_small_order_min',   s.delivery_small_order_min   || '25');
    setVal('delivery_small_order_fee',   s.delivery_small_order_fee   || '1.50');
    setChk('delivery_free_enabled',      s.delivery_free_enabled      !== '0');
    setChk('delivery_small_order_enabled', s.delivery_small_order_enabled !== '0');

    updatePreview(s);
  } catch(e) {
    console.error('Load error:', e);
  }
}

function setVal(id, val) { const el = document.getElementById(id); if(el) el.value = val; }
function setChk(id, val) { const el = document.getElementById(id); if(el) el.checked = !!val; }
function getVal(id) { return document.getElementById(id)?.value || ''; }
function getChk(id) { return document.getElementById(id)?.checked ? '1' : '0'; }

function updatePreview(s) {
  const corkFee    = parseFloat(s.delivery_cork_city_fee    || s.delivery_cork_city_fee    || 2.95);
  const outsideFee = parseFloat(s.delivery_outside_cork_fee || s.delivery_outside_cork_fee || 4.95);
  const smallFee   = parseFloat(s.delivery_small_order_fee  || s.delivery_small_order_fee  || 1.50);
  const smallMin   = parseFloat(s.delivery_small_order_min  || s.delivery_small_order_min  || 25);
  const freeAbove  = parseFloat(s.delivery_free_above       || s.delivery_free_above       || 50);

  document.getElementById('previewCorkFee').textContent  = '€' + corkFee.toFixed(2);
  document.getElementById('previewOutsideFee').textContent = '€' + outsideFee.toFixed(2);
  document.getElementById('previewSmallFee').textContent = '€' + smallFee.toFixed(2);
  document.getElementById('previewSmallMin').textContent = '€' + smallMin.toFixed(0);
  document.getElementById('previewFreeAbove').textContent = '€' + freeAbove.toFixed(0);
  document.getElementById('prev2').textContent = '€' + corkFee.toFixed(2);
  document.getElementById('prev3').textContent = '€' + outsideFee.toFixed(2);
  document.getElementById('prev4').textContent = '€' + (outsideFee + smallFee).toFixed(2);
}

async function saveDeliverySettings() {
  const btn = document.getElementById('saveBtn');
  const status = document.getElementById('saveStatus');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  status.textContent = '';

  const payload = {
    delivery_free_above:          getVal('delivery_free_above'),
    delivery_free_enabled:        getChk('delivery_free_enabled'),
    delivery_cork_city_fee:       getVal('delivery_cork_city_fee'),
    delivery_outside_cork_fee:    getVal('delivery_outside_cork_fee'),
    delivery_small_order_min:     getVal('delivery_small_order_min'),
    delivery_small_order_fee:     getVal('delivery_small_order_fee'),
    delivery_small_order_enabled: getChk('delivery_small_order_enabled'),
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
      status.textContent = '✅ Settings saved successfully!';
      updatePreview(payload);
    } else {
      status.className = 'save-status save-err';
      status.textContent = '❌ ' + (data.message || 'Save failed');
    }
  } catch(e) {
    status.className = 'save-status save-err';
    status.textContent = '❌ Network error — try again';
  }

  btn.disabled = false;
  btn.textContent = '💾 Save Delivery Settings';
}

// Live preview as user types
['delivery_cork_city_fee','delivery_outside_cork_fee','delivery_small_order_fee','delivery_small_order_min','delivery_free_above'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    updatePreview({
      delivery_cork_city_fee:    getVal('delivery_cork_city_fee'),
      delivery_outside_cork_fee: getVal('delivery_outside_cork_fee'),
      delivery_small_order_fee:  getVal('delivery_small_order_fee'),
      delivery_small_order_min:  getVal('delivery_small_order_min'),
      delivery_free_above:       getVal('delivery_free_above'),
    });
  });
});

loadDeliverySettings();
</script>

<?php include 'includes/footer.php'; ?>
