<?php $pageTitle = 'Bulk Import'; include 'includes/header.php'; ?>

<style>
/* ── Import Page ────────────────────────────────────────────────── */
.import-stages { display: flex; gap: 0; margin-bottom: 28px; }
.stage {
  flex: 1; padding: 12px 16px; background: var(--admin-card);
  border: 1px solid var(--admin-border); font-size: 13px;
  display: flex; align-items: center; gap: 10px; color: var(--admin-text-muted);
  transition: all 0.3s;
}
.stage:first-child { border-radius: 8px 0 0 8px; }
.stage:last-child  { border-radius: 0 8px 8px 0; }
.stage + .stage    { border-left: none; }
.stage.active  { background: var(--admin-primary); border-color: var(--admin-primary); color: #fff; }
.stage.done    { background: rgba(34,197,94,0.12); border-color: #22C55E; color: #22C55E; }
.stage-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.stage.active .stage-num { background: rgba(255,255,255,0.3); }
.stage.done  .stage-num  { background: #22C55E; color: #fff; }

/* Upload zone */
.upload-zone {
  border: 2.5px dashed var(--admin-border); border-radius: 14px;
  padding: 60px 40px; text-align: center; cursor: pointer;
  transition: all 0.25s; background: var(--admin-bg);
}
.upload-zone:hover, .upload-zone.drag { border-color: var(--admin-primary); background: rgba(var(--admin-primary-rgb,99,102,241),0.04); }
.upload-zone input { display: none; }
.upload-zone .uz-icon { font-size: 48px; margin-bottom: 12px; }
.upload-zone h3 { font-size: 16px; font-weight: 700; margin: 0 0 6px; }
.upload-zone p  { font-size: 13px; color: var(--admin-text-muted); margin: 0; }
.uz-formats { display: flex; gap: 8px; justify-content: center; margin-top: 14px; flex-wrap: wrap; }
.uz-badge { background: var(--admin-hover); border: 1px solid var(--admin-border); border-radius: 6px; padding: 4px 12px; font-size: 12px; font-weight: 600; }

/* Options row */
.import-opts { display: flex; gap: 20px; flex-wrap: wrap; margin: 20px 0; }
.opt-card {
  flex: 1; min-width: 200px; background: var(--admin-card);
  border: 1.5px solid var(--admin-border); border-radius: 10px; padding: 16px;
}
.opt-card label { font-size: 13px; font-weight: 600; display: block; margin-bottom: 8px; }
.opt-card select, .opt-card input { width: 100%; }

/* Preview table */
.preview-wrap { overflow-x: auto; margin: 16px 0; }
.preview-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.preview-table th { background: var(--admin-hover); font-weight: 600; padding: 10px 12px; text-align: left; position: sticky; top: 0; white-space: nowrap; }
.preview-table td { padding: 9px 12px; border-bottom: 1px solid var(--admin-border); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.preview-table tr:hover td { background: var(--admin-hover); }
.preview-count { font-size: 13px; color: var(--admin-text-muted); margin-bottom: 10px; }

/* Progress */
.progress-wrap { margin: 20px 0; }
.progress-bar-outer { height: 12px; background: var(--admin-hover); border-radius: 99px; overflow: hidden; }
.progress-bar-inner { height: 100%; background: linear-gradient(90deg, var(--admin-primary), #a78bfa); border-radius: 99px; transition: width 0.4s ease; width: 0; }
.progress-info { display: flex; justify-content: space-between; font-size: 12px; color: var(--admin-text-muted); margin-top: 6px; }

/* Log */
.import-log {
  background: #0d1117; border-radius: 10px; padding: 16px;
  max-height: 320px; overflow-y: auto; font-family: monospace; font-size: 12px;
  border: 1px solid var(--admin-border);
}
.log-ok    { color: #4ade80; }
.log-skip  { color: #fbbf24; }
.log-error { color: #f87171; }
.log-info  { color: #60a5fa; }

/* Summary cards */
.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 20px; }
.sum-card { background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 10px; padding: 16px; text-align: center; }
.sum-num  { font-size: 28px; font-weight: 800; }
.sum-lbl  { font-size: 12px; color: var(--admin-text-muted); margin-top: 4px; }
.sum-ok   .sum-num { color: #22C55E; }
.sum-upd  .sum-num { color: #3B82F6; }
.sum-skip .sum-num { color: #F59E0B; }
.sum-err  .sum-num { color: #EF4444; }

/* Steps */
#stepUpload, #stepPreview, #stepImport, #stepDone { display: none; }
#stepUpload { display: block; }
</style>

<div class="toolbar">
  <div>
    <h3 style="font-size:16px;margin:0;"> Bulk Product Import</h3>
    <p style="font-size:12px;color:var(--admin-text-muted);margin:4px 0 0;">Import from WooCommerce CSV or XLSX export files</p>
  </div>
  <button class="btn btn-outline btn-sm" onclick="resetImport()">↺ Start Over</button>
</div>

<!-- Stage indicator -->
<div class="import-stages" id="stages">
  <div class="stage active" id="s1"><span class="stage-num">1</span> Upload File</div>
  <div class="stage"        id="s2"><span class="stage-num">2</span> Preview</div>
  <div class="stage"        id="s3"><span class="stage-num">3</span> Import</div>
  <div class="stage"        id="s4"><span class="stage-num"></span> Done</div>
</div>

<!-- ── STEP 1: UPLOAD ── -->
<div id="stepUpload">
  <div class="card"><div class="card-body">
    <div class="upload-zone" id="dropZone" onclick="document.getElementById('importFile').click()"
         ondragover="event.preventDefault();this.classList.add('drag')"
         ondragleave="this.classList.remove('drag')"
         ondrop="handleDrop(event)">
      <input type="file" id="importFile" accept=".csv,.xlsx,.xls" onchange="handleFileSelect(this)">
      <div class="uz-icon"></div>
      <h3>Drop your WooCommerce export here</h3>
      <p>or click to browse your files</p>
      <div class="uz-formats">
        <span class="uz-badge">CSV</span>
        <span class="uz-badge">XLSX</span>
        <span class="uz-badge">WooCommerce Export</span>
      </div>
    </div>

    <div id="fileInfo" style="display:none;margin-top:16px;padding:14px;background:var(--admin-hover);border-radius:8px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:24px;"></span>
      <div>
        <div id="fileName" style="font-weight:600;font-size:14px;"></div>
        <div id="fileSize" style="font-size:12px;color:var(--admin-text-muted);"></div>
      </div>
    </div>

    <div class="import-opts" style="margin-top:20px;">
      <div class="opt-card">
        <label>Duplicate Products</label>
        <select id="optDuplicate" class="form-control">
          <option value="skip">Skip duplicates</option>
          <option value="update">Update existing</option>
        </select>
      </div>
      <div class="opt-card">
        <label>Product Images</label>
        <select id="optImages" class="form-control">
          <option value="1">Download images from URLs</option>
          <option value="0">Store image URLs as-is</option>
        </select>
      </div>
      <div class="opt-card">
        <label>Default Status</label>
        <select id="optStatus" class="form-control">
          <option value="1">Active (published)</option>
          <option value="0">Draft (inactive)</option>
        </select>
      </div>
    </div>

    <div style="margin-top:16px;">
      <button class="btn btn-primary" id="btnPreview" onclick="doPreview()" disabled>
        Preview File →
      </button>
    </div>
  </div></div>

  <!-- WooCommerce export guide -->
  <div class="card" style="margin-top:16px;"><div class="card-body">
    <h4 style="margin:0 0 12px;font-size:14px;"> How to export from WooCommerce</h4>
    <ol style="font-size:13px;color:var(--admin-text-muted);line-height:2;">
      <li>Go to WooCommerce → Products → All Products</li>
      <li>Click <strong>"Export"</strong> at the top</li>
      <li>Select <strong>All columns</strong> and <strong>All products</strong></li>
      <li>Enable <strong>Export custom meta</strong> (for Yoast SEO fields)</li>
      <li>Click <strong>Generate CSV</strong> and download</li>
      <li>Upload the downloaded file above</li>
    </ol>
    <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:8px;padding:12px;font-size:12px;margin-top:10px;">
       <strong>Supported fields:</strong> Name, SKU, Price, Sale Price, Description, Short Description, Categories (with hierarchy), Images (downloaded automatically), Tags, Stock, Weight, SEO Title, SEO Description, Focus Keyword
    </div>
  </div></div>
</div>

<!-- ── STEP 2: PREVIEW ── -->
<div id="stepPreview">
  <div class="card"><div class="card-body">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
      <div>
        <h4 style="margin:0;font-size:15px;">Preview — First 30 Rows</h4>
        <div class="preview-count" id="previewCount"></div>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-outline" onclick="goBack()">← Back</button>
        <button class="btn btn-primary" onclick="startImport()"> Start Import</button>
      </div>
    </div>
    <div class="preview-wrap">
      <table class="preview-table" id="previewTable">
        <thead id="previewHead"></thead>
        <tbody id="previewBody"></tbody>
      </table>
    </div>
  </div></div>
</div>

<!-- ── STEP 3: IMPORTING ── -->
<div id="stepImport">
  <div class="card"><div class="card-body">
    <h4 style="margin:0 0 16px;font-size:15px;">⏳ Importing Products...</h4>
    <div class="progress-wrap">
      <div class="progress-bar-outer">
        <div class="progress-bar-inner" id="progressBar"></div>
      </div>
      <div class="progress-info">
        <span id="progressText">Starting...</span>
        <span id="progressPct">0%</span>
      </div>
    </div>
    <div style="margin-top:8px;font-size:12px;color:var(--admin-text-muted);">
       Do not close this page. Images are being downloaded in the background.
    </div>
    <div class="import-log" id="importLog" style="margin-top:16px;">
      <div class="log-info">▶ Import started...</div>
    </div>
  </div></div>
</div>

<!-- ── STEP 4: DONE ── -->
<div id="stepDone">
  <div class="card"><div class="card-body">
    <h4 style="margin:0 0 6px;font-size:16px;"> Import Complete!</h4>
    <p style="font-size:13px;color:var(--admin-text-muted);margin:0 0 16px;">Your products have been imported successfully.</p>

    <div class="summary-grid">
      <div class="sum-card sum-ok"><div class="sum-num" id="sumImported">0</div><div class="sum-lbl">Imported</div></div>
      <div class="sum-card sum-upd"><div class="sum-num" id="sumUpdated">0</div><div class="sum-lbl">Updated</div></div>
      <div class="sum-card sum-skip"><div class="sum-num" id="sumSkipped">0</div><div class="sum-lbl">Skipped</div></div>
      <div class="sum-card sum-err"><div class="sum-num" id="sumErrors">0</div><div class="sum-lbl">Errors</div></div>
    </div>

    <div class="import-log" id="doneLog" style="margin-top:20px;max-height:240px;"></div>

    <div style="display:flex;gap:12px;margin-top:20px;">
      <a href="products.php" class="btn btn-primary">View Products →</a>
      <button class="btn btn-outline" onclick="resetImport()">Import Another File</button>
    </div>
  </div></div>
</div>

<script>
let _fileToken = '';
let _fileExt   = '';
let _totalRows = 0;
let _selectedFile = null;

// ── File selection ──────────────────────────────────────────────────────────
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
}
function handleFileSelect(inp) {
  if (inp.files[0]) setFile(inp.files[0]);
}
function setFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['csv','xlsx','xls'].includes(ext)) {
    showAlert('Only CSV and XLSX files are supported', 'danger'); return;
  }
  _selectedFile = file;
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = (file.size/1024/1024).toFixed(2) + ' MB';
  const info = document.getElementById('fileInfo');
  info.style.display = 'flex';
  document.getElementById('btnPreview').disabled = false;
}

// ── Step 1 → 2: Preview ────────────────────────────────────────────────────
async function doPreview() {
  if (!_selectedFile) return;
  document.getElementById('btnPreview').textContent = 'Parsing...';
  document.getElementById('btnPreview').disabled = true;

  const fd = new FormData();
  fd.append('file', _selectedFile);

  try {
    const res = await fetch('../api/import/preview', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      body: fd
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    _fileToken = json.data.file_token;
    _fileExt   = _selectedFile.name.split('.').pop().toLowerCase();
    _totalRows = json.data.total_rows;

    buildPreviewTable(json.data.preview);
    document.getElementById('previewCount').textContent =
      `Showing first ${json.data.preview.length} of ${_totalRows} products`;
    setStage(2);
  } catch(e) {
    showAlert('Preview failed: ' + e.message, 'danger');
  }
  document.getElementById('btnPreview').textContent = 'Preview File →';
  document.getElementById('btnPreview').disabled = false;
}

function buildPreviewTable(rows) {
  const cols = ['name','sku','price','sale_price','categories','stock','meta_title'];
  const labels = { name:'Name', sku:'SKU', price:'Price', sale_price:'Sale Price', categories:'Categories', stock:'Stock', meta_title:'SEO Title' };

  const head = document.getElementById('previewHead');
  head.innerHTML = '<tr>' + cols.map(c => `<th>${labels[c]||c}</th>`).join('') + '</tr>';

  const body = document.getElementById('previewBody');
  body.innerHTML = rows.map(r => '<tr>' + cols.map(c =>
    `<td title="${(r[c]||'').replace(/"/g,'&quot;')}">${r[c]||'—'}</td>`
  ).join('') + '</tr>').join('');
}

// ── Step 2 → 3: Import (CHUNKED — batches of 100 to avoid Hostinger timeout) ──
async function startImport() {
  setStage(3);
  setProgress(2, 'Preparing import...');
  appendLog('▶ Starting import of ' + _totalRows + ' products...', 'info');

  const batchSize = 100;
  const totalBatches = Math.ceil(_totalRows / batchSize);
  let totalImported = 0, totalUpdated = 0, totalSkipped = 0, totalErrors = 0;
  let allLogs = [];

  for (let batch = 0; batch < totalBatches; batch++) {
    const offset = batch * batchSize;
    const pct = Math.round(((batch) / totalBatches) * 90) + 5;
    setProgress(pct, `Batch ${batch + 1}/${totalBatches} — importing rows ${offset + 1}–${Math.min(offset + batchSize, _totalRows)}...`);
    appendLog(`▶ Batch ${batch + 1}/${totalBatches} (rows ${offset + 1}–${Math.min(offset + batchSize, _totalRows)})...`, 'info');

    const opts = {
      file_token:       _fileToken,
      file_ext:         _fileExt,
      duplicate:        document.getElementById('optDuplicate').value,
      download_images:  document.getElementById('optImages').value === '1',
      default_status:   document.getElementById('optStatus').value,
      batch_offset:     offset,
      batch_limit:      batchSize,
    };

    try {
      const res = await fetch('../api/import/process', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(opts),
      });

      // Check if response is actually JSON before parsing
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch(parseErr) {
        // Server returned HTML (timeout/error page)
        const preview = text.substring(0, 200).replace(/<[^>]+>/g, '').trim();
        appendLog(` Server returned non-JSON response for batch ${batch + 1}: ${preview}`, 'error');
        totalErrors += batchSize;
        appendLog(' Tip: Try setting "Product Images" to "Store URLs as-is" to avoid timeout.', 'skip');
        continue; // try next batch
      }

      if (!json.success) {
        appendLog(` Batch ${batch + 1} failed: ${json.message}`, 'error');
        totalErrors += batchSize;
        continue;
      }

      const d = json.data || {};
      totalImported += d.imported || 0;
      totalUpdated  += d.updated  || 0;
      totalSkipped  += d.skipped  || 0;
      totalErrors   += d.errors   || 0;
      if (d.log) allLogs = allLogs.concat(d.log);

      appendLog(` Batch ${batch + 1} done: ${d.imported||0} imported, ${d.updated||0} updated, ${d.skipped||0} skipped, ${d.errors||0} errors`, 'ok');

    } catch(e) {
      appendLog(` Batch ${batch + 1} network error: ${e.message}`, 'error');
      totalErrors += batchSize;
      // Continue with next batch instead of aborting everything
      continue;
    }
  }

  setProgress(100, 'Complete!');
  showResults({
    imported: totalImported,
    updated:  totalUpdated,
    skipped:  totalSkipped,
    errors:   totalErrors,
    log:      allLogs.slice(0, 200),
  });
  setStage(4);
}

function showResults(data) {
  document.getElementById('sumImported').textContent = data.imported || 0;
  document.getElementById('sumUpdated').textContent  = data.updated  || 0;
  document.getElementById('sumSkipped').textContent  = data.skipped  || 0;
  document.getElementById('sumErrors').textContent   = data.errors   || 0;

  const log = document.getElementById('doneLog');
  log.innerHTML = '';
  (data.log || []).forEach(([type, msg]) => {
    const cls = type === 'ok' ? 'log-ok' : type === 'skip' ? 'log-skip' : 'log-error';
    log.innerHTML += `<div class="${cls}">${escHtml(msg)}</div>`;
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────
function setStage(n) {
  ['stepUpload','stepPreview','stepImport','stepDone'].forEach((id,i) => {
    document.getElementById(id).style.display = (i+1 === n) ? 'block' : 'none';
  });
  [1,2,3,4].forEach(i => {
    const el = document.getElementById('s'+i);
    el.classList.remove('active','done');
    if (i < n) el.classList.add('done');
    else if (i === n) el.classList.add('active');
  });
}

function setProgress(pct, text) {
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressPct').textContent = Math.round(pct) + '%';
  document.getElementById('progressText').textContent = text;
}

function appendLog(msg, type = 'info') {
  const log = document.getElementById('importLog');
  const cls = type === 'info' ? 'log-info' : type === 'ok' ? 'log-ok' : type === 'error' ? 'log-error' : 'log-skip';
  log.innerHTML += `<div class="${cls}">${escHtml(msg)}</div>`;
  log.scrollTop = log.scrollHeight;
}

function escHtml(t) { return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function goBack() { setStage(1); }

function resetImport() {
  _fileToken = ''; _fileExt = ''; _totalRows = 0; _selectedFile = null;
  document.getElementById('importFile').value = '';
  document.getElementById('fileInfo').style.display = 'none';
  document.getElementById('btnPreview').disabled = true;
  document.getElementById('progressBar').style.width = '0';
  document.getElementById('importLog').innerHTML = '';
  setStage(1);
}
</script>

<?php include 'includes/footer.php'; ?>
