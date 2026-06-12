<?php $pageTitle = 'Site Settings'; include 'includes/header.php'; ?>

<div class="settings-grid">
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
            <div class="card-header">
                <h3>Homepage Content</h3>
                <small style="color:#94a3b8;font-weight:400;">Edit the public homepage copy without touching code.</small>
            </div>
            <div class="card-body">
                <div class="form-row">
                    <div class="form-group"><label>Hero Eyebrow</label><input type="text" id="hero_eyebrow" class="form-control"></div>
                    <div class="form-group"><label>Hero Media Badge</label><input type="text" id="hero_media_badge" class="form-control"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Hero Caption Title</label><input type="text" id="hero_media_caption_title" class="form-control"></div>
                    <div class="form-group"><label>Hero Caption Meta</label><input type="text" id="hero_media_caption_meta" class="form-control"></div>
                </div>

                <h4 style="margin:12px 0 14px;color:var(--admin-text);font-size:14px;">Trust Strip</h4>
                <div class="form-row">
                    <div class="form-group"><label>Trust Item 1</label><input type="text" id="trust_item_1_text" class="form-control"></div>
                    <div class="form-group"><label>Trust Item 2</label><input type="text" id="trust_item_2_text" class="form-control"></div>
                    <div class="form-group"><label>Trust Item 3</label><input type="text" id="trust_item_3_text" class="form-control"></div>
                    <div class="form-group"><label>Trust Item 4</label><input type="text" id="trust_item_4_text" class="form-control"></div>
                </div>

                <h4 style="margin:12px 0 14px;color:var(--admin-text);font-size:14px;">Homepage Section Titles</h4>
                <div class="form-row-3">
                    <div class="form-group"><label>Categories Label</label><input type="text" id="home_categories_label" class="form-control"></div>
                    <div class="form-group"><label>Categories Title</label><input type="text" id="home_categories_title" class="form-control"></div>
                    <div class="form-group"><label>Categories Link Text</label><input type="text" id="home_categories_link_text" class="form-control"></div>
                </div>
                <div class="form-row-3">
                    <div class="form-group"><label>Featured Label</label><input type="text" id="home_featured_label" class="form-control"></div>
                    <div class="form-group"><label>Featured Title</label><input type="text" id="home_featured_title" class="form-control"></div>
                    <div class="form-group"><label>Featured Link Text</label><input type="text" id="home_featured_link_text" class="form-control"></div>
                </div>
                <div class="form-row-3">
                    <div class="form-group"><label>New Arrivals Label</label><input type="text" id="home_new_label" class="form-control"></div>
                    <div class="form-group"><label>New Arrivals Title</label><input type="text" id="home_new_title" class="form-control"></div>
                    <div class="form-group"><label>New Arrivals Link Text</label><input type="text" id="home_new_link_text" class="form-control"></div>
                </div>

                <h4 style="margin:12px 0 14px;color:var(--admin-text);font-size:14px;">Promo Cards</h4>
                <?php for ($i = 1; $i <= 3; $i++): ?>
                    <div style="padding:16px;border:1px solid var(--admin-border);border-radius:12px;margin-bottom:16px;background:rgba(255,255,255,0.02);">
                        <h5 style="margin:0 0 12px;color:var(--admin-primary);font-size:13px;">Promo Card <?= $i ?></h5>
                        <div class="form-row">
                            <div class="form-group"><label>Label</label><input type="text" id="promo_<?= $i ?>_label" class="form-control"></div>
                            <div class="form-group"><label>Title</label><input type="text" id="promo_<?= $i ?>_title" class="form-control"></div>
                        </div>
                        <div class="form-group"><label>Description</label><textarea id="promo_<?= $i ?>_text" class="form-control" rows="2"></textarea></div>
                        <div class="form-row">
                            <div class="form-group"><label>Button Text</label><input type="text" id="promo_<?= $i ?>_button" class="form-control"></div>
                            <div class="form-group"><label>Button Link</label><input type="text" id="promo_<?= $i ?>_link" class="form-control" placeholder="/categories"></div>
                        </div>
                    </div>
                <?php endfor; ?>

                <h4 style="margin:12px 0 14px;color:var(--admin-text);font-size:14px;">Promise Section</h4>
                <div class="form-row">
                    <div class="form-group"><label>Promise Label</label><input type="text" id="promise_label" class="form-control"></div>
                    <div class="form-group"><label>Promise Title</label><input type="text" id="promise_title" class="form-control"></div>
                </div>
                <div class="form-group"><label>Promise Text</label><textarea id="promise_text" class="form-control" rows="2"></textarea></div>
                <?php for ($i = 1; $i <= 4; $i++): ?>
                    <div class="form-row">
                        <div class="form-group"><label>Why Card <?= $i ?> Title</label><input type="text" id="why_<?= $i ?>_title" class="form-control"></div>
                        <div class="form-group"><label>Why Card <?= $i ?> Text</label><textarea id="why_<?= $i ?>_text" class="form-control" rows="2"></textarea></div>
                    </div>
                <?php endfor; ?>
                <div class="form-row">
                    <div class="form-group"><label>Reviews Label</label><input type="text" id="reviews_label" class="form-control"></div>
                    <div class="form-group"><label>Reviews Title</label><input type="text" id="reviews_title" class="form-control"></div>
                </div>
                <h4 style="margin:12px 0 14px;color:var(--admin-text);font-size:14px;">Customer Reviews</h4>
                <?php for ($i = 1; $i <= 6; $i++): ?>
                    <div style="padding:16px;border:1px solid var(--admin-border);border-radius:12px;margin-bottom:16px;background:rgba(255,255,255,0.02);">
                        <h5 style="margin:0 0 12px;color:var(--admin-primary);font-size:13px;">Review <?= $i ?></h5>
                        <div class="form-row">
                            <div class="form-group"><label>Name</label><input type="text" id="review_<?= $i ?>_name" class="form-control"></div>
                            <div class="form-group"><label>Location</label><input type="text" id="review_<?= $i ?>_location" class="form-control"></div>
                        </div>
                        <div class="form-group"><label>Review Text</label><textarea id="review_<?= $i ?>_text" class="form-control" rows="2"></textarea></div>
                    </div>
                <?php endfor; ?>
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
            <div class="card-header"><h3>SEO</h3></div>
            <div class="card-body">
                <div class="form-group"><label>Default Meta Title</label><input type="text" id="meta_title" class="form-control"></div>
                <div class="form-group"><label>Default Meta Description</label><textarea id="meta_description" class="form-control" rows="2"></textarea></div>
                <div class="form-group"><label>Meta Keywords</label><input type="text" id="meta_keywords" class="form-control"></div>
                <div class="form-group"><label>Site Description</label><textarea id="site_description" class="form-control" rows="2"></textarea></div>
                <div class="form-group"><label>Google Analytics ID</label><input type="text" id="google_analytics_id" class="form-control" placeholder="G-XXXXXXXXXX"></div>
            </div>
        </div>

        <button class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;" onclick="saveSettings()">Save All Settings</button>
    </div>
</div>

<!-- ── Contact Us Section (full width) ── -->
<div style="margin-top:32px;">
    <div class="card">
        <div class="card-header">
            <h3>Contact Us Page</h3>
            <small style="color:#6B7280;font-weight:400;">These fields appear on the public Contact Us page and are used for SEO (LocalBusiness schema).</small>
        </div>
        <div class="card-body settings-contact-grid">
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
                    <label>Google Maps Embed URL <span style="color:#F28C00;">*</span></label>
                    <textarea id="contact_map_embed" class="form-control" rows="4"
                        placeholder="Paste the full Google Maps embed URL here...&#10;&#10;Steps:&#10;1. Go to maps.google.com&#10;2. Search your location&#10;3. Click Share → Embed a map&#10;4. Copy ONLY the src=&quot;...&quot; URL and paste here"
                        onchange="previewMap(this.value)"
                        oninput="previewMap(this.value)"></textarea>
                    <small style="color:#6B7280">
                        Copy only the URL from the iframe src attribute.<br>
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
                Save Contact Settings
            </button>
        </div>
    </div>
</div>

<script>
const settingFields = [
  'site_name','site_tagline','site_email','site_phone','site_address','site_url','admin_url',
  'currency_symbol','currency_code','header_offer_text','footer_about','footer_copyright',
  'hero_eyebrow','hero_media_badge','hero_media_caption_title','hero_media_caption_meta',
  'trust_item_1_text','trust_item_2_text','trust_item_3_text','trust_item_4_text',
  'home_categories_label','home_categories_title','home_categories_link_text',
  'home_featured_label','home_featured_title','home_featured_link_text',
  'home_new_label','home_new_title','home_new_link_text',
  'promo_1_label','promo_1_title','promo_1_text','promo_1_button','promo_1_link',
  'promo_2_label','promo_2_title','promo_2_text','promo_2_button','promo_2_link',
  'promo_3_label','promo_3_title','promo_3_text','promo_3_button','promo_3_link',
  'promise_label','promise_title','promise_text',
  'why_1_title','why_1_text','why_2_title','why_2_text','why_3_title','why_3_text','why_4_title','why_4_text',
  'reviews_label','reviews_title',
  'review_1_name','review_1_location','review_1_text',
  'review_2_name','review_2_location','review_2_text',
  'review_3_name','review_3_location','review_3_text',
  'review_4_name','review_4_location','review_4_text',
  'review_5_name','review_5_location','review_5_text',
  'review_6_name','review_6_location','review_6_text',
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
    const fd = new FormData();
    settingFields.filter(k => k !== 'site_logo' && k !== 'site_favicon').forEach(key => {
        const el = document.getElementById(key);
        if (el) fd.append(key, el.value);
    });
    const logoFile = document.getElementById('logoFile').files[0];
    const faviconFile = document.getElementById('faviconFile').files[0];
    if (logoFile) fd.append('site_logo', logoFile);
    if (faviconFile) fd.append('site_favicon', faviconFile);

    try {
        await api('/settings', 'POST', fd, true);
        showAlert('Settings saved successfully!');
        document.getElementById('logoFile').value = '';
        document.getElementById('faviconFile').value = '';
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
        showAlert('Contact settings saved. Your Contact page and SEO schema are updated.');
        loadSettings();
    } catch(e) {
        showAlert('Failed to save contact settings. Please try again.', 'error');
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
