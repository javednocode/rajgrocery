<?php
/**
 * Admin Site Manager — View and manage multi-site setup.
 * Each site is an isolated brand sharing the same codebase.
 */
$pageTitle = 'Site Manager';
include 'includes/header.php';

// Load all sites
$sites = [];
try {
    require_once __DIR__ . '/../../config/database.php';
    $db_sm = (new Database())->getConnection();
    $stmt  = $db_sm->query("SELECT * FROM sites ORDER BY id");
    $sites = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (\Throwable $e) {
    $siteLoadError = $e->getMessage();
}
?>

<div style="max-width:920px;">
  <div class="card" style="margin-bottom:24px;">
    <div class="card-header">
      <h3>All Sites</h3>
      <button class="btn btn-primary btn-sm" onclick="toggleAddSite()">+ Add Site</button>
    </div>
    <div class="card-body" style="padding:0;">
      <div id="siteAlert" style="display:none;padding:12px 20px;font-size:14px;font-weight:500;border-bottom:1px solid var(--admin-border);"></div>

      <?php if (!empty($siteLoadError)): ?>
      <div style="padding:24px;color:var(--admin-danger);font-size:14px;">
        <strong>Could not load sites table.</strong><br>
        Run the database migration first: <code>database/migrations/001_add_site_id.sql</code><br>
        <small><?= htmlspecialchars($siteLoadError) ?></small>
      </div>
      <?php elseif (empty($sites)): ?>
      <div style="padding:40px;text-align:center;color:var(--admin-muted);">
        <p>No sites configured. Add your first site below.</p>
      </div>
      <?php else: ?>
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Site Name</th>
            <th>Domain</th>
            <th>Theme</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($sites as $site): ?>
          <tr>
            <td><span style="color:var(--admin-muted);">#<?= $site['id'] ?></span></td>
            <td><strong><?= htmlspecialchars($site['site_name']) ?></strong></td>
            <td><a href="http://<?= htmlspecialchars($site['domain']) ?>" target="_blank"><?= htmlspecialchars($site['domain']) ?></a></td>
            <td><span style="font-size:12px;background:var(--admin-surface-2);padding:3px 8px;border-radius:4px;"><?= htmlspecialchars($site['theme'] ?? 'default') ?></span></td>
            <td><?= htmlspecialchars($site['currency'] ?? 'USD') ?></td>
            <td>
              <?php if ($site['status'] === 'active'): ?>
                <span class="badge badge-success">Active</span>
              <?php elseif ($site['status'] === 'maintenance'): ?>
                <span class="badge badge-warning">Maintenance</span>
              <?php else: ?>
                <span class="badge badge-danger">Suspended</span>
              <?php endif; ?>
            </td>
            <td>
              <div style="display:flex;gap:6px;">
                <button class="btn btn-outline btn-sm" onclick="editSite(<?= $site['id'] ?>, '<?= htmlspecialchars(json_encode($site), ENT_QUOTES) ?>')">Edit</button>
                <?php if ($site['id'] !== 1): ?>
                <button class="btn btn-outline btn-sm danger" onclick="deleteSite(<?= $site['id'] ?>, '<?= htmlspecialchars($site['site_name']) ?>')">Delete</button>
                <?php endif; ?>
              </div>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
      <?php endif; ?>
    </div>
  </div>

  <!-- ── Add/Edit Site Form ── -->
  <div id="siteForm" style="display:none;" class="card">
    <div class="card-header">
      <h3 id="siteFormTitle">Add New Site</h3>
    </div>
    <div class="card-body">
      <input type="hidden" id="siteId" value="">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Site Name <span style="color:var(--admin-danger)">*</span></label>
          <input type="text" class="form-control" id="siteName" placeholder="e.g. Brand B Store">
        </div>
        <div class="form-group">
          <label class="form-label">Domain <span style="color:var(--admin-danger)">*</span></label>
          <input type="text" class="form-control" id="siteDomain" placeholder="e.g. brandb.com">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Theme</label>
          <select class="form-control" id="siteTheme">
            <option value="default">Default</option>
            <option value="grocery">Grocery</option>
            <option value="namkeen">Namkeen</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Currency Code</label>
          <input type="text" class="form-control" id="siteCurrency" value="USD" maxlength="5">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="siteStatus">
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn btn-primary" onclick="saveSite()">Save Site</button>
        <button class="btn btn-outline" onclick="toggleAddSite(true)">Cancel</button>
      </div>
    </div>
  </div>

  <!-- ── Multi-Site Info Card ── -->
  <div class="card" style="margin-top:24px;">
    <div class="card-header"><h3>How Multi-Site Works</h3></div>
    <div class="card-body">
      <ul style="color:var(--admin-muted);font-size:14px;line-height:2.2;padding-left:20px;">
        <li>Each site has its own <strong>products, categories, orders, customers, and settings</strong></li>
        <li>All sites share the same codebase — only branding and settings differ</li>
        <li>The site is resolved automatically by matching <code>HTTP_HOST</code> to the <code>domain</code> column</li>
        <li>Point multiple domains to the same server and each will load its own data</li>
        <li>Site ID 1 is the default fallback — always leave it active</li>
        <li>All cache files are scoped per site_id + domain to prevent data leakage</li>
      </ul>
    </div>
  </div>
</div>

<script>
function toggleAddSite(close = false) {
  const form = document.getElementById('siteForm');
  form.style.display = (form.style.display === 'none' || close) ? 'none' : 'block';
  if (!close) {
    document.getElementById('siteId').value = '';
    document.getElementById('siteFormTitle').textContent = 'Add New Site';
    ['siteName','siteDomain'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('siteTheme').value = 'default';
    document.getElementById('siteCurrency').value = 'USD';
    document.getElementById('siteStatus').value = 'active';
    form.style.display = 'block';
  }
}

function editSite(id, dataJson) {
  const data = JSON.parse(dataJson);
  document.getElementById('siteFormTitle').textContent = 'Edit Site #' + id;
  document.getElementById('siteId').value = id;
  document.getElementById('siteName').value = data.site_name || '';
  document.getElementById('siteDomain').value = data.domain || '';
  document.getElementById('siteTheme').value = data.theme || 'default';
  document.getElementById('siteCurrency').value = data.currency || 'USD';
  document.getElementById('siteStatus').value = data.status || 'active';
  document.getElementById('siteForm').style.display = 'block';
  document.getElementById('siteForm').scrollIntoView({ behavior: 'smooth' });
}

async function saveSite() {
  const id       = document.getElementById('siteId').value;
  const name     = document.getElementById('siteName').value.trim();
  const domain   = document.getElementById('siteDomain').value.trim();
  const theme    = document.getElementById('siteTheme').value;
  const currency = document.getElementById('siteCurrency').value;
  const status   = document.getElementById('siteStatus').value;

  if (!name || !domain) {
    showSiteAlert('Site name and domain are required.', 'error'); return;
  }

  try {
    const endpoint = id ? '/sites/' + id : '/sites';
    const method   = id ? 'PUT' : 'POST';
    await api(endpoint, method, { site_name: name, domain, theme, currency, status });
    showSiteAlert('✓ Site saved successfully. Reloading...', 'success');
    setTimeout(() => location.reload(), 1200);
  } catch(e) {
    showSiteAlert('Failed: ' + e.message, 'error');
  }
}

async function deleteSite(id, name) {
  if (!confirm(`Delete site "${name}" (ID ${id})? All site data will be permanently removed.`)) return;
  try {
    await api('/sites/' + id, 'DELETE');
    showSiteAlert('Site deleted. Reloading...', 'success');
    setTimeout(() => location.reload(), 1000);
  } catch(e) {
    showSiteAlert('Delete failed: ' + e.message, 'error');
  }
}

function showSiteAlert(msg, type) {
  const el = document.getElementById('siteAlert');
  el.style.display = 'block';
  el.style.background = type === 'success' ? '#EAF9F0' : '#FDF0F1';
  el.style.color = type === 'success' ? '#1D6B47' : '#B91C1C';
  el.textContent = msg;
}
</script>

<?php include 'includes/footer.php'; ?>
