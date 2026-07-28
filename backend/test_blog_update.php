<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/slug.php';

$db = (new Database())->getConnection();

// Mock updateBlog function logic
$id = 6;
$data = [
    'title' => 'Gesunde Ernährung im Alltag: Schnelle und nährstoffreiche Rezeptideen für stressige Tage',
    'slug' => 'gesunde-ern-hrung-im-alltag-schnelle-und-n-hrstoffreiche-rezeptideen-f-r-stressige-tage',
    'excerpt' => 'Zwischen Arbeit, Familie und Freizeit bleibt oft nur wenig Zeit zum Kochen. Die Versuchung ist dann groß, zu Fast Food oder Fertiggerichten zu greifen. Doch eine gesunde und ausgewogene Ernährung muss weder kompliziert sein noch viel Zeit in Anspruch nehmen.',
    'content' => 'Zwischen Arbeit, Familie und Freizeit bleibt oft nur wenig Zeit zum Kochen. Die Versuchung ist dann groß, zu Fast Food oder Fertiggerichten zu greifen. Doch eine gesunde und ausgewogene Ernährung muss weder kompliziert sein noch viel Zeit in Anspruch nehmen.',
    'status' => 'published',
    'author' => 'Admin'
];

$title = trim($data['title']);
$slug = uniqueSlug($db, 'blog_posts', $data['slug'], $id);
$status = $data['status'];

$sql = "UPDATE blog_posts SET title=:title,slug=:slug,excerpt=:excerpt,content=:content,author=:author,status=:status,category_id=:cat,meta_title=:mt,meta_description=:md,focus_keyword=:fk";
$params = [
    ':id' => $id,
    ':title' => $title,
    ':slug' => $slug,
    ':excerpt' => $data['excerpt'],
    ':content' => $data['content'],
    ':author' => $data['author'],
    ':status' => $status,
    ':cat' => null,
    ':mt' => null,
    ':md' => null,
    ':fk' => null
];

if ($status === 'published') { 
    $sql .= ',published_at=COALESCE(published_at, NOW())'; 
}
$sql .= ' WHERE id=:id';

try {
    $db->prepare($sql)->execute($params);
    echo "Success\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
