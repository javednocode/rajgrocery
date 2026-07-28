<?php
/**
 * AI Category Image API — thin HTTP layer over helpers/ai_image.php.
 * All routes require auth (mounted with requireAuth() in index.php).
 *
 * Generation runs ONE category per request so the admin can show
 * "Generating 3 of 12…" progress and so a single slow provider call can
 * never blow a serverless timeout for a whole batch.
 */

require_once __DIR__ . '/../helpers/ai_image.php';

/**
 * GET /api/ai-images/gemini/models
 * Asks Google's ListModels endpoint (using the key already saved in
 * Settings) which models THIS key can actually use for image generation.
 * Exists because Google renames/retires model names often, and Imagen's
 * :predict route specifically is frequently gated behind Vertex AI even
 * for real, existing model names — so guessing a hardcoded default is
 * unreliable. This asks the source of truth directly.
 */
function aiListGeminiModels(PDO $db): void {
    $cfg = ai_image_config($db);
    if ($cfg['provider'] !== 'gemini') {
        errorResponse('Set Provider to "Google Gemini" and save first.', 400);
    }
    $res = ai_image_gemini_list_models($cfg);
    if (!$res['ok']) {
        errorResponse($res['message'] ?? 'Could not list models.', 422);
    }
    successResponse(['models' => $res['models']]);
}

/** GET /api/ai-images/categories/missing — categories with no image. */
function aiListMissingCategoryImages(PDO $db): void {
    $rows = $db->query(
        "SELECT id, name, slug FROM categories
         WHERE image IS NULL OR image = ''
         ORDER BY sort_order ASC, name ASC"
    )->fetchAll(PDO::FETCH_ASSOC);
    successResponse(['categories' => $rows, 'count' => count($rows)]);
}

/**
 * POST /api/ai-images/categories/{id}/generate
 * Body: { "only_if_missing": true|false }
 * The single "Generate with AI" / "Regenerate" button omits the flag
 * (always regenerate). The bulk loop sets it true so a manual image added
 * mid-run is never overwritten.
 */
function aiGenerateCategoryImage(PDO $db, int $catId): void {
    $body = json_decode(file_get_contents('php://input'), true);
    $onlyIfMissing = is_array($body) && !empty($body['only_if_missing']);

    if ($onlyIfMissing) {
        $stmt = $db->prepare('SELECT image FROM categories WHERE id = :id');
        $stmt->execute([':id' => $catId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) errorResponse('Category not found.', 404);
        if (trim((string)$row['image']) !== '') {
            successResponse(['skipped' => true, 'image' => $row['image']], 'Already has an image — skipped.');
            return;
        }
    }

    @set_time_limit(120);
    $res = ai_image_generate_for_category($db, $catId);
    if (!$res['ok']) {
        errorResponse($res['message'] ?? 'Generation failed.', 422);
    }
    successResponse(
        ['image' => $res['image'], 'prompt' => $res['prompt'] ?? null],
        'Image generated'
    );
}

/**
 * DELETE /api/ai-images/categories/{id}/image — remove the current image.
 * Deletes the file only when it lives in our AI folder (never risks nuking
 * a shared/manual asset), then NULLs the column.
 */
function aiRemoveCategoryImage(PDO $db, int $catId): void {
    $stmt = $db->prepare('SELECT id, image FROM categories WHERE id = :id');
    $stmt->execute([':id' => $catId]);
    $cat = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$cat) errorResponse('Category not found.', 404);

    $img = (string)($cat['image'] ?? '');
    if ($img !== '' && str_contains($img, '/categories/ai/') && function_exists('deleteImage')) {
        deleteImage($img);
    }
    $db->prepare('UPDATE categories SET image = NULL WHERE id = :id')->execute([':id' => $catId]);

    if (function_exists('cacheClearPattern')) {
        cacheClearPattern('categories_');
        cacheClearPattern('category_slug_');
    }
    successResponse(['id' => $catId], 'Image removed');
}
