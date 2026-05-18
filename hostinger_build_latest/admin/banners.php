<?php $pageTitle = 'Hero Media Slider'; include 'includes/header.php'; ?>

<style>
.banner-grid { display: grid; gap: 12px; }
.banner-row {
  display: grid; grid-template-columns: 28px 90px 1fr auto auto auto auto;
  align-items: center; gap: 14px;
  background: var(--admin-card); border: 1.5px solid var(--admin-border);
  border-radius: 10px; padding: 10px 14px; cursor: grab;
  transition: box-shadow 0.2s, opacity 0.2s;
}
.banner-row.dragging { opacity: 0.4; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.banner-row.drag-over { border-color: var(--admin-primary); box-shadow: 0 0 0 2px var(--admin-primary); }
.drag-handle { color: var(--admin-text-muted); font-size: 18px; cursor: grab; user-select: none; text-align:center; }
.banner-thumb { width: 90px; height: 52px; object-fit: cover; border-radius: 6px; background: #f0f0f0; display:block; }
.banner-thumb-video {
  width: 90px; height: 52px; border-radius: 6px; background: #0a0a14;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-size: 22px;
}
.banner-info strong { display: block; font-size: 14px; color: var(--admin-text); }
.banner-info span { font-size: 12px; color: var(--admin-text-muted); }
.media-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  padding: 2px 7px; border-radius: 99px; margin-right: 6px;
}
.badge-video { background: #1e1a2e; color: #a78bfa; border: 1px solid #4c1d95; }
.badge-image { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

/* Upload boxes */
.upload-box {
  border: 2px dashed var(--admin-border); border-radius: 8px; padding: 16px;
  text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s;
  color: var(--admin-text-muted); font-size: 12px;
}
.upload-box:hover { border-color: var(--admin-primary); background: rgba(75,46,131,0.04); color: var(--admin-primary); }
.upload-box input[type=file] { display: none; }
.media-preview { width: 100%; max-height: 120px; object-fit: cover; border-radius: 6px; border: 1px solid var(--admin-border); margin-top: 6px; display: none; }
.video-preview { width: 100%; border-radius: 6px; border: 1px solid var(--admin-border); margin-top: 6px; display: none; max-height: 140px; }

/* Media type toggle */
.media-type-toggle {
  display: flex; background: var(--admin-bg); border: 1.5px solid var(--admin-border);
  border-radius: 8px; padding: 3px; gap: 3px; margin-bottom: 16px;
}
.mtype-btn {
  flex: 1; padding: 8px 12px; border: none; border-radius: 6px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  background: transparent; color: var(--admin-text-muted);
  transition: background 0.18s, color 0.18s;
}
.mtype-btn.active { background: var(--admin-primary); color: white; }

.color-row { display: flex; align-items: center; gap: 10px; }
.section-divider {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--admin-text-muted); padding: 8px 0 4px;
  border-bottom: 1px solid var(--admin-border); margin-bottom: 12px;
}
</style>

<div class="toolbar">
  <div>
    <h3 style="font-size:16px;margin:0;">Hero Media Slider</h3>
    <p style="font-size:12px;color:var(--admin-text-muted);margin:4px 0 0;">Supports image & video banners. Drag rows to reorder.</p>
  </div>
  <button class="btn btn-primary" onclick="showModal()">+ Add Slide</button>
</div>

<div class="card"><div class="card-body" style="padding:0;">
  <div style="padding:12px 16px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;gap:12px;">
    <span style="font-size:13px;color:var(--admin-text-muted);">
      <strong id="totalCount">0</strong> slides &nbsp;|&nbsp; Drag to reorder · Click badge to toggle active
    </span>
  </div>
  <div style="padding:16px;" id="bannerGrid">
    <div style="text-align:center;padding:48px;color:var(--admin-text-muted);">Loading...</div>
  </div>
</div></div>

<!-- Modal -->
<div class="modal-overlay" id="bannerModal">
  <div class="modal" style="max-width:720px;width:95%;">
    <div class="modal-header">
      <h3 id="modalTitle">Add Slide</h3>
      <button class="btn btn-icon" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body" style="max-height:78vh;overflow-y:auto;">
      <input type="hidden" id="bannerId">

      <!-- Media Type Toggle -->
      <div class="section-divider">Slide Type</div>
      <div class="media-type-toggle">
        <button class="mtype-btn active" id="btnTypeImage" onclick="setMediaType('image')">🖼 Image Banner</button>
        <button class="mtype-btn" id="btnTypeVideo" onclick="setMediaType('video')">🎬 Video Banner</button>
      </div>
      <input type="hidden" id="bMediaType" value="image">

      <!-- IMAGE FIELDS -->
      <div id="imageFields">
        <div class="section-divider">Images</div>
        <div class="form-row">
          <div class="form-group">
            <label>Desktop Image *</label>
            <div class="upload-box" onclick="document.getElementById('bDesktopFile').click()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <div style="margin-top:5px;">Desktop image<br><small>1920×600px recommended</small></div>
              <input type="file" id="bDesktopFile" accept="image/*" onchange="previewMedia(this,'bDesktopPreview','img')">
            </div>
            <img id="bDesktopPreview" class="media-preview" alt="">
            <input type="hidden" id="bDesktopExisting">
          </div>
          <div class="form-group">
            <label>Mobile Image <small style="color:var(--admin-text-muted)">(optional)</small></label>
            <div class="upload-box" onclick="document.getElementById('bMobileFile').click()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>
              <div style="margin-top:5px;">Mobile image<br><small>640×380px recommended</small></div>
              <input type="file" id="bMobileFile" accept="image/*" onchange="previewMedia(this,'bMobilePreview','img')">
            </div>
            <img id="bMobilePreview" class="media-preview" alt="">
            <input type="hidden" id="bMobileExisting">
          </div>
        </div>
      </div>

      <!-- VIDEO FIELDS -->
      <div id="videoFields" style="display:none;">
        <div class="section-divider">Videos</div>
        <div class="form-row">
          <div class="form-group">
            <label>Desktop Video * <small style="color:var(--admin-text-muted)">.mp4 / .webm · max 50MB</small></label>
            <div class="upload-box" onclick="document.getElementById('bVideoFile').click()">
              <div style="font-size:24px;">🎬</div>
              <div style="margin-top:5px;">Upload desktop video<br><small>Recommended: 1920×600 MP4</small></div>
              <input type="file" id="bVideoFile" accept="video/mp4,video/webm,video/quicktime" onchange="previewMedia(this,'bVideoPreview','video')">
            </div>
            <video id="bVideoPreview" class="video-preview" muted playsinline controls></video>
            <input type="hidden" id="bVideoExisting">
          </div>
          <div class="form-group">
            <label>Mobile Video <small style="color:var(--admin-text-muted)">(optional)</small></label>
            <div class="upload-box" onclick="document.getElementById('bMobileVideoFile').click()">
              <div style="font-size:24px;">📱</div>
              <div style="margin-top:5px;">Upload mobile video<br><small>Recommended: 640×380 MP4</small></div>
              <input type="file" id="bMobileVideoFile" accept="video/mp4,video/webm,video/quicktime" onchange="previewMedia(this,'bMobileVideoPreview','video')">
            </div>
            <video id="bMobileVideoPreview" class="video-preview" muted playsinline controls></video>
            <input type="hidden" id="bMobileVideoExisting">
          </div>
        </div>
        <div class="form-group">
          <label>Fallback Image <small style="color:var(--admin-text-muted)">(shown if video fails to load)</small></label>
          <div class="upload-box" onclick="document.getElementById('bFallbackFile').click()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <div style="margin-top:5px;">Upload fallback image</div>
            <input type="file" id="bFallbackFile" accept="image/*" onchange="previewMedia(this,'bFallbackPreview','img')">
          </div>
          <img id="bFallbackPreview" class="media-preview" alt="">
          <input type="hidden" id="bFallbackExisting">
        </div>
      </div>

      <!-- TEXT CONTENT -->
      <div class="section-divider">Content (Optional)</div>
      <div class="form-row">
        <div class="form-group">
          <label>Slide Title</label>
          <input type="text" id="bTitle" class="form-control" placeholder="e.g. Fresh Asian Groceries">
        </div>
        <div class="form-group">
          <label>Subtitle</label>
          <input type="text" id="bSubtitle" class="form-control" placeholder="e.g. Free delivery over €50">
        </div>
      </div>

      <div class="section-divider">Call-to-Action</div>
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

      <div class="section-divider">Scheduling</div>
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
        <span id="saveBtnText">Save Slide</span>
      </button>
    </div>
  </div>
</div>

<script>
const MEDIA = '../uploads/';

// ── Media type toggle ──────────────────────────────────────────────
function setMediaType(type) {
  document.getElementById('bMediaType').value = type;
  document.getElementById('imageFields').style.display = type === 'image' ? '' : 'none';
  document.getElementById('videoFields').style.display = type === 'video' ? '' : 'none';
  document.getElementById('btnTypeImage').classList.toggle('active', type === 'image');
  document.getElementById('btnTypeVideo').classList.toggle('active', type === 'video');
}

// ── Media preview (image or video) ────────────────────────────────
function previewMedia(inp, previewId, kind) {
  const f = inp.files[0];
  if (!f) return;
  const el = document.getElementById(previewId);
  const url = URL.createObjectURL(f);
  if (kind === 'video') {
    el.src = url;
    el.style.display = 'block';
    el.load();
  } else {
    el.src = url;
    el.style.display = 'block';
  }
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
  document.getElementById('bannerId').value     = b ? b.id : '';
  document.getElementById('modalTitle').textContent = b ? 'Edit Slide' : 'Add Slide';
  document.getElementById('bTitle').value       = b?.title    || '';
  document.getElementById('bSubtitle').value    = b?.subtitle || '';
  document.getElementById('bBtnText').value     = b?.button_text  || 'Shop Now';
  document.getElementById('bLink').value        = b?.link         || '';
  const col = b?.button_color || '#e06400';
  document.getElementById('bBtnColor').value    = col;
  document.getElementById('bBtnColorHex').value = col;
  document.getElementById('bSort').value        = b?.sort_order  ?? 0;
  document.getElementById('bStartsAt').value    = b?.starts_at ? b.starts_at.slice(0,16) : '';
  document.getElementById('bEndsAt').value      = b?.ends_at   ? b.ends_at.slice(0,16)   : '';
  document.getElementById('bActive').checked    = !b || b.is_active == 1;

  // Reset file inputs
  ['bDesktopFile','bMobileFile','bVideoFile','bMobileVideoFile','bFallbackFile'].forEach(id => {
    document.getElementById(id).value = '';
  });
  // Reset previews
  ['bDesktopPreview','bMobilePreview','bFallbackPreview'].forEach(id => {
    const el = document.getElementById(id); el.src = ''; el.style.display = 'none';
  });
  ['bVideoPreview','bMobileVideoPreview'].forEach(id => {
    const el = document.getElementById(id); el.src = ''; el.style.display = 'none';
  });

  // Populate existing paths
  document.getElementById('bDesktopExisting').value     = b?.image          || '';
  document.getElementById('bMobileExisting').value      = b?.mobile_image   || '';
  document.getElementById('bVideoExisting').value       = b?.video          || '';
  document.getElementById('bMobileVideoExisting').value = b?.mobile_video   || '';
  document.getElementById('bFallbackExisting').value    = b?.fallback_image || '';

  // Show existing previews
  if (b?.image)          showExistingImg('bDesktopPreview',     MEDIA + b.image.replace(/^\/uploads\//,''));
  if (b?.mobile_image)   showExistingImg('bMobilePreview',      MEDIA + b.mobile_image.replace(/^\/uploads\//,''));
  if (b?.fallback_image) showExistingImg('bFallbackPreview',    MEDIA + b.fallback_image.replace(/^\/uploads\//,''));
  if (b?.video) {
    const vp = document.getElementById('bVideoPreview');
    vp.src = '../' + b.video.replace(/^\/uploads\//,'uploads/');
    vp.style.display = 'block';
  }
  if (b?.mobile_video) {
    const mvp = document.getElementById('bMobileVideoPreview');
    mvp.src = '../' + b.mobile_video.replace(/^\/uploads\//,'uploads/');
    mvp.style.display = 'block';
  }

  // Set media type
  const mtype = b?.media_type || 'image';
  setMediaType(mtype);

  document.getElementById('bannerModal').classList.add('show');
}

function showExistingImg(id, src) {
  const el = document.getElementById(id);
  el.src = src; el.style.display = 'block';
}

async function saveBanner() {
  const id      = document.getElementById('bannerId').value;
  const mtype   = document.getElementById('bMediaType').value;
  const fd      = new FormData();

  fd.set('media_type',   mtype);
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

  if (id) {
    fd.set('_method',   'PUT');
    fd.set('banner_id', id);
    // Preserve existing files
    fd.set('existing_image',        document.getElementById('bDesktopExisting').value);
    fd.set('existing_mobile_image', document.getElementById('bMobileExisting').value);
    fd.set('existing_video',        document.getElementById('bVideoExisting').value);
    fd.set('existing_mobile_video', document.getElementById('bMobileVideoExisting').value);
    fd.set('existing_fallback_image', document.getElementById('bFallbackExisting').value);
  }

  // New file uploads
  const df  = document.getElementById('bDesktopFile').files[0];
  const mf  = document.getElementById('bMobileFile').files[0];
  const vf  = document.getElementById('bVideoFile').files[0];
  const mvf = document.getElementById('bMobileVideoFile').files[0];
  const ff  = document.getElementById('bFallbackFile').files[0];

  if (df)  fd.set('image',         df);
  if (mf)  fd.set('mobile_image',  mf);
  if (vf)  fd.set('video',         vf);
  if (mvf) fd.set('mobile_video',  mvf);
  if (ff)  fd.set('fallback_image', ff);

  // Validation
  if (mtype === 'image' && !id && !df) { showAlert('Desktop image is required!', 'danger'); return; }
  if (mtype === 'video' && !id && !vf) { showAlert('Desktop video is required!', 'danger'); return; }

  document.getElementById('saveBtnText').textContent = 'Saving...';
  try {
    await api('/banners', 'POST', fd, true);
    showAlert(id ? 'Slide updated!' : 'Slide created!');
    closeModal();
    loadBanners();
  } catch(e) { showAlert('Error: ' + e.message, 'danger'); }
  document.getElementById('saveBtnText').textContent = 'Save Slide';
}

async function deleteBanner(id) {
  if (!confirm('Delete this slide?')) return;
  try { await api('/banners/' + id, 'DELETE'); showAlert('Deleted!'); loadBanners(); } catch(e) {}
}

async function toggleBanner(id) {
  try { await api('/banners/' + id + '/toggle', 'POST'); loadBanners(); } catch(e) {}
}

// ── Drag-to-reorder ──
let dragSrc = null;
function initDrag() {
  document.querySelectorAll('.banner-row').forEach(row => {
    row.draggable = true;
    row.ondragstart = () => { dragSrc = row; row.classList.add('dragging'); };
    row.ondragend   = () => { row.classList.remove('dragging'); saveOrder(); };
    row.ondragover  = e => { e.preventDefault(); row.classList.add('drag-over'); };
    row.ondragleave = () => row.classList.remove('drag-over');
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
          <div style="font-size:40px;margin-bottom:12px;">🎬</div>
          <div>No slides yet. Click <strong>+ Add Slide</strong> to create your first hero banner.</div>
        </div>`;
      return;
    }

    document.getElementById('bannerGrid').innerHTML = banners.map(b => {
      const isVideo = b.media_type === 'video';
      const thumb = isVideo
        ? `<div class="banner-thumb-video">🎬</div>`
        : `<img class="banner-thumb" src="${b.image ? '../' + b.image.replace(/^\/uploads\//,'uploads/') : ''}" onerror="this.style.background='#eee'" alt="">`;

      const typeBadge = isVideo
        ? `<span class="media-badge badge-video">🎬 Video</span>`
        : `<span class="media-badge badge-image">🖼 Image</span>`;

      return `
      <div class="banner-row" data-id="${b.id}">
        <span class="drag-handle" title="Drag to reorder">⠿</span>
        ${thumb}
        <div class="banner-info">
          <strong>${b.title || '(No title)'}</strong>
          <span>${b.subtitle || ''}</span>
          <div style="margin-top:4px;">${typeBadge}${b.link ? `<small style="color:var(--admin-text-dim)">🔗 ${b.link}</small>` : ''}</div>
        </div>
        <div style="font-size:11px;color:var(--admin-text-muted);text-align:center;">
          <div>Sort</div><strong>${b.sort_order}</strong>
        </div>
        <span class="badge ${b.is_active==1?'badge-success':'badge-danger'}" style="cursor:pointer;" onclick="toggleBanner(${b.id})">
          ${b.is_active==1?'Active':'Inactive'}
        </span>
        <button class="btn btn-outline btn-sm" onclick="editBanner(${b.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteBanner(${b.id})">Delete</button>
      </div>`;
    }).join('');
    initDrag();
  } catch(e) { console.error(e); }
}

async function editBanner(id) {
  try {
    const res = await api('/banners/' + id);
    showModal(res.data || res);
  } catch(e) { showAlert('Failed to load slide', 'error'); }
}

loadBanners();
</script>

<?php include 'includes/footer.php'; ?>
