<?php
/**
 * HTML Invoice generator — opens in popup, auto-triggers browser print dialog.
 * No PDF needed. Works in Chrome, Firefox, Safari.
 */

require_once __DIR__ . '/branding.php';

function generateHTMLInvoice($order, $items, $cfg = []) {
    $siteName   = settingOrDefault($cfg, 'site_name',    'Your Store');
    $tagline    = settingOrDefault($cfg, 'site_tagline', '');
    $email      = settingOrDefault($cfg, 'site_email',   settingOrDefault($cfg, 'contact_email', ''));
    $phone      = settingOrDefault($cfg, 'site_phone',   '');
    $address    = settingOrDefault($cfg, 'site_address', '');
    $logo       = settingOrDefault($cfg, 'site_logo',    '');

    $orderNum   = htmlspecialchars($order['order_number'] ?? '');
    $orderDate  = date('d M Y', strtotime($order['created_at'] ?? 'now'));
    $custName   = htmlspecialchars($order['customer_name']  ?? '');
    $custPhone  = htmlspecialchars($order['customer_phone'] ?? '');
    $custEmail  = htmlspecialchars($order['customer_email'] ?? '');

    // Format shipping address
    $rawAddr = $order['shipping_address'] ?? '';
    if (is_string($rawAddr)) { $addrData = json_decode($rawAddr, true) ?? []; } else { $addrData = (array)$rawAddr; }
    if (!empty($addrData)) {
        $addrParts = array_filter(array_map('trim', [
            $addrData['address_line1'] ?? $addrData['street'] ?? $addrData['address'] ?? '',
            $addrData['address_line2'] ?? '',
            $addrData['city'] ?? $addrData['town'] ?? '',
            $addrData['county'] ?? $addrData['state'] ?? '',
            $addrData['eircode'] ?? $addrData['postcode'] ?? $addrData['pincode'] ?? '',
            $addrData['country'] ?? '',
        ]));
        $shippingAddr = htmlspecialchars(implode(', ', $addrParts)) ?: '—';
    } else {
        $shippingAddr = htmlspecialchars(trim(str_replace(['undefined', ',,,'], ['', ''], (string)$rawAddr))) ?: '—';
    }

    $payMethod   = strtoupper($order['payment_method'] ?? 'COD');
    $payStatus   = strtoupper($order['payment_status'] ?? 'PENDING');
    $orderStatus = strtoupper($order['status'] ?? 'PENDING');

    $subtotal  = (float)($order['subtotal']       ?? 0);
    $discount  = (float)($order['discount']       ?? 0);
    $shipping  = (float)($order['shipping_charge'] ?? 0);
    $tax       = (float)($order['tax']            ?? 0);
    $total     = (float)($order['total']          ?? 0);

    $currSymbol = settingOrDefault($cfg, 'currency_symbol', 'HK$');

    function fmt($n, $sym) { return $sym . number_format((float)$n, 2); }

    // Build items rows HTML
    $itemRows = '';
    $altRow = false;
    foreach ($items as $item) {
        $altRow = !$altRow;
        $itemRows .= '<tr>'
            . '<td style="text-align:left;">' . htmlspecialchars($item['product_name'] ?? '') . '</td>'
            . '<td style="text-align:center;">' . (int)($item['quantity'] ?? 0) . '</td>'
            . '<td style="text-align:right;">' . fmt($item['price'] ?? 0, $currSymbol) . '</td>'
            . '<td style="text-align:right;font-weight:900;">' . fmt($item['total'] ?? 0, $currSymbol) . '</td>'
            . '</tr>';
    }

    // Pay status badge colour
    $payBadgeColor = match(strtolower($order['payment_status'] ?? '')) {
        'paid'     => '#16a34a',
        'failed'   => '#dc2626',
        'refunded' => '#1d4ed8',
        default    => '#d97706',
    };

    $logoHtml = '';
    if ($logo) {
        // Try to build absolute URL
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http')
                 . '://' . ($_SERVER['HTTP_HOST'] ?? '');
        $logoSrc = $baseUrl . '/' . ltrim($logo, '/');
        $logoHtml = '<img src="' . htmlspecialchars($logoSrc) . '" alt="' . htmlspecialchars($siteName) . '" style="max-height:38px;max-width:150px;object-fit:contain;display:block;margin:0 0 5px auto;">';
    }

    $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Invoice {$orderNum}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size:13px;
            font-weight:600;
            color:#1f2937;
            background:#f3f4f6;
        }
        .page {
            max-width:800px;
            margin:0 auto;
            background:#fff;
            box-shadow:0 4px 32px rgba(0,0,0,.10);
        }

        /* Header */
        .inv-header {
            background: #ffffff !important;
            color:#000 !important;
            padding:16px 32px 12px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:24px;
            border-bottom:2px solid #000;
        }
        .inv-header h1 { font-size:25px; font-weight:800; letter-spacing:.03em; line-height:1.05; color:#000 !important; }
        .inv-header .inv-no  { font-size:12.5px; font-weight:700; color:#000 !important; margin-top:3px; }
        .inv-header .inv-date{ font-size:12px; font-weight:600; color:#333 !important; margin-top:1px; }
        .brand-block { text-align:right; line-height:1.25; }
        .brand-block .brand-name { font-size:17px; font-weight:800; color:#000 !important; }
        .brand-block .brand-sub  { font-size:11px; font-weight:500; color:#555; margin-top:2px; }

        /* Info grid */
        .inv-grid {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:0;
            border-bottom:1px solid #e5e7eb;
        }
        .inv-section { padding:16px 32px; border-right:1px solid #e5e7eb; }
        .inv-section:last-child { border-right:none; }
        .inv-section h3 {
            font-size:10px; letter-spacing:.1em; text-transform:uppercase;
            color:#6b7280; margin-bottom:8px; font-weight:700;
        }
        .inv-section p { font-size:13px; line-height:1.65; color:#111827; font-weight:600; }
        .inv-section strong { color:#000; font-weight:700; }

        /* Status pill */
        .pill {
            display:inline-block; padding:3px 10px;
            border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.04em;
        }

        /* Items table */
        .inv-table-wrap { padding:0; }
        table { width:100%; border-collapse:collapse; border:1px solid #ddd; }
        thead tr { background:#ffffff !important; }
        thead th {
            padding:9px 14px; text-align:left;
            font-size:11px; font-weight:800; letter-spacing:.06em;
            text-transform:uppercase; color:#000 !important;
            border-bottom:2px solid #000;
            border-right:1px solid #ddd;
        }
        thead th:last-child { border-right:none; }
        thead th:not(:first-child) { text-align:right; }
        thead th:nth-child(2) { text-align:center; }
        tbody tr { border-bottom:1px solid #e5e7eb; }
        tbody tr:nth-child(even) { background:#f9fafb; }
        tbody td { padding:8px 14px; color:#111827; font-weight:600; border-right:1px solid #e5e7eb; }
        tbody td:last-child { border-right:none; }
        tbody td:not(:first-child) { text-align:right; }
        tbody td:nth-child(2) { text-align:center; }

        /* Totals */
        .totals-wrap { display:flex; justify-content:flex-end; padding:14px 32px; border-top:2px solid #000; }
        .totals { width:270px; }
        .totals-row { display:flex; justify-content:space-between; padding:4px 0; font-size:13px; font-weight:600; color:#374151; }
        .totals-row.discount { color:#333; }
        .totals-row.grand {
            font-size:17px; font-weight:800; color:#111827;
            border-top:2px solid #111827; margin-top:6px; padding-top:9px;
        }

        /* Footer */
        .inv-footer {
            padding:14px 32px;
            background:#f9fafb;
            border-top:1px solid #e5e7eb;
            display:flex; justify-content:space-between; align-items:center;
            font-size:12px; font-weight:600; color:#6b7280;
        }

        /* Print button — screen only */
        .print-btn-bar {
            text-align:center; padding:14px;
            background:#f5f5f5; position:sticky; top:0; z-index:100;
            border-bottom:1px solid #ddd;
        }
        .print-btn {
            background:#111827; color:#fff; border:none;
            padding:10px 28px; border-radius:6px;
            font-size:14px; font-weight:700; cursor:pointer;
            display:inline-flex; align-items:center; gap:8px;
            transition:background .15s;
        }
        .print-btn:hover { background:#374151; }

        /* ══ PRINT ══ */
        @page { size: A4; margin: 8mm 8mm 10mm; }
        @media print {
            body  { background:#fff; }
            .page { max-width:100%; box-shadow:none; margin:0; padding:0; }

            /* Completely remove print button bar — belt AND suspenders */
            .no-print,
            .print-btn-bar {
                display:none !important;
                visibility:hidden !important;
                height:0 !important;
                max-height:0 !important;
                overflow:hidden !important;
                margin:0 !important;
                padding:0 !important;
            }

            /* Header: flush to @page margin, no extra top whitespace */
            .inv-header {
                padding:4px 20px 8px;
            }
            .inv-header h1 { font-size:20px; }
            .brand-block .brand-name { font-size:14px; }
            .brand-block .brand-sub  { font-size:10px; }

            /* Info sections — compact */
            .inv-section { padding:7px 20px; }
            .inv-section h3 { margin-bottom:4px; }
            .inv-section p { font-size:11.5px; line-height:1.45; }

            /* Table — make columns fit, TOTAL never clips */
            thead th, tbody td { padding:5px 8px; font-size:11px; }
            thead th:nth-child(1) { width:auto; }
            thead th:nth-child(2) { width:36px; }
            thead th:nth-child(3) { width:80px; }
            thead th:nth-child(4) { width:80px; }

            /* Totals */
            .totals-wrap { padding:8px 20px; }
            .totals { width:220px; }
            .totals-row { font-size:11.5px; padding:3px 0; }
            .totals-row.grand { font-size:14px; }

            /* Footer */
            .inv-footer { padding:7px 20px 0; background:#fff; font-size:11px; }

            /* Pagination */
            thead { display:table-header-group; }
            tr    { page-break-inside:avoid; }
        }
    </style>
</head>
<body>

<div class="print-btn-bar no-print">
    <button class="print-btn" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print Invoice
    </button>
</div>

<div class="page">

    <!-- Header -->
    <div class="inv-header">
        <div>
            <h1>INVOICE</h1>
            <div class="inv-no">#{$orderNum}</div>
            <div class="inv-date">Date: {$orderDate}</div>
        </div>
        <div class="brand-block">
            {$logoHtml}
            <div class="brand-name">{$siteName}</div>
            <div class="brand-sub">{$tagline}</div>
        </div>
    </div>

    <!-- Info Grid -->
    <div class="inv-grid">
        <div class="inv-section">
            <h3>Billed To</h3>
            <p>
                <strong>{$custName}</strong><br>
                {$custPhone}<br>
                {$custEmail}<br>
                {$shippingAddr}
            </p>
        </div>
        <div class="inv-section">
            <h3>Order Details</h3>
            <p>
                <strong>Invoice:</strong> {$orderNum}<br>
                <strong>Date:</strong> {$orderDate}<br>
                <strong>Method:</strong> {$payMethod}<br>
                <strong>Payment:</strong> <span class="pill" style="background:{$payBadgeColor};color:#fff;">{$payStatus}</span><br>
                <strong>Status:</strong> {$orderStatus}
            </p>
        </div>
    </div>

    <!-- Items Table -->
    <div class="inv-table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="text-align:center;width:60px;">Qty</th>
                    <th style="text-align:right;width:110px;">Unit Price</th>
                    <th style="text-align:right;width:110px;">Total</th>
                </tr>
            </thead>
            <tbody>
                {$itemRows}
            </tbody>
        </table>
    </div>

    <!-- Totals -->
    <div class="totals-wrap">
        <div class="totals">
            <div class="totals-row">
                <span>Subtotal</span>
                <span>{$currSymbol}{$subtotal}</span>
            </div>
HTML;

    if ($discount > 0) {
        $html .= '<div class="totals-row discount"><span>Discount</span><span>-' . fmt($discount, $currSymbol) . '</span></div>';
    }

    $html .= <<<HTML
            <div class="totals-row">
                <span>Shipping</span>
                <span>{$currSymbol}{$shipping}</span>
            </div>
            <div class="totals-row">
                <span>Tax</span>
                <span>{$currSymbol}{$tax}</span>
            </div>
            <div class="totals-row grand">
                <span>Total</span>
                <span>{$currSymbol}{$total}</span>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="inv-footer">
        <div>
HTML;

    if ($email) $html .= htmlspecialchars($email);
    if ($phone) $html .= ' &nbsp;|&nbsp; ' . htmlspecialchars($phone);

    $html .= <<<HTML
        </div>
        <div>Thank you for your order!</div>
    </div>

</div>

<script>
    // Auto-trigger print dialog when opened as popup
    window.addEventListener('load', function() {
        // Small delay so page renders first
        setTimeout(function() { window.print(); }, 400);
    });
</script>

</body>
</html>
HTML;

    return $html;
}
