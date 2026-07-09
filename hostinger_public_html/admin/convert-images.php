<?php
/**
 * Image to WebP Converter — Admin Tool
 * IMPORTANT: AJAX handler MUST be at the TOP before any HTML output
 */

// ── AJAX handler — MUST come FIRST before any HTML/include ──────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action'])) {
    // Kill any buffered output so headers can be sent cleanly
    while (ob_get_level()) ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache');

    require_once __DIR__ . '/../config/config.php';
    require_once __DIR__ . '/../config/database.php';

    $action = $_GET['action'];

    // ── Check WebP support ──────────────────────────────────────────
    if ($action === 'check_support') {
        $gd      = function_exists('imagewebp');
        $imagick = class_exists('Imagick') && in_array('WEBP', Imagick::queryFormats());
        echo json_encode([
            'gd'        => $gd,
            'imagick'   => $imagick,
            'supported' => $gd || $imagick,
        ]);
        exit;
    }

    // ── Scan uploads directory for convertible images ───────────────
    if ($action === 'scan') {
        $uploadDir = defined('UPLOAD_DIR') ? UPLOAD_DIR : __DIR__ . '/../../uploads/';
        // Also try relative path if UPLOAD_DIR doesn't exist
        if (!is_dir($uploadDir)) {
            $uploadDir = __DIR__ . '/../uploads/';
        }
        if (!is_dir($uploadDir)) {
            $uploadDir = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/uploads/';
        }

        $files = [];
        if (is_dir($uploadDir)) {
            $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($uploadDir, RecursiveDirectoryIterator::SKIP_DOTS));
            foreach ($it as $f) {
                if (!$f->isFile()) continue;
                $ext = strtolower($f->getExtension());
                if (!in_array($ext, ['jpg','jpeg','png','gif'])) continue;
                // Skip if WebP version already exists
                $webpPath = preg_replace('/\.(jpg|jpeg|png|gif)$/i', '.webp', $f->getPathname());
                $files[] = [
                    'path'    => $f->getPathname(),
                    'rel'     => str_replace($uploadDir, '/uploads/', $f->getPathname()),
                    'size'    => round($f->getSize() / 1024, 1),
                    'ext'     => $ext,
                    'has_webp'=> file_exists($webpPath),
                ];
            }
        }
        echo json_encode(['success' => true, 'files' => $files, 'count' => count($files), 'dir' => $uploadDir]);
        exit;
    }

    // ── Convert single file ─────────────────────────────────────────
    if ($action === 'convert') {
        $input   = json_decode(file_get_contents('php://input'), true);
        $srcPath = $input['file'] ?? '';

        if (!$srcPath || !file_exists($srcPath)) {
            echo json_encode(['success' => false, 'message' => 'File not found: ' . basename($srcPath)]);
            exit;
        }

        $ext      = strtolower(pathinfo($srcPath, PATHINFO_EXTENSION));
        $webpPath = preg_replace('/\.(jpg|jpeg|png|gif)$/i', '.webp', $srcPath);
        $oldSize  = round(filesize($srcPath) / 1024, 1);

        // Load image
        $img = false;
        if ($ext === 'jpg' || $ext === 'jpeg') {
            $img = @imagecreatefromjpeg($srcPath);
        } elseif ($ext === 'png') {
            $img = @imagecreatefrompng($srcPath);
            if ($img) { imagealphablending($img, true); imagesavealpha($img, true); }
        } elseif ($ext === 'gif') {
            $img = @imagecreatefromgif($srcPath);
        }

        if (!$img) {
            echo json_encode(['success' => false, 'message' => 'Cannot open image: ' . basename($srcPath)]);
            exit;
        }
        if (!function_exists('imagewebp')) {
            imagedestroy($img);
            echo json_encode(['success' => false, 'message' => 'imagewebp() not available — enable GD WebP on server']);
            exit;
        }

        $ok = imagewebp($img, $webpPath, 82);
        imagedestroy($img);

        if (!$ok || !file_exists($webpPath)) {
            echo json_encode(['success' => false, 'message' => 'WebP write failed for: ' . basename($srcPath)]);
            exit;
        }

        $newSize = round(filesize($webpPath) / 1024, 1);

        // Build relative paths
        $uploadDir = defined('UPLOAD_DIR') ? UPLOAD_DIR : (is_dir(__DIR__ . '/../uploads/') ? __DIR__ . '/../uploads/' : rtrim($_SERVER['DOCUMENT_ROOT'],'/').'/uploads/');
        $oldRel    = '/' . ltrim(str_replace($uploadDir, 'uploads/', $srcPath), '/');
        $newRel    = preg_replace('/\.(jpg|jpeg|png|gif)$/i', '.webp', $oldRel);

        // Update DB references
        $rows = 0;
        try {
            $db   = (new Database())->getConnection();
            $cols = [
                ['products','image'],
                ['product_images','image_path'],
                ['categories','image'],
                ['banners','image_path'],
                ['product_variations','image'],
                ['blog_posts','image'],
                ['site_settings','setting_value'],
            ];
            foreach ($cols as [$tbl, $col]) {
                foreach ([$oldRel, ltrim($oldRel,'/'), basename($oldRel)] as $v) {
                    $nr = ($v === basename($oldRel)) ? basename($newRel) : (str_starts_with($v,'/') ? $newRel : ltrim($newRel,'/'));
                    try {
                        $s = $db->prepare("UPDATE `$tbl` SET `$col`=:n WHERE `$col`=:o");
                        $s->execute([':o'=>$v, ':n'=>$nr]);
                        $rows += $s->rowCount();
                    } catch(PDOException $e) {}
                }
            }
        } catch(Exception $e) {}

        @unlink($srcPath);
        echo json_encode([
            'success'     => true,
            'old'         => basename($srcPath),
            'new'         => basename($webpPath),
            'old_size_kb' => $oldSize,
            'new_size_kb' => $newSize,
            'saved_kb'    => round($oldSize - $newSize, 1),
            'db_updated'  => $rows,
        ]);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Unknown action: ' . htmlspecialchars($action)]);
    exit;
}

// ── HTML PAGE (GET requests only reach here) ────────────────────────
$pageTitle = 'Image → WebP Converter';
include 'includes/header.php';
?>

<style>
.converter-wrap { max-width: 900px; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-box { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 20px; text-align: center; }
.stat-box .num { font-size: 2rem; font-weight: 800; }
.stat-box .lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-top: 4px; }
.num-blue { color: #60a5fa; } .num-green { color: #34d399; } .num-red { color: #f87171; } .num-yellow { color: #fbbf24; }
.progress-wrap { background: var(--bg); border-radius: 8px; overflow: hidden; height: 10px; margin: 14px 0 6px; }
.progress-bar { height: 100%; background: linear-gradient(90deg, #f59e0b, #10b981); border-radius: 8px; transition: width .3s; }
.pct-label { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }
.log-box { background: #0a0f1a; border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; height: 280px; overflow-y: auto; font-family: monospace; font-size: 12px; }
.log-ok { color: #34d399; } .log-err { color: #f87171; } .log-info { color: #60a5fa; } .log-warn { color: #fbbf24; }
.badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 18px; }
.badge-ok  { background: #052e16; border: 1px solid #166534; color: #86efac; }
.badge-err { background: #450a0a; border: 1px solid #7f1d1d; color: #fca5a5; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
</style>

<div class="converter-wrap">
  <div id="supportBadge" class="badge badge-ok" style="display:none;"></div>

  <div class="card">
    <div class="card-header"><h3 style="margin:0">📊 Statistics</h3></div>
    <div class="card-body">
      <div class="stats-row">
        <div class="stat-box"><div class="num num-blue"   id="s-total">—</div><div class="lbl">Total Images</div></div>
        <div class="stat-box"><div class="num num-green"  id="s-done">0</div><div class="lbl">Converted</div></div>
        <div class="stat-box"><div class="num num-red"    id="s-err">0</div><div class="lbl">Errors</div></div>
        <div class="stat-box"><div class="num num-yellow" id="s-saved">0 KB</div><div class="lbl">Space Saved</div></div>
      </div>
      <div class="progress-wrap" id="pwrap" style="display:none"><div class="progress-bar" id="pbar" style="width:0%"></div></div>
      <div class="pct-label" id="plabel"></div>
      <div class="btn-row">
        <button class="btn btn-secondary" id="btnScan"    onclick="doScan()">🔍 Scan Images</button>
        <button class="btn btn-primary"   id="btnConvert" onclick="doConvert()" disabled>⚡ Convert All to WebP</button>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><h3 style="margin:0">📋 Conversion Log</h3></div>
    <div class="card-body" style="padding-bottom:20px">
      <div class="log-box" id="logBox">
        <div class="log-info">[ready] Scan karo, phir Convert karo...</div>
      </div>
    </div>
  </div>
</div>

<script>
let allFiles = [];
let done = 0, errors = 0, savedKB = 0;
const token = localStorage.getItem('admin_token') || '';

async function apiFetch(action, body) {
  const opts = { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } };
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const r = await fetch(location.pathname + '?action=' + action, opts);
  const text = await r.text();
  try { return JSON.parse(text); }
  catch(e) { throw new Error('Server returned HTML instead of JSON. Check PHP error. Preview: ' + text.substring(0,120)); }
}

window.addEventListener('load', async () => {
  try {
    const r = await apiFetch('check_support');
    const b = document.getElementById('supportBadge');
    b.style.display = 'inline-flex';
    if (r.supported) {
      b.className = 'badge badge-ok';
      b.textContent = '✅ WebP supported via ' + (r.gd ? 'GD' : 'Imagick');
    } else {
      b.className = 'badge badge-err';
      b.textContent = '⚠️ WebP not supported — enable GD on Hostinger (PHP settings)';
      document.getElementById('btnConvert').disabled = true;
    }
  } catch(e) { log('err', 'Support check failed: ' + e.message); }
});

async function doScan() {
  log('info', '🔍 Scanning uploads directory...');
  document.getElementById('btnScan').disabled = true;
  document.getElementById('btnConvert').disabled = true;
  try {
    const d = await apiFetch('scan');
    allFiles = d.files || [];
    document.getElementById('s-total').textContent = allFiles.length;
    if (!allFiles.length) {
      log('ok', '✅ Koi convertible image nahi mili — sab already WebP ya uploads empty!');
      log('warn', '📁 Scanned directory: ' + (d.dir || 'unknown'));
    } else {
      log('ok', `✅ ${allFiles.length} images mili. Convert button dabao.`);
      log('warn', '📁 Dir: ' + (d.dir || '?'));
      allFiles.slice(0, 6).forEach(f => log('info', `  📄 ${f.rel} (${f.size} KB) [${f.ext.toUpperCase()}]`));
      if (allFiles.length > 6) log('info', `  ...aur ${allFiles.length - 6} aur files`);
      document.getElementById('btnConvert').disabled = false;
    }
  } catch(e) { log('err', 'Scan failed: ' + e.message); }
  document.getElementById('btnScan').disabled = false;
}

async function doConvert() {
  if (!allFiles.length) { await doScan(); return; }
  document.getElementById('btnConvert').disabled = true;
  document.getElementById('btnScan').disabled = true;
  document.getElementById('pwrap').style.display = 'block';
  done = 0; errors = 0; savedKB = 0; updateStats();

  for (let i = 0; i < allFiles.length; i++) {
    const f = allFiles[i];
    document.getElementById('pbar').style.width = Math.round((i / allFiles.length) * 100) + '%';
    document.getElementById('plabel').textContent = `Converting ${i+1}/${allFiles.length}: ${f.rel}`;
    try {
      const d = await apiFetch('convert', { file: f.path });
      if (d.success) {
        done++; savedKB += d.saved_kb || 0;
        log('ok', `✅ ${d.old} → ${d.new} | ${d.old_size_kb}→${d.new_size_kb}KB (−${d.saved_kb}KB)` + (d.db_updated > 0 ? ` | DB: ${d.db_updated} rows` : ''));
      } else { errors++; log('err', `❌ ${f.rel} — ${d.message}`); }
    } catch(e) { errors++; log('err', `❌ ${f.rel} — ${e.message}`); }
    updateStats();
    await new Promise(r => setTimeout(r, 50));
  }
  document.getElementById('pbar').style.width = '100%';
  document.getElementById('plabel').textContent = '✅ Complete!';
  document.getElementById('btnScan').disabled = false;
  log('info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('ok', `🎉 Done! Converted: ${done} | Errors: ${errors} | Saved: ${savedKB >= 1024 ? (savedKB/1024).toFixed(1)+' MB' : savedKB.toFixed(0)+' KB'}`);
}

function updateStats() {
  document.getElementById('s-done').textContent = done;
  document.getElementById('s-err').textContent = errors;
  document.getElementById('s-saved').textContent = savedKB >= 1024 ? (savedKB/1024).toFixed(1)+' MB' : savedKB.toFixed(0)+' KB';
}
function log(type, msg) {
  const b = document.getElementById('logBox');
  const d = document.createElement('div');
  d.className = 'log-' + type;
  d.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  b.appendChild(d);
  b.scrollTop = b.scrollHeight;
}
</script>

<?php include 'includes/footer.php'; ?>
