-- ════════════════════════════════════════════════════════════════════════
-- Raj Grocery Store — production settings fix
--
-- WHY THIS EXISTS
-- These values live in the `site_settings` table, NOT in code. A build
-- upload replaces PHP/JS files only, so it can never change them — which
-- is why the WhatsApp button, the "Turkish bakery" promo tile and the
-- "Update this feature in Admin Settings..." copy all survived a deploy.
--
-- Everything below is an UPDATE or an idempotent upsert against
-- site_settings. No schema changes, no deletes. Safe to run more than once.
--
-- AFTER RUNNING: Admin Panel → Settings → Save (or wait ~10 min) so the
-- server-side settings cache picks the new values up.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. WhatsApp button ────────────────────────────────────────────────
-- The footer already has WhatsApp → Call → Contact fallback logic built in.
-- It was falling through to "Call the Store" purely because this was empty.
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_type`, `setting_group`)
VALUES ('social_whatsapp', '+852 54264886', 'text', 'social')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- ── 2. Promo tile 2 — was still advertising a Turkish bakery ──────────
UPDATE `site_settings` SET `setting_value` = 'Spice pantry'                       WHERE `setting_key` = 'promo_2_label';
UPDATE `site_settings` SET `setting_value` = 'Authentic Indian Spices & Masalas'  WHERE `setting_key` = 'promo_2_title';
UPDATE `site_settings` SET `setting_value` = 'From ground coriander to whole garam masala — the real flavours of Indian cooking.' WHERE `setting_key` = 'promo_2_text';
UPDATE `site_settings` SET `setting_value` = 'Shop Spices'                        WHERE `setting_key` = 'promo_2_button';
UPDATE `site_settings` SET `setting_value` = 'Best Sellers'                       WHERE `setting_key` = 'promo_2_badge';
UPDATE `site_settings` SET `setting_value` = '#1D6FA3'                            WHERE `setting_key` = 'promo_2_badge_color';
-- Clear the Turkish bakery photo. Upload a spices image via Admin → Settings
-- → Homepage if you want art on this tile; it renders fine without one.
UPDATE `site_settings` SET `setting_value` = ''                                   WHERE `setting_key` = 'promo_2_image';

-- ── 3. "Why Customers Choose Us" — was placeholder instructions ───────
UPDATE `site_settings` SET `setting_value` = 'Every product comes from trusted Indian brands, checked for freshness before it ships to your door.'      WHERE `setting_key` = 'why_1_text';
UPDATE `site_settings` SET `setting_value` = 'Something not right with your order? Tell us within 24 hours and we will sort out a replacement or refund.' WHERE `setting_key` = 'why_2_text';
UPDATE `site_settings` SET `setting_value` = 'We deliver across Hong Kong, with the delivery fee for your area shown upfront before you check out.'     WHERE `setting_key` = 'why_3_text';
UPDATE `site_settings` SET `setting_value` = 'Hundreds of Indian families across Hong Kong shop with us for the brands they grew up with.'              WHERE `setting_key` = 'why_4_text';

-- ── 4. Leftover white-label brand identity ────────────────────────────
-- site_name was already correct on production, but these SEO/email fields
-- still carried the old brand (and meta_title had a broken character).
UPDATE `site_settings` SET `setting_value` = 'Raj Grocery Store'                                     WHERE `setting_key` IN ('site_name', 'smtp_from_name');
UPDATE `site_settings` SET `setting_value` = 'Raj Grocery Store — Indian Grocery Store in Hong Kong'  WHERE `setting_key` = 'meta_title';
UPDATE `site_settings` SET `setting_value` = 'Shop Indian groceries in Hong Kong — spices, rice, atta, dals, snacks and fresh vegetables delivered to your door.' WHERE `setting_key` = 'meta_description';
UPDATE `site_settings` SET `setting_value` = CONCAT('© ', YEAR(CURDATE()), ' Raj Grocery Store. All rights reserved.') WHERE `setting_key` = 'footer_copyright';
UPDATE `site_settings` SET `setting_value` = 'rajgrocerycohk@hotmail.com'
  WHERE `setting_key` IN ('site_email', 'contact_email', 'smtp_from_email', 'admin_email')
    AND (`setting_value` LIKE '%kalegida%' OR `setting_value` = '');

-- ── Verify ────────────────────────────────────────────────────────────
SELECT `setting_key`, `setting_value` FROM `site_settings`
WHERE `setting_key` IN (
  'social_whatsapp','promo_2_label','promo_2_title','why_1_text',
  'site_name','meta_title','site_email'
) ORDER BY `setting_key`;
