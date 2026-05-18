<?php $pageTitle = isset($_GET['id']) ? 'Edit Product' : 'Add Product'; include 'includes/header.php'; ?>

<style>
/* ── Quill dark theme fix ─────────────────────────────── */
.ql-toolbar.ql-snow {
    background: #1e2740;
    border: 1px solid var(--admin-border) !important;
    border-radius: 8px 8px 0 0;
}
.ql-container.ql-snow {
    background: #141d32;
    border: 1px solid var(--admin-border) !important;
    border-radius: 0 0 8px 8px;
    min-height: 200px;
    font-size: 14px;
    color: #e2e8f0;
}
.ql-editor { min-height: 200px; }
.ql-snow .ql-stroke { stroke: #94a3b8; }
.ql-snow .ql-fill  { fill:   #94a3b8; }
.ql-snow .ql-picker-label { color: #94a3b8; }
.ql-snow .ql-picker-options { background:#1e2740; border-color:var(--admin-border); }
.ql-snow .ql-picker-item { color:#e2e8f0; }
.ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label { border-color:var(--admin-border); }

/* ── Variation list rows ──────────────────────────────── */
.variation-item {
    display: grid;
    grid-template-columns: 70px 1fr 90px 90px 70px auto;
    gap: 12px;
    align-items: center;
    background: var(--admin-card);
    border: 1px solid var(--admin-border);
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 10px;
    transition: border-color 0.2s, box-shadow 0.2s;
}
.variation-item:hover { border-color: var(--admin-accent); box-shadow: 0 2px 12px rgba(0,0,0,0.2); }
.variation-thumb {
    width: 60px; height: 60px; border-radius: 10px;
    background: var(--admin-surface); border: 1px solid var(--admin-border);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 22px; overflow: hidden; position: relative;
}
.variation-thumb img { width:100%; height:100%; object-fit:cover; }
.variation-thumb .upload-hint {
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    background:rgba(0,0,0,0.55); opacity:0; transition:0.2s; font-size:11px; color:#fff; text-align:center; padding:4px;
    border-radius: 10px;
}
.variation-thumb:hover .upload-hint { opacity:1; }
.variation-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.badge-active   { background:rgba(42,122,59,0.15); color:#34d399; }
.badge-inactive { background:rgba(204,41,54,0.12); color:#f87171; }
.var-actions { display:flex; gap:6px; }
.var-actions button { padding:6px 12px; border-radius:8px; border:none; cursor:pointer; font-size:12px; font-weight:600; transition:0.15s; }
.var-btn-edit   { background:rgba(99,102,241,0.15); color:#818cf8; }
.var-btn-delete { background:rgba(239,68,68,0.12);  color:#f87171; }
.var-btn-edit:hover   { background:rgba(99,102,241,0.3); }
.var-btn-delete:hover { background:rgba(239,68,68,0.25); }

/* ── Variation Modal ──────────────────────────────────── */
.var-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(5,10,25,0.72);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 9000;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
}
.var-modal-overlay.open { display: flex; }

.var-modal {
    background: linear-gradient(145deg, #1a2340 0%, #151c35 100%);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 0;
    width: 540px;
    max-width: 100%;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: modalSlideIn 0.22s ease;
}
@keyframes modalSlideIn {
    from { opacity:0; transform: translateY(16px) scale(0.97); }
    to   { opacity:1; transform: translateY(0)  scale(1); }
}

.var-modal-header {
    padding: 22px 26px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}
.var-modal-title {
    font-size: 17px; font-weight: 700;
    color: #f1f5f9;
    margin: 0;
    display: flex; align-items: center; gap: 9px;
}
.var-modal-title span { font-size: 20px; }
.var-modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: none; background: rgba(255,255,255,0.06);
    color: #94a3b8; font-size: 18px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: 0.15s;
}
.var-modal-close:hover { background: rgba(255,255,255,0.12); color: #f1f5f9; }

.var-modal-body {
    padding: 24px 26px;
    overflow-y: auto;
    flex: 1;
}

.var-img-zone {
    border: 2px dashed rgba(255,255,255,0.12);
    border-radius: 14px;
    padding: 24px 16px 18px;
    text-align: center;
    cursor: pointer;
    transition: 0.2s;
    margin-bottom: 22px;
    position: relative;
    overflow: hidden;
    background: rgba(255,255,255,0.02);
}
.var-img-zone:hover { border-color: #6366f1; background: rgba(99,102,241,0.06); }
.var-img-zone .img-icon { font-size: 36px; margin-bottom: 6px; line-height: 1; }
.var-img-zone .img-label { font-size: 13px; color: #94a3b8; margin: 0; }
.var-img-zone .img-hint  { font-size: 11px; color: #64748b; margin-top: 4px; }
.var-img-zone img#varImgPreview {
    max-height: 130px; max-width: 100%; border-radius: 10px;
    display: none; margin: 10px auto 0; object-fit: contain;
}
.var-img-zone.has-image .img-icon,
.var-img-zone.has-image .img-label,
.var-img-zone.has-image .img-hint { display: none; }
.var-img-zone.has-image img#varImgPreview { display: block; }
.var-img-change {
    position: absolute; bottom: 8px; right: 8px;
    background: rgba(99,102,241,0.9); color: white;
    font-size: 11px; font-weight: 600; padding: 4px 10px;
    border-radius: 6px; display: none;
}
.var-img-zone.has-image .var-img-change { display: block; }

.var-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: #64748b;
    margin: 18px 0 10px;
}
.var-form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.var-form-grid-3 { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 14px; }

.var-modal-footer {
    padding: 16px 26px 22px;
    display: flex;
    gap: 10px;
    flex-shrink: 0;
    border-top: 1px solid rgba(255,255,255,0.06);
}
.var-btn-save {
    flex: 1; padding: 12px;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    transition: 0.2s; letter-spacing: 0.3px;
}
.var-btn-save:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
.var-btn-cancel {
    padding: 12px 20px;
    background: rgba(255,255,255,0.06); color: #94a3b8;
    border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
    font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.15s;
}
.var-btn-cancel:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }

.var-empty {
    text-align:center; padding: 36px 20px; color: var(--admin-text-dim); font-size: 14px;
    border: 2px dashed var(--admin-border); border-radius: 12px;
}
.var-empty .var-empty-icon { font-size: 36px; margin-bottom: 8px; }
</style>

<form id="productForm" enctype="multipart/form-data">
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
        <div>
            <div class="card">
                <div class="card-header"><h3>Product Information</h3></div>
                <div class="card-body">
                    <div class="form-group">
                        <label for="name">Product Name *</label>
                        <input type="text" id="name" name="name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="slug">URL Slug</label>
                        <input type="text" id="slug" name="slug" class="form-control" placeholder="auto-generated">
                    </div>
                    <div class="form-group">
                        <label for="short_description">Short Description</label>
                        <textarea id="short_description" name="short_description" class="form-control" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="description">Full Description</label>
                        <textarea id="description" name="description" class="form-control" rows="8"></textarea>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h3>Pricing &amp; Inventory</h3></div>
                <div class="card-body">
                    <div class="form-row-3">
                        <div class="form-group"><label for="price">Price (€) *</label><input type="number" id="price" name="price" class="form-control" step="0.01" required></div>
                        <div class="form-group"><label for="sale_price">Sale Price (€)</label><input type="number" id="sale_price" name="sale_price" class="form-control" step="0.01"></div>
                        <div class="form-group"><label for="cost_price">Cost Price (€)</label><input type="number" id="cost_price" name="cost_price" class="form-control" step="0.01"></div>
                    </div>
                    <div class="form-row-3">
                        <div class="form-group"><label for="sku">SKU</label><input type="text" id="sku" name="sku" class="form-control"></div>
                        <div class="form-group"><label for="stock">Stock Quantity</label><input type="number" id="stock" name="stock" class="form-control" value="0"></div>
                        <div class="form-group"><label for="unit">Unit</label><select id="unit" name="unit" class="form-control"><option value="piece">Piece</option><option value="kg">Kg</option><option value="g">Gram</option><option value="l">Litre</option><option value="ml">ml</option><option value="pack">Pack</option><option value="jar">Jar</option><option value="bottle">Bottle</option><option value="box">Box</option><option value="bag">Bag</option><option value="dozen">Dozen</option></select></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label for="brand">Brand</label><input type="text" id="brand" name="brand" class="form-control"></div>
                        <div class="form-group"><label for="weight">Weight</label><input type="number" id="weight" name="weight" class="form-control" step="0.01"></div>
                    </div>
                </div>
            </div>

            <!-- VARIATIONS SECTION -->
            <div class="card" id="variationsCard">
                <div class="card-header" style="display:flex;align-items:center;justify-content:space-between;">
                    <h3>Product Variations</h3>
                    <div id="varActionArea">
                        <!-- Shown dynamically by JS -->
                    </div>
                </div>
                <div class="card-body">
                    <p style="font-size:13px;color:var(--admin-text-dim);margin-bottom:14px;">Each variation can have its own name, price, stock and image (e.g. 500g, 1kg, Red, Blue).</p>
                    <div id="variationsList"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h3>🔍 SEO Settings</h3></div>
                <div class="card-body">
                    <div class="seo-preview" id="seoPreview"><div class="seo-title">Page Title</div><div class="seo-url">https://yoursite.com/product-url</div><div class="seo-desc">Meta description...</div></div>
                    <div class="form-group"><label for="meta_title">Meta Title</label><input type="text" id="meta_title" name="meta_title" class="form-control" oninput="updateSeoPreview()" maxlength="60"></div>
                    <div class="form-group"><label for="meta_description">Meta Description</label><textarea id="meta_description" name="meta_description" class="form-control" rows="2" oninput="updateSeoPreview()" maxlength="160"></textarea></div>
                    <div class="form-group"><label for="focus_keyword">Focus Keyword</label><input type="text" id="focus_keyword" name="focus_keyword" class="form-control"></div>
                </div>
            </div>
        </div>

        <div>
            <div class="card">
                <div class="card-header"><h3>Status</h3></div>
                <div class="card-body">
                    <div class="form-group"><label class="form-check"><input type="checkbox" id="is_active" name="is_active" checked> Active</label></div>
                    <div class="form-group"><label class="form-check"><input type="checkbox" id="is_featured" name="is_featured"> Featured</label></div>
                    <div class="form-group"><label class="form-check"><input type="checkbox" id="is_trending" name="is_trending"> Trending</label></div>
                    <div class="form-group"><label class="form-check"><input type="checkbox" id="is_new" name="is_new"> New Arrival</label></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h3>Category</h3></div>
                <div class="card-body">
                    <div id="categoryCheckboxes" style="max-height:250px;overflow-y:auto;"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h3>Images</h3></div>
                <div class="card-body">
                    <div class="image-upload-area" onclick="document.getElementById('images').click()">
                        <div class="upload-icon">📷</div>
                        <p style="font-size:14px;color:var(--admin-text-dim)">Click to upload images</p>
                        <input type="file" id="images" name="images[]" multiple accept="image/*" style="display:none">
                    </div>
                    <div class="image-preview" id="imagePreview"></div>
                    <div class="image-preview" id="existingImages"></div>
                </div>
            </div>

            <div style="display:flex;gap:12px;margin-top:20px;">
                <button type="submit" class="btn btn-primary" style="flex:1;justify-content:center;">Save Product</button>
                <a href="products.php" class="btn btn-outline">Cancel</a>
            </div>
        </div>
    </div>
</form>

<!-- ─── Variation Modal ──────────────────────────────── -->
<div class="var-modal-overlay" id="varModalOverlay">
    <div class="var-modal">

        <div class="var-modal-header">
            <div class="var-modal-title">
                <span>🎨</span>
                <span id="varModalTitle">Add Variation</span>
            </div>
            <button class="var-modal-close" onclick="closeVariationModal()">✕</button>
        </div>

        <div class="var-modal-body">

            <!-- Image Upload -->
            <div class="var-img-zone" id="varImgZone" onclick="document.getElementById('varImageInput').click()">
                <div class="img-icon">🖼️</div>
                <p class="img-label">Click to upload variation image</p>
                <p class="img-hint">JPG, PNG, WEBP — max 5MB</p>
                <img id="varImgPreview" src="" alt="preview">
                <div class="var-img-change">📷 Change</div>
            </div>
            <input type="file" id="varImageInput" accept="image/*" style="display:none" onchange="previewVarImage(this)">
            <input type="hidden" id="varExistingImage">

            <!-- Name -->
            <div class="var-section-label">Variation Details</div>
            <div class="form-group" style="margin-bottom:14px;">
                <label style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:6px;">Name *</label>
                <input type="text" id="varName" class="form-control" placeholder="e.g. 500g · 1kg · Red · Large · XL">
            </div>

            <!-- SKU + Stock + Price row -->
            <div class="var-section-label">Pricing & Stock</div>
            <div class="var-form-grid-3" style="margin-bottom:14px;">
                <div class="form-group" style="margin:0;">
                    <label style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:6px;">Price (€) *</label>
                    <input type="number" id="varPrice" class="form-control" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group" style="margin:0;">
                    <label style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:6px;">Sale Price</label>
                    <input type="number" id="varSalePrice" class="form-control" step="0.01" placeholder="—">
                </div>
                <div class="form-group" style="margin:0;">
                    <label style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:6px;">Stock</label>
                    <input type="number" id="varStock" class="form-control" value="0" min="0">
                </div>
            </div>

            <!-- SKU + Active -->
            <div class="var-form-grid-2">
                <div class="form-group" style="margin:0;">
                    <label style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:6px;">SKU</label>
                    <input type="text" id="varSku" class="form-control" placeholder="Optional">
                </div>
                <div class="form-group" style="margin:0;display:flex;align-items:flex-end;">
                    <label class="form-check" style="margin-bottom:10px;"><input type="checkbox" id="varActive" checked> Active</label>
                </div>
            </div>

        </div><!-- /body -->

        <div class="var-modal-footer">
            <button type="button" class="var-btn-save" onclick="saveVariation()">Save Variation</button>
            <button type="button" class="var-btn-cancel" onclick="closeVariationModal()">Cancel</button>
        </div>
    </div>
</div>

<script>
const productId = new URLSearchParams(window.location.search).get('id');
let editingVariationId = null;

autoSlug('name', 'slug');
setupImageUpload('images', 'imagePreview');

// ─── Pending variations (for new product mode) ────────────────────────────
let pendingVariations = [];  // { name, sku, price, sale_price, stock, is_active, imageFile, imagePreviewUrl }

// Show variations card — always visible with Add Variation button
document.getElementById('varActionArea').innerHTML =
    '<button type="button" class="btn btn-primary" onclick="openVariationModal()" style="padding:8px 16px;font-size:13px;">+ Add Variation</button>';

if (!productId) {
    // New-product mode: render pending variations list
    renderPendingVariations();
}

function renderPendingVariations() {
    const list = document.getElementById('variationsList');
    if (!pendingVariations.length) {
        list.innerHTML = '<div style="color:var(--admin-text-dim);font-size:13px;padding:10px 0;">'
            + 'No variations yet. Click "+ Add Variation" to create one. They will be saved when you save the product.</div>';
        return;
    }
    list.innerHTML = pendingVariations.map((v, i) => `
        <div class="variation-item" id="pending-var-${i}">
            <div class="variation-thumb">
                ${v.imagePreviewUrl
                    ? `<img src="${v.imagePreviewUrl}" alt="${v.name}">`
                    : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#64748b" stroke-width="1.6"/><circle cx="8.5" cy="8.5" r="1.5" stroke="#64748b" stroke-width="1.2"/><path d="m21 15-5-5L5 21" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>`}
            </div>
            <div>
                <div style="font-weight:600;font-size:14px;">${v.name}</div>
                <div style="font-size:12px;color:var(--admin-text-dim);">SKU: ${v.sku||'—'} &nbsp;|&nbsp; Stock: ${v.stock}</div>
            </div>
            <div style="font-size:13px;font-weight:700;">€${parseFloat(v.price||0).toFixed(2)}</div>
            <div style="font-size:13px;color:#2A7A3B;">${v.sale_price ? '€'+parseFloat(v.sale_price).toFixed(2) : '—'}</div>
            <div><span class="variation-badge ${v.is_active?'badge-active':'badge-inactive'}">${v.is_active?'Active':'Off'}</span></div>
            <div></div>
            <div class="var-actions">
                <button class="var-btn-edit" onclick="editPendingVariation(${i})">Edit</button>
                <button class="var-btn-delete" onclick="deletePendingVariation(${i})">Remove</button>
            </div>
        </div>
    `).join('');
}

function editPendingVariation(index) {
    const v = pendingVariations[index];
    editingVariationId = 'pending:' + index;  // special prefix to identify pending
    document.getElementById('varModalTitle').textContent = 'Edit Variation';
    document.getElementById('varName').value = v.name;
    document.getElementById('varSku').value = v.sku || '';
    document.getElementById('varStock').value = v.stock ?? 0;
    document.getElementById('varPrice').value = v.price || '';
    document.getElementById('varSalePrice').value = v.sale_price || '';
    document.getElementById('varActive').checked = v.is_active;
    document.getElementById('varImageInput').value = '';
    document.getElementById('varExistingImage').value = '';
    const zone = document.getElementById('varImgZone');
    const img  = document.getElementById('varImgPreview');
    if (v.imagePreviewUrl) { img.src = v.imagePreviewUrl; zone.classList.add('has-image'); }
    else { img.src = ''; zone.classList.remove('has-image'); }
    document.getElementById('varModalOverlay').classList.add('open');
}

function deletePendingVariation(index) {
    if (!confirm('Remove this variation?')) return;
    pendingVariations.splice(index, 1);
    renderPendingVariations();
}

// ─── Categories ───────────────────────────────────────────────────────────
async function loadCategories() {
    try {
        const res = await api('/categories');
        const flat = flattenCategories(res.data);
        document.getElementById('categoryCheckboxes').innerHTML = flat.map(c =>
            `<label class="form-check" style="margin-bottom:8px;"><input type="checkbox" name="categories[]" value="${c.id}" class="cat-check"> ${c.prefix}${c.name}</label>`
        ).join('');
    } catch(e) {}
}

function flattenCategories(cats, prefix = '') {
    let result = [];
    cats.forEach(c => {
        result.push({...c, prefix});
        if (c.children?.length) result.push(...flattenCategories(c.children, prefix + '— '));
    });
    return result;
}

// ─── Load product for editing ─────────────────────────────────────────────
async function loadProduct() {
    if (!productId) return;
    try {
        const res = await api(`/products/${productId}`);
        const p = res.data;
        document.getElementById('name').value = p.name;
        document.getElementById('slug').value = p.slug;
        document.getElementById('short_description').value = p.short_description || '';
        document.getElementById('description').value = p.description || '';
        document.getElementById('price').value = p.price;
        document.getElementById('sale_price').value = p.sale_price || '';
        document.getElementById('cost_price').value = p.cost_price || '';
        document.getElementById('sku').value = p.sku || '';
        document.getElementById('stock').value = p.stock;
        document.getElementById('unit').value = p.unit || 'piece';
        document.getElementById('brand').value = p.brand || '';
        document.getElementById('weight').value = p.weight || '';
        document.getElementById('is_active').checked = p.is_active == 1;
        document.getElementById('is_featured').checked = p.is_featured == 1;
        document.getElementById('is_trending').checked = p.is_trending == 1;
        document.getElementById('is_new').checked = p.is_new == 1;
        document.getElementById('meta_title').value = p.meta_title || '';
        document.getElementById('meta_description').value = p.meta_description || '';
        document.getElementById('focus_keyword').value = p.focus_keyword || '';

        if (p.categories) p.categories.forEach(c => {
            const cb = document.querySelector(`input[value="${c.id}"].cat-check`);
            if (cb) cb.checked = true;
        });

        if (p.images?.length) {
            document.getElementById('existingImages').innerHTML = p.images.map(img =>
                `<div class="preview-item" id="img-${img.id}">
                    <img src="${img.image_path}" alt="${img.alt_text||''}">
                    <button type="button" class="remove-btn" onclick="deleteProductImage(${img.id})">×</button>
                </div>`
            ).join('');
        }

        if (p.variations) renderVariations(p.variations);
        updateSeoPreview();
    } catch(e) {}
}

// ─── Save product ─────────────────────────────────────────────────────────
document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    formData.set('is_active', document.getElementById('is_active').checked ? '1' : '0');
    formData.set('is_featured', document.getElementById('is_featured').checked ? '1' : '0');
    formData.set('is_trending', document.getElementById('is_trending').checked ? '1' : '0');
    formData.set('is_new', document.getElementById('is_new').checked ? '1' : '0');

    const cats = [...document.querySelectorAll('.cat-check:checked')].map(c => c.value);
    formData.delete('categories[]');
    formData.set('categories', JSON.stringify(cats));

    try {
        // Always use POST — PHP doesn't populate $_FILES on PUT requests,
        // so images would silently fail to upload. The router maps
        // POST /products/{id} → updateProduct() just like PUT.
        const url    = productId ? `/products/${productId}` : '/products';
        const method = 'POST';
        const res = await api(url, method, formData, true);
        const newProductId = productId || res.data?.id;

        // If new product and has pending variations, save them all now
        if (!productId && newProductId && pendingVariations.length) {
            showAlert(`Product created! Saving ${pendingVariations.length} variation(s)...`);
            for (const v of pendingVariations) {
                const vfd = new FormData();
                vfd.set('name',        v.name);
                vfd.set('sku',         v.sku || '');
                vfd.set('price',       v.price || 0);
                vfd.set('sale_price',  v.sale_price || '');
                vfd.set('stock',       v.stock || 0);
                vfd.set('is_active',   v.is_active ? '1' : '0');
                if (v.imageFile) vfd.set('image', v.imageFile);
                try { await api(`/products/${newProductId}/variations`, 'POST', vfd, true); } catch(err) {}
            }
        } else {
            showAlert(productId ? 'Product updated!' : 'Product created!');
        }

        if (!productId && newProductId) {
            setTimeout(() => window.location.href = `product-edit.php?id=${newProductId}`, 900);
        } else {
            setTimeout(() => window.location.href = 'products.php', 1000);
        }
    } catch(e) {}
});

// ─── VARIATIONS ──────────────────────────────────────────────────────────

function renderVariations(variations) {
    const list = document.getElementById('variationsList');
    if (!variations.length) {
        list.innerHTML = `<div class="var-empty"><div class="var-empty-icon">🎨</div>No variations yet. Click "+ Add Variation" to create one.</div>`;
        return;
    }
    list.innerHTML = variations.map(v => `
        <div class="variation-item" id="var-row-${v.id}">
            <div class="variation-thumb" onclick="editVariation(${v.id})" title="Click to edit">
                ${v.image_path
                    ? `<img src="${v.image_path}" alt="${v.name}"><div class="upload-hint">📷 Change</div>`
                    : `<span>📦</span><div class="upload-hint">📷 Add</div>`}
            </div>
            <div>
                <div style="font-weight:600;font-size:14px;">${v.name}</div>
                <div style="font-size:12px;color:var(--admin-text-dim);">SKU: ${v.sku || '—'} &nbsp;|&nbsp; Stock: ${v.stock}</div>
            </div>
            <div style="font-size:13px;font-weight:700;">€${parseFloat(v.price).toFixed(2)}</div>
            <div style="font-size:13px;color:#2A7A3B;">${v.sale_price ? '€'+parseFloat(v.sale_price).toFixed(2) : '—'}</div>
            <div><span class="variation-badge ${v.is_active==1?'badge-active':'badge-inactive'}">${v.is_active==1?'Active':'Off'}</span></div>
            <div></div>
            <div class="var-actions">
                <button class="var-btn-edit" onclick="editVariation(${v.id})">✏️ Edit</button>
                <button class="var-btn-delete" onclick="deleteVariation(${v.id})">🗑</button>
            </div>
        </div>
    `).join('');
}

async function reloadVariations() {
    if (!productId) return;
    try {
        const res = await api(`/products/${productId}/variations`);
        renderVariations(res.data || []);
    } catch(e) {}
}

function openVariationModal(variation = null) {
    editingVariationId = variation ? variation.id : null;
    document.getElementById('varModalTitle').textContent = variation ? 'Edit Variation' : 'Add Variation';
    document.getElementById('varName').value = variation?.name || '';
    document.getElementById('varSku').value = variation?.sku || '';
    document.getElementById('varStock').value = variation?.stock ?? 0;
    document.getElementById('varPrice').value = variation?.price || '';
    document.getElementById('varSalePrice').value = variation?.sale_price || '';
    document.getElementById('varActive').checked = variation ? variation.is_active == 1 : true;
    document.getElementById('varImageInput').value = '';
    document.getElementById('varExistingImage').value = variation?.image_path || '';

    const zone = document.getElementById('varImgZone');
    const img  = document.getElementById('varImgPreview');
    if (variation?.image_path) {
        img.src = variation.image_path;
        zone.classList.add('has-image');
    } else {
        img.src = '';
        zone.classList.remove('has-image');
    }

    document.getElementById('varModalOverlay').classList.add('open');
}

function closeVariationModal() {
    document.getElementById('varModalOverlay').classList.remove('open');
    editingVariationId = null;
}

function previewVarImage(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const img  = document.getElementById('varImgPreview');
        const zone = document.getElementById('varImgZone');
        img.src = e.target.result;
        zone.classList.add('has-image');
    };
    reader.readAsDataURL(file);
}

async function editVariation(id) {
    try {
        // fetch fresh data from the list rendered
        const res = await api(`/products/${productId}/variations`);
        const v = (res.data || []).find(x => x.id == id);
        if (v) openVariationModal(v);
    } catch(e) {}
}

async function saveVariation() {
    const name = document.getElementById('varName').value.trim();
    if (!name) { alert('Variation name is required'); return; }

    const imgFile = document.getElementById('varImageInput').files[0];

    // ── NEW PRODUCT MODE: store locally ──────────────────────────────────
    if (!productId) {
        let imagePreviewUrl = null;
        if (imgFile) {
            imagePreviewUrl = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(imgFile);
            });
        }
        const varData = {
            name,
            sku:        document.getElementById('varSku').value,
            price:      document.getElementById('varPrice').value || 0,
            sale_price: document.getElementById('varSalePrice').value,
            stock:      document.getElementById('varStock').value || 0,
            is_active:  document.getElementById('varActive').checked,
            imageFile:  imgFile || null,
            imagePreviewUrl
        };

        // Check if editing an existing pending variation
        if (typeof editingVariationId === 'string' && editingVariationId.startsWith('pending:')) {
            const idx = parseInt(editingVariationId.split(':')[1]);
            // Preserve existing imageFile if no new file chosen
            if (!imgFile && pendingVariations[idx]?.imageFile) {
                varData.imageFile       = pendingVariations[idx].imageFile;
                varData.imagePreviewUrl = pendingVariations[idx].imagePreviewUrl;
            }
            pendingVariations[idx] = varData;
        } else {
            pendingVariations.push(varData);
        }
        closeVariationModal();
        renderPendingVariations();
        return;
    }

    // ── EDIT MODE: save to API immediately ───────────────────────────────
    const formData = new FormData();
    formData.set('name',       name);
    formData.set('sku',        document.getElementById('varSku').value);
    formData.set('price',      document.getElementById('varPrice').value || 0);
    formData.set('sale_price', document.getElementById('varSalePrice').value);
    formData.set('stock',      document.getElementById('varStock').value || 0);
    formData.set('is_active',  document.getElementById('varActive').checked ? '1' : '0');
    if (imgFile) formData.set('image', imgFile);

    try {
        if (editingVariationId) {
            await api(`/variations/${editingVariationId}`, 'PUT', formData, true);
            showAlert('Variation updated!');
        } else {
            await api(`/products/${productId}/variations`, 'POST', formData, true);
            showAlert('Variation added!');
        }
        closeVariationModal();
        reloadVariations();
    } catch(e) {}
}

async function deleteVariation(id) {
    if (!confirm('Delete this variation?')) return;
    try {
        await api(`/variations/${id}`, 'DELETE');
        showAlert('Variation deleted');
        reloadVariations();
    } catch(e) {}
}

// Close modal on overlay click
document.getElementById('varModalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeVariationModal();
});

// ─── Delete existing product image (calls real API) ───────────────────────
async function deleteProductImage(imageId) {
    if (!confirm('Permanently delete this image? This cannot be undone.')) return;
    try {
        await api(`/product-images/${imageId}`, 'DELETE');
        // Remove from DOM only after confirmed server deletion
        const el = document.getElementById(`img-${imageId}`);
        if (el) el.remove();
        showAlert('Image deleted');
    } catch(e) {
        showAlert('Failed to delete image. Please try again.', 'error');
    }
}

// ─── Init ─────────────────────────────────────────────────────────────────
loadCategories().then(() => loadProduct());

// ─── Quill rich-text editor (no API key needed) ────────
if (typeof Quill !== 'undefined') {
    const quill = new Quill('#description', {
        theme: 'snow',
        placeholder: 'Write full product description here...',
        modules: {
            toolbar: [
                [{ header: [2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link'],
                ['clean']
            ]
        }
    });
    // Sync Quill content to textarea on save
    document.getElementById('productForm').addEventListener('submit', () => {
        document.getElementById('description').value = quill.root.innerHTML;
    }, true);
    // Pre-fill on load
    const origLoad = loadProduct;
    loadProduct = async function() {
        await origLoad();
        const val = document.getElementById('description').value;
        if (val) quill.root.innerHTML = val;
    };
}
</script>

<?php include 'includes/footer.php'; ?>
