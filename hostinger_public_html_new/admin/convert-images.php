<?php
/**
 * Image to WebP Converter — Admin Tool
 *
 * AJAX design notes (learned the hard way on Hostinger):
 *  - Conversion runs in BATCHES (one request converts many files within a
 *    time budget). Thousands of rapid single-file POSTs trip the host's
 *    anti-flood protection, which answers with an HTML page instead of JSON.
 *  - Clients send RELATIVE paths only; the server re-anchors them inside the
 *    uploads directory. Absolute paths in request bodies both leak server
 *    layout and are classic WAF triggers.
 *  - A shutdown handler emits JSON even on PHP fatals (memory/time) so the
 *    client never has to parse an HTML error page.
 */

// ── AJAX handler — MUST come FIRST before any HTML output ──────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action'])) {
    while (ob_get_level()) ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache');

    // Warnings/deprecations must never leak into the JSON body
    ini_set('display_errors', '0');
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE & ~E_WARNING);

    register_shutdown_function(function () {
        $err = error_get_last();
        if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
            if (!headers_sent()) {
                http_response_code(200);
                header('Content-Type: application/json; charset=utf-8');
            }
            echo json_encode(['success' => false, 'fatal' => true, 'message' => 'PHP fatal: ' . $err['message']]);
        }
    });

    require_once __DIR__ . '/../config/config.php';
    require_once __DIR__ . '/../config/database.php';

    // ── Auth — same rules as includes/header.php, JSON flavour ──────
    if (session_status() === PHP_SESSION_NONE) session_start();
    $cvAuthed = !empty($_SESSION['admin_id']);
    if (!$cvAuthed) {
        $tok = $_COOKIE['admin_token'] ?? '';
        if (!$tok && preg_match('/Bearer\s+(.+)/', $_SERVER['HTTP_AUTHORIZATION'] ?? '', $m)) {
            $tok = $m[1];
        }
        $parts = explode('.', $tok);
        if (count($parts) === 3) {
            $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
            if ($payload && (!isset($payload['exp']) || $payload['exp'] > time())) {
                $cvAuthed = true;
            }
        }
    }
    if (!$cvAuthed) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Session expired — log in to the admin panel again.']);
        exit;
    }

    // ── Uploads directory (single source of truth for path containment) ──
    $uploadDir = defined('UPLOAD_DIR') ? UPLOAD_DIR : __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) $uploadDir = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/uploads/';
    $uploadReal = realpath($uploadDir) ?: '';

    /** Re-anchor a client-supplied path inside the uploads dir; null if it
     *  escapes containment. The returned path may not exist — callers check. */
    function cv_resolve(string $path, string $uploadReal): ?string {
        if ($uploadReal === '') return null;
        $path = str_replace('\\', '/', trim($path));
        if ($path === '' || str_contains($path, '..')) return null;
        // Accept "/uploads/x", "uploads/x", plain "x", or a legacy absolute path
        if ($path[0] === '/' && !preg_match('#^/uploads/#i', $path)) {
            $candidate = $path;
        } else {
            $candidate = $uploadReal . '/' . preg_replace('#^/?uploads/#i', '', $path);
        }
        $dirReal = realpath(dirname($candidate));
        if (!$dirReal) return null;
        $inside = ($dirReal === $uploadReal) || str_starts_with($dirReal, $uploadReal . DIRECTORY_SEPARATOR);
        if (!$inside) return null;
        return $dirReal . DIRECTORY_SEPARATOR . basename($candidate);
    }

    function cv_mem_limit(): int {
        $v = trim(ini_get('memory_limit') ?: '');
        if ($v === '' || (int)$v < 0) return 0;
        $unit = strtoupper(substr($v, -1));
        $mult = $unit === 'G' ? 1073741824 : ($unit === 'M' ? 1048576 : ($unit === 'K' ? 1024 : 1));
        return (int)$v * $mult;
    }

    /** Convert one file to WebP + update DB references. Returns a result row. */
    function cv_convert_one(string $srcPath, string $uploadReal): array {
        $rel = '/uploads/' . str_replace('\\', '/', ltrim(substr($srcPath, strlen($uploadReal)), '/\\'));
        $out = ['rel' => $rel, 'ok' => false];

        $oldSize = @filesize($srcPath);
        if (!$oldSize) { $out['message'] = 'Empty file (0 bytes)'; return $out; }
        $out['old_size_kb'] = round($oldSize / 1024, 1);

        $info = @getimagesize($srcPath);
        $mime = $info['mime'] ?? '';
        if ($mime === 'image/webp') { $out['message'] = 'Already WebP'; return $out; }

        // Memory guard: decoding needs ~5-6 bytes per pixel; skip what cannot fit
        if ($info && !empty($info[0]) && !empty($info[1])) {
            $limit = cv_mem_limit();
            $needed = $info[0] * $info[1] * 6 + 16 * 1048576;
            if ($limit > 0 && memory_get_usage(true) + $needed > $limit) {
                $out['message'] = 'Too large to convert here (' . $info[0] . 'x' . $info[1] . ')';
                return $out;
            }
        }

        $img = false;
        if ($mime === 'image/jpeg')      $img = @imagecreatefromjpeg($srcPath);
        elseif ($mime === 'image/png') { $img = @imagecreatefrompng($srcPath); if ($img) { imagealphablending($img, true); imagesavealpha($img, true); } }
        elseif ($mime === 'image/gif')   $img = @imagecreatefromgif($srcPath);
        elseif ($mime === 'image/bmp' || $mime === 'image/x-bmp') $img = @imagecreatefrombmp($srcPath);
        if (!$img) {
            $raw = @file_get_contents($srcPath);
            if ($raw) {
                $img = @imagecreatefromstring($raw);
                unset($raw);
                if ($img) { imagealphablending($img, true); imagesavealpha($img, true); }
            }
        }
        if (!$img) { $out['message'] = 'Cannot open image'; return $out; }

        $webpPath = preg_replace('/\.(jpg|jpeg|png|gif|bmp)$/i', '.webp', $srcPath);
        $ok = imagewebp($img, $webpPath, 82);
        unset($img); // GD images free themselves since PHP 8.0; imagedestroy() warns on 8.5
        if (!$ok || !file_exists($webpPath)) { $out['message'] = 'WebP write failed'; return $out; }

        $out['new_size_kb'] = round(filesize($webpPath) / 1024, 1);
        $out['saved_kb'] = round($out['old_size_kb'] - $out['new_size_kb'], 1);
        $out['old'] = basename($srcPath);
        $out['new'] = basename($webpPath);

        // Update DB references (old path → new path, all known image columns)
        $oldRel = $rel;
        $newRel = preg_replace('/\.(jpg|jpeg|png|gif|bmp)$/i', '.webp', $oldRel);
        $rows = 0;
        try {
            $db = (new Database())->getConnection();
            $cols = [
                ['products', 'image'],
                ['product_images', 'image_path'],
                ['categories', 'image'],
                ['banners', 'image_path'],
                ['product_variations', 'image'],
                ['blog_posts', 'image'],
                ['site_settings', 'setting_value'],
            ];
            foreach ($cols as [$tbl, $col]) {
                foreach ([$oldRel, ltrim($oldRel, '/'), basename($oldRel)] as $v) {
                    $nr = ($v === basename($oldRel)) ? basename($newRel) : (str_starts_with($v, '/') ? $newRel : ltrim($newRel, '/'));
                    try {
                        $s = $db->prepare("UPDATE `$tbl` SET `$col`=:n WHERE `$col`=:o");
                        $s->execute([':o' => $v, ':n' => $nr]);
                        $rows += $s->rowCount();
                    } catch (PDOException $e) {}
                }
            }
        } catch (Exception $e) {}
        $out['db_updated'] = $rows;

        @unlink($srcPath);
        $out['ok'] = true;
        return $out;
    }

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
        $files = [];
        if ($uploadReal !== '') {
            $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($uploadReal, RecursiveDirectoryIterator::SKIP_DOTS));
            foreach ($it as $f) {
                if (!$f->isFile()) continue;
                $ext = strtolower($f->getExtension());
                if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif'])) continue;
                $webpPath = preg_replace('/\.(jpg|jpeg|png|gif)$/i', '.webp', $f->getPathname());
                $rel = '/uploads/' . str_replace('\\', '/', ltrim(substr($f->getPathname(), strlen($uploadReal)), '/\\'));
                $files[] = [
                    'rel'      => $rel,
                    'path'     => $rel, // compat: cached old page JS sends f.path back
                    'size'     => round($f->getSize() / 1024, 1),
                    'ext'      => $ext,
                    'has_webp' => file_exists($webpPath),
                ];
            }
        }
        echo json_encode(['success' => true, 'files' => $files, 'count' => count($files), 'dir' => '/uploads/']);
        exit;
    }

    // ── Convert a batch within a time budget ─────────────────────────
    if ($action === 'convert_batch') {
        if (!function_exists('imagewebp')) {
            echo json_encode(['success' => false, 'message' => 'imagewebp() not available — enable GD WebP on server']);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $list  = array_values(array_filter(array_map('strval', (array)($input['files'] ?? []))));
        if (!$list) { echo json_encode(['success' => false, 'message' => 'No files given']); exit; }
        $list = array_slice($list, 0, 60);

        @set_time_limit(120);
        $maxExec  = (int)ini_get('max_execution_time');
        $budget   = ($maxExec > 8 ? min(20, $maxExec - 6) : 20);
        $deadline = microtime(true) + $budget;

        $results = [];
        $pending = [];
        foreach ($list as $k => $relPath) {
            if (microtime(true) >= $deadline) { $pending = array_slice($list, $k); break; }
            $full = cv_resolve($relPath, $uploadReal);
            if (!$full) {
                $results[] = ['rel' => $relPath, 'ok' => false, 'message' => 'Invalid path (outside uploads)'];
                continue;
            }
            if (!is_file($full)) {
                $results[] = ['rel' => $relPath, 'ok' => false, 'message' => 'File not found (already converted?)'];
                continue;
            }
            $results[] = cv_convert_one($full, $uploadReal);
        }
        echo json_encode(['success' => true, 'results' => $results, 'pending' => array_values($pending)]);
        exit;
    }

    // ── Convert single file (legacy) ─────────────────────────────────
    if ($action === 'convert') {
        if (!function_exists('imagewebp')) {
            echo json_encode(['success' => false, 'message' => 'imagewebp() not available — enable GD WebP on server']);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $file  = (string)($input['file'] ?? '');
        if ($file === '') { echo json_encode(['success' => false, 'message' => 'Empty file path — purana page cached hai. Hard refresh karo (Cmd+Shift+R) aur dobara Scan chalao.']); exit; }
        $full = cv_resolve($file, $uploadReal);
        if (!$full) { echo json_encode(['success' => false, 'message' => 'Invalid path (outside uploads)']); exit; }
        if (!is_file($full)) { echo json_encode(['success' => false, 'message' => 'File not found (already converted?)']); exit; }
        $r = cv_convert_one($full, $uploadReal);
        echo json_encode(['success' => (bool)$r['ok'], 'message' => $r['message'] ?? ''] + $r);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Unknown action: ' . htmlspecialchars($action)]);
    exit;
}

// ── HTML PAGE (GET requests only reach here) ────────────────────────
// Never let the browser cache this page — a stale copy of the inline JS
// speaking to a newer endpoint produces confusing per-file failures.
header('Cache-Control: no-store, must-revalidate');
header('Pragma: no-cache');
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
  
  <div style="text-align: center; padding: 15px; color: #64748b; font-size: 13px; margin-top: 10px;">
      Powered by <a href="https://webcraftstech.in" target="_blank" style="color: var(--admin-primary); text-decoration: none;">webcraftstech.in</a>
  </div>
</div>

<script>
let allFiles = [];
let done = 0, errors = 0, savedKB = 0, totalCount = 0;
const token = localStorage.getItem('admin_token') || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function apiFetch(action, body) {
  const opts = { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } };
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const r = await fetch(location.pathname + '?action=' + action, opts);
  const text = await r.text();
  try { return JSON.parse(text); }
  catch(e) { throw new Error('Server returned HTML instead of JSON (host protection or PHP error). Preview: ' + text.substring(0, 120)); }
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
    } else {
      log('ok', `✅ ${allFiles.length} images mili. Convert button dabao.`);
      allFiles.slice(0, 6).forEach(f => log('info', `  📄 ${f.rel} (${f.size} KB) [${f.ext.toUpperCase()}]`));
      if (allFiles.length > 6) log('info', `  ...aur ${allFiles.length - 6} aur files`);
      document.getElementById('btnConvert').disabled = false;
    }
  } catch(e) { log('err', 'Scan failed: ' + e.message); }
  document.getElementById('btnScan').disabled = false;
}

/* Batched conversion: one request converts many files inside a server-side
   time budget. Unfinished files come back in `pending` and are re-queued.
   Gentle pacing + retry keeps the host's anti-flood protection quiet. */
async function doConvert() {
  if (!allFiles.length) { await doScan(); return; }
  document.getElementById('btnConvert').disabled = true;
  document.getElementById('btnScan').disabled = true;
  document.getElementById('pwrap').style.display = 'block';
  done = 0; errors = 0; savedKB = 0; updateStats();

  let queue = allFiles.map(f => f.rel);
  totalCount = queue.length;
  const CHUNK = 30;

  while (queue.length) {
    const batch = queue.slice(0, CHUNK);
    queue = queue.slice(CHUNK);
    setProgress(`Converting… ${totalCount - queue.length - batch.length + 1}–${totalCount - queue.length} of ${totalCount}`);

    let d = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { d = await apiFetch('convert_batch', { files: batch }); break; }
      catch (e) {
        if (attempt === 3) { errors += batch.length; log('err', `❌ Batch failed after 3 tries — ${e.message}`); }
        else { log('warn', `⚠️ Batch attempt ${attempt} failed, retrying in ${2 * attempt}s… (${e.message.substring(0, 80)})`); await sleep(2000 * attempt); }
      }
    }
    if (!d) { updateStats(); continue; }
    if (!d.success && d.message) { errors += batch.length; log('err', '❌ ' + d.message); updateStats(); continue; }

    (d.results || []).forEach(res => {
      if (res.ok) {
        done++; savedKB += res.saved_kb || 0;
        log('ok', `✅ ${res.old} → ${res.new} | ${res.old_size_kb}→${res.new_size_kb}KB (−${res.saved_kb}KB)` + (res.db_updated > 0 ? ` | DB: ${res.db_updated} rows` : ''));
      } else {
        errors++; log('err', `❌ ${res.rel} — ${res.message || 'failed'}`);
      }
    });

    // Files the server didn't reach inside its time budget go back on the queue
    const pending = d.pending || [];
    if (pending.length) {
      if (!(d.results || []).length) {
        // Zero progress — drop the first file so we can't loop forever
        const skipped = pending.shift();
        errors++; log('err', `❌ ${skipped} — could not convert within the server time budget`);
      }
      queue = pending.concat(queue);
    }

    updateStats();
    setProgressBar();
    await sleep(350);
  }

  document.getElementById('pbar').style.width = '100%';
  document.getElementById('plabel').textContent = '✅ Complete!';
  document.getElementById('btnScan').disabled = false;
  log('info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('ok', `🎉 Done! Converted: ${done} | Errors: ${errors} | Saved: ${savedKB >= 1024 ? (savedKB/1024).toFixed(1)+' MB' : savedKB.toFixed(0)+' KB'}`);
}

function setProgress(text) { document.getElementById('plabel').textContent = text; }
function setProgressBar() {
  const processed = done + errors;
  document.getElementById('pbar').style.width = Math.min(100, Math.round((processed / Math.max(1, totalCount)) * 100)) + '%';
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
