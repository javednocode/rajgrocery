<?php
/**
 * Orders API
 */

function getOrders($db) {
    [$page, $perPage, $offset] = getPaginationParams();
    $where = ["o.deleted_at IS NULL"];
    $params = [];
    if (!empty($_GET['status'])) { $where[] = "o.status = :status"; $params[':status'] = $_GET['status']; }
    if (!empty($_GET['q'])) { $where[] = "(o.order_number LIKE :q1 OR o.customer_name LIKE :q2 OR o.customer_phone LIKE :q3)"; $s='%'.$_GET['q'].'%'; $params[':q1']=$s; $params[':q2']=$s; $params[':q3']=$s; }
    $whereClause = 'WHERE '.implode(' AND ', $where);
    $countStmt = $db->prepare("SELECT COUNT(*) FROM orders o $whereClause"); $countStmt->execute($params); $total = $countStmt->fetchColumn();
    $sql = "SELECT o.* FROM orders o $whereClause ORDER BY o.created_at DESC LIMIT :lim OFFSET :off";
    $stmt = $db->prepare($sql);
    foreach ($params as $k=>$v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $orders = $stmt->fetchAll();
    if (!empty($orders)) {
        $orderIds = array_column($orders, 'id');
        $placeholders = implode(',', array_fill(0, count($orderIds), '?'));
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id IN ($placeholders)");
        $itemStmt->execute($orderIds);
        $allItems = $itemStmt->fetchAll();
        $itemsByOrder = [];
        foreach ($allItems as $item) {
            $itemsByOrder[$item['order_id']][] = $item;
        }
        foreach ($orders as &$o) {
            $o['items'] = $itemsByOrder[$o['id']] ?? [];
            $o['item_count'] = count($o['items']);
        }

        $invoiceStmt = $db->prepare("SELECT order_id FROM invoices WHERE order_id IN ($placeholders)");
        $invoiceStmt->execute($orderIds);
        $invoicedSet = array_flip(array_column($invoiceStmt->fetchAll(), 'order_id'));
        foreach ($orders as &$o) {
            $o['has_invoice'] = isset($invoicedSet[$o['id']]);
        }
    }
    paginatedResponse($orders, $total, $page, $perPage);
}

function getOrderById($db, $id) {
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = :id"); $stmt->execute([':id'=>$id]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found', 404);
    $items = $db->prepare("SELECT * FROM order_items WHERE order_id = :oid"); $items->execute([':oid'=>$id]);
    $order['items'] = $items->fetchAll();
    successResponse($order);
}

function trackOrder($db, $orderNumber) {
    $stmt = $db->prepare("SELECT id, order_number, status, payment_status, total, created_at, delivered_at FROM orders WHERE order_number = :num");
    $stmt->execute([':num'=>$orderNumber]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found', 404);
    successResponse($order);
}

function getMyOrders($db, $customerId) {
    [$page, $perPage, $offset] = getPaginationParams();
    $countStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE customer_id = :id");
    $countStmt->execute([':id' => $customerId]);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $db->prepare("SELECT * FROM orders WHERE customer_id = :id ORDER BY created_at DESC LIMIT :lim OFFSET :off");
    $stmt->bindValue(':id', $customerId, PDO::PARAM_INT);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $orders = $stmt->fetchAll();

    if (!empty($orders)) {
        $orderIds = array_column($orders, 'id');
        $placeholders = implode(',', array_fill(0, count($orderIds), '?'));
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id IN ($placeholders)");
        $itemStmt->execute($orderIds);
        $allItems = $itemStmt->fetchAll();
        $itemsByOrder = [];
        foreach ($allItems as $item) {
            $itemsByOrder[$item['order_id']][] = $item;
        }
        foreach ($orders as &$o) {
            $o['items'] = $itemsByOrder[$o['id']] ?? [];
            $o['item_count'] = count($o['items']);
        }
    }

    paginatedResponse($orders, $total, $page, $perPage);
}

function getMyOrderById($db, $customerId, $id) {
    // Ownership check and "don't leak existence" both fall out of this
    // single WHERE clause — no separate 403 path needed.
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = :id AND customer_id = :cid");
    $stmt->execute([':id' => $id, ':cid' => $customerId]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found', 404);
    $items = $db->prepare("SELECT * FROM order_items WHERE order_id = :oid");
    $items->execute([':oid' => $id]);
    $order['items'] = $items->fetchAll();
    successResponse($order);
}

function getOrderInvoice($db, $id) {
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found', 404);

    $items = $db->prepare("SELECT * FROM order_items WHERE order_id = :oid");
    $items->execute([':oid' => $id]);
    $orderItems = $items->fetchAll();
    if (empty($orderItems)) errorResponse('Order has no items', 400);

    try {
        require_once __DIR__ . '/../helpers/invoice_pdf.php';
        $pdfPath = generatePDFInvoice($order, $orderItems, loadSiteSettings($db));

        try {
            $db->prepare("INSERT INTO invoices (order_id, order_number, pdf_path)
                VALUES (:oid, :num, :pdf)
                ON DUPLICATE KEY UPDATE pdf_path = :pdf2, generated_at = NOW()")
               ->execute([
                   ':oid' => $id,
                   ':num' => $order['order_number'],
                   ':pdf' => $pdfPath,
                   ':pdf2' => $pdfPath,
               ]);
        } catch (\Throwable $logEx) {
            error_log('Invoice tracking skipped: ' . $logEx->getMessage());
        }

        successResponse([
            'invoice_url' => $pdfPath,
            'filename' => $order['order_number'] . '.pdf'
        ], 'Invoice ready');
    } catch (\Throwable $e) {
        errorResponse('Invoice generation failed: ' . $e->getMessage(), 500);
    }
}

function printOrderInvoiceHTML($db, $id) {
    // ── Auth via session or admin_token cookie ─────────────────────────
    // Popup windows cannot send Authorization: Bearer headers, so we
    // fall back to the same session/cookie check that admin header.php uses.
    if (session_status() === PHP_SESSION_NONE) session_start();
    $authenticated = false;

    if (!empty($_SESSION['admin_id']) && !empty($_SESSION['admin_role'])) {
        $authenticated = true;
    }
    if (!$authenticated && !empty($_COOKIE['admin_token'])) {
        $parts = explode('.', $_COOKIE['admin_token']);
        if (count($parts) === 3) {
            $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
            if ($payload && (!isset($payload['exp']) || $payload['exp'] > time())
                && ($payload['type'] ?? 'admin') !== 'customer') {
                $authenticated = true;
            }
        }
    }
    if (!$authenticated) {
        http_response_code(401);
        echo '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;text-align:center;">'
           . '<h2>Session expired</h2><p>Please <a href="/admin/">log in</a> and try again.</p>'
           . '</body></html>';
        exit;
    }
    // ───────────────────────────────────────────────────────────────────

    $stmt = $db->prepare("SELECT * FROM orders WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $order = $stmt->fetch();
    if (!$order) { http_response_code(404); echo 'Order not found'; exit; }

    $items = $db->prepare("SELECT * FROM order_items WHERE order_id = :oid");
    $items->execute([':oid' => $id]);
    $orderItems = $items->fetchAll();
    if (empty($orderItems)) { http_response_code(400); echo 'Order has no items'; exit; }

    // Track invoice print
    try {
        $db->prepare("INSERT INTO invoices (order_id, order_number, pdf_path)
            VALUES (:oid, :num, :pdf)
            ON DUPLICATE KEY UPDATE generated_at = NOW()")
           ->execute([
               ':oid' => $id,
               ':num' => $order['order_number'],
               ':pdf' => 'html-print',
           ]);
    } catch (\Throwable $e) {}

    require_once __DIR__ . '/../helpers/invoice_html.php';
    $html = generateHTMLInvoice($order, $orderItems, loadSiteSettings($db));

    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-store');
    echo $html;
    exit;
}

function getOrderNotifications($db, $id) {
    $stmt = $db->prepare("SELECT id, order_number, customer_email FROM orders WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found', 404);

    $result = [
        'order' => $order,
        'queue' => [],
        'logs' => []
    ];

    try {
        $q = $db->prepare("SELECT id, email_type, recipient, subject, status, attempts, max_attempts, error_message, scheduled_at, processed_at, created_at
            FROM email_queue WHERE order_id = :id ORDER BY created_at DESC");
        $q->execute([':id' => $id]);
        $result['queue'] = $q->fetchAll();
    } catch (\Throwable $e) {
        $result['queue_error'] = $e->getMessage();
    }

    try {
        $l = $db->prepare("SELECT id, queue_id, email_type, recipient, subject, status, smtp_response, error_message, sent_at
            FROM email_logs WHERE order_id = :id ORDER BY sent_at DESC");
        $l->execute([':id' => $id]);
        $result['logs'] = $l->fetchAll();
    } catch (\Throwable $e) {
        $result['logs_error'] = $e->getMessage();
    }

    successResponse($result);
}

function sendOrderNotifications($db, $id) {
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found', 404);

    $items = $db->prepare("SELECT * FROM order_items WHERE order_id = :oid");
    $items->execute([':oid' => $id]);
    $orderItems = $items->fetchAll();
    if (empty($orderItems)) errorResponse('Order has no items', 400);

    require_once __DIR__ . '/../helpers/email.php';

    try {
        $result = sendOrderEmailsNow($db, $order, $orderItems);
        successResponse($result, 'Order emails sent');
    } catch (\Throwable $e) {
        errorResponse('Order email send failed: ' . $e->getMessage(), 500);
    }
}

function createOrder($db) {
    $data = getJsonInput();
    // Guests get NULL here exactly as before; a logged-in customer's
    // token (if sent) silently links the order without ever requiring one.
    $customerPayload = optionalCustomerAuth();
    $customerId = $customerPayload['id'] ?? null;
    if (empty($data['items']) || !is_array($data['items'])) errorResponse('Order items required', 400);
    if (empty($data['customer_name'])) errorResponse('Customer name required', 400);
    if (empty($data['customer_phone'])) errorResponse('Customer phone required', 400);
    if (empty($data['shipping_address'])) errorResponse('Shipping address required', 400);

    // Auto-repair payment columns to avoid MySQL strict mode ENUM truncation errors for 'bank_transfer'
    try {
        $db->exec("ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50) DEFAULT 'cod'");
        $db->exec("ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(50) DEFAULT 'pending'");
    } catch (\Throwable $colEx) {}

    $transactionOpen = false;
    $db->beginTransaction();
    $transactionOpen = true;
    try {
        // Generate order number
        $orderNumber = 'KP-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));

        // Calculate totals
        $subtotal = 0;
        $orderItems = [];
        
        $normalizedItems = [];
        foreach ($data['items'] as $item) {
            $rawProductId = $item['product_id'] ?? null;
            $variationId = $item['variation_id'] ?? null;

            if (is_string($rawProductId) && preg_match('/^(\d+)_v(\d+)$/', $rawProductId, $matches)) {
                $rawProductId = (int)$matches[1];
                $variationId = (int)$matches[2];
            }

            $productId = (int)$rawProductId;
            $quantity = max(1, (int)($item['quantity'] ?? 1));
            if ($productId <= 0) continue;

            $normalizedItems[] = [
                'product_id' => $productId,
                'variation_id' => !empty($variationId) ? (int)$variationId : null,
                'quantity' => $quantity,
            ];
        }

        $productIds = array_values(array_unique(array_column($normalizedItems, 'product_id')));
        if (empty($productIds)) throw new Exception("No valid products in order");
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        // Fetch all products at once
        $pStmt = $db->prepare("
            SELECT p.id, p.name, p.price, p.sale_price, p.stock,
                (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image 
            FROM products p 
            WHERE p.id IN ($placeholders) AND p.is_active = 1
        ");
        $pStmt->execute($productIds);
        $productsMap = [];
        foreach ($pStmt->fetchAll() as $p) {
            $productsMap[$p['id']] = $p;
        }

        $variationIds = array_values(array_unique(array_filter(array_column($normalizedItems, 'variation_id'))));
        $variationsMap = [];
        if (!empty($variationIds)) {
            $vPlaceholders = implode(',', array_fill(0, count($variationIds), '?'));
            $vStmt = $db->prepare("SELECT * FROM product_variations WHERE id IN ($vPlaceholders) AND is_active = 1");
            $vStmt->execute($variationIds);
            foreach ($vStmt->fetchAll() as $v) {
                $variationsMap[(int)$v['id']] = $v;
            }
        }

        foreach ($normalizedItems as $item) {
            $pid = $item['product_id'];
            if (!isset($productsMap[$pid])) throw new Exception("Product #{$pid} not found or inactive");
            $product = $productsMap[$pid];
            $variation = null;
            if (!empty($item['variation_id'])) {
                $variation = $variationsMap[(int)$item['variation_id']] ?? null;
                if (!$variation || (int)$variation['product_id'] !== (int)$pid) {
                    throw new Exception("Variation #{$item['variation_id']} not found or inactive");
                }
            }

            $stock = $variation ? (int)$variation['stock'] : (int)$product['stock'];
            if ($stock < $item['quantity']) {
                $name = $product['name'] . ($variation ? ' - ' . $variation['name'] : '');
                throw new Exception("Insufficient stock for {$name}");
            }

            $price = $variation
                ? ($variation['sale_price'] ?: $variation['price'])
                : ($product['sale_price'] ?: $product['price']);
            $lineTotal = $price * $item['quantity'];
            $subtotal += $lineTotal;
            $orderItems[] = [
                'product_id' => $product['id'],
                'variation_id' => $variation ? (int)$variation['id'] : null,
                'product_name' => $product['name'] . ($variation ? ' - ' . $variation['name'] : ''),
                'product_image' => ($variation && !empty($variation['image_path'])) ? $variation['image_path'] : $product['primary_image'],
                'price' => $price,
                'quantity' => $item['quantity'],
                'total' => $lineTotal,
            ];
        }

        // ── Load all delivery settings from DB ─────────────────────────────
        $settStmt = $db->prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_group = 'delivery' OR setting_key IN ('tax_percentage','currency_symbol','hk_delivery_cities')");
        $settStmt->execute();
        $dSettings = [];
        while ($r = $settStmt->fetch()) $dSettings[$r['setting_key']] = $r['setting_value'];

        $freeAbove          = (float)($dSettings['delivery_free_above']          ?? 50);
        $freeEnabled        = ($dSettings['delivery_free_enabled']               ?? '1') === '1';
        $localFee           = (float)($dSettings['delivery_local_fee']           ?? 2.95);
        $standardFee        = (float)($dSettings['delivery_standard_fee']        ?? 4.95);
        $smallOrderMin      = (float)($dSettings['delivery_small_order_min']     ?? 25);
        $smallOrderFee      = (float)($dSettings['delivery_small_order_fee']     ?? 1.50);
        $smallOrderEnabled  = ($dSettings['delivery_small_order_enabled']        ?? '1') === '1';
        $taxPercent         = (float)($dSettings['tax_percentage']               ?? 0);
        $localKeywords      = array_filter(array_map('trim', explode(',', strtolower($dSettings['delivery_local_keywords'] ?? ''))));
        $localPrefixes      = array_filter(array_map('trim', explode(',', strtoupper($dSettings['delivery_local_postcode_prefixes'] ?? ''))));

        // ── Detect delivery zone ──────────────────────────────────────────────
        $addr = $data['shipping_address'];
        if (is_string($addr)) $addr = json_decode($addr, true) ?? [];
        $eircode = strtoupper(trim($addr['eircode'] ?? ''));
        $city    = strtolower(trim($addr['city']    ?? ''));
        $county  = strtolower(trim($addr['county']  ?? ''));

        // ── NOTE: minAmount in hk_delivery_cities is the FREE DELIVERY THRESHOLD,
        // NOT a minimum order restriction. Orders are ALWAYS allowed regardless of
        // cart total. If subtotal >= minAmount, delivery is free; otherwise the
        // city's delivery fee applies. No order is ever blocked here.

        $isLocalDelivery = false;
        foreach ($localPrefixes as $prefix) {
            if ($prefix !== '' && str_starts_with($eircode, $prefix)) {
                $isLocalDelivery = true;
                break;
            }
        }
        if (!$isLocalDelivery) {
            foreach ($localKeywords as $keyword) {
                if ($keyword !== '' && (str_contains($city, $keyword) || str_contains($county, $keyword))) {
                    $isLocalDelivery = true;
                    break;
                }
            }
        }
        // Also respect frontend-sent delivery_zone override
        if (!empty($data['delivery_zone'])) {
            $zoneOverride = strtolower((string)$data['delivery_zone']);
            $isLocalDelivery = ($zoneOverride === 'local');
        }

        // ── Calculate shipping charge ─────────────────────────────────────────
        if ($isLocalDelivery) {
            if ($freeEnabled && $subtotal >= $freeAbove) {
                $shippingCharge = 0;
            } else {
                $shippingCharge = $localFee;
            }
        } else {
            $shippingCharge = $standardFee;
            // Small order surcharge
            if ($smallOrderEnabled && $subtotal < $smallOrderMin) {
                $shippingCharge += $smallOrderFee;
            }
        }

        // Use frontend-provided shipping charge if it was explicitly set (avoids race conditions)
        if (isset($data['shipping_charge']) && is_numeric($data['shipping_charge'])) {
            $shippingCharge = (float)$data['shipping_charge'];
        }

        $tax = round($subtotal * $taxPercent / 100, 2);

        // Apply coupon
        $discount = 0;
        $couponCode = $data['coupon_code'] ?? null;
        if ($couponCode) {
            $cStmt = $db->prepare("SELECT * FROM coupons WHERE code = :code AND is_active = 1 AND (starts_at IS NULL OR starts_at<=NOW()) AND (expires_at IS NULL OR expires_at>=NOW()) AND (usage_limit IS NULL OR used_count < usage_limit)");
            $cStmt->execute([':code'=>$couponCode]);
            $coupon = $cStmt->fetch();
            if ($coupon && $subtotal >= $coupon['min_order_amount']) {
                if ($coupon['discount_type']==='percentage') { $discount = round($subtotal * $coupon['discount_value'] / 100, 2); if ($coupon['max_discount']) $discount = min($discount, $coupon['max_discount']); }
                else { $discount = $coupon['discount_value']; }
                $db->prepare("UPDATE coupons SET used_count = used_count + 1 WHERE id = :id")->execute([':id'=>$coupon['id']]);
            }
        }

        $total = $subtotal - $discount + $shippingCharge + $tax;

        // Create order with payment_status automatically set to 'paid' for bank transfer / non-COD
        $paymentMethod = $data['payment_method'] ?? 'cod';
        $paymentStatus = (strtolower((string)$paymentMethod) !== 'cod') ? 'paid' : 'pending';
        $oStmt = $db->prepare("INSERT INTO orders (order_number,customer_id,customer_name,customer_email,customer_phone,shipping_address,billing_address,subtotal,discount,shipping_charge,tax,total,coupon_code,payment_method,payment_status,notes,status) VALUES (:num,:cust,:name,:email,:phone,:ship,:bill,:sub,:disc,:ship_c,:tax,:total,:coupon,:pay,:pay_status,:notes,:status)");
        $shippingAddr = is_array($data['shipping_address']) ? json_encode($data['shipping_address']) : $data['shipping_address'];
        $oStmt->execute([':num'=>$orderNumber,':cust'=>$customerId,':name'=>$data['customer_name'],':email'=>$data['customer_email']??null,':phone'=>$data['customer_phone'],':ship'=>$shippingAddr,':bill'=>$data['billing_address']??$shippingAddr,':sub'=>$subtotal,':disc'=>$discount,':ship_c'=>$shippingCharge,':tax'=>$tax,':total'=>$total,':coupon'=>$couponCode,':pay'=>$paymentMethod,':pay_status'=>$paymentStatus,':notes'=>$data['notes']??null,':status'=>'pending']);
        $orderId = $db->lastInsertId();

        // Create order items and update stock
        $oiStmt = $db->prepare("INSERT INTO order_items (order_id,product_id,product_name,product_image,price,quantity,total) VALUES (:oid,:pid,:name,:img,:price,:qty,:total)");
        foreach ($orderItems as $oi) {
            $oiStmt->execute([':oid'=>$orderId,':pid'=>$oi['product_id'],':name'=>$oi['product_name'],':img'=>$oi['product_image'],':price'=>$oi['price'],':qty'=>$oi['quantity'],':total'=>$oi['total']]);
            $db->prepare("UPDATE products SET stock = stock - :qty, sales_count = sales_count + :qty2 WHERE id = :id")->execute([':qty'=>$oi['quantity'],':qty2'=>$oi['quantity'],':id'=>$oi['product_id']]);
            if (!empty($oi['variation_id'])) {
                $db->prepare("UPDATE product_variations SET stock = stock - :qty WHERE id = :id")
                   ->execute([':qty' => $oi['quantity'], ':id' => $oi['variation_id']]);
            }
            // Check if product is now out of stock and log it
            try {
                require_once __DIR__ . '/../helpers/activity_log.php';
                $stockCheck = $db->prepare("SELECT id, name, stock FROM products WHERE id = :id");
                $stockCheck->execute([':id' => $oi['product_id']]);
                $pRow = $stockCheck->fetch();
                if ($pRow && (int)$pRow['stock'] <= 0) {
                    logActivity($db, 'product_out_of_stock', 'products',
                        (int)$pRow['id'], $pRow['name'],
                        null, '0',
                        "Product \"{$pRow['name']}\" went OUT OF STOCK after order {$orderNumber}"
                    );
                }
            } catch (\Throwable $logEx) {
                error_log('Stock log error: ' . $logEx->getMessage());
            }
        }

        $db->commit();
        $transactionOpen = false;

        $fullOrder = $db->prepare("SELECT * FROM orders WHERE id = :id");
        $fullOrder->execute([':id' => $orderId]);
        $orderData = $fullOrder->fetch();
        if ($orderData) {
            $orderData['id'] = $orderId;
        }

        $emailsQueued = false;
        try {
            require_once __DIR__ . '/../helpers/email.php';
            if ($orderData) {
                queueOrderEmails($db, $orderData, $orderItems);
                $emailsQueued = true;
            }
        } catch (\Throwable $emailEx) {
            error_log('Order notification queue error: ' . $emailEx->getMessage());
        }

        // Logged-in customer bookkeeping — never fatal, never rolls back
        // the already-committed order (same failure posture as the email
        // queueing block above).
        if ($customerId) {
            try {
                $db->prepare("UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + :amt WHERE id = :id")
                   ->execute([':amt' => $total, ':id' => $customerId]);

                if (!empty($data['save_address'])) {
                    $countStmt = $db->prepare("SELECT COUNT(*) FROM addresses WHERE customer_id = :id");
                    $countStmt->execute([':id' => $customerId]);
                    $isFirstAddr = ((int)$countStmt->fetchColumn()) === 0;
                    if ($isFirstAddr) {
                        $db->prepare("UPDATE addresses SET is_default = 0 WHERE customer_id = :id")->execute([':id' => $customerId]);
                    }
                    $db->prepare("INSERT INTO addresses (customer_id, label, full_name, phone, address_line1, address_line2, city, state, pincode, is_default) VALUES (:cid, 'Home', :fn, :phone, :l1, :l2, :city, :state, :pin, :def)")
                       ->execute([
                           ':cid'   => $customerId,
                           ':fn'    => $data['customer_name'],
                           ':phone' => $data['customer_phone'],
                           ':l1'    => $data['address_line1'] ?? '',
                           ':l2'    => $data['address_line2'] ?? null,
                           ':city'  => $data['city'] ?? '',
                           ':state' => $data['state'] ?? '',
                           ':pin'   => $data['pincode'] ?? '',
                           ':def'   => $isFirstAddr ? 1 : 0
                       ]);
                }
            } catch (\Throwable $custEx) {
                error_log('Customer order bookkeeping error: ' . $custEx->getMessage());
            }
        }

        successResponse([
            'order_id'     => $orderId,
            'order_number' => $orderNumber,
            'total'        => $total,
            'emails_queued'=> $emailsQueued
        ], 'Order placed successfully', 201);
    } catch (\Throwable $e) {
        if ($transactionOpen && $db->inTransaction()) {
            $db->rollBack();
        }
        errorResponse($e->getMessage(), 400);
    }
}

function updateOrder($db, $id) {
    require_once __DIR__ . '/../helpers/activity_log.php';
    $data = getJsonInput();
    $fields = [];
    $params = [':id'=>$id];

    // Fetch old values for logging
    $old = $db->prepare("SELECT order_number, status, payment_status, customer_name FROM orders WHERE id=:id");
    $old->execute([':id'=>$id]);
    $oldRow = $old->fetch();

    if (isset($data['status'])) { $fields[] = "status=:status"; $params[':status'] = $data['status']; if ($data['status']==='delivered') { $fields[] = "delivered_at=NOW()"; } }
    if (isset($data['payment_status'])) { $fields[] = "payment_status=:ps"; $params[':ps'] = $data['payment_status']; }
    if (isset($data['payment_id'])) { $fields[] = "payment_id=:pid"; $params[':pid'] = $data['payment_id']; }
    if (isset($data['notes'])) { $fields[] = "notes=:notes"; $params[':notes'] = $data['notes']; }
    if (empty($fields)) errorResponse('No fields to update', 400);
    $sql = "UPDATE orders SET ".implode(',', $fields)." WHERE id=:id";
    $db->prepare($sql)->execute($params);

    // Log order status change
    if (isset($data['status']) && $oldRow) {
        logActivity($db,
            'order_status_changed', 'orders',
            (int)$id, $oldRow['order_number'],
            $oldRow['status'], $data['status'],
            "Order {$oldRow['order_number']} ({$oldRow['customer_name']}) status changed from ".strtoupper($oldRow['status']).' to '.strtoupper($data['status'])
        );
    }
    // Log payment status change
    if (isset($data['payment_status']) && $oldRow) {
        logActivity($db,
            'payment_status_changed', 'orders',
            (int)$id, $oldRow['order_number'],
            $oldRow['payment_status'], $data['payment_status'],
            "Order {$oldRow['order_number']} ({$oldRow['customer_name']}) payment changed from ".strtoupper($oldRow['payment_status']).' to '.strtoupper($data['payment_status'])
        );
    }

    // Queue status email if status changed
    if (isset($data['status'])) {
        try {
            require_once __DIR__ . '/../helpers/email.php';
            $ord = $db->prepare("SELECT * FROM orders WHERE id=:id");
            $ord->execute([':id' => $id]);
            $orderRow = $ord->fetch();
            if ($orderRow) {
                queueStatusEmail($db, $orderRow, $data['status']);
                triggerEmailQueueWorker($id);
            }
        } catch (\Throwable $e) {
            error_log('Status email queue error: ' . $e->getMessage());
        }
    }

    successResponse(null, 'Order updated');
}

function uploadPaymentScreenshot($db, $id) {
    // Verify order exists
    $stmt = $db->prepare("SELECT id, order_number, notes FROM orders WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found', 404);

    if (empty($_FILES['screenshot'])) errorResponse('No screenshot file provided', 400);

    $file = $_FILES['screenshot'];
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    if (!in_array($mimeType, $allowedTypes)) errorResponse('Invalid file type. Only images allowed.', 400);
    if ($file['size'] > 10 * 1024 * 1024) errorResponse('File too large. Max 10MB.', 400);

    $uploadDir = __DIR__ . '/../uploads/payment_proofs/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0775, true);

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
    $filename = 'proof_' . $order['order_number'] . '_' . time() . '.' . strtolower($ext);
    $dest = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) errorResponse('Failed to save file', 500);

    $relPath = '/uploads/payment_proofs/' . $filename;

    // Merge screenshot URL into notes JSON
    $existingNotes = $order['notes'] ?? '';
    $notesData = [];
    if ($existingNotes && str_starts_with(trim($existingNotes), '{')) {
        $decoded = json_decode($existingNotes, true);
        if ($decoded) $notesData = $decoded;
    } else {
        if ($existingNotes) $notesData['customer_note'] = $existingNotes;
    }
    $notesData['payment_proof'] = $relPath;
    $notesData['payment_proof_uploaded_at'] = date('Y-m-d H:i:s');

    $db->prepare("UPDATE orders SET notes = :notes, payment_status = 'pending' WHERE id = :id")
       ->execute([':notes' => json_encode($notesData), ':id' => $id]);

    successResponse([
        'screenshot_url' => $relPath,
        'order_number'   => $order['order_number']
    ], 'Payment screenshot uploaded successfully');
}


function ensureDeletedAtColumn($db) {
    static $checked = false;
    if ($checked) return;
    $checked = true;
    try {
        $db->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL");
        $db->exec("ALTER TABLE orders ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at)");
    } catch (\Throwable $e) { /* column may already exist */ }
}

/* ── Soft Delete (move to Recycle Bin) ── */
function deleteOrder($db, $id) {
    ensureDeletedAtColumn($db);
    require_once __DIR__ . '/../helpers/activity_log.php';
    $stmt = $db->prepare("SELECT id, order_number, customer_name, total FROM orders WHERE id = :id AND deleted_at IS NULL");
    $stmt->execute([':id' => $id]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found', 404);

    $db->prepare("UPDATE orders SET deleted_at = NOW() WHERE id = :id")->execute([':id' => $id]);

    logActivity($db, 'order_deleted', 'orders',
        (int)$id, $order['order_number'],
        $order['status'], 'deleted',
        "Order {$order['order_number']} ({$order['customer_name']}, HK\${$order['total']}) moved to Recycle Bin"
    );
    successResponse(null, 'Order moved to Recycle Bin');
}

/* ── Get Recycle Bin (deleted orders) ── */
function getDeletedOrders($db) {
    ensureDeletedAtColumn($db);
    [$page, $perPage, $offset] = getPaginationParams();
    $total = $db->query("SELECT COUNT(*) FROM orders WHERE deleted_at IS NOT NULL")->fetchColumn();
    $sql = "SELECT * FROM orders WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT :lim OFFSET :off";
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $orders = $stmt->fetchAll();
    paginatedResponse($orders, $total, $page, $perPage);
}

/* ── Restore Order from Recycle Bin ── */
function restoreOrder($db, $id) {
    require_once __DIR__ . '/../helpers/activity_log.php';
    $stmt = $db->prepare("SELECT id, order_number, customer_name, total, status FROM orders WHERE id = :id AND deleted_at IS NOT NULL");
    $stmt->execute([':id' => $id]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found in recycle bin', 404);

    $db->prepare("UPDATE orders SET deleted_at = NULL WHERE id = :id")->execute([':id' => $id]);

    logActivity($db, 'order_restored', 'orders',
        (int)$id, $order['order_number'],
        'deleted', $order['status'],
        "Order {$order['order_number']} ({$order['customer_name']}) restored from Recycle Bin"
    );
    successResponse(null, 'Order restored successfully');
}

/* ── Permanent Delete from Recycle Bin ── */
function permanentDeleteOrder($db, $id) {
    require_once __DIR__ . '/../helpers/activity_log.php';
    $stmt = $db->prepare("SELECT id, order_number, customer_name, total FROM orders WHERE id = :id AND deleted_at IS NOT NULL");
    $stmt->execute([':id' => $id]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found in recycle bin', 404);

    $db->beginTransaction();
    try {
        foreach (['email_logs', 'email_queue', 'invoices', 'order_items'] as $table) {
            try { $db->prepare("DELETE FROM {$table} WHERE order_id = :id")->execute([':id' => $id]); }
            catch (\Throwable $e) { error_log("Skipping {$table} for order {$id}: " . $e->getMessage()); }
        }
        $db->prepare("DELETE FROM orders WHERE id = :id")->execute([':id' => $id]);
        $db->commit();

        logActivity($db, 'order_permanent_deleted', 'orders',
            (int)$id, $order['order_number'],
            null, null,
            "Order {$order['order_number']} ({$order['customer_name']}, HK\${$order['total']}) permanently deleted"
        );
        successResponse(null, 'Order permanently deleted');
    } catch (\Throwable $e) {
        $db->rollBack();
        errorResponse('Permanent delete failed: ' . $e->getMessage(), 500);
    }
}
