<?php
/**
 * Coupons API
 */
function validateCoupon($db) {
    $data = getJsonInput();
    $code = trim($data['code'] ?? '');
    $cartTotal = (float)($data['cart_total'] ?? 0);
    if (empty($code)) errorResponse('Coupon code required', 400);
    $stmt = $db->prepare("SELECT * FROM coupons WHERE code = :code AND is_active = 1 AND (starts_at IS NULL OR starts_at<=NOW()) AND (expires_at IS NULL OR expires_at>=NOW()) AND (usage_limit IS NULL OR used_count < usage_limit)");
    $stmt->execute([':code'=>$code]);
    $coupon = $stmt->fetch();
    if (!$coupon) errorResponse('Invalid or expired coupon', 400);
    if ($cartTotal < $coupon['min_order_amount']) errorResponse("Minimum order amount is ₹{$coupon['min_order_amount']}", 400);
    $discount = 0;
    if ($coupon['discount_type']==='percentage') { $discount = round($cartTotal * $coupon['discount_value']/100, 2); if ($coupon['max_discount']) $discount = min($discount, $coupon['max_discount']); }
    else { $discount = $coupon['discount_value']; }
    successResponse(['code'=>$coupon['code'],'discount_type'=>$coupon['discount_type'],'discount_value'=>$coupon['discount_value'],'discount_amount'=>$discount,'description'=>$coupon['description']]);
}
