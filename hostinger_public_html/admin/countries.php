<?php $pageTitle = 'Countries'; include 'includes/header.php'; ?>

<div class="toolbar">
    <h3 style="font-size:16px;">Marketplace Countries</h3>
    <button class="btn btn-primary" onclick="showCountryModal()">+ Add Country</button>
</div>

<div class="card" style="margin-bottom:16px;">
    <div class="card-body" style="font-size:13px;color:var(--admin-text-muted);line-height:1.7;">
        Each country is a separate storefront world. Assign products and categories to countries from their edit
        screens, and target hero banners per country from the Banners page. The <strong>default</strong> country is
        what new visitors see first. Storefront shows only active countries.
    </div>
</div>

<div class="card">
    <div class="card-body" style="padding:0;">
        <table class="data-table">
            <thead><tr><th>Flag</th><th>Name</th><th>Code</th><th>Currency</th><th>Products</th><th>Categories</th><th>Default</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="countriesList"></tbody>
        </table>
    </div>
</div>

<!-- Country Modal -->
<div class="modal-overlay" id="countryModal">
    <div class="modal" style="max-width:640px;">
        <div class="modal-header"><h3 id="ctyModalTitle">Add Country</h3><button class="btn btn-icon" onclick="closeCountryModal()"></button></div>
        <div class="modal-body">
            <form id="countryForm">
                <input type="hidden" id="ctyId">
                <div class="form-row">
                    <div class="form-group"><label>Name *</label><input type="text" id="ctyName" class="form-control" placeholder="e.g. Turkey" required></div>
                    <div class="form-group"><label>Code *</label><input type="text" id="ctyCode" class="form-control" placeholder="e.g. tr" maxlength="8"></div>
                    <div class="form-group"><label>Flag (emoji)</label><input type="text" id="ctyFlag" class="form-control" placeholder="🇹🇷"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Currency symbol</label><input type="text" id="ctyCurSym" class="form-control" placeholder="₺"></div>
                    <div class="form-group"><label>Currency code</label><input type="text" id="ctyCurCode" class="form-control" placeholder="TRY" maxlength="8"></div>
                    <div class="form-group"><label>Sort order</label><input type="number" id="ctySort" class="form-control" value="0"></div>
                </div>
                <div class="form-group"><label>Headline (storefront hero)</label><input type="text" id="ctyHeadline" class="form-control" placeholder="From the bazaars of Anatolia."></div>
                <div class="form-group"><label>Subtext</label><textarea id="ctySubtext" class="form-control" rows="2" placeholder="Short editorial line shown under the headline"></textarea></div>
                <div class="form-group"><label>Search suggestions (comma separated)</label><input type="text" id="ctySugg" class="form-control" placeholder="Baklava, Olives, Turkish tea"></div>
                <div class="form-group"><label>Delivery information</label><input type="text" id="ctyDelivery" class="form-control" placeholder="Delivery across Turkey in 1–3 working days."></div>
                <div class="form-row">
                    <div class="form-group"><label>Contact email</label><input type="email" id="ctyEmail" class="form-control"></div>
                    <div class="form-group"><label>Contact phone</label><input type="text" id="ctyPhone" class="form-control"></div>
                </div>
                <div class="form-group"><label>Contact address</label><input type="text" id="ctyAddress" class="form-control"></div>
                <div class="seo-section">
                    <h4>SEO</h4>
                    <div class="form-group"><label>Meta title</label><input type="text" id="ctyMetaTitle" class="form-control"></div>
                    <div class="form-group"><label>Meta description</label><textarea id="ctyMetaDesc" class="form-control" rows="2"></textarea></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-check"><input type="checkbox" id="ctyActive" checked> Active</label></div>
                    <div class="form-group"><label class="form-check"><input type="checkbox" id="ctyDefault"> Default country</label></div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeCountryModal()">Cancel</button>
            <button class="btn btn-primary" onclick="saveCountry()">Save Country</button>
        </div>
    </div>
</div>

<script>
let countriesCache = [];

async function loadCountries() {
    try {
        const res = await api('/countries?all=1');
        countriesCache = res.data || [];
        document.getElementById('countriesList').innerHTML = countriesCache.map(c => `
            <tr style="opacity:${c.is_active==1?'1':'0.55'}">
                <td style="font-size:22px;">${c.flag || '—'}</td>
                <td><strong>${c.name}</strong></td>
                <td style="color:var(--admin-text-muted)">${c.code}</td>
                <td>${c.currency_symbol || ''} ${c.currency_code || ''}</td>
                <td>${c.product_count || 0}</td>
                <td>${c.category_count || 0}</td>
                <td>${c.is_default==1
                    ? '<span class="badge badge-primary">Default</span>'
                    : `<button class="btn btn-outline btn-sm" onclick="makeDefault(${c.id})">Make default</button>`}</td>
                <td>${c.is_active==1?'<span class="badge badge-success">Active</span>':'<span class="badge badge-danger">Inactive</span>'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editCountry(${c.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" data-id="${c.id}" data-name="${(c.name||'').replace(/"/g,'&quot;')}" onclick="confirmDeleteCountry(this)">Delete</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No countries yet</td></tr>';
    } catch(e) { console.error('loadCountries error', e); }
}

function showCountryModal(id) {
    document.getElementById('countryModal').classList.add('show');
    if (!id) {
        document.getElementById('countryForm').reset();
        document.getElementById('ctyId').value = '';
        document.getElementById('ctyModalTitle').textContent = 'Add Country';
    }
}
function closeCountryModal() { document.getElementById('countryModal').classList.remove('show'); }

function editCountry(id) {
    const c = countriesCache.find(x => x.id == id);
    if (!c) return;
    document.getElementById('ctyId').value = c.id;
    document.getElementById('ctyName').value = c.name || '';
    document.getElementById('ctyCode').value = c.code || '';
    document.getElementById('ctyFlag').value = c.flag || '';
    document.getElementById('ctyCurSym').value = c.currency_symbol || '';
    document.getElementById('ctyCurCode').value = c.currency_code || '';
    document.getElementById('ctySort').value = c.sort_order || 0;
    document.getElementById('ctyHeadline').value = c.headline || '';
    document.getElementById('ctySubtext').value = c.subtext || '';
    document.getElementById('ctySugg').value = c.suggestions || '';
    document.getElementById('ctyDelivery').value = c.delivery_info || '';
    document.getElementById('ctyEmail').value = c.contact_email || '';
    document.getElementById('ctyPhone').value = c.contact_phone || '';
    document.getElementById('ctyAddress').value = c.contact_address || '';
    document.getElementById('ctyMetaTitle').value = c.meta_title || '';
    document.getElementById('ctyMetaDesc').value = c.meta_description || '';
    document.getElementById('ctyActive').checked = c.is_active == 1;
    document.getElementById('ctyDefault').checked = c.is_default == 1;
    document.getElementById('ctyModalTitle').textContent = 'Edit Country';
    showCountryModal(id);
}

async function saveCountry() {
    const id = document.getElementById('ctyId').value;
    const payload = {
        name: document.getElementById('ctyName').value,
        code: document.getElementById('ctyCode').value.toLowerCase().trim(),
        flag: document.getElementById('ctyFlag').value,
        currency_symbol: document.getElementById('ctyCurSym').value,
        currency_code: document.getElementById('ctyCurCode').value,
        sort_order: document.getElementById('ctySort').value,
        headline: document.getElementById('ctyHeadline').value,
        subtext: document.getElementById('ctySubtext').value,
        suggestions: document.getElementById('ctySugg').value,
        delivery_info: document.getElementById('ctyDelivery').value,
        contact_email: document.getElementById('ctyEmail').value,
        contact_phone: document.getElementById('ctyPhone').value,
        contact_address: document.getElementById('ctyAddress').value,
        meta_title: document.getElementById('ctyMetaTitle').value,
        meta_description: document.getElementById('ctyMetaDesc').value,
        is_active: document.getElementById('ctyActive').checked ? 1 : 0,
        is_default: document.getElementById('ctyDefault').checked ? 1 : 0,
    };
    try {
        await api(`/countries${id ? '/' + id : ''}`, id ? 'PUT' : 'POST', payload);
        showAlert(id ? 'Country updated!' : 'Country created!');
        closeCountryModal();
        loadCountries();
    } catch(e) { showAlert('Error: ' + e.message, 'danger'); }
}

async function makeDefault(id) {
    try {
        await api(`/countries/${id}/default`, 'POST', {});
        showAlert('Default country updated');
        loadCountries();
    } catch(e) { showAlert('Error: ' + e.message, 'danger'); }
}

async function confirmDeleteCountry(btn) {
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    if (!confirm('Delete country "' + name + '"?\nProducts and categories assigned to it will be unlinked (not deleted).\n\nThis cannot be undone.')) return;
    btn.disabled = true; btn.textContent = '...';
    try {
        await api('/countries/' + id, 'DELETE');
        showAlert('Country deleted');
        loadCountries();
    } catch(e) {
        btn.disabled = false; btn.textContent = 'Delete';
        showAlert('Delete failed: ' + e.message, 'danger');
    }
}

loadCountries();
</script>

<?php include 'includes/footer.php'; ?>
