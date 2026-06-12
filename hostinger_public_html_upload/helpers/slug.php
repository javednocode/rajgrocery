<?php
/**
 * URL Slug Generator
 */

function generateSlug($text) {
    // Transliterate
    $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
    // Lowercase
    $text = strtolower($text);
    // Replace non-alphanumeric with hyphens
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    // Trim hyphens
    $text = trim($text, '-');
    // Collapse multiple hyphens
    $text = preg_replace('/-+/', '-', $text);
    return $text;
}

function uniqueSlug($db, $table, $text, $excludeId = null) {
    $slug = generateSlug($text);
    $baseSlug = $slug;
    $counter = 1;

    while (true) {
        $sql = "SELECT id FROM {$table} WHERE slug = :slug";
        $params = [':slug' => $slug];
        
        if ($excludeId) {
            $sql .= " AND id != :id";
            $params[':id'] = $excludeId;
        }

        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            return $slug;
        }

        $slug = $baseSlug . '-' . $counter;
        $counter++;
    }
}
