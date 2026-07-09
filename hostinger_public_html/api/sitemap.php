<?php
/**
 * XML Sitemap Generator
 * Generates a dynamic sitemap.xml from products, categories, blog posts and static pages.
 * Called via GET /sitemap.xml
 * No authentication required (public endpoint).
 */

function serveSitemap(PDO $db): void {
    $settings = [];
    try {
        require_once __DIR__ . '/../helpers/branding.php';
        $settings = loadSiteSettings($db);
    } catch (\Throwable $e) {}

    $baseUrl = rtrim($settings['site_url'] ?? (appBaseUrl($settings) ?: 'https://example.com'), '/');
    $now     = date('Y-m-d');

    // Try cache
    $cacheKey = 'sitemap_xml';
    if (function_exists('cacheGet')) {
        $cached = cacheGet($cacheKey);
        if ($cached) {
            header('Content-Type: application/xml; charset=utf-8');
            header('X-Cache: HIT');
            echo $cached;
            return;
        }
    }

    $urls = [];

    // ── Static Pages ──────────────────────────────────────────────────
    $urls[] = ['loc' => $baseUrl . '/',            'changefreq' => 'daily',   'priority' => '1.0', 'lastmod' => $now];
    $urls[] = ['loc' => $baseUrl . '/categories',  'changefreq' => 'weekly',  'priority' => '0.9', 'lastmod' => $now];
    $urls[] = ['loc' => $baseUrl . '/blog',        'changefreq' => 'weekly',  'priority' => '0.7', 'lastmod' => $now];
    $urls[] = ['loc' => $baseUrl . '/contact',     'changefreq' => 'monthly', 'priority' => '0.5', 'lastmod' => $now];

    // ── Static CMS Pages ─────────────────────────────────────────────
    try {
        $stmt = $db->prepare("SELECT slug, updated_at FROM pages WHERE is_active = 1 ORDER BY id");
        $stmt->execute();
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $page) {
            $urls[] = [
                'loc'        => $baseUrl . '/' . ltrim($page['slug'], '/'),
                'changefreq' => 'monthly',
                'priority'   => '0.5',
                'lastmod'    => $page['updated_at'] ? substr($page['updated_at'], 0, 10) : $now,
            ];
        }
    } catch (\Throwable $e) {}

    // ── Categories ───────────────────────────────────────────────────
    try {
        $stmt = $db->prepare("SELECT slug, updated_at FROM categories WHERE is_active = 1 ORDER BY sort_order");
        $stmt->execute();
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $cat) {
            $urls[] = [
                'loc'        => $baseUrl . '/categories/' . $cat['slug'],
                'changefreq' => 'weekly',
                'priority'   => '0.8',
                'lastmod'    => $cat['updated_at'] ? substr($cat['updated_at'], 0, 10) : $now,
            ];
        }
    } catch (\Throwable $e) {}

    // ── Products ─────────────────────────────────────────────────────
    try {
        $stmt = $db->prepare("SELECT slug, updated_at FROM products WHERE is_active = 1 ORDER BY is_featured DESC, sales_count DESC");
        $stmt->execute();
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $prod) {
            $urls[] = [
                'loc'        => $baseUrl . '/products/' . $prod['slug'],
                'changefreq' => 'weekly',
                'priority'   => '0.7',
                'lastmod'    => $prod['updated_at'] ? substr($prod['updated_at'], 0, 10) : $now,
            ];
        }
    } catch (\Throwable $e) {}

    // ── Blog Posts ───────────────────────────────────────────────────
    try {
        $stmt = $db->prepare("SELECT slug, updated_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC");
        $stmt->execute();
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $post) {
            $urls[] = [
                'loc'        => $baseUrl . '/blog/' . $post['slug'],
                'changefreq' => 'monthly',
                'priority'   => '0.6',
                'lastmod'    => $post['updated_at'] ? substr($post['updated_at'], 0, 10) : $now,
            ];
        }
    } catch (\Throwable $e) {}

    // ── Build XML ────────────────────────────────────────────────────
    $xml  = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    $xml .= "<?xml-stylesheet type=\"text/xsl\" href=\"/sitemap.xsl\"?>\n";
    $xml .= "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"\n";
    $xml .= "        xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">\n";

    foreach ($urls as $url) {
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . htmlspecialchars($url['loc'], ENT_XML1) . "</loc>\n";
        if (!empty($url['lastmod'])) {
            $xml .= "    <lastmod>" . htmlspecialchars($url['lastmod'], ENT_XML1) . "</lastmod>\n";
        }
        $xml .= "    <changefreq>" . htmlspecialchars($url['changefreq'] ?? 'monthly', ENT_XML1) . "</changefreq>\n";
        $xml .= "    <priority>" . htmlspecialchars($url['priority'] ?? '0.5', ENT_XML1) . "</priority>\n";
        $xml .= "  </url>\n";
    }

    $xml .= "</urlset>\n";

    // Cache for 6 hours
    if (function_exists('cacheSet')) {
        cacheSet($cacheKey, $xml, 21600);
    }

    header('Content-Type: application/xml; charset=utf-8');
    header('X-Cache: MISS');
    header('Cache-Control: public, max-age=3600');
    echo $xml;
}
