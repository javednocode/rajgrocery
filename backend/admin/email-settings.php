<?php require_once 'includes/header.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Email Settings | Asian Food Cork Admin</title>
<link rel="stylesheet" href="assets/admin.css">
<style>
.email-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card { background: var(--card-bg,#1a2332); border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,.07); }
.card h3 { margin: 0 0 20px; color: #e2e8f0; font-size: 15px; display: flex; align-items: center; gap: 8px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .7px; margin-bottom: 6px; }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; color: #e2e8f0; font-size: 13px; box-sizing: border-box; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #4B2E83; }
.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.toggle-row:last-child { border: none; }
.toggle-label { font-size: 13px; color: #cbd5e1; }
.toggle-label small { display: block; color: #64748b; font-size: 11px; margin-top: 2px; }
.toggle { position: relative; width: 40px; height: 22px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; inset: 0; background: #334155; border-radius: 22px; cursor: pointer; transition: .3s; }
.slider:before { content:''; position: absolute; width: 16px; height: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: .3s; }
.toggle input:checked + .slider { background: #22C55E; }
.toggle input:checked + .slider:before { transform: translateX(18px); }
.btn-primary { background: #22C55E; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px; }
.btn-purple { background: #4B2E83; }
.btn-danger { background: #dc2626; }
.log-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.log-table th { background: rgba(255,255,255,.05); padding: 8px 10px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; }
.log-table td { padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,.04); color: #cbd5e1; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.badge-sent { background: #14532d; color: #4ade80; }
.badge-failed { background: #7f1d1d; color: #fca5a5; }
.badge-pending { background: #1e3a5f; color: #93c5fd; }
.alert-info { background: #1e3a5f; border: 1px solid #2563eb; border-radius: 8px; padding: 12px 16px; color: #93c5fd; font-size: 13px; margin-bottom: 16px; }
@media(max-width:768px) { .email-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<?php include 'includes/sidebar.php'; ?>
<div class="admin-content">
  <div class="page-header">
    <h1>📧 Email Settings</h1>
    <p>Configure SMTP, test email delivery, and view send logs.</p>
  </div>

  <div id="alertBox"></div>

  <div class="email-grid">
    <!-- SMTP Configuration -->
    <div class="card">
      <h3>⚙️ SMTP Configuration</h3>
      <form id="smtpForm">
        <div class="form-group">
          <label>SMTP Host</label>
          <input type="text" name="smtp_host" id="smtp_host" value="asianfoodcork.com">
        </div>
        <div class="form-group">
          <label>Port</label>
          <input type="number" name="smtp_port" id="smtp_port" value="465">
        </div>
        <div class="form-group">
          <label>Encryption</label>
          <select name="smtp_encryption" id="smtp_encryption">
            <option value="ssl">SSL/TLS (port 465)</option>
            <option value="tls">STARTTLS (port 587)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="email" name="smtp_username" id="smtp_username" value="orders@asianfoodcork.com">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="smtp_password" id="smtp_password" placeholder="Leave blank to keep current">
        </div>
        <div class="form-group">
          <label>From Email</label>
          <input type="email" name="smtp_from_email" id="smtp_from_email" value="orders@asianfoodcork.com">
        </div>
        <div class="form-group">
          <label>From Name</label>
          <input type="text" name="smtp_from_name" id="smtp_from_name" value="Asian Food Cork">
        </div>
        <div class="form-group">
          <label>Admin Email (receives order copies)</label>
          <input type="email" name="admin_email" id="admin_email" value="orders@asianfoodcork.com">
        </div>
        <button type="submit" class="btn-primary">💾 Save SMTP Settings</button>
      </form>
    </div>

    <!-- Test + Toggles -->
    <div>
      <div class="card" style="margin-bottom:20px">
        <h3>🧪 Test SMTP Connection</h3>
        <div class="alert-info">Send a test email to verify your SMTP settings are working correctly.</div>
        <div class="form-group">
          <label>Send Test To</label>
          <input type="email" id="testEmailTo" placeholder="Enter email address" value="orders@asianfoodcork.com">
        </div>
        <button class="btn-primary btn-purple" onclick="sendTest()">📤 Send Test Email</button>
        <div id="testResult" style="margin-top:12px;font-size:13px"></div>
      </div>

      <div class="card" style="margin-bottom:20px">
        <h3>🔔 Notification Settings</h3>
        <div class="toggle-row">
          <div class="toggle-label">
            Email Notifications
            <small>Send emails on new orders &amp; status changes</small>
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
            <input type="text" id="whatsapp_number" placeholder="+353851234567">
          </div>
          <div class="form-group">
            <label>CallMeBot API Key</label>
            <input type="text" id="whatsapp_api_key" placeholder="Your CallMeBot API key">
          </div>
        </div>
        <button class="btn-primary" style="margin-top:12px" onclick="saveToggles()">💾 Save</button>
      </div>

      <div class="card">
        <h3>⚡ Email Delivery Mode</h3>
        <div style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);border-radius:8px;margin-bottom:12px">
          <span style="font-size:20px">✅</span>
          <div>
            <div style="color:#4ade80;font-weight:700;font-size:13px">Direct SMTP — Active</div>
            <div style="color:#94a3b8;font-size:11px;margin-top:2px">Emails send instantly when orders are placed. No queue needed.</div>
          </div>
        </div>
        <div style="font-size:12px;color:#64748b;line-height:1.7">
          📧 Customer receives: <strong style="color:#cbd5e1">PDF Invoice</strong><br>
          📧 Admin receives: <strong style="color:#cbd5e1">PDF + XML Invoice</strong><br>
          ⏱️ Delivery: <strong style="color:#cbd5e1">Immediately on order</strong>
        </div>
      </div>
    </div>
  </div>

  <!-- Email Logs -->
  <div class="card" style="margin-top:20px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="margin:0">📋 Email Logs</h3>
      <div>
        <select id="logFilter" onchange="loadLogs()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#e2e8f0;padding:6px 10px;border-radius:6px;font-size:12px">
          <option value="">All</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
        <button class="btn-primary" style="margin-left:8px;padding:6px 14px;font-size:12px" onclick="loadLogs()">🔄 Refresh</button>
      </div>
    </div>
    <div style="overflow-x:auto">
      <table class="log-table">
        <thead><tr>
          <th>Time</th><th>Type</th><th>Recipient</th><th>Subject</th><th>Order</th><th>Status</th><th>Error</th>
        </tr></thead>
        <tbody id="logTableBody"><tr><td colspan="7" style="text-align:center;color:#64748b;padding:20px">Loading...</td></tr></tbody>
      </table>
    </div>
  </div>

</div>

<script src="assets/admin.js?v=<?= time() ?>"></script>
<script>
// ── Self-contained fetch helper (bypasses cached api() entirely) ─────────────
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

    // Strip any PHP warnings/notices before the JSON object
    var i = raw.indexOf('{');
    var clean = (i >= 0) ? raw.substring(i) : raw;

    var json;
    try {
        json = JSON.parse(clean);
    } catch(e) {
        throw new Error('Server returned invalid response: ' + raw.substring(0, 200));
    }
    if (!res.ok || json.success === false) throw new Error(json.message || 'Request failed');
    return json;
}

// ── Load Settings ────────────────────────────────────────────────────────────
async function loadSettings() {
    try {
        var r = await emailApi('/email/settings');
        var s = r.data || {};
        document.getElementById('smtp_host').value = s.smtp_host || 'asianfoodcork.com';
        document.getElementById('smtp_port').value = s.smtp_port || 465;
        document.getElementById('smtp_encryption').value = s.smtp_encryption || 'ssl';
        document.getElementById('smtp_username').value = s.smtp_username || '';
        document.getElementById('smtp_from_email').value = s.smtp_from_email || '';
        document.getElementById('smtp_from_name').value = s.smtp_from_name || '';
        document.getElementById('admin_email').value = s.admin_email || '';
        document.getElementById('email_enabled').checked = s.email_enabled !== '0';
        document.getElementById('whatsapp_enabled').checked = s.whatsapp_enabled === '1';
        document.getElementById('whatsapp_number').value = s.whatsapp_number || '';
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
    if (!to) { el.innerHTML = '<span style="color:#fca5a5">Please enter email.</span>'; return; }
    el.innerHTML = '<span style="color:#93c5fd">⏳ Sending...</span>';
    try {
        var r = await emailApi('/email/test', 'POST', { to: to });
        el.innerHTML = '<span style="color:#4ade80">✅ ' + (r.message || 'Sent!') + '</span>';
    } catch(e) {
        el.innerHTML = '<span style="color:#fca5a5">❌ ' + (e.message || 'Failed') + '</span>';
    }
}

// Queue system removed — emails now send directly via SMTP on order placement

// ── Logs ─────────────────────────────────────────────────────────────────────
async function loadLogs() {
    var status = document.getElementById('logFilter').value;
    var url = '/email/logs?per_page=50' + (status ? '&status=' + status : '');
    try {
        var r = await emailApi(url);
        var logs = r.data || [];
        if (!logs.length) {
            document.getElementById('logTableBody').innerHTML = '<tr><td colspan="7" style="text-align:center;color:#64748b;padding:20px">No logs yet</td></tr>';
            return;
        }
        var html = '';
        for (var x = 0; x < logs.length; x++) {
            var l = logs[x];
            html += '<tr><td>' + (l.sent_at || '-') + '</td><td>' + (l.email_type || '-') + '</td><td>' + (l.recipient || '-') + '</td><td>' + (l.subject || '-') + '</td><td>' + (l.order_id ? '#'+l.order_id : '-') + '</td><td><span class="badge badge-' + l.status + '">' + l.status.toUpperCase() + '</span></td><td style="color:#fca5a5;font-size:11px">' + (l.error_message || '-') + '</td></tr>';
        }
        document.getElementById('logTableBody').innerHTML = html;
    } catch(e) {
        document.getElementById('logTableBody').innerHTML = '<tr><td colspan="7" style="text-align:center;color:#64748b;padding:20px">No logs (run SQL migration)</td></tr>';
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
</body>
</html>
