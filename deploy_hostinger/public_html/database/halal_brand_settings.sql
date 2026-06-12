-- ============================================================
-- Asian Spices & Halal Meats — Brand Settings Reset
-- Run once to overwrite all Saggoji/Bikaneri database settings
-- ============================================================

INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_group) VALUES
('site_name',        'Asian Spices & Halal Meats', 'text', 'general'),
('site_tagline',     'Fresh Halal Meats, Premium Spices & Ethnic Groceries', 'text', 'general'),
('site_description', 'Shop fresh halal meats, premium spices, fresh vegetables and daily essentials online. Fast delivery, best prices guaranteed.', 'textarea', 'seo'),
('site_logo',        '/logo.svg', 'image', 'general'),
('site_email',       'hello@asianspiceshalal.com', 'text', 'general'),
('site_phone',       '+353 1 234 5678', 'text', 'general'),
('site_address',     '12 Halal Street, Dublin, Ireland', 'textarea', 'general'),
('business_city',    'Dublin', 'text', 'contact'),
('business_region',  'Leinster', 'text', 'contact'),
('business_country', 'Ireland', 'text', 'contact'),
('contact_email',    'hello@asianspiceshalal.com', 'text', 'contact'),
('contact_address',  '12 Halal Street, Dublin, Ireland', 'text', 'contact'),
('contact_hours',    'Mon–Sat: 8am–8pm | Sun: 10am–6pm', 'textarea', 'contact'),
('footer_about',     'Your one-stop shop for fresh halal meats, premium spices, fresh vegetables and daily essentials. Fast delivery, best prices guaranteed.', 'textarea', 'footer'),
('footer_copyright', '© 2026 Asian Spices & Halal Meats. All rights reserved.', 'text', 'footer'),
('newsletter_desc',  'Get weekly deals, new arrivals and halal recipes straight to your inbox.', 'textarea', 'footer'),
('header_offer_text','🚚 Free delivery on orders over €50 — 100% Halal Certified', 'text', 'header'),
('currency_symbol',  '€', 'text', 'general'),
('currency_code',    'EUR', 'text', 'general'),
('shipping_free_above', '50', 'number', 'shipping'),
('shipping_charge',     '3.99', 'number', 'shipping'),
('delivery_free_above', '50', 'number', 'delivery'),
('delivery_free_enabled', '1', 'boolean', 'delivery'),
('delivery_local_fee',   '2.99', 'number', 'delivery'),
('delivery_standard_fee','3.99', 'number', 'delivery'),
('delivery_local_zone_label',    'Local Dublin Delivery', 'text', 'delivery'),
('delivery_standard_zone_label', 'Standard Delivery',     'text', 'delivery'),
('meta_title',       'Asian Spices & Halal Meats — Fresh Halal Groceries Online', 'text', 'seo'),
('meta_description', 'Shop fresh halal meats, premium spices, vegetables and daily essentials. Fast delivery to your door. 100% halal certified.', 'textarea', 'seo'),
('meta_keywords',    'halal meat, asian spices, fresh vegetables, online grocery, halal grocery, spices online, fresh groceries, irish halal', 'text', 'seo'),
('smtp_from_name',   'Asian Spices & Halal Meats', 'text', 'email'),
('admin_email',      'hello@asianspiceshalal.com', 'text', 'email'),
('social_facebook',  '', 'text', 'social'),
('social_instagram', '', 'text', 'social'),
('social_whatsapp',  '', 'text', 'social'),
('maintenance_mode', '0', 'boolean', 'general')
ON DUPLICATE KEY UPDATE
  setting_value = VALUES(setting_value),
  setting_type  = VALUES(setting_type),
  setting_group = VALUES(setting_group);

-- Clear old Saggoji/Bikaneri banners
UPDATE banners SET is_active = 0 WHERE title LIKE '%Saggoji%' OR title LIKE '%Bikaneri%' OR title LIKE '%Namkeen%' OR subtitle LIKE '%Saggoji%' OR subtitle LIKE '%Bikaneri%';

SELECT 'Asian Spices & Halal Meats brand settings applied.' AS status;
