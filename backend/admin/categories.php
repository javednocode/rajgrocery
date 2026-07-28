<?php $pageTitle = 'Categories'; include 'includes/header.php'; ?>

<div class="toolbar">
    <h3 style="font-size:16px;">Manage Categories</h3>
    <div style="display:flex;gap:8px;">
        <button class="btn btn-outline" id="bulkAiBtn" onclick="generateMissingCategoryImages()"> Generate Missing Images</button>
        <button class="btn btn-primary" onclick="showCategoryModal()">+ Add Category</button>
    </div>
</div>

<!-- Bulk AI progress -->
<div id="bulkAiPanel" style="display:none;margin-bottom:14px;padding:14px 16px;border-radius:10px;background:var(--admin-surface-2,rgba(37,99,235,.06));border:1.5px solid rgba(37,99,235,.15);">
    <div style="display:flex;align-items:center;gap:12px;">
        <strong id="bulkAiStatus" style="font-size:13px;color:var(--admin-text);">Preparing…</strong>
        <span style="flex:1"></span>
        <button class="btn btn-sm btn-danger" id="bulkAiStop" onclick="bulkAiCancel=true" style="display:none;">Stop</button>
    </div>
    <div style="height:8px;border-radius:6px;background:rgba(0,0,0,.08);overflow:hidden;margin-top:10px;">
        <div id="bulkAiBar" style="height:100%;width:0%;background:linear-gradient(90deg,#f59e0b,#10b981);transition:width .3s;"></div>
    </div>
    <div id="bulkAiLog" style="margin-top:8px;font-size:12px;color:var(--admin-text-muted);max-height:120px;overflow-y:auto;"></div>
</div>

<div class="card">
    <div class="card-body" style="padding:0;">
        <table class="data-table">
            <thead><tr><th>Image</th><th>Name</th><th>Slug</th><th>Products</th><th>Featured</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="categoriesList"></tbody>
        </table>
    </div>
</div>

<!-- Category Modal -->
<div class="modal-overlay" id="categoryModal">
    <div class="modal">
        <div class="modal-header"><h3 id="modalTitle">Add Category</h3><button class="btn btn-icon" onclick="closeCategoryModal()"></button></div>
        <div class="modal-body">
            <form id="categoryForm" enctype="multipart/form-data">
                <input type="hidden" id="catId">
                <div class="form-group"><label>Name *</label><input type="text" id="catName" class="form-control" required></div>
                <div class="form-group"><label>Slug</label><input type="text" id="catSlug" class="form-control"></div>
                <div class="form-group"><label>Parent Category</label><select id="catParent" class="form-control"><option value="">— None (Top Level) —</option></select></div>
                <div class="form-group"><label>Description</label><textarea id="catDesc" class="form-control" rows="3"></textarea></div>
                <div class="form-group">
                    <label>Category Image</label>
                    <div style="display:flex;gap:14px;align-items:flex-start;">
                        <div style="flex-shrink:0;">
                            <img id="catImagePreview" src="/admin/assets/placeholder-product.svg"
                                 style="width:96px;height:96px;border-radius:12px;object-fit:cover;background:var(--admin-surface-2);border:1px solid var(--admin-border);">
                        </div>
                        <div style="flex:1;min-width:0;">
                            <input type="file" id="catImage" class="form-control" accept="image/*" style="margin-bottom:8px;">
                            <div id="catAiRow" style="display:flex;flex-wrap:wrap;gap:6px;">
                                <button type="button" class="btn btn-sm btn-primary" id="catAiGenBtn" onclick="generateCatImageAi()"> Generate with AI</button>
                                <button type="button" class="btn btn-sm btn-outline" id="catAiRegenBtn" onclick="generateCatImageAi()" style="display:none;"> Regenerate</button>
                                <button type="button" class="btn btn-sm btn-danger" id="catAiRemoveBtn" onclick="removeCatImage()" style="display:none;">Remove Image</button>
                            </div>
                            <div id="catAiHint" style="font-size:11.5px;color:var(--admin-text-muted);margin-top:6px;">
                                Save the category first, then generate an AI image from its name.
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group"><label>Icon (emoji)</label><input type="text" id="catIcon" class="form-control" placeholder=""></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-check"><input type="checkbox" id="catActive" checked> Active</label></div>
                    <div class="form-group"><label class="form-check"><input type="checkbox" id="catFeatured"> Featured</label></div>
                </div>
                <div class="seo-section">
                    <h4> SEO</h4>
                    <div class="form-group"><label>Meta Title</label><input type="text" id="catMetaTitle" class="form-control"></div>
                    <div class="form-group"><label>Meta Description</label><textarea id="catMetaDesc" class="form-control" rows="2"></textarea></div>
                    <div class="form-group"><label>Focus Keyword</label><input type="text" id="catFocusKw" class="form-control"></div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeCategoryModal()">Cancel</button>
            <button class="btn btn-primary" onclick="saveCategory()">Save Category</button>
        </div>
    </div>
</div>

<script>
async function loadCategories() {
    try {
        const res = await api('/categories?admin=1');
        const flat = flattenCats(res.data);
        document.getElementById('categoriesList').innerHTML = flat.map(c => `
            <tr style="opacity:${c.is_active==1?'1':'0.55'}">
                <td><img src="${imgUrl(c.image)}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;background:var(--admin-surface-2)"></td>
                <td>${c.prefix}<strong>${c.name}</strong></td>
                <td style="color:var(--admin-text-muted)">${c.slug}</td>
                <td>${c.product_count||0}</td>
                <td>${c.is_featured==1?'<span class="badge badge-primary">Yes</span>':'—'}</td>
                <td>${c.is_active==1?'<span class="badge badge-success">Active</span>':'<span class="badge badge-danger">Inactive</span>'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editCategory(${c.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" data-id="${c.id}" data-name="${c.name.replace(/"/g,'&quot;')}" onclick="confirmDeleteCat(this)">Delete</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No categories yet</td></tr>';

        // Parent dropdown
        const parentSelect = document.getElementById('catParent');
        parentSelect.innerHTML = '<option value="">— None (Top Level) —</option>' + flat.filter(c=>c.is_active==1).map(c => `<option value="${c.id}">${c.prefix}${c.name}</option>`).join('');
    } catch(e) { console.error('loadCategories error', e); }
}

function flattenCats(cats, prefix='') {
    let r=[]; cats.forEach(c => { r.push({...c,prefix}); if(c.children?.length) r.push(...flattenCats(c.children, prefix+'— ')); }); return r;
}

function showCategoryModal(id) {
    document.getElementById('categoryModal').classList.add('show');
    if (!id) {
        document.getElementById('categoryForm').reset();
        document.getElementById('catId').value='';
        document.getElementById('modalTitle').textContent='Add Category';
        updateCatImageUi(null);
    }
}
function closeCategoryModal() { document.getElementById('categoryModal').classList.remove('show'); }

// ── AI category image controls ──
// Reflect current image + whether the category is saved (needs an id to generate).
function updateCatImageUi(image) {
    const id = document.getElementById('catId').value;
    const hasId = !!id;
    const hasImg = !!image;
    document.getElementById('catImagePreview').src = image ? imgUrl(image) : '/admin/assets/placeholder-product.svg';
    document.getElementById('catAiGenBtn').style.display   = (hasId && !hasImg) ? '' : 'none';
    document.getElementById('catAiRegenBtn').style.display = (hasId && hasImg) ? '' : 'none';
    document.getElementById('catAiRemoveBtn').style.display= (hasId && hasImg) ? '' : 'none';
    document.getElementById('catAiHint').style.display = hasId ? 'none' : '';
}

async function generateCatImageAi() {
    const id = document.getElementById('catId').value;
    if (!id) { showAlert('Save the category first, then generate.', 'danger'); return; }
    const btns = ['catAiGenBtn','catAiRegenBtn','catAiRemoveBtn'].map(i=>document.getElementById(i));
    const gen = document.getElementById('catAiGenBtn'), regen = document.getElementById('catAiRegenBtn');
    const active = gen.style.display !== 'none' ? gen : regen;
    const label = active.textContent;
    btns.forEach(b=>b.disabled=true);
    active.textContent = ' Generating…';
    try {
        const res = await api(`/ai-images/categories/${id}/generate`, 'POST', {});
        updateCatImageUi(res.data.image);
        // bust the <img> cache so a regenerated image (may reuse a path) refreshes
        document.getElementById('catImagePreview').src = imgUrl(res.data.image) + '?t=' + Date.now();
        showAlert('AI image generated & saved to this category.');
        loadCategories();
    } catch(e) {
        // endpoint leaves the existing image untouched on failure; button stays as retry
    } finally {
        btns.forEach(b=>b.disabled=false);
        active.textContent = label;
    }
}

async function removeCatImage() {
    const id = document.getElementById('catId').value;
    if (!id) return;
    if (!confirm('Remove the image from this category?')) return;
    try {
        await api(`/ai-images/categories/${id}/image`, 'DELETE');
        updateCatImageUi(null);
        showAlert('Image removed.');
        loadCategories();
    } catch(e) {}
}

async function editCategory(id) {
    try {
        const res = await api(`/categories/${id}`);
        const c = res.data;
        document.getElementById('catId').value = c.id;
        document.getElementById('catName').value = c.name;
        document.getElementById('catSlug').value = c.slug;
        document.getElementById('catParent').value = c.parent_id || '';
        document.getElementById('catDesc').value = c.description || '';
        document.getElementById('catIcon').value = c.icon || '';
        document.getElementById('catActive').checked = c.is_active == 1;
        document.getElementById('catFeatured').checked = c.is_featured == 1;
        document.getElementById('catMetaTitle').value = c.meta_title || '';
        document.getElementById('catMetaDesc').value = c.meta_description || '';
        document.getElementById('catFocusKw').value = c.focus_keyword || '';
        document.getElementById('modalTitle').textContent = 'Edit Category';
        document.getElementById('categoryModal').classList.add('show');
        updateCatImageUi(c.image || null);
    } catch(e) {}
}

async function saveCategory() {
    const id = document.getElementById('catId').value;
    const formData = new FormData();
    formData.set('name', document.getElementById('catName').value);
    formData.set('slug', document.getElementById('catSlug').value);
    formData.set('parent_id', document.getElementById('catParent').value);
    formData.set('description', document.getElementById('catDesc').value);
    formData.set('icon', document.getElementById('catIcon').value);
    formData.set('is_active', document.getElementById('catActive').checked ? '1' : '0');
    formData.set('is_featured', document.getElementById('catFeatured').checked ? '1' : '0');
    formData.set('meta_title', document.getElementById('catMetaTitle').value);
    formData.set('meta_description', document.getElementById('catMetaDesc').value);
    formData.set('focus_keyword', document.getElementById('catFocusKw').value);
    if (document.getElementById('catImage').files[0]) formData.set('image', document.getElementById('catImage').files[0]);

    try {
        // Always POST — PHP cannot read $_POST/$_FILES for PUT+multipart
        if (id) formData.set('_method', 'PUT');
        await api(`/categories${id ? '/' + id : ''}`, 'POST', formData, true);
        showAlert(id ? 'Category updated!' : 'Category created!');
        closeCategoryModal();
        loadCategories();
    } catch(e) { showAlert('Error: ' + e.message, 'danger'); }
}

// Delete category using data-attributes (avoids JS string escaping issues with special chars)
async function confirmDeleteCat(btn) {
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    if (!confirm('Delete category "' + name + '"?\nThis will also remove all product assignments for this category.\n\nThis cannot be undone.')) return;
    btn.disabled = true;
    btn.textContent = '...';
    try {
        await api('/categories/' + id, 'DELETE');
        showAlert('Category deleted successfully');
        setTimeout(() => loadCategories(), 500);
    } catch(e) {
        btn.disabled = false;
        btn.textContent = 'Delete';
        showAlert('Delete failed: ' + e.message, 'danger');
    }
}


// ── Bulk: generate images only for categories that have none ──
let bulkAiCancel = false;
async function generateMissingCategoryImages() {
    let missing;
    try {
        const res = await api('/ai-images/categories/missing');
        missing = res.data.categories || [];
    } catch(e) { return; }

    if (!missing.length) { showAlert('All categories already have an image. Nothing to generate.'); return; }
    if (!confirm(`Generate AI images for ${missing.length} categories without one?\n\nThis calls the configured AI provider once per category and may take a while. Existing images are never overwritten.`)) return;

    bulkAiCancel = false;
    const panel = document.getElementById('bulkAiPanel');
    const bar = document.getElementById('bulkAiBar');
    const status = document.getElementById('bulkAiStatus');
    const log = document.getElementById('bulkAiLog');
    const stop = document.getElementById('bulkAiStop');
    const btn = document.getElementById('bulkAiBtn');
    panel.style.display = 'block'; stop.style.display = ''; log.innerHTML = ''; bar.style.width = '0%';
    btn.disabled = true;

    let done = 0, ok = 0, failed = 0;
    for (let i = 0; i < missing.length; i++) {
        if (bulkAiCancel) { logLine(log, '⏹ Stopped by user.', '#b45309'); break; }
        const cat = missing[i];
        status.textContent = `Generating ${i+1} of ${missing.length}: ${cat.name}`;
        let success = false, lastErr = '';
        for (let attempt = 1; attempt <= 2 && !success; attempt++) {
            try {
                const r = await fetch(`${API_BASE}/ai-images/categories/${cat.id}/generate`, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + getStoredToken(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ only_if_missing: true })
                });
                const j = await r.json();
                if (r.ok && j.success) { success = true; }
                else { lastErr = j.message || ('HTTP ' + r.status); }
            } catch(e) { lastErr = e.message; }
            if (!success && attempt < 2) await new Promise(res => setTimeout(res, 1500));
        }
        done++;
        if (success) { ok++; logLine(log, `✓ ${cat.name}`, '#047857'); }
        else { failed++; logLine(log, `✗ ${cat.name} — ${lastErr}`, '#b91c1c'); }
        bar.style.width = Math.round((done / missing.length) * 100) + '%';
    }

    stop.style.display = 'none';
    btn.disabled = false;
    status.textContent = `Done — ${ok} generated, ${failed} failed of ${missing.length}.`;
    if (failed) logLine(log, `Retry later for the ${failed} that failed (existing images were left unchanged).`, '#6b7280');
    loadCategories();
}
function logLine(box, text, color) {
    const d = document.createElement('div');
    d.textContent = text; if (color) d.style.color = color;
    box.appendChild(d); box.scrollTop = box.scrollHeight;
}

document.getElementById('catName').addEventListener('input', function() {
    document.getElementById('catSlug').value = generateSlug(this.value);
});
loadCategories();


</script>

<?php include 'includes/footer.php'; ?>
