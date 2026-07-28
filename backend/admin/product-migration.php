<?php $pageTitle = 'Product Migration'; include 'includes/header.php'; ?>

<style>
.pm-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
.pm-tab { border:1px solid var(--admin-border); background:var(--admin-card); color:var(--admin-text); border-radius:8px; padding:9px 12px; font-weight:700; font-size:12px; cursor:pointer; }
.pm-tab.active { background:var(--admin-primary); color:#fff; border-color:var(--admin-primary); }
.pm-grid { display:grid; grid-template-columns: minmax(0, 1.2fr) minmax(320px, .8fr); gap:16px; align-items:start; }
.pm-panel { display:none; }
.pm-panel.active { display:block; }
.pm-row { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:14px; }
.pm-help { font-size:12px; color:var(--admin-text-muted); margin-top:6px; line-height:1.5; }
.pm-method-card { border:1px solid var(--admin-border); background:var(--admin-card); border-radius:12px; padding:16px; }
.pm-progress { height:12px; background:var(--admin-hover); border-radius:99px; overflow:hidden; }
.pm-progress span { display:block; height:100%; width:0%; background:linear-gradient(90deg,var(--admin-primary),#22c55e); transition:width .25s; }
.pm-stats { display:grid; grid-template-columns: repeat(5, 1fr); gap:8px; margin-top:14px; }
.pm-stat { border:1px solid var(--admin-border); background:var(--admin-bg); border-radius:10px; padding:10px; text-align:center; }
.pm-stat strong { display:block; font-size:20px; }
.pm-stat span { display:block; color:var(--admin-text-muted); font-size:11px; margin-top:3px; }
.pm-log { background:#0d1117; border-radius:10px; padding:12px; min-height:180px; max-height:320px; overflow:auto; color:#c9d1d9; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px; }
.pm-log div { padding:3px 0; border-bottom:1px solid rgba(255,255,255,.04); }
.pm-log .success { color:#4ade80; }
.pm-log .warning { color:#facc15; }
.pm-log .error { color:#f87171; }
.pm-log .info { color:#93c5fd; }
.pm-history { width:100%; border-collapse:collapse; font-size:12.5px; }
.pm-history th { text-align:left; color:var(--admin-text-muted); font-size:11px; text-transform:uppercase; letter-spacing:.05em; padding:10px; border-bottom:1px solid var(--admin-border); }
.pm-history td { padding:10px; border-bottom:1px solid var(--admin-border); vertical-align:top; }
.pm-actions { display:flex; gap:6px; flex-wrap:wrap; }
.pm-pill { display:inline-flex; align-items:center; border-radius:999px; padding:3px 8px; font-size:11px; font-weight:700; border:1px solid var(--admin-border); }
.pm-pill.running { color:#2563eb; background:rgba(37,99,235,.1); }
.pm-pill.completed { color:#16a34a; background:rgba(22,163,74,.1); }
.pm-pill.failed { color:#dc2626; background:rgba(220,38,38,.1); }
.pm-pill.rolled_back { color:#a16207; background:rgba(161,98,7,.1); }
.pm-json { min-height:92px; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px; }
@media(max-width:1000px){ .pm-grid { grid-template-columns:1fr; } .pm-row { grid-template-columns:1fr; } .pm-stats { grid-template-columns:repeat(2,1fr); } }
</style>

<div class="toolbar">
  <div>
    <h3 style="font-size:16px;margin:0;">Product Migration</h3>
    <p style="font-size:12px;color:var(--admin-text-muted);margin:4px 0 0;">Import products from websites, WooCommerce, Shopify, CSV, or XML feeds.</p>
  </div>
  <div style="display:flex;gap:8px;">
    <button id="pmRepairBtn" class="btn btn-outline btn-sm" onclick="repairImages()" title="Re-links product photos whose file went missing to a saved copy on disk. Safe to run any time.">🔧 Repair Images</button>
    <button id="pmRepairCatBtn" class="btn btn-outline btn-sm" onclick="repairCategories()" title="Auto-assigns categories to products that currently have none, using keyword matching on the product name.">🏷️ Repair Categories</button>
    <button class="btn btn-outline btn-sm" onclick="loadHistory()">Refresh History</button>
  </div>
</div>

<div class="pm-grid">
  <div>
    <div class="card">
      <div class="card-body">
        <div class="pm-tabs" id="pmTabs">
          <button class="pm-tab active" data-method="scraper" onclick="selectMethod('scraper')">Website Scraper</button>
          <button class="pm-tab" data-method="woocommerce" onclick="selectMethod('woocommerce')">WooCommerce</button>
          <button class="pm-tab" data-method="shopify" onclick="selectMethod('shopify')">Shopify</button>
          <button class="pm-tab" data-method="csv" onclick="selectMethod('csv')">CSV</button>
          <button class="pm-tab" data-method="xml" onclick="selectMethod('xml')">XML Feed</button>
        </div>

        <input type="hidden" id="pmMethod" value="scraper">

        <div id="panel_scraper" class="pm-panel active">
          <div class="pm-method-card">
            <div class="form-group">
              <label>Website URL</label>
              <input type="url" id="scraper_url" class="form-control" placeholder="https://example.com">
            </div>
            <div class="pm-row">
              <div class="form-group">
                <label>Import Type</label>
                <select id="scraper_type" class="form-control" onchange="toggleScraperFields()">
                  <option value="entire">Entire Website</option>
                  <option value="category">Selected Category</option>
                  <option value="single">Single Product</option>
                </select>
              </div>
              <div class="form-group">
                <label>Product Limit</label>
                <input type="number" id="scraper_limit" class="form-control" value="250" min="1" max="10000">
              </div>
            </div>
            <div class="form-group" id="scraperCategoryWrap" style="display:none;">
              <label>Category URL</label>
              <input type="url" id="scraper_category_url" class="form-control" placeholder="https://example.com/category/spices">
            </div>
            <div class="form-group" id="scraperProductWrap" style="display:none;">
              <label>Product URL</label>
              <input type="url" id="scraper_product_url" class="form-control" placeholder="https://example.com/product/item">
            </div>
          </div>
        </div>

        <div id="panel_woocommerce" class="pm-panel">
          <div class="pm-method-card">
            <div class="form-group"><label>Store URL</label><input type="url" id="woo_url" class="form-control" placeholder="https://oldstore.com"></div>
            <div class="pm-row">
              <div class="form-group"><label>Consumer Key</label><input type="text" id="woo_ck" class="form-control"></div>
              <div class="form-group"><label>Consumer Secret</label><input type="password" id="woo_cs" class="form-control"></div>
            </div>
            <div class="form-group"><label>Product Limit</label><input type="number" id="woo_limit" class="form-control" value="500" min="1" max="10000"></div>
            <div class="pm-help">Uses WooCommerce REST API and imports products, categories, images, stock, SEO, attributes, and variation references.</div>
          </div>
        </div>

        <div id="panel_shopify" class="pm-panel">
          <div class="pm-method-card">
            <div class="form-group"><label>Store URL</label><input type="url" id="shopify_url" class="form-control" placeholder="https://store.myshopify.com"></div>
            <div class="form-group"><label>Admin Access Token</label><input type="password" id="shopify_token" class="form-control"></div>
            <div class="form-group"><label>Product Limit</label><input type="number" id="shopify_limit" class="form-control" value="250" min="1" max="10000"></div>
            <div class="pm-help">Uses Shopify Admin API. The token needs read access for products and inventory.</div>
          </div>
        </div>

        <div id="panel_csv" class="pm-panel">
          <div class="pm-method-card">
            <div class="form-group">
              <label>CSV / XLSX File</label>
              <input type="file" id="csv_file" class="form-control" accept=".csv,.xlsx,.xls">
            </div>
            <div class="pm-row">
              <div class="form-group"><label>Mapping Name</label><input type="text" id="csv_mapping_name" class="form-control" placeholder="Optional reusable mapping"></div>
              <div class="form-group"><label>Saved Mapping</label><select id="csv_mapping_select" class="form-control" onchange="applySavedMapping('csv')"><option value="">Auto map columns</option></select></div>
            </div>
            <div class="form-group">
              <label>Manual Mapping JSON</label>
              <textarea id="csv_mapping" class="form-control pm-json" placeholder='{"name":"product_name","price":"price","images":"image_url","categories":"category"}'></textarea>
            </div>
          </div>
        </div>

        <div id="panel_xml" class="pm-panel">
          <div class="pm-method-card">
            <div class="form-group"><label>XML Feed URL</label><input type="url" id="xml_url" class="form-control" placeholder="https://example.com/feed.xml"></div>
            <div class="pm-row">
              <div class="form-group"><label>Mapping Name</label><input type="text" id="xml_mapping_name" class="form-control" placeholder="Optional reusable mapping"></div>
              <div class="form-group"><label>Saved Mapping</label><select id="xml_mapping_select" class="form-control" onchange="applySavedMapping('xml')"><option value="">Auto map fields</option></select></div>
            </div>
            <div class="form-group">
              <label>Manual Mapping JSON</label>
              <textarea id="xml_mapping" class="form-control pm-json" placeholder='{"name":"title","price":"price","images":"image","categories":"category"}'></textarea>
            </div>
          </div>
        </div>

        <div class="pm-row" style="margin-top:16px;">
          <div class="form-group">
            <label>Duplicate Detection</label>
            <select id="pmDuplicate" class="form-control">
              <option value="skip">Skip Existing</option>
              <option value="update">Update Existing</option>
              <option value="copy">Create New Copy</option>
            </select>
            <div class="pm-help">Checks SKU, previously imported product URL, then product name.</div>
          </div>
          <div class="form-group">
            <label>Chunk Size</label>
            <input type="number" id="pmChunk" class="form-control" value="10" min="1" max="50">
            <div class="pm-help">Lower is safer for Hostinger (use 5-15). Higher = faster but risks 504 timeout.</div>
          </div>
        </div>

        <button class="btn btn-primary" id="pmStartBtn" onclick="startMigration()">Start Import</button>
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="card-header"><h3>Import History</h3></div>
      <div class="card-body" style="overflow-x:auto;">
        <table class="pm-history">
          <thead><tr><th>Date</th><th>Source</th><th>Status</th><th>Progress</th><th>Results</th><th>Actions</th></tr></thead>
          <tbody id="pmHistory"><tr><td colspan="6">Loading...</td></tr></tbody>
        </table>
      </div>
    </div>
  </div>

  <div>
    <div class="card">
      <div class="card-header"><h3>Current Job</h3></div>
      <div class="card-body">
        <div id="pmJobEmpty" class="pm-help">No job running.</div>
        <div id="pmJob" style="display:none;">
          <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;">
            <div>
              <strong id="pmJobTitle">Job</strong>
            </div>
            <span class="pm-pill" id="pmJobStatus">pending</span>
          </div>
          <div class="pm-progress"><span id="pmProgressBar"></span></div>
          <div class="pm-help"><span id="pmProgressText">0 / 0 processed</span></div>
          <div class="pm-stats">
            <div class="pm-stat"><strong id="statImported">0</strong><span>Imported</span></div>
            <div class="pm-stat"><strong id="statUpdated">0</strong><span>Updated</span></div>
            <div class="pm-stat"><strong id="statSkipped">0</strong><span>Skipped</span></div>
            <div class="pm-stat"><strong id="statFailed">0</strong><span>Errors</span></div>
            <div class="pm-stat"><strong id="statRemaining">0</strong><span>Remaining</span></div>
          </div>
          <div style="display:flex;gap:8px;margin:14px 0;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="refreshCurrentJob()">Refresh</button>
            <button id="pmResumeBtn" class="btn btn-primary btn-sm" onclick="resumeProcessing()" style="display:none;">▶ Resume Processing</button>
            <button class="btn btn-danger btn-sm" onclick="rollbackCurrentJob()">Rollback</button>
          </div>
          <div class="pm-log" id="pmLog"></div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="card-header"><h3>Security & Performance</h3></div>
      <div class="card-body">
        <ul style="font-size:12.5px;color:var(--admin-text-muted);line-height:1.8;margin:0;padding-left:18px;">
          <li>URLs are validated to block localhost and private network targets.</li>
          <li>Images are downloaded into <code>/uploads/products/</code>.</li>
          <li>Thumbnails, medium, large, and WebP variants are generated when GD is available.</li>
          <li>Every job gets a batch id for reporting and rollback.</li>
          <li>Large imports run in chunks from this page to avoid PHP timeouts.</li>
        </ul>
      </div>
    </div>
  </div>
  
  <div style="text-align: center; padding: 15px; color: #64748b; font-size: 13px; margin-top: 10px;">
      Powered by <a href="https://webcraftstech.in" target="_blank" style="color: var(--admin-primary); text-decoration: none;">webcraftstech.in</a>
  </div>
</div>

<script>
let currentJobId = null;
let isProcessing = false;
let savedMappings = [];

function selectMethod(method) {
  document.getElementById('pmMethod').value = method;
  document.querySelectorAll('.pm-tab').forEach(b => b.classList.toggle('active', b.dataset.method === method));
  document.querySelectorAll('.pm-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel_' + method).classList.add('active');
}

function toggleScraperFields() {
  const type = document.getElementById('scraper_type').value;
  document.getElementById('scraperCategoryWrap').style.display = type === 'category' ? '' : 'none';
  document.getElementById('scraperProductWrap').style.display = type === 'single' ? '' : 'none';
}

function getJsonMapping(id) {
  const raw = document.getElementById(id).value.trim();
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e) { throw new Error('Mapping JSON is invalid'); }
}

function buildPayload() {
  const method = document.getElementById('pmMethod').value;
  const base = {
    method,
    duplicate_strategy: document.getElementById('pmDuplicate').value
  };
  if (method === 'scraper') {
    return {
      ...base,
      source_url: document.getElementById('scraper_url').value,
      import_type: document.getElementById('scraper_type').value,
      category_url: document.getElementById('scraper_category_url').value,
      product_url: document.getElementById('scraper_product_url').value,
      limit: +document.getElementById('scraper_limit').value || 250
    };
  }
  if (method === 'woocommerce') {
    return {
      ...base,
      store_url: document.getElementById('woo_url').value,
      source_url: document.getElementById('woo_url').value,
      consumer_key: document.getElementById('woo_ck').value,
      consumer_secret: document.getElementById('woo_cs').value,
      limit: +document.getElementById('woo_limit').value || 500
    };
  }
  if (method === 'shopify') {
    return {
      ...base,
      store_url: document.getElementById('shopify_url').value,
      source_url: document.getElementById('shopify_url').value,
      access_token: document.getElementById('shopify_token').value,
      limit: +document.getElementById('shopify_limit').value || 250
    };
  }
  if (method === 'xml') {
    return {
      ...base,
      source_url: document.getElementById('xml_url').value,
      xml_url: document.getElementById('xml_url').value,
      mapping_name: document.getElementById('xml_mapping_name').value,
      mapping: getJsonMapping('xml_mapping')
    };
  }
  return base;
}

async function startMigration() {
  const method = document.getElementById('pmMethod').value;
  const btn = document.getElementById('pmStartBtn');
  btn.disabled = true;
  btn.textContent = 'Creating job...';
  try {
    let res;
    if (method === 'csv') {
      const file = document.getElementById('csv_file').files[0];
      if (!file) throw new Error('CSV/XLSX file is required');
      const fd = new FormData();
      fd.set('method', 'csv');
      fd.set('duplicate_strategy', document.getElementById('pmDuplicate').value);
      fd.set('file', file);
      const mapping = getJsonMapping('csv_mapping');
      if (mapping) fd.set('mapping', JSON.stringify(mapping));
      fd.set('mapping_name', document.getElementById('csv_mapping_name').value);
      res = await api('/product-migration/jobs', 'POST', fd, true);
    } else {
      res = await api('/product-migration/jobs', 'POST', buildPayload());
    }
    currentJobId = res.data.id;
    renderJob(res.data);
    await processCurrentJob();
    loadHistory();
  } catch(e) {
    showAlert(e.message || 'Migration failed to start', 'danger');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Start Import';
  }
}

async function processCurrentJob() {
  if (!currentJobId || isProcessing) return;
  isProcessing = true;
  const chunk = Math.max(1, Math.min(50, +document.getElementById('pmChunk').value || 10));
  let consecutiveErrors = 0;
  updateResumeBtn(true);
  try {
    while (currentJobId) {
      try {
        const res = await api('/product-migration/jobs/' + currentJobId + '/process', 'POST', { limit: chunk });
        consecutiveErrors = 0;
        renderJob(res.data);
        await loadLogs(currentJobId);
        if (!['pending','running'].includes(res.data.status)) break;
        await new Promise(r => setTimeout(r, 600));
      } catch (batchErr) {
        consecutiveErrors++;
        const msg = String(batchErr.message || '');
        // On timeout, wait longer and retry with smaller chunk
        if (msg.includes('timeout') || msg.includes('Timeout') || msg.includes('504') || msg.includes('502')) {
          logToPanel('⚠️ Server timeout on batch — waiting 5s then retrying with smaller chunk...', 'warning');
          await new Promise(r => setTimeout(r, 5000));
          if (consecutiveErrors >= 3) {
            logToPanel('❌ Too many timeouts. Pausing. Click "Resume" to continue.', 'error');
            break;
          }
        } else {
          logToPanel('❌ Batch error: ' + msg, 'error');
          if (consecutiveErrors >= 3) break;
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
  } finally {
    isProcessing = false;
    updateResumeBtn(false);
    // Refresh final state
    if (currentJobId) refreshCurrentJob();
  }
}

function updateResumeBtn(processing) {
  const btn = document.getElementById('pmResumeBtn');
  if (!btn) return;
  btn.style.display = processing ? 'none' : '';
  btn.textContent = '▶ Resume Processing';
}

async function resumeProcessing() {
  if (!currentJobId) { showAlert('No active job selected', 'danger'); return; }
  if (isProcessing) return;
  await processCurrentJob();
}

function logToPanel(msg, cls) {
  const log = document.getElementById('pmLog');
  if (!log) return;
  const d = document.createElement('div');
  d.className = cls || 'info';
  d.textContent = '[local] ' + msg;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}

function renderJob(job) {
  document.getElementById('pmJobEmpty').style.display = 'none';
  document.getElementById('pmJob').style.display = '';
  document.getElementById('pmJobTitle').textContent = '#' + job.id + ' ' + job.method + ' - ' + (job.batch_id || '');
  const status = document.getElementById('pmJobStatus');
  status.textContent = job.status;
  status.className = 'pm-pill ' + job.status;
  const pct = job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;
  document.getElementById('pmProgressBar').style.width = pct + '%';
  document.getElementById('pmProgressText').textContent = job.processed + ' / ' + job.total + ' processed (' + pct + '%)';
  document.getElementById('statImported').textContent = job.imported || 0;
  document.getElementById('statUpdated').textContent = job.updated || 0;
  document.getElementById('statSkipped').textContent = job.skipped || 0;
  document.getElementById('statFailed').textContent = job.failed || 0;
  document.getElementById('statRemaining').textContent = Math.max(0, (job.total || 0) - (job.processed || 0));
}

async function refreshCurrentJob() {
  if (!currentJobId) return;
  const res = await api('/product-migration/jobs/' + currentJobId);
  renderJob(res.data);
  await loadLogs(currentJobId);
}

async function loadLogs(id) {
  const res = await api('/product-migration/jobs/' + id + '/logs?limit=250');
  const log = document.getElementById('pmLog');
  log.innerHTML = (res.data || []).map(l => `<div class="${l.level}">[${l.created_at}] ${escapeHtml(l.message)}</div>`).join('');
  log.scrollTop = log.scrollHeight;
}

async function repairImages() {
  const btn = document.getElementById('pmRepairBtn');
  btn.disabled = true;
  const label = btn.textContent;
  btn.textContent = 'Repairing…';
  try {
    const res = await api('/product-migration/repair-images', 'POST', {});
    const d = res.data || {};
    alert('Image repair finished.\n\nChecked: ' + (d.checked ?? 0)
      + '\nAlready fine: ' + (d.healthy ?? 0)
      + '\nRepaired: ' + (d.repaired ?? 0)
      + '\nStill missing: ' + (d.missing ?? 0)
      + (d.missing ? '\n\nRun the import again with "Update Existing" to re-download the missing ones.' : ''));
  } catch (e) {
    alert('Repair failed: ' + (e && e.message ? e.message : e));
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}

async function repairCategories() {
  const btn = document.getElementById('pmRepairCatBtn');
  btn.disabled = true;
  const label = btn.textContent;
  btn.textContent = 'Repairing…';

  try {
    const res = await api('/product-migration/repair-categories', 'POST', { limit: 1000 });
    const d = res.data || {};
    alert('Category repair finished!\n\n'
      + 'Uncategorized found: ' + (d.total_uncategorized ?? 0) + '\n'
      + 'Fixed: ' + (d.fixed ?? 0) + '\n'
      + 'No keyword match (manual): ' + (d.skipped ?? 0) + '\n\n'
      + (d.message || ''));
    // Refresh page so product list shows new categories
    if ((d.fixed ?? 0) > 0) setTimeout(() => location.reload(), 800);
  } catch (e) {
    alert('Category repair failed: ' + (e && e.message ? e.message : e));
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}

async function rollbackCurrentJob() {
  if (!currentJobId) return;
  if (!confirm('Rollback this import batch? Imported products from this batch will be deleted.')) return;
  const res = await api('/product-migration/jobs/' + currentJobId + '/rollback', 'POST', {});
  renderJob(res.data);
  await loadLogs(currentJobId);
  loadHistory();
}

async function rollbackJob(id) {
  if (!confirm('Rollback this import batch?')) return;
  await api('/product-migration/jobs/' + id + '/rollback', 'POST', {});
  loadHistory();
  if (currentJobId === id) refreshCurrentJob();
}

async function openJob(id) {
  currentJobId = id;
  const res = await api('/product-migration/jobs/' + id);
  renderJob(res.data);
  await loadLogs(id);
}

async function loadHistory() {
  try {
    const res = await api('/product-migration/jobs');
    const rows = res.data || [];
    document.getElementById('pmHistory').innerHTML = rows.length ? rows.map(job => {
      const pct = job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;
      const source = escapeHtml(job.source_url || job.method);
      return `<tr>
        <td>${job.created_at || ''}<br><small>${escapeHtml(job.batch_id || '')}</small></td>
        <td><strong>${escapeHtml(job.method)}</strong><br><small>${source}</small></td>
        <td><span class="pm-pill ${job.status}">${job.status}</span></td>
        <td>${job.processed}/${job.total}<br><small>${pct}%</small></td>
        <td>I:${job.imported} U:${job.updated} S:${job.skipped} E:${job.failed}</td>
        <td><div class="pm-actions">
          <button class="btn btn-outline btn-sm" onclick="openJob(${job.id})">Logs</button>
          <button class="btn btn-outline btn-sm" onclick="downloadReport(${job.id})">Report</button>
          ${job.status !== 'rolled_back' ? `<button class="btn btn-danger btn-sm" onclick="rollbackJob(${job.id})">Rollback</button>` : ''}
        </div></td>
      </tr>`;
    }).join('') : '<tr><td colspan="6">No import jobs yet.</td></tr>';
  } catch(e) {}
}

async function loadMappings() {
  try {
    const res = await api('/product-migration/mappings');
    savedMappings = res.data || [];
    ['csv','xml'].forEach(method => {
      const sel = document.getElementById(method + '_mapping_select');
      sel.innerHTML = '<option value="">Auto map fields</option>' + savedMappings
        .filter(m => m.method === method)
        .map(m => `<option value="${m.id}">${escapeHtml(m.name)}</option>`)
        .join('');
    });
  } catch(e) {}
}

async function downloadReport(id) {
  authToken = getStoredToken();
  const res = await fetch('/api/product-migration/jobs/' + id + '/report', {
    headers: { Authorization: 'Bearer ' + authToken }
  });
  if (!res.ok) {
    showAlert('Failed to download report', 'danger');
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'product_migration_' + id + '.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function applySavedMapping(method) {
  const id = document.getElementById(method + '_mapping_select').value;
  const found = savedMappings.find(m => String(m.id) === String(id));
  document.getElementById(method + '_mapping').value = found ? JSON.stringify(found.mapping, null, 2) : '';
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

toggleScraperFields();
loadMappings();
loadHistory();
</script>

<?php include 'includes/footer.php'; ?>
