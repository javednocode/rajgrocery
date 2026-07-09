<?php $pageTitle = 'Categories'; include 'includes/header.php'; ?>

<!-- Country context banner -->
<div id="catCountryBanner" style="display:none;align-items:center;gap:10px;padding:10px 16px;border-radius:10px;margin-bottom:14px;background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(99,102,241,.06));border:1.5px solid rgba(37,99,235,.15);font-size:13px;">
    <span style="font-weight:700;color:var(--admin-text-muted);">Viewing:</span>
    <span id="catCountryName" style="font-weight:800;color:var(--admin-primary);font-size:14px;"></span>
    <span style="flex:1"></span>
    <a href="javascript:void(0)" onclick="setAdminCountry(null)" style="font-size:12px;color:var(--admin-text-muted);text-decoration:none;">× Show All Countries</a>
</div>
<div class="toolbar">
    <h3 style="font-size:16px;">Manage Categories</h3>
    <button class="btn btn-primary" onclick="showCategoryModal()">+ Add Category</button>
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
                <div class="form-group"><label>Image</label><input type="file" id="catImage" class="form-control" accept="image/*"></div>
                <div class="form-group"><label>Icon (emoji)</label><input type="text" id="catIcon" class="form-control" placeholder=""></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-check"><input type="checkbox" id="catActive" checked> Active</label></div>
                    <div class="form-group"><label class="form-check"><input type="checkbox" id="catFeatured"> Featured</label></div>
                </div>
                <div class="form-group">
                    <label>Countries</label>
                    <p style="font-size:12px;color:var(--admin-text-muted);margin:0 0 8px;">Which marketplaces show this category.</p>
                    <div id="catCountries"></div>
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
        const c = getAdminCountry();
        // Update banner
        const banner = document.getElementById('catCountryBanner');
        if (c) {
            document.getElementById('catCountryName').textContent = (c.flag||'') + ' ' + c.name;
            banner.style.display = 'flex';
        } else {
            banner.style.display = 'none';
        }
        const url = c ? '/categories?admin=1&country_id=' + c.id : '/categories?admin=1';
        const res = await api(url);
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

async function loadCatCountryOptions() {
    try {
        const res = await api('/countries?all=1');
        document.getElementById('catCountries').innerHTML = (res.data || []).map(c =>
            `<label class="form-check" style="margin-bottom:6px;"><input type="checkbox" value="${c.id}" class="cat-cty-check"> ${c.flag || ''} ${c.name}</label>`
        ).join('') || '<span style="font-size:12px;color:var(--admin-text-muted)">No countries yet.</span>';
    } catch(e) {}
}

function flattenCats(cats, prefix='') {
    let r=[]; cats.forEach(c => { r.push({...c,prefix}); if(c.children?.length) r.push(...flattenCats(c.children, prefix+'— ')); }); return r;
}

function showCategoryModal(id) {
    document.getElementById('categoryModal').classList.add('show');
    if (!id) { document.getElementById('categoryForm').reset(); document.getElementById('catId').value=''; document.getElementById('modalTitle').textContent='Add Category'; }
}
function closeCategoryModal() { document.getElementById('categoryModal').classList.remove('show'); }

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
        document.querySelectorAll('.cat-cty-check').forEach(cb => cb.checked = false);
        (c.country_ids || []).forEach(cid => {
            const cb = document.querySelector(`input[value="${cid}"].cat-cty-check`);
            if (cb) cb.checked = true;
        });
        document.getElementById('modalTitle').textContent = 'Edit Category';
        showCategoryModal(id);
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
    const ctys = [...document.querySelectorAll('.cat-cty-check:checked')].map(c => c.value);
    formData.set('countries', JSON.stringify(ctys));

    try {
        // Always POST — PHP cannot read $_POST/$_FILES for PUT+multipart
        if (id) formData.set('_method', 'PUT');
        await api(`/categories${id ? '/' + id : ''}`, 'POST', formData, true);
        showAlert(id ? 'Category updated!' : 'Category created!');
        closeCategoryModal();
        loadCategories();
loadCatCountryOptions();
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


document.getElementById('catName').addEventListener('input', function() {
    document.getElementById('catSlug').value = generateSlug(this.value);
});
loadCategories();


</script>

<?php include 'includes/footer.php'; ?>
