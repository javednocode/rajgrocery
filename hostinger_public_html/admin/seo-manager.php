<?php
/**
 * Admin SEO Manager — Global SEO settings, meta tags, sitemap config, and robots.txt.
 */
$pageTitle = 'SEO Manager';
include 'includes/header.php';
?>

<div style="max-width:900px;">

<!-- ── GLOBAL META ──────────────────────────────────────────────── -->
<form id="seoForm" onsubmit="saveSeo(event)">
  <div class="card" style="margin-bottom:24px;">
    <div class="card-header">
      <h3>Global SEO Settings</h3>
      <small style="color:var(--admin-muted)">Applied to every page that doesn't have a custom override.</small>
    </div>
    <div class="card-body">
      <div id="seoAlert" style="display:none;padding:12px 16px;border-radius:8px;font-size:14px;font-weight:500;margin-bottom:16px;"></div>

      <div class="form-group">
        <label class="form-label">Default Meta Title <span style="color:var(--admin-danger)">*</span></label>
        <input type="text" class="form-control" id="meta_title" name="meta_title" maxlength="70" placeholder="Your Store — Quality Products Online">
        <div class="form-hint" id="meta_title_count" style="text-align:right;font-size:11px;color:var(--admin-muted);margin-top:4px;">0 / 70 chars</div>
      </div>

      <div class="form-group">
        <label class="form-label">Default Meta Description</label>
        <textarea class="form-control" id="meta_description" name="meta_description" rows="3" maxlength="160" placeholder="Shop quality products online. Fast delivery, great prices."></textarea>
        <div class="form-hint" id="meta_desc_count" style="text-align:right;font-size:11px;color:var(--admin-muted);margin-top:4px;">0 / 160 chars</div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Focus Keyword</label>
          <input type="text" class="form-control" id="meta_keywords" name="meta_keywords" placeholder="online store, ecommerce">
        </div>
        <div class="form-group">
          <label class="form-label">Google Analytics / GA4 ID</label>
          <input type="text" class="form-control" id="google_analytics_id" name="google_analytics_id" placeholder="G-XXXXXXXXXX">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Site Description (used in Schema.org / OG tags)</label>
        <textarea class="form-control" id="site_description" name="site_description" rows="2" placeholder="An online store delivering quality products to your door."></textarea>
      </div>
    </div>
  </div>

  <!-- ── SOCIAL / OG ──────────────────────────────────────────────── -->
  <div class="card" style="margin-bottom:24px;">
    <div class="card-header"><h3>Social Sharing (Open Graph)</h3></div>
    <div class="card-body">
      <div class="form-group">
        <label class="form-label">Default OG / Share Image URL</label>
        <input type="text" class="form-control" id="og_image" name="og_image" placeholder="https://yourdomain.com/uploads/branding/og-image.jpg">
        <div class="form-hint">Recommended: 1200×630px. Used when sharing your homepage on Facebook / Twitter.</div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Twitter Card Type</label>
          <select class="form-control" id="twitter_card" name="twitter_card">
            <option value="summary_large_image">Large Image (recommended)</option>
            <option value="summary">Summary</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Twitter Handle</label>
          <input type="text" class="form-control" id="twitter_site" name="twitter_site" placeholder="@yourbrand">
        </div>
      </div>
    </div>
  </div>

  <!-- ── ROBOTS.TXT ──────────────────────────────────────────────── -->
  <div class="card" style="margin-bottom:24px;">
    <div class="card-header"><h3>Robots.txt</h3></div>
    <div class="card-body">
      <div class="form-group">
        <label class="form-label">Custom robots.txt Content</label>
        <textarea class="form-control" id="robots_txt" name="robots_txt" rows="8" style="font-family:monospace;font-size:13px;" placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/&#10;Sitemap: https://yourdomain.com/sitemap.xml"></textarea>
        <div class="form-hint">Leave blank to use the system default. Served at <code>/robots.txt</code></div>
      </div>
    </div>
  </div>

  <!-- ── SITEMAP ──────────────────────────────────────────────── -->
  <div class="card" style="margin-bottom:24px;">
    <div class="card-header"><h3>Sitemap</h3></div>
    <div class="card-body">
      <p style="color:var(--admin-muted);font-size:14px;margin-bottom:16px;">
        Your sitemap is automatically generated at <a href="/sitemap.xml" target="_blank">/sitemap.xml</a>.
        It includes all active products, categories, blog posts and static pages.
        The sitemap is cached for 6 hours and refreshes automatically.
      </p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <a href="/sitemap.xml" target="_blank" class="btn btn-outline btn-sm">🔗 View Sitemap</a>
        <button type="button" class="btn btn-outline btn-sm" onclick="clearSitemapCache()">♻️ Clear Sitemap Cache</button>
        <button type="button" class="btn btn-outline btn-sm" onclick="pingSitemapToGoogle()">📡 Ping Google</button>
      </div>
      <div id="sitemapStatus" style="margin-top:12px;font-size:13px;color:var(--admin-muted);"></div>
    </div>
  </div>

  <!-- ── SCHEMA ──────────────────────────────────────────────── -->
  <div class="card" style="margin-bottom:24px;">
    <div class="card-header"><h3>Structured Data (Schema.org)</h3></div>
    <div class="card-body">
      <div class="form-group">
        <label class="form-label">Organization Schema Override (JSON-LD)</label>
        <textarea class="form-control" id="schema_org_json" name="schema_org_json" rows="10" style="font-family:monospace;font-size:12px;"
          placeholder='{"@context":"https://schema.org","@type":"Organization","name":"Your Store","url":"https://yourdomain.com"}'></textarea>
        <div class="form-hint">Leave blank to auto-generate from your store settings. Paste custom JSON-LD if needed.</div>
      </div>
    </div>
  </div>

  <div style="display:flex;gap:12px;padding-bottom:32px;">
    <button type="submit" class="btn btn-primary">💾 Save SEO Settings</button>
    <button type="button" class="btn btn-outline" onclick="loadSeoSettings()">↩ Reset</button>
  </div>
</form>
</div>

<script>
const seoKeys = [
  'meta_title', 'meta_description', 'meta_keywords', 'google_analytics_id',
  'site_description', 'og_image', 'twitter_card', 'twitter_site',
  'robots_txt', 'schema_org_json'
];

// Character counters
document.getElementById('meta_title').addEventListener('input', function () {
  document.getElementById('meta_title_count').textContent = this.value.length + ' / 70 chars';
  this.style.borderColor = this.value.length > 60 ? (this.value.length > 70 ? 'var(--admin-danger)' : 'var(--admin-warning)') : '';
});
document.getElementById('meta_description').addEventListener('input', function () {
  document.getElementById('meta_desc_count').textContent = this.value.length + ' / 160 chars';
  this.style.borderColor = this.value.length > 140 ? (this.value.length > 160 ? 'var(--admin-danger)' : 'var(--admin-warning)') : '';
});

async function loadSeoSettings() {
  try {
    const res = await api('/settings?group=seo');
    const data = res.data || {};
    seoKeys.forEach(key => {
      const el = document.getElementById(key);
      if (el && data[key] !== undefined) el.value = data[key];
    });
    // Trigger counters
    document.getElementById('meta_title').dispatchEvent(new Event('input'));
    document.getElementById('meta_description').dispatchEvent(new Event('input'));
  } catch(e) { console.warn('Could not load SEO settings', e); }
}

async function saveSeo(e) {
  e.preventDefault();
  const payload = {};
  seoKeys.forEach(key => {
    const el = document.getElementById(key);
    if (el) payload[key] = el.value;
  });
  try {
    await api('/settings', 'PUT', payload);
    showSeoAlert('✓ SEO settings saved successfully', 'success');
  } catch(e) {
    showSeoAlert('Failed to save: ' + e.message, 'error');
  }
}

async function clearSitemapCache() {
  try {
    await api('/cache/clear', 'POST', { pattern: 'sitemap_' });
    document.getElementById('sitemapStatus').textContent = '✓ Sitemap cache cleared. Next visit will regenerate it.';
  } catch(e) {
    document.getElementById('sitemapStatus').textContent = '✗ ' + e.message;
  }
}

async function pingSitemapToGoogle() {
  const siteUrl = document.getElementById('og_image')?.value?.split('/').slice(0,3).join('/') || window.location.origin;
  const pingUrl = 'https://www.google.com/ping?sitemap=' + encodeURIComponent(siteUrl + '/sitemap.xml');
  window.open(pingUrl, '_blank');
  document.getElementById('sitemapStatus').textContent = 'Opened Google Ping in new tab. Check Google Search Console for status.';
}

function showSeoAlert(msg, type) {
  const el = document.getElementById('seoAlert');
  el.style.display = 'block';
  el.style.background = type === 'success' ? '#EAF9F0' : '#FDF0F1';
  el.style.color = type === 'success' ? '#1D6B47' : '#B91C1C';
  el.style.border = '1px solid ' + (type === 'success' ? 'rgba(59,183,126,.3)' : 'rgba(225,29,72,.2)');
  el.textContent = msg;
  setTimeout(() => el.style.display = 'none', 5000);
}

loadSeoSettings();
</script>

<?php include 'includes/footer.php'; ?>
