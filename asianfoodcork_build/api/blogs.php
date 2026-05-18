<?php
/**
 * Blog API
 */

function getBlogs($db) {
    [$page, $perPage, $offset] = getPaginationParams();
    $where = "WHERE bp.status = 'published'";
    $auth = optionalAuth();
    if ($auth) $where = "WHERE 1=1";
    $countStmt = $db->prepare("SELECT COUNT(*) FROM blog_posts bp $where");
    $countStmt->execute();
    $total = $countStmt->fetchColumn();
    $stmt = $db->prepare("SELECT bp.*, bc.name as category_name FROM blog_posts bp LEFT JOIN blog_categories bc ON bp.category_id = bc.id $where ORDER BY bp.created_at DESC LIMIT :lim OFFSET :off");
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    paginatedResponse($stmt->fetchAll(), $total, $page, $perPage);
}

function getBlogById($db, $id) {
    $stmt = $db->prepare("SELECT bp.*, bc.name as category_name FROM blog_posts bp LEFT JOIN blog_categories bc ON bp.category_id = bc.id WHERE bp.id = :id");
    $stmt->execute([':id' => $id]);
    $post = $stmt->fetch();
    if (!$post) errorResponse('Blog post not found', 404);
    successResponse($post);
}

function getBlogBySlug($db, $slug) {
    $stmt = $db->prepare("SELECT bp.*, bc.name as category_name FROM blog_posts bp LEFT JOIN blog_categories bc ON bp.category_id = bc.id WHERE bp.slug = :slug AND bp.status = 'published'");
    $stmt->execute([':slug' => $slug]);
    $post = $stmt->fetch();
    if (!$post) errorResponse('Blog post not found', 404);
    $db->prepare("UPDATE blog_posts SET views = views + 1 WHERE id = :id")->execute([':id' => $post['id']]);
    successResponse($post);
}

function createBlog($db) {
    $data = isset($_POST['title']) ? $_POST : getJsonInput();
    $title = trim($data['title'] ?? '');
    if (empty($title)) errorResponse('Title is required', 400);
    $slug = uniqueSlug($db, 'blog_posts', $data['slug'] ?? $title);
    $image = null;
    if (!empty($_FILES['featured_image']) && $_FILES['featured_image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['featured_image'], 'blogs');
        if ($r['success']) $image = $r['path'];
    }
    $stmt = $db->prepare("INSERT INTO blog_posts (title,slug,excerpt,content,featured_image,author,status,category_id,meta_title,meta_description,focus_keyword,published_at) VALUES (:title,:slug,:excerpt,:content,:img,:author,:status,:cat,:mt,:md,:fk,:pub)");
    $status = $data['status'] ?? 'draft';
    $stmt->execute([':title'=>$title,':slug'=>$slug,':excerpt'=>$data['excerpt']??null,':content'=>$data['content']??null,':img'=>$image??($data['featured_image']??null),':author'=>$data['author']??'Admin',':status'=>$status,':cat'=>!empty($data['category_id'])?(int)$data['category_id']:null,':mt'=>$data['meta_title']??null,':md'=>$data['meta_description']??null,':fk'=>$data['focus_keyword']??null,':pub'=>$status==='published'?date('Y-m-d H:i:s'):null]);
    successResponse(['id'=>$db->lastInsertId(),'slug'=>$slug], 'Blog post created', 201);
}

function updateBlog($db, $id) {
    $data = isset($_POST['title']) ? $_POST : getJsonInput();
    $title = trim($data['title'] ?? '');
    if (empty($title)) errorResponse('Title is required', 400);
    $slug = uniqueSlug($db, 'blog_posts', $data['slug'] ?? $title, $id);
    $image = $data['featured_image'] ?? null;
    if (!empty($_FILES['featured_image']) && $_FILES['featured_image']['error'] === UPLOAD_ERR_OK) {
        $r = uploadImage($_FILES['featured_image'], 'blogs');
        if ($r['success']) $image = $r['path'];
    }
    $status = $data['status'] ?? 'draft';
    $sql = "UPDATE blog_posts SET title=:title,slug=:slug,excerpt=:excerpt,content=:content,author=:author,status=:status,category_id=:cat,meta_title=:mt,meta_description=:md,focus_keyword=:fk";
    $params = [':id'=>$id,':title'=>$title,':slug'=>$slug,':excerpt'=>$data['excerpt']??null,':content'=>$data['content']??null,':author'=>$data['author']??'Admin',':status'=>$status,':cat'=>!empty($data['category_id'])?(int)$data['category_id']:null,':mt'=>$data['meta_title']??null,':md'=>$data['meta_description']??null,':fk'=>$data['focus_keyword']??null];
    if ($image) { $sql .= ",featured_image=:img"; $params[':img'] = $image; }
    if ($status === 'published') { $sql .= ",published_at=COALESCE(published_at, NOW())"; }
    $sql .= " WHERE id=:id";
    $db->prepare($sql)->execute($params);
    successResponse(['id'=>$id,'slug'=>$slug], 'Blog post updated');
}

function deleteBlog($db, $id) {
    $stmt = $db->prepare("DELETE FROM blog_posts WHERE id = :id"); $stmt->execute([':id'=>$id]);
    if ($stmt->rowCount()===0) errorResponse('Blog post not found', 404);
    successResponse(null, 'Blog post deleted');
}
