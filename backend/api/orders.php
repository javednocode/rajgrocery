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
    foreach ($orders as &$o) {
        $items = $db->prepare("SELECT * FROM order_items WHERE order_id = :oid");
        $items->execute([':oid'=>$o['id']]);
        $o['items'] = $items->fetchAll();
        $o['item_count'] = count($o['items']);
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

function createOrder($db) {
    $data = getJsonInput();
    if (empty($data['items']) || !is_array($data['items'])) errorResponse('Order items required', 400);
    if (empty($data['customer_name'])) errorResponse('Customer name required', 400);
    if (empty($data['customer_phone'])) errorResponse('Customer phone required', 400);
    if (empty($data['shipping_address'])) errorResponse('Shipping address required', 400);

    $db->beginTransaction();
    try {
        // Generate order number
        $orderNumber = 'KP-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));

        // Calculate totals
        $subtotal = 0;
        $orderItems = [];
        foreach ($data['items'] as $item) {
            $pStmt = $db->prepare("SELECT id, name, price, sale_price, stock, (SELECT image_path FROM product_images WHERE product_id = products.id AND is_primary = 1 LIMIT 1) as primary_image FROM products WHERE id = :id AND is_active = 1");
            $pStmt->execute([':id'=>$item['product_id']]);
            $product = $pStmt->fetch();
            if (!$product) throw new Exception("Product #{$item['product_id']} not found");
            if ($product['stock'] < $item['quantity']) throw new Exception("Insufficient stock for {$product['name']}");
            $price = $product['sale_price'] ?: $product['price'];
            $lineTotal = $price * $item['quantity'];
            $subtotal += $lineTotal;
            $orderItems[] = ['product_id'=>$product['id'],'product_name'=>$product['name'],'product_image'=>$product['primary_image'],'price'=>$price,'quantity'=>$item['quantity'],'total'=>$lineTotal];
        }

        // Get shipping/tax settings
        $settStmt = $db->prepare("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('shipping_free_above','shipping_charge','tax_percentage')");
        $settStmt->execute();
        $settings = [];
        while ($r = $settStmt->fetch()) $settings[$r['setting_key']] = (float)$r['setting_value'];
        $freeAbove = $settings['shipping_free_above'] ?? 500;
        $shippingCharge = $subtotal >= $freeAbove ? 0 : ($settings['shipping_charge'] ?? 40);
        $taxPercent = $settings['tax_percentage'] ?? 5;
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
        $oStmt = $db->prepare("INSERT INTO orders (order_number,customer_name,customer_email,customer_phone,shipping_address,billing_address,subtotal,discount,shipping_charge,tax,total,coupon_code,payment_method,status) VALUES (:num,:name,:email,:phone,:ship,:bill,:sub,:disc,:ship_c,:tax,:total,:coupon,:pay,:status)");
        $shippingAddr = is_array($data['shipping_address']) ? json_encode($data['shipping_address']) : $data['shipping_address'];
        $oStmt->execute([':num'=>$orderNumber,':name'=>$data['customer_name'],':email'=>$data['customer_email']??null,':phone'=>$data['customer_phone'],':ship'=>$shippingAddr,':bill'=>$data['billing_address']??$shippingAddr,':sub'=>$subtotal,':disc'=>$discount,':ship_c'=>$shippingCharge,':tax'=>$tax,':total'=>$total,':coupon'=>$couponCode,':pay'=>$data['payment_method']??'cod',':status'=>'pending']);
        $orderId = $db->lastInsertId();

        // Create order items and update stock
        $oiStmt = $db->prepare("INSERT INTO order_items (order_id,product_id,product_name,product_image,price,quantity,total) VALUES (:oid,:pid,:name,:img,:price,:qty,:total)");
        foreach ($orderItems as $oi) {
            $oiStmt->execute([':oid'=>$orderId,':pid'=>$oi['product_id'],':name'=>$oi['product_name'],':img'=>$oi['product_image'],':price'=>$oi['price'],':qty'=>$oi['quantity'],':total'=>$oi['total']]);
            $db->prepare("UPDATE products SET stock = stock - :qty, sales_count = sales_count + :qty2 WHERE id = :id")->execute([':qty'=>$oi['quantity'],':qty2'=>$oi['quantity'],':id'=>$oi['product_id']]);
        }

        $db->commit();

        // ── Queue confirmation emails (async, non-blocking) ──────────────
        try {
            require_once __DIR__ . '/../helpers/email.php';
            require_once __DIR__ . '/../helpers/whatsapp.php';
            $fullOrder = $db->prepare("SELECT * FROM orders WHERE id = :id");
            $fullOrder->execute([':id' => $orderId]);
            $orderData = $fullOrder->fetch();
            $orderData['id'] = $orderId;
            queueOrderEmails($db, $orderData, $orderItems);
        } catch (\Throwable $emailEx) {
            // Email failure must NEVER block the order response
            error_log('Email queue error: ' . $emailEx->getMessage());
        }

        successResponse(['order_id'=>$orderId,'order_number'=>$orderNumber,'total'=>$total], 'Order placed successfully', 201);
    } catch (\Throwable $e) {
        $db->rollBack();
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
            if ($orderRow) queueStatusEmail($db, $orderRow, $data['status']);
        } catch (\Throwable $e) {
            error_log('Status email queue error: ' . $e->getMessage());
        }
    }

    successResponse(null, 'Order updated');
}
