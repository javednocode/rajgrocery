-- ============================================================
-- WHITE-LABEL ECOMMERCE ENGINE — Generic Demo Data
-- For testing and onboarding. Replace with real content.
-- All brand references are intentionally generic/placeholder.
-- ============================================================

SET NAMES utf8mb4;
SET foreign_key_checks = 0;

-- ──────────────────────────────────────────────
-- SITE SETTINGS — Minimal defaults for demo
-- ──────────────────────────────────────────────
INSERT IGNORE INTO `site_settings` (`site_id`, `setting_key`, `setting_value`, `setting_type`, `setting_group`) VALUES
(1, 'site_name',         'Demo Store',                                                   'text',    'general'),
(1, 'site_tagline',      'Quality products delivered to your door.',                     'text',    'general'),
(1, 'site_email',        'hello@example.com',                                            'text',    'general'),
(1, 'currency_symbol',   '$',                                                            'text',    'general'),
(1, 'currency_code',     'USD',                                                          'text',    'general'),
(1, 'active_theme',      'default',                                                      'text',    'general'),
(1, 'hero_eyebrow',      'Fresh & Quality',                                              'text',    'homepage'),
(1, 'hero_title',        'Everything you need, delivered to your door.',                 'text',    'homepage'),
(1, 'footer_copyright',  '© 2025 Demo Store. All rights reserved.',                     'text',    'footer'),
(1, 'footer_about',      'Your one-stop shop for quality products delivered fast.',      'textarea','footer'),
(1, 'meta_title',        'Demo Store — Online Shop',                                     'text',    'seo'),
(1, 'meta_description',  'Shop quality products online. Fast delivery, great prices.',   'textarea','seo'),
(1, 'shipping_free_above','50',                                                          'number',  'shipping'),
(1, 'shipping_charge',   '4.99',                                                         'number',  'shipping');

-- ──────────────────────────────────────────────
-- CATEGORIES
-- ──────────────────────────────────────────────
INSERT IGNORE INTO `categories` (`id`, `site_id`, `name`, `slug`, `description`, `sort_order`, `is_active`, `is_featured`) VALUES
(1, 1, 'Snacks & Chips',    'snacks-chips',    'A wide selection of snacks and chips.',         1, 1, 1),
(2, 1, 'Beverages',         'beverages',        'Cold drinks, juices, teas and more.',           2, 1, 1),
(3, 1, 'Spices & Masalas',  'spices-masalas',  'Premium spices and spice blends.',              3, 1, 1),
(4, 1, 'Sweets & Confectionery', 'sweets',     'Traditional sweets and confectionery.',         4, 1, 1),
(5, 1, 'Staples & Grains',  'staples-grains',  'Rice, flour, lentils and everyday staples.',    5, 1, 1),
(6, 1, 'Dairy & Eggs',      'dairy-eggs',       'Fresh dairy products and eggs.',                6, 1, 0),
(7, 1, 'Frozen Foods',      'frozen-foods',     'Ready-to-cook frozen products.',                7, 1, 0),
(8, 1, 'Personal Care',     'personal-care',    'Health and personal care products.',            8, 1, 0);

-- ──────────────────────────────────────────────
-- DEMO PRODUCTS
-- ──────────────────────────────────────────────
INSERT IGNORE INTO `products`
(`id`, `site_id`, `name`, `slug`, `short_description`, `price`, `sale_price`, `stock`, `unit`, `is_active`, `is_featured`, `is_trending`, `is_new`)
VALUES
(1,  1, 'Classic Salted Chips 200g',     'classic-salted-chips-200g',    'Crispy, light salted potato chips.',        2.49, NULL, 250, 'pack',  1, 1, 1, 0),
(2,  1, 'Spicy Masala Peanuts 250g',     'spicy-masala-peanuts-250g',    'Roasted peanuts with masala coating.',      1.99, 1.49, 180, 'pack',  1, 1, 1, 0),
(3,  1, 'Mango Juice 1L',                'mango-juice-1l',               '100% pure mango juice, no added sugar.',   3.29, NULL, 120, 'bottle',1, 1, 0, 0),
(4,  1, 'Premium Basmati Rice 5kg',      'premium-basmati-rice-5kg',     'Long grain aged basmati rice.',            12.99, 9.99, 80,  'bag',   1, 1, 0, 0),
(5,  1, 'Garam Masala Blend 100g',       'garam-masala-blend-100g',      'Classic aromatic garam masala.',            2.79, NULL, 200, 'jar',   1, 0, 0, 1),
(6,  1, 'Gulab Jamun Mix 200g',          'gulab-jamun-mix-200g',         'Ready-to-cook gulab jamun mix.',            2.49, NULL, 150, 'pack',  1, 0, 0, 1),
(7,  1, 'Whole Wheat Atta 5kg',          'whole-wheat-atta-5kg',         'Stone ground whole wheat flour.',           7.99, 6.49, 90,  'bag',   1, 0, 1, 0),
(8,  1, 'Masala Chai Mix 250g',          'masala-chai-mix-250g',         'Traditional spiced tea blend.',             3.99, NULL, 130, 'pack',  1, 0, 0, 1),
(9,  1, 'Frozen Aloo Paratha (8pcs)',    'frozen-aloo-paratha-8pcs',     'Ready-to-cook stuffed flatbreads.',         4.99, NULL, 60,  'pack',  1, 1, 1, 0),
(10, 1, 'Desi Ghee 500ml',              'desi-ghee-500ml',              'Pure clarified butter, traditional taste.',  8.49, 7.99, 70,  'jar',   1, 1, 0, 0),
(11, 1, 'Turmeric Powder 200g',          'turmeric-powder-200g',         'Pure ground turmeric.',                    1.99, NULL, 220, 'pack',  1, 0, 0, 0),
(12, 1, 'Tamarind Paste 400g',           'tamarind-paste-400g',          'Thick tamarind paste for cooking.',         2.29, NULL, 140, 'jar',   1, 0, 0, 0),
(13, 1, 'Rose Sharbat 750ml',            'rose-sharbat-750ml',           'Sweet rose-flavoured syrup.',               3.49, 2.99, 100, 'bottle',1, 0, 1, 0),
(14, 1, 'Chickpea Flour (Besan) 1kg',   'chickpea-flour-besan-1kg',     'Fine grade gram flour.',                    2.99, NULL, 160, 'bag',   1, 0, 0, 0),
(15, 1, 'Organic Coconut Oil 500ml',    'organic-coconut-oil-500ml',    'Cold-pressed extra virgin coconut oil.',    6.99, 5.99, 85,  'bottle',1, 1, 0, 1);

-- ──────────────────────────────────────────────
-- PRODUCT → CATEGORY LINKS
-- ──────────────────────────────────────────────
INSERT IGNORE INTO `product_categories` (`product_id`, `category_id`) VALUES
(1, 1), (2, 1),         -- Snacks
(3, 2), (13, 2),        -- Beverages
(5, 3), (8, 3), (11, 3),(12, 3), -- Spices
(6, 4),                  -- Sweets
(4, 5), (7, 5), (14, 5),-- Staples
(10, 6), (15, 6),        -- Dairy
(9, 7);                  -- Frozen

-- ──────────────────────────────────────────────
-- DEMO BANNERS
-- ──────────────────────────────────────────────
INSERT IGNORE INTO `banners`
(`id`, `site_id`, `title`, `subtitle`, `image`, `media_type`, `position`, `sort_order`, `is_active`, `button_text`, `link`)
VALUES
(1, 1, 'Welcome to Our Store',     'Quality products delivered to your door.',   '/uploads/banners/demo-hero-1.jpg', 'image', 'hero',  1, 1, 'Shop Now', '/categories'),
(2, 1, 'Fresh Arrivals This Week', 'Discover new products added every day.',     '/uploads/banners/demo-hero-2.jpg', 'image', 'hero',  2, 1, 'Explore',  '/categories'),
(3, 1, 'Free Delivery on $50+',    'Shop more, save more. No code needed.',      '/uploads/banners/demo-promo-1.jpg','image', 'promo', 1, 1, 'Shop Now', '/categories');

-- ──────────────────────────────────────────────
-- DEMO COUPON
-- ──────────────────────────────────────────────
INSERT IGNORE INTO `coupons`
(`id`, `site_id`, `code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `is_active`, `expires_at`)
VALUES
(1, 1, 'WELCOME10', '10% off first order',   'percentage', 10.00, 20.00, 1, DATE_ADD(NOW(), INTERVAL 1 YEAR)),
(2, 1, 'SAVE5',     '$5 off orders over $40', 'fixed',       5.00, 40.00, 1, DATE_ADD(NOW(), INTERVAL 1 YEAR));

-- ──────────────────────────────────────────────
-- BLOG CATEGORIES
-- ──────────────────────────────────────────────
INSERT IGNORE INTO `blog_categories` (`id`, `site_id`, `name`, `slug`) VALUES
(1, 1, 'Recipes',    'recipes'),
(2, 1, 'Store News', 'store-news'),
(3, 1, 'Tips & Guides', 'tips-guides');

-- ──────────────────────────────────────────────
-- DEMO BLOG POSTS
-- ──────────────────────────────────────────────
INSERT IGNORE INTO `blog_posts`
(`id`, `site_id`, `category_id`, `title`, `slug`, `excerpt`, `content`, `status`, `author`, `published_at`, `meta_title`, `meta_description`)
VALUES
(1, 1, 1, '5 Easy Recipes Using Everyday Pantry Items',
 '5-easy-recipes-everyday-pantry',
 'Make delicious meals at home using simple ingredients you already have.',
 '<p>Cooking great food at home doesn\'t have to be complicated. Here are 5 easy recipes using ingredients you likely already have in your pantry.</p><h2>1. Simple Spiced Rice</h2><p>Combine basmati rice with whole spices for a fragrant, flavourful side dish in under 30 minutes.</p><h2>2. Quick Chana Masala</h2><p>Canned chickpeas, tomatoes, and a good masala blend make this dish incredibly easy.</p>',
 'published', 'Admin', NOW(),
 '5 Easy Pantry Recipes — Demo Store', 'Make great food at home with these 5 simple pantry recipes.'),

(2, 1, 3, 'How to Store Spices for Maximum Freshness',
 'how-to-store-spices-freshness',
 'Learn the best ways to store your spices so they stay fresh and aromatic longer.',
 '<p>Spices are the heart of great cooking, but they lose potency when stored incorrectly. Follow these tips to keep your spices fresh.</p><h2>Keep Them Cool and Dry</h2><p>Store spices away from heat and humidity. A dedicated spice drawer or cupboard works best.</p>',
 'published', 'Admin', NOW(),
 'How to Store Spices — Demo Store', 'Keep your spices fresh with these simple storage tips.'),

(3, 1, 2, 'Welcome to Our Store!',
 'welcome-to-our-store',
 'We are excited to launch our online store. Find out what makes us different.',
 '<p>Welcome! We are thrilled to open our doors and bring quality products to your doorstep. Our team has carefully curated a range of products to make your life easier.</p>',
 'published', 'Admin', NOW(),
 'Welcome to Our Store!', 'We\'re open and ready to serve you.');

-- ──────────────────────────────────────────────
-- STATIC PAGES
-- ──────────────────────────────────────────────
INSERT IGNORE INTO `pages`
(`id`, `site_id`, `title`, `slug`, `content`, `meta_title`, `meta_description`, `is_active`)
VALUES
(1, 1, 'About Us',
 'about',
 '<h1>About Our Store</h1><p>We are a passionate team dedicated to bringing you the finest products at great prices. Our mission is to make quality products accessible to everyone, delivered straight to your door.</p><h2>Our Story</h2><p>Founded with a simple idea — make shopping easy, affordable, and enjoyable. Update this page from Admin → Static Pages to tell your brand story.</p>',
 'About Us', 'Learn more about our store and our mission.',
 1),

(2, 1, 'Delivery Information',
 'delivery',
 '<h1>Delivery Information</h1><p>We offer fast and reliable delivery. Update the delivery options from Admin → Delivery Settings.</p><h2>Free Delivery</h2><p>Enjoy free delivery on all orders over the minimum threshold set in your admin panel.</p>',
 'Delivery Information', 'Learn about our delivery options and timeframes.',
 1),

(3, 1, 'Privacy Policy',
 'privacy',
 '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p><p>Update this page from Admin → Static Pages to include your actual privacy policy.</p>',
 'Privacy Policy', 'Read our privacy policy and how we protect your data.',
 1),

(4, 1, 'Terms & Conditions',
 'terms',
 '<h1>Terms & Conditions</h1><p>By using our website and placing orders, you agree to our terms and conditions.</p><p>Update this page from Admin → Static Pages to include your actual terms.</p>',
 'Terms & Conditions', 'Read our terms and conditions of service.',
 1),

(5, 1, 'Returns & Refunds',
 'returns',
 '<h1>Returns & Refunds</h1><p>We want you to be completely happy with your purchase. If you are not satisfied, contact us and we will make it right.</p><p>Update this page from Admin → Static Pages to include your returns policy.</p>',
 'Returns & Refunds', 'Our returns and refunds policy — your satisfaction guaranteed.',
 1);

SET foreign_key_checks = 1;
