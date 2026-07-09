<?php
/**
 * White-label ecommerce branding defaults and helpers.
 *
 * The database schema stays unchanged: branding lives in site_settings as
 * key/value rows, with environment variables only used as deploy-time defaults.
 */

function brandingDefaults(): array {
    $appUrl = rtrim((string)(getenv('APP_URL') ?: ''), '/');

    return [
        'site_name' => [getenv('SITE_NAME') ?: 'Your Store', 'text', 'general'],
        'site_tagline' => [getenv('SITE_TAGLINE') ?: 'Quality products delivered to your door.', 'text', 'general'],
        'site_description' => ['An online store delivering quality products to your door.', 'textarea', 'seo'],
        'site_url' => [$appUrl, 'text', 'general'],
        'admin_url' => [$appUrl ? $appUrl . '/admin/orders.php' : '/admin/orders.php', 'text', 'general'],
        'site_logo' => ['/logo.png', 'image', 'general'],
        'site_favicon' => ['/favicon.ico', 'image', 'general'],
        'site_email' => [getenv('SITE_EMAIL') ?: 'hello@example.com', 'text', 'general'],
        'site_phone' => ['', 'text', 'general'],
        'site_address' => ['Configure store address in Admin Settings', 'textarea', 'general'],
        'business_city' => ['', 'text', 'contact'],
        'business_region' => ['', 'text', 'contact'],
        'business_country' => ['GB', 'text', 'contact'],

        'contact_email' => [getenv('SITE_EMAIL') ?: 'hello@example.com', 'text', 'contact'],
        'contact_address' => ['Configure store address in Admin Settings', 'text', 'contact'],
        'contact_hours' => ['Mon–Sat: 9am–6pm | Sun: 10am–4pm', 'textarea', 'contact'],
        'contact_map_embed' => ['', 'textarea', 'contact'],
        'contact_phone'     => ['', 'text', 'contact'],

        'footer_about' => ['Your one-stop shop for quality products delivered to your door.', 'textarea', 'footer'],
        'footer_copyright' => ['© ' . date('Y') . ' ' . (getenv('SITE_NAME') ?: 'Your Store') . '. All rights reserved.', 'text', 'footer'],
        'newsletter_desc' => ['Get exclusive deals, new arrivals and weekly offers delivered straight to your inbox.', 'textarea', 'footer'],
        'header_offer_text' => ['Free delivery on orders over a minimum spend', 'text', 'header'],
        'hero_eyebrow' => ['Quality products', 'text', 'homepage'],
        'hero_media_badge' => ['Premium Selection', 'text', 'homepage'],
        'hero_media_caption_title' => ['Fresh Picks', 'text', 'homepage'],
        'hero_media_caption_meta' => ['Curated daily', 'text', 'homepage'],
        'trust_item_1_text' => ['Quality Guaranteed', 'text', 'homepage'],
        'trust_item_2_text' => ['Free Delivery Available', 'text', 'homepage'],
        'trust_item_3_text' => ['Freshness Guaranteed', 'text', 'homepage'],
        'trust_item_4_text' => ['Fast Dispatch', 'text', 'homepage'],
        'home_categories_label' => ['Browse', 'text', 'homepage'],
        'home_categories_title' => ['Shop by Category', 'text', 'homepage'],
        'home_categories_link_text' => ['All Categories', 'text', 'homepage'],
        'home_featured_label' => ['Bestsellers', 'text', 'homepage'],
        'home_featured_title' => ['Featured Products', 'text', 'homepage'],
        'home_featured_link_text' => ['View All', 'text', 'homepage'],
        'home_trending_label' => ['Trending', 'text', 'homepage'],
        'home_trending_title' => ['Best Sellers', 'text', 'homepage'],
        'home_trending_link_text' => ['View All', 'text', 'homepage'],
        'featured_brands_label' => ['Featured Brands', 'text', 'homepage'],
        'featured_brands_title' => ['Trusted Grocery Brands', 'text', 'homepage'],
        'featured_brands_link_text' => ['Shop Brands', 'text', 'homepage'],
        'featured_brands_list' => ['Aashirvaad, Pillsbury, Everest, MDH, Ching\'s, Haldiram, India Gate', 'textarea', 'homepage'],
        'home_new_label' => ['Just In', 'text', 'homepage'],
        'home_new_title' => ['New Arrivals', 'text', 'homepage'],
        'home_new_link_text' => ['View All', 'text', 'homepage'],
        'promo_1_label' => ['Category 1', 'text', 'homepage'],
        'promo_1_title' => ['Configure This Promo', 'text', 'homepage'],
        'promo_1_text' => ['Update this promo banner content from the Admin Settings panel.', 'textarea', 'homepage'],
        'promo_1_button' => ['Shop Now', 'text', 'homepage'],
        'promo_1_link' => ['/categories', 'text', 'homepage'],
        'promo_2_label' => ['Category 2', 'text', 'homepage'],
        'promo_2_title' => ['Configure This Promo', 'text', 'homepage'],
        'promo_2_text' => ['Update this promo banner content from the Admin Settings panel.', 'textarea', 'homepage'],
        'promo_2_button' => ['Shop Now', 'text', 'homepage'],
        'promo_2_link' => ['/categories', 'text', 'homepage'],
        'promo_3_label' => ['Category 3', 'text', 'homepage'],
        'promo_3_title' => ['Configure This Promo', 'text', 'homepage'],
        'promo_3_text' => ['Update this promo banner content from the Admin Settings panel.', 'textarea', 'homepage'],
        'promo_3_button' => ['Shop Now', 'text', 'homepage'],
        'promo_3_link' => ['/categories', 'text', 'homepage'],
        'promise_label' => ['Our Promise', 'text', 'homepage'],
        'promise_title' => ['Why Customers Choose Us', 'text', 'homepage'],
        'promise_text' => ['Configure this section from the Admin Settings panel to highlight your unique value proposition.', 'textarea', 'homepage'],
        'why_1_title' => ['Quality Products', 'text', 'homepage'],
        'why_1_text' => ['Update this feature in Admin Settings to describe your first key benefit.', 'textarea', 'homepage'],
        'why_2_title' => ['Satisfaction Guaranteed', 'text', 'homepage'],
        'why_2_text' => ['Update this feature in Admin Settings to describe your second key benefit.', 'textarea', 'homepage'],
        'why_3_title' => ['Fast, Reliable Delivery', 'text', 'homepage'],
        'why_3_text' => ['Update this feature in Admin Settings to describe your third key benefit.', 'textarea', 'homepage'],
        'why_4_title' => ['Trusted by Customers', 'text', 'homepage'],
        'why_4_text' => ['Update this feature in Admin Settings to describe your fourth key benefit.', 'textarea', 'homepage'],
        'reviews_label' => ['Reviews', 'text', 'homepage'],
        'reviews_title' => ['What Our Customers Say', 'text', 'homepage'],
        'review_1_name' => ['Customer A.', 'text', 'homepage'],
        'review_1_location' => ['City', 'text', 'homepage'],
        'review_1_text' => ['Update this review from the Admin Settings panel to show a real customer testimonial.', 'textarea', 'homepage'],
        'review_2_name' => ['Customer B.', 'text', 'homepage'],
        'review_2_location' => ['City', 'text', 'homepage'],
        'review_2_text' => ['Update this review from the Admin Settings panel to show a real customer testimonial.', 'textarea', 'homepage'],
        'review_3_name' => ['Customer C.', 'text', 'homepage'],
        'review_3_location' => ['City', 'text', 'homepage'],
        'review_3_text' => ['Update this review from the Admin Settings panel to show a real customer testimonial.', 'textarea', 'homepage'],
        'review_4_name' => ['Customer D.', 'text', 'homepage'],
        'review_4_location' => ['City', 'text', 'homepage'],
        'review_4_text' => ['Update this review from the Admin Settings panel to show a real customer testimonial.', 'textarea', 'homepage'],
        'review_5_name' => ['Customer E.', 'text', 'homepage'],
        'review_5_location' => ['City', 'text', 'homepage'],
        'review_5_text' => ['Update this review from the Admin Settings panel to show a real customer testimonial.', 'textarea', 'homepage'],
        'review_6_name' => ['Customer F.', 'text', 'homepage'],
        'review_6_location' => ['City', 'text', 'homepage'],
        'review_6_text' => ['Update this review from the Admin Settings panel to show a real customer testimonial.', 'textarea', 'homepage'],
        'payment_online_url' => ['', 'text', 'payments'],

        'social_facebook'  => ['', 'text', 'social'],
        'social_instagram' => ['', 'text', 'social'],
        'social_twitter'   => ['', 'text', 'social'],
        'social_youtube'   => ['', 'text', 'social'],
        'social_tiktok'    => ['', 'text', 'social'],
        'social_whatsapp'  => ['', 'text', 'social'],
        'social_linkedin'  => ['', 'text', 'social'],

        'shipping_free_above' => ['50', 'number', 'shipping'],
        'shipping_charge' => ['4.99', 'number', 'shipping'],
        'tax_percentage' => ['0', 'number', 'tax'],
        'currency_symbol' => ['$', 'text', 'general'],
        'currency_code'   => ['USD', 'text', 'general'],
        'active_theme'    => ['default', 'text', 'general'],
        'newsletter_title' => ['Stay in the loop', 'text', 'footer'],
        'maintenance_mode' => ['0', 'boolean', 'general'],

        'delivery_free_above' => ['50', 'number', 'delivery'],
        'delivery_free_enabled' => ['1', 'boolean', 'delivery'],
        'delivery_local_fee' => ['2.95', 'number', 'delivery'],
        'delivery_standard_fee' => ['4.95', 'number', 'delivery'],
        'delivery_small_order_min' => ['25', 'number', 'delivery'],
        'delivery_small_order_fee' => ['1.50', 'number', 'delivery'],
        'delivery_small_order_enabled' => ['1', 'boolean', 'delivery'],
        'delivery_local_zone_label' => ['Local delivery', 'text', 'delivery'],
        'delivery_standard_zone_label' => ['Standard delivery', 'text', 'delivery'],
        'delivery_local_keywords' => ['', 'text', 'delivery'],
        'delivery_local_postcode_prefixes' => ['', 'text', 'delivery'],

        'google_analytics_id' => ['', 'text', 'seo'],
        'meta_title' => [(getenv('SITE_NAME') ?: 'Your Store') . ' — Online Shop', 'text', 'seo'],
        'meta_description' => ['Shop quality products online. Configure this description in Admin Settings.', 'textarea', 'seo'],
        'meta_keywords' => ['online store, ecommerce, quality products', 'text', 'seo'],

        'smtp_host' => ['', 'text', 'email'],
        'smtp_port' => ['587', 'number', 'email'],
        'smtp_encryption' => ['tls', 'text', 'email'],
        'smtp_username' => ['', 'text', 'email'],
        'smtp_password' => ['', 'text', 'email'],
        'smtp_from_email' => [getenv('SITE_EMAIL') ?: 'hello@example.com', 'text', 'email'],
        'smtp_from_name' => [getenv('SITE_NAME') ?: 'Your Store', 'text', 'email'],
        'admin_email' => [getenv('SITE_EMAIL') ?: 'hello@example.com', 'text', 'email'],
        'email_enabled' => ['1', 'boolean', 'email'],
        'whatsapp_enabled' => ['0', 'boolean', 'email'],
        'whatsapp_number' => ['', 'text', 'email'],
        'whatsapp_api_key' => ['', 'text', 'email'],
    ];
}

function brandingDefaultValue(string $key, string $fallback = ''): string {
    $defaults = brandingDefaults();
    return isset($defaults[$key]) ? (string)$defaults[$key][0] : $fallback;
}

function brandingSettingGroup(string $key): string {
    $defaults = brandingDefaults();
    if (isset($defaults[$key])) return $defaults[$key][2];
    if (str_starts_with($key, 'delivery_')) return 'delivery';
    if (str_starts_with($key, 'hero_') || str_starts_with($key, 'trust_') || str_starts_with($key, 'promo_') || str_starts_with($key, 'home_') || str_starts_with($key, 'promise_') || str_starts_with($key, 'why_') || str_starts_with($key, 'reviews_') || str_starts_with($key, 'review_')) return 'homepage';
    if (str_starts_with($key, 'social_')) return 'social';
    if (str_starts_with($key, 'section_enabled_') || str_starts_with($key, 'section_order_')) return 'sections';
    if (str_starts_with($key, 'smtp_') || in_array($key, ['admin_email', 'email_enabled', 'whatsapp_enabled', 'whatsapp_number', 'whatsapp_api_key'], true)) return 'email';
    if (str_starts_with($key, 'contact_') || str_starts_with($key, 'business_')) return 'contact';
    if (str_starts_with($key, 'meta_') || $key === 'google_analytics_id' || $key === 'site_description') return 'seo';
    if (str_starts_with($key, 'footer_') || in_array($key, ['newsletter_desc', 'newsletter_title'], true)) return 'footer';
    if (str_starts_with($key, 'shipping_')) return 'shipping';
    if ($key === 'active_theme') return 'general';
    return 'general';
}

function seedDefaultSiteSettings(PDO $db): void {
    static $seeded = false;
    if ($seeded) return;
    $seeded = true;

    $stmt = $db->prepare("INSERT IGNORE INTO site_settings
        (setting_key, setting_value, setting_type, setting_group)
        VALUES (:key, :val, :type, :grp)");

    foreach (brandingDefaults() as $key => [$value, $type, $group]) {
        $stmt->execute([
            ':key' => $key,
            ':val' => (string)$value,
            ':type' => $type,
            ':grp' => $group,
        ]);
    }
}

function migrateLegacyBrandSettings(PDO $db): void {
    static $normalized = false;
    if ($normalized) return;
    $normalized = true;

    $defaults = brandingDefaults();
    $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings");
    $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    $update = $db->prepare("UPDATE site_settings
        SET setting_value = :value, setting_type = :type, setting_group = :grp
        WHERE setting_key = :key");

    foreach ($rows as $key => $value) {
        if (!isset($defaults[$key])) continue;
        [$defaultValue, $type, $group] = $defaults[$key];
        $update->execute([
            ':key' => $key,
            ':value' => ($value === null ? (string)$defaultValue : (string)$value),
            ':type' => $type,
            ':grp' => $group,
        ]);
    }

    // Older admin uploads could save the file but leave the default logo setting unchanged.
    $currentLogo = (string)($rows['site_logo'] ?? '');
    $uploadedLogo = __DIR__ . '/../uploads/branding/logo.png';
    if (($currentLogo === '' || $currentLogo === '/logo.svg' || $currentLogo === '/logo.png') && file_exists($uploadedLogo)) {
        $update->execute([
            ':key' => 'site_logo',
            ':value' => '/uploads/branding/logo.png',
            ':type' => 'image',
            ':grp' => 'general',
        ]);
    }
}

function loadSiteSettings(PDO $db, ?string $group = null): array {
    seedDefaultSiteSettings($db);
    migrateLegacyBrandSettings($db);

    $sql = "SELECT setting_key, setting_value FROM site_settings";
    $params = [];
    if ($group) {
        $sql .= " WHERE setting_group = :group";
        $params[':group'] = $group;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR) ?: [];

    if (!$group) {
        foreach (brandingDefaults() as $key => [$value]) {
            if (!array_key_exists($key, $settings)) $settings[$key] = (string)$value;
        }
    }

    return $settings;
}

function appBaseUrl(array $settings = []): string {
    $url = trim((string)($settings['site_url'] ?? getenv('APP_URL') ?: ''));
    if ($url !== '') return rtrim($url, '/');

    $host = $_SERVER['HTTP_HOST'] ?? '';
    if ($host === '') return '';

    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? null) == 443);
    return ($isHttps ? 'https://' : 'http://') . $host;
}

function settingOrDefault(array $settings, string $key, string $fallback = ''): string {
    $value = $settings[$key] ?? null;
    if ($value !== null && $value !== '') return (string)$value;
    return brandingDefaultValue($key, $fallback);
}
