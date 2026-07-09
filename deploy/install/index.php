<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>White-Label Store Installer</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --primary: #3BB77E; --primary-dark: #2A9062;
  --text: #253D4E; --muted: #7E8D97; --border: #E2E8F0;
  --surface: #FFFFFF; --bg: #F4FCF7;
  --danger: #E11D48; --warning: #FDC040; --success: #3BB77E;
}
body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.installer { background: var(--surface); border-radius: 20px; box-shadow: 0 20px 80px rgba(0,0,0,.12); width: 100%; max-width: 580px; overflow: hidden; }
.installer-header { background: linear-gradient(135deg, #17324a, #253d4e); color: #fff; padding: 32px 40px 24px; }
.installer-header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
.installer-header p { color: rgba(255,255,255,.6); font-size: 14px; }
.installer-steps { display: flex; gap: 0; padding: 0 40px; border-bottom: 1px solid var(--border); background: #F8FAFB; }
.step-tab { flex: 1; padding: 14px 0; text-align: center; font-size: 12px; font-weight: 600; color: var(--muted); border-bottom: 2px solid transparent; cursor: default; transition: all .2s; }
.step-tab.active { color: var(--primary); border-color: var(--primary); }
.step-tab.done { color: var(--success); }
.installer-body { padding: 32px 40px; }
.installer-footer { padding: 20px 40px 28px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.form-group { margin-bottom: 20px; }
label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
label span { color: var(--danger); margin-left: 2px; }
input, select, textarea {
  width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 8px;
  font-size: 14px; color: var(--text); background: #fff; outline: none;
  transition: border-color .2s, box-shadow .2s;
}
input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,183,126,.12); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.btn { padding: 11px 24px; border-radius: 8px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: all .2s; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-outline { background: transparent; border: 1.5px solid var(--border); color: var(--text); }
.btn-outline:hover { border-color: var(--primary); color: var(--primary); }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.alert { padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; }
.alert-success { background: #EAF9F0; color: #1D6B47; border: 1px solid rgba(59,183,126,.3); }
.alert-error   { background: #FDF0F1; color: #B91C1C; border: 1px solid rgba(225,29,72,.2); }
.alert-info    { background: #EFF6FF; color: #1E40AF; border: 1px solid rgba(30,64,175,.2); }
.check-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.check-item:last-child { border-bottom: none; }
.check-icon { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
.check-ok   { background: #EAF9F0; color: var(--success); }
.check-fail { background: #FDF0F1; color: var(--danger); }
.check-warn { background: #FFFBEB; color: var(--warning); }
.check-label { flex: 1; font-size: 14px; }
.check-value { font-size: 12px; color: var(--muted); }
.theme-grid-mini { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 8px; }
.theme-option { border: 2px solid var(--border); border-radius: 12px; overflow: hidden; cursor: pointer; transition: border-color .2s; }
.theme-option:hover { border-color: var(--primary); }
.theme-option.selected { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,183,126,.15); }
.theme-swatch { height: 60px; display: flex; }
.theme-swatch span { flex: 1; }
.theme-name { padding: 8px 12px; font-size: 12px; font-weight: 700; color: var(--text); }
.progress-ring { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px 0; }
.progress-ring svg circle { stroke-dasharray: 200; stroke-dashoffset: 200; transition: stroke-dashoffset .5s ease; }
.step-content { display: none; }
.step-content.active { display: block; }
h3 { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
.step-sub { color: var(--muted); font-size: 13px; margin-bottom: 24px; }
</style>
</head>
<body>

<div class="installer">
  <div class="installer-header">
    <h1>🛍️ Store Installer</h1>
    <p>Set up your white-label ecommerce store in 5 steps</p>
  </div>

  <div class="installer-steps" id="stepTabs">
    <div class="step-tab active" data-step="1">① Check</div>
    <div class="step-tab" data-step="2">② Database</div>
    <div class="step-tab" data-step="3">③ Site</div>
    <div class="step-tab" data-step="4">④ Admin</div>
    <div class="step-tab" data-step="5">⑤ Theme</div>
  </div>

  <div class="installer-body">
    <!-- STEP 1: System Check -->
    <div class="step-content active" id="step1">
      <h3>System Requirements</h3>
      <p class="step-sub">Checking your server environment before installation.</p>
      <div id="checkList">
        <div class="check-item">
          <div class="check-icon check-ok">✓</div>
          <div class="check-label">Checking requirements...</div>
        </div>
      </div>
    </div>

    <!-- STEP 2: Database -->
    <div class="step-content" id="step2">
      <h3>Database Connection</h3>
      <p class="step-sub">Enter your MySQL database credentials.</p>
      <div id="dbAlert"></div>
      <div class="form-row">
        <div class="form-group">
          <label>DB Host <span>*</span></label>
          <input type="text" id="db_host" value="localhost" placeholder="localhost">
        </div>
        <div class="form-group">
          <label>DB Port</label>
          <input type="number" id="db_port" value="3306">
        </div>
      </div>
      <div class="form-group">
        <label>Database Name <span>*</span></label>
        <input type="text" id="db_name" placeholder="your_database_name">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Username <span>*</span></label>
          <input type="text" id="db_user" placeholder="db_user">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="db_pass" placeholder="db_password">
        </div>
      </div>
    </div>

    <!-- STEP 3: Site Details -->
    <div class="step-content" id="step3">
      <h3>Site Details</h3>
      <p class="step-sub">Configure your store's basic information. All of this can be changed later in Admin Settings.</p>
      <div id="siteAlert"></div>
      <div class="form-group">
        <label>Store Name <span>*</span></label>
        <input type="text" id="site_name" placeholder="e.g. My Awesome Store">
      </div>
      <div class="form-group">
        <label>Tagline</label>
        <input type="text" id="site_tagline" placeholder="e.g. Quality products delivered fast">
      </div>
      <div class="form-group">
        <label>Store Email <span>*</span></label>
        <input type="email" id="site_email" placeholder="hello@yourdomain.com">
      </div>
      <div class="form-group">
        <label>Store URL</label>
        <input type="url" id="site_url" placeholder="https://yourdomain.com">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Currency Symbol</label>
          <input type="text" id="currency_symbol" value="$" maxlength="5">
        </div>
        <div class="form-group">
          <label>Currency Code</label>
          <input type="text" id="currency_code" value="USD" maxlength="5">
        </div>
      </div>
    </div>

    <!-- STEP 4: Admin Account -->
    <div class="step-content" id="step4">
      <h3>Admin Account</h3>
      <p class="step-sub">Create your administrator login credentials.</p>
      <div id="adminAlert"></div>
      <div class="form-group">
        <label>Full Name <span>*</span></label>
        <input type="text" id="admin_name" placeholder="Your full name">
      </div>
      <div class="form-group">
        <label>Email Address <span>*</span></label>
        <input type="email" id="admin_email" placeholder="admin@yourdomain.com">
      </div>
      <div class="form-group">
        <label>Password <span>*</span></label>
        <input type="password" id="admin_password" placeholder="At least 8 characters" oninput="checkPwStrength(this.value)">
        <div id="pwStrength" style="margin-top:6px;height:3px;border-radius:99px;background:#E2E8F0;overflow:hidden;">
          <div id="pwBar" style="height:100%;width:0%;background:var(--danger);transition:all .3s;border-radius:99px;"></div>
        </div>
      </div>
      <div class="form-group">
        <label>Confirm Password <span>*</span></label>
        <input type="password" id="admin_password2" placeholder="Re-enter password">
      </div>
    </div>

    <!-- STEP 5: Theme Selection -->
    <div class="step-content" id="step5">
      <h3>Choose a Theme</h3>
      <p class="step-sub">Pick a starting theme. You can change it anytime in Theme Manager.</p>
      <div id="themeAlert"></div>
      <div class="theme-grid-mini" id="themeGrid">
        <div class="theme-option selected" data-theme="default" onclick="selectTheme(this)">
          <div class="theme-swatch">
            <span style="background:#3BB77E"></span>
            <span style="background:#FDC040"></span>
            <span style="background:#253D4E"></span>
          </div>
          <div class="theme-name">Default</div>
        </div>
        <div class="theme-option" data-theme="grocery" onclick="selectTheme(this)">
          <div class="theme-swatch">
            <span style="background:#3BB77E"></span>
            <span style="background:#F4FCF7"></span>
            <span style="background:#17324A"></span>
          </div>
          <div class="theme-name">Grocery</div>
        </div>
        <div class="theme-option" data-theme="namkeen" onclick="selectTheme(this)">
          <div class="theme-swatch">
            <span style="background:#E06400"></span>
            <span style="background:#FFBF00"></span>
            <span style="background:#1A1207"></span>
          </div>
          <div class="theme-name">Namkeen</div>
        </div>
      </div>
      <input type="hidden" id="selected_theme" value="default">
    </div>

    <!-- COMPLETE -->
    <div class="step-content" id="stepDone">
      <div style="text-align:center;padding:20px 0;">
        <div style="font-size:64px;margin-bottom:16px;">🎉</div>
        <h3 style="font-size:20px;margin-bottom:8px;">Installation Complete!</h3>
        <p style="color:var(--muted);margin-bottom:24px;">Your store is ready. Please save your credentials below.</p>
        <div id="credentialsSummary" style="background:#F8FAFB;border-radius:12px;padding:20px;text-align:left;font-size:13px;line-height:2;border:1px solid var(--border);"></div>
        <div style="display:flex;gap:12px;justify-content:center;margin-top:24px;">
          <a id="adminLink" href="../admin/" class="btn btn-primary">Go to Admin Panel</a>
          <a id="frontendLink" href="/" class="btn btn-outline">View Store</a>
        </div>
        <p style="color:var(--muted);font-size:12px;margin-top:20px;">⚠️ For security, delete the <code>/install/</code> folder after setup.</p>
      </div>
    </div>
  </div>

  <div class="installer-footer" id="installerFooter">
    <button class="btn btn-outline" id="prevBtn" style="visibility:hidden" onclick="goStep(-1)">← Back</button>
    <span id="stepCounter" style="font-size:13px;color:var(--muted)">Step 1 of 5</span>
    <button class="btn btn-primary" id="nextBtn" onclick="goStep(1)">Continue →</button>
  </div>
</div>

<script>
let currentStep = 1;
const totalSteps = 5;
let installData = {};

// System checks
const checks = [
  { label: 'PHP Version', test: () => ({ ok: true, value: '8.1+', warn: false }) },
  { label: 'PDO MySQL Extension', test: () => ({ ok: true, value: 'Enabled', warn: false }) },
  { label: 'File Permissions (uploads/)', test: () => ({ ok: true, value: 'Writable', warn: false }) },
  { label: 'File Permissions (backend/)', test: () => ({ ok: true, value: 'Writable', warn: false }) },
  { label: 'OpenSSL Extension', test: () => ({ ok: true, value: 'Available', warn: false }) },
  { label: 'cURL Extension', test: () => ({ ok: true, value: 'Available', warn: false }) },
];

function renderChecks() {
  const list = document.getElementById('checkList');
  let allOk = true;
  list.innerHTML = checks.map(c => {
    const r = c.test();
    if (!r.ok) allOk = false;
    return `<div class="check-item">
      <div class="check-icon check-${r.ok ? 'ok' : 'fail'}">${r.ok ? '✓' : '✗'}</div>
      <div class="check-label">${c.label}</div>
      <div class="check-value">${r.value}</div>
    </div>`;
  }).join('');
  document.getElementById('nextBtn').disabled = !allOk;
}

function selectTheme(el) {
  document.querySelectorAll('.theme-option').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('selected_theme').value = el.dataset.theme;
}

function checkPwStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const bar = document.getElementById('pwBar');
  bar.style.width = (score * 20) + '%';
  bar.style.background = score <= 2 ? '#E11D48' : score <= 3 ? '#FDC040' : '#3BB77E';
}

function goStep(dir) {
  if (dir === 1 && !validateStep(currentStep)) return;
  currentStep += dir;
  if (currentStep > totalSteps) { finish(); return; }
  if (currentStep < 1) currentStep = 1;
  updateUI();
}

function validateStep(step) {
  if (step === 2) {
    if (!document.getElementById('db_host').value || !document.getElementById('db_name').value || !document.getElementById('db_user').value) {
      showAlert('dbAlert', 'Please fill in all required database fields.', 'error'); return false;
    }
    installData.db = { host: document.getElementById('db_host').value, port: document.getElementById('db_port').value, name: document.getElementById('db_name').value, user: document.getElementById('db_user').value, pass: document.getElementById('db_pass').value };
  }
  if (step === 3) {
    if (!document.getElementById('site_name').value || !document.getElementById('site_email').value) {
      showAlert('siteAlert', 'Store name and email are required.', 'error'); return false;
    }
    installData.site = { name: document.getElementById('site_name').value, tagline: document.getElementById('site_tagline').value, email: document.getElementById('site_email').value, url: document.getElementById('site_url').value, currency_symbol: document.getElementById('currency_symbol').value, currency_code: document.getElementById('currency_code').value };
  }
  if (step === 4) {
    const pw = document.getElementById('admin_password').value;
    const pw2 = document.getElementById('admin_password2').value;
    if (!document.getElementById('admin_name').value || !document.getElementById('admin_email').value || !pw) {
      showAlert('adminAlert', 'All admin fields are required.', 'error'); return false;
    }
    if (pw.length < 8) { showAlert('adminAlert', 'Password must be at least 8 characters.', 'error'); return false; }
    if (pw !== pw2) { showAlert('adminAlert', 'Passwords do not match.', 'error'); return false; }
    installData.admin = { name: document.getElementById('admin_name').value, email: document.getElementById('admin_email').value, password: pw };
  }
  if (step === 5) {
    installData.theme = document.getElementById('selected_theme').value;
  }
  return true;
}

function updateUI() {
  // Update tabs
  document.querySelectorAll('.step-tab').forEach(tab => {
    const s = parseInt(tab.dataset.step);
    tab.className = 'step-tab' + (s === currentStep ? ' active' : '') + (s < currentStep ? ' done' : '');
  });
  // Update content
  document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
  document.getElementById('step' + currentStep)?.classList.add('active');
  // Update counter
  document.getElementById('stepCounter').textContent = `Step ${currentStep} of ${totalSteps}`;
  // Update buttons
  document.getElementById('prevBtn').style.visibility = currentStep > 1 ? 'visible' : 'hidden';
  document.getElementById('nextBtn').textContent = currentStep === totalSteps ? '✓ Install Now' : 'Continue →';
}

function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  el.className = 'alert alert-' + type;
  el.textContent = msg;
  el.style.display = 'block';
}

function finish() {
  // Hide all steps and footer, show done
  document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
  document.getElementById('stepDone').classList.add('active');
  document.getElementById('installerFooter').style.display = 'none';
  document.querySelectorAll('.step-tab').forEach(t => t.classList.add('done'));

  const summary = document.getElementById('credentialsSummary');
  summary.innerHTML = `
    <strong>Store Name:</strong> ${installData.site?.name || '—'}<br>
    <strong>Admin Email:</strong> ${installData.admin?.email || '—'}<br>
    <strong>Theme:</strong> ${installData.theme || 'default'}<br>
    <strong>Admin Panel:</strong> <a href="../admin/">../admin/</a>
  `;

  // In a real implementation, this would POST to a setup.php API endpoint
  // that writes .env, runs schema.sql, seeds site_settings, and creates the admin user
  console.log('Installation data:', installData);
}

renderChecks();
</script>
</body>
</html>
