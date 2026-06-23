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
        'site_name' => ['The Desi', 'text', 'general'],
        'site_tagline' => ['Premium South Asian groceries delivered across the UK.', 'text', 'general'],
        'site_description' => ['The Desi brings authentic South Asian groceries, spices, halal meats and daily essentials straight to your door across the UK.', 'textarea', 'seo'],
        'site_url' => [$appUrl, 'text', 'general'],
        'admin_url' => [$appUrl ? $appUrl . '/admin/orders.php' : '/admin/orders.php', 'text', 'general'],
        'site_logo' => ['/logo.png', 'image', 'general'],
        'site_favicon' => ['/favicon.ico', 'image', 'general'],
        'site_email' => ['hello@thedesi.co.uk', 'text', 'general'],
        'site_phone' => ['', 'text', 'general'],
        'site_address' => ['London, United Kingdom', 'textarea', 'general'],
        'business_city' => ['London', 'text', 'contact'],
        'business_region' => ['England', 'text', 'contact'],
        'business_country' => ['GB', 'text', 'contact'],

        'contact_email' => ['hello@thedesi.co.uk', 'text', 'contact'],
        'contact_address' => ['London, United Kingdom', 'text', 'contact'],
        'contact_hours' => ['Mon–Sat: 9am–6pm | Sun: 10am–4pm', 'textarea', 'contact'],
        'contact_map_embed' => ['', 'textarea', 'contact'],
        'contact_phone'     => ['', 'text', 'contact'],

        'footer_about' => ['Your one-stop shop for authentic South Asian groceries, spices, halal meats and everyday essentials — delivered across the UK.', 'textarea', 'footer'],
        'footer_copyright' => ['© 2026 The Desi. All rights reserved.', 'text', 'footer'],
        'newsletter_desc' => ['Get exclusive deals, new arrivals and weekly offers delivered straight to your inbox.', 'textarea', 'footer'],
        'header_offer_text' => ['Free UK delivery on orders over £50', 'text', 'header'],
        'hero_eyebrow' => ['Proudly halal', 'text', 'homepage'],
        'hero_media_badge' => ['Premium Grocery Selection', 'text', 'homepage'],
        'hero_media_caption_title' => ['Fresh Picks', 'text', 'homepage'],
        'hero_media_caption_meta' => ['Curated daily', 'text', 'homepage'],
        'trust_item_1_text' => ['100% Halal Certified', 'text', 'homepage'],
        'trust_item_2_text' => ['Free UK Delivery Over £50', 'text', 'homepage'],
        'trust_item_3_text' => ['Freshness Guaranteed', 'text', 'homepage'],
        'trust_item_4_text' => ['Next-Day UK Dispatch', 'text', 'homepage'],
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
        'why_1_text' => ['All meats are certified halal by UK-recognised authorities (HFA & AHDB). Shop with complete confidence and peace of mind.', 'textarea', 'homepage'],
        'why_2_title' => ['Freshness Guaranteed', 'text', 'homepage'],
        'why_2_text' => ['We source produce daily and guarantee freshness on every delivery. Not satisfied? We will make it right — no questions asked.', 'textarea', 'homepage'],
        'why_3_title' => ['Fast UK Delivery', 'text', 'homepage'],
        'why_3_text' => ['Next-day delivery across England, Scotland and Wales. Every order tracked and delivered to your door on time.', 'textarea', 'homepage'],
        'why_4_title' => ['Trusted by 5,000+ UK Families', 'text', 'homepage'],
        'why_4_text' => ['From Birmingham to Bradford, Manchester to London — thousands of British South Asian families shop with us every week.', 'textarea', 'homepage'],
        'reviews_label' => ['Reviews', 'text', 'homepage'],
        'reviews_title' => ['What Our Customers Say', 'text', 'homepage'],
        'review_1_name' => ['Fatima A.', 'text', 'homepage'],
        'review_1_location' => ['Birmingham', 'text', 'homepage'],
        'review_1_text' => ['The quality of the halal meat is outstanding — always fresh and delivered next day. Our family has been shopping here for over a year and we would not go anywhere else.', 'textarea', 'homepage'],
        'review_2_name' => ['Mohammed K.', 'text', 'homepage'],
        'review_2_location' => ['London', 'text', 'homepage'],
        'review_2_text' => ['Best spice selection I have found in the UK. The whole spices are so fresh and aromatic. Prices are brilliant too — far better than the local shops.', 'textarea', 'homepage'],
        'review_3_name' => ['Aisha R.', 'text', 'homepage'],
        'review_3_location' => ['Manchester', 'text', 'homepage'],
        'review_3_text' => ['Superb quality vegetables and the customer service is excellent. They resolved a query with my order within the hour. Will definitely be ordering again!', 'textarea', 'homepage'],
        'review_4_name' => ['Yusuf H.', 'text', 'homepage'],
        'review_4_location' => ['Bradford', 'text', 'homepage'],
        'review_4_text' => ['The packaging is brilliant and everything arrives so fresh. The lamb was butchered perfectly — exactly how we like it. The Desi is now our weekly shop.', 'textarea', 'homepage'],
        'review_5_name' => ['Nadia S.', 'text', 'homepage'],
        'review_5_location' => ['Leicester', 'text', 'homepage'],
        'review_5_text' => ['So convenient to have desi groceries delivered straight to my door in Leicester. The website is easy to use and they always have everything in stock.', 'textarea', 'homepage'],
        'review_6_name' => ['Omar B.', 'text', 'homepage'],
        'review_6_location' => ['Luton', 'text', 'homepage'],
        'review_6_text' => ['Great range of South Asian ingredients that I could never find in regular supermarkets. Top quality products at very fair prices. Highly recommend!', 'textarea', 'homepage'],
        'payment_online_url' => ['', 'text', 'payments'],

        'social_facebook' => ['', 'text', 'social'],
        'social_instagram' => ['', 'text', 'social'],
        'social_twitter' => ['', 'text', 'social'],
        'social_youtube' => ['', 'text', 'social'],
        'social_whatsapp' => ['', 'text', 'social'],

        'shipping_free_above' => ['50', 'number', 'shipping'],
        'shipping_charge' => ['4.99', 'number', 'shipping'],
        'tax_percentage' => ['0', 'number', 'tax'],
        'currency_symbol' => ['£', 'text', 'general'],
        'currency_code' => ['GBP', 'text', 'general'],
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
        'meta_title' => ['The Desi — Premium South Asian Groceries Delivered Across the UK', 'text', 'seo'],
        'meta_description' => ['Shop authentic desi groceries, halal meats, spices, snacks and daily essentials online. Next-day UK delivery. 100% halal certified. Order from The Desi today.', 'textarea', 'seo'],
        'meta_keywords' => ['desi groceries uk, south asian food delivery, halal grocery online uk, desi supermarket, indian groceries uk, pakistani groceries uk', 'text', 'seo'],

        'smtp_host' => ['', 'text', 'email'],
        'smtp_port' => ['587', 'number', 'email'],
        'smtp_encryption' => ['tls', 'text', 'email'],
        'smtp_username' => ['', 'text', 'email'],
        'smtp_password' => ['', 'text', 'email'],
        'smtp_from_email' => ['hello@thedesi.co.uk', 'text', 'email'],
        'smtp_from_name' => ['The Desi', 'text', 'email'],
        'admin_email' => ['hello@thedesi.co.uk', 'text', 'email'],
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
