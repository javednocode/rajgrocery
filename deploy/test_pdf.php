<?php
require_once 'helpers/invoice_pdf.php';
$order = [
    'order_number' => 'TEST-001',
    'created_at' => date('Y-m-d H:i:s'),
    'customer_name' => 'Test User',
    'customer_phone' => '1234567890',
    'customer_email' => 'test@example.com',
    'shipping_address' => '123 Test St',
    'payment_method' => 'cod',
    'status' => 'pending',
    'subtotal' => 10.00,
    'total' => 10.00
];
$items = [
    ['product_name' => 'Test Item', 'quantity' => 1, 'price' => 10.00, 'total' => 10.00]
];
echo generatePDFInvoice($order, $items) . "\n";
