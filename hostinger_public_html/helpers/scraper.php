<?php
/**
 * Lightweight product scraping helpers for migration jobs.
 * Designed for migration previews, not as a general browser engine.
 */

function pm_validate_public_url(string $url): string {
    $url = trim($url);
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        throw new InvalidArgumentException('Invalid URL');
    }

    $parts = parse_url($url);
    $scheme = strtolower($parts['scheme'] ?? '');
    if (!in_array($scheme, ['http', 'https'], true)) {
        throw new InvalidArgumentException('Only http/https URLs are allowed');
    }

    $host = strtolower($parts['host'] ?? '');
    if ($host === '' || in_array($host, ['localhost', '127.0.0.1', '0.0.0.0'], true)) {
        throw new InvalidArgumentException('Internal URLs are not allowed');
    }

    $records = @dns_get_record($host, DNS_A + DNS_AAAA) ?: [];
    $ips = [];
    foreach ($records as $record) {
        $ip = $record['ip'] ?? $record['ipv6'] ?? null;
        if ($ip) $ips[] = $ip;
    }
    if (!$ips) $ips = @gethostbynamel($host) ?: [];
    if (!$ips) {
        throw new InvalidArgumentException('Host cannot be resolved');
    }
    foreach ($ips as $ip) {
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            throw new InvalidArgumentException('Private or reserved IP addresses are not allowed');
        }
    }

    return $url;
}

function pm_http_get(string $url, int $timeout = 20): ?string {
    pm_validate_public_url($url);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 4,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $type = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        pm_curl_close($ch);
        if ($body !== false && $code >= 200 && $code < 400 && (str_contains($type, 'text/') || str_contains($type, 'json') || str_contains($type, 'xml') || $type === '')) {
            return (string)$body;
        }
        return null;
    }

    $ctx = stream_context_create(['http' => ['timeout' => $timeout, 'user_agent' => 'Mozilla/5.0']]);
    $body = @file_get_contents($url, false, $ctx);
    return $body === false ? null : $body;
}

function pm_curl_close($ch): void {
    if (PHP_VERSION_ID < 80500) {
        curl_close($ch);
    }
}

function pm_short_text(string $text, int $limit): string {
    $text = trim($text);
    return function_exists('mb_substr') ? mb_substr($text, 0, $limit) : substr($text, 0, $limit);
}

function pm_abs_url(string $base, string $href): string {
    $href = trim($href);
    if ($href === '') return '';
    if (preg_match('#^https?://#i', $href)) return $href;
    if (str_starts_with($href, '//')) {
        $scheme = parse_url($base, PHP_URL_SCHEME) ?: 'https';
        return $scheme . ':' . $href;
    }
    $bp = parse_url($base);
    $origin = ($bp['scheme'] ?? 'https') . '://' . ($bp['host'] ?? '');
    if (!empty($bp['port'])) $origin .= ':' . $bp['port'];
    if (str_starts_with($href, '/')) return $origin . $href;
    $path = $bp['path'] ?? '/';
    $dir = preg_replace('#/[^/]*$#', '/', $path);
    return $origin . $dir . $href;
}

function pm_clean_html(?string $html): string {
    $html = (string)$html;
    $html = preg_replace('#<(script|style|iframe|noscript)[^>]*>.*?</\1>#is', '', $html);
    $html = preg_replace('/\s(on[a-z]+|style)=(".*?"|\'.*?\'|[^\s>]+)/i', '', $html);
    $allowed = '<p><br><ul><ol><li><strong><b><em><i><h2><h3><h4><table><thead><tbody><tr><th><td>';
    return trim(strip_tags($html, $allowed));
}

function pm_dom(string $html): ?DOMDocument {
    if ($html === '') return null;
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $ok = $dom->loadHTML('<?xml encoding="UTF-8">' . $html);
    libxml_clear_errors();
    return $ok ? $dom : null;
}

function pm_xpath_text(DOMXPath $xp, string $query): string {
    $node = $xp->query($query)->item(0);
    return $node ? trim(preg_replace('/\s+/', ' ', $node->textContent)) : '';
}

function pm_xpath_attr(DOMXPath $xp, string $query, string $attr): string {
    $node = $xp->query($query)->item(0);
    return ($node instanceof DOMElement) ? trim($node->getAttribute($attr)) : '';
}

function pm_discover_product_urls(string $startUrl, string $type = 'entire', ?string $categoryUrl = null, ?string $singleProductUrl = null, int $limit = 250): array {
    if ($type === 'single') return [pm_validate_public_url($singleProductUrl ?: $startUrl)];

    $seed = pm_validate_public_url($type === 'category' && $categoryUrl ? $categoryUrl : $startUrl);
    $host = parse_url($seed, PHP_URL_HOST);
    $products = pm_discover_product_urls_from_sitemaps($seed, $limit);
    if (count($products) >= min($limit, 20)) {
        return array_values(array_slice($products, 0, $limit));
    }

    $seen = [];
    $queue = [$seed];
    $products = array_fill_keys($products, true);
    $productHints = ['product', 'products', 'shop', 'item', 'sku', 'p=', 'tuote', 'produkt'];
    $categoryHints = ['category', 'categories', 'collections', 'shop', 'product-category', 'tuote-osasto'];

    while ($queue && count($products) < $limit && count($seen) < 250) {
        $url = array_shift($queue);
        if (isset($seen[$url])) continue;
        $seen[$url] = true;

        $html = pm_http_get($url, 15);
        if (!$html) continue;
        $dom = pm_dom($html);
        if (!$dom) continue;
        $xp = new DOMXPath($dom);
        foreach ($xp->query('//a[@href]') as $a) {
            if (!$a instanceof DOMElement) continue;
            $href = strtok(pm_abs_url($url, $a->getAttribute('href')), '#');
            if (!$href || parse_url($href, PHP_URL_HOST) !== $host) continue;
            $path = strtolower((string)(parse_url($href, PHP_URL_PATH) ?? ''));
            if (preg_match('#\.(jpg|jpeg|png|gif|webp|pdf|zip)$#', $path)) continue;

            $isProduct = false;
            foreach ($productHints as $hint) {
                if (str_contains($path . '?' . (parse_url($href, PHP_URL_QUERY) ?? ''), $hint)) {
                    $isProduct = true;
                    break;
                }
            }
            if ($isProduct) {
                $products[$href] = true;
                continue;
            }

            foreach ($categoryHints as $hint) {
                if (count($seen) + count($queue) < 500 && str_contains($path, $hint) && !isset($seen[$href])) {
                    $queue[] = $href;
                    break;
                }
            }
        }
        usleep(150000);
    }

    return array_values(array_slice(array_keys($products), 0, $limit));
}

function pm_discover_product_urls_from_sitemaps(string $startUrl, int $limit = 500): array {
    $base = parse_url($startUrl);
    $origin = ($base['scheme'] ?? 'https') . '://' . ($base['host'] ?? '');
    $candidates = [
        $origin . '/sitemap.xml',
        $origin . '/product-sitemap.xml',
        $origin . '/sitemap_products_1.xml',
        $origin . '/wp-sitemap-posts-product-1.xml',
    ];
    $seenMaps = [];
    $urls = [];
    foreach ($candidates as $mapUrl) {
        pm_read_sitemap_urls($mapUrl, $urls, $seenMaps, $limit);
        if (count($urls) >= $limit) break;
    }
    return array_values(array_slice(array_unique($urls), 0, $limit));
}

function pm_read_sitemap_urls(string $mapUrl, array &$urls, array &$seenMaps, int $limit, int $depth = 0): void {
    if ($depth > 2 || isset($seenMaps[$mapUrl]) || count($urls) >= $limit) return;
    $seenMaps[$mapUrl] = true;
    $xml = pm_http_get($mapUrl, 15);
    if (!$xml) return;
    if (!preg_match_all('#<loc>\s*([^<]+)\s*</loc>#i', $xml, $m)) return;
    foreach ($m[1] as $loc) {
        $loc = html_entity_decode(trim($loc), ENT_QUOTES);
        if ($loc === '') continue;
        if (str_ends_with(strtolower(parse_url($loc, PHP_URL_PATH) ?? ''), '.xml')) {
            pm_read_sitemap_urls($loc, $urls, $seenMaps, $limit, $depth + 1);
        } elseif (pm_url_looks_like_product($loc)) {
            $urls[] = $loc;
            if (count($urls) >= $limit) return;
        }
    }
}

function pm_url_looks_like_product(string $url): bool {
    $path = strtolower((string)(parse_url($url, PHP_URL_PATH) ?? ''));
    $query = strtolower((string)(parse_url($url, PHP_URL_QUERY) ?? ''));
    if (preg_match('#\.(jpg|jpeg|png|gif|webp|pdf|zip|xml)$#', $path)) return false;
    foreach (['/product/', '/products/', '/shop/', '/item/', '/tuote/', '/produkt/'] as $hint) {
        if (str_contains($path, $hint)) return true;
    }
    return str_contains($query, 'product') || str_contains($query, 'p=');
}

function pm_extract_product_from_html(string $url, string $html): array {
    $dom = pm_dom($html);
    if (!$dom) return ['source_url' => $url, 'name' => ''];
    $xp = new DOMXPath($dom);

    $jsonProduct = [];
    foreach ($xp->query('//script[@type="application/ld+json"]') as $script) {
        $decoded = json_decode(trim($script->textContent), true);
        $items = is_array($decoded) && isset($decoded['@graph']) ? $decoded['@graph'] : [$decoded];
        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $type = $item['@type'] ?? '';
            $types = is_array($type) ? $type : [$type];
            if (in_array('Product', $types, true)) {
                $jsonProduct = $item;
                break 2;
            }
        }
    }

    $name = (string)($jsonProduct['name'] ?? '');
    if ($name === '') $name = pm_xpath_attr($xp, '//meta[@property="og:title"]', 'content');
    if ($name === '') $name = pm_xpath_text($xp, '//h1');

    $desc = (string)($jsonProduct['description'] ?? '');
    if ($desc === '') $desc = pm_xpath_attr($xp, '//meta[@name="description"]', 'content');
    if ($desc === '') $desc = pm_xpath_text($xp, '//*[contains(@class,"description") or contains(@id,"description")]');

    $offers = $jsonProduct['offers'] ?? [];
    if (isset($offers[0])) $offers = $offers[0];
    $price = (string)($offers['price'] ?? '');
    if ($price === '') $price = pm_xpath_attr($xp, '//meta[@property="product:price:amount"]', 'content');
    if ($price === '') {
        $body = pm_xpath_text($xp, '//body');
        if (preg_match('/(?:[$€£]\s?|USD\s?|EUR\s?|GBP\s?)(\d+(?:[,.]\d{1,2})?)/i', $body, $m)) {
            $price = $m[1];
        }
    }

    $images = [];
    // 1. JSON-LD structured data (most reliable source)
    $jsonImages = $jsonProduct['image'] ?? [];
    foreach ((array)$jsonImages as $img) {
        if (is_string($img) && $img !== '') $images[] = pm_abs_url($url, $img);
        elseif (is_array($img) && isset($img['url'])) $images[] = pm_abs_url($url, $img['url']);
    }
    // 2. Open Graph image (og:image)
    $og = pm_xpath_attr($xp, '//meta[@property="og:image"]', 'content');
    if ($og) $images[] = pm_abs_url($url, $og);
    // 3. WooCommerce product gallery: figure.woocommerce-product-gallery__image img
    //    and any div.product-images img
    $galleryQueries = [
        '//figure[contains(@class,"woocommerce-product-gallery__image")]//img',
        '//*[contains(@class,"product-gallery")]//img',
        '//*[contains(@class,"product-images")]//img',
        '//*[contains(@class,"gallery-image")]//img',
        '//*[@id="product-images"]//img',
        '//*[contains(@class,"product__image")]//img',
    ];
    foreach ($galleryQueries as $gq) {
        foreach ($xp->query($gq) as $img) {
            if (!$img instanceof DOMElement || count($images) >= 8) break 2;
            // Check all possible lazy-load attributes first
            foreach (['data-large_image','data-src','data-lazy-src','data-original','data-full-size-image-url','src'] as $attr) {
                $val = $img->getAttribute($attr);
                if ($val && !str_starts_with($val, 'data:')) {
                    $images[] = pm_abs_url($url, $val);
                    break;
                }
            }
        }
    }
    // 4. All img tags — check lazy-load attrs before src
    foreach ($xp->query('//img') as $img) {
        if (!$img instanceof DOMElement || count($images) >= 8) break;
        // Skip tiny icons, logos, placeholders
        $cls = strtolower($img->getAttribute('class') . ' ' . $img->getAttribute('id'));
        if (preg_match('/logo|icon|avatar|spinner|placeholder|lazy-placeholder|thumb-nav/i', $cls)) continue;
        $found = '';
        foreach (['data-large_image','data-src','data-lazy-src','data-original','data-full-size-image-url'] as $attr) {
            $val = $img->getAttribute($attr);
            if ($val && !str_starts_with($val, 'data:') && filter_var(pm_abs_url($url,$val), FILTER_VALIDATE_URL)) {
                $found = pm_abs_url($url, $val);
                break;
            }
        }
        if (!$found) {
            $src = $img->getAttribute('src');
            // Skip base64 data URIs and empty tracking pixels
            if ($src && !str_starts_with($src, 'data:') && filter_var(pm_abs_url($url,$src), FILTER_VALIDATE_URL)) {
                $found = pm_abs_url($url, $src);
            }
        }
        // Skip images that look like site chrome (header/nav/footer images)
        if ($found && !preg_match('/\.(jpg|jpeg|png|gif|webp)/i', parse_url($found, PHP_URL_PATH) ?: '')) continue;
        if ($found) $images[] = $found;
    }
    // Deduplicate and filter
    $images = array_values(array_unique(array_filter($images, function($img) {
        if (!$img) return false;
        $path = strtolower(parse_url($img, PHP_URL_PATH) ?: '');
        // Skip known placeholder patterns
        if (preg_match('/placeholder|woocommerce-placeholder|no-image|noimage|dummy/i', $path)) return false;
        return true;
    })));

    $brand = $jsonProduct['brand']['name'] ?? $jsonProduct['brand'] ?? '';
    $sku = (string)($jsonProduct['sku'] ?? '');
    $availability = strtolower((string)($offers['availability'] ?? ''));

    return [
        'source_url' => $url,
        'name' => trim($name),
        'description' => pm_clean_html($desc),
        'short_description' => pm_short_text(trim(strip_tags($desc)), 500),
        'images' => array_values(array_unique(array_filter($images))),
        'categories' => [],
        'price' => $price,
        'sale_price' => '',
        'sku' => $sku,
        'brand' => is_array($brand) ? '' : (string)$brand,
        'stock' => str_contains($availability, 'outofstock') ? 0 : 1,
        'weight' => '',
        'meta_title' => pm_xpath_text($xp, '//title') ?: $name,
        'meta_description' => pm_xpath_attr($xp, '//meta[@name="description"]', 'content'),
    ];
}

function pm_scrape_products(string $url, string $type = 'entire', ?string $categoryUrl = null, ?string $singleProductUrl = null, int $limit = 250): array {
    $urls = pm_discover_product_urls($url, $type, $categoryUrl, $singleProductUrl, $limit);
    $products = [];
    foreach ($urls as $productUrl) {
        $html = pm_http_get($productUrl, 20);
        if (!$html) continue;
        $product = pm_extract_product_from_html($productUrl, $html);
        if (!empty($product['name'])) $products[] = $product;
        usleep(200000);
    }
    return $products;
}
