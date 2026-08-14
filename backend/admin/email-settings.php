<?php
$pageTitle = 'Email Settings';
require_once 'includes/header.php';
?>

<style>
/* Email Settings — light-theme compatible overrides only */
.email-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media(max-width:768px) { .email-grid { grid-template-columns: 1fr; } }

.toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid var(--admin-border);
}
.toggle-row:last-child { border: none; }
.toggle-label { font-size: 13px; color: var(--admin-text); }
.toggle-label small { display: block; color: var(--admin-text-muted); font-size: 11px; margin-top: 2px; }

/* Toggle switch */
.toggle { position: relative; width: 40px; height: 22px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.slider {
    position: absolute; inset: 0;
    background: var(--admin-border); border-radius: 22px;
    cursor: pointer; transition: .3s;
}
.slider:before {
    content:''; position: absolute;
    width: 16px; height: 16px; left: 3px; bottom: 3px;
    background: #fff; border-radius: 50%; transition: .3s;
    box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.toggle input:checked + .slider { background: var(--admin-success); }
.toggle input:checked + .slider:before { transform: translateX(18px); }

/* Log table */
.log-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.log-table th {
    background: var(--admin-surface-2); padding: 8px 10px; text-align: left;
    color: var(--admin-text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: .5px;
}
.log-table td { padding: 8px 10px; border-bottom: 1px solid var(--admin-border); color: var(--admin-text); }

.badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.badge-sent    { background: var(--admin-success-bg); color: var(--admin-success); }
.badge-failed  { background: var(--admin-danger-bg);  color: var(--admin-danger); }
.badge-pending { background: var(--admin-primary-bg); color: var(--admin-primary); }

.alert-info {
    background: var(--admin-primary-bg); border: 1px solid var(--admin-primary);
    border-radius: 8px; padding: 12px 16px; color: var(--admin-primary);
    font-size: 13px; margin-bottom: 16px;
}
.delivery-status-box {
    display:flex; align-items:center; gap:10px; padding:12px;
    background: var(--admin-success-bg); border:1px solid var(--admin-success);
    border-radius:8px; margin-bottom:12px;
}
</style>

<div class="email-grid">
  <!-- SMTP Configuration -->
  <div class="card">
    <div class="card-header"><h3>⚙️ SMTP Configuration</h3></div>
    <div class="card-body">
      <form id="smtpForm">
        <div class="form-group">
          <label>SMTP Host</label>
          <input type="text" name="smtp_host" id="smtp_host" class="form-control" placeholder="smtp.example.com">
        </div>
        <div class="form-group">
          <label>Port</label>
          <input type="number" name="smtp_port" id="smtp_port" class="form-control" value="465">
        </div>
        <div class="form-group">
          <label>Encryption</label>
          <select name="smtp_encryption" id="smtp_encryption" class="form-control">
            <option value="ssl">SSL/TLS (port 465)</option>
            <option value="tls">STARTTLS (port 587)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="email" name="smtp_username" id="smtp_username" class="form-control" placeholder="smtp-user@example.com">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="smtp_password" id="smtp_password" class="form-control" placeholder="Leave blank to keep current">
        </div>
        <div class="form-group">
          <label>From Email</label>
          <input type="email" name="smtp_from_email" id="smtp_from_email" class="form-control" placeholder="hello@example.com">
        </div>
        <div class="form-group">
          <label>From Name</label>
          <input type="text" name="smtp_from_name" id="smtp_from_name" class="form-control" value="Your Store">
        </div>
        <div class="form-group">
          <label>Admin Email (receives order copies)</label>
          <input type="email" name="admin_email" id="admin_email" class="form-control" placeholder="admin@example.com">
        </div>
        <button type="submit" class="btn btn-primary">💾 Save SMTP Settings</button>
      </form>
    </div>
  </div>

  <!-- Right column -->
  <div>
    <!-- Test SMTP -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><h3>📧 Test SMTP Connection</h3></div>
      <div class="card-body">
        <div class="alert-info">Send a test email to verify your SMTP settings are working correctly.</div>
        <div class="form-group">
          <label>Send Test To</label>
          <input type="email" id="testEmailTo" class="form-control" placeholder="Enter email address">
        </div>
        <button class="btn btn-primary" onclick="sendTest()">Send Test Email</button>
        <div id="testResult" style="margin-top:12px;font-size:13px"></div>
      </div>
    </div>

    <!-- Notification Settings -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><h3>🔔 Notification Settings</h3></div>
      <div class="card-body">
        <div class="toggle-row">
          <div class="toggle-label">
            Email Notifications
            <small>Send emails on new orders & status changes</small>
          </div>
          <label class="toggle"><input type="checkbox" id="email_enabled" checked><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <div class="toggle-label">
            WhatsApp Notifications
            <small>Uses CallMeBot free API</small>
          </div>
          <label class="toggle"><input type="checkbox" id="whatsapp_enabled"><span class="slider"></span></label>
        </div>
        <div id="waFields" style="display:none;margin-top:16px">
          <div class="form-group">
            <label>WhatsApp Number (with country code)</label>
            <input type="text" id="whatsapp_number" class="form-control" placeholder="+15551234567">
          </div>
          <div class="form-group">
            <label>CallMeBot API Key</label>
            <input type="text" id="whatsapp_api_key" class="form-control" placeholder="Your CallMeBot API key">
          </div>
        </div>
        <button class="btn btn-primary" style="margin-top:12px" onclick="saveToggles()">💾 Save</button>
      </div>
    </div>

    <!-- Delivery Mode -->
    <div class="card">
      <div class="card-header"><h3>📬 Email Delivery Mode</h3></div>
      <div class="card-body">
        <div class="delivery-status-box">
          <span style="font-size:20px">✅</span>
          <div>
            <div style="color:var(--admin-success);font-weight:700;font-size:13px">Direct SMTP — Active</div>
            <div style="color:var(--admin-text-muted);font-size:11px;margin-top:2px">Emails send instantly when orders are placed. No queue needed.</div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--admin-text-muted);line-height:1.8">
          📄 Customer receives: <strong style="color:var(--admin-text)">PDF Invoice</strong><br>
          📎 Admin receives: <strong style="color:var(--admin-text)">PDF + XML Invoice</strong><br>
          ⏱ Delivery: <strong style="color:var(--admin-text)">Immediately on order</strong>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Email Logs -->
<div class="card" style="margin-top:20px">
  <div class="card-header">
    <h3>📋 Email Logs</h3>
    <div style="display:flex;gap:8px;align-items:center;">
      <select id="logFilter" onchange="loadLogs()" class="form-control" style="width:140px;">
        <option value="">All</option>
        <option value="sent">Sent</option>
        <option value="failed">Failed</option>
      </select>
      <button class="btn btn-outline btn-sm" onclick="loadLogs()">🔄 Refresh</button>
    </div>
  </div>
  <div class="card-body" style="padding:0;overflow-x:auto">
    <table class="log-table">
      <thead><tr>
        <th>Time</th><th>Type</th><th>Recipient</th><th>Subject</th><th>Order</th><th>Status</th><th>Error</th>
      </tr></thead>
      <tbody id="logTableBody">
        <tr><td colspan="7" style="text-align:center;color:var(--admin-text-muted);padding:20px">Loading...</td></tr>
      </tbody>
    </table>
  </div>
</div>

<script>
// ── Self-contained fetch helper ──────────────────────────────────────────────
async function emailApi(endpoint, method, data) {
    method = method || 'GET';
    var token = localStorage.getItem('admin_token') || '';
    var opts = {
        method: method,
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    };
    if (data) opts.body = JSON.stringify(data);

    var res = await fetch('../api' + endpoint, opts);
    var raw = await res.text();
    var i = raw.indexOf('{');
    var clean = (i >= 0) ? raw.substring(i) : raw;
    var json;
    try { json = JSON.parse(clean); } catch(e) { throw new Error('Server error: ' + raw.substring(0, 200)); }
    if (!res.ok || json.success === false) throw new Error(json.message || 'Request failed');
    return json;
}

// ── Load Settings ────────────────────────────────────────────────────────────
async function loadSettings() {
    try {
        var r = await emailApi('/email/settings');
        var s = r.data || {};
        document.getElementById('smtp_host').value        = s.smtp_host || '';
        document.getElementById('smtp_port').value        = s.smtp_port || 465;
        document.getElementById('smtp_encryption').value  = s.smtp_encryption || 'ssl';
        document.getElementById('smtp_username').value    = s.smtp_username || '';
        document.getElementById('smtp_from_email').value  = s.smtp_from_email || '';
        document.getElementById('smtp_from_name').value   = s.smtp_from_name || '';
        document.getElementById('admin_email').value      = s.admin_email || '';
        document.getElementById('email_enabled').checked  = s.email_enabled !== '0';
        document.getElementById('whatsapp_enabled').checked = s.whatsapp_enabled === '1';
        document.getElementById('whatsapp_number').value  = s.whatsapp_number || '';
        document.getElementById('whatsapp_api_key').value = s.whatsapp_api_key || '';
        toggleWA();
    } catch(e) { console.warn('loadSettings:', e); }
}

// ── Save SMTP ────────────────────────────────────────────────────────────────
document.getElementById('smtpForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    var payload = {};
    new FormData(this).forEach(function(v, k) { if (v) payload[k] = v; });
    try {
        await emailApi('/email/settings', 'PUT', payload);
        showAlert('SMTP settings saved!');
    } catch(e) { showAlert(e.message, 'danger'); }
});

// ── Save Toggles ─────────────────────────────────────────────────────────────
async function saveToggles() {
    var payload = {
        email_enabled:    document.getElementById('email_enabled').checked ? '1' : '0',
        whatsapp_enabled: document.getElementById('whatsapp_enabled').checked ? '1' : '0',
        whatsapp_number:  document.getElementById('whatsapp_number').value,
        whatsapp_api_key: document.getElementById('whatsapp_api_key').value
    };
    try {
        await emailApi('/email/settings', 'PUT', payload);
        showAlert('Notification settings saved!');
    } catch(e) { showAlert(e.message, 'danger'); }
}

// ── Send Test ────────────────────────────────────────────────────────────────
async function sendTest() {
    var to = document.getElementById('testEmailTo').value;
    var el = document.getElementById('testResult');
    if (!to) { el.innerHTML = '<span style="color:var(--admin-danger)">Please enter email.</span>'; return; }
    el.innerHTML = '<span style="color:var(--admin-primary)">⏳ Sending...</span>';
    try {
        var r = await emailApi('/email/test', 'POST', { to: to });
        el.innerHTML = '<span style="color:var(--admin-success)">✅ ' + (r.message || 'Sent!') + '</span>';
    } catch(e) {
        el.innerHTML = '<span style="color:var(--admin-danger)">❌ ' + (e.message || 'Failed') + '</span>';
    }
}

// ── Logs ─────────────────────────────────────────────────────────────────────
async function loadLogs() {
    var status = document.getElementById('logFilter').value;
    var url = '/email/logs?per_page=50' + (status ? '&status=' + status : '');
    try {
        var r = await emailApi(url);
        var logs = r.data || [];
        if (!logs.length) {
            document.getElementById('logTableBody').innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--admin-text-muted);padding:20px">No logs yet</td></tr>';
            return;
        }
        var html = '';
        for (var x = 0; x < logs.length; x++) {
            var l = logs[x];
            html += '<tr><td>' + (l.sent_at||'-') + '</td><td>' + (l.email_type||'-') + '</td><td>' + (l.recipient||'-') + '</td><td>' + (l.subject||'-') + '</td><td>' + (l.order_id ? '#'+l.order_id : '-') + '</td><td><span class="badge badge-' + l.status + '">' + l.status.toUpperCase() + '</span></td><td style="color:var(--admin-danger);font-size:11px">' + (l.error_message||'-') + '</td></tr>';
        }
        document.getElementById('logTableBody').innerHTML = html;
    } catch(e) {
        document.getElementById('logTableBody').innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--admin-danger);padding:20px">' + (e.message || 'Unable to load logs') + '</td></tr>';
    }
}

// ── WhatsApp toggle ──────────────────────────────────────────────────────────
function toggleWA() {
    document.getElementById('waFields').style.display =
        document.getElementById('whatsapp_enabled').checked ? 'block' : 'none';
}
document.getElementById('whatsapp_enabled').addEventListener('change', toggleWA);

// ── Init ─────────────────────────────────────────────────────────────────────
loadSettings();
loadLogs();
</script>

<?php include 'includes/footer.php'; ?>
