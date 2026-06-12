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
        'site_name' => ['Your Store', 'text', 'general'],
        'site_tagline' => ['White-label ecommerce storefront', 'text', 'general'],
        'site_description' => ['A reusable ecommerce storefront ready for your brand.', 'textarea', 'seo'],
        'site_url' => [$appUrl, 'text', 'general'],
        'admin_url' => [$appUrl ? $appUrl . '/admin/orders.php' : '/admin/orders.php', 'text', 'general'],
        'site_logo' => ['/logo.png', 'image', 'general'],
        'site_favicon' => ['/favicon.ico', 'image', 'general'],
        'site_email' => ['hello@example.com', 'text', 'general'],
        'site_phone' => ['', 'text', 'general'],
        'site_address' => ['Configure store address in Admin Settings', 'textarea', 'general'],
        'business_city' => ['', 'text', 'contact'],
        'business_region' => ['', 'text', 'contact'],
        'business_country' => ['US', 'text', 'contact'],

        'contact_email' => ['hello@example.com', 'text', 'contact'],
        'contact_address' => ['Configure store address in Admin Settings', 'text', 'contact'],
        'contact_hours' => ['Mon-Fri: 9am-6pm', 'textarea', 'contact'],
        'contact_map_embed' => ['', 'textarea', 'contact'],

        'footer_about' => ['A reusable ecommerce storefront. Update this copy in Admin Settings for each new brand.', 'textarea', 'footer'],
        'footer_copyright' => ['© 2026 Your Store. All rights reserved.', 'text', 'footer'],
        'newsletter_desc' => ['Get product updates, offers, and store news straight to your inbox.', 'textarea', 'footer'],
        'header_offer_text' => ['Free delivery options can be configured in Admin Settings.', 'text', 'header'],
        'hero_eyebrow' => ['Proudly halal', 'text', 'homepage'],
        'hero_media_badge' => ['Premium Grocery Selection', 'text', 'homepage'],
        'hero_media_caption_title' => ['Fresh Picks', 'text', 'homepage'],
        'hero_media_caption_meta' => ['Curated daily', 'text', 'homepage'],
        'trust_item_1_text' => ['100% Halal Certified', 'text', 'homepage'],
        'trust_item_2_text' => ['Free Delivery Over €50', 'text', 'homepage'],
        'trust_item_3_text' => ['Freshness Guaranteed', 'text', 'homepage'],
        'trust_item_4_text' => ['Same-Day Dispatch', 'text', 'homepage'],
        'home_categories_label' => ['Browse', 'text', 'homepage'],
        'home_categories_title' => ['Shop by Category', 'text', 'homepage'],
        'home_categories_link_text' => ['All Categories', 'text', 'homepage'],
        'home_featured_label' => ['Bestsellers', 'text', 'homepage'],
        'home_featured_title' => ['Featured Products', 'text', 'homepage'],
        'home_featured_link_text' => ['View All', 'text', 'homepage'],
        'home_new_label' => ['Just In', 'text', 'homepage'],
        'home_new_title' => ['New Arrivals', 'text', 'homepage'],
        'home_new_link_text' => ['View All', 'text', 'homepage'],
        'promo_1_label' => ['Fresh Daily', 'text', 'homepage'],
        'promo_1_title' => ['Premium Halal Meats & Poultry', 'text', 'homepage'],
        'promo_1_text' => ['Hand-selected, freshly cut halal chicken, mutton, beef and seafood.', 'textarea', 'homepage'],
        'promo_1_button' => ['Shop Meats', 'text', 'homepage'],
        'promo_1_link' => ['/categories', 'text', 'homepage'],
        'promo_2_label' => ['Authentic', 'text', 'homepage'],
        'promo_2_title' => ['Premium Spices & Seasonings', 'text', 'homepage'],
        'promo_2_text' => ['Whole spices, blends and masalas sourced directly from origin farms.', 'textarea', 'homepage'],
        'promo_2_button' => ['Shop Spices', 'text', 'homepage'],
        'promo_2_link' => ['/categories', 'text', 'homepage'],
        'promo_3_label' => ['Farm to Door', 'text', 'homepage'],
        'promo_3_title' => ['Fresh Fruits & Vegetables', 'text', 'homepage'],
        'promo_3_text' => ['Locally sourced and imported produce delivered fresh every morning.', 'textarea', 'homepage'],
        'promo_3_button' => ['Shop Produce', 'text', 'homepage'],
        'promo_3_link' => ['/categories', 'text', 'homepage'],
        'promise_label' => ['Our Promise', 'text', 'homepage'],
        'promise_title' => ['Why Families Choose Us', 'text', 'homepage'],
        'promise_text' => ['We bring the freshest halal products straight to your door with a quality guarantee on every order.', 'textarea', 'homepage'],
        'why_1_title' => ['100% Halal Certified', 'text', 'homepage'],
        'why_1_text' => ['All meats are certified halal by recognised authorities. Shop with complete confidence and peace of mind.', 'textarea', 'homepage'],
        'why_2_title' => ['Freshness Guaranteed', 'text', 'homepage'],
        'why_2_text' => ['We source produce daily and guarantee freshness on delivery. Not satisfied? We\'ll make it right.', 'textarea', 'homepage'],
        'why_3_title' => ['Fast, Reliable Delivery', 'text', 'homepage'],
        'why_3_text' => ['Same-day and next-day delivery options. Your order packed with care and delivered on time, every time.', 'textarea', 'homepage'],
        'why_4_title' => ['Trusted by 5,000+ Families', 'text', 'homepage'],
        'why_4_text' => ['Our community of satisfied customers grows every day. Join thousands of families across the country.', 'textarea', 'homepage'],
        'reviews_label' => ['Reviews', 'text', 'homepage'],
        'reviews_title' => ['What Our Customers Say', 'text', 'homepage'],
        'review_1_name' => ['Fatima A.', 'text', 'homepage'],
        'review_1_location' => ['Dublin', 'text', 'homepage'],
        'review_1_text' => ['The quality of the halal meat is outstanding. Always fresh and delivered on time. Our family has been shopping here for over a year now.', 'textarea', 'homepage'],
        'review_2_name' => ['Mohammed K.', 'text', 'homepage'],
        'review_2_location' => ['Cork', 'text', 'homepage'],
        'review_2_text' => ['Best spice selection I have found in Ireland. The whole spices are so fresh and aromatic. Prices are excellent too. Highly recommend!', 'textarea', 'homepage'],
        'review_3_name' => ['Aisha R.', 'text', 'homepage'],
        'review_3_location' => ['Galway', 'text', 'homepage'],
        'review_3_text' => ['Superb quality vegetables, always fresh. The customer service is also brilliant - they resolved a small issue with my order within the hour.', 'textarea', 'homepage'],
        'review_4_name' => ['Yusuf H.', 'text', 'homepage'],
        'review_4_location' => ['Limerick', 'text', 'homepage'],
        'review_4_text' => ['I was so impressed by the packaging and freshness. The lamb was butchered perfectly. Will definitely be a regular customer.', 'textarea', 'homepage'],
        'review_5_name' => ['Nadia S.', 'text', 'homepage'],
        'review_5_location' => ['Waterford', 'text', 'homepage'],
        'review_5_text' => ['So convenient to have halal groceries delivered to my door. The app is easy to use and they always have what I need in stock.', 'textarea', 'homepage'],
        'review_6_name' => ['Omar B.', 'text', 'homepage'],
        'review_6_location' => ['Belfast', 'text', 'homepage'],
        'review_6_text' => ['Great range of ethnic ingredients that I cannot find in regular supermarkets. Top quality products at very fair prices.', 'textarea', 'homepage'],
        'payment_online_url' => ['', 'text', 'payments'],

        'social_facebook' => ['', 'text', 'social'],
        'social_instagram' => ['', 'text', 'social'],
        'social_twitter' => ['', 'text', 'social'],
        'social_youtube' => ['', 'text', 'social'],
        'social_whatsapp' => ['', 'text', 'social'],

        'shipping_free_above' => ['50', 'number', 'shipping'],
        'shipping_charge' => ['5', 'number', 'shipping'],
        'tax_percentage' => ['0', 'number', 'tax'],
        'currency_symbol' => ['$', 'text', 'general'],
        'currency_code' => ['USD', 'text', 'general'],
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
        'meta_title' => ['Your Store - Online Store', 'text', 'seo'],
        'meta_description' => ['Shop products online. Fast checkout, product management, customer management, and order management are ready to customize.', 'textarea', 'seo'],
        'meta_keywords' => ['online store, ecommerce, white label storefront', 'text', 'seo'],

        'smtp_host' => ['', 'text', 'email'],
        'smtp_port' => ['587', 'number', 'email'],
        'smtp_encryption' => ['tls', 'text', 'email'],
        'smtp_username' => ['', 'text', 'email'],
        'smtp_password' => ['', 'text', 'email'],
        'smtp_from_email' => ['hello@example.com', 'text', 'email'],
        'smtp_from_name' => ['Your Store', 'text', 'email'],
        'admin_email' => ['hello@example.com', 'text', 'email'],
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
    if (str_starts_with($key, 'smtp_') || in_array($key, ['admin_email', 'email_enabled', 'whatsapp_enabled', 'whatsapp_number', 'whatsapp_api_key'], true)) return 'email';
    if (str_starts_with($key, 'contact_') || str_starts_with($key, 'business_')) return 'contact';
    if (str_starts_with($key, 'meta_') || $key === 'google_analytics_id' || $key === 'site_description') return 'seo';
    if (str_starts_with($key, 'footer_') || $key === 'newsletter_desc') return 'footer';
    if (str_starts_with($key, 'shipping_')) return 'shipping';
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
