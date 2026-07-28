<?php
$pageTitle = 'Product Reviews';
require_once 'includes/header.php';
?>
<link rel="stylesheet" href="assets/admin.css?v=3">
<style>
.reviews-grid { display: grid; gap: 16px; }
.review-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: start; }
.review-card.pending { border-left: 4px solid var(--warning, #f59e0b); }
.review-card.approved { border-left: 4px solid var(--success, #10b981); }
.review-stars { color: #f59e0b; font-size: 18px; letter-spacing: 2px; }
.review-meta { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.review-comment { margin-top: 8px; color: var(--text); line-height: 1.6; }
.review-product-badge { display: inline-flex; align-items: center; gap: 4px; background: var(--bg-secondary, #f1f5f9); color: var(--text-muted); font-size: 11px; padding: 2px 8px; border-radius: 20px; margin-top: 6px; }
.rating-bar-row { display: flex; align-items: center; gap: 8px; margin: 4px 0; font-size: 13px; }
.rating-bar { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
.rating-bar-fill { height: 100%; background: #f59e0b; border-radius: 4px; transition: width 0.5s; }
.summary-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; display: flex; gap: 32px; align-items: center; margin-bottom: 24px; }
.big-rating { font-size: 56px; font-weight: 700; color: var(--text); line-height: 1; }
.big-rating-label { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
.filter-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.tab-btn { padding: 8px 18px; border-radius: 8px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text-muted); cursor: pointer; font-size: 14px; transition: all .2s; }
.tab-btn.active { background: var(--primary, #6366f1); color: #fff; border-color: var(--primary, #6366f1); }
.review-actions { display: flex; flex-direction: column; gap: 6px; min-width: 90px; }
.badge-pending  { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
.badge-approved { background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
.pagination { display: flex; gap: 8px; margin-top: 24px; justify-content: center; }
.page-btn { padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border); background: var(--card-bg); cursor: pointer; font-size: 13px; }
.page-btn.active { background: var(--primary, #6366f1); color: #fff; border-color: var(--primary, #6366f1); }
.empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
.empty-state svg { opacity: 0.3; margin-bottom: 12px; }
</style>

<div class="admin-content">
    <!-- Summary Bar -->
    <div class="summary-card" id="summarySec" style="display:none;">
        <div style="text-align:center;">
            <div class="big-rating" id="avgRating">—</div>
            <div class="review-stars" id="avgStars">☆☆☆☆☆</div>
            <div class="big-rating-label" id="totalReviews">0 reviews</div>
        </div>
        <div style="flex:1;" id="ratingBars"></div>
    </div>

    <!-- Filters & Search -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div class="filter-tabs">
            <button class="tab-btn active" onclick="setFilter('all')">All</button>
            <button class="tab-btn" onclick="setFilter('pending')">⏳ Pending</button>
            <button class="tab-btn" onclick="setFilter('approved')">✅ Approved</button>
        </div>
        <div style="display:flex; gap:8px;">
            <input type="text" id="searchInput" placeholder="Search customer or product…" class="form-input" style="width:220px;"
                oninput="debounceSearch(this.value)">
            <select id="ratingFilter" class="form-input" onchange="loadReviews()" style="width:120px;">
                <option value="">All Ratings</option>
                <option value="5">★★★★★</option>
                <option value="4">★★★★☆</option>
                <option value="3">★★★☆☆</option>
                <option value="2">★★☆☆☆</option>
                <option value="1">★☆☆☆☆</option>
            </select>
        </div>
    </div>

    <!-- Reviews List -->
    <div class="reviews-grid" id="reviewsGrid">
        <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <p>Loading reviews…</p>
        </div>
    </div>

    <div class="pagination" id="pagination"></div>
</div>

<!-- Edit Review Modal -->
<div id="editModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center;">
    <div style="background:var(--card-bg); border-radius:16px; padding:28px; width:500px; max-width:95vw; max-height:90vh; overflow-y:auto;">
        <h3 style="margin:0 0 20px;">Edit Review</h3>
        <input type="hidden" id="editId">
        <div class="form-group">
            <label class="form-label">Customer Name</label>
            <input type="text" id="editName" class="form-input">
        </div>
        <div class="form-group">
            <label class="form-label">Rating</label>
            <select id="editRating" class="form-input">
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Comment</label>
            <textarea id="editComment" class="form-input" rows="4" style="resize:vertical;"></textarea>
        </div>
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
            <button class="btn btn-secondary" onclick="closeEdit()">Cancel</button>
            <button class="btn btn-primary" onclick="saveEdit()">Save Changes</button>
        </div>
    </div>
</div>

<script>
const token = localStorage.getItem('admin_token');
let currentFilter = 'all';
let currentPage   = 1;
let searchQuery   = '';
let searchTimer;

function setFilter(f) {
    currentFilter = f;
    currentPage   = 1;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    loadReviews();
}

function debounceSearch(q) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { searchQuery = q; currentPage = 1; loadReviews(); }, 350);
}

function starsHtml(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

async function loadSummary() {
    try {
        const res  = await fetch(`/api/reviews?status=approved&limit=1`, { headers: { Authorization: 'Bearer ' + token } });
        const json = await res.json();
        // Load full stats
        const statsRes = await fetch(`/api/reviews?status=all&limit=1000`, { headers: { Authorization: 'Bearer ' + token } });
        // Just show totals from list meta
        if (json.meta) {
            document.getElementById('summarySec').style.display = 'flex';
        }
    } catch(e) {}
}

async function loadReviews() {
    const grid   = document.getElementById('reviewsGrid');
    const rating = document.getElementById('ratingFilter').value;
    let url      = `/api/reviews?status=${currentFilter}&page=${currentPage}&limit=15`;
    if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
    if (rating)      url += `&rating=${rating}`;

    grid.innerHTML = '<div class="empty-state"><p>Loading…</p></div>';

    try {
        const res  = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
        const json = await res.json();
        if (!json.success || !json.data?.length) {
            grid.innerHTML = `<div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <p>No reviews found</p></div>`;
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        grid.innerHTML = json.data.map(r => `
            <div class="review-card ${r.is_approved == 1 ? 'approved' : 'pending'}">
                <div style="text-align:center; min-width:60px;">
                    <div style="font-size:28px; line-height:1; font-weight:700; color:var(--text);">${r.rating}</div>
                    <div class="review-stars" style="font-size:12px;">${starsHtml(r.rating)}</div>
                </div>
                <div>
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <strong>${escHtml(r.customer_name)}</strong>
                        <span class="${r.is_approved == 1 ? 'badge-approved' : 'badge-pending'}">
                            ${r.is_approved == 1 ? '✅ Approved' : '⏳ Pending'}
                        </span>
                    </div>
                    <div class="review-meta">${new Date(r.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</div>
                    ${r.product_name ? `<div class="review-product-badge">📦 ${escHtml(r.product_name)}</div>` : ''}
                    <div class="review-comment">${r.comment ? escHtml(r.comment) : '<em style="color:var(--text-muted)">No comment</em>'}</div>
                </div>
                <div class="review-actions">
                    ${r.is_approved == 0
                        ? `<button class="btn btn-success btn-sm" onclick="approveReview(${r.id}, this)">✅ Approve</button>
                           <button class="btn btn-danger btn-sm" onclick="deleteReview(${r.id}, this)">🗑 Delete</button>`
                        : `<button class="btn btn-secondary btn-sm" onclick="rejectReview(${r.id}, this)">⛔ Unpublish</button>
                           <button class="btn btn-danger btn-sm" onclick="deleteReview(${r.id}, this)">🗑 Delete</button>`
                    }
                    <button class="btn btn-secondary btn-sm" onclick="openEdit(${r.id},'${escHtml(r.customer_name).replace(/'/g,"\\'")}','${r.rating}',\`${(r.comment||'').replace(/`/g,"\\`")}\`)">✏️ Edit</button>
                </div>
            </div>`).join('');

        // Pagination
        const { total, per_page, last_page } = json.meta || {};
        renderPagination(currentPage, last_page || 1, total);
    } catch(e) {
        grid.innerHTML = '<div class="empty-state"><p>Failed to load reviews</p></div>';
    }
}

function renderPagination(page, lastPage, total) {
    const el = document.getElementById('pagination');
    if (lastPage <= 1) { el.innerHTML = ''; return; }
    let html = '';
    for (let i = 1; i <= lastPage; i++) {
        html += `<button class="page-btn${i===page?' active':''}" onclick="goPage(${i})">${i}</button>`;
    }
    el.innerHTML = `<span style="font-size:13px;color:var(--text-muted);">${total} reviews</span>` + html;
}

function goPage(p) { currentPage = p; loadReviews(); }

async function approveReview(id, btn) {
    btn.disabled = true;
    await fetch(`/api/reviews/${id}/approve`, { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    loadReviews();
}

async function rejectReview(id, btn) {
    btn.disabled = true;
    await fetch(`/api/reviews/${id}/reject`, { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    loadReviews();
}

async function deleteReview(id, btn) {
    if (!confirm('Delete this review permanently?')) return;
    btn.disabled = true;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
    loadReviews();
}

function openEdit(id, name, rating, comment) {
    document.getElementById('editId').value      = id;
    document.getElementById('editName').value    = name;
    document.getElementById('editRating').value  = rating;
    document.getElementById('editComment').value = comment;
    document.getElementById('editModal').style.display = 'flex';
}

function closeEdit() { document.getElementById('editModal').style.display = 'none'; }

async function saveEdit() {
    const id = document.getElementById('editId').value;
    await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
            customer_name: document.getElementById('editName').value,
            rating:        parseInt(document.getElementById('editRating').value),
            comment:       document.getElementById('editComment').value,
        })
    });
    closeEdit();
    loadReviews();
}

function escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

loadReviews();
</script>

<?php include 'includes/footer.php'; ?>
