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
                <div class="form-group"><label>Currency Symbol</label><input type="text" id="currency_symbol" class="form-control" style="width:80px"></div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header"><h3>Header & Footer</h3></div>
            <div class="card-body">
                <div class="form-group"><label>Header Offer Text</label><input type="text" id="header_offer_text" class="form-control"></div>
                <div class="form-group"><label>Footer About Text</label><textarea id="footer_about" class="form-control" rows="3"></textarea></div>
                <div class="form-group"><label>Footer Copyright</label><input type="text" id="footer_copyright" class="form-control"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h3>Logo</h3></div>
            <div class="card-body">
                <div id="currentLogo" style="margin-bottom:12px;"></div>
                <div class="form-group"><label>Upload New Logo</label><input type="file" id="logoFile" class="form-control" accept="image/*"></div>
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
                <div class="form-group"><label>Google Analytics ID</label><input type="text" id="google_analytics_id" class="form-control" placeholder="G-XXXXXXXXXX"></div>
            </div>
        </div>

        <button class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;" onclick="saveSettings()">💾 Save All Settings</button>
    </div>
</div>

<script>
const settingFields = ['site_name','site_tagline','site_email','site_phone','site_address','currency_symbol','header_offer_text','footer_about','footer_copyright','shipping_free_above','shipping_charge','tax_percentage','social_facebook','social_instagram','social_twitter','social_youtube','social_whatsapp','meta_title','meta_description','google_analytics_id','site_logo'];

async function loadSettings() {
    try {
        const res = await api('/settings');
        const s = res.data;
        settingFields.forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = s[key] || '';
        });
        if (s.site_logo) {
            document.getElementById('currentLogo').innerHTML = `<img src="../${s.site_logo}" style="max-height:60px;border-radius:8px;">`;
        }
    } catch(e) {}
}

async function saveSettings() {
    const data = {};
    settingFields.filter(k => k !== 'site_logo').forEach(key => {
        const el = document.getElementById(key);
        if (el) data[key] = el.value;
    });
    
    try {
        await api('/settings', 'PUT', data);
        
        // Handle logo upload separately
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
        
        showAlert('Settings saved successfully!');
        loadSettings();
    } catch(e) {}
}

loadSettings();
</script>

<?php include 'includes/footer.php'; ?>
