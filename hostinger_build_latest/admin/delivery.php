<?php
/**
 * Delivery Settings Admin Panel
 * Asian Food Cork — Delivery Charges Management
 */
session_start();
if (empty($_SESSION['admin_logged_in'])) {
    header('Location: index.php'); exit;
}
require_once '../config/database.php';
$db = getDB();

// ── Seed delivery defaults if missing ────────────────────────────────────────
$defaults = [
    ['delivery_free_above',        '50',   'number',  'delivery'],
    ['delivery_free_enabled',      '1',    'boolean', 'delivery'],
    ['delivery_cork_city_fee',     '2.95', 'number',  'delivery'],
    ['delivery_outside_cork_fee',  '4.95', 'number',  'delivery'],
    ['delivery_small_order_min',   '25',   'number',  'delivery'],
    ['delivery_small_order_fee',   '1.50', 'number',  'delivery'],
    ['delivery_small_order_enabled','1',   'boolean', 'delivery'],
];
$seed = $db->prepare("INSERT IGNORE INTO site_settings (setting_key,setting_value,setting_type,setting_group) VALUES(:k,:v,:t,:g)");
foreach ($defaults as $d) {
    try { $seed->execute([':k'=>$d[0],':v'=>$d[1],':t'=>$d[2],':g'=>$d[3]]); } catch(Exception $e){}
}

// ── Fetch current settings ────────────────────────────────────────────────────
$stmt = $db->query("SELECT setting_key,setting_value FROM site_settings WHERE setting_group='delivery'");
$settings = [];
foreach ($stmt->fetchAll() as $r) { $settings[$r['setting_key']] = $r['setting_value']; }

$msg = '';
$msgType = '';

// ── Handle save ───────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fields = [
        'delivery_free_above','delivery_free_enabled',
        'delivery_cork_city_fee','delivery_outside_cork_fee',
        'delivery_small_order_min','delivery_small_order_fee',
        'delivery_small_order_enabled'
    ];
    $upsert = $db->prepare("INSERT INTO site_settings (setting_key,setting_value,setting_group)
        VALUES(:k,:v,'delivery')
        ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)");
    $booleans = ['delivery_free_enabled','delivery_small_order_enabled'];
    foreach ($fields as $f) {
        $val = in_array($f, $booleans)
            ? (isset($_POST[$f]) ? '1' : '0')
            : trim($_POST[$f] ?? '0');
        $upsert->execute([':k'=>$f,':v'=>$val]);
    }
    // Refetch
    $stmt = $db->query("SELECT setting_key,setting_value FROM site_settings WHERE setting_group='delivery'");
    $settings = [];
    foreach ($stmt->fetchAll() as $r) { $settings[$r['setting_key']] = $r['setting_value']; }
    $msg = 'Delivery settings saved successfully!';
    $msgType = 'success';
}

function s($key, $default = '') {
    global $settings;
    return htmlspecialchars($settings[$key] ?? $default);
}
function chk($key, $default = '1') {
    global $settings;
    return ($settings[$key] ?? $default) == '1' ? 'checked' : '';
}

$pageTitle = 'Delivery Settings';
include 'includes/header.php';
?>
<style>
/* ── Page-specific styles ──────────────────────────────────────────────────── */
.delivery-grid { display:grid; grid-template-columns:1fr 1fr; gap:22px; max-width:960px; }
@media(max-width:640px){ .delivery-grid{grid-template-columns:1fr;} }
.dcard {
  background:#1e293b; border-radius:12px;
  border:1px solid rgba(255,255,255,0.06); padding:24px;
}
.dcard-full { grid-column:1/-1; }
.dcard h3 {
  font-size:13px; font-weight:700; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.08em;
  margin:0 0 18px; display:flex; align-items:center; gap:8px;
}

/* Fields */
.dfield { margin-bottom:16px; }
.dfield label { display:block; font-size:13px; font-weight:600; color:#cbd5e1; margin-bottom:6px; }
.dfield-hint  { font-size:11px; color:#64748b; margin-top:4px; }
.euro-wrap { position:relative; }
.euro-wrap::before { content:'€'; position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#64748b; pointer-events:none; }
.euro-wrap input { padding-left:26px !important; }
.dfield input[type=number] {
  width:100%; padding:10px 14px; box-sizing:border-box;
  background:#0f172a; border:1px solid rgba(255,255,255,0.1);
  border-radius:8px; color:#f1f5f9; font-size:14px;
  outline:none; transition:border-color .2s; font-family:inherit;
}
.dfield input[type=number]:focus { border-color:#3b82f6; }

/* Toggle */
.toggle-row {
  display:flex; align-items:center; justify-content:space-between;
  background:#0f172a; border-radius:10px; padding:13px 16px; margin-bottom:14px;
  border:1px solid rgba(255,255,255,0.06);
}
.toggle-lbl  { font-size:13px; font-weight:600; color:#e2e8f0; }
.toggle-desc { font-size:11px; color:#64748b; margin-top:2px; }
.tswitch { position:relative; width:46px; height:26px; flex-shrink:0; }
.tswitch input { opacity:0; width:0; height:0; }
.tslider {
  position:absolute; inset:0; background:#374151; border-radius:26px;
  cursor:pointer; transition:background .2s;
}
.tslider::before {
  content:''; position:absolute; width:18px; height:18px; border-radius:50%;
  background:#fff; left:4px; top:4px; transition:transform .2s;
  box-shadow:0 1px 4px rgba(0,0,0,.3);
}
.tswitch input:checked + .tslider { background:#22c55e; }
.tswitch input:checked + .tslider::before { transform:translateX(20px); }

/* Zone chips */
.zones-row { display:flex; gap:12px; }
.zone-chip { flex:1; padding:16px 12px; border-radius:10px; text-align:center; }
.zone-icon { font-size:22px; margin-bottom:6px; }
.zone-name { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; }
.zone-fee  { font-size:20px; font-weight:800; color:#f1f5f9; margin-top:4px; }
.zone-note { font-size:10px; color:#64748b; margin-top:3px; }
.zone-cork    { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.2); }
.zone-outside { background:rgba(251,146,60,.1); border:1px solid rgba(251,146,60,.2); }

/* Preview */
.preview-inner { background:#0f172a; border-radius:10px; padding:16px; }
.preview-row {
  display:flex; justify-content:space-between; align-items:center;
  padding:8px 0; border-bottom:1px solid rgba(255,255,255,.05);
  font-size:13px;
}
.preview-row:last-child { border:none; }
.preview-row .pl { color:#94a3b8; }
.preview-row .pv { font-weight:700; }
.pv-free { color:#4ade80; }
.pv-fee  { color:#fb923c; }

/* Save bar */
.save-bar {
  max-width:960px; margin-top:28px;
  display:flex; align-items:center; justify-content:flex-end; gap:16px;
}
.btn-save-delivery {
  background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff;
  border:none; border-radius:10px; padding:12px 32px;
  font-size:14px; font-weight:700; cursor:pointer; transition:all .2s;
}
.btn-save-delivery:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(59,130,246,.4); }
.alert-ok  { padding:10px 16px; border-radius:8px; font-size:13px; font-weight:600; background:rgba(34,197,94,.12); color:#4ade80; border:1px solid rgba(34,197,94,.2); }
.alert-err { padding:10px 16px; border-radius:8px; font-size:13px; font-weight:600; background:rgba(239,68,68,.12); color:#f87171; border:1px solid rgba(239,68,68,.2); }
</style>

<?php if ($msg): ?>
<div class="alert-<?= $msgType === 'success' ? 'ok' : 'err' ?>" style="margin-bottom:20px;max-width:960px">
  <?= $msgType === 'success' ? '✅' : '❌' ?> <?= htmlspecialchars($msg) ?>
</div>
<?php endif; ?>

<div style="margin-bottom:20px;max-width:960px">
  <div style="font-size:22px;font-weight:800;color:#f1f5f9;margin-bottom:4px">🚚 Delivery Settings</div>
  <div style="font-size:14px;color:#64748b">Configure delivery zones, fees and free delivery thresholds</div>
</div>

<form method="POST">
<div class="delivery-grid">

  <!-- Zone Overview -->
  <div class="dcard dcard-full">
    <h3>🗺️ Current Zone Overview</h3>
    <div class="zones-row">
      <div class="zone-chip zone-cork">
        <div class="zone-icon">🏙️</div>
        <div class="zone-name">Cork City</div>
        <div class="zone-fee">€<?= s('delivery_cork_city_fee','2.95') ?></div>
        <div class="zone-note">Free above €<?= s('delivery_free_above','50') ?></div>
      </div>
      <div class="zone-chip zone-outside">
        <div class="zone-icon">🚐</div>
        <div class="zone-name">Outside Cork</div>
        <div class="zone-fee">€<?= s('delivery_outside_cork_fee','4.95') ?></div>
        <div class="zone-note">+€<?= s('delivery_small_order_fee','1.50') ?> for orders under €<?= s('delivery_small_order_min','25') ?></div>
      </div>
    </div>
  </div>

  <!-- Free Delivery -->
  <div class="dcard">
    <h3>🎁 Free Delivery</h3>
    <div class="toggle-row">
      <div>
        <div class="toggle-lbl">Enable Free Delivery</div>
        <div class="toggle-desc">Cork City orders above threshold</div>
      </div>
      <label class="tswitch">
        <input type="checkbox" name="delivery_free_enabled" <?= chk('delivery_free_enabled') ?>>
        <span class="tslider"></span>
      </label>
    </div>
    <div class="dfield">
      <label>Free Delivery Threshold</label>
      <div class="euro-wrap">
        <input type="number" name="delivery_free_above" value="<?= s('delivery_free_above','50') ?>" step="0.01" min="0" required>
      </div>
      <div class="dfield-hint">Cork City orders above this amount = free delivery</div>
    </div>
  </div>

  <!-- Delivery Fees -->
  <div class="dcard">
    <h3>💰 Delivery Fees</h3>
    <div class="dfield">
      <label>Cork City Fee</label>
      <div class="euro-wrap">
        <input type="number" name="delivery_cork_city_fee" value="<?= s('delivery_cork_city_fee','2.95') ?>" step="0.01" min="0" required>
      </div>
      <div class="dfield-hint">Charged when order is below free delivery threshold</div>
    </div>
    <div class="dfield">
      <label>Outside Cork City Fee</label>
      <div class="euro-wrap">
        <input type="number" name="delivery_outside_cork_fee" value="<?= s('delivery_outside_cork_fee','4.95') ?>" step="0.01" min="0" required>
      </div>
      <div class="dfield-hint">Always charged for non-Cork-City locations</div>
    </div>
  </div>

  <!-- Small Order Surcharge -->
  <div class="dcard">
    <h3>📦 Small Order Surcharge</h3>
    <div class="toggle-row">
      <div>
        <div class="toggle-lbl">Enable Small Order Fee</div>
        <div class="toggle-desc">Extra fee for small orders outside Cork City</div>
      </div>
      <label class="tswitch">
        <input type="checkbox" name="delivery_small_order_enabled" <?= chk('delivery_small_order_enabled') ?>>
        <span class="tslider"></span>
      </label>
    </div>
    <div class="dfield">
      <label>Small Order Minimum</label>
      <div class="euro-wrap">
        <input type="number" name="delivery_small_order_min" value="<?= s('delivery_small_order_min','25') ?>" step="0.01" min="0">
      </div>
      <div class="dfield-hint">Orders below this amount get the extra fee</div>
    </div>
    <div class="dfield">
      <label>Small Order Extra Fee</label>
      <div class="euro-wrap">
        <input type="number" name="delivery_small_order_fee" value="<?= s('delivery_small_order_fee','1.50') ?>" step="0.01" min="0">
      </div>
      <div class="dfield-hint">Added on top of delivery fee for small orders</div>
    </div>
  </div>

  <!-- Preview -->
  <div class="dcard">
    <h3>👁️ Pricing Preview</h3>
    <div class="preview-inner">
      <div class="preview-row">
        <span class="pl">🏙️ Cork City — €55 order</span>
        <span class="pv pv-free">FREE</span>
      </div>
      <div class="preview-row">
        <span class="pl">🏙️ Cork City — €30 order</span>
        <span class="pv pv-fee">€<?= s('delivery_cork_city_fee','2.95') ?></span>
      </div>
      <div class="preview-row">
        <span class="pl">🚐 Outside Cork — €40 order</span>
        <span class="pv pv-fee">€<?= s('delivery_outside_cork_fee','4.95') ?></span>
      </div>
      <div class="preview-row">
        <span class="pl">🚐 Outside Cork — €18 order</span>
        <span class="pv pv-fee">€<?= number_format((float)($settings['delivery_outside_cork_fee']??4.95)+(float)($settings['delivery_small_order_fee']??1.50),2) ?></span>
      </div>
    </div>
  </div>

</div><!-- /delivery-grid -->

<!-- Detection Info -->
<div class="dcard" style="margin-top:22px;max-width:960px">
  <h3>📍 Cork City Detection Rules</h3>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
    <div style="background:#0f172a;border-radius:10px;padding:14px;border:1px solid rgba(255,255,255,.06)">
      <div style="font-size:12px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">✅ Detected as Cork City</div>
      <div style="font-size:12px;color:#94a3b8;line-height:1.9">
        Eircode starts with <strong style="color:#e2e8f0">T</strong> (T12, T23, T34...)<br>
        OR City field contains <strong style="color:#e2e8f0">"Cork"</strong><br>
        OR County = <strong style="color:#e2e8f0">Cork</strong>
      </div>
    </div>
    <div style="background:#0f172a;border-radius:10px;padding:14px;border:1px solid rgba(255,255,255,.06)">
      <div style="font-size:12px;font-weight:700;color:#fb923c;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">🚐 Detected as Outside Cork</div>
      <div style="font-size:12px;color:#94a3b8;line-height:1.9">
        Eircode starts with any letter other than T<br>
        OR County ≠ Cork<br>
        OR City does not contain "Cork"
      </div>
    </div>
  </div>
</div>

<div class="save-bar">
  <button type="submit" class="btn-save-delivery">💾 Save Delivery Settings</button>
</div>
</form>

<?php include 'includes/footer.php'; ?>
