-- Seed live Hostinger DB with grocery/halal products.
-- Non-destructive: updates matching slugs, inserts missing rows, and does not delete existing products.
-- Import into selected database: u303278809_asian_halal

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `icon` VARCHAR(100) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `focus_keyword` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(300) NOT NULL UNIQUE,
  `short_description` VARCHAR(500) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `sale_price` DECIMAL(10,2) DEFAULT NULL,
  `cost_price` DECIMAL(10,2) DEFAULT NULL,
  `sku` VARCHAR(100) DEFAULT NULL,
  `barcode` VARCHAR(100) DEFAULT NULL,
  `stock` INT DEFAULT 0,
  `low_stock_threshold` INT DEFAULT 5,
  `weight` DECIMAL(8,2) DEFAULT NULL,
  `unit` VARCHAR(50) DEFAULT 'piece',
  `brand` VARCHAR(150) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_trending` TINYINT(1) DEFAULT 0,
  `is_new` TINYINT(1) DEFAULT 0,
  `views` INT DEFAULT 0,
  `sales_count` INT DEFAULT 0,
  `avg_rating` DECIMAL(3,2) DEFAULT 0.00,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `focus_keyword` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_price` (`price`),
  INDEX `idx_featured` (`is_featured`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product_categories` (
  `product_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`product_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `sort_order`, `is_active`, `is_featured`) VALUES
('Halal Meats', 'fresh-halal-meats', 'Fresh halal-certified meats and poultry', '🥩', 1, 1, 1),
('Chicken', 'chicken', 'Fresh chicken cuts and poultry essentials', '🍗', 2, 1, 1),
('Vegetables', 'vegetables', 'Fresh vegetables and herbs', '🥦', 3, 1, 1),
('Fresh Fruits', 'fresh-fruits', 'Seasonal fresh fruits', '🍎', 4, 1, 1),
('Spices', 'spices', 'Premium spices, masalas and seasonings', '🌶️', 5, 1, 1),
('Rice & Flour', 'rice-flour', 'Rice, flour and pantry staples', '🌾', 6, 1, 1),
('Dairy & Eggs', 'dairy-eggs', 'Milk, dairy products and eggs', '🥚', 7, 1, 1),
('Beverages', 'beverages', 'Tea, drinks and everyday beverages', '🧃', 8, 1, 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `icon` = VALUES(`icon`),
  `sort_order` = VALUES(`sort_order`),
  `is_active` = 1,
  `is_featured` = 1;

INSERT INTO `products`
  (`name`, `slug`, `short_description`, `description`, `price`, `sale_price`, `sku`, `stock`, `low_stock_threshold`, `unit`, `brand`, `is_active`, `is_featured`, `is_trending`, `is_new`, `sales_count`, `meta_title`, `meta_description`)
VALUES
('Whole Chicken (1kg)', 'whole-chicken-1kg', 'Fresh halal whole chicken, cleaned and packed.', 'Fresh halal-certified whole chicken. Ideal for roasting, curries and family meals.', 6.99, 5.99, 'ASM-CHICKEN-1KG', 80, 10, '1 kg', 'Asian Spices', 1, 1, 1, 0, 42, 'Whole Chicken 1kg', 'Fresh halal whole chicken online'),
('Lamb Leg Pieces (500g)', 'lamb-leg-pieces-500g', 'Tender halal lamb leg pieces for biryani and curries.', 'Tender boneless lamb leg pieces, halal certified. Perfect for biryani and slow-cooked curries.', 9.99, 8.49, 'ASM-LAMB-500', 45, 8, '500 g', 'Asian Spices', 1, 1, 1, 0, 36, 'Lamb Leg Pieces 500g', 'Fresh halal lamb leg pieces online'),
('Chicken Breast Fillets (500g)', 'chicken-breast-fillets-500g', 'Lean halal chicken breast fillets.', 'Fresh lean halal chicken breast fillets, trimmed and packed for everyday cooking.', 7.49, 6.49, 'ASM-BREAST-500', 55, 8, '500 g', 'Asian Spices', 1, 1, 1, 1, 28, 'Chicken Breast Fillets 500g', 'Fresh halal chicken breast fillets online'),
('Kashmiri Red Chilli Powder (200g)', 'kashmiri-red-chilli-powder-200g', 'Rich colour and mild heat for curries and marinades.', 'Premium Kashmiri red chilli powder with vibrant colour and balanced flavour.', 3.49, NULL, 'ASM-CHILLI-200', 120, 15, '200 g', 'Asian Spices', 1, 1, 1, 0, 30, 'Kashmiri Red Chilli Powder 200g', 'Premium Kashmiri red chilli powder online'),
('Basmati Rice (5kg)', 'basmati-rice-5kg', 'Long grain premium basmati rice.', 'Premium long-grain basmati rice for biryani, pulao and everyday meals.', 11.99, 9.99, 'ASM-RICE-5KG', 65, 10, '5 kg', 'Asian Spices', 1, 1, 1, 0, 33, 'Basmati Rice 5kg', 'Premium basmati rice 5kg online'),
('Fresh Coriander Bunch', 'fresh-coriander-bunch', 'Fresh coriander bunch for garnish and chutneys.', 'Fresh coriander leaves, perfect for garnishing curries, salads and chutneys.', 0.99, NULL, 'ASM-CORIANDER-1', 100, 15, '1 bunch', 'Asian Spices', 1, 1, 0, 1, 18, 'Fresh Coriander Bunch', 'Fresh coriander bunch online'),
('Premium Tea Pack (500g)', 'premium-tea-pack-500g', 'Strong aromatic tea for daily chai.', 'Premium tea blend with rich colour and strong aroma for everyday chai.', 5.49, 4.99, 'ASM-TEA-500', 75, 10, '500 g', 'Asian Spices', 1, 1, 1, 1, 25, 'Premium Tea Pack 500g', 'Premium tea pack online'),
('Fresh Tomatoes (500g)', 'fresh-tomatoes-500g', 'Fresh ripe tomatoes for cooking and salads.', 'Fresh ripe tomatoes selected for daily cooking, salads and sauces.', 2.49, 1.99, 'ASM-TOMATO-500', 90, 12, '500 g', 'Asian Spices', 1, 1, 0, 1, 21, 'Fresh Tomatoes 500g', 'Fresh tomatoes online'),
('Farm Fresh Eggs (12 pcs)', 'farm-fresh-eggs-12pcs', 'Fresh eggs for breakfast and baking.', 'Pack of 12 fresh eggs, ideal for breakfast, baking and daily meals.', 4.49, NULL, 'ASM-EGGS-12', 70, 10, '12 pcs', 'Asian Spices', 1, 1, 0, 1, 19, 'Farm Fresh Eggs 12 pcs', 'Fresh eggs online'),
('Atta Flour (5kg)', 'atta-flour-5kg', 'Fine whole wheat atta for soft rotis.', 'Whole wheat atta flour for soft chapatis, rotis and parathas.', 8.49, 7.49, 'ASM-ATTA-5KG', 60, 10, '5 kg', 'Asian Spices', 1, 1, 1, 0, 24, 'Atta Flour 5kg', 'Whole wheat atta flour 5kg online')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `short_description` = VALUES(`short_description`),
  `description` = VALUES(`description`),
  `price` = VALUES(`price`),
  `sale_price` = VALUES(`sale_price`),
  `sku` = VALUES(`sku`),
  `stock` = VALUES(`stock`),
  `unit` = VALUES(`unit`),
  `brand` = VALUES(`brand`),
  `is_active` = 1,
  `is_featured` = 1,
  `is_trending` = VALUES(`is_trending`),
  `is_new` = VALUES(`is_new`),
  `sales_count` = VALUES(`sales_count`),
  `meta_title` = VALUES(`meta_title`),
  `meta_description` = VALUES(`meta_description`);

INSERT IGNORE INTO `product_categories` (`product_id`, `category_id`)
SELECT p.id, c.id FROM `products` p JOIN `categories` c ON c.slug = 'fresh-halal-meats'
WHERE p.slug IN ('whole-chicken-1kg', 'lamb-leg-pieces-500g', 'chicken-breast-fillets-500g');

INSERT IGNORE INTO `product_categories` (`product_id`, `category_id`)
SELECT p.id, c.id FROM `products` p JOIN `categories` c ON c.slug = 'chicken'
WHERE p.slug IN ('whole-chicken-1kg', 'chicken-breast-fillets-500g');

INSERT IGNORE INTO `product_categories` (`product_id`, `category_id`)
SELECT p.id, c.id FROM `products` p JOIN `categories` c ON c.slug = 'spices'
WHERE p.slug IN ('kashmiri-red-chilli-powder-200g');

INSERT IGNORE INTO `product_categories` (`product_id`, `category_id`)
SELECT p.id, c.id FROM `products` p JOIN `categories` c ON c.slug = 'rice-flour'
WHERE p.slug IN ('basmati-rice-5kg', 'atta-flour-5kg');

INSERT IGNORE INTO `product_categories` (`product_id`, `category_id`)
SELECT p.id, c.id FROM `products` p JOIN `categories` c ON c.slug = 'vegetables'
WHERE p.slug IN ('fresh-coriander-bunch', 'fresh-tomatoes-500g');

INSERT IGNORE INTO `product_categories` (`product_id`, `category_id`)
SELECT p.id, c.id FROM `products` p JOIN `categories` c ON c.slug = 'beverages'
WHERE p.slug IN ('premium-tea-pack-500g');

INSERT IGNORE INTO `product_categories` (`product_id`, `category_id`)
SELECT p.id, c.id FROM `products` p JOIN `categories` c ON c.slug = 'dairy-eggs'
WHERE p.slug IN ('farm-fresh-eggs-12pcs');
