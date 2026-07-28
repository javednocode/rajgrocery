<?php
/**
 * AI Category Image generation.
 *
 * Design rules (see the feature brief):
 *  - The API key NEVER leaves the server. It lives in site_settings under
 *    `ai_image_api_key`, is redacted from every settings GET response
 *    (see settings.php → SENSITIVE_SETTING_KEYS), and is only ever read
 *    here, server-side, when calling the provider.
 *  - One consistent art direction for every category so the storefront
 *    grid looks like a single photo shoot, not a random AI collage.
 *  - Output is optimised WebP at a fixed 1:1 aspect ratio to match the
 *    `.hm-cat-media` card (aspect-ratio: 1/1; object-fit: cover).
 *  - A manually uploaded image is never destroyed implicitly — only the
 *    explicit per-category generate/regenerate action (or Remove) touches it.
 */

require_once __DIR__ . '/branding.php';
require_once __DIR__ . '/slug.php';
require_once __DIR__ . '/upload.php';

/** Settings keys this feature owns. The API key is the only secret. */
const AI_IMAGE_SETTING_KEYS = [
    'ai_image_provider', 'ai_image_api_url', 'ai_image_model',
    'ai_image_size', 'ai_image_style_suffix', 'ai_image_api_key',
];

/** Load the AI image config (incl. the raw key — server-side use only). */
function ai_image_config(PDO $db): array {
    $s = loadSiteSettings($db);
    $provider = trim((string)($s['ai_image_provider'] ?? 'openai')) ?: 'openai';
    return [
        'provider'     => $provider,
        'api_url'      => trim((string)($s['ai_image_api_url'] ?? '')) ?: ai_image_default_url($provider),
        'model'        => trim((string)($s['ai_image_model'] ?? '')) ?: ai_image_default_model($provider),
        'size'         => ai_image_normalize_size((string)($s['ai_image_size'] ?? '1024x1024')),
        'style_suffix' => trim((string)($s['ai_image_style_suffix'] ?? '')) ?: ai_image_default_style_suffix(),
        'api_key'      => trim((string)($s['ai_image_api_key'] ?? '')),
    ];
}

function ai_image_default_url(string $provider): string {
    return match ($provider) {
        'stability' => 'https://api.stability.ai/v2beta/stable-image/generate/core',
        // Base host only — the model-specific path is built in ai_image_call_gemini(),
        // since which endpoint to hit (:predict vs :generateContent) depends on the model.
        'gemini'    => 'https://generativelanguage.googleapis.com',
        default     => 'https://api.openai.com/v1/images/generations', // openai + compatible
    };
}

function ai_image_default_model(string $provider): string {
    return match ($provider) {
        // Google churns model availability fast — this is Imagen 3, the
        // long-standing GA model, chosen specifically because it's less
        // likely to get pulled from new API keys than a "4.0"-tagged one.
        // If Google deprecates this too, the real error message from
        // ai_image_call_gemini() tells the admin exactly what happened;
        // fix by setting a current model name in Settings → AI Image Gen.
        'gemini'    => 'imagen-3.0-generate-002',
        'stability' => 'core',
        default     => 'gpt-image-1',
    };
}

function ai_image_default_style_suffix(): string {
    return 'beautifully arranged on a clean neutral studio background, realistic commercial food '
         . 'photography, soft natural studio lighting, shallow depth of field, consistent eye-level '
         . 'camera angle, premium international grocery store aesthetic, photorealistic textures, '
         . 'no text, no logos, no watermarks, no fake brand names, no distorted packaging, no people';
}

/** Only allow square sizes the providers accept — the card is 1:1. */
function ai_image_normalize_size(string $size): string {
    $ok = ['512x512', '1024x1024'];
    $size = trim($size);
    return in_array($size, $ok, true) ? $size : '1024x1024';
}

/**
 * Turn a category name into an art-directed subject line, then compose the
 * full prompt with the one shared style suffix. Known grocery categories get
 * a richer, hand-tuned subject; everything else gets a sensible generic one.
 */
function ai_image_build_prompt(string $categoryName, string $styleSuffix): string {
    $subject = ai_image_subject_for($categoryName);
    return 'Premium editorial grocery photography featuring ' . $subject . ', ' . $styleSuffix . '.';
}

function ai_image_subject_for(string $name): string {
    $n = strtolower(trim($name));
    // Strip common separators so "Biscuits & Bakery" and "Biscuits and Bakery" match.
    $key = preg_replace('/[^a-z0-9]+/', ' ', $n);
    $key = trim(preg_replace('/\s+/', ' ', $key));

    $map = [
        'atta'                  => 'whole wheat atta flour in a rustic bowl with wheat grains, wheat stalks and freshly made flatbread',
        'flour'                 => 'assorted milling flours in bowls with wheat grains and wheat stalks',
        'biscuits bakery'       => 'an assortment of biscuits, cookies, artisan bread and fresh bakery products',
        'bakery'                => 'artisan bread, rolls, pastries and fresh bakery products',
        'biscuits'              => 'an assortment of biscuits and cookies',
        'spices masalas'        => 'a natural arrangement of whole spices and ground spices in small bowls and spoons',
        'spices'                => 'a natural arrangement of whole and ground spices in small bowls and wooden spoons',
        'masala'                => 'a natural arrangement of ground masala spice blends in small bowls',
        'snacks chips'          => 'a realistic assortment of savoury snack foods, chips and namkeen in bowls',
        'snacks namkeen'        => 'a realistic assortment of Indian namkeen and savoury snacks in bowls',
        'snacks'                => 'a realistic assortment of savoury snack foods in bowls',
        'sweets confectionery'  => 'a premium assortment of Indian mithai sweets and confectionery on a serving plate',
        'sweets'                => 'a premium assortment of traditional sweets and confectionery on a serving plate',
        'rice grains'           => 'premium basmati rice and assorted grains in bowls with a few loose grains scattered',
        'rice'                  => 'premium basmati rice in a bowl with a few loose grains scattered',
        'grains'                => 'assorted whole grains and pulses in bowls',
        'lentils'               => 'assorted dried lentils and pulses in small bowls',
        'oil ghee'              => 'cold-pressed cooking oil in a glass bottle and golden ghee in a jar',
        'oils'                  => 'assorted cold-pressed cooking oils in glass bottles',
        'ghee'                  => 'golden clarified ghee in an open glass jar beside a spoon',
        'honey sweeteners'      => 'golden honey in a glass jar with a honey dipper and natural sweeteners',
        'honey'                 => 'golden honey in a glass jar with a wooden honey dipper',
        'beverages'             => 'assorted bottled and canned beverages, juices and teas',
        'drinks'                => 'assorted bottled drinks, juices and teas',
        'tea coffee'            => 'loose leaf tea and roasted coffee beans in bowls beside a cup',
        'dairy eggs'            => 'fresh dairy products, milk, cheese and eggs',
        'dairy'                 => 'fresh dairy products, milk and cheese',
        'frozen foods'          => 'assorted frozen food products with a cold frosted look',
        'fresh produce'         => 'fresh colourful fruits and vegetables',
        'fruits vegetables'     => 'a fresh colourful assortment of fruits and vegetables',
        'vegetables'            => 'a fresh assortment of vegetables',
        'fruits'                => 'a fresh colourful assortment of fruits',
        'pickles chutney'       => 'jars of Indian pickles and chutney with fresh ingredients around them',
        'gift hampers'          => 'a premium curated grocery gift hamper with assorted products in a basket',
        'cultural items'        => 'a curated arrangement of premium international grocery specialty products',
        'kitchen staples'       => 'everyday kitchen pantry staples in jars and bowls',
        'fleisch'               => 'assorted fresh cuts of meat on a butcher board',
        'getranke'              => 'assorted bottled beverages, juices and soft drinks',
    ];
    if (isset($map[$key])) return $map[$key];

    // Partial keyword fallbacks
    foreach ($map as $mk => $subject) {
        foreach (explode(' ', $mk) as $word) {
            if (strlen($word) >= 4 && str_contains($key, $word)) return $subject;
        }
    }
    // Generic, still on-brand
    return 'a premium assortment of ' . trim($name) . ' grocery products';
}

/**
 * Call the configured provider and return raw image bytes.
 * @return array{ok:bool, bytes?:string, message?:string}
 */
function ai_image_generate_bytes(array $cfg, string $prompt): array {
    if ($cfg['api_key'] === '') {
        return ['ok' => false, 'message' => 'AI image API key is not configured. Set it in Settings → AI Image Generation.'];
    }
    if (!function_exists('curl_init')) {
        return ['ok' => false, 'message' => 'cURL is not available on this server.'];
    }

    if ($cfg['provider'] === 'stability') {
        return ai_image_call_stability($cfg, $prompt);
    }
    if ($cfg['provider'] === 'gemini') {
        return ai_image_call_gemini($cfg, $prompt);
    }
    return ai_image_call_openai($cfg, $prompt);
}

/** OpenAI (and OpenAI-compatible) /images/generations. */
function ai_image_call_openai(array $cfg, string $prompt): array {
    $model = $cfg['model'] ?: 'gpt-image-1';
    $payload = [
        'model'  => $model,
        'prompt' => $prompt,
        'n'      => 1,
        'size'   => $cfg['size'],
    ];
    // dall-e-3 must be asked for base64 explicitly; gpt-image-1 returns b64 by default.
    if (str_starts_with($model, 'dall-e')) {
        $payload['response_format'] = 'b64_json';
    }

    $res = ai_image_http_post_json($cfg['api_url'], $payload, [
        'Authorization: Bearer ' . $cfg['api_key'],
    ]);
    if (!$res['ok']) return $res;

    $json = json_decode($res['body'], true);
    if (!is_array($json)) return ['ok' => false, 'message' => 'Provider returned a non-JSON response.'];
    if (isset($json['error'])) {
        $msg = is_array($json['error']) ? ($json['error']['message'] ?? 'Provider error') : (string)$json['error'];
        return ['ok' => false, 'message' => 'Provider error: ' . $msg];
    }
    $item = $json['data'][0] ?? null;
    if (!is_array($item)) return ['ok' => false, 'message' => 'Provider response had no image data.'];

    if (!empty($item['b64_json'])) {
        $bytes = base64_decode($item['b64_json'], true);
        if ($bytes === false || strlen($bytes) < 100) return ['ok' => false, 'message' => 'Provider returned invalid base64 image.'];
        return ['ok' => true, 'bytes' => $bytes];
    }
    if (!empty($item['url'])) {
        return ai_image_download($item['url']);
    }
    return ['ok' => false, 'message' => 'Provider response contained neither b64_json nor url.'];
}

/** Stability AI core endpoint (multipart form, returns image bytes). */
function ai_image_call_stability(array $cfg, string $prompt): array {
    $ch = curl_init($cfg['api_url']);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_TIMEOUT        => 90,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $cfg['api_key'],
            'Accept: image/*',
        ],
        CURLOPT_POSTFIELDS     => [
            'prompt'          => $prompt,
            'output_format'   => 'webp',
            'aspect_ratio'    => '1:1',
        ],
    ]);
    $body = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $type = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $err  = curl_error($ch);
    if (PHP_VERSION_ID < 80500) curl_close($ch);

    if ($body === false) return ['ok' => false, 'message' => 'Request failed: ' . $err];
    if ($code < 200 || $code >= 300) {
        $j = json_decode($body, true);
        $m = is_array($j) ? ($j['errors'][0] ?? $j['message'] ?? '') : '';
        return ['ok' => false, 'message' => 'Provider error (HTTP ' . $code . ')' . ($m ? ': ' . $m : '')];
    }
    if (str_contains($type, 'application/json')) {
        return ['ok' => false, 'message' => 'Provider returned JSON, expected image bytes.'];
    }
    return ['ok' => true, 'bytes' => $body];
}

/**
 * Google Gemini API (Google AI Studio key — generativelanguage.googleapis.com).
 *
 * Two different Google endpoints generate images depending on the model:
 *  - "imagen-*" models  → the dedicated Imagen `:predict` endpoint, request/response
 *    shaped as {instances:[{prompt}], parameters:{...}} / {predictions:[{bytesBase64Encoded}]}.
 *  - anything else (e.g. "gemini-2.0-flash-preview-image-generation") → the standard
 *    `:generateContent` endpoint with responseModalities:["TEXT","IMAGE"], returning the
 *    image inline as one of candidates[0].content.parts[].inlineData.
 * We pick the endpoint from the model name so the admin only has to set one field.
 *
 * IMPORTANT: this is a *Google AI Studio* API key (aistudio.google.com/apikey), billed
 * via a Google Cloud project — NOT the same as a "Gemini Premium/Advanced" app
 * subscription, which has no programmatic API access at all.
 */
function ai_image_call_gemini(array $cfg, string $prompt): array {
    $model    = $cfg['model'] ?: ai_image_default_model('gemini');
    $base     = rtrim($cfg['api_url'], '/');
    $isImagen = stripos($model, 'imagen') !== false;

    if ($isImagen) {
        $url = $base . '/v1beta/models/' . rawurlencode($model) . ':predict';
        $payload = [
            'instances'  => [['prompt' => $prompt]],
            'parameters' => ['sampleCount' => 1, 'aspectRatio' => '1:1'],
        ];
    } else {
        $url = $base . '/v1beta/models/' . rawurlencode($model) . ':generateContent';
        $payload = [
            'contents'         => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => ['responseModalities' => ['TEXT', 'IMAGE']],
        ];
    }

    // x-goog-api-key header keeps the key out of the URL (and out of any access logs).
    $res = ai_image_http_post_json($url, $payload, ['x-goog-api-key: ' . $cfg['api_key']]);
    if (!$res['ok']) return $res;

    $json = json_decode($res['body'], true);
    if (!is_array($json)) return ['ok' => false, 'message' => 'Google API returned a non-JSON response.'];
    if (isset($json['error'])) {
        $msg = is_array($json['error']) ? ($json['error']['message'] ?? 'Google API error') : (string)$json['error'];
        return ['ok' => false, 'message' => 'Google API error: ' . $msg];
    }

    if ($isImagen) {
        $pred = $json['predictions'][0] ?? null;
        if (!is_array($pred) || empty($pred['bytesBase64Encoded'])) {
            $blocked = $pred['raiFilteredReason'] ?? null;
            return ['ok' => false, 'message' => $blocked
                ? 'Image blocked by Google safety filters: ' . $blocked
                : 'Google API response had no image data.'];
        }
        $bytes = base64_decode($pred['bytesBase64Encoded'], true);
    } else {
        $parts = $json['candidates'][0]['content']['parts'] ?? [];
        $b64 = null;
        foreach ($parts as $part) {
            if (!empty($part['inlineData']['data'])) { $b64 = $part['inlineData']['data']; break; }
        }
        if ($b64 === null) {
            $reason = $json['candidates'][0]['finishReason'] ?? null;
            return ['ok' => false, 'message' => $reason
                ? 'Google API returned no image (finishReason: ' . $reason . ').'
                : 'Google API response had no inline image data.'];
        }
        $bytes = base64_decode($b64, true);
    }

    if ($bytes === false || strlen($bytes) < 100) {
        return ['ok' => false, 'message' => 'Google API returned invalid image data.'];
    }
    return ['ok' => true, 'bytes' => $bytes];
}

/**
 * Ask Google's own ListModels endpoint what THIS API key can actually use,
 * instead of guessing a hardcoded model name (Google renames/retires these
 * often, and Imagen's `:predict` route in particular is frequently gated
 * behind Vertex AI rather than a plain AI Studio key — hence "not found /
 * not supported for predict" even for a real, existing model name).
 * Returns only entries that plausibly generate images, so the admin picks
 * from a short, relevant list rather than Google's full model catalogue.
 *
 * @return array{ok:bool, models?:array, message?:string}
 */
function ai_image_gemini_list_models(array $cfg): array {
    if ($cfg['api_key'] === '') {
        return ['ok' => false, 'message' => 'AI image API key is not configured.'];
    }
    $base = rtrim($cfg['api_url'] ?: ai_image_default_url('gemini'), '/');
    $ch = curl_init($base . '/v1beta/models');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['x-goog-api-key: ' . $cfg['api_key']],
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
    ]);
    $body = curl_exec($ch);
    $err  = curl_error($ch);
    if (PHP_VERSION_ID < 80500) curl_close($ch);

    if ($body === false) return ['ok' => false, 'message' => 'Request failed: ' . $err];
    $json = json_decode($body, true);
    if (!is_array($json)) return ['ok' => false, 'message' => 'Google API returned a non-JSON response.'];
    if (isset($json['error'])) {
        $msg = is_array($json['error']) ? ($json['error']['message'] ?? 'Google API error') : (string)$json['error'];
        return ['ok' => false, 'message' => 'Google API error: ' . $msg];
    }

    $models = [];
    foreach (($json['models'] ?? []) as $m) {
        $name = str_replace('models/', '', (string)($m['name'] ?? ''));
        if ($name === '') continue;
        $methods = array_values((array)($m['supportedGenerationMethods'] ?? []));
        $display = (string)($m['displayName'] ?? $name);
        // "predict" => Imagen-style; a name/description mentioning "image"
        // catches Gemini's native image-output models (generateContent path).
        $looksImageCapable = in_array('predict', $methods, true)
            || stripos($name, 'image') !== false
            || stripos($display, 'image') !== false;
        if (!$looksImageCapable) continue;
        $models[] = ['name' => $name, 'displayName' => $display, 'methods' => $methods];
    }
    return ['ok' => true, 'models' => $models];
}

function ai_image_http_post_json(string $url, array $payload, array $headers): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_TIMEOUT        => 90,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_HTTPHEADER     => array_merge(['Content-Type: application/json'], $headers),
        CURLOPT_POSTFIELDS     => json_encode($payload),
    ]);
    $body = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    if (PHP_VERSION_ID < 80500) curl_close($ch);

    if ($body === false) return ['ok' => false, 'message' => 'Request failed: ' . $err];
    if ($code === 401) return ['ok' => false, 'message' => 'Provider rejected the API key (HTTP 401). Check the key in Settings.'];
    if ($code === 429) return ['ok' => false, 'message' => 'Rate limited by the provider (HTTP 429). Wait and retry.'];
    // Let 4xx JSON error bodies through so the caller can surface the real message.
    return ['ok' => true, 'body' => $body, 'code' => $code];
}

function ai_image_download(string $url): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 5,
        CURLOPT_TIMEOUT        => 60,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $body = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if (PHP_VERSION_ID < 80500) curl_close($ch);
    if ($body === false || $code < 200 || $code >= 300 || strlen((string)$body) < 100) {
        return ['ok' => false, 'message' => 'Failed to download the generated image (HTTP ' . $code . ').'];
    }
    return ['ok' => true, 'bytes' => $body];
}

/**
 * Persist raw image bytes as an optimised square WebP under
 * /uploads/categories/ai/ and return its public path.
 * @return array{ok:bool, path?:string, message?:string}
 */
function ai_image_save_bytes(string $bytes, string $slugSeed): array {
    if (!function_exists('imagecreatefromstring')) {
        return ['ok' => false, 'message' => 'GD image library is not available on this server.'];
    }
    $src = @imagecreatefromstring($bytes);
    if (!$src) return ['ok' => false, 'message' => 'Generated data was not a readable image.'];

    $w = imagesx($src);
    $h = imagesy($src);
    // Centre-crop to a square, then scale to a consistent 1024 canvas.
    $side = min($w, $h);
    $sx = (int)(($w - $side) / 2);
    $sy = (int)(($h - $side) / 2);
    $target = min(1024, $side);
    $dst = imagecreatetruecolor($target, $target);
    imagecopyresampled($dst, $src, 0, 0, $sx, $sy, $target, $target, $side, $side);
    unset($src); // GD frees itself on PHP 8.0+; imagedestroy() warns on 8.5

    $dir = defined('UPLOAD_DIR') ? UPLOAD_DIR . 'categories/ai/' : __DIR__ . '/../uploads/categories/ai/';
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        unset($dst);
        return ['ok' => false, 'message' => 'Could not create the upload directory.'];
    }

    $base = generateSlug($slugSeed) ?: 'category';
    $base = substr($base, 0, 50) . '-' . substr(bin2hex(random_bytes(4)), 0, 8);

    $publicBase = (defined('UPLOAD_URL') ? UPLOAD_URL : '/uploads/') . 'categories/ai/';
    $ext = 'png';
    $ok  = false;
    if (function_exists('imagewebp')) {
        $ext = 'webp';
        $ok  = imagewebp($dst, $dir . $base . '.webp', 82);
    }
    if (!$ok) { // WebP unavailable or failed — fall back to PNG so we never lose the result
        $ext = 'png';
        $ok  = imagepng($dst, $dir . $base . '.png', 6);
    }
    unset($dst);

    if (!$ok) return ['ok' => false, 'message' => 'Failed to write the optimised image.'];
    return ['ok' => true, 'path' => $publicBase . $base . '.' . $ext];
}

/**
 * Full generate-and-attach flow for one category.
 * Reads the category name from the DB, generates, saves, updates the row,
 * removes the previously AI-generated file, and clears public caches.
 * On ANY failure the existing image is left untouched.
 *
 * @return array{ok:bool, image?:string, prompt?:string, message?:string}
 */
function ai_image_generate_for_category(PDO $db, int $catId): array {
    $stmt = $db->prepare('SELECT id, name, image FROM categories WHERE id = :id');
    $stmt->execute([':id' => $catId]);
    $cat = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$cat) return ['ok' => false, 'message' => 'Category not found.'];

    $cfg = ai_image_config($db);
    $prompt = ai_image_build_prompt((string)$cat['name'], $cfg['style_suffix']);

    $gen = ai_image_generate_bytes($cfg, $prompt);
    if (!$gen['ok']) return ['ok' => false, 'message' => $gen['message'] ?? 'Generation failed.', 'prompt' => $prompt];

    $saved = ai_image_save_bytes($gen['bytes'], (string)$cat['name']);
    if (!$saved['ok']) return ['ok' => false, 'message' => $saved['message'] ?? 'Save failed.', 'prompt' => $prompt];

    $old = (string)($cat['image'] ?? '');
    $upd = $db->prepare('UPDATE categories SET image = :img WHERE id = :id');
    $upd->execute([':img' => $saved['path'], ':id' => $catId]);

    // Clean up a previous AI-generated file (never a manual upload elsewhere).
    if ($old !== '' && $old !== $saved['path'] && str_contains($old, '/categories/ai/')) {
        if (function_exists('deleteImage')) deleteImage($old);
    }

    if (function_exists('cacheClearPattern')) {
        cacheClearPattern('categories_');
        cacheClearPattern('category_slug_');
    }
    return ['ok' => true, 'image' => $saved['path'], 'prompt' => $prompt];
}
