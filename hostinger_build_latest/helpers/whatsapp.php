<?php
/**
 * Asian Food Cork - WhatsApp Notification Helper
 * Uses CallMeBot API (free) - no paid account needed
 */

function sendWhatsAppNotification($cfg, $order) {
    $number = $cfg['whatsapp_number'] ?? '';
    $apiKey = $cfg['whatsapp_api_key'] ?? '';

    if (empty($number) || empty($apiKey)) return;

    $msg = "🛒 *New Order - Asian Food Cork*\n"
         . "Order: *{$order['order_number']}*\n"
         . "Customer: {$order['customer_name']}\n"
         . "Phone: {$order['customer_phone']}\n"
         . "Total: €" . number_format($order['total'] ?? 0, 2) . "\n"
         . "Payment: " . strtoupper($order['payment_method'] ?? 'COD') . "\n"
         . "View: https://mediumturquoise-rat-568948.hostingersite.com/admin/orders.php";

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
