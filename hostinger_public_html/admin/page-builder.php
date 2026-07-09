<?php
/**
 * Admin Page Builder — Enable/disable and reorder homepage sections.
 * No code edits required — all managed through this interface.
 */
$pageTitle = 'Page Builder';
include 'includes/header.php';

$sections = [
    ['key' => 'hero_banner',         'label' => 'Hero Banner',         'icon' => '🖼️', 'description' => 'Full-width hero with banner images/videos'],
    ['key' => 'featured_categories', 'label' => 'Featured Categories', 'icon' => '📦', 'description' => 'Grid of clickable category cards'],
    ['key' => 'best_sellers',        'label' => 'Best Sellers',        'icon' => '⭐', 'description' => 'Trending/top-selling products row'],
    ['key' => 'featured_products',   'label' => 'Featured Products',   'icon' => '🛍️', 'description' => 'Hand-picked featured products grid'],
    ['key' => 'promo_banners',       'label' => 'Promo Banners',       'icon' => '📣', 'description' => '2–3 column promotional banner cards'],
    ['key' => 'trust_section',       'label' => 'Trust Section',       'icon' => '🛡️', 'description' => 'Icons with delivery, quality and guarantee badges'],
    ['key' => 'testimonials',        'label' => 'Testimonials',        'icon' => '💬', 'description' => 'Customer review cards or carousel'],
    ['key' => 'blog_section',        'label' => 'Blog Section',        'icon' => '📝', 'description' => 'Latest blog post previews'],
    ['key' => 'instagram_feed',      'label' => 'Instagram Feed',      'icon' => '📷', 'description' => 'Instagram photo grid (requires handle in Settings)'],
    ['key' => 'newsletter',          'label' => 'Newsletter Strip',    'icon' => '✉️', 'description' => 'Email signup form with offer text'],
];
?>

<div style="max-width:780px;">
    <div class="card">
        <div class="card-header">
            <h3>Homepage Sections</h3>
            <div style="display:flex;gap:8px;">
                <button class="btn btn-outline btn-sm" onclick="saveOrder()">💾 Save Order</button>
                <button class="btn btn-primary btn-sm" onclick="saveAll()">✓ Save All Changes</button>
            </div>
        </div>
        <div class="card-body" style="padding:0;">
            <div id="sectionAlert" style="display:none;padding:12px 20px;font-size:14px;font-weight:500;border-bottom:1px solid var(--admin-border);"></div>
            <div id="sectionList">
                <?php foreach ($sections as $i => $section): ?>
                <div class="section-row" data-key="<?= htmlspecialchars($section['key']) ?>" data-order="<?= $i + 1 ?>">
                    <div class="section-drag" title="Drag to reorder">⠿</div>
                    <div class="section-icon"><?= $section['icon'] ?></div>
                    <div class="section-details">
                        <strong><?= htmlspecialchars($section['label']) ?></strong>
                        <span><?= htmlspecialchars($section['description']) ?></span>
                    </div>
                    <label class="section-toggle">
                        <input type="checkbox"
                               id="toggle-<?= htmlspecialchars($section['key']) ?>"
                               data-key="<?= htmlspecialchars($section['key']) ?>"
                               onchange="onToggle(this)"
                               checked>
                        <span class="toggle-track"></span>
                    </label>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <div class="card" style="margin-top:20px;">
        <div class="card-header"><h3>How it works</h3></div>
        <div class="card-body">
            <ul style="color:var(--admin-muted);font-size:14px;line-height:2.2;padding-left:20px;">
                <li>Toggle sections on/off using the switch on the right</li>
                <li>Drag rows to reorder which sections appear first on the homepage</li>
                <li>Changes take effect immediately after saving — no code edits required</li>
                <li>Section content (text, images) is managed in <a href="settings.php">Site Settings</a></li>
                <li>Banner images are managed in <a href="banners.php">Banner Slider</a></li>
            </ul>
        </div>
    </div>
</div>

<style>
.section-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--admin-border);
    cursor: default;
    transition: background .15s;
}
.section-row:last-child { border-bottom: none; }
.section-row:hover { background: var(--admin-hover); }
.section-row.dragging { opacity: .5; background: var(--admin-hover); }
.section-drag { font-size: 20px; color: var(--admin-muted); cursor: grab; user-select: none; }
.section-drag:active { cursor: grabbing; }
.section-icon { font-size: 22px; flex-shrink: 0; }
.section-details { flex: 1; }
.section-details strong { display: block; font-size: 14px; color: var(--admin-text); margin-bottom: 2px; }
.section-details span { font-size: 12px; color: var(--admin-muted); }

/* Toggle switch */
.section-toggle { position: relative; display: inline-block; flex-shrink: 0; }
.section-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
.toggle-track {
    display: block;
    width: 44px; height: 24px;
    background: #D1D5DB;
    border-radius: 99px;
    cursor: pointer;
    transition: background .2s;
    position: relative;
}
.toggle-track::after {
    content: '';
    position: absolute;
    top: 3px; left: 3px;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: transform .2s;
    box-shadow: 0 1px 4px rgba(0,0,0,.2);
}
.section-toggle input:checked + .toggle-track { background: var(--admin-primary, #3BB77E); }
.section-toggle input:checked + .toggle-track::after { transform: translateX(20px); }
</style>

<script>
// Load current section states from DB
async function loadSections() {
    try {
        const res = await api('/settings');
        if (!res.data) return;
        const settings = res.data;
        document.querySelectorAll('[id^="toggle-"]').forEach(toggle => {
            const key = toggle.dataset.key;
            const settingKey = 'section_enabled_' + key;
            if (settingKey in settings) {
                toggle.checked = settings[settingKey] !== '0' && settings[settingKey] !== 'false';
            }
        });
    } catch(e) { console.warn('Could not load section states', e); }
}

async function onToggle(checkbox) {
    const key = 'section_enabled_' + checkbox.dataset.key;
    const value = checkbox.checked ? '1' : '0';
    try {
        await api('/settings', 'PUT', { [key]: value });
    } catch(e) {
        showAlert('Failed to save: ' + e.message, 'error');
        checkbox.checked = !checkbox.checked; // revert
    }
}

async function saveAll() {
    const payload = {};
    document.querySelectorAll('[id^="toggle-"]').forEach(toggle => {
        payload['section_enabled_' + toggle.dataset.key] = toggle.checked ? '1' : '0';
    });
    // Save sort order too
    document.querySelectorAll('.section-row').forEach((row, i) => {
        payload['section_order_' + row.dataset.key] = String(i + 1);
    });
    try {
        await api('/settings', 'PUT', payload);
        showAlert('✓ All changes saved successfully', 'success');
    } catch(e) {
        showAlert('Failed to save: ' + e.message, 'error');
    }
}

async function saveOrder() {
    const payload = {};
    document.querySelectorAll('.section-row').forEach((row, i) => {
        payload['section_order_' + row.dataset.key] = String(i + 1);
    });
    try {
        await api('/settings', 'PUT', payload);
        showAlert('✓ Section order saved', 'success');
    } catch(e) {
        showAlert('Failed to save order: ' + e.message, 'error');
    }
}

function showAlert(msg, type) {
    const el = document.getElementById('sectionAlert');
    el.style.display = 'block';
    el.style.background = type === 'success' ? '#EAF9F0' : '#FDF0F1';
    el.style.color = type === 'success' ? '#1D6B47' : '#E11D48';
    el.textContent = msg;
    setTimeout(() => el.style.display = 'none', 4000);
}

// Simple drag-and-drop reorder
let dragEl = null;
function initDrag() {
    const list = document.getElementById('sectionList');
    list.querySelectorAll('.section-drag').forEach(handle => {
        handle.addEventListener('mousedown', e => {
            dragEl = handle.closest('.section-row');
            dragEl.classList.add('dragging');
        });
    });
    list.addEventListener('mousemove', e => {
        if (!dragEl) return;
        const rows = [...list.querySelectorAll('.section-row:not(.dragging)')];
        const nextEl = rows.find(row => {
            const rect = row.getBoundingClientRect();
            return e.clientY < rect.top + rect.height / 2;
        });
        if (nextEl) list.insertBefore(dragEl, nextEl);
        else list.appendChild(dragEl);
    });
    document.addEventListener('mouseup', () => {
        if (dragEl) dragEl.classList.remove('dragging');
        dragEl = null;
    });
}

loadSections();
initDrag();
</script>

<?php include 'includes/footer.php'; ?>
