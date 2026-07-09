<?php
/**
 * Admin Media Library — Browse, preview, and manage uploaded files.
 * Supports images, videos, and documents across all upload subdirectories.
 */
$pageTitle = 'Media Library';
include 'includes/header.php';

$uploadsRoot = __DIR__ . '/../../uploads/';
$uploadsUrl  = '../uploads/'; // relative URL for serving

// Collect all media files recursively
function scanMediaFiles(string $dir, string $relBase = ''): array {
    $files = [];
    if (!is_dir($dir)) return $files;

    foreach (scandir($dir) as $item) {
        if ($item === '.' || $item === '..') continue;
        $path    = $dir . $item;
        $relPath = ($relBase ? $relBase . '/' : '') . $item;

        if (is_dir($path)) {
            $files = array_merge($files, scanMediaFiles($path . '/', $relPath));
        } else {
            $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
            $category = match(true) {
                in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']) => 'image',
                in_array($ext, ['mp4', 'webm', 'mov', 'avi'])                        => 'video',
                in_array($ext, ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'])         => 'document',
                default                                                                => 'other',
            };
            $files[] = [
                'name'     => $item,
                'path'     => $relPath,
                'url'      => $uploadsUrl . $relPath,
                'size'     => filesize($path),
                'modified' => filemtime($path),
                'category' => $category,
                'ext'      => $ext,
                'dir'      => $relBase ?: '/',
            ];
        }
    }
    return $files;
}

$allFiles    = scanMediaFiles($uploadsRoot);
$imageFiles  = array_filter($allFiles, fn($f) => $f['category'] === 'image');
$videoFiles  = array_filter($allFiles, fn($f) => $f['category'] === 'video');
$totalSize   = array_sum(array_column($allFiles, 'size'));
$totalImages = count($imageFiles);
$totalVideos = count($videoFiles);

function formatBytes(int $bytes): string {
    if ($bytes >= 1048576) return round($bytes / 1048576, 1) . ' MB';
    if ($bytes >= 1024)    return round($bytes / 1024, 1) . ' KB';
    return $bytes . ' B';
}

// Get unique directories for filter
$dirs = array_unique(array_column($allFiles, 'dir'));
sort($dirs);
?>

<div class="media-library">
  <!-- ── Stats Bar ── -->
  <div class="stats-row" style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;">
    <div class="stat-chip"><strong><?= count($allFiles) ?></strong> Total Files</div>
    <div class="stat-chip"><strong><?= $totalImages ?></strong> Images</div>
    <div class="stat-chip"><strong><?= $totalVideos ?></strong> Videos</div>
    <div class="stat-chip"><strong><?= formatBytes($totalSize) ?></strong> Used</div>
  </div>

  <!-- ── Toolbar ── -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-body" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:16px;">
      <input type="text" id="mlSearch" class="form-control" style="max-width:300px;" placeholder="🔍 Search files..." oninput="filterMedia()">
      <select id="mlDir" class="form-control" style="max-width:200px;" onchange="filterMedia()">
        <option value="">All folders</option>
        <?php foreach ($dirs as $dir): ?>
        <option value="<?= htmlspecialchars($dir) ?>"><?= htmlspecialchars($dir ?: '/') ?></option>
        <?php endforeach; ?>
      </select>
      <select id="mlType" class="form-control" style="max-width:160px;" onchange="filterMedia()">
        <option value="">All types</option>
        <option value="image">Images</option>
        <option value="video">Videos</option>
        <option value="document">Documents</option>
      </select>
      <div style="margin-left:auto;display:flex;gap:8px;">
        <button class="btn btn-outline btn-sm" onclick="setView('grid')" id="btnGrid">⊞ Grid</button>
        <button class="btn btn-outline btn-sm" onclick="setView('list')" id="btnList">≡ List</button>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('uploadModal').style.display='flex'">+ Upload</button>
      </div>
    </div>
  </div>

  <!-- ── Grid/List Container ── -->
  <div id="mediaGrid" class="media-grid">
    <?php foreach ($allFiles as $file): ?>
    <div class="media-item"
         data-name="<?= htmlspecialchars(strtolower($file['name'])) ?>"
         data-dir="<?= htmlspecialchars($file['dir']) ?>"
         data-type="<?= htmlspecialchars($file['category']) ?>">
      <div class="media-thumb">
        <?php if ($file['category'] === 'image'): ?>
          <img src="<?= htmlspecialchars($file['url']) ?>" alt="<?= htmlspecialchars($file['name']) ?>" loading="lazy">
        <?php elseif ($file['category'] === 'video'): ?>
          <div class="media-icon">🎬</div>
        <?php else: ?>
          <div class="media-icon">📄</div>
        <?php endif; ?>
      </div>
      <div class="media-info">
        <div class="media-filename" title="<?= htmlspecialchars($file['name']) ?>"><?= htmlspecialchars($file['name']) ?></div>
        <div class="media-meta"><?= htmlspecialchars($file['dir']) ?> · <?= formatBytes($file['size']) ?></div>
      </div>
      <div class="media-actions">
        <button class="media-btn" onclick="copyUrl('<?= htmlspecialchars($file['url']) ?>')" title="Copy URL">📋</button>
        <a class="media-btn" href="<?= htmlspecialchars($file['url']) ?>" target="_blank" title="Open">🔗</a>
        <button class="media-btn danger" onclick="confirmDelete('<?= htmlspecialchars($file['path']) ?>')" title="Delete">🗑</button>
      </div>
    </div>
    <?php endforeach; ?>
    <?php if (empty($allFiles)): ?>
    <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--admin-muted);">
      <div style="font-size:48px;margin-bottom:12px;">📂</div>
      <p>No files found in <code>/uploads/</code></p>
      <button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="document.getElementById('uploadModal').style.display='flex'">Upload your first file</button>
    </div>
    <?php endif; ?>
  </div>
  <div id="noResults" style="display:none;text-align:center;padding:48px;color:var(--admin-muted);">No files match your search.</div>
</div>

<!-- ── Upload Modal ── -->
<div id="uploadModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;align-items:center;justify-content:center;">
  <div style="background:var(--admin-surface);border-radius:16px;padding:32px;width:480px;max-width:95vw;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h3 style="margin:0;">Upload File</h3>
      <button onclick="document.getElementById('uploadModal').style.display='none'" style="background:none;border:none;font-size:20px;color:var(--admin-text);cursor:pointer;">×</button>
    </div>
    <div class="form-group">
      <label class="form-label">Destination Folder</label>
      <select id="uploadFolder" class="form-control">
        <option value="products">products/</option>
        <option value="categories">categories/</option>
        <option value="branding">branding/</option>
        <option value="banners">banners/</option>
        <option value="blog">blog/</option>
        <option value="general">general/</option>
      </select>
    </div>
    <div id="uploadDropzone" style="border:2px dashed var(--admin-border);border-radius:12px;padding:32px;text-align:center;cursor:pointer;margin-bottom:16px;" onclick="document.getElementById('fileInput').click()">
      <div style="font-size:36px;margin-bottom:8px;">📤</div>
      <p style="color:var(--admin-muted);margin:0;">Drop files here or <strong>click to browse</strong></p>
      <p style="color:var(--admin-text-muted);font-size:12px;margin-top:4px;">Supports JPG, PNG, WebP, GIF, SVG, MP4, PDF</p>
    </div>
    <input type="file" id="fileInput" style="display:none" multiple accept="image/*,video/mp4,.pdf" onchange="uploadFiles(this.files)">
    <div id="uploadProgress" style="display:none;">
      <div style="background:var(--admin-border);border-radius:99px;height:6px;overflow:hidden;">
        <div id="progressBar" style="height:100%;background:var(--admin-primary);width:0%;transition:width .3s;border-radius:99px;"></div>
      </div>
      <div id="uploadStatus" style="text-align:center;margin-top:8px;font-size:13px;color:var(--admin-muted);"></div>
    </div>
  </div>
</div>

<!-- ── Copy URL Toast ── -->
<div id="copyToast" style="position:fixed;bottom:24px;right:24px;background:#253D4E;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;display:none;z-index:9999;">URL copied!</div>

<style>
.stat-chip { background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:8px;padding:10px 16px;font-size:13px;color:var(--admin-text-dim); }
.stat-chip strong { color:var(--admin-text);display:block;font-size:18px;font-weight:700; }
.media-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px; }
.media-grid.list-view { grid-template-columns:1fr; }
.media-item { background:var(--admin-surface);border:1px solid var(--admin-border);border-radius:12px;overflow:hidden;transition:border-color .2s,box-shadow .2s; }
.media-item:hover { border-color:var(--admin-primary);box-shadow:0 4px 20px rgba(0,0,0,.1); }
.media-thumb { height:140px;background:var(--admin-surface-2);display:flex;align-items:center;justify-content:center;overflow:hidden; }
.media-thumb img { width:100%;height:100%;object-fit:cover; }
.media-icon { font-size:40px; }
.media-info { padding:10px 12px; }
.media-filename { font-size:12px;font-weight:600;color:var(--admin-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.media-meta { font-size:11px;color:var(--admin-muted);margin-top:2px; }
.media-actions { display:flex;gap:4px;padding:8px 12px;border-top:1px solid var(--admin-border); }
.media-btn { background:none;border:none;padding:6px;cursor:pointer;border-radius:6px;font-size:14px;color:var(--admin-text-dim);transition:background .15s; }
.media-btn:hover { background:var(--admin-surface-2); }
.media-btn.danger:hover { background:var(--admin-danger-bg); }
/* List view overrides */
.list-view .media-item { display:flex;align-items:center;gap:12px; }
.list-view .media-thumb { height:48px;width:48px;flex-shrink:0;border-radius:8px; }
.list-view .media-info { flex:1; }
</style>

<script>
let currentView = 'grid';

function setView(view) {
  currentView = view;
  const grid = document.getElementById('mediaGrid');
  if (view === 'list') grid.classList.add('list-view'); else grid.classList.remove('list-view');
  document.getElementById('btnGrid').style.background = view === 'grid' ? 'var(--admin-primary-bg)' : '';
  document.getElementById('btnList').style.background = view === 'list' ? 'var(--admin-primary-bg)' : '';
}

function filterMedia() {
  const search = document.getElementById('mlSearch').value.toLowerCase();
  const dir    = document.getElementById('mlDir').value;
  const type   = document.getElementById('mlType').value;
  let visible  = 0;

  document.querySelectorAll('.media-item').forEach(item => {
    const nameMatch = !search || item.dataset.name.includes(search);
    const dirMatch  = !dir   || item.dataset.dir === dir;
    const typeMatch = !type  || item.dataset.type === type;
    const show      = nameMatch && dirMatch && typeMatch;
    item.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  document.getElementById('noResults').style.display = visible === 0 ? 'block' : 'none';
}

function copyUrl(url) {
  const fullUrl = window.location.origin.replace('/admin', '') + '/' + url.replace('../', '');
  navigator.clipboard.writeText(fullUrl).then(() => {
    const toast = document.getElementById('copyToast');
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2000);
  });
}

function confirmDelete(path) {
  if (!confirm('Delete this file? This cannot be undone.')) return;
  api('/upload/delete', 'DELETE', { path }).then(() => location.reload()).catch(e => alert('Delete failed: ' + e.message));
}

async function uploadFiles(files) {
  if (!files.length) return;
  const folder = document.getElementById('uploadFolder').value;
  const progress = document.getElementById('uploadProgress');
  const bar = document.getElementById('progressBar');
  const status = document.getElementById('uploadStatus');

  progress.style.display = 'block';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    status.textContent = `Uploading ${file.name} (${i+1}/${files.length})...`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = localStorage.getItem('admin_token');
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });

    bar.style.width = ((i + 1) / files.length * 100) + '%';
    if (!res.ok) { status.textContent = `Failed: ${file.name}`; continue; }
  }

  status.textContent = '✓ Upload complete!';
  setTimeout(() => location.reload(), 1200);
}

// Drag-and-drop
const dropzone = document.getElementById('uploadDropzone');
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.style.borderColor = 'var(--admin-primary)'; });
dropzone.addEventListener('dragleave', () => dropzone.style.borderColor = '');
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.style.borderColor = '';
  uploadFiles(e.dataTransfer.files);
});
</script>

<?php include 'includes/footer.php'; ?>
