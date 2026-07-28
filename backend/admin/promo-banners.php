<?php
/**
 * Promo Banners Admin — Manage homepage promotional campaign cards
 * Settings keys: promo_N_* where N = 1..5
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action'])) {
    while (ob_get_level()) ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    require_once __DIR__ . '/../config/config.php';
    require_once __DIR__ . '/../config/database.php';

    $action = $_GET['action'];

    // ── Upload image ──────────────────────────────────────────────────
    if ($action === 'upload_image') {
        $uploadDir = defined('UPLOAD_DIR') ? UPLOAD_DIR : (__DIR__ . '/../uploads/promos/');
        if (!is_dir($uploadDir)) @mkdir($uploadDir, 0755, true);
        $file = $_FILES['image'] ?? null;
        if (!$file || $file['error']) { echo json_encode(['success'=>false,'message'=>'No file']); exit; }
        $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $name = 'promo_' . time() . '_' . rand(1000,9999) . '.' . $ext;
        $dest = $uploadDir . $name;
        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $rel = '/uploads/promos/' . $name;
            echo json_encode(['success'=>true,'url'=>$rel]); exit;
        }
        echo json_encode(['success'=>false,'message'=>'Upload failed']); exit;
    }

    // ── Save all banners ──────────────────────────────────────────────
    if ($action === 'save') {
        $body = json_decode(file_get_contents('php://input'), true);
        $banners = $body['banners'] ?? [];
        try {
            $db = (new Database())->getConnection();
            // Clear promo_1..5 slots first, then write in new order
            for ($i = 1; $i <= 5; $i++) {
                $keys = ['enabled','image','image_mobile','title','text','label',
                         'button','link','badge','badge_color','overlay_color','overlay_opacity'];
                foreach ($keys as $k) {
                    $db->prepare("DELETE FROM site_settings WHERE setting_key=:k")
                       ->execute([':k'=>"promo_{$i}_{$k}"]);
                }
            }
            foreach ($banners as $idx => $b) {
                $n = $idx + 1;
                if ($n > 5) break;
                $fields = [
                    'enabled'         => $b['enabled']         ?? '1',
                    'image'           => $b['image']           ?? '',
                    'image_mobile'    => $b['image_mobile']    ?? '',
                    'title'           => $b['title']           ?? '',
                    'text'            => $b['text']            ?? '',
                    'label'           => $b['label']           ?? '',
                    'button'          => $b['button']          ?? 'Shop Now',
                    'link'            => $b['link']            ?? '/categories',
                    'badge'           => $b['badge']           ?? '',
                    'badge_color'     => $b['badge_color']     ?? '#10b981',
                    'overlay_color'   => $b['overlay_color']   ?? '#0B1220',
                    'overlay_opacity' => $b['overlay_opacity'] ?? '44',
                ];
                foreach ($fields as $k => $v) {
                    $db->prepare("INSERT INTO site_settings (setting_key,setting_value)
                                  VALUES (:k,:v) ON DUPLICATE KEY UPDATE setting_value=:v2")
                       ->execute([':k'=>"promo_{$n}_{$k}",':v'=>$v,':v2'=>$v]);
                }
            }
            echo json_encode(['success'=>true,'message'=>'Banners saved!']);
        } catch(Exception $e) {
            echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
        }
        exit;
    }

    echo json_encode(['success'=>false,'message'=>'Unknown action']); exit;
}

$pageTitle = 'Promo Banners';
include 'includes/header.php';
?>

<style>
.pb-wrap { max-width: 1080px; }
.pb-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  transition: box-shadow .2s;
  cursor: grab;
}
.pb-card:active { cursor: grabbing; }
.pb-card.drag-over { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(99,102,241,.25); }
.pb-card.dragging { opacity: .4; }
.pb-head {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  background: var(--bg-2);
  border-bottom: 1px solid var(--border);
  user-select: none;
}
.pb-drag-handle {
  color: var(--text-muted); cursor: grab; flex-shrink: 0;
  display: flex; align-items: center;
}
.pb-num {
  width: 28px; height: 28px; border-radius: 8px;
  background: var(--primary); color: #fff;
  display: grid; place-items: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
}
.pb-head-title { font-weight: 600; font-size: 14px; flex: 1; }
.pb-toggle-wrap { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.pb-toggle {
  width: 40px; height: 22px; border-radius: 999px; border: none; cursor: pointer;
  background: var(--border); position: relative; transition: background .2s; flex-shrink: 0;
}
.pb-toggle::after {
  content: ''; position: absolute;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; top: 3px; left: 3px;
  transition: left .2s;
}
.pb-toggle.on { background: #10b981; }
.pb-toggle.on::after { left: 21px; }
.pb-body { padding: 20px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pb-body.collapsed { display: none; }
.pb-img-row { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.img-upload-box {
  border: 2px dashed var(--border); border-radius: 10px;
  padding: 12px; cursor: pointer; position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  transition: border-color .2s;
}
.img-upload-box:hover { border-color: var(--primary); }
.img-upload-box img { width: 100%; height: 100px; object-fit: cover; border-radius: 7px; display: none; }
.img-upload-box img.visible { display: block; }
.img-upload-box .img-placeholder { font-size: 12px; color: var(--text-muted); text-align: center; }
.img-upload-box input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.img-upload-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-align: center; }
.color-row { display: flex; gap: 10px; align-items: flex-end; }
.color-row input[type=color] { width: 46px; height: 36px; padding: 2px; border-radius: 6px; border: 1px solid var(--border); cursor: pointer; }
.pb-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 4px; grid-column: 1 / -1; }
.icon-chevron { transition: transform .2s; }
.icon-chevron.open { transform: rotate(180deg); }
.badge-preview {
  display: inline-block; padding: 3px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 700; color: #fff; margin-top: 4px;
}
</style>

<div class="pb-wrap">
<div class="toolbar">
  <div>
    <h3 style="font-size:16px;margin:0;">Promo Banners</h3>
    <p style="font-size:12px;color:var(--text-muted,#888);margin:4px 0 0;">
      Drag to reorder. First enabled banner becomes the large hero (left). Next two stack on the right.
    </p>
  </div>
  <button class="btn btn-primary" onclick="saveBanners()">💾 Save Banners</button>
</div>

<div id="pbList">
  <!-- Cards injected here -->
</div>
</div>

<script>
const token = localStorage.getItem('admin_token') || '';
let banners = [];
let dragSrc = null;

async function api(path, method='GET', body=null) {
  const opts = { method, headers: { 'Authorization': 'Bearer ' + token } };
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const r = await fetch('/api' + path, opts);
  return r.json();
}

// ── Load from settings ────────────────────────────────────────────────
async function loadBanners() {
  try {
    const res = await api('/settings');
    const s = res.data || {};
    banners = [];
    for (let i = 1; i <= 5; i++) {
      banners.push({
        enabled:         s[`promo_${i}_enabled`]         ?? '1',
        image:           s[`promo_${i}_image`]           ?? '',
        image_mobile:    s[`promo_${i}_image_mobile`]    ?? '',
        title:           s[`promo_${i}_title`]           ?? '',
        text:            s[`promo_${i}_text`]            ?? '',
        label:           s[`promo_${i}_label`]           ?? '',
        button:          s[`promo_${i}_button`]          ?? 'Shop Now',
        link:            s[`promo_${i}_link`]            ?? '/categories',
        badge:           s[`promo_${i}_badge`]           ?? '',
        badge_color:     s[`promo_${i}_badge_color`]     ?? '#10b981',
        overlay_color:   s[`promo_${i}_overlay_color`]   ?? '#0B1220',
        overlay_opacity: s[`promo_${i}_overlay_opacity`] ?? '44',
      });
    }
    renderList();
  } catch(e) { showAlert('Could not load banners', 'danger'); }
}

function renderList() {
  const list = document.getElementById('pbList');
  list.innerHTML = '';
  banners.forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'pb-card';
    card.dataset.idx = i;
    card.draggable = true;
    const isOn = b.enabled !== '0' && b.enabled !== 'false';
    const label = i === 0 ? '🌟 Hero (Left)' : `Mini Card ${i}`;
    card.innerHTML = `
      <div class="pb-head" onclick="toggleCollapse(${i}, event)">
        <span class="pb-drag-handle" title="Drag to reorder">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>
        </span>
        <span class="pb-num">${i + 1}</span>
        <span class="pb-head-title">${label}${b.title ? ': ' + b.title : ''}</span>
        <span class="pb-toggle-wrap">
          <button class="pb-toggle ${isOn ? 'on' : ''}" id="toggle-${i}" onclick="toggleEnable(${i},event)" title="Enable/Disable"></button>
          <span style="font-size:12px;">${isOn ? 'Enabled' : 'Disabled'}</span>
        </span>
        <svg class="icon-chevron ${b._open ? 'open' : ''}" id="chev-${i}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="pb-body ${b._open ? '' : 'collapsed'}" id="body-${i}">
        <!-- Images -->
        <div class="pb-img-row">
          <div>
            <label class="img-upload-label">🖥️ Desktop Image</label>
            <div class="img-upload-box" onclick="triggerUpload(${i},'desktop')">
              <img id="img-${i}-desktop" src="${b.image || ''}" class="${b.image ? 'visible' : ''}" alt="">
              <div class="img-placeholder" id="ph-${i}-desktop" style="${b.image ? 'display:none' : ''}">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <div>Click to upload desktop image</div>
              </div>
              <input type="file" id="file-${i}-desktop" accept="image/*" onchange="uploadImage(${i},'desktop',this)">
            </div>
            ${b.image ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px;word-break:break-all;">${b.image}</div>` : ''}
          </div>
          <div>
            <label class="img-upload-label">📱 Mobile Image (optional)</label>
            <div class="img-upload-box" onclick="triggerUpload(${i},'mobile')">
              <img id="img-${i}-mobile" src="${b.image_mobile || ''}" class="${b.image_mobile ? 'visible' : ''}" alt="">
              <div class="img-placeholder" id="ph-${i}-mobile" style="${b.image_mobile ? 'display:none' : ''}">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                <div>Click to upload mobile image</div>
              </div>
              <input type="file" id="file-${i}-mobile" accept="image/*" onchange="uploadImage(${i},'mobile',this)">
            </div>
          </div>
        </div>

        <!-- Title & Subtitle -->
        <div class="form-group">
          <label>Title</label>
          <input type="text" class="form-control" id="title-${i}" value="${esc(b.title)}" placeholder="e.g. Baked before sunrise">
        </div>
        <div class="form-group">
          <label>Subtitle / Description</label>
          <input type="text" class="form-control" id="text-${i}" value="${esc(b.text)}" placeholder="Short description under the title">
        </div>

        <!-- Category label & Button -->
        <div class="form-group">
          <label>Category Label</label>
          <input type="text" class="form-control" id="label-${i}" value="${esc(b.label)}" placeholder="e.g. CATEGORY 2">
        </div>
        <div class="form-group">
          <label>Button Text</label>
          <input type="text" class="form-control" id="button-${i}" value="${esc(b.button)}" placeholder="Shop Now">
        </div>

        <!-- Link -->
        <div class="form-group" style="grid-column:1/-1">
          <label>Button URL / Link</label>
          <input type="text" class="form-control" id="link-${i}" value="${esc(b.link)}" placeholder="/categories or https://...">
        </div>

        <!-- Badge -->
        <div class="form-group">
          <label>Offer Badge Text</label>
          <input type="text" class="form-control" id="badge-${i}" value="${esc(b.badge)}" placeholder="e.g. New arrivals" oninput="previewBadge(${i})">
          <span class="badge-preview" id="badge-preview-${i}" style="background:${b.badge_color || '#10b981'};display:${b.badge ? 'inline-block' : 'none'}">${esc(b.badge)}</span>
        </div>
        <div class="form-group">
          <label>Badge Colour</label>
          <div class="color-row">
            <input type="color" id="badge_color-${i}" value="${b.badge_color || '#10b981'}" oninput="updateBadgeColor(${i})">
            <input type="text" class="form-control" id="badge_color_txt-${i}" value="${b.badge_color || '#10b981'}" style="flex:1" oninput="syncColor(${i},'badge_color')">
          </div>
        </div>

        <!-- Overlay -->
        <div class="form-group">
          <label>Overlay Colour</label>
          <div class="color-row">
            <input type="color" id="overlay_color-${i}" value="${b.overlay_color || '#0B1220'}" oninput="syncColor(${i},'overlay_color')">
            <input type="text" class="form-control" id="overlay_color_txt-${i}" value="${b.overlay_color || '#0B1220'}" style="flex:1" oninput="syncColor(${i},'overlay_color')">
          </div>
        </div>
        <div class="form-group">
          <label>Overlay Opacity (0–100)</label>
          <input type="range" id="overlay_opacity-${i}" min="0" max="100" value="${b.overlay_opacity || 44}" style="width:100%"
                 oninput="document.getElementById('ov_op_num-${i}').textContent=this.value">
          <span id="ov_op_num-${i}" style="font-size:12px;color:var(--text-muted)">${b.overlay_opacity || 44}%</span>
        </div>
      </div>
    `;
    // Drag & Drop
    card.addEventListener('dragstart', onDragStart);
    card.addEventListener('dragover',  onDragOver);
    card.addEventListener('dragleave', onDragLeave);
    card.addEventListener('drop',      onDrop);
    card.addEventListener('dragend',   onDragEnd);
    list.appendChild(card);
  });
}

function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

function toggleCollapse(i, e) {
  if (e.target.closest('.pb-toggle, input, select')) return;
  banners[i]._open = !banners[i]._open;
  document.getElementById(`body-${i}`).classList.toggle('collapsed', !banners[i]._open);
  document.getElementById(`chev-${i}`).classList.toggle('open', !!banners[i]._open);
}

function toggleEnable(i, e) {
  e.stopPropagation();
  const isOn = banners[i].enabled !== '0' && banners[i].enabled !== 'false';
  banners[i].enabled = isOn ? '0' : '1';
  const btn = document.getElementById(`toggle-${i}`);
  btn.classList.toggle('on', !isOn);
  btn.nextElementSibling.textContent = !isOn ? 'Enabled' : 'Disabled';
}

function triggerUpload(i, type) {
  document.getElementById(`file-${i}-${type}`).click();
}

async function uploadImage(i, type, input) {
  const file = input.files[0]; if (!file) return;
  const fd = new FormData(); fd.append('image', file);
  try {
    const r = await fetch('promo-banners.php?action=upload_image', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: fd
    });
    const d = await r.json();
    if (d.success) {
      const key = type === 'desktop' ? 'image' : 'image_mobile';
      banners[i][key] = d.url;
      const imgEl = document.getElementById(`img-${i}-${type}`);
      imgEl.src = d.url;
      imgEl.classList.add('visible');
      document.getElementById(`ph-${i}-${type}`).style.display = 'none';
    } else {
      showAlert('Upload failed: ' + d.message, 'danger');
    }
  } catch(e) { showAlert('Upload error', 'danger'); }
}

function previewBadge(i) {
  const val = document.getElementById(`badge-${i}`).value;
  const el = document.getElementById(`badge-preview-${i}`);
  el.textContent = val;
  el.style.display = val ? 'inline-block' : 'none';
}

function updateBadgeColor(i) {
  const c = document.getElementById(`badge_color-${i}`).value;
  document.getElementById(`badge_color_txt-${i}`).value = c;
  document.getElementById(`badge-preview-${i}`).style.background = c;
}

function syncColor(i, key) {
  const colorEl = document.getElementById(`${key}-${i}`);
  const txtEl = document.getElementById(`${key}_txt-${i}`);
  if (document.activeElement === colorEl) txtEl.value = colorEl.value;
  else colorEl.value = txtEl.value;
}

// ── Drag & Drop reorder ───────────────────────────────────────────────
function onDragStart(e) { dragSrc = this; this.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; }
function onDragOver(e)  { e.preventDefault(); e.dataTransfer.dropEffect='move'; this.classList.add('drag-over'); return false; }
function onDragLeave()  { this.classList.remove('drag-over'); }
function onDrop(e)      {
  e.stopPropagation();
  if (dragSrc !== this) {
    const si = +dragSrc.dataset.idx, di = +this.dataset.idx;
    const tmp = banners.splice(si, 1)[0];
    banners.splice(di, 0, tmp);
    renderList();
  }
  return false;
}
function onDragEnd() { document.querySelectorAll('.pb-card').forEach(c => c.classList.remove('dragging','drag-over')); }

// ── Collect & Save ────────────────────────────────────────────────────
async function saveBanners() {
  // Collect current field values from DOM
  const payload = banners.map((b, i) => ({
    enabled:         b.enabled,
    image:           b.image           || '',
    image_mobile:    b.image_mobile    || '',
    title:           document.getElementById(`title-${i}`)?.value           || b.title || '',
    text:            document.getElementById(`text-${i}`)?.value            || b.text  || '',
    label:           document.getElementById(`label-${i}`)?.value           || b.label || '',
    button:          document.getElementById(`button-${i}`)?.value          || b.button || 'Shop Now',
    link:            document.getElementById(`link-${i}`)?.value            || b.link  || '/categories',
    badge:           document.getElementById(`badge-${i}`)?.value           || b.badge || '',
    badge_color:     document.getElementById(`badge_color_txt-${i}`)?.value || b.badge_color || '#10b981',
    overlay_color:   document.getElementById(`overlay_color_txt-${i}`)?.value || b.overlay_color || '#0B1220',
    overlay_opacity: document.getElementById(`overlay_opacity-${i}`)?.value  || b.overlay_opacity || '44',
  }));

  try {
    const r = await fetch('promo-banners.php?action=save', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer '+token, 'Content-Type':'application/json' },
      body: JSON.stringify({ banners: payload })
    });
    const d = await r.json();
    showAlert(d.success ? '✅ ' + d.message : '❌ ' + d.message, d.success ? 'success' : 'danger');
  } catch(e) { showAlert('Save failed: ' + e.message, 'danger'); }
}

loadBanners();
</script>

<?php include 'includes/footer.php'; ?>
