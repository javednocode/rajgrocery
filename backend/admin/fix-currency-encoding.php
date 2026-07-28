<?php
/**
 * fix-currency-encoding.php
 * One-time script to fix a corrupted currency_symbol value in site_settings.
 *
 * The euro sign stored with the wrong charset ends up as garbled chars (latin1 bytes
 * of the 3-byte UTF-8 sequence E2 82 AC). This script detects and corrects that value.
 *
 * Usage: Visit /admin/fix-currency-encoding.php once in a browser while logged in.
 * DELETE THIS FILE after running it.
 */

if (session_status() === PHP_SESSION_NONE) session_start();

// Simple auth guard
$isAuth = false;
if (!empty($_SESSION['admin_id'])) $isAuth = true;
if (!$isAuth && !empty($_COOKIE['admin_token'])) {
    $parts = explode('.', $_COOKIE['admin_token']);
    if (count($parts) === 3) {
        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
        if ($payload && (!isset($payload['exp']) || $payload['exp'] > time())) $isAuth = true;
    }
}
if (!$isAuth) { http_response_code(403); die('Forbidden — log in first.'); }

require_once __DIR__ . '/../config/database.php';
try { $db = (new Database())->getConnection(); }
catch (Throwable $e) { die('DB connection failed: ' . htmlspecialchars($e->getMessage())); }

$fixed = []; $errors = [];

// Fix site_settings currency_symbol
$row = $db->query("SELECT setting_value FROM site_settings WHERE setting_key = 'currency_symbol'")->fetch(PDO::FETCH_ASSOC);
$settingFixed = false;
if ($row && !mb_check_encoding($row['setting_value'], 'UTF-8')) {
    $conv = mb_convert_encoding($row['setting_value'], 'UTF-8', 'ISO-8859-1');
    if ($conv && mb_check_encoding($conv, 'UTF-8')) {
        $db->prepare("UPDATE site_settings SET setting_value = :v WHERE setting_key = 'currency_symbol'")->execute([':v' => $conv]);
        $settingFixed = true;
    }
}
?>
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Currency Fix</title>
<style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:20px;background:#0f172a;color:#e2e8f0}h1{color:#38bdf8}.ok{background:#14532d;border-left:4px solid #22c55e;padding:12px 16px;border-radius:6px;margin:8px 0}.err{background:#7f1d1d;border-left:4px solid #ef4444;padding:12px 16px;border-radius:6px;margin:8px 0}.info{background:#1e3a5f;border-left:4px solid #38bdf8;padding:12px 16px;border-radius:6px;margin:8px 0}code{background:rgba(255,255,255,.1);padding:2px 6px;border-radius:4px}</style>
</head><body>
<h1>🔧 Currency Encoding Fix</h1>
<?php if (empty($fixed) && empty($errors)): ?>
<div class="info">✅ No corrupted values found — everything looks correct!</div>
<?php else: ?>
<?php foreach ($fixed as $f): ?>
<div class="ok">✅ Fixed <strong><?=htmlspecialchars($f['name'])?></strong> (ID <?=$f['id']?>) — <del style="color:#f87171"><?=htmlspecialchars($f['from'])?></del> → <span style="color:#4ade80"><?=htmlspecialchars($f['to'])?></span></div>
<?php endforeach; ?>
<?php foreach ($errors as $err): ?><div class="err">❌ <?=htmlspecialchars($err)?></div><?php endforeach; ?>
<?php endif; ?>
<?php if ($settingFixed): ?><div class="ok">✅ Fixed <code>currency_symbol</code> in <code>site_settings</code> table.</div><?php endif; ?>
<div class="info" style="margin-top:24px;">⚠️ <strong>Delete this file after running it!</strong><br><code>/admin/fix-currency-encoding.php</code></div>
</body></html>
