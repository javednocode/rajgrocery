-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: localhost    Database: asianfoodcork_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `label` varchar(50) DEFAULT 'Home',
  `full_name` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','editor') DEFAULT 'admin',
  `avatar` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Admin','admin@asianfoodcork.com','$2y$12$zN5bUzn5By0aUNO3qMnVyeL4umKHP5xK7vSjqVghYZEtJ4dU.7mZC','super_admin',NULL,1,'2026-05-04 23:10:36','2026-05-04 09:39:28','2026-05-04 17:40:36');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `mobile_image` varchar(255) DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `position` enum('hero','secondary','sidebar') DEFAULT 'hero',
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (3,'Authentic Asian Groceries','Delivered fresh to your door in Cork','',NULL,'/categories','Shop Now','hero',1,1,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37'),(4,'Korean & Japanese Favourites','Kimchi, Matcha, Ramen & more','',NULL,'/category/korean-foods','Explore','hero',2,1,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_categories`
--

DROP TABLE IF EXISTS `blog_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_categories`
--

LOCK TABLES `blog_categories` WRITE;
/*!40000 ALTER TABLE `blog_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(300) NOT NULL,
  `excerpt` varchar(500) DEFAULT NULL,
  `content` longtext,
  `featured_image` varchar(255) DEFAULT NULL,
  `author` varchar(100) DEFAULT 'Admin',
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `views` int DEFAULT '0',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `focus_keyword` varchar(150) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_status` (`status`),
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
INSERT INTO `blog_posts` VALUES (1,NULL,'Top 10 Must-Have Asian Pantry Essentials','top-10-asian-pantry-essentials','Build the perfect Asian pantry with these 10 essential ingredients available at Asian Food Cork.','<p>Organic vegetables are grown without synthetic pesticides or fertilizers. Here are 10 amazing benefits of including organic produce in your daily diet...</p><h2>1. No Harmful Chemicals</h2><p>Organic farming avoids the use of synthetic pesticides, making the produce safer for consumption.</p><h2>2. Better Nutrition</h2><p>Studies show organic vegetables often have higher levels of vitamins and minerals.</p>',NULL,'Asian Food Cork','published',0,'Benefits of Organic Vegetables','Learn about the health benefits of eating organic vegetables',NULL,'2026-05-04 15:09:28','2026-05-04 09:39:28','2026-05-04 09:53:37'),(2,NULL,'How to Make Authentic Bubble Tea at Home','how-to-make-bubble-tea-at-home','Step-by-step guide to making delicious bubble tea with ingredients from our store.','<p>Storing fruits properly can extend their shelf life significantly. Here are our top tips for keeping your fruits fresh and delicious...</p>',NULL,'Asian Food Cork','published',0,'How to Store Fruits','Tips for storing fresh fruits to last longer',NULL,'2026-05-04 15:09:28','2026-05-04 09:39:28','2026-05-04 09:53:37');
/*!40000 ALTER TABLE `blog_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `focus_keyword` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (2,NULL,'Sauces & Condiments','sauces-condiments',NULL,'/uploads/categories/sauces.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 17:50:23'),(3,NULL,'Fresh Vegetables','fresh-vegetables',NULL,'/uploads/categories/vegetables.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 17:50:23'),(4,NULL,'Frozen & Ready Meals','frozen-ready-meals',NULL,'/uploads/categories/frozen-foods.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 17:50:23'),(5,NULL,'Snacks & Sweets','snacks-sweets',NULL,'/uploads/categories/snacks.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 17:50:23'),(6,NULL,'Drinks & Beverages','drinks-beverages',NULL,'/uploads/categories/drinks.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 17:50:23'),(7,NULL,'Spices & Seasonings','spices-seasonings',NULL,'/uploads/categories/spices.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 17:50:23'),(8,NULL,'Korean Foods','korean-foods',NULL,'/uploads/categories/korean.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 17:50:23'),(9,NULL,'Japanese Foods','japanese-foods',NULL,'/uploads/categories/japanese.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 17:50:23'),(10,NULL,'Chinese Foods','chinese-foods',NULL,'/uploads/categories/chinese.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 17:50:23'),(12,NULL,'Frozen Foods','frozen-foods-1','Frozen Foods','/uploads/categories/1777913175_6b62f792.jpeg','',0,1,0,'','','','2026-05-04 16:46:15','2026-05-04 16:46:15'),(15,NULL,'Thai Foods','thai-foods',NULL,'/uploads/categories/thai.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 17:40:47','2026-05-04 17:50:23'),(16,NULL,'Instant Noodles','instant-noodles','Ramen, udon, soba and instant noodle varieties','/uploads/categories/noodles.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 17:50:37','2026-05-04 17:50:37'),(17,NULL,'Dry Fruits & Nuts','dry-fruits-nuts','Premium dry fruits, nuts, seeds and trail mixes','/uploads/categories/dry-fruits.jpg',NULL,0,1,1,NULL,NULL,NULL,'2026-05-04 17:50:37','2026-05-04 17:50:37');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT '0.00',
  `max_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `starts_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'WELCOME10','10% off on first order','percentage',10.00,200.00,100.00,NULL,0,1,NULL,NULL,'2026-05-04 09:39:28'),(2,'FRESH50','Flat ₹50 off','fixed',50.00,300.00,NULL,NULL,0,1,NULL,NULL,'2026-05-04 09:39:28');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `is_guest` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `total_orders` int DEFAULT '0',
  `total_spent` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(30) NOT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_email` varchar(200) DEFAULT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `shipping_address` text NOT NULL,
  `billing_address` text,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(12,2) DEFAULT '0.00',
  `shipping_charge` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `coupon_code` varchar(50) DEFAULT NULL,
  `payment_method` enum('cod','online','upi') DEFAULT 'cod',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_id` varchar(255) DEFAULT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','returned') DEFAULT 'pending',
  `notes` text,
  `delivered_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(300) NOT NULL,
  `content` longtext,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `product_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`product_id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (2,2),(3,2),(8,2),(11,2),(12,3),(4,4),(5,5),(10,6),(7,8),(8,8),(6,9),(14,15);
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(300) NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(10,2) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `low_stock_threshold` int DEFAULT '5',
  `weight` decimal(8,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT 'piece',
  `brand` varchar(150) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_trending` tinyint(1) DEFAULT '0',
  `is_new` tinyint(1) DEFAULT '0',
  `views` int DEFAULT '0',
  `sales_count` int DEFAULT '0',
  `avg_rating` decimal(3,2) DEFAULT '0.00',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `focus_keyword` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_price` (`price`),
  KEY `idx_featured` (`is_featured`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Jasmine Rice 5kg','jasmine-rice-5kg','Premium Thai jasmine rice, fragrant and soft. Perfect for all Asian dishes.',NULL,12.99,10.99,NULL,NULL,NULL,80,5,NULL,'bag','Golden Elephant',1,1,1,0,1,0,0.00,'Jasmine Rice 5kg – Asian Food Cork','Buy premium jasmine rice online in Cork',NULL,'2026-05-04 09:53:37','2026-05-04 15:09:58'),(2,'Kikkoman Soy Sauce 1L','kikkoman-soy-sauce-1l','Classic Japanese naturally brewed soy sauce. Essential for cooking and dipping.',NULL,5.49,NULL,NULL,NULL,NULL,120,5,NULL,'bottle','Kikkoman',1,1,1,0,0,0,0.00,'Kikkoman Soy Sauce 1L – Asian Food Cork','Buy Kikkoman soy sauce in Cork Ireland',NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37'),(3,'Maggi Fish Sauce 700ml','maggi-fish-sauce-700ml','Authentic Thai fish sauce. Adds umami depth to any Asian dish.',NULL,3.99,3.49,NULL,NULL,NULL,90,5,NULL,'bottle','Maggi',1,1,0,0,0,0,0.00,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37'),(4,'Gyoza (Pork Dumplings) 600g','gyoza-pork-dumplings-600g','Frozen Japanese-style pan-fried pork dumplings. Ready in 10 minutes.',NULL,7.99,6.49,NULL,NULL,NULL,60,5,NULL,'pack','Ajinomoto',1,1,1,1,1,0,0.00,'Gyoza Pork Dumplings – Asian Food Cork','Buy frozen gyoza dumplings in Cork',NULL,'2026-05-04 09:53:37','2026-05-04 15:13:19'),(5,'Pocky Chocolate Sticks','pocky-chocolate-sticks','Japan\'s favourite biscuit stick with rich chocolate coating.',NULL,2.49,NULL,NULL,NULL,NULL,200,5,NULL,'box','Glico',1,0,1,0,0,0,0.00,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37'),(6,'Matcha Green Tea Powder 100g','matcha-green-tea-powder-100g','Premium ceremonial grade matcha from Japan. Perfect for lattes and baking.',NULL,9.99,8.49,NULL,NULL,NULL,50,5,NULL,'pack','Ippodo',1,1,1,1,0,0,0.00,'Matcha Green Tea Powder – Asian Food Cork','Buy authentic Japanese matcha in Cork',NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37'),(7,'Kimchi (Napa Cabbage) 500g','kimchi-napa-cabbage-500g','Authentic Korean fermented kimchi. Spicy, tangy and probiotic-rich.',NULL,6.99,NULL,NULL,NULL,NULL,40,5,NULL,'jar','CJ Foods',1,1,1,1,0,0,0.00,'Korean Kimchi 500g – Asian Food Cork','Buy authentic kimchi in Cork Ireland',NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37'),(8,'Gochujang Paste 500g','gochujang-paste-500g','Korean red pepper paste. The secret ingredient for bibimbap, bulgogi and more.',NULL,5.99,4.99,NULL,NULL,NULL,70,5,NULL,'tub','Haechandle',1,1,0,0,0,0,0.00,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37'),(9,'Udon Noodles 250g','udon-noodles-250g','Thick and chewy Japanese udon wheat noodles. Ready in 3 minutes.',NULL,2.99,NULL,NULL,NULL,NULL,150,5,NULL,'pack','Sanuki',1,0,1,0,0,0,0.00,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37'),(10,'Bubble Tea Kit (Taro)','bubble-tea-kit-taro','Make your own taro bubble tea at home! Includes powder, tapioca pearls and straws.',NULL,8.99,7.49,NULL,NULL,NULL,35,5,NULL,'kit','BubbleCo',1,1,1,1,0,0,0.00,'Taro Bubble Tea Kit – Asian Food Cork','Make bubble tea at home in Cork',NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37'),(11,'Coconut Milk 400ml','coconut-milk-400ml','Rich and creamy coconut milk. Essential for Thai curries and desserts.',NULL,2.19,NULL,NULL,NULL,NULL,200,5,NULL,'can','Chaokoh',1,0,0,0,0,0,0.00,NULL,NULL,NULL,'2026-05-04 09:53:37','2026-05-04 09:53:37'),(12,'Bok Choy (Fresh)','bok-choy-fresh','Fresh baby bok choy, locally sourced. Crisp, tender and nutritious.',NULL,3.49,2.99,NULL,NULL,NULL,30,5,NULL,'pack','Fresh Daily',1,1,1,0,1,0,0.00,'Fresh Bok Choy – Asian Food Cork','Buy fresh bok choy in Cork',NULL,'2026-05-04 09:53:37','2026-05-04 10:27:43'),(13,'Test Product','test-product','','',10.00,NULL,NULL,'',NULL,0,5,NULL,'piece','',1,0,0,0,0,0,0.00,'','','','2026-05-04 17:35:50','2026-05-04 17:35:50'),(14,'Thai Green Curry Paste','thai-green-curry-paste','Authentic Thai green curry paste - spicy, fragrant and perfect for home cooking',NULL,4.99,3.49,NULL,NULL,NULL,50,5,NULL,'jar','Mae Ploy',1,1,0,1,0,0,0.00,NULL,NULL,NULL,'2026-05-04 17:40:56','2026-05-04 17:40:56');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(150) NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text,
  `is_approved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_type` enum('text','textarea','image','json','boolean','number') DEFAULT 'text',
  `setting_group` varchar(50) DEFAULT 'general',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'site_name','Asian Foods Cork','text','general','2026-05-04 10:02:21'),(2,'site_tagline','Authentic Asian Groceries in Cork, Ireland','text','general','2026-05-04 10:02:21'),(3,'site_logo','/logo.png','image','general','2026-05-04 10:02:21'),(4,'site_favicon','','image','general','2026-05-04 09:39:28'),(5,'site_email','hello@asianfoodcork.com','text','general','2026-05-04 09:52:53'),(6,'site_phone','+353 21 000 0000','text','general','2026-05-04 09:52:53'),(7,'site_address','Cork, Ireland','textarea','general','2026-05-04 09:52:53'),(8,'footer_about','Your trusted Asian grocery store in Cork. We bring authentic Asian flavours straight to your door.','textarea','footer','2026-05-04 09:52:53'),(9,'footer_copyright','© 2026 Asian Food Cork. All rights reserved.','text','footer','2026-05-04 09:52:53'),(10,'social_facebook','','text','social','2026-05-04 09:39:28'),(11,'social_instagram','','text','social','2026-05-04 09:39:28'),(12,'social_twitter','','text','social','2026-05-04 09:39:28'),(13,'social_youtube','','text','social','2026-05-04 09:39:28'),(14,'social_whatsapp','','text','social','2026-05-04 09:39:28'),(15,'shipping_free_above','50','number','shipping','2026-05-04 09:52:53'),(16,'shipping_charge','5','number','shipping','2026-05-04 09:52:53'),(17,'tax_percentage','0','number','tax','2026-05-04 09:52:53'),(18,'currency_symbol','€','text','general','2026-05-04 09:52:53'),(19,'currency_code','INR','text','general','2026-05-04 09:39:28'),(20,'header_offer_text','🎉 Free delivery on orders above €50!','text','header','2026-05-04 09:52:53'),(21,'maintenance_mode','0','boolean','general','2026-05-04 09:39:28'),(22,'google_analytics_id','','text','seo','2026-05-04 09:39:28'),(23,'meta_title','KAR PRO Grocery - Fresh Groceries Online','text','seo','2026-05-04 09:39:28'),(24,'meta_description','Order fresh groceries, fruits, vegetables, and daily essentials online. Fast delivery and best prices at KAR PRO Grocery.','textarea','seo','2026-05-04 09:39:28'),(25,'site_description','Asian Food Cork - Your one-stop shop for authentic Asian groceries in Cork, Ireland. Order online for fast delivery.','textarea','seo','2026-05-04 09:52:53');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`customer_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-04 23:44:47
