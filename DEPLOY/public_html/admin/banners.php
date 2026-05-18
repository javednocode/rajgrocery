<?php $pageTitle = 'Banner Slider'; include 'includes/header.php'; ?>

<style>
.banner-grid { display: grid; gap: 16px; }
.banner-row {
  display: grid; grid-template-columns: 80px 140px 1fr auto auto auto auto;
  align-items: center; gap: 14px;
  background: var(--admin-card); border: 1px solid var(--admin-border);
  border-radius: 10px; padding: 12px 16px; cursor: grab;
  transition: box-shadow 0.2s, opacity 0.2s;
}
.banner-row.dragging { opacity: 0.4; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.banner-row.drag-over { border-color: var(--admin-primary); box-shadow: 0 0 0 2px var(--admin-primary); }
.drag-handle { color: var(--admin-text-muted); font-size: 18px; cursor: grab; user-select: none; }
.banner-thumb { width: 120px; height: 60px; object-fit: cover; border-radius: 6px; background: #f0f0f0; }
.banner-info strong { display: block; font-size: 14px; color: var(--admin-text); }
.banner-info span { font-size: 12px; color: var(--admin-text-muted); }
.img-preview-wrap { position: relative; display: inline-block; }
.img-preview { width: 100%; max-height: 160px; object-fit: cover; border-radius: 6px; border: 1px solid var(--admin-border); margin-top:6px; display:none; }
.upload-box {
  border: 2px dashed var(--admin-border); border-radius: 8px; padding: 20px;
  text-align: center; cursor: pointer; transition: border-color 0.2s;
  color: var(--admin-text-muted); font-size: 13px;
}
.upload-box:hover { border-color: var(--admin-primary); color: var(--admin-primary); }
.upload-box input[type=file] { display: none; }
.color-row { display: flex; align-items: center; gap: 10px; }
.color-swatch { width: 32px; height: 32px; border-radius: 6px; border: 2px solid var(--admin-border); cursor: pointer; }
</style>

<div class="toolbar">
  <div>
    <h3 style="font-size:16px;margin:0;">Homepage Banner Slider</h3>
    <p style="font-size:12px;color:var(--admin-text-muted);margin:4px 0 0;">Drag rows to reorder. Desktop + mobile images supported.</p>
  </div>
  <button class="btn btn-primary" onclick="showModal()">+ Add Banner</button>
</div>

<div class="card"><div class="card-body" style="padding:0;">
  <div style="padding:14px 16px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;gap:12px;">
    <span style="font-size:13px;color:var(--admin-text-muted);">
      <strong id="totalCount">0</strong> banners &nbsp;|&nbsp; Drag to reorder, click toggle to enable/disable
    </span>
  </div>
  <div style="padding:16px;" id="bannerGrid">
    <div style="text-align:center;padding:48px;color:var(--admin-text-muted);">Loading...</div>
  </div>
</div></div>

<!-- Modal -->
<div class="modal-overlay" id="bannerModal">
  <div class="modal" style="max-width:680px;width:95%;">
    <div class="modal-header">
      <h3 id="modalTitle">Add Banner</h3>
      <button class="btn btn-icon" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body" style="max-height:75vh;overflow-y:auto;">
      <input type="hidden" id="bannerId">

      <div class="form-row">
        <div class="form-group">
          <label>Banner Title</label>
          <input type="text" id="bTitle" class="form-control" placeholder="e.g. Fresh Asian Groceries">
        </div>
        <div class="form-group">
          <label>Subtitle</label>
          <input type="text" id="bSubtitle" class="form-control" placeholder="e.g. Free delivery over €50">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Desktop Banner Image *</label>
          <div class="upload-box" onclick="document.getElementById('bDesktopFile').click()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <div style="margin-top:6px;">Click to upload <strong>Desktop</strong> image<br><small>Recommended: 1920×600px</small></div>
            <input type="file" id="bDesktopFile" accept="image/*" onchange="previewImg(this,'bDesktopPreview')">
          </div>
          <img id="bDesktopPreview" class="img-preview" alt="desktop preview">
          <input type="hidden" id="bDesktopExisting">
        </div>
        <div class="form-group">
          <label>Mobile Banner Image <small style="color:var(--admin-text-muted)">(optional)</small></label>
          <div class="upload-box" onclick="document.getElementById('bMobileFile').click()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>
            <div style="margin-top:6px;">Click to upload <strong>Mobile</strong> image<br><small>Recommended: 640×380px</small></div>
            <input type="file" id="bMobileFile" accept="image/*" onchange="previewImg(this,'bMobilePreview')">
          </div>
          <img id="bMobilePreview" class="img-preview" alt="mobile preview">
          <input type="hidden" id="bMobileExisting">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Button Text</label>
          <input type="text" id="bBtnText" class="form-control" placeholder="Shop Now">
        </div>
        <div class="form-group">
          <label>Button Link URL</label>
          <input type="text" id="bLink" class="form-control" placeholder="/categories">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Button Color</label>
          <div class="color-row">
            <input type="color" id="bBtnColor" value="#e06400" style="width:40px;height:36px;border:1px solid var(--admin-border);border-radius:6px;cursor:pointer;padding:2px;">
            <input type="text" id="bBtnColorHex" class="form-control" value="#e06400" style="width:120px;" oninput="syncColor(this)">
          </div>
        </div>
        <div class="form-group">
          <label>Priority / Sort Order</label>
          <input type="number" id="bSort" class="form-control" value="0" min="0">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Start Date <small>(optional)</small></label>
          <input type="datetime-local" id="bStartsAt" class="form-control">
        </div>
        <div class="form-group">
          <label>End Date <small>(optional)</small></label>
          <input type="datetime-local" id="bEndsAt" class="form-control">
        </div>
      </div>

      <div class="form-group">
        <label class="form-check" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
          <input type="checkbox" id="bActive" checked style="width:16px;height:16px;">
          <span>Active (visible on homepage)</span>
        </label>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveBanner()">
        <span id="saveBtnText">Save Banner</span>
      </button>
    </div>
  </div>
</div>

<script>
const MEDIA = '../uploads/';

function previewImg(inp, previewId) {
  const f = inp.files[0];
  if (!f) return;
  const prev = document.getElementById(previewId);
  prev.src = URL.createObjectURL(f);
  prev.style.display = 'block';
}

function syncColor(inp) {
  const v = inp.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) document.getElementById('bBtnColor').value = v;
}
document.getElementById('bBtnColor').addEventListener('input', function() {
  document.getElementById('bBtnColorHex').value = this.value;
});

function closeModal() { document.getElementById('bannerModal').classList.remove('show'); }

function showModal(b = null) {
  document.getElementById('bannerId').value = b ? b.id : '';
  document.getElementById('modalTitle').textContent = b ? 'Edit Banner' : 'Add Banner';
  document.getElementById('bTitle').value = b?.title || '';
  document.getElementById('bSubtitle').value = b?.subtitle || '';
  document.getElementById('bBtnText').value = b?.button_text || 'Shop Now';
  document.getElementById('bLink').value = b?.link || '';
  const col = b?.button_color || '#e06400';
  document.getElementById('bBtnColor').value = col;
  document.getElementById('bBtnColorHex').value = col;
  document.getElementById('bSort').value = b?.sort_order ?? 0;
  document.getElementById('bStartsAt').value = b?.starts_at ? b.starts_at.slice(0,16) : '';
  document.getElementById('bEndsAt').value = b?.ends_at ? b.ends_at.slice(0,16) : '';
  document.getElementById('bActive').checked = !b || b.is_active == 1;
  document.getElementById('bDesktopFile').value = '';
  document.getElementById('bMobileFile').value = '';
  document.getElementById('bDesktopExisting').value = b?.image || '';
  document.getElementById('bMobileExisting').value = b?.mobile_image || '';

  const dp = document.getElementById('bDesktopPreview');
  const mp = document.getElementById('bMobilePreview');
  if (b?.image) { dp.src = '../' + b.image; dp.style.display = 'block'; }
  else { dp.src = ''; dp.style.display = 'none'; }
  if (b?.mobile_image) { mp.src = '../' + b.mobile_image; mp.style.display = 'block'; }
  else { mp.src = ''; mp.style.display = 'none'; }

  document.getElementById('bannerModal').classList.add('show');
}

async function saveBanner() {
  const id = document.getElementById('bannerId').value;
  const fd = new FormData();
  fd.set('title',        document.getElementById('bTitle').value);
  fd.set('subtitle',     document.getElementById('bSubtitle').value);
  fd.set('button_text',  document.getElementById('bBtnText').value || 'Shop Now');
  fd.set('link',         document.getElementById('bLink').value);
  fd.set('button_color', document.getElementById('bBtnColorHex').value);
  fd.set('sort_order',   document.getElementById('bSort').value);
  fd.set('starts_at',    document.getElementById('bStartsAt').value);
  fd.set('ends_at',      document.getElementById('bEndsAt').value);
  fd.set('is_active',    document.getElementById('bActive').checked ? '1' : '0');
  fd.set('position',     'hero');

  // Always keep existing image path when editing
  if (id) {
    fd.set('_method',    'PUT');
    fd.set('banner_id',  id);
    const existingImg = document.getElementById('bDesktopExisting').value;
    if (existingImg) fd.set('existing_image', existingImg);
    const existingMob = document.getElementById('bMobileExisting').value;
    if (existingMob) fd.set('existing_mobile_image', existingMob);
  }

  // New file uploads
  const df = document.getElementById('bDesktopFile').files[0];
  if (df) fd.set('image', df);
  const mf = document.getElementById('bMobileFile').files[0];
  if (mf) fd.set('mobile_image', mf);

  if (!id && !df) {
    showAlert('Desktop image is required!', 'danger'); return;
  }

  document.getElementById('saveBtnText').textContent = 'Saving...';
  try {
    // Always POST — backend checks _method=PUT field to distinguish create vs update
    await api('/banners', 'POST', fd, true);
    showAlert(id ? 'Banner updated!' : 'Banner created!');
    closeModal();
    loadBanners();
  } catch(e) { showAlert('Error saving banner: ' + e.message, 'danger'); }
  document.getElementById('saveBtnText').textContent = 'Save Banner';
}


async function deleteBanner(id) {
  if (!confirm('Delete this banner?')) return;
  try { await api('/banners/' + id, 'DELETE'); showAlert('Deleted!'); loadBanners(); } catch(e) {}
}

async function toggleBanner(id, btn) {
  try {
    await api('/banners/' + id + '/toggle', 'POST');
    loadBanners();
  } catch(e) {}
}

// ── Drag-to-reorder ──
let dragSrc = null;
function initDrag() {
  document.querySelectorAll('.banner-row').forEach(row => {
    row.draggable = true;
    row.ondragstart = e => { dragSrc = row; row.classList.add('dragging'); };
    row.ondragend   = e => { row.classList.remove('dragging'); saveOrder(); };
    row.ondragover  = e => { e.preventDefault(); row.classList.add('drag-over'); };
    row.ondragleave = e => row.classList.remove('drag-over');
    row.ondrop      = e => {
      e.preventDefault(); row.classList.remove('drag-over');
      if (dragSrc && dragSrc !== row) row.parentNode.insertBefore(dragSrc, row);
    };
  });
}

async function saveOrder() {
  const ids = [...document.querySelectorAll('.banner-row')].map(r => r.dataset.id);
  try { await api('/banners/reorder', 'POST', JSON.stringify({ order: ids }), false); } catch(e) {}
}

async function loadBanners() {
  try {
    const res = await api('/banners?all=1');
    const banners = res.data || [];
    document.getElementById('totalCount').textContent = banners.length;
    if (!banners.length) {
      document.getElementById('bannerGrid').innerHTML = `
        <div style="text-align:center;padding:60px;color:var(--admin-text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom:12px;opacity:0.4;"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 10h20" stroke="currentColor" stroke-width="1.5"/></svg>
          <div>No banners yet. Click <strong>+ Add Banner</strong> to create your first hero banner.</div>
        </div>`;
      return;
    }

    document.getElementById('bannerGrid').innerHTML = banners.map(b => `
      <div class="banner-row" data-id="${b.id}">
        <span class="drag-handle" title="Drag to reorder">⠿</span>
        <img class="banner-thumb" src="${b.image ? '../' + b.image : ''}" onerror="this.style.background='#eee'" alt="">
        <div class="banner-info">
          <strong>${b.title || '(No title)'}</strong>
          <span>${b.subtitle || ''}</span>
          <div style="margin-top:4px;font-size:11px;color:var(--admin-text-dim);">
            ${b.mobile_image ? '📱 Mobile image set &nbsp;' : ''}
            ${b.link ? '🔗 ' + b.link : ''}
          </div>
        </div>
        <div style="font-size:11px;color:var(--admin-text-muted);text-align:center;">
          <div>Sort</div><strong>${b.sort_order}</strong>
        </div>
        <span class="badge ${b.is_active==1?'badge-success':'badge-danger'}" style="cursor:pointer;" onclick="toggleBanner(${b.id},this)">
          ${b.is_active==1?'Active':'Inactive'}
        </span>
        <button class="btn btn-outline btn-sm" onclick="editBanner(${b.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteBanner(${b.id})">Delete</button>
      </div>
    `).join('');
    initDrag();
  } catch(e) { console.error(e); }
}

async function editBanner(id) {
  try {
    const res = await api('/banners/' + id);
    showModal(res.data || res);
  } catch(e) { showAlert('Failed to load banner', 'error'); }
}

loadBanners();
</script>

<?php include 'includes/footer.php'; ?>
