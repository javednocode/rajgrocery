<?php
/**
 * Admin Theme Manager — Switch active theme without code changes.
 * Themes are loaded from /themes/{theme}/theme.json
 */
$pageTitle = 'Theme Manager';
include 'includes/header.php';

// Available themes (auto-discovered from /themes/ directory)
$themesDir = __DIR__ . '/../../themes/';
$availableThemes = [];
if (is_dir($themesDir)) {
    foreach (glob($themesDir . '*/theme.json') as $themeFile) {
        $themeKey = basename(dirname($themeFile));
        $config = json_decode(file_get_contents($themeFile), true);
        if ($config) {
            $availableThemes[$themeKey] = [
                'key'         => $themeKey,
                'name'        => $config['name'] ?? ucfirst($themeKey),
                'description' => $config['description'] ?? '',
                'colors'      => $config['colors'] ?? [],
                'preview'     => "/themes/{$themeKey}/preview.png",
            ];
        }
    }
}
?>

<div class="theme-manager">
    <div class="card">
        <div class="card-header">
            <h3>Available Themes</h3>
            <small style="color:var(--admin-muted)">Switch themes without editing any code. Changes apply to the live site immediately.</small>
        </div>
        <div class="card-body">
            <div id="themeAlert" style="display:none;margin-bottom:16px;padding:12px 16px;border-radius:8px;font-size:14px;font-weight:500;"></div>
            <div class="theme-grid" id="themeGrid">
                <?php foreach ($availableThemes as $key => $theme): ?>
                <div class="theme-card" id="card-<?= htmlspecialchars($key) ?>" data-theme="<?= htmlspecialchars($key) ?>">
                    <div class="theme-preview">
                        <img src="<?= htmlspecialchars($theme['preview']) ?>"
                             alt="<?= htmlspecialchars($theme['name']) ?> preview"
                             onerror="this.onerror=null;this.src='';this.closest('.theme-preview').innerHTML='<div class=\'theme-palette\'><?php
                                 $swatches = array_slice(array_values($theme['colors']), 0, 5);
                                 foreach ($swatches as $color):
                                     echo '<span style=\'background:' . htmlspecialchars($color) . '\'></span>';
                                 endforeach;
                             ?></div>'"
                        />
                    </div>
                    <div class="theme-info">
                        <div class="theme-meta">
                            <strong><?= htmlspecialchars($theme['name']) ?></strong>
                            <span class="theme-active-badge" id="badge-<?= htmlspecialchars($key) ?>" style="display:none;">✓ Active</span>
                        </div>
                        <p><?= htmlspecialchars($theme['description']) ?></p>
                        <div class="theme-palette-row">
                            <?php foreach (array_slice($theme['colors'], 0, 6) as $name => $color): ?>
                            <span class="theme-swatch" style="background:<?= htmlspecialchars($color) ?>" title="<?= htmlspecialchars($name) ?>: <?= htmlspecialchars($color) ?>"></span>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <div class="theme-actions">
                        <button class="btn btn-outline btn-sm" onclick="previewTheme('<?= htmlspecialchars($key) ?>')">Preview</button>
                        <button class="btn btn-primary btn-sm" onclick="activateTheme('<?= htmlspecialchars($key) ?>')">Activate</button>
                    </div>
                </div>
                <?php endforeach; ?>
                <?php if (empty($availableThemes)): ?>
                <div style="padding:40px;text-align:center;color:var(--admin-muted);">
                    <p>No themes found in <code>/themes/</code> directory.</p>
                    <p style="margin-top:8px;font-size:13px;">Create a folder under <code>/themes/your-theme/theme.json</code> to add a theme.</p>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Upload Custom Theme -->
    <div class="card" style="margin-top:24px;">
        <div class="card-header">
            <h3>Developer: Add Custom Theme</h3>
        </div>
        <div class="card-body">
            <p style="color:var(--admin-muted);font-size:14px;margin-bottom:16px;">
                To create a new theme, add a folder to <code>/themes/your-theme-name/</code> containing:
            </p>
            <ul style="color:var(--admin-muted);font-size:14px;line-height:2;padding-left:20px;">
                <li><code>theme.json</code> — Colors, fonts, spacing configuration</li>
                <li><code>preview.png</code> — Theme thumbnail (400×250px)</li>
            </ul>
            <a href="https://docs.example.com/theme-development" target="_blank" class="btn btn-outline btn-sm" style="margin-top:12px;">
                📖 Theme Development Guide
            </a>
        </div>
    </div>
</div>

<style>
.theme-manager { max-width: 1000px; }
.theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
}
.theme-card {
    border: 2px solid var(--admin-border);
    border-radius: 16px;
    overflow: hidden;
    transition: border-color .2s, box-shadow .2s;
    background: var(--admin-surface);
}
.theme-card:hover { border-color: var(--admin-primary); box-shadow: 0 4px 24px rgba(59,183,126,.12); }
.theme-card.active { border-color: var(--admin-primary); box-shadow: 0 0 0 3px rgba(59,183,126,.15); }
.theme-preview {
    height: 160px;
    background: #F0F4F8;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.theme-preview img { width: 100%; height: 100%; object-fit: cover; }
.theme-palette { display: flex; width: 100%; height: 100%; }
.theme-palette span { flex: 1; }
.theme-info { padding: 16px; }
.theme-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.theme-meta strong { font-size: 15px; color: var(--admin-text); }
.theme-active-badge {
    background: var(--admin-primary);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 50px;
    letter-spacing: .04em;
}
.theme-info p { color: var(--admin-muted); font-size: 13px; line-height: 1.5; margin: 0 0 12px; }
.theme-palette-row { display: flex; gap: 6px; }
.theme-swatch { width: 20px; height: 20px; border-radius: 50%; border: 2px solid rgba(0,0,0,.08); display: inline-block; }
.theme-actions { padding: 12px 16px; border-top: 1px solid var(--admin-border); display: flex; gap: 8px; }
</style>

<script>
let currentActiveTheme = null;

async function loadCurrentTheme() {
    try {
        const res = await api('/settings/active_theme');
        currentActiveTheme = res.data?.setting_value || 'default';
        markActiveTheme(currentActiveTheme);
    } catch {
        markActiveTheme('default');
    }
}

function markActiveTheme(theme) {
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelectorAll('[id^="badge-"]').forEach(badge => {
        badge.style.display = 'none';
    });
    const card = document.getElementById('card-' + theme);
    const badge = document.getElementById('badge-' + theme);
    if (card) card.classList.add('active');
    if (badge) badge.style.display = 'inline';
    currentActiveTheme = theme;
}

async function activateTheme(theme) {
    try {
        showAlert('Activating theme...', 'info');
        await api('/settings', 'PUT', { active_theme: theme });
        markActiveTheme(theme);
        showAlert('✓ Theme "' + theme + '" activated! Reload the frontend to see changes.', 'success');
    } catch(e) {
        showAlert('Failed to activate theme: ' + (e.message || 'Unknown error'), 'error');
    }
}

function previewTheme(theme) {
    // Open frontend in new tab with ?theme= override
    window.open('/?preview_theme=' + encodeURIComponent(theme), '_blank');
}

function showAlert(msg, type) {
    const el = document.getElementById('themeAlert');
    el.style.display = 'block';
    el.className = '';
    if (type === 'success') {
        el.style.background = '#EAF9F0';
        el.style.color = '#1D6B47';
        el.style.border = '1px solid rgba(59,183,126,.25)';
    } else if (type === 'error') {
        el.style.background = '#FDF0F1';
        el.style.color = '#E11D48';
        el.style.border = '1px solid rgba(225,29,72,.2)';
    } else {
        el.style.background = '#EFF6FF';
        el.style.color = '#1E40AF';
        el.style.border = '1px solid rgba(30,64,175,.2)';
    }
    el.textContent = msg;
}

loadCurrentTheme();
</script>

<?php include 'includes/footer.php'; ?>
