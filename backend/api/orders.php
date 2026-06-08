<?php
/**
 * Orders API
 */

function getOrders($db) {
    [$page, $perPage, $offset] = getPaginationParams();
    $where = ["1=1"];
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
        $pdfPath = generatePDFInvoice($order, $orderItems);

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
    if (empty($data['items']) || !is_array($data['items'])) errorResponse('Order items required', 400);
    if (empty($data['customer_name'])) errorResponse('Customer name required', 400);
    if (empty($data['customer_phone'])) errorResponse('Customer phone required', 400);
    if (empty($data['shipping_address'])) errorResponse('Shipping address required', 400);

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
        $settStmt = $db->prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_group = 'delivery' OR setting_key IN ('tax_percentage','currency_symbol')");
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

        // Create order
        $oStmt = $db->prepare("INSERT INTO orders (order_number,customer_name,customer_email,customer_phone,shipping_address,billing_address,subtotal,discount,shipping_charge,tax,total,coupon_code,payment_method,notes,status) VALUES (:num,:name,:email,:phone,:ship,:bill,:sub,:disc,:ship_c,:tax,:total,:coupon,:pay,:notes,:status)");
        $shippingAddr = is_array($data['shipping_address']) ? json_encode($data['shipping_address']) : $data['shipping_address'];
        $oStmt->execute([':num'=>$orderNumber,':name'=>$data['customer_name'],':email'=>$data['customer_email']??null,':phone'=>$data['customer_phone'],':ship'=>$shippingAddr,':bill'=>$data['billing_address']??$shippingAddr,':sub'=>$subtotal,':disc'=>$discount,':ship_c'=>$shippingCharge,':tax'=>$tax,':total'=>$total,':coupon'=>$couponCode,':pay'=>$data['payment_method']??'cod',':notes'=>$data['notes']??null,':status'=>'pending']);
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

        successResponse([
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'total' => $total,
            'emails_queued' => $emailsQueued
        ], 'Order placed successfully', 201);
    } catch (\Throwable $e) {
        if ($transactionOpen && $db->inTransaction()) {
            $db->rollBack();
        }
        errorResponse($e->getMessage(), 400);
    }
}

function updateOrder($db, $id) {
    $data = getJsonInput();
    $fields = [];
    $params = [':id'=>$id];
    if (isset($data['status'])) { $fields[] = "status=:status"; $params[':status'] = $data['status']; if ($data['status']==='delivered') { $fields[] = "delivered_at=NOW()"; } }
    if (isset($data['payment_status'])) { $fields[] = "payment_status=:ps"; $params[':ps'] = $data['payment_status']; }
    if (isset($data['payment_id'])) { $fields[] = "payment_id=:pid"; $params[':pid'] = $data['payment_id']; }
    if (isset($data['notes'])) { $fields[] = "notes=:notes"; $params[':notes'] = $data['notes']; }
    if (empty($fields)) errorResponse('No fields to update', 400);
    $sql = "UPDATE orders SET ".implode(',', $fields)." WHERE id=:id";
    $db->prepare($sql)->execute($params);

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

function deleteOrder($db, $id) {
    $stmt = $db->prepare("SELECT id, order_number FROM orders WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $order = $stmt->fetch();
    if (!$order) errorResponse('Order not found', 404);

    $db->beginTransaction();
    try {
        // Some deployments have foreign keys, some imports do not, so clean related
        // rows explicitly before removing the order itself.
        $relatedTables = ['email_logs', 'email_queue', 'invoices', 'order_items'];
        foreach ($relatedTables as $table) {
            try {
                $db->prepare("DELETE FROM {$table} WHERE order_id = :id")->execute([':id' => $id]);
            } catch (\Throwable $e) {
                error_log("Skipping {$table} cleanup for order {$id}: " . $e->getMessage());
            }
        }

        $delete = $db->prepare("DELETE FROM orders WHERE id = :id");
        $delete->execute([':id' => $id]);
        $db->commit();
        successResponse(['id' => (int)$id, 'order_number' => $order['order_number']], 'Order deleted');
    } catch (\Throwable $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        errorResponse('Delete failed: ' . $e->getMessage(), 500);
    }
}
