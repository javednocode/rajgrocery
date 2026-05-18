<?php $pageTitle = 'Banners'; include 'includes/header.php'; ?>

<div class="toolbar">
    <h3 style="font-size:16px;">Homepage Banners</h3>
    <button class="btn btn-primary" onclick="showBannerModal()">+ Add Banner</button>
</div>

<div class="card"><div class="card-body" style="padding:0;">
    <table class="data-table">
        <thead><tr><th>Image</th><th>Title</th><th>Position</th><th>Link</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="bannersList"></tbody>
    </table>
</div></div>

<div class="modal-overlay" id="bannerModal">
    <div class="modal">
        <div class="modal-header"><h3 id="bannerModalTitle">Add Banner</h3><button class="btn btn-icon" onclick="document.getElementById('bannerModal').classList.remove('show')">✕</button></div>
        <div class="modal-body">
            <input type="hidden" id="bannerId">
            <div class="form-group"><label>Title</label><input type="text" id="bannerTitle" class="form-control"></div>
            <div class="form-group"><label>Subtitle</label><input type="text" id="bannerSubtitle" class="form-control"></div>
            <div class="form-group"><label>Image *</label><input type="file" id="bannerImage" class="form-control" accept="image/*"></div>
            <div class="form-row">
                <div class="form-group"><label>Link URL</label><input type="text" id="bannerLink" class="form-control"></div>
                <div class="form-group"><label>Button Text</label><input type="text" id="bannerBtn" class="form-control" placeholder="Shop Now"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Position</label><select id="bannerPosition" class="form-control"><option value="hero">Hero</option><option value="secondary">Secondary</option><option value="sidebar">Sidebar</option></select></div>
                <div class="form-group"><label>Sort Order</label><input type="number" id="bannerSort" class="form-control" value="0"></div>
            </div>
            <div class="form-group"><label class="form-check"><input type="checkbox" id="bannerActive" checked> Active</label></div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" onclick="document.getElementById('bannerModal').classList.remove('show')">Cancel</button>
            <button class="btn btn-primary" onclick="saveBanner()">Save Banner</button>
        </div>
    </div>
</div>

<script>
async function loadBanners() {
    try {
        const res = await api('/banners');
        document.getElementById('bannersList').innerHTML = res.data.map(b => `
            <tr>
                <td><img src="../${b.image}" style="width:120px;height:50px;border-radius:6px;object-fit:cover;"></td>
                <td><strong>${b.title||'—'}</strong><div style="font-size:12px;color:var(--admin-text-muted)">${b.subtitle||''}</div></td>
                <td><span class="badge badge-primary">${b.position}</span></td>
                <td style="color:var(--admin-text-dim);font-size:13px;">${b.link||'—'}</td>
                <td>${b.is_active==1?'<span class="badge badge-success">Active</span>':'<span class="badge badge-danger">Inactive</span>'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editBanner(${b.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('banners',${b.id},'Banner')">Delete</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No banners yet</td></tr>';
    } catch(e) {}
}

function showBannerModal() { document.getElementById('bannerId').value=''; document.getElementById('bannerModalTitle').textContent='Add Banner'; document.getElementById('bannerModal').classList.add('show'); }

async function editBanner(id) {
    // Simple edit - just open modal and let user re-enter data
    document.getElementById('bannerId').value = id;
    document.getElementById('bannerModalTitle').textContent = 'Edit Banner';
    document.getElementById('bannerModal').classList.add('show');
}

async function saveBanner() {
    const id = document.getElementById('bannerId').value;
    const fd = new FormData();
    fd.set('title', document.getElementById('bannerTitle').value);
    fd.set('subtitle', document.getElementById('bannerSubtitle').value);
    fd.set('link', document.getElementById('bannerLink').value);
    fd.set('button_text', document.getElementById('bannerBtn').value);
    fd.set('position', document.getElementById('bannerPosition').value);
    fd.set('sort_order', document.getElementById('bannerSort').value);
    fd.set('is_active', document.getElementById('bannerActive').checked ? '1' : '0');
    if (document.getElementById('bannerImage').files[0]) fd.set('image', document.getElementById('bannerImage').files[0]);

    try {
        await api(`/banners${id?'/'+id:''}`, id?'PUT':'POST', fd, true);
        showAlert(id?'Banner updated!':'Banner created!');
        document.getElementById('bannerModal').classList.remove('show');
        loadBanners();
    } catch(e) {}
}

loadBanners();
</script>

<?php include 'includes/footer.php'; ?>
