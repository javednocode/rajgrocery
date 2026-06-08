<?php $pageTitle = 'Site Settings'; include 'includes/header.php'; ?>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
    <div>
        <div class="card">
            <div class="card-header"><h3>General Settings</h3></div>
            <div class="card-body">
                <div class="form-group"><label>Site Name</label><input type="text" id="site_name" class="form-control"></div>
                <div class="form-group"><label>Tagline</label><input type="text" id="site_tagline" class="form-control"></div>
                <div class="form-group"><label>Email</label><input type="email" id="site_email" class="form-control"></div>
                <div class="form-group"><label>Phone</label><input type="text" id="site_phone" class="form-control"></div>
                <div class="form-group"><label>Address</label><textarea id="site_address" class="form-control" rows="2"></textarea></div>
                <div class="form-group"><label>Site URL</label><input type="url" id="site_url" class="form-control" placeholder="https://example.com"></div>
                <div class="form-group"><label>Admin Orders URL</label><input type="url" id="admin_url" class="form-control" placeholder="https://example.com/admin/orders.php"></div>
                <div class="form-group"><label>Currency Symbol</label><input type="text" id="currency_symbol" class="form-control" style="width:80px"></div>
                <div class="form-group"><label>Currency Code</label><input type="text" id="currency_code" class="form-control" style="width:110px" placeholder="USD"></div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header"><h3>Header & Footer</h3></div>
            <div class="card-body">
                <div class="form-group"><label>Header Offer Text</label><input type="text" id="header_offer_text" class="form-control"></div>
                <div class="form-group"><label>Footer About Text</label><textarea id="footer_about" class="form-control" rows="3"></textarea></div>
                <div class="form-group"><label>Footer Copyright</label><input type="text" id="footer_copyright" class="form-control"></div>
                <div class="form-group"><label>Newsletter Text</label><textarea id="newsletter_desc" class="form-control" rows="2"></textarea></div>
                <div class="form-group"><label>Pay Online URL</label><input type="url" id="payment_online_url" class="form-control" placeholder="Optional payment link"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h3>Logo & Favicon</h3></div>
            <div class="card-body">
                <div id="currentLogo" style="margin-bottom:12px;"></div>
                <div id="currentFavicon" style="margin-bottom:12px;"></div>
                <div class="form-group"><label>Upload New Logo</label><input type="file" id="logoFile" class="form-control" accept="image/*"></div>
                <div class="form-group"><label>Upload New Favicon</label><input type="file" id="faviconFile" class="form-control" accept="image/*,.ico"></div>
            </div>
        </div>
    </div>
    <div>
        <div class="card">
            <div class="card-header"><h3>Shipping & Tax</h3></div>
            <div class="card-body">
                <div class="form-group"><label>Free Shipping Above (₹)</label><input type="number" id="shipping_free_above" class="form-control"></div>
                <div class="form-group"><label>Shipping Charge (₹)</label><input type="number" id="shipping_charge" class="form-control"></div>
                <div class="form-group"><label>Tax Percentage (%)</label><input type="number" id="tax_percentage" class="form-control" step="0.1"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h3>Social Links</h3></div>
            <div class="card-body">
                <div class="form-group"><label>Facebook</label><input type="url" id="social_facebook" class="form-control"></div>
                <div class="form-group"><label>Instagram</label><input type="url" id="social_instagram" class="form-control"></div>
                <div class="form-group"><label>Twitter / X</label><input type="url" id="social_twitter" class="form-control"></div>
                <div class="form-group"><label>YouTube</label><input type="url" id="social_youtube" class="form-control"></div>
                <div class="form-group"><label>WhatsApp Number</label><input type="text" id="social_whatsapp" class="form-control"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h3>🔍 SEO</h3></div>
            <div class="card-body">
                <div class="form-group"><label>Default Meta Title</label><input type="text" id="meta_title" class="form-control"></div>
                <div class="form-group"><label>Default Meta Description</label><textarea id="meta_description" class="form-control" rows="2"></textarea></div>
                <div class="form-group"><label>Meta Keywords</label><input type="text" id="meta_keywords" class="form-control"></div>
                <div class="form-group"><label>Site Description</label><textarea id="site_description" class="form-control" rows="2"></textarea></div>
                <div class="form-group"><label>Google Analytics ID</label><input type="text" id="google_analytics_id" class="form-control" placeholder="G-XXXXXXXXXX"></div>
            </div>
        </div>

        <button class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;" onclick="saveSettings()">💾 Save All Settings</button>
    </div>
</div>

<!-- ── Contact Us Section (full width) ── -->
<div style="margin-top:32px;">
    <div class="card">
        <div class="card-header">
            <h3>📍 Contact Us Page</h3>
            <small style="color:#6B7280;font-weight:400;">These fields appear on the public Contact Us page and are used for SEO (LocalBusiness schema).</small>
        </div>
        <div class="card-body" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
            <div>
                <div class="form-group">
                    <label>Contact Email</label>
                    <input type="email" id="contact_email" class="form-control" placeholder="hello@example.com">
                    <small style="color:#6B7280">Displayed on contact page & used in email links</small>
                </div>
                <div class="form-group">
                    <label>Store Address</label>
                    <textarea id="contact_address" class="form-control" rows="2" placeholder="Store address"></textarea>
                    <small style="color:#6B7280">Shown on contact page. Also embedded in LocalBusiness SEO schema.</small>
                </div>
                <div class="form-group">
                    <label>Opening Hours</label>
                    <input type="text" id="contact_hours" class="form-control" placeholder="Mon-Fri: 9am-6pm">
                    <small style="color:#6B7280">HTML allowed (e.g. Mon–Fri: 9am–6pm&lt;br&gt;Sat–Sun: 10am–5pm)</small>
                </div>
                <div class="form-group">
                    <label>Business City</label>
                    <input type="text" id="business_city" class="form-control" placeholder="City">
                </div>
                <div class="form-group">
                    <label>Business Region / State</label>
                    <input type="text" id="business_region" class="form-control" placeholder="Region or state">
                </div>
                <div class="form-group">
                    <label>Business Country Code</label>
                    <input type="text" id="business_country" class="form-control" placeholder="US">
                </div>
            </div>
            <div>
                <div class="form-group">
                    <label>🗺️ Google Maps Embed URL <span style="color:#0F766E;">*</span></label>
                    <textarea id="contact_map_embed" class="form-control" rows="4"
                        placeholder="Paste the full Google Maps embed URL here...&#10;&#10;Steps:&#10;1. Go to maps.google.com&#10;2. Search your location&#10;3. Click Share → Embed a map&#10;4. Copy ONLY the src=&quot;...&quot; URL and paste here"
                        onchange="previewMap(this.value)"
                        oninput="previewMap(this.value)"></textarea>
                    <small style="color:#6B7280">
                        ⚠️ Copy only the URL from the iframe src attribute.<br>
                        Example: <code>https://www.google.com/maps/embed?pb=...</code>
                    </small>
                </div>
                <!-- Live Map Preview -->
                <div id="mapPreviewWrap" style="display:none;margin-top:12px;">
                    <label style="font-size:12px;font-weight:700;color:#2563EB;">Live Preview:</label>
                    <div style="border-radius:12px;overflow:hidden;border:2px solid #E5E7EB;height:220px;">
                        <iframe id="mapPreviewIframe" src="" width="100%" height="100%" style="border:0;" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </div>
        </div>
        <div style="padding:0 24px 24px;">
            <button class="btn btn-primary" onclick="saveContactSettings()" style="padding:10px 28px;">
                💾 Save Contact Settings
            </button>
        </div>
    </div>
</div>

<script>
const settingFields = [
  'site_name','site_tagline','site_email','site_phone','site_address','site_url','admin_url',
  'currency_symbol','currency_code','header_offer_text','footer_about','footer_copyright',
  'newsletter_desc','payment_online_url','shipping_free_above','shipping_charge','tax_percentage',
  'social_facebook','social_instagram','social_twitter','social_youtube','social_whatsapp',
  'meta_title','meta_description','meta_keywords','site_description','google_analytics_id',
  'site_logo','site_favicon'
];

const contactFields = ['contact_email','contact_address','contact_hours','contact_map_embed','business_city','business_region','business_country'];

async function loadSettings() {
    try {
        const res = await api('/settings');
        const s = res.data;
        // Main settings
        settingFields.forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = s[key] || '';
        });
        // Contact settings
        contactFields.forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = s[key] || '';
        });
        if (s.site_logo) {
            document.getElementById('currentLogo').innerHTML = `<img src="../${s.site_logo}" style="max-height:60px;border-radius:8px;">`;
        }
        if (s.site_favicon) {
            document.getElementById('currentFavicon').innerHTML = `<img src="../${s.site_favicon}" style="max-height:32px;border-radius:6px;">`;
        }
        // Auto-preview map if already set
        if (s.contact_map_embed) previewMap(s.contact_map_embed);
    } catch(e) {}
}

async function saveSettings() {
    const data = {};
    settingFields.filter(k => k !== 'site_logo' && k !== 'site_favicon').forEach(key => {
        const el = document.getElementById(key);
        if (el) data[key] = el.value;
    });
    try {
        await api('/settings', 'PUT', data);
        const logoFile = document.getElementById('logoFile').files[0];
        if (logoFile) {
            const fd = new FormData();
            fd.append('file', logoFile);
            fd.append('folder', 'branding');
            const uploadRes = await api('/upload', 'POST', fd, true);
            if (uploadRes.success) {
                await api('/settings', 'PUT', { site_logo: uploadRes.data.path });
            }
        }
        const faviconFile = document.getElementById('faviconFile').files[0];
        if (faviconFile) {
            const fd = new FormData();
            fd.append('file', faviconFile);
            fd.append('folder', 'branding');
            const uploadRes = await api('/upload', 'POST', fd, true);
            if (uploadRes.success) {
                await api('/settings', 'PUT', { site_favicon: uploadRes.data.path });
            }
        }
        showAlert('Settings saved successfully!');
        loadSettings();
    } catch(e) {}
}

async function saveContactSettings() {
    const data = {};
    contactFields.forEach(key => {
        const el = document.getElementById(key);
        if (el) data[key] = el.value;
    });
    try {
        await api('/settings', 'PUT', data);
        showAlert('✅ Contact settings saved! Your Contact page and SEO schema are updated.');
        loadSettings();
    } catch(e) {
        showAlert('❌ Failed to save contact settings. Please try again.', 'error');
    }
}

function previewMap(url) {
    const wrap = document.getElementById('mapPreviewWrap');
    const iframe = document.getElementById('mapPreviewIframe');
    if (url && url.startsWith('http')) {
        iframe.src = url;
        wrap.style.display = 'block';
    } else {
        wrap.style.display = 'none';
        iframe.src = '';
    }
}

loadSettings();
</script>

<?php include 'includes/footer.php'; ?>
