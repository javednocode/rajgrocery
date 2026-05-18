-- asianfoodcork Demo Seed Data
USE `asianfoodcork_db`;

-- Categories
INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `sort_order`, `is_active`, `is_featured`) VALUES
('Fresh Vegetables', 'fresh-vegetables', 'Farm-fresh vegetables delivered daily', '🥬', 1, 1, 1),
('Fresh Fruits', 'fresh-fruits', 'Seasonal and exotic fruits', '🍎', 2, 1, 1),
('Dairy & Eggs', 'dairy-eggs', 'Milk, cheese, butter, and eggs', '🥛', 3, 1, 1),
('Bakery', 'bakery', 'Freshly baked bread, cakes, and pastries', '🍞', 4, 1, 1),
('Beverages', 'beverages', 'Juices, soft drinks, and more', '🥤', 5, 1, 1),
('Snacks', 'snacks', 'Chips, cookies, and munchies', '🍿', 6, 1, 1),
('Staples', 'staples', 'Rice, flour, pulses, and cooking essentials', '🌾', 7, 1, 1),
('Spices & Masala', 'spices-masala', 'Fresh ground spices and masalas', '🌶️', 8, 1, 1);

-- Products
INSERT INTO `products` (`name`, `slug`, `short_description`, `price`, `sale_price`, `stock`, `unit`, `brand`, `is_active`, `is_featured`, `is_trending`, `is_new`, `meta_title`, `meta_description`) VALUES
('Organic Tomatoes', 'organic-tomatoes', 'Fresh organic tomatoes, perfect for salads and cooking', 45.00, 38.00, 150, 'kg', 'FarmFresh', 1, 1, 1, 1, 'Buy Organic Tomatoes Online', 'Fresh organic tomatoes at best prices'),
('Fresh Spinach', 'fresh-spinach', 'Nutrient-rich fresh spinach leaves', 30.00, NULL, 100, 'pack', 'GreenLeaf', 1, 1, 0, 0, 'Fresh Spinach Online', 'Buy fresh spinach leaves'),
('Bananas - Robusta', 'bananas-robusta', 'Sweet and ripe Robusta bananas', 55.00, 48.00, 200, 'dozen', 'TropiFruit', 1, 1, 1, 0, NULL, NULL),
('Full Cream Milk', 'full-cream-milk', 'Pure and pasteurized full cream milk', 65.00, NULL, 500, 'l', 'AmulDairy', 1, 1, 0, 0, NULL, NULL),
('Brown Bread', 'brown-bread', 'Healthy whole wheat brown bread', 42.00, 35.00, 80, 'pack', 'BreadKraft', 1, 1, 0, 1, NULL, NULL),
('Alphonso Mango', 'alphonso-mango', 'Premium Alphonso mangoes from Ratnagiri', 350.00, 299.00, 50, 'kg', 'MangoKing', 1, 1, 1, 1, 'Premium Alphonso Mango Online', 'Order Alphonso mangoes online'),
('Green Capsicum', 'green-capsicum', 'Crunchy green bell peppers', 80.00, NULL, 120, 'kg', 'FarmFresh', 1, 0, 0, 0, NULL, NULL),
('Amul Butter', 'amul-butter', 'Rich and creamy Amul butter', 56.00, 52.00, 300, 'pack', 'Amul', 1, 1, 1, 0, NULL, NULL),
('Basmati Rice', 'basmati-rice', 'Premium aged Basmati rice, long grain', 180.00, 159.00, 200, 'kg', 'IndiaGate', 1, 1, 0, 0, 'Buy Basmati Rice Online', 'Premium basmati rice at best price'),
('Red Chilli Powder', 'red-chilli-powder', 'Pure and hot red chilli powder', 95.00, NULL, 150, 'pack', 'EverSpice', 1, 0, 0, 1, NULL, NULL),
('Fresh Orange Juice', 'fresh-orange-juice', '100% natural orange juice, no added sugar', 120.00, 99.00, 80, 'l', 'Tropicana', 1, 1, 0, 0, NULL, NULL),
('Potato Chips Classic', 'potato-chips-classic', 'Crispy classic salted potato chips', 30.00, 25.00, 250, 'pack', 'Lays', 1, 0, 1, 0, NULL, NULL);

-- Product-Category mappings
INSERT INTO `product_categories` (`product_id`, `category_id`) VALUES
(1, 1), (2, 1), (7, 1), (3, 2), (6, 2),
(4, 3), (8, 3), (5, 4), (11, 5), (12, 6),
(9, 7), (10, 8);

-- Banners
INSERT INTO `banners` (`title`, `subtitle`, `image`, `button_text`, `link`, `position`, `sort_order`, `is_active`) VALUES
('Fresh Groceries Delivered Fast', 'Get up to 30% off on your first order', '/uploads/banners/hero1.jpg', 'Shop Now', '/categories', 'hero', 1, 1),
('Farm Fresh Vegetables', 'Direct from farm to your table', '/uploads/banners/hero2.jpg', 'Browse Veggies', '/category/fresh-vegetables', 'hero', 2, 1);

-- Coupons
INSERT INTO `coupons` (`code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount`, `is_active`) VALUES
('WELCOME10', '10% off on first order', 'percentage', 10.00, 200.00, 100.00, 1),
('FRESH50', 'Flat ₹50 off', 'fixed', 50.00, 300.00, NULL, 1);

-- Blog posts
INSERT INTO `blog_posts` (`title`, `slug`, `excerpt`, `content`, `author`, `status`, `published_at`, `meta_title`, `meta_description`) VALUES
('10 Benefits of Eating Organic Vegetables', '10-benefits-organic-vegetables', 'Discover why organic vegetables are better for your health and the environment.', '<p>Organic vegetables are grown without synthetic pesticides or fertilizers. Here are 10 amazing benefits of including organic produce in your daily diet...</p><h2>1. No Harmful Chemicals</h2><p>Organic farming avoids the use of synthetic pesticides, making the produce safer for consumption.</p><h2>2. Better Nutrition</h2><p>Studies show organic vegetables often have higher levels of vitamins and minerals.</p>', 'Admin', 'published', NOW(), 'Benefits of Organic Vegetables', 'Learn about the health benefits of eating organic vegetables'),
('How to Store Fresh Fruits for Longer', 'store-fresh-fruits-longer', 'Simple tips to keep your fruits fresh for days.', '<p>Storing fruits properly can extend their shelf life significantly. Here are our top tips for keeping your fruits fresh and delicious...</p>', 'Admin', 'published', NOW(), 'How to Store Fruits', 'Tips for storing fresh fruits to last longer');
