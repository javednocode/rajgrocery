<?php $pageTitle = 'Bulk Out of Stock by List'; include 'includes/header.php'; ?>

<style>
.boos-hero {
    background: linear-gradient(135deg, rgba(192,57,43,0.10) 0%, rgba(242,169,59,0.08) 100%);
    border: 1px solid rgba(192,57,43,0.25);
    border-radius: 14px; padding: 24px 28px; margin-bottom: 24px;
}
.boos-hero h2 { font-size: 17px; font-weight: 800; margin: 0 0 6px; }
.boos-hero p  { font-size: 13px; color: var(--admin-text-muted); margin: 0; line-height: 1.6; }

#boosInput {
    width: 100%; min-height: 220px; padding: 14px; font-family: ui-monospace, monospace;
    font-size: 13px; line-height: 1.6; resize: vertical;
    background: var(--admin-bg); border: 1px solid var(--admin-border);
    border-radius: var(--admin-radius-sm); color: var(--admin-text);
}
.boos-hint { font-size: 12px; color: var(--admin-text-muted); margin-top: 8px; }

.boos-summary { display: flex; gap: 16px; margin: 20px 0; flex-wrap: wrap; }
.boos-pill { padding: 8px 16px; border-radius: 99px; font-size: 13px; font-weight: 700; }
.boos-pill.matched   { background: var(--admin-success-bg); color: var(--admin-success); }
.boos-pill.unmatched { background: var(--admin-danger-bg);  color: var(--admin-danger); }
.boos-pill.already   { background: var(--admin-warning-bg); color: var(--admin-warning); }

.boos-list { max-height: 340px; overflow-y: auto; border: 1px solid var(--admin-border); border-radius: 10px; margin-bottom: 16px; }
.boos-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--admin-border); font-size: 13px; }
.boos-row:last-child { border-bottom: none; }
.boos-row .name { font-weight: 600; }
.boos-row .meta { font-size: 11px; color: var(--admin-text-muted); }
.boos-row.unmatched-row { color: var(--admin-danger); }

.confirm-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999;
    display: none; align-items: center; justify-content: center;
}
.confirm-overlay.show { display: flex; }
.confirm-box {
    background: var(--admin-surface); border-radius: 16px; padding: 32px;
    max-width: 440px; width: 90%; text-align: center;
    border: 1px solid var(--admin-border); box-shadow: 0 24px 80px rgba(0,0,0,0.35);
}
.confirm-box h3 { font-size: 18px; margin: 0 0 10px; }
.confirm-box p  { font-size: 14px; color: var(--admin-text-muted); margin: 0 0 24px; line-height: 1.6; }
.confirm-buttons { display: flex; gap: 12px; justify-content: center; }
</style>

<div class="boos-hero">
    <h2>🔻 Bulk Out of Stock by List</h2>
    <p>Paste a list of product SKUs or exact product names (one per line) and mark all of them Out of Stock in one go — no need to hunt through paginated checkboxes. This only ever sets stock to 0; it never touches products not on your list.</p>
</div>

<div class="card"><div class="card-body">
    <label class="form-label" for="boosInput">Product SKUs or names — one per line</label>
    <textarea id="boosInput" placeholder="TEST-SKU-001&#10;AASHIRVAAD ATTA MULTIGRAIN 5kg *EXPORT PACK*&#10;...&#10;(SKU is matched first; if no SKU match, the exact product name is tried)"></textarea>
    <div class="boos-hint">Matching is exact (after trimming spaces/case) — it won't guess at partial matches, so nothing gets marked by accident.</div>

    <div style="margin-top:16px;">
        <button class="btn btn-primary" onclick="previewList()">🔍 Preview Matches</button>
    </div>

    <div id="boosResults" style="display:none;margin-top:24px;">
        <div class="boos-summary">
            <span class="boos-pill matched" id="pillMatched"></span>
            <span class="boos-pill already" id="pillAlready"></span>
            <span class="boos-pill unmatched" id="pillUnmatched"></span>
        </div>

        <div id="matchedSection">
            <h4 style="font-size:14px;margin-bottom:10px;">✓ Matched products</h4>
            <div class="boos-list" id="matchedList"></div>
        </div>

        <div id="unmatchedSection" style="display:none;">
            <h4 style="font-size:14px;margin-bottom:10px;color:var(--admin-danger);">✗ Not found — check spelling/SKU</h4>
            <div class="boos-list" id="unmatchedList"></div>
        </div>

        <button class="btn btn-primary" id="applyBtn" style="margin-top:8px;" onclick="confirmApply()">
            Mark Matched Products Out of Stock
        </button>
    </div>
</div></div>

<!-- Confirmation Dialog -->
<div class="confirm-overlay" id="confirmOverlay">
    <div class="confirm-box">
        <div style="font-size:36px;margin-bottom:12px;">⚠️</div>
        <h3>Confirm Bulk Out of Stock</h3>
        <p id="confirmText"></p>
        <div class="confirm-buttons">
            <button class="btn btn-outline" onclick="document.getElementById('confirmOverlay').classList.remove('show')">Cancel</button>
            <button class="btn btn-primary" onclick="doApply()">Yes, Mark Out of Stock</button>
        </div>
    </div>
</div>

<script>
let lastMatched = [];

async function previewList() {
    const raw = document.getElementById('boosInput').value;
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) { showAlert('Paste at least one SKU or product name first', 'danger'); return; }

    try {
        const res = await api('/products/match-list', 'POST', { lines });
        lastMatched = res.data.matched;
        renderResults(res.data);
    } catch (e) {
        showAlert('Error: ' + e.message, 'danger');
    }
}

function renderResults(data) {
    document.getElementById('boosResults').style.display = 'block';

    const alreadyZero = data.matched.filter(m => m.already_zero).length;
    document.getElementById('pillMatched').textContent   = `✓ ${data.matched_count} matched`;
    document.getElementById('pillAlready').textContent    = `${alreadyZero} already 0`;
    document.getElementById('pillUnmatched').textContent = `✗ ${data.unmatched_count} not found`;

    document.getElementById('matchedList').innerHTML = data.matched.length
        ? data.matched.map(m => `
            <div class="boos-row">
                <div>
                    <div class="name">${escHtml(m.name)}</div>
                    <div class="meta">SKU: ${escHtml(m.sku || '—')} · matched "${escHtml(m.input)}"</div>
                </div>
                <div class="meta">${m.already_zero ? 'already 0' : `stock: ${m.current_stock} → 0`}</div>
            </div>
        `).join('')
        : '<div style="padding:16px;text-align:center;color:var(--admin-text-muted);">No matches</div>';

    const unmatchedSection = document.getElementById('unmatchedSection');
    if (data.unmatched.length) {
        unmatchedSection.style.display = 'block';
        document.getElementById('unmatchedList').innerHTML = data.unmatched.map(u => `
            <div class="boos-row unmatched-row"><div class="name">${escHtml(u)}</div></div>
        `).join('');
    } else {
        unmatchedSection.style.display = 'none';
    }

    document.getElementById('applyBtn').disabled = data.matched.length === 0;
    document.getElementById('boosResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function confirmApply() {
    if (!lastMatched.length) return;
    document.getElementById('confirmText').innerHTML =
        `This will set stock to <strong>0</strong> for <strong>${lastMatched.length} product(s)</strong>.<br><br>Products not in your matched list are left completely untouched.<br><br>This cannot be undone.`;
    document.getElementById('confirmOverlay').classList.add('show');
}

async function doApply() {
    document.getElementById('confirmOverlay').classList.remove('show');
    const ids = lastMatched.map(m => m.product_id);
    const btn = document.getElementById('applyBtn');
    btn.disabled = true;
    btn.textContent = 'Applying…';

    try {
        const res = await api('/products/bulk', 'POST', { action: 'out_of_stock', ids });
        showAlert(`✅ ${res.data.affected} product(s) marked Out of Stock`);
        document.getElementById('boosInput').value = '';
        document.getElementById('boosResults').style.display = 'none';
        lastMatched = [];
    } catch (e) {
        showAlert('Error: ' + e.message, 'danger');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Mark Matched Products Out of Stock';
    }
}

function escHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
</script>

<?php include 'includes/footer.php'; ?>
