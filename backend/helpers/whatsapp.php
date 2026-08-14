<?php
/**
 * White-label ecommerce WhatsApp notification helper
 * Uses CallMeBot API (free) - no paid account needed
 */

function sendWhatsAppNotification($cfg, $order) {
    $number = $cfg['whatsapp_number'] ?? '';
    $apiKey = $cfg['whatsapp_api_key'] ?? '';

    if (empty($number) || empty($apiKey)) return;

    $siteName = function_exists('settingOrDefault') ? settingOrDefault($cfg, 'site_name', 'Your Store') : ($cfg['site_name'] ?? 'Your Store');
    $adminUrl = function_exists('settingOrDefault') ? settingOrDefault($cfg, 'admin_url', '/admin/orders.php') : ($cfg['admin_url'] ?? '/admin/orders.php');
    $currency = function_exists('settingOrDefault') ? settingOrDefault($cfg, 'currency_symbol', '$') : ($cfg['currency_symbol'] ?? '$');
    $payMethod = strtoupper(str_replace('_', ' ', $order['payment_method'] ?? 'COD'));
    $payStatus = (strtolower((string)($order['payment_method'] ?? 'cod')) !== 'cod' || ($order['payment_status'] ?? '') === 'paid') ? ' - PAID ✅' : ' (COD)';

    $msg = "🛒 *New Order - {$siteName}*\n"
         . "Order: *{$order['order_number']}*\n"
         . "Customer: {$order['customer_name']}\n"
         . "Phone: {$order['customer_phone']}\n"
         . "Total: {$currency}" . number_format($order['total'] ?? 0, 2) . "\n"
         . "Payment: {$payMethod}{$payStatus}\n"
         . "View: {$adminUrl}";

    $url = 'https://api.callmebot.com/whatsapp.php?'
         . http_build_query([
               'phone'  => $number,
               'text'   => $msg,
               'apikey' => $apiKey,
           ]);

    // Fire-and-forget using non-blocking curl
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 5,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    curl_exec($ch);
    curl_close($ch);
}
