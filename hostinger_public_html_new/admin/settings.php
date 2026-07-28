<?php $pageTitle = 'Site Settings'; include 'includes/header.php'; ?>

<div class="settings-grid">
    <div>
        <div class="card">
            <div class="card-header"><h3>Admin Profile</h3></div>
            <div class="card-body">
                <form id="adminProfileForm" onsubmit="event.preventDefault(); updateAdminProfile();">
                    <div class="form-group"><label>Name</label><input type="text" id="admin_name" class="form-control" required></div>
                    <div class="form-group"><label>Email</label><input type="email" id="admin_email" class="form-control" required></div>
                    <div class="form-group">
                        <label>New Password (leave blank to keep current)</label>
                        <input type="password" id="admin_password" class="form-control" placeholder="••••••••">
                    </div>
                    <button type="submit" class="btn btn-primary" id="btnUpdateProfile">Update Profile</button>
                    <span id="profile_status" style="margin-left:10px; font-size:13px;"></span>
                </form>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h3>🗂️ Cache Management</h3></div>
            <div class="card-body">
                <p style="font-size:13px;color:var(--admin-text-muted);margin:0 0 14px;">
                    If category counts or products are showing stale data (wrong counts per country), clear the site cache instantly.
                </p>
                <button class="btn btn-secondary" onclick="clearSiteCache()" id="btnClearCache">🗑️ Clear All Cache</button>
                <span id="cache_status" style="margin-left:10px;font-size:13px;"></span>
            </div>
        </div>

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
                    <div class="form-group"><label>Best Sellers Label</label><input type="text" id="home_trending_label" class="form-control"></div>
                    <div class="form-group"><label>Best Sellers Title</label><input type="text" id="home_trending_title" class="form-control"></div>
                    <div class="form-group"><label>Best Sellers Link Text</label><input type="text" id="home_trending_link_text" class="form-control"></div>
                </div>
                <div class="form-row-3">
                    <div class="form-group"><label>Brand Section Label</label><input type="text" id="featured_brands_label" class="form-control"></div>
                    <div class="form-group"><label>Brand Section Title</label><input type="text" id="featured_brands_title" class="form-control"></div>
                    <div class="form-group"><label>Brand Link Text</label><input type="text" id="featured_brands_link_text" class="form-control"></div>
                </div>
                <div class="form-group">
                    <label>Featured Brands List</label>
                    <textarea id="featured_brands_list" class="form-control" rows="3" placeholder="One brand per line, or comma separated"></textarea>
                </div>
                <div class="form-row-3">
                    <div class="form-group"><label>New Arrivals Label</label><input type="text" id="home_new_label" class="form-control"></div>
                    <div class="form-group"><label>New Arrivals Title</label><input type="text" id="home_new_title" class="form-control"></div>
                    <div class="form-group"><label>New Arrivals Link Text</label><input type="text" id="home_new_link_text" class="form-control"></div>
                </div>

                <h4 style="margin:12px 0 4px;color:var(--admin-text);font-size:14px;">Promo Campaign</h4>
                <p style="font-size:12px;color:var(--admin-text-muted);margin:0 0 14px;">
                    60/40 editorial section on the home page. Drag the card headers to reorder —
                    the <strong>first enabled card</strong> becomes the large left banner, the next two stack on the right.
                </p>
                <input type="hidden" id="promo_order" value="1,2,3">
                <div id="promoCardsWrap">
                <?php for ($i = 1; $i <= 3; $i++): ?>
                    <div class="promo-editor" data-promo="<?= $i ?>">
                        <div class="promo-editor-head" draggable="true">
                            <span class="promo-drag" title="Drag to reorder">⠿</span>
                            <h5>Card <?= $i ?></h5>
                            <span class="promo-role" id="promo_<?= $i ?>_role"></span>
                            <label class="promo-toggle">
                                <input type="checkbox" id="promo_<?= $i ?>_enabled" checked onchange="syncPromoOrder()"> Enabled
                            </label>
                        </div>
                        <div class="promo-editor-body">
                            <div class="form-row">
                                <div class="form-group"><label>Label</label><input type="text" id="promo_<?= $i ?>_label" class="form-control"></div>
                                <div class="form-group"><label>Title</label><input type="text" id="promo_<?= $i ?>_title" class="form-control"></div>
                            </div>
                            <div class="form-group"><label>Description</label><textarea id="promo_<?= $i ?>_text" class="form-control" rows="2"></textarea></div>
                            <div class="form-row">
                                <div class="form-group"><label>Button Text</label><input type="text" id="promo_<?= $i ?>_button" class="form-control"></div>
                                <div class="form-group"><label>Button Link</label><input type="text" id="promo_<?= $i ?>_link" class="form-control" placeholder="/categories"></div>
                            </div>
                            <div class="form-row-3">
                                <div class="form-group"><label>Offer Badge (optional)</label><input type="text" id="promo_<?= $i ?>_badge" class="form-control" placeholder="e.g. Up to 30% off"></div>
                                <div class="form-group"><label>Badge Color</label><input type="color" id="promo_<?= $i ?>_badge_color" class="form-control promo-color" value="#1E88A8"></div>
                                <div class="form-group"><label>Card Height px <small>(right-side cards)</small></label><input type="number" id="promo_<?= $i ?>_height" class="form-control" min="0" step="10" placeholder="auto"></div>
                            </div>
                            <div class="form-row-3">
                                <div class="form-group"><label>Overlay Color</label><input type="color" id="promo_<?= $i ?>_overlay_color" class="form-control promo-color" value="#0B1220"></div>
                                <div class="form-group">
                                    <label>Overlay Strength <output id="promo_<?= $i ?>_overlay_opacity_out">44%</output></label>
                                    <input type="range" id="promo_<?= $i ?>_overlay_opacity" min="0" max="90" value="44" style="width:100%;"
                                        oninput="document.getElementById('promo_<?= $i ?>_overlay_opacity_out').textContent = this.value + '%'">
                                </div>
                                <div class="form-group"></div>
                            </div>
                            <div class="form-row">
                                <div class="form-group"><label>Desktop Image</label><input type="file" id="promo_<?= $i ?>_image_file" class="form-control" accept="image/*"></div>
                                <div class="form-group"><label>Mobile Image (optional)</label><input type="file" id="promo_<?= $i ?>_image_mobile_file" class="form-control" accept="image/*"></div>
                            </div>
                            <div style="display:flex;gap:10px;margin-top:4px;">
                                <div id="promo_<?= $i ?>_image_preview"></div>
                                <div id="promo_<?= $i ?>_image_mobile_preview"></div>
                            </div>
                        </div>
                    </div>
                <?php endfor; ?>
                </div>
                <style>
                    .promo-editor { border:1px solid var(--admin-border); border-radius:12px; margin-bottom:16px; background:rgba(255,255,255,0.02); overflow:hidden; }
                    .promo-editor.dragging { opacity:.45; }
                    .promo-editor.promo-off .promo-editor-body { opacity:.38; pointer-events:auto; }
                    .promo-editor-head { display:flex; align-items:center; gap:10px; padding:12px 16px; border-bottom:1px solid var(--admin-border); cursor:grab; background:rgba(255,255,255,0.03); }
                    .promo-editor-head:active { cursor:grabbing; }
                    .promo-editor-head h5 { margin:0; color:var(--admin-primary); font-size:13px; }
                    .promo-drag { color:var(--admin-text-muted); font-size:15px; letter-spacing:-2px; user-select:none; }
                    .promo-role { font-size:11px; color:var(--admin-text-muted); text-transform:uppercase; letter-spacing:.08em; font-weight:700; }
                    .promo-toggle { margin-left:auto; display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--admin-text); cursor:pointer; }
                    .promo-editor-body { padding:16px; }
                    .promo-color { padding:2px 4px; height:38px; cursor:pointer; }
                </style>

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
                <div class="form-group"><label>Free Shipping Above (£)</label><input type="number" id="shipping_free_above" class="form-control"></div>
                <div class="form-group"><label>Shipping Charge (£)</label><input type="number" id="shipping_charge" class="form-control"></div>
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

        <div class="card">
            <div class="card-header"><h3> AI Image Generation</h3></div>
            <div class="card-body">
                <p style="font-size:12px;color:var(--admin-text-muted);margin:0 0 12px;">
                    Powers the "Generate with AI" buttons on the Categories page. The API key is stored
                    securely on the server and is never sent back to the browser.
                </p>
                <div class="form-group">
                    <label>Provider</label>
                    <select id="ai_image_provider" class="form-control" onchange="onAiProviderChange()">
                        <option value="openai">OpenAI (DALL·E / gpt-image)</option>
                        <option value="gemini">Google Gemini (Imagen via AI Studio)</option>
                        <option value="stability">Stability AI</option>
                    </select>
                    <small id="aiProviderHint" style="display:block;margin-top:6px;color:var(--admin-text-muted);"></small>
                </div>
                <div class="form-group"><label>API Endpoint URL</label><input type="text" id="ai_image_api_url" class="form-control" placeholder="https://api.openai.com/v1/images/generations"></div>
                <div class="form-row">
                    <div class="form-group"><label>Model</label><input type="text" id="ai_image_model" class="form-control" placeholder="gpt-image-1"></div>
                    <div class="form-group">
                        <label>Image Size</label>
                        <select id="ai_image_size" class="form-control">
                            <option value="1024x1024">1024 × 1024 (square)</option>
                            <option value="512x512">512 × 512 (square)</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" id="aiGeminiModelsRow" style="display:none;">
                    <button type="button" class="btn btn-outline btn-sm" id="aiCheckModelsBtn" onclick="checkGeminiModels()">🔎 Check Available Models</button>
                    <p style="font-size:11.5px;color:var(--admin-text-muted);margin:6px 0 0;">
                        Google renames/retires image models often. This asks your saved API key directly —
                        save your key above first, then click to see which models it can actually use.
                    </p>
                    <div id="aiGeminiModelsList" style="margin-top:8px;display:flex;flex-direction:column;gap:6px;"></div>
                </div>
                <div class="form-group">
                    <label>API Key <span id="aiKeyStatus" style="font-weight:700;"></span></label>
                    <input type="password" id="ai_image_api_key" class="form-control" autocomplete="new-password" placeholder="Enter to set / update — leave blank to keep current">
                </div>
                <div class="form-group">
                    <label>Shared Style Direction <small>(appended to every prompt for a consistent look)</small></label>
                    <textarea id="ai_image_style_suffix" class="form-control" rows="3" placeholder="Leave blank to use the built-in premium grocery art direction."></textarea>
                </div>
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
                    <label>Phone Number</label>
                    <input type="text" id="contact_phone" class="form-control" placeholder="+44 20 0000 0000">
                    <small style="color:#6B7280">Shown on contact page with a tap-to-call link</small>
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
  'home_trending_label','home_trending_title','home_trending_link_text',
  'featured_brands_label','featured_brands_title','featured_brands_link_text','featured_brands_list',
  'home_new_label','home_new_title','home_new_link_text',
  'promo_order',
  'promo_1_label','promo_1_title','promo_1_text','promo_1_button','promo_1_link','promo_1_badge',
  'promo_1_badge_color','promo_1_overlay_color','promo_1_overlay_opacity','promo_1_height',
  'promo_2_label','promo_2_title','promo_2_text','promo_2_button','promo_2_link','promo_2_badge',
  'promo_2_badge_color','promo_2_overlay_color','promo_2_overlay_opacity','promo_2_height',
  'promo_3_label','promo_3_title','promo_3_text','promo_3_button','promo_3_link','promo_3_badge',
  'promo_3_badge_color','promo_3_overlay_color','promo_3_overlay_opacity','promo_3_height',
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
  // AI image config (non-secret). The API key is handled separately (write-only).
  'ai_image_provider','ai_image_api_url','ai_image_model','ai_image_size','ai_image_style_suffix',
  'site_logo','site_favicon'
];

const contactFields = ['contact_email','contact_phone','contact_address','contact_hours','contact_map_embed','business_city','business_region','business_country'];

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
        // AI API key is write-only — show status only, never populate the field.
        const aiStatus = document.getElementById('aiKeyStatus');
        if (aiStatus) {
            const set = s.ai_image_api_key_set == 1;
            aiStatus.textContent = set ? '· configured ✓' : '· not set';
            aiStatus.style.color = set ? '#059669' : '#9ca3af';
        }
        syncAiProviderHint(); // reflect the loaded provider — never touches saved field values
        if (s.site_logo) {
            document.getElementById('currentLogo').innerHTML = `<img src="../${s.site_logo}" style="max-height:60px;border-radius:8px;">`;
        }
        if (s.site_favicon) {
            document.getElementById('currentFavicon').innerHTML = `<img src="../${s.site_favicon}" style="max-height:32px;border-radius:6px;">`;
        }
        promoAfterLoad(s);
        // Auto-preview map if already set
        if (s.contact_map_embed) previewMap(s.contact_map_embed);
    } catch(e) {}
}

/* ── Promo campaign editor ── */
const promoEditorDefaults = {
    1: { badge_color: '#1E88A8', overlay_color: '#0B1220', overlay_opacity: 44 },
    2: { badge_color: '#29B8D5', overlay_color: '#101826', overlay_opacity: 40 },
    3: { badge_color: '#16708C', overlay_color: '#12100B', overlay_opacity: 42 },
};

function promoAfterLoad(s) {
    [1,2,3].forEach(i => {
        const d = promoEditorDefaults[i];
        // Colour/range inputs reject empty values — fall back to the design defaults
        const bc = document.getElementById(`promo_${i}_badge_color`);
        if (bc && !/^#[0-9a-f]{6}$/i.test(bc.value = (s[`promo_${i}_badge_color`] || d.badge_color))) bc.value = d.badge_color;
        const oc = document.getElementById(`promo_${i}_overlay_color`);
        if (oc && !/^#[0-9a-f]{6}$/i.test(oc.value = (s[`promo_${i}_overlay_color`] || d.overlay_color))) oc.value = d.overlay_color;
        const oo = document.getElementById(`promo_${i}_overlay_opacity`);
        if (oo) {
            oo.value = String(parseInt(s[`promo_${i}_overlay_opacity`], 10) >= 0 ? parseInt(s[`promo_${i}_overlay_opacity`], 10) : d.overlay_opacity);
            document.getElementById(`promo_${i}_overlay_opacity_out`).textContent = oo.value + '%';
        }
        const en = document.getElementById(`promo_${i}_enabled`);
        if (en) en.checked = (s[`promo_${i}_enabled`] ?? '1') !== '0';
        ['image', 'image_mobile'].forEach(kind => {
            const wrap = document.getElementById(`promo_${i}_${kind}_preview`);
            if (wrap) wrap.innerHTML = s[`promo_${i}_${kind}`]
                ? `<img src="..${s[`promo_${i}_${kind}`]}" style="max-height:64px;border-radius:8px;object-fit:cover;" title="${kind === 'image' ? 'Desktop' : 'Mobile'}">`
                : '';
        });
    });
    // Restore saved display order
    const wrap = document.getElementById('promoCardsWrap');
    const order = String(s.promo_order || '1,2,3').split(',').map(v => v.trim()).filter(v => ['1','2','3'].includes(v));
    order.forEach(n => {
        const el = wrap.querySelector(`.promo-editor[data-promo="${n}"]`);
        if (el) wrap.appendChild(el);
    });
    syncPromoOrder();
}

/** Recompute promo_order from DOM order and refresh role labels + dimming. */
function syncPromoOrder() {
    const wrap = document.getElementById('promoCardsWrap');
    const cards = [...wrap.querySelectorAll('.promo-editor')];
    document.getElementById('promo_order').value = cards.map(el => el.dataset.promo).join(',');
    let slot = 0;
    const roles = ['Left banner · 60%', 'Right stack · top', 'Right stack · bottom'];
    cards.forEach(el => {
        const n = el.dataset.promo;
        const enabled = document.getElementById(`promo_${n}_enabled`).checked;
        el.classList.toggle('promo-off', !enabled);
        document.getElementById(`promo_${n}_role`).textContent = enabled ? (roles[slot++] || 'Hidden (max 3 shown)') : 'Disabled';
    });
}

// Drag-and-drop reordering of promo cards
(() => {
    const wrap = document.getElementById('promoCardsWrap');
    if (!wrap) return;
    let dragEl = null;
    wrap.querySelectorAll('.promo-editor-head').forEach(head => {
        head.addEventListener('dragstart', e => {
            dragEl = head.closest('.promo-editor');
            dragEl.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            try { e.dataTransfer.setData('text/plain', dragEl.dataset.promo); } catch {}
        });
        head.addEventListener('dragend', () => {
            if (dragEl) dragEl.classList.remove('dragging');
            dragEl = null;
            syncPromoOrder();
        });
    });
    wrap.addEventListener('dragover', e => {
        if (!dragEl) return;
        e.preventDefault();
        const others = [...wrap.querySelectorAll('.promo-editor:not(.dragging)')];
        const after = others.find(el => e.clientY < el.getBoundingClientRect().top + el.offsetHeight / 2);
        if (after) wrap.insertBefore(dragEl, after);
        else wrap.appendChild(dragEl);
    });
    wrap.addEventListener('drop', e => e.preventDefault());
})();

/* ── AI provider hint text + placeholders ──
   Each provider needs a different endpoint/model shape. The URL/Model
   fields are optional overrides — leaving them blank makes the PHP
   backend fall back to sensible per-provider defaults (see
   ai_image_default_url()/ai_image_default_model() in helpers/ai_image.php).
   So when the provider is switched, any URL/Model value that still
   matches ANOTHER provider's default gets cleared back to blank —
   that's what makes the switch actually take effect server-side,
   instead of e.g. silently calling Google with an OpenAI model name
   left over from before. A value the admin genuinely customised (a
   self-hosted proxy URL, a specific model) never matches these known
   defaults, so it's left alone. */
const AI_PROVIDER_INFO = {
    openai: {
        hint: 'Uses your OpenAI account (billed pay-as-you-go, ~$0.04/image). Get a key at platform.openai.com → API keys.',
        url: 'https://api.openai.com/v1/images/generations',
        model: 'gpt-image-1',
    },
    gemini: {
        hint: 'Needs a Google AI Studio API key from aistudio.google.com/apikey — NOT the same as a Gemini Premium/Advanced app subscription, which has no API access. Billed via a Google Cloud project. Google retires model names often — if generation fails with "model ... no longer available", try imagen-3.0-generate-002, imagen-4.0-generate-001, or gemini-2.0-flash-preview-image-generation.',
        url: 'https://generativelanguage.googleapis.com',
        model: 'imagen-3.0-generate-002',
    },
    stability: {
        hint: 'Uses your Stability AI account. Get a key at platform.stability.ai/account/keys.',
        url: 'https://api.stability.ai/v2beta/stable-image/generate/core',
        model: 'core',
    },
};
const AI_KNOWN_URLS   = Object.values(AI_PROVIDER_INFO).map(p => p.url);
const AI_KNOWN_MODELS = Object.values(AI_PROVIDER_INFO).map(p => p.model);

// Safe to call anytime (incl. right after loading saved settings) — only
// updates hint/placeholder/visibility, never touches the actual field values.
function syncAiProviderHint() {
    const provider = document.getElementById('ai_image_provider').value || 'openai';
    const info = AI_PROVIDER_INFO[provider] || AI_PROVIDER_INFO.openai;
    document.getElementById('aiProviderHint').textContent = info.hint;
    document.getElementById('ai_image_api_url').placeholder = info.url + (provider === 'gemini' ? '  (base host only)' : '');
    document.getElementById('ai_image_model').placeholder = info.model;
    document.getElementById('aiGeminiModelsRow').style.display = (provider === 'gemini') ? '' : 'none';
}

// Bound to the dropdown's onchange — a genuine user-initiated switch, so it's
// safe (and necessary) to clear a stale other-provider default here.
function onAiProviderChange() {
    const urlEl = document.getElementById('ai_image_api_url');
    const modelEl = document.getElementById('ai_image_model');
    if (!urlEl.value.trim() || AI_KNOWN_URLS.includes(urlEl.value.trim())) urlEl.value = '';
    if (!modelEl.value.trim() || AI_KNOWN_MODELS.includes(modelEl.value.trim())) modelEl.value = '';
    document.getElementById('aiGeminiModelsList').innerHTML = '';
    syncAiProviderHint();
}

// "Check Available Models" — asks Google (via the key already saved in
// Settings) what THIS key can use, and renders each as a clickable chip
// that fills the Model field. Removes the guesswork entirely.
async function checkGeminiModels() {
    const btn = document.getElementById('aiCheckModelsBtn');
    const list = document.getElementById('aiGeminiModelsList');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Checking…'; list.innerHTML = '';
    try {
        const res = await api('/ai-images/gemini/models');
        const models = res.data.models || [];
        if (!models.length) {
            list.innerHTML = '<span style="font-size:12px;color:var(--admin-text-muted);">No image-capable models found for this key.</span>';
        } else {
            list.innerHTML = models.map(m => `
                <button type="button" class="btn btn-outline btn-sm" style="justify-content:flex-start;text-align:left;"
                    onclick="document.getElementById('ai_image_model').value='${m.name.replace(/'/g,"\\'")}'">
                    <strong>${m.name}</strong>&nbsp;<span style="color:var(--admin-text-muted);">(${m.methods.join(', ')})</span>
                </button>
            `).join('');
        }
    } catch(e) {
        // api() already showed the error alert (e.g. "save your key first")
    } finally {
        btn.disabled = false; btn.textContent = label;
    }
}

async function saveSettings() {
    const fd = new FormData();
    settingFields.filter(k => k !== 'site_logo' && k !== 'site_favicon').forEach(key => {
        const el = document.getElementById(key);
        if (el) fd.append(key, el.value);
    });
    // Secret AI key: send ONLY if the admin typed a new value (blank keeps current).
    const aiKeyEl = document.getElementById('ai_image_api_key');
    if (aiKeyEl && aiKeyEl.value.trim() !== '') fd.append('ai_image_api_key', aiKeyEl.value.trim());
    const logoFile = document.getElementById('logoFile').files[0];
    const faviconFile = document.getElementById('faviconFile').files[0];
    if (logoFile) fd.append('site_logo', logoFile);
    if (faviconFile) fd.append('site_favicon', faviconFile);
    syncPromoOrder();
    fd.set('promo_order', document.getElementById('promo_order').value);
    [1,2,3].forEach(i => {
        fd.append(`promo_${i}_enabled`, document.getElementById(`promo_${i}_enabled`).checked ? '1' : '0');
        const f = document.getElementById(`promo_${i}_image_file`)?.files[0];
        if (f) fd.append(`promo_${i}_image`, f);
        const fm = document.getElementById(`promo_${i}_image_mobile_file`)?.files[0];
        if (fm) fd.append(`promo_${i}_image_mobile`, fm);
    });

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

async function updateAdminProfile() {
    const name = document.getElementById('admin_name').value;
    const email = document.getElementById('admin_email').value;
    const password = document.getElementById('admin_password').value;
    const btn = document.getElementById('btnUpdateProfile');
    const status = document.getElementById('profile_status');
    
    btn.disabled = true;
    status.textContent = 'Saving...';
    status.style.color = '#64748b';
    
    try {
        const res = await api('/auth/profile', 'PUT', { name, email, password });
        if (res.success) {
            // Update local token and user
            localStorage.setItem('admin_token', res.data.token);
            localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
            
            // Also update the UI header name if present
            const headerName = document.querySelector('.admin-topbar-user strong');
            if (headerName) headerName.textContent = name;
            
            status.textContent = 'Profile updated!';
            status.style.color = 'var(--admin-success)';
            document.getElementById('admin_password').value = ''; // clear password
            setTimeout(() => { status.textContent = ''; }, 3000);
        }
    } catch(e) {
        status.textContent = e.message || 'Error updating profile';
        status.style.color = 'var(--admin-danger)';
    } finally {
        btn.disabled = false;
    }
}

loadSettings();

// Pre-fill Admin Profile form
try {
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    if (adminUser.name) document.getElementById('admin_name').value = adminUser.name;
    if (adminUser.email) document.getElementById('admin_email').value = adminUser.email;
} catch(e) {}

async function clearSiteCache() {
    const btn = document.getElementById('btnClearCache');
    const status = document.getElementById('cache_status');
    btn.disabled = true;
    status.textContent = 'Clearing...';
    status.style.color = '#64748b';
    try {
        const res = await api('/cache/clear', 'POST', {});
        status.textContent = `✅ Cleared ${res.data?.cleared ?? ''} cache files!`;
        status.style.color = 'var(--admin-success)';
    } catch(e) {
        status.textContent = '❌ ' + (e.message || 'Error');
        status.style.color = 'var(--admin-danger)';
    } finally {
        btn.disabled = false;
        setTimeout(() => { status.textContent = ''; }, 4000);
    }
}
</script>

<?php include 'includes/footer.php'; ?>
