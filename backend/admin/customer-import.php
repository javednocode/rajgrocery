<?php $pageTitle = 'Customer Import'; include 'includes/header.php'; ?>

<style>
.ci-resume-banner { display:none; align-items:center; justify-content:space-between; gap:12px; background:rgba(37,99,235,.08); border:1px solid rgba(37,99,235,.25); border-radius:10px; padding:12px 16px; margin-bottom:16px; }
.ci-resume-banner strong { display:block; font-size:13px; }
.ci-resume-banner span { font-size:12px; color:var(--admin-text-muted); }
.ci-steps { display:flex; gap:6px; margin-bottom:18px; flex-wrap:wrap; }
.ci-step { display:flex; align-items:center; gap:7px; padding:7px 12px; border-radius:999px; border:1px solid var(--admin-border); font-size:12px; font-weight:700; color:var(--admin-text-muted); }
.ci-step.active { border-color:var(--admin-primary); color:var(--admin-primary); background:rgba(37,99,235,.08); }
.ci-step.done { border-color:#16a34a; color:#16a34a; background:rgba(22,163,74,.08); }
.ci-step b { display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:currentColor; color:#fff; font-size:10.5px; }
.ci-step.active b, .ci-step.done b { background:currentColor; }
.ci-panel { display:none; }
.ci-panel.active { display:block; }
.ci-drop { border:2px dashed var(--admin-border); border-radius:12px; padding:36px 20px; text-align:center; cursor:pointer; transition:border-color .2s, background .2s; }
.ci-drop:hover, .ci-drop.drag { border-color:var(--admin-primary); background:rgba(37,99,235,.04); }
.ci-drop input { display:none; }
.ci-drop svg { color:var(--admin-text-muted); margin-bottom:10px; }
.ci-drop p { font-size:13px; color:var(--admin-text-muted); margin:4px 0 0; }
.ci-table-wrap { overflow-x:auto; border:1px solid var(--admin-border); border-radius:10px; }
.ci-table { width:100%; border-collapse:collapse; font-size:12.5px; white-space:nowrap; }
.ci-table th { text-align:left; color:var(--admin-text-muted); font-size:11px; text-transform:uppercase; letter-spacing:.04em; padding:9px 12px; border-bottom:1px solid var(--admin-border); background:var(--admin-bg); position:sticky; top:0; }
.ci-table td { padding:9px 12px; border-bottom:1px solid var(--admin-border); }
.ci-map-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 16px; margin:16px 0; }
.ci-map-row { display:flex; align-items:center; gap:10px; }
.ci-map-row label { flex:0 0 168px; font-size:12.5px; font-weight:700; }
.ci-map-row label.required::after { content:' *'; color:#dc2626; }
.ci-map-row select { flex:1; }
/* 5 stat cards */
.ci-summary { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin:14px 0; }
.ci-summary .stat { border:1px solid var(--admin-border); background:var(--admin-bg); border-radius:10px; padding:12px; text-align:center; }
.ci-summary .stat strong { display:block; font-size:22px; }
.ci-summary .stat span { display:block; color:var(--admin-text-muted); font-size:11px; margin-top:3px; }
.ci-summary .stat.warn strong { color:#d97706; }
.ci-summary .stat.bad strong { color:#dc2626; }
.ci-summary .stat.good strong { color:#16a34a; }
.ci-summary .stat.info strong { color:#2563eb; }
/* validate summary = 4 cols */
.ci-summary-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:14px 0; }
.ci-summary-4 .stat { border:1px solid var(--admin-border); background:var(--admin-bg); border-radius:10px; padding:12px; text-align:center; }
.ci-summary-4 .stat strong { display:block; font-size:22px; }
.ci-summary-4 .stat span { display:block; color:var(--admin-text-muted); font-size:11px; margin-top:3px; }
.ci-summary-4 .stat.warn strong { color:#d97706; }
.ci-summary-4 .stat.bad strong { color:#dc2626; }
.ci-summary-4 .stat.good strong { color:#16a34a; }
.ci-progress { height:14px; background:var(--admin-hover); border-radius:99px; overflow:hidden; margin:14px 0 6px; }
.ci-progress span { display:block; height:100%; width:0%; background:linear-gradient(90deg,var(--admin-primary),#22c55e); transition:width .25s; }
.ci-log { background:#0d1117; border-radius:10px; padding:12px; min-height:140px; max-height:260px; overflow:auto; color:#c9d1d9; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px; margin-top:14px; }
.ci-log div { padding:3px 0; border-bottom:1px solid rgba(255,255,255,.04); }
.ci-log .success { color:#4ade80; } .ci-log .warning { color:#facc15; } .ci-log .error { color:#f87171; } .ci-log .info { color:#93c5fd; }
.ci-history { width:100%; border-collapse:collapse; font-size:12.5px; }
.ci-history th { text-align:left; color:var(--admin-text-muted); font-size:11px; text-transform:uppercase; letter-spacing:.05em; padding:10px; border-bottom:1px solid var(--admin-border); }
.ci-history td { padding:10px; border-bottom:1px solid var(--admin-border); vertical-align:top; }
.ci-pill { display:inline-flex; align-items:center; border-radius:999px; padding:3px 8px; font-size:11px; font-weight:700; border:1px solid var(--admin-border); }
.ci-pill.pending, .ci-pill.running { color:#2563eb; background:rgba(37,99,235,.1); }
.ci-pill.completed { color:#16a34a; background:rgba(22,163,74,.1); }
.ci-pill.failed { color:#dc2626; background:rgba(220,38,38,.1); }
.ci-pill.rolled_back { color:#a16207; background:rgba(161,98,7,.1); }
.ci-actions { display:flex; gap:6px; flex-wrap:wrap; margin-top:18px; }
.ci-cell-err { color:#dc2626; }
.ci-wp-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(37,99,235,.07); border:1px solid rgba(37,99,235,.2); border-radius:6px; padding:3px 8px; font-size:11px; font-weight:700; color:#2563eb; }
@media(max-width:900px){ .ci-map-grid{grid-template-columns:1fr;} .ci-summary{grid-template-columns:repeat(2,1fr);} .ci-summary-4{grid-template-columns:repeat(2,1fr);} }
@media(max-width:480px){ .ci-summary{grid-template-columns:1fr 1fr;} }
</style>

<div class="toolbar">
  <div>
    <h3 style="font-size:16px;margin:0;display:flex;align-items:center;gap:8px;">
      Customer Import
      <span class="ci-wp-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
        WordPress Plugin Compatible
      </span>
    </h3>
    <p style="font-size:12px;color:var(--admin-text-muted);margin:4px 0 0;">
      Import customers from the <strong>WordPress "Import Export Users and Customers"</strong> plugin CSV export.
      Columns are auto-detected — no manual mapping needed for standard WooCommerce exports.
      WordPress password hashes are <strong>never imported</strong>; customers must use Forgot Password to set a new password.
    </p>
  </div>
  <button class="btn btn-outline btn-sm" onclick="loadHistory()">Refresh History</button>
</div>

<div id="resumeBanner" class="ci-resume-banner">
  <div>
    <strong id="resumeTitle">Interrupted import found</strong>
    <span id="resumeSub"></span>
  </div>
  <button class="btn btn-primary btn-sm" onclick="resumeInterrupted()">▶ Resume Import</button>
</div>

<div class="card">
  <div class="card-body">

    <div class="ci-steps">
      <div class="ci-step active" id="step-upload"><b>1</b> Upload</div>
      <div class="ci-step" id="step-map"><b>2</b> Field Mapping</div>
      <div class="ci-step" id="step-validate"><b>3</b> Validate</div>
      <div class="ci-step" id="step-import"><b>4</b> Import</div>
    </div>

    <!-- ── Step 1: Upload ── -->
    <div class="ci-panel active" id="panel-upload">
      <label class="ci-drop" id="dropZone">
        <input type="file" id="fileInput" accept=".csv,.xlsx,.xls" onchange="onFileChosen(this.files)">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <div style="font-weight:700;font-size:14px;">Click to choose a CSV or XLSX file</div>
        <p>Drag and drop works too — WordPress "Import Export Users and Customers" exports work directly with zero manual mapping.</p>
        <p style="margin-top:8px;font-size:11px;opacity:.7;">Tip: Use the plugin's Export → WooCommerce Customers option. The importer ignores <code>user_pass</code> automatically.</p>
      </label>
      <div id="uploadStatus" class="pm-help" style="margin-top:10px;font-size:12px;color:var(--admin-text-muted);"></div>
    </div>

    <!-- ── Step 2: Preview + Mapping ── -->
    <div class="ci-panel" id="panel-map">
      <h4 style="font-size:13px;margin-bottom:8px;">Field Mapping</h4>
      <p style="font-size:12px;color:var(--admin-text-muted);margin-bottom:4px;">
        Columns were auto-detected from your file's headers. For a standard WordPress plugin export, all fields should already be mapped.
        Review and adjust anything that needs correcting — <strong>Email</strong> is the only required field.
        WordPress <code>user_pass</code> hashes are silently ignored and will <strong>never</strong> be imported.
      </p>
      <div class="ci-map-grid" id="mapGrid"></div>

      <h4 style="font-size:13px;margin:18px 0 8px;">Preview — first 20 rows</h4>
      <div class="ci-table-wrap"><table class="ci-table"><thead id="previewHead"></thead><tbody id="previewBody"></tbody></table></div>

      <div class="ci-actions">
        <button class="btn btn-outline btn-sm" onclick="resetImporter()">Start Over</button>
        <button class="btn btn-primary btn-sm" id="validateBtn" onclick="runValidate()">Validate →</button>
      </div>
    </div>

    <!-- ── Step 3: Validate summary ── -->
    <div class="ci-panel" id="panel-validate">
      <h4 style="font-size:13px;margin-bottom:8px;">Validation Summary</h4>
      <div class="ci-summary-4">
        <div class="stat good"><strong id="valTotal">0</strong><span>Total Rows</span></div>
        <div class="stat good"><strong id="valValid">0</strong><span>Ready to Import</span></div>
        <div class="stat warn"><strong id="valDupes">0</strong><span>Duplicates (skipped)</span></div>
        <div class="stat bad"><strong id="valInvalid">0</strong><span>Invalid</span></div>
      </div>
      <div id="valIssuesWrap" style="display:none;">
        <h4 style="font-size:13px;margin:14px 0 8px;">Rows needing attention</h4>
        <div class="ci-table-wrap"><table class="ci-table">
          <thead><tr><th>Row</th><th>Email</th><th>Status</th><th>Reason</th></tr></thead>
          <tbody id="valIssuesBody"></tbody>
        </table></div>
      </div>
      <div style="margin-top:14px;padding:10px 12px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.2);border-radius:8px;font-size:12px;">
        <strong>🔐 Password policy:</strong> All imported customers will have <code>password_reset_required = true</code>.
        They must use the <em>Forgot Password</em> flow to set a new password. No WordPress hashes are stored.
      </div>
      <div class="ci-actions">
        <button class="btn btn-outline btn-sm" onclick="showPanel('map')">← Back to Mapping</button>
        <button class="btn btn-primary btn-sm" id="startImportBtn" onclick="startImport()">Start Import →</button>
      </div>
    </div>

    <!-- ── Step 4: Import progress ── -->
    <div class="ci-panel" id="panel-import">
      <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:6px;">
        <strong id="jobTitle" style="font-size:13px;">Importing…</strong>
        <span class="ci-pill" id="jobStatus">running</span>
      </div>
      <div class="ci-progress"><span id="progressBar"></span></div>
      <div style="font-size:12px;color:var(--admin-text-muted);"><span id="progressText">0 / 0 processed</span></div>
      <!-- 5-column stats: Total · Imported · Updated · Skipped · Failed -->
      <div class="ci-summary">
        <div class="stat"><strong id="statTotal">0</strong><span>Total</span></div>
        <div class="stat good"><strong id="statImported">0</strong><span>Imported</span></div>
        <div class="stat info"><strong id="statUpdated">0</strong><span>Updated</span></div>
        <div class="stat warn"><strong id="statSkipped">0</strong><span>Skipped</span></div>
        <div class="stat bad"><strong id="statFailed">0</strong><span>Failed</span></div>
      </div>
      <div class="ci-log" id="jobLog"></div>
      <div class="ci-actions" id="jobDoneActions" style="display:none;">
        <a class="btn btn-outline btn-sm" id="downloadFailedBtn" href="#" target="_blank">⬇ Download Failed Rows CSV</a>
        <a class="btn btn-outline btn-sm" id="downloadReportBtn" href="#" target="_blank">⬇ Download Full Report CSV</a>
        <button class="btn btn-danger btn-sm" onclick="rollbackJob(currentJobId)">Rollback This Import</button>
        <button class="btn btn-primary btn-sm" onclick="resetImporter()">Import Another File</button>
      </div>
    </div>

  </div>
</div>

<div class="card" style="margin-top:16px;">
  <div class="card-header"><h3>Import History</h3></div>
  <div class="card-body" style="overflow-x:auto;">
    <table class="ci-history">
      <thead><tr><th>Date</th><th>File</th><th>Status</th><th>Progress</th><th>Results</th><th>Actions</th></tr></thead>
      <tbody id="historyBody"><tr><td colspan="6">Loading…</td></tr></tbody>
    </table>
  </div>
</div>

<script>
// WordPress plugin field labels — includes new WP-specific fields
const CI_FIELDS_FALLBACK = {
  username:'Username', first_name:'First Name', last_name:'Last Name',
  display_name:'Display Name', email:'Email', phone:'Phone', company:'Company',
  billing_address:'Billing Address', billing_city:'Billing City',
  billing_state:'Billing State', billing_country:'Billing Country',
  billing_postal_code:'Billing Postcode',
  shipping_address:'Shipping Address', shipping_city:'Shipping City',
  shipping_state:'Shipping State', shipping_country:'Shipping Country',
  shipping_postal_code:'Shipping Postcode',
  customer_role:'Customer Role', account_created_at:'Registration Date',
  external_customer_id:'Customer ID'
};
const REQUIRED_FIELDS = ['email'];

let uploadState = null;   // { file_token, file_ext, filename, headers, fields, raw_preview, total_rows }
let currentMapping = {};
let currentJobId = null;
let pollTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  checkResumable();
  loadHistory();
  const zone = document.getElementById('dropZone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag');
    if (e.dataTransfer.files.length) onFileChosen(e.dataTransfer.files);
  });
});

function showPanel(name) {
  document.querySelectorAll('.ci-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  const order = ['upload','map','validate','import'];
  order.forEach(s => {
    const el = document.getElementById('step-' + s);
    el.classList.toggle('active', s === name);
    el.classList.toggle('done', order.indexOf(s) < order.indexOf(name));
  });
}

function resetImporter() {
  uploadState = null; currentMapping = {}; currentJobId = null;
  if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
  document.getElementById('fileInput').value = '';
  document.getElementById('uploadStatus').textContent = '';
  showPanel('upload');
  loadHistory();
}

// ── Step 1: Upload ──────────────────────────────────────────────────────
async function onFileChosen(files) {
  if (!files || !files.length) return;
  const file = files[0];
  document.getElementById('uploadStatus').textContent = 'Analyzing ' + file.name + '…';
  const fd = new FormData();
  fd.append('file', file);
  try {
    const res = await api('/customer-import/preview', 'POST', fd, true);
    if (!res.success) { showAlert(res.message || 'Could not parse file', 'danger'); document.getElementById('uploadStatus').textContent=''; return; }
    uploadState = res.data;
    currentMapping = { ...uploadState.suggested_mapping };
    renderMapping();
    renderPreview();
    showPanel('map');
  } catch (e) {
    showAlert('Upload failed: ' + e.message, 'danger');
    document.getElementById('uploadStatus').textContent = '';
  }
}

// ── Step 2: Mapping + live preview ──────────────────────────────────────
function fieldLabels() { return uploadState?.fields || CI_FIELDS_FALLBACK; }

function renderMapping() {
  const fields = fieldLabels();
  const headers = uploadState.headers || [];
  const grid = document.getElementById('mapGrid');
  grid.innerHTML = Object.keys(fields).map(field => {
    const label = fields[field];
    const required = REQUIRED_FIELDS.includes(field);
    const options = ['<option value="">— Not mapped —</option>']
      .concat(headers.map(h => `<option value="${escAttr(h)}" ${currentMapping[field]===h?'selected':''}>${escHtml(h)}</option>`));
    return `<div class="ci-map-row">
      <label class="${required?'required':''}">${escHtml(label)}</label>
      <select class="form-control" data-field="${field}" onchange="onMappingChange('${field}', this.value)">${options.join('')}</select>
    </div>`;
  }).join('');
}

function onMappingChange(field, header) {
  if (header) currentMapping[field] = header; else delete currentMapping[field];
  renderPreview();
}

function applyMapping(rawRow, mapping) {
  const out = {};
  for (const field in fieldLabels()) {
    const header = mapping[field];
    out[field] = header ? (rawRow[header] ?? '') : '';
  }
  return out;
}

function renderPreview() {
  const fields = fieldLabels();
  const fieldKeys = Object.keys(fields);
  document.getElementById('previewHead').innerHTML = '<tr>' + fieldKeys.map(f => `<th>${escHtml(fields[f])}</th>`).join('') + '</tr>';
  const rows = (uploadState.raw_preview || []).map(raw => applyMapping(raw, currentMapping));
  document.getElementById('previewBody').innerHTML = rows.map(r =>
    '<tr>' + fieldKeys.map(f => `<td>${escHtml(r[f] || '—')}</td>`).join('') + '</tr>'
  ).join('') || '<tr><td colspan="' + fieldKeys.length + '" style="text-align:center;color:var(--admin-text-muted);">No rows</td></tr>';
}

// ── Step 3: Validate ─────────────────────────────────────────────────────
async function runValidate() {
  if (!currentMapping.email) { showAlert('Map the Email column before validating', 'danger'); return; }
  const btn = document.getElementById('validateBtn');
  btn.disabled = true; btn.textContent = 'Validating…';
  try {
    const res = await api('/customer-import/validate', 'POST', {
      file_token: uploadState.file_token, file_ext: uploadState.file_ext, mapping: JSON.stringify(currentMapping)
    });
    if (!res.success) { showAlert(res.message || 'Validation failed', 'danger'); return; }
    const s = res.data.summary;
    document.getElementById('valTotal').textContent = s.total;
    document.getElementById('valValid').textContent = s.valid;
    document.getElementById('valDupes').textContent = s.duplicate_in_db + s.duplicate_in_file;
    document.getElementById('valInvalid').textContent = s.invalid;

    const issues = res.data.rows || [];
    document.getElementById('valIssuesWrap').style.display = issues.length ? '' : 'none';
    document.getElementById('valIssuesBody').innerHTML = issues.map(r =>
      `<tr><td>${r.row}</td><td>${escHtml(r.email||'—')}</td><td class="ci-cell-err">${r.status}</td><td>${escHtml(r.reason||'')}</td></tr>`
    ).join('');

    showPanel('validate');
  } catch (e) {
    showAlert('Validation error: ' + e.message, 'danger');
  } finally {
    btn.disabled = false; btn.textContent = 'Validate →';
  }
}

// ── Step 4: Create job + chunked processing (100 rows/batch per req #8) ──
async function startImport() {
  document.getElementById('startImportBtn').disabled = true;
  try {
    const res = await api('/customer-import/jobs', 'POST', {
      file_token: uploadState.file_token, file_ext: uploadState.file_ext,
      filename: uploadState.filename, mapping: JSON.stringify(currentMapping)
    });
    if (!res.success) { showAlert(res.message || 'Could not start import', 'danger'); document.getElementById('startImportBtn').disabled=false; return; }
    currentJobId = res.data.id;
    showPanel('import');
    document.getElementById('jobDoneActions').style.display = 'none';
    document.getElementById('jobLog').innerHTML = '';
    runProcessLoop();
  } catch (e) {
    showAlert('Could not start import: ' + e.message, 'danger');
    document.getElementById('startImportBtn').disabled = false;
  }
}

async function runProcessLoop() {
  let chunkCount = 0;
  while (true) {
    let job;
    try {
      // Batch size 100 per requirement #8
      const res = await api(`/customer-import/jobs/${currentJobId}/process`, 'POST', { limit: 100 });
      if (!res.success) { showAlert(res.message || 'Import error', 'danger'); return; }
      job = res.data;
    } catch (e) {
      showAlert('Import interrupted: ' + e.message + ' — reload this page to resume.', 'danger');
      return;
    }
    renderJob(job);
    chunkCount++;
    if (chunkCount % 3 === 0 || job.status === 'completed') await refreshLog();
    if (job.status === 'completed' || job.status === 'failed') { onJobDone(job); return; }
    await new Promise(r => setTimeout(r, 150));
  }
}

function renderJob(job) {
  document.getElementById('jobTitle').textContent = job.filename ? `Importing "${job.filename}"` : 'Importing…';
  const pill = document.getElementById('jobStatus');
  pill.textContent = job.status; pill.className = 'ci-pill ' + job.status;
  document.getElementById('progressBar').style.width = job.progress_percent + '%';
  document.getElementById('progressText').textContent = `${job.processed} / ${job.total} processed (${job.progress_percent}%)`;
  document.getElementById('statTotal').textContent = job.total;
  document.getElementById('statImported').textContent = job.imported;
  document.getElementById('statUpdated').textContent = job.updated || 0;
  document.getElementById('statSkipped').textContent = job.skipped;
  document.getElementById('statFailed').textContent = job.failed;
}

async function refreshLog() {
  try {
    const res = await api(`/customer-import/jobs/${currentJobId}/logs?limit=80`);
    if (!res.success) return;
    const box = document.getElementById('jobLog');
    box.innerHTML = res.data.map(l => `<div class="${l.level}">[${formatDate(l.created_at)}] ${escHtml(l.message)}</div>`).join('');
    box.scrollTop = box.scrollHeight;
  } catch (e) {}
}

function onJobDone(job) {
  document.getElementById('jobDoneActions').style.display = '';
  document.getElementById('downloadFailedBtn').href = `${API_BASE || ''}/customer-import/jobs/${job.id}/failed-csv`;
  document.getElementById('downloadReportBtn').href = `${API_BASE || ''}/customer-import/jobs/${job.id}/report-csv`;
  document.getElementById('downloadFailedBtn').style.display = job.failed > 0 ? '' : 'none';
  loadHistory();
  showAlert(`Import finished: ${job.imported} imported, ${job.updated||0} updated, ${job.skipped} skipped, ${job.failed} failed`, job.failed > 0 ? 'warning' : 'success');
}

// ── Resume an interrupted job (page reload recovery) ────────────────────
async function checkResumable() {
  try {
    const res = await api('/customer-import/resumable');
    if (res.success && res.data) {
      const j = res.data;
      document.getElementById('resumeSub').textContent =
        `${j.filename || 'Untitled import'} — ${j.processed}/${j.total} rows processed`;
      document.getElementById('resumeBanner').style.display = 'flex';
      document.getElementById('resumeBanner').dataset.jobId = j.id;
    }
  } catch (e) {}
}

async function resumeInterrupted() {
  currentJobId = parseInt(document.getElementById('resumeBanner').dataset.jobId, 10);
  document.getElementById('resumeBanner').style.display = 'none';
  showPanel('import');
  document.getElementById('jobDoneActions').style.display = 'none';
  document.getElementById('jobLog').innerHTML = '';
  runProcessLoop();
}

// ── History ───────────────────────────────────────────────────────────
async function loadHistory() {
  try {
    const res = await api('/customer-import/jobs');
    const jobs = res.data || [];
    document.getElementById('historyBody').innerHTML = jobs.map(j => `
      <tr>
        <td style="color:var(--admin-text-dim)">${formatDate(j.created_at)}</td>
        <td>${escHtml(j.filename || '—')}</td>
        <td><span class="ci-pill ${j.status}">${j.status}</span></td>
        <td>${j.processed}/${j.total}</td>
        <td>✓${j.imported} ↻${j.updated||0} ⊘${j.skipped} ✗${j.failed}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap;">
          ${j.failed > 0 ? `<a class="btn btn-outline btn-sm" href="${API_BASE||''}/customer-import/jobs/${j.id}/failed-csv" target="_blank">Failed CSV</a>` : ''}
          <a class="btn btn-outline btn-sm" href="${API_BASE||''}/customer-import/jobs/${j.id}/report-csv" target="_blank">Report</a>
          ${j.status !== 'rolled_back' && j.imported > 0 ? `<button class="btn btn-danger btn-sm" onclick="rollbackJob(${j.id})">Rollback</button>` : ''}
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--admin-text-muted);">No imports yet</td></tr>';
  } catch (e) {}
}

async function rollbackJob(jobId) {
  if (!confirm('Remove every customer this import created? Customers who already have an order are kept.')) return;
  try {
    const res = await api(`/customer-import/jobs/${jobId}/rollback`, 'POST');
    showAlert(res.success ? 'Rollback complete' : (res.message || 'Rollback failed'), res.success ? 'success' : 'danger');
    loadHistory();
  } catch (e) { showAlert('Rollback error: ' + e.message, 'danger'); }
}

// ── Utils ─────────────────────────────────────────────────────────────
function escHtml(s) { return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return escHtml(s).replace(/"/g,'&quot;'); }
</script>

<?php include 'includes/footer.php'; ?>
