<?php
/**
 * JSON Response Helper
 */

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    applyApiCacheHeaders($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function applyApiCacheHeaders($statusCode) {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $uri = strtok($_SERVER['REQUEST_URI'] ?? '', '?') ?: '';
    $hasAuth = !empty($_SERVER['HTTP_AUTHORIZATION']) || !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);

    if ($method !== 'GET' || $statusCode !== 200 || $hasAuth) {
        header('Cache-Control: no-store, max-age=0');
        return;
    }

    $publicTtls = [
        '#^/api/settings/?#' => 600,
        '#^/api/categories/?#' => 600,
        '#^/api/banners/?#' => 300,
        '#^/api/products/(featured|trending)/?#' => 300,
        '#^/api/products/slug/#' => 120,
        '#^/api/products/?#' => 120,
        '#^/api/blogs/?#' => 300,
    ];

    foreach ($publicTtls as $pattern => $ttl) {
        if (preg_match($pattern, $uri)) {
            header("Cache-Control: public, max-age=$ttl, s-maxage=$ttl, stale-while-revalidate=60");
            header('Vary: Accept-Encoding');
            return;
        }
    }

    header('Cache-Control: no-store, max-age=0');
}

function successResponse($data = null, $message = 'Success', $statusCode = 200) {
    jsonResponse([
        'success' => true,
        'message' => $message,
        'data' => $data
    ], $statusCode);
}

function sendJsonThenRun($data, $message, $statusCode, callable $afterResponse) {
    $response = json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($response === false) {
        errorResponse('Failed to encode response', 500);
    }

    while (ob_get_level() > 0) {
        ob_end_clean();
    }

    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Length: ' . strlen($response));
    header('Connection: close');
    applyApiCacheHeaders($statusCode);
    echo $response;

    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } else {
        flush();
    }

    ignore_user_abort(true);
    ob_start();
    try {
        $afterResponse();
    } catch (Throwable $e) {
        error_log('After-response task failed: ' . $e->getMessage());
    } finally {
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
    }

    exit;
}

function errorResponse($message = 'Error', $statusCode = 400, $errors = null) {
    $response = [
        'success' => false,
        'message' => $message
    ];
    if ($errors) {
        $response['errors'] = $errors;
    }
    jsonResponse($response, $statusCode);
}

function paginatedResponse($data, $total, $page, $perPage) {
    jsonResponse([
        'success' => true,
        'data' => $data,
        'pagination' => [
            'total' => (int)$total,
            'page' => (int)$page,
            'per_page' => (int)$perPage,
            'total_pages' => ceil($total / $perPage)
        ]
    ]);
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: [];
}

function getPaginationParams() {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = min(MAX_PAGE_SIZE, max(1, (int)($_GET['per_page'] ?? DEFAULT_PAGE_SIZE)));
    $offset = ($page - 1) * $perPage;
    return [$page, $perPage, $offset];
}
