<?php
/**
 * File Upload Helper
 */

function uploadImage($file, $folder = 'general') {
    if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
        return ['success' => false, 'message' => 'No file uploaded'];
    }

    // Validate size
    if ($file['size'] > MAX_FILE_SIZE) {
        return ['success' => false, 'message' => 'File too large. Max 5MB allowed'];
    }

    // Validate extension
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ALLOWED_EXTENSIONS)) {
        return ['success' => false, 'message' => 'Invalid file type. Allowed: ' . implode(', ', ALLOWED_EXTENSIONS)];
    }

    // Create directory
    $uploadPath = UPLOAD_DIR . $folder . '/';
    if (!is_dir($uploadPath)) {
        mkdir($uploadPath, 0755, true);
    }

    // Generate unique filename
    $filename = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $fullPath = $uploadPath . $filename;

    if (move_uploaded_file($file['tmp_name'], $fullPath)) {
        // Create thumbnail for product images
        if ($folder === 'products' && in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
            createThumbnail($fullPath, $uploadPath . 'thumb_' . $filename, 300, 300);
        }

        return [
            'success' => true,
            'filename' => $filename,
            'path' => UPLOAD_URL . $folder . '/' . $filename,
            'thumb' => ($folder === 'products') ? UPLOAD_URL . $folder . '/thumb_' . $filename : null
        ];
    }

    return ['success' => false, 'message' => 'Failed to upload file'];
}

function uploadVideo($file, $folder = 'banners/videos') {
    if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
        return ['success' => false, 'message' => 'No video uploaded'];
    }

    $maxSize = defined('MAX_VIDEO_SIZE') ? MAX_VIDEO_SIZE : (50 * 1024 * 1024);
    if ($file['size'] > $maxSize) {
        return ['success' => false, 'message' => 'Video too large. Max 50MB allowed'];
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = defined('ALLOWED_VIDEO_EXTENSIONS') ? ALLOWED_VIDEO_EXTENSIONS : ['mp4', 'webm', 'mov'];
    if (!in_array($ext, $allowed)) {
        return ['success' => false, 'message' => 'Invalid video type. Allowed: mp4, webm, mov'];
    }

    $uploadPath = UPLOAD_DIR . $folder . '/';
    if (!is_dir($uploadPath)) {
        mkdir($uploadPath, 0755, true);
    }

    $filename = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $fullPath = $uploadPath . $filename;

    if (move_uploaded_file($file['tmp_name'], $fullPath)) {
        return [
            'success'  => true,
            'filename' => $filename,
            'path'     => UPLOAD_URL . $folder . '/' . $filename,
        ];
    }

    return ['success' => false, 'message' => 'Failed to upload video'];
}



function createThumbnail($source, $destination, $maxWidth, $maxHeight) {
    $ext = strtolower(pathinfo($source, PATHINFO_EXTENSION));
    
    switch ($ext) {
        case 'jpg': case 'jpeg': $image = imagecreatefromjpeg($source); break;
        case 'png': $image = imagecreatefrompng($source); break;
        case 'webp': $image = imagecreatefromwebp($source); break;
        default: return false;
    }

    if (!$image) return false;

    $origWidth = imagesx($image);
    $origHeight = imagesy($image);

    $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
    $newWidth = (int)($origWidth * $ratio);
    $newHeight = (int)($origHeight * $ratio);

    $thumb = imagecreatetruecolor($newWidth, $newHeight);

    if ($ext === 'png') {
        imagealphablending($thumb, false);
        imagesavealpha($thumb, true);
    }

    imagecopyresampled($thumb, $image, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

    switch ($ext) {
        case 'jpg': case 'jpeg': imagejpeg($thumb, $destination, 85); break;
        case 'png': imagepng($thumb, $destination, 8); break;
        case 'webp': imagewebp($thumb, $destination, 85); break;
    }

    imagedestroy($image);
    imagedestroy($thumb);
    return true;
}

function deleteImage($path) {
    $fullPath = __DIR__ . '/../' . ltrim($path, '/');
    if (file_exists($fullPath)) {
        unlink($fullPath);
    }
    // Also delete thumbnail if exists
    $dir = dirname($fullPath);
    $file = basename($fullPath);
    $thumbPath = $dir . '/thumb_' . $file;
    if (file_exists($thumbPath)) {
        unlink($thumbPath);
    }
}
