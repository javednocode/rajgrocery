<?php
$pageTitle = 'Backup & Restore';
require_once 'includes/header.php';
?>
<link rel="stylesheet" href="assets/admin.css?v=3">
<style>
.backup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
@media(max-width:768px){ .backup-grid { grid-template-columns: 1fr; } }
.status-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
.status-row:last-child { border-bottom: none; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot-green { background: #10b981; }
.dot-red   { background: #ef4444; }
.dot-yellow{ background: #f59e0b; }
.backup-file-row { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); }
.backup-file-row:last-child { border-bottom: none; }
.file-icon { font-size: 28px; flex-shrink: 0; }
.file-meta { flex: 1; min-width: 0; }
.file-name { font-size: 13px; font-weight: 500; color: var(--text); word-break: break-all; }
.file-date { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.file-size { font-size: 12px; background: var(--bg-secondary, #f1f5f9); padding: 2px 8px; border-radius: 10px; flex-shrink: 0; }
.file-actions { display: flex; gap: 6px; flex-shrink: 0; }
.type-badge { font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 600; }
.type-full     { background: #dbeafe; color: #1e40af; }
.type-database { background: #d1fae5; color: #065f46; }
.type-files    { background: #fce7f3; color: #9d174d; }
.btn-create { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; padding: 12px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: opacity .2s; }
.btn-create:hover { opacity: 0.9; }
.btn-create:disabled { opacity: 0.6; cursor: not-allowed; }
.progress-ring { display: none; }
.loading-spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.restore-warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin-bottom: 16px; }
.empty-backups { text-align: center; padding: 40px 20px; color: var(--text-muted); }
</style>

<div class="admin-content">

    <!-- Status + Create Row -->
    <div class="backup-grid">

        <!-- System Status -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">⚙️ System Status</h3>
            </div>
            <div class="card-body" id="statusPanel">
                <div class="empty-backups"><p>Checking…</p></div>
            </div>
        </div>

        <!-- Create Backup -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">🗄️ Create Backup</h3>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label class="form-label">Backup Type</label>
                    <select id="backupType" class="form-input">
                        <option value="full">Full Backup (Database + Uploads)</option>
                        <option value="database">Database Only</option>
                        <option value="files">Uploaded Files Only</option>
                    </select>
                </div>
                <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">
                    Backups are stored securely on the server in the <code>/backups/</code> directory.
                    Download immediately after creation.
                </p>
                <button class="btn-create" id="createBtn" onclick="createBackup()">
                    <span id="createIcon">🗄️</span>
                    <span id="createLabel">Create Backup Now</span>
                </button>
            </div>
        </div>

    </div>

    <!-- Backup Files List -->
    <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3 class="card-title">📂 Available Backups</h3>
            <button class="btn btn-secondary btn-sm" onclick="loadBackups()">🔄 Refresh</button>
        </div>
        <div class="card-body" id="backupList">
            <div class="empty-backups"><p>Loading…</p></div>
        </div>
    </div>

    <!-- Restore from File Upload -->
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">♻️ Restore from Backup</h3>
        </div>
        <div class="card-body">
            <div class="restore-warning">
                ⚠️ <strong>Warning:</strong> Restoring a backup will overwrite the current database.
                This action cannot be undone. Create a fresh backup first.
            </div>
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">
                Select a backup from the list above and click <strong>Restore</strong>, or upload a .sql / .sql.gz file:
            </p>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <input type="file" id="restoreFile" class="form-input" accept=".sql,.gz" style="flex:1; min-width:200px;">
                <button class="btn btn-danger" onclick="restoreFromUpload()">♻️ Restore Uploaded File</button>
            </div>
        </div>
    </div>

</div>

<!-- Confirm Restore Modal -->
<div id="restoreModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:1000; align-items:center; justify-content:center;">
    <div style="background:var(--card-bg); border-radius:16px; padding:28px; width:480px; max-width:95vw;">
        <h3 style="color:#ef4444; margin:0 0 12px;">⚠️ Confirm Restore</h3>
        <p style="font-size:14px; line-height:1.6; color:var(--text);">
            You are about to restore: <strong id="restoreFilename" style="word-break:break-all;"></strong>
        </p>
        <p style="font-size:13px; color:#ef4444; margin-top:8px;">
            This will <strong>overwrite all current data</strong> for this site. Are you absolutely sure?
        </p>
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:24px;">
            <button class="btn btn-secondary" onclick="closeRestore()">Cancel</button>
            <button class="btn btn-danger" id="confirmRestoreBtn" onclick="confirmRestore()">Yes, Restore Database</button>
        </div>
    </div>
</div>

<script>
const token = localStorage.getItem('admin_token');
let pendingRestoreFile = null;

// ─── Status ──────────────────────────────────────────────────────────────────

async function loadStatus() {
    try {
        const res  = await fetch('/api/backup/status', { headers: { Authorization: 'Bearer ' + token } });
        const json = await res.json();
        if (!json.success) return;
        const s = json.data;
        document.getElementById('statusPanel').innerHTML = `
            <div class="status-row">
                <div class="status-dot ${s.mysqldump_available ? 'dot-green' : 'dot-yellow'}"></div>
                <span>mysqldump: <strong>${s.mysqldump_available ? 'Available (' + s.mysqldump_path + ')' : 'Not found — using PHP fallback'}</strong></span>
            </div>
            <div class="status-row">
                <div class="status-dot ${s.zip_available ? 'dot-green' : 'dot-red'}"></div>
                <span>ZipArchive: <strong>${s.zip_available ? 'Available' : 'Not available'}</strong></span>
            </div>
            <div class="status-row">
                <div class="status-dot ${s.backup_dir_writable ? 'dot-green' : 'dot-red'}"></div>
                <span>Backup directory: <strong>${s.backup_dir_writable ? 'Writable' : '🔴 NOT writable!'}</strong></span>
            </div>
            <div class="status-row">
                <div class="status-dot dot-green"></div>
                <span>Total backups: <strong>${s.backup_count}</strong> (${s.disk_used_human} used)</span>
            </div>
            ${s.latest_backup ? `<div class="status-row"><div class="status-dot dot-green"></div><span>Latest: <strong>${new Date(s.latest_backup.created_at).toLocaleString('en-IN')}</strong></span></div>` : ''}
        `;
    } catch(e) {
        document.getElementById('statusPanel').innerHTML = '<p style="color:var(--text-muted)">Could not load status</p>';
    }
}

// ─── List Backups ─────────────────────────────────────────────────────────────

async function loadBackups() {
    const list = document.getElementById('backupList');
    list.innerHTML = '<div class="empty-backups"><p>Loading…</p></div>';
    try {
        const res  = await fetch('/api/backup/list', { headers: { Authorization: 'Bearer ' + token } });
        const json = await res.json();
        if (!json.success || !json.data?.length) {
            list.innerHTML = '<div class="empty-backups"><p>No backups yet. Create your first backup above.</p></div>';
            return;
        }
        list.innerHTML = json.data.map(b => `
            <div class="backup-file-row">
                <div class="file-icon">${b.type === 'database' ? '🗄️' : b.type === 'files' ? '📁' : '💾'}</div>
                <div class="file-meta">
                    <div class="file-name">${escHtml(b.filename)}</div>
                    <div class="file-date">${new Date(b.created_at).toLocaleString('en-IN')}</div>
                    <span class="type-badge type-${b.type}">${b.type.toUpperCase()}</span>
                </div>
                <div class="file-size">${b.size_human}</div>
                <div class="file-actions">
                    <a href="/api/backup/download/${encodeURIComponent(b.filename)}"
                       class="btn btn-primary btn-sm"
                       style="text-decoration:none;"
                       onclick="addAuthToDownload(event, this)">⬇️ Download</a>
                    ${b.filename.includes('.sql') ? `<button class="btn btn-warning btn-sm" onclick="openRestore('${escHtml(b.filename)}')">♻️ Restore</button>` : ''}
                    <button class="btn btn-danger btn-sm" onclick="deleteBackup('${escHtml(b.filename)}', this)">🗑</button>
                </div>
            </div>`).join('');
    } catch(e) {
        list.innerHTML = '<div class="empty-backups"><p>Failed to load backups</p></div>';
    }
}

// Inject auth header into download link via fetch + blob
async function addAuthToDownload(e, link) {
    e.preventDefault();
    const url = link.href;
    try {
        const res  = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
        const blob = await res.blob();
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = url.split('/').pop();
        a.click();
        URL.revokeObjectURL(a.href);
    } catch(err) { alert('Download failed: ' + err.message); }
}

// ─── Create Backup ────────────────────────────────────────────────────────────

async function createBackup() {
    const btn   = document.getElementById('createBtn');
    const label = document.getElementById('createLabel');
    const icon  = document.getElementById('createIcon');
    const type  = document.getElementById('backupType').value;

    btn.disabled = true;
    label.textContent = 'Creating backup…';
    icon.textContent  = '⏳';

    try {
        const res  = await fetch('/api/backup/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ type })
        });
        const json = await res.json();
        if (json.success) {
            showToast('✅ Backup created successfully!');
            loadBackups();
            loadStatus();
        } else {
            alert('Backup failed: ' + (json.error || json.message));
        }
    } catch(e) {
        alert('Backup failed: ' + e.message);
    } finally {
        btn.disabled  = false;
        label.textContent = 'Create Backup Now';
        icon.textContent  = '🗄️';
    }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

function openRestore(filename) {
    pendingRestoreFile = filename;
    document.getElementById('restoreFilename').textContent = filename;
    document.getElementById('restoreModal').style.display = 'flex';
}
function closeRestore() {
    pendingRestoreFile = null;
    document.getElementById('restoreModal').style.display = 'none';
}

async function confirmRestore() {
    const btn = document.getElementById('confirmRestoreBtn');
    btn.disabled = true;
    btn.textContent = 'Restoring…';
    try {
        const res  = await fetch('/api/backup/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ filename: pendingRestoreFile })
        });
        const json = await res.json();
        closeRestore();
        if (json.success) {
            showToast('✅ Restore complete. Page will reload in 3 seconds.');
            setTimeout(() => location.reload(), 3000);
        } else {
            alert('Restore failed: ' + (json.error || json.message));
        }
    } catch(e) {
        alert('Restore failed: ' + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Yes, Restore Database';
    }
}

async function restoreFromUpload() {
    const fileInput = document.getElementById('restoreFile');
    if (!fileInput.files?.length) { alert('Please select a .sql or .sql.gz file first.'); return; }
    const filename = fileInput.files[0].name;
    pendingRestoreFile = filename;
    document.getElementById('restoreFilename').textContent = filename + ' (uploaded file)';
    document.getElementById('restoreModal').style.display = 'flex';
}

// ─── Delete Backup ────────────────────────────────────────────────────────────

async function deleteBackup(filename, btn) {
    if (!confirm(`Delete backup:\n${filename}\n\nThis cannot be undone.`)) return;
    btn.disabled = true;
    try {
        await fetch(`/api/backup/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
        });
        showToast('Backup deleted');
        loadBackups();
        loadStatus();
    } catch(e) { alert('Delete failed'); }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e293b;color:#fff;padding:14px 20px;border-radius:10px;font-size:14px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ─── Init ─────────────────────────────────────────────────────────────────────
loadStatus();
loadBackups();
</script>

<?php include 'includes/footer.php'; ?>
