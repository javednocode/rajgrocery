<?php $pageTitle = 'Static Pages'; include 'includes/header.php'; ?>

<div class="toolbar">
    <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" placeholder="Search pages...">
    </div>
    <button class="btn btn-outline btn-sm" onclick="seedDefaults()" style="margin-right:8px;">Seed Default Pages</button>
    <button class="btn btn-primary" onclick="openCreateModal()">+ New Page</button>
</div>

<div class="card"><div class="card-body" style="padding:0;">
    <table class="data-table">
        <thead><tr><th>Title</th><th>Slug (URL)</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead>
        <tbody id="pagesList"></tbody>
    </table>
</div></div>

<!-- Create/Edit Modal -->
<div id="pageModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9000;overflow-y:auto;padding:20px;">
    <div style="max-width:860px;margin:20px auto;background:var(--admin-surface);border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.4);">
        <div style="padding:20px 24px;border-bottom:1px solid var(--admin-border);display:flex;align-items:center;justify-content:space-between;">
            <h3 id="modalTitle" style="margin:0;font-size:16px;color:var(--admin-text);">Edit Page</h3>
            <button onclick="closeModal()" style="background:none;border:none;cursor:pointer;color:var(--admin-text-muted);font-size:20px;line-height:1;">&times;</button>
        </div>
        <div style="padding:24px;display:grid;gap:16px;">
            <input type="hidden" id="pageId">

            <div class="form-group" style="margin:0;">
                <label>Page Title *</label>
                <input type="text" id="pageTitle" class="form-control" placeholder="e.g. Privacy Policy" oninput="autoSlug()">
            </div>

            <div class="form-group" style="margin:0;">
                <label>URL Slug *</label>
                <div style="display:flex;gap:8px;align-items:center;">
                    <span style="color:var(--admin-text-dim);font-size:13px;">/page/</span>
                    <input type="text" id="pageSlug" class="form-control" placeholder="e.g. privacy-policy" style="flex:1;">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group" style="margin:0;">
                    <label>Meta Title (SEO)</label>
                    <input type="text" id="pageMetaTitle" class="form-control" placeholder="Leave blank to use page title">
                </div>
                <div class="form-group" style="margin:0;">
                    <label>Status</label>
                    <select id="pageActive" class="form-control">
                        <option value="1">Active (visible)</option>
                        <option value="0">Draft (hidden)</option>
                    </select>
                </div>
            </div>

            <div class="form-group" style="margin:0;">
                <label>Meta Description (SEO)</label>
                <textarea id="pageMetaDesc" class="form-control" rows="2" placeholder="Optional short description for search engines"></textarea>
            </div>

            <div class="form-group" style="margin:0;">
                <label style="margin-bottom:8px;display:block;">Page Content</label>
                <!-- Toolbar -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;padding:8px;background:var(--admin-surface-2);border:1px solid var(--admin-border);border-bottom:none;border-radius:8px 8px 0 0;">
                    <button type="button" onclick="fmt('bold')" title="Bold" style="padding:5px 10px;border:1px solid var(--admin-border);border-radius:4px;background:var(--admin-surface);cursor:pointer;font-weight:700;color:var(--admin-text);font-size:13px;">B</button>
                    <button type="button" onclick="fmt('italic')" title="Italic" style="padding:5px 10px;border:1px solid var(--admin-border);border-radius:4px;background:var(--admin-surface);cursor:pointer;font-style:italic;color:var(--admin-text);font-size:13px;">I</button>
                    <button type="button" onclick="fmt('underline')" title="Underline" style="padding:5px 10px;border:1px solid var(--admin-border);border-radius:4px;background:var(--admin-surface);cursor:pointer;text-decoration:underline;color:var(--admin-text);font-size:13px;">U</button>
                    <span style="width:1px;background:var(--admin-border);margin:2px 4px;"></span>
                    <button type="button" onclick="fmtBlock('h2')" title="Heading 2" style="padding:5px 10px;border:1px solid var(--admin-border);border-radius:4px;background:var(--admin-surface);cursor:pointer;color:var(--admin-text);font-size:13px;">H2</button>
                    <button type="button" onclick="fmtBlock('h3')" title="Heading 3" style="padding:5px 10px;border:1px solid var(--admin-border);border-radius:4px;background:var(--admin-surface);cursor:pointer;color:var(--admin-text);font-size:13px;">H3</button>
                    <button type="button" onclick="fmtBlock('p')" title="Paragraph" style="padding:5px 10px;border:1px solid var(--admin-border);border-radius:4px;background:var(--admin-surface);cursor:pointer;color:var(--admin-text);font-size:13px;">P</button>
                    <span style="width:1px;background:var(--admin-border);margin:2px 4px;"></span>
                    <button type="button" onclick="fmt('insertUnorderedList')" title="Bullet List" style="padding:5px 10px;border:1px solid var(--admin-border);border-radius:4px;background:var(--admin-surface);cursor:pointer;color:var(--admin-text);font-size:13px;">• List</button>
                    <button type="button" onclick="fmt('insertOrderedList')" title="Numbered List" style="padding:5px 10px;border:1px solid var(--admin-border);border-radius:4px;background:var(--admin-surface);cursor:pointer;color:var(--admin-text);font-size:13px;">1. List</button>
                    <span style="width:1px;background:var(--admin-border);margin:2px 4px;"></span>
                    <button type="button" onclick="insertLink()" title="Insert Link" style="padding:5px 10px;border:1px solid var(--admin-border);border-radius:4px;background:var(--admin-surface);cursor:pointer;color:#3B82F6;font-size:13px;">🔗 Link</button>
                    <button type="button" onclick="insertHR()" title="Divider" style="padding:5px 10px;border:1px solid var(--admin-border);border-radius:4px;background:var(--admin-surface);cursor:pointer;color:var(--admin-text);font-size:13px;">— Line</button>
                </div>
                <div id="pageEditor"
                     contenteditable="true"
                     style="min-height:320px;padding:18px;border:1px solid var(--admin-border);border-radius:0 0 8px 8px;
                            background:white;color:#111;font-family:'Inter',sans-serif;font-size:14px;
                            line-height:1.75;outline:none;overflow-y:auto;">
                </div>
            </div>

            <div style="display:flex;gap:12px;justify-content:flex-end;padding-top:8px;border-top:1px solid var(--admin-border);">
                <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="savePage()" id="saveBtn">Save Page</button>
            </div>
        </div>
    </div>
</div>

<script>
let slugEdited = false;

async function loadPages() {
    try {
        const res = await api('/pages');
        const pages = res.data || [];
        const input = document.getElementById('searchInput').value.toLowerCase();
        const filtered = input ? pages.filter(p => p.title.toLowerCase().includes(input) || p.slug.includes(input)) : pages;
        document.getElementById('pagesList').innerHTML = filtered.map(p => `
            <tr>
                <td><strong>${p.title}</strong></td>
                <td><code style="font-size:12px;background:var(--admin-surface-2);padding:2px 6px;border-radius:4px;">/page/${p.slug}</code></td>
                <td>${p.is_active == 1 ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-warning">Draft</span>'}</td>
                <td style="color:var(--admin-text-dim)">${formatDate(p.updated_at)}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="openEditModal(${p.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('pages',${p.id},'${p.title.replace(/'/g,"\\'")}')">Delete</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--admin-text-muted)">No pages yet. Click "Seed Default Pages" to add standard pages.</td></tr>';
    } catch(e) { console.error(e); }
}

document.getElementById('searchInput').addEventListener('input', loadPages);

function autoSlug() {
    if (slugEdited) return;
    const title = document.getElementById('pageTitle').value;
    document.getElementById('pageSlug').value = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}
document.getElementById('pageSlug').addEventListener('input', () => { slugEdited = true; });

function openCreateModal() {
    slugEdited = false;
    document.getElementById('pageId').value = '';
    document.getElementById('pageTitle').value = '';
    document.getElementById('pageSlug').value = '';
    document.getElementById('pageMetaTitle').value = '';
    document.getElementById('pageMetaDesc').value = '';
    document.getElementById('pageActive').value = '1';
    document.getElementById('pageEditor').innerHTML = '<p>Start writing your page content here...</p>';
    document.getElementById('modalTitle').textContent = 'Create New Page';
    document.getElementById('saveBtn').textContent = 'Create Page';
    document.getElementById('pageModal').style.display = 'block';
}

async function openEditModal(id) {
    slugEdited = true;
    try {
        const res = await api('/pages/' + id);
        const p = res.data;
        document.getElementById('pageId').value = p.id;
        document.getElementById('pageTitle').value = p.title;
        document.getElementById('pageSlug').value = p.slug;
        document.getElementById('pageMetaTitle').value = p.meta_title || '';
        document.getElementById('pageMetaDesc').value = p.meta_description || '';
        document.getElementById('pageActive').value = p.is_active ? '1' : '0';
        document.getElementById('pageEditor').innerHTML = p.content || '';
        document.getElementById('modalTitle').textContent = 'Edit Page: ' + p.title;
        document.getElementById('saveBtn').textContent = 'Save Changes';
        document.getElementById('pageModal').style.display = 'block';
    } catch(e) { showAlert('Failed to load page', 'error'); }
}

function closeModal() {
    document.getElementById('pageModal').style.display = 'none';
}

async function savePage() {
    const id = document.getElementById('pageId').value;
    const title = document.getElementById('pageTitle').value.trim();
    const slug = document.getElementById('pageSlug').value.trim();
    const content = document.getElementById('pageEditor').innerHTML;

    if (!title) { showAlert('Title is required', 'error'); return; }
    if (!slug)  { showAlert('Slug is required', 'error'); return; }

    const data = {
        title,
        slug,
        content,
        meta_title: document.getElementById('pageMetaTitle').value || title,
        meta_description: document.getElementById('pageMetaDesc').value,
        is_active: document.getElementById('pageActive').value,
    };

    try {
        if (id) {
            await api('/pages/' + id, 'POST', data);
            showAlert('Page updated successfully!');
        } else {
            await api('/pages', 'POST', data);
            showAlert('Page created successfully!');
        }
        closeModal();
        loadPages();
    } catch(e) { showAlert('Failed to save page. Please try again.', 'error'); }
}

async function seedDefaults() {
    try {
        await api('/pages/seed', 'POST', {});
        showAlert('Default pages seeded! (Privacy Policy, Terms, Returns, Delivery Info, FAQ)');
        loadPages();
    } catch(e) { showAlert('Seeding failed', 'error'); }
}

// WYSIWYG helpers
function fmt(cmd) { document.getElementById('pageEditor').focus(); document.execCommand(cmd, false, null); }
function fmtBlock(tag) { document.getElementById('pageEditor').focus(); document.execCommand('formatBlock', false, tag); }
function insertLink() {
    const url = prompt('Enter URL:');
    if (url) { document.getElementById('pageEditor').focus(); document.execCommand('createLink', false, url); }
}
function insertHR() { document.getElementById('pageEditor').focus(); document.execCommand('insertHorizontalRule', false, null); }

// Close modal on outside click
document.getElementById('pageModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

loadPages();
</script>

<?php include 'includes/footer.php'; ?>
