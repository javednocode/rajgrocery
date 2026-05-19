<?php
/**
 * Debug script — open this URL on Hostinger to check logo path
 * URL: https://mediumturquoise-rat-568948.hostingersite.com/debug_logo.php
 * DELETE after use!
 */
echo "<pre>\n";
echo "__DIR__: " . __DIR__ . "\n";
echo "DOCUMENT_ROOT: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'N/A') . "\n";

$logoRelative = '/uploads/branding/logo_invoice.jpg';
$paths = [
    realpath(__DIR__) . $logoRelative,
    ($_SERVER['DOCUMENT_ROOT'] ?? '') . $logoRelative,
    __DIR__ . $logoRelative,
    __DIR__ . '/..' . $logoRelative,
];

foreach ($paths as $p) {
    echo "Path: $p => " . (file_exists($p) ? "EXISTS ✅" : "NOT FOUND ❌") . "\n";
}

// List what's in uploads/branding/
$brandDir = __DIR__ . '/uploads/branding/';
echo "\nContents of $brandDir:\n";
if (is_dir($brandDir)) {
    foreach (scandir($brandDir) as $f) {
        if ($f === '.' || $f === '..') continue;
        echo "  $f (" . filesize($brandDir . $f) . " bytes)\n";
    }
} else {
    echo "  Directory not found!\n";
}
echo "</pre>";
