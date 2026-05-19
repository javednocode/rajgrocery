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
    ['delivery_free_above',       '50',   'number',  'delivery', 'Free delivery above (€)'],
    ['delivery_free_enabled',     '1',    'boolean', 'delivery', 'Enable free delivery threshold'],
    ['delivery_cork_city_fee',    '2.95', 'number',  'delivery', 'Cork City delivery fee (€)'],
    ['delivery_outside_cork_fee', '4.95', 'number',  'delivery', 'Outside Cork City fee (€)'],
    ['delivery_small_order_min',  '25',   'number',  'delivery', 'Small order minimum (€)'],
    ['delivery_small_order_fee',  '1.50', 'number',  'delivery', 'Small order extra fee (€)'],
    ['delivery_small_order_enabled','1',  'boolean', 'delivery', 'Enable small order surcharge'],
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
    foreach ($fields as $f) {
        $val = isset($_POST[$f]) ? (in_array($f,['delivery_free_enabled','delivery_small_order_enabled']) ? '1' : trim($_POST[$f])) : '0';
        $upsert->execute([':k'=>$f,':v'=>$val]);
    }
    // Refetch
    $stmt = $db->query("SELECT setting_key,setting_value FROM site_settings WHERE setting_group='delivery'");
    $settings = [];
    foreach ($stmt->fetchAll() as $r) { $settings[$r['setting_key']] = $r['setting_value']; }
    $msg = '✅ Delivery settings saved successfully!';
    $msgType = 'success';
}

function s($key, $default = '') {
    global $settings;
    return htmlspecialchars($settings[$key] ?? $default);
}
function checked($key, $default = '1') {
    global $settings;
    return ($settings[$key] ?? $default) == '1' ? 'checked' : '';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Delivery Settings — Admin</title>
<?php include 'includes/header.php'; ?>
<style>
.delivery-page { max-width: 820px; }
.page-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-sub   { font-size: 14px; color: #64748b; margin: 0 0 28px; }

.delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
@media(max-width:640px){ .delivery-grid{grid-template-columns:1fr;} }

.card {
  background: #1e293b; border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.06);
  padding: 24px;
}
.card-full { grid-column: 1/-1; }
.card h3 {
  font-size: 14px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.08em;
  margin: 0 0 18px; display: flex; align-items: center; gap: 8px;
}
.card h3 .icon { font-size: 16px; }

.field { margin-bottom: 16px; }
.field label {
  display: block; font-size: 13px; font-weight: 600;
  color: #cbd5e1; margin-bottom: 6px;
}
.field input[type=number], .field input[type=text] {
  width: 100%; padding: 10px 14px; box-sizing: border-box;
  background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; color: #f1f5f9; font-size: 14px;
  outline: none; transition: border-color 0.2s;
}
.field input:focus { border-color: #3b82f6; }

.field-hint { font-size: 11px; color: #64748b; margin-top: 4px; }

.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  background: #0f172a; border-radius: 10px;
  padding: 14px 16px; margin-bottom: 14px;
  border: 1px solid rgba(255,255,255,0.06);
}
.toggle-label { font-size: 13px; font-weight: 600; color: #e2e8f0; }
.toggle-desc  { font-size: 11px; color: #64748b; margin-top: 2px; }

/* Toggle switch */
.toggle-switch { position: relative; width: 46px; height: 26px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; inset: 0; background: #374151; border-radius: 26px;
  cursor: pointer; transition: background 0.2s;
}
.toggle-slider::before {
  content: ''; position: absolute;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; left: 4px; top: 4px;
  transition: transform 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.toggle-switch input:checked + .toggle-slider { background: #22c55e; }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(20px); }

/* Preview card */
.preview-card {
  background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 12px; padding: 20px;
}
.preview-card h4 { font-size: 13px; color: #93c5fd; font-weight: 700; margin: 0 0 14px; letter-spacing: 0.06em; text-transform: uppercase; }
.preview-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 13px;
}
.preview-row:last-child { border: none; }
.preview-row .label { color: #94a3b8; }
.preview-row .value { color: #f1f5f9; font-weight: 700; }
.preview-row .value.free { color: #22c55e; }
.preview-row .value.fee  { color: #fb923c; }

.save-bar {
  position: sticky; bottom: 0; z-index: 10;
  background: #1e293b; border-top: 1px solid rgba(255,255,255,0.06);
  padding: 16px 0; margin-top: 28px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.btn-save {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white; border: none; border-radius: 10px;
  padding: 12px 32px; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.4); }
.alert { padding: 12px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; }
.alert-success { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }

.zones-visual {
  display: flex; gap: 12px; margin-bottom: 0;
}
.zone-chip {
  flex: 1; padding: 14px; border-radius: 10px; text-align: center;
}
.zone-chip .zone-icon { font-size: 24px; margin-bottom: 6px; }
.zone-chip .zone-name { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
.zone-chip .zone-fee  { font-size: 18px; font-weight: 800; color: #f1f5f9; margin-top: 4px; }
.zone-chip .zone-note { font-size: 10px; color: #64748b; margin-top: 3px; }
.zone-cork    { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); }
.zone-outside { background: rgba(251,146,60,0.1); border: 1px solid rgba(251,146,60,0.2); }

.euro-prefix { position: relative; }
.euro-prefix::before {
  content: '€'; position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: #64748b; font-size: 14px; pointer-events: none;
  line-height: 1;
}
.euro-prefix input { padding-left: 28px !important; }
</style>
</head>
<body>
<div class="admin-layout">
<?php include 'includes/sidebar.php'; ?>
<main class="admin-main">
  <?php include 'includes/topbar.php'; ?>
  <div class="admin-content delivery-page">

    <div class="page-title">🚚 Delivery Settings</div>
    <div class="page-sub">Configure delivery zones, fees and free delivery thresholds</div>

    <?php if ($msg): ?>
      <div class="alert alert-<?= $msgType ?>" style="margin-bottom:20px"><?= $msg ?></div>
    <?php endif; ?>

    <form method="POST">
      <div class="delivery-grid">

        <!-- ── Zone Overview ────────────────────────── -->
        <div class="card card-full">
          <h3><span class="icon">🗺️</span> Delivery Zones Overview</h3>
          <div class="zones-visual">
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
              <div class="zone-note">+ small order fee if below €<?= s('delivery_small_order_min','25') ?></div>
            </div>
          </div>
        </div>

        <!-- ── Free Delivery ────────────────────────── -->
        <div class="card">
          <h3><span class="icon">🎁</span> Free Delivery</h3>

          <div class="toggle-row">
            <div>
              <div class="toggle-label">Enable Free Delivery</div>
              <div class="toggle-desc">Cork City orders above threshold get free delivery</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" name="delivery_free_enabled" value="1" <?= checked('delivery_free_enabled') ?>>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="field">
            <label>Free Delivery Threshold (€)</label>
            <div class="euro-prefix">
              <input type="number" name="delivery_free_above" value="<?= s('delivery_free_above','50') ?>" step="0.01" min="0" required>
            </div>
            <div class="field-hint">Cork City orders above this amount get free delivery</div>
          </div>
        </div>

        <!-- ── Delivery Fees ────────────────────────── -->
        <div class="card">
          <h3><span class="icon">💰</span> Delivery Fees</h3>

          <div class="field">
            <label>Cork City Delivery Fee (€)</label>
            <div class="euro-prefix">
              <input type="number" name="delivery_cork_city_fee" value="<?= s('delivery_cork_city_fee','2.95') ?>" step="0.01" min="0" required>
            </div>
            <div class="field-hint">Charged when order is below free delivery threshold</div>
          </div>

          <div class="field">
            <label>Outside Cork City Fee (€)</label>
            <div class="euro-prefix">
              <input type="number" name="delivery_outside_cork_fee" value="<?= s('delivery_outside_cork_fee','4.95') ?>" step="0.01" min="0" required>
            </div>
            <div class="field-hint">Always charged for non-Cork-City locations</div>
          </div>
        </div>

        <!-- ── Small Order Fee ──────────────────────── -->
        <div class="card">
          <h3><span class="icon">📦</span> Small Order Surcharge</h3>

          <div class="toggle-row">
            <div>
              <div class="toggle-label">Enable Small Order Fee</div>
              <div class="toggle-desc">Apply extra fee for small orders outside Cork City</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" name="delivery_small_order_enabled" value="1" <?= checked('delivery_small_order_enabled') ?>>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="field">
            <label>Small Order Minimum (€)</label>
            <div class="euro-prefix">
              <input type="number" name="delivery_small_order_min" value="<?= s('delivery_small_order_min','25') ?>" step="0.01" min="0">
            </div>
            <div class="field-hint">Orders below this get charged the extra fee</div>
          </div>

          <div class="field">
            <label>Small Order Extra Fee (€)</label>
            <div class="euro-prefix">
              <input type="number" name="delivery_small_order_fee" value="<?= s('delivery_small_order_fee','1.50') ?>" step="0.01" min="0">
            </div>
            <div class="field-hint">Added on top of delivery fee for small orders outside Cork</div>
          </div>
        </div>

        <!-- ── Live Preview ─────────────────────────── -->
        <div class="card">
          <h3><span class="icon">👁️</span> Pricing Preview</h3>
          <div class="preview-card">
            <h4>Example Scenarios</h4>
            <div class="preview-row">
              <span class="label">🏙️ Cork City — €55 order</span>
              <span class="value free">FREE</span>
            </div>
            <div class="preview-row">
              <span class="label">🏙️ Cork City — €30 order</span>
              <span class="value fee">€<?= s('delivery_cork_city_fee','2.95') ?></span>
            </div>
            <div class="preview-row">
              <span class="label">🚐 Outside Cork — €40 order</span>
              <span class="value fee">€<?= s('delivery_outside_cork_fee','4.95') ?></span>
            </div>
            <div class="preview-row">
              <span class="label">🚐 Outside Cork — €18 order</span>
              <span class="value fee">€<?= number_format(($settings['delivery_outside_cork_fee']??4.95)+($settings['delivery_small_order_fee']??1.50),2) ?></span>
            </div>
          </div>
        </div>

      </div><!-- /delivery-grid -->

      <!-- ── Cork City Detection Info ─────────────────────────────────────── -->
      <div class="card" style="margin-top:22px">
        <h3><span class="icon">📍</span> Cork City Detection Logic</h3>
        <p style="font-size:13px;color:#94a3b8;margin:0 0 14px">
          The system automatically detects whether a customer is in Cork City based on their Eircode prefix or city name entered at checkout.
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div style="background:#0f172a;border-radius:10px;padding:14px;border:1px solid rgba(255,255,255,0.06)">
            <div style="font-size:12px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">✅ Cork City Eircode Prefixes</div>
            <div style="font-size:12px;color:#94a3b8;line-height:1.8">
              T12, T23, T34, T45, T56, T67, T8, T9<br>
              <span style="color:#64748b">(All T12–T99 range = Cork area)</span>
            </div>
          </div>
          <div style="background:#0f172a;border-radius:10px;padding:14px;border:1px solid rgba(255,255,255,0.06)">
            <div style="font-size:12px;font-weight:700;color:#fb923c;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">🚐 Outside Cork Detection</div>
            <div style="font-size:12px;color:#94a3b8;line-height:1.8">
              Any Eircode not starting with T<br>
              OR County ≠ Cork<br>
              OR City not containing "Cork"
            </div>
          </div>
        </div>
      </div>

      <div class="save-bar">
        <?php if ($msg): ?>
          <div class="alert alert-success"><?= $msg ?></div>
        <?php else: ?>
          <span style="font-size:13px;color:#64748b">Changes apply immediately to the checkout page</span>
        <?php endif; ?>
        <button type="submit" class="btn-save">💾 Save Delivery Settings</button>
      </div>

    </form>
  </div>
</main>
</div>
</body>
</html>
