-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: localhost    Database: ecommerce_db
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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '68fe5540-178a-11f1-a91f-c9e82e2c5421:1-197296';

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Super Admin','admin@example.com','$2y$12$PszwW0nhK/rVjxNdHw61tODp/97ZyLf4R1K7kslI3hLOWEwTDEbDC','super_admin',NULL,1,'2026-06-10 05:51:25','2026-06-08 16:06:08','2026-06-10 05:51:25');
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
  `media_type` enum('image','video') NOT NULL DEFAULT 'image',
  `video` varchar(500) DEFAULT NULL,
  `mobile_video` varchar(500) DEFAULT NULL,
  `fallback_image` varchar(255) DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_color` varchar(30) DEFAULT '#e06400',
  `position` enum('hero','secondary','sidebar') DEFAULT 'hero',
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,'Fresh Halal Meats & Premium Spices','Sourced fresh daily — 100% certified Halal. From whole chicken to lamb, spices and vegetables, delivered to your door.','',NULL,'video','/uploads/banners/videos/1781034846_c13481f7.mp4','/uploads/banners/videos/1781034846_8b0a7ce0.mp4',NULL,'/categories','Shop Now','#1A6B3A','hero',1,1,NULL,NULL,'2026-06-08 16:06:08','2026-06-09 19:54:06'),(2,'Premium Bikaneri Gift Packs','Festive namkeen assortments for family, offices and celebrations.','/assets/saggoji/hero-namkeen.png',NULL,'image',NULL,NULL,NULL,'/category/gifting','Explore Gifts','#E81D1D','hero',2,0,NULL,NULL,'2026-06-08 16:06:08','2026-06-09 05:38:49'),(7,'Premium Spices from Around the World','Authentic whole spices, masalas and seasonings sourced directly from origin farms. Cook with flavour you can taste.','',NULL,'image',NULL,NULL,NULL,'/categories','Browse Spices','#1A6B3A','hero',2,0,NULL,NULL,'2026-06-09 15:16:20','2026-06-09 18:57:34'),(8,'Farm Fresh Vegetables & Fruits','Locally sourced and imported produce delivered fresh every morning. The best of the season, at the best prices.','',NULL,'image',NULL,NULL,NULL,'/categories','Shop Produce','#1A6B3A','hero',3,0,NULL,NULL,'2026-06-09 15:16:20','2026-06-09 18:57:35');
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
INSERT INTO `blog_posts` VALUES (1,NULL,'The craft behind Bikaneri bhujia','craft-behind-bikaneri-bhujia','A closer look at the flour, spice and frying discipline behind a crisp bhujia batch.','<p>Bikaneri bhujia depends on careful dough preparation, measured spices and controlled frying. Every batch is shaped into fine strands and drained well so the final snack stays crisp without feeling heavy.</p>','/uploads/homepage-process/1780947676_51982eda.png','Admin','published',0,'The Craft Behind Bikaneri Bhujia','Learn how authentic Bikaneri bhujia is made',NULL,'2026-06-08 21:36:08','2026-06-08 16:06:08','2026-06-09 04:01:28'),(2,NULL,'How to build a festive namkeen gift box','festive-namkeen-gift-box','Pair bhujia, sev, mixes, papad and peanuts into a premium Indian snack hamper.','<p>A good namkeen gift box balances classic spice, light crunch, sweet-salty mixes and shareable packs. Combine signature bhujia with sev, moong dal, papad and a premium mix for a complete festive assortment.</p>','/uploads/banners/1780977499_43b7bd05.jpg','Admin','published',0,'Festive Namkeen Gift Box Ideas','Build a premium Indian namkeen gift box',NULL,'2026-06-08 21:36:08','2026-06-08 16:06:08','2026-06-09 04:01:28');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,NULL,'Fresh Halal Meats','halal-meats','Hand-selected chicken, mutton, beef, lamb and seafood — 100% halal certified and freshly cut daily.','/uploads/categories/1780989223_27cb93f3.png','',0,1,1,'Fresh Halal Meats','Hand-selected chicken, mutton, beef, lamb and seafood — 100% halal certified and freshly cut daily.','','2026-06-08 19:59:55','2026-06-09 15:23:12'),(2,NULL,'Fresh Vegetables','vegetables','Farm fresh seasonal vegetables sourced locally and internationally. Always fresh, always quality.','/uploads/categories/1780989243_469cd520.png','',0,1,1,'Fresh Vegetables','Farm fresh seasonal vegetables sourced locally and internationally. Always fresh, always quality.','','2026-06-08 19:59:55','2026-06-09 15:23:12'),(3,NULL,'Premium Spices','spices','Authentic whole spices, masalas, blends and seasonings from origin farms around the world.','/uploads/categories/1780989260_228ced1e.jpg','',0,1,1,'Premium Spices','Authentic whole spices, masalas, blends and seasonings from origin farms around the world.','','2026-06-08 19:59:55','2026-06-09 15:23:12'),(4,NULL,'Fresh Fruits','fruits','Seasonal and exotic fruits — imported and locally grown, delivered fresh every morning.','/uploads/categories/1780989287_5541a6c1.png','',0,1,1,'Fresh Fruits','Seasonal and exotic fruits — imported and locally grown, delivered fresh every morning.','','2026-06-08 19:59:55','2026-06-09 15:23:12'),(5,NULL,'Daily Essentials','essentials','Rice, flour, lentils, oil, dairy and everyday grocery staples for the Asian household.','/uploads/categories/1780989304_6b3315a5.jpg','',0,1,1,'Daily Essentials','Rice, flour, lentils, oil, dairy and everyday grocery staples for the Asian household.','','2026-06-08 19:59:55','2026-06-09 15:23:12'),(6,NULL,'Frozen Foods','frozen','Frozen halal meats, ready meals, seafood and vegetables.',NULL,NULL,0,1,1,'Frozen Foods','Frozen halal meats, ready meals, seafood and vegetables.',NULL,'2026-06-09 15:20:21','2026-06-09 15:23:12'),(7,NULL,'Dairy & Eggs','dairy','Fresh milk, yogurt, butter, eggs and dairy products.',NULL,NULL,0,1,1,'Dairy & Eggs','Fresh milk, yogurt, butter, eggs and dairy products.',NULL,'2026-06-09 15:20:21','2026-06-09 15:23:12'),(8,NULL,'Beverages','beverages','Hot and cold drinks, juices, teas, coffees and soft drinks.','/uploads/categories/1781041095_69482ba7.png','',0,1,1,'Beverages','Hot and cold drinks, juices, teas, coffees and soft drinks.','','2026-06-09 15:20:21','2026-06-09 21:38:15'),(9,NULL,'Rice & Grains','grains','Basmati rice, lentils, flour, semolina and whole grains.',NULL,NULL,0,1,1,'Rice & Grains','Basmati rice, lentils, flour, semolina and whole grains.',NULL,'2026-06-09 15:20:21','2026-06-09 15:23:12'),(10,NULL,'Ethnic Grocery','ethnic','Asian, South Asian and Middle Eastern grocery staples.',NULL,NULL,0,1,1,'Ethnic Grocery','Asian, South Asian and Middle Eastern grocery staples.',NULL,'2026-06-09 15:20:21','2026-06-09 15:23:12');
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
INSERT INTO `coupons` VALUES (1,'WELCOME10','10% off on first order','percentage',10.00,200.00,100.00,NULL,0,1,NULL,NULL,'2026-06-08 16:06:08'),(2,'FRESH50','Flat ₹50 off','fixed',50.00,300.00,NULL,NULL,0,1,NULL,NULL,'2026-06-08 16:06:08');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_logs`
--

DROP TABLE IF EXISTS `email_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `queue_id` int DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `email_type` varchar(50) DEFAULT NULL,
  `recipient` varchar(255) DEFAULT NULL,
  `subject` varchar(500) DEFAULT NULL,
  `status` enum('sent','failed') NOT NULL,
  `smtp_response` text,
  `error_message` text,
  `pdf_path` varchar(500) DEFAULT NULL,
  `xml_path` varchar(500) DEFAULT NULL,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sent` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_logs`
--

LOCK TABLES `email_logs` WRITE;
/*!40000 ALTER TABLE `email_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_queue`
--

DROP TABLE IF EXISTS `email_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_queue` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `email_type` varchar(50) NOT NULL DEFAULT 'order_placed',
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `body_html` longtext,
  `body_text` text,
  `attachments` json DEFAULT NULL,
  `status` enum('pending','processing','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
  `attempts` tinyint unsigned NOT NULL DEFAULT '0',
  `max_attempts` tinyint unsigned NOT NULL DEFAULT '3',
  `error_message` text,
  `scheduled_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_order` (`order_id`),
  KEY `idx_scheduled` (`status`,`scheduled_at`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_queue`
--

LOCK TABLES `email_queue` WRITE;
/*!40000 ALTER TABLE `email_queue` DISABLE KEYS */;
INSERT INTO `email_queue` VALUES (1,1,'order_placed','codex-order@example.com','Order Confirmed - KP-20260608-E519C5 | Saggoji','<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <style>\n    body{margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif}\n    .wrap{max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}\n    .header{background:linear-gradient(135deg,#0D1827 0%,#1a2f50 100%);padding:28px 32px;text-align:center}\n    .header h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}\n    .header p{color:rgba(255,255,255,.65);margin:4px 0 0;font-size:13px}\n    .accent{height:4px;background:linear-gradient(90deg,#0F766E,#2563EB,#E11D48)}\n    .body{padding:32px}\n    .order-badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;\n        border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;margin-bottom:20px}\n    h2{color:#0D1827;font-size:18px;margin:0 0 16px}\n    .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}\n    .info-row:last-child{border:none}\n    .info-label{color:#64748b;font-weight:600}\n    .info-value{color:#1e293b;text-align:right}\n    table.items{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}\n    table.items th{background:#0D1827;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:.5px}\n    table.items td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151}\n    table.items tr:nth-child(even) td{background:#f8fafc}\n    .totals{margin-top:16px;border-top:2px solid #e2e8f0;padding-top:16px}\n    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#374151}\n    .total-row.grand{font-size:16px;font-weight:700;color:#0D1827;padding-top:8px;margin-top:8px;border-top:2px solid #0D1827}\n    .btn{display:inline-block;background:#22C55E;color:#fff;padding:12px 28px;border-radius:8px;\n        text-decoration:none;font-weight:700;font-size:14px;margin:20px 0}\n    .footer-note{background:#f8fafc;padding:20px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0}\n    .footer-note a{color:#0F766E;text-decoration:none}\n    </style></head><body><div class=\"wrap\">\n    <div class=\"header\">\n        <h1>Saggoji</h1>\n        <p>Authentic Bikaneri Namkeen</p>\n    </div>\n    <div class=\"accent\"></div><div class=\"body\"><span class=\"order-badge\">✅ Order Confirmed</span><h2>Thank you, Codex Smoke!</h2><p style=\"color:#64748b;font-size:14px;margin:0 0 20px\">Your order has been received and is being prepared. We\'ll keep you updated every step of the way.</p><div style=\"background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px\"><div class=\"info-row\"><span class=\"info-label\">Order Number</span><span class=\"info-value\"><strong>KP-20260608-E519C5</strong></span></div><div class=\"info-row\"><span class=\"info-label\">Order Date</span><span class=\"info-value\">08 Jun 2026, 19:57</span></div><div class=\"info-row\"><span class=\"info-label\">Payment Method</span><span class=\"info-value\">UPI</span></div></div><h2 style=\"font-size:15px\">Order Items</h2><table class=\"items\"><thead><tr>\n        <th>PRODUCT</th><th>QTY</th><th>PRICE</th><th>TOTAL</th>\n    </tr></thead><tbody><tr>\n            <td>Bikaneri Bhujia</td>\n            <td>1</td>\n            <td>€149.00</td>\n            <td>€149.00</td>\n        </tr></tbody></table><div class=\"totals\"><div class=\"total-row\"><span>Subtotal</span><span>€149.00</span></div><div class=\"total-row\"><span>Shipping</span><span>€49.00</span></div><div class=\"total-row\"><span>Tax (VAT)</span><span>€0.00</span></div><div class=\"total-row grand\"><span>TOTAL</span><span>€198.00</span></div></div><p style=\"font-size:12px;color:#94a3b8;margin-top:24px\">📎 Your PDF invoice is attached to this email.</p></div><div class=\"footer-note\">\n        <p>Order Reference: <strong>KP-20260608-E519C5</strong></p>\n        <p>Questions? <a href=\"mailto:care@saggoji.com\">care@saggoji.com | +91 98765 43210</a></p>\n        <p><a href=\"http://localhost:8000\">http://localhost:8000</a></p>\n        <p style=\"color:#cbd5e1;margin-top:12px;font-size:11px\">Saggoji | Bikaner Road, Rajasthan</p>\n    </div></div></body></html>','Saggoji - Order Confirmation\n=====================================\nOrder Number: KP-20260608-E519C5\nDate: 08 Jun 2026\nCustomer: Codex Smoke\n\nITEMS:\n- Bikaneri Bhujia x1 = €149.00\n\nSubtotal: €149.00\nShipping: €49.00\nTOTAL: €198.00\n\nQuestions? care@saggoji.com | +91 98765 43210','[]','pending',0,3,NULL,'2026-06-08 19:57:20',NULL,'2026-06-08 19:57:20'),(2,1,'order_placed','hello@example.com','New Order: KP-20260608-E519C5 from Codex Smoke','<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <style>\n    body{margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif}\n    .wrap{max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}\n    .header{background:linear-gradient(135deg,#0D1827 0%,#1a2f50 100%);padding:28px 32px;text-align:center}\n    .header h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}\n    .header p{color:rgba(255,255,255,.65);margin:4px 0 0;font-size:13px}\n    .accent{height:4px;background:linear-gradient(90deg,#0F766E,#2563EB,#E11D48)}\n    .body{padding:32px}\n    .order-badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;\n        border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;margin-bottom:20px}\n    h2{color:#0D1827;font-size:18px;margin:0 0 16px}\n    .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}\n    .info-row:last-child{border:none}\n    .info-label{color:#64748b;font-weight:600}\n    .info-value{color:#1e293b;text-align:right}\n    table.items{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}\n    table.items th{background:#0D1827;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:.5px}\n    table.items td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151}\n    table.items tr:nth-child(even) td{background:#f8fafc}\n    .totals{margin-top:16px;border-top:2px solid #e2e8f0;padding-top:16px}\n    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#374151}\n    .total-row.grand{font-size:16px;font-weight:700;color:#0D1827;padding-top:8px;margin-top:8px;border-top:2px solid #0D1827}\n    .btn{display:inline-block;background:#22C55E;color:#fff;padding:12px 28px;border-radius:8px;\n        text-decoration:none;font-weight:700;font-size:14px;margin:20px 0}\n    .footer-note{background:#f8fafc;padding:20px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0}\n    .footer-note a{color:#0F766E;text-decoration:none}\n    </style></head><body><div class=\"wrap\">\n    <div class=\"header\">\n        <h1>Saggoji</h1>\n        <p>Authentic Bikaneri Namkeen</p>\n    </div>\n    <div class=\"accent\"></div><div class=\"body\"><span class=\"order-badge\" style=\"background:#fef3c7;color:#92400e;border-color:#fde68a\">🛒 New Order Received</span><h2>New Order: KP-20260608-E519C5</h2><div style=\"background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px\"><div class=\"info-row\"><span class=\"info-label\">Customer</span><span class=\"info-value\">Codex Smoke</span></div><div class=\"info-row\"><span class=\"info-label\">Phone</span><span class=\"info-value\"><a href=\"tel:9999999999\">9999999999</a></span></div><div class=\"info-row\"><span class=\"info-label\">Email</span><span class=\"info-value\">codex-order@example.com</span></div><div class=\"info-row\"><span class=\"info-label\">Order Number</span><span class=\"info-value\"><strong>KP-20260608-E519C5</strong></span></div><div class=\"info-row\"><span class=\"info-label\">Payment</span><span class=\"info-value\">UPI</span></div></div><p style=\"font-size:13px;color:#374151\"><strong>Delivery Address:</strong> Test address, Jaipur, 302001</p><table class=\"items\"><thead><tr>\n        <th>PRODUCT</th><th>QTY</th><th>PRICE</th><th>TOTAL</th>\n    </tr></thead><tbody><tr>\n            <td>Bikaneri Bhujia</td>\n            <td>1</td>\n            <td>€149.00</td>\n            <td>€149.00</td>\n        </tr></tbody></table><div class=\"totals\"><div class=\"total-row\"><span>Subtotal</span><span>€149.00</span></div><div class=\"total-row\"><span>Shipping</span><span>€49.00</span></div><div class=\"total-row\"><span>Tax (VAT)</span><span>€0.00</span></div><div class=\"total-row grand\"><span>TOTAL</span><span>€198.00</span></div></div><div style=\"text-align:center;margin-top:24px\"><a href=\"/admin/orders.php\" class=\"btn\" style=\"background:#0F766E\">View in Admin Panel →</a></div></div><div class=\"footer-note\">\n        <p>Order Reference: <strong>KP-20260608-E519C5</strong></p>\n        <p>Questions? <a href=\"mailto:care@saggoji.com\">care@saggoji.com | +91 98765 43210</a></p>\n        <p><a href=\"http://localhost:8000\">http://localhost:8000</a></p>\n        <p style=\"color:#cbd5e1;margin-top:12px;font-size:11px\">Saggoji | Bikaner Road, Rajasthan</p>\n    </div></div></body></html>','','[]','pending',0,3,NULL,'2026-06-08 19:57:20',NULL,'2026-06-08 19:57:20'),(5,3,'order_placed','sync1780950798@example.com','Order Confirmed - KP-20260608-8F6785 | Saggoji','<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <style>\n    body{margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif}\n    .wrap{max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}\n    .header{background:linear-gradient(135deg,#0D1827 0%,#1a2f50 100%);padding:28px 32px;text-align:center}\n    .header h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}\n    .header p{color:rgba(255,255,255,.65);margin:4px 0 0;font-size:13px}\n    .accent{height:4px;background:linear-gradient(90deg,#0F766E,#2563EB,#E11D48)}\n    .body{padding:32px}\n    .order-badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;\n        border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;margin-bottom:20px}\n    h2{color:#0D1827;font-size:18px;margin:0 0 16px}\n    .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}\n    .info-row:last-child{border:none}\n    .info-label{color:#64748b;font-weight:600}\n    .info-value{color:#1e293b;text-align:right}\n    table.items{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}\n    table.items th{background:#0D1827;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:.5px}\n    table.items td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151}\n    table.items tr:nth-child(even) td{background:#f8fafc}\n    .totals{margin-top:16px;border-top:2px solid #e2e8f0;padding-top:16px}\n    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#374151}\n    .total-row.grand{font-size:16px;font-weight:700;color:#0D1827;padding-top:8px;margin-top:8px;border-top:2px solid #0D1827}\n    .btn{display:inline-block;background:#22C55E;color:#fff;padding:12px 28px;border-radius:8px;\n        text-decoration:none;font-weight:700;font-size:14px;margin:20px 0}\n    .footer-note{background:#f8fafc;padding:20px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0}\n    .footer-note a{color:#0F766E;text-decoration:none}\n    </style></head><body><div class=\"wrap\">\n    <div class=\"header\">\n        <h1>Saggoji</h1>\n        <p>Authentic Bikaneri Namkeen</p>\n    </div>\n    <div class=\"accent\"></div><div class=\"body\"><span class=\"order-badge\">✅ Order Confirmed</span><h2>Thank you, Sync Customer!</h2><p style=\"color:#64748b;font-size:14px;margin:0 0 20px\">Your order has been received and is being prepared. We\'ll keep you updated every step of the way.</p><div style=\"background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px\"><div class=\"info-row\"><span class=\"info-label\">Order Number</span><span class=\"info-value\"><strong>KP-20260608-8F6785</strong></span></div><div class=\"info-row\"><span class=\"info-label\">Order Date</span><span class=\"info-value\">08 Jun 2026, 20:33</span></div><div class=\"info-row\"><span class=\"info-label\">Payment Method</span><span class=\"info-value\">COD</span></div></div><h2 style=\"font-size:15px\">Order Items</h2><table class=\"items\"><thead><tr>\n        <th>PRODUCT</th><th>QTY</th><th>PRICE</th><th>TOTAL</th>\n    </tr></thead><tbody><tr>\n            <td>Mota Bhujia</td>\n            <td>1</td>\n            <td>€139.00</td>\n            <td>€139.00</td>\n        </tr></tbody></table><div class=\"totals\"><div class=\"total-row\"><span>Subtotal</span><span>€139.00</span></div><div class=\"total-row\"><span>Shipping</span><span>€49.00</span></div><div class=\"total-row\"><span>Tax (VAT)</span><span>€0.00</span></div><div class=\"total-row grand\"><span>TOTAL</span><span>€188.00</span></div></div><p style=\"font-size:12px;color:#94a3b8;margin-top:24px\">📎 Your PDF invoice is attached to this email.</p></div><div class=\"footer-note\">\n        <p>Order Reference: <strong>KP-20260608-8F6785</strong></p>\n        <p>Questions? <a href=\"mailto:care@saggoji.com\">care@saggoji.com | +91 98765 43210</a></p>\n        <p><a href=\"http://localhost:8000\">http://localhost:8000</a></p>\n        <p style=\"color:#cbd5e1;margin-top:12px;font-size:11px\">Saggoji | Bikaner Road, Rajasthan</p>\n    </div></div></body></html>','Saggoji - Order Confirmation\n=====================================\nOrder Number: KP-20260608-8F6785\nDate: 08 Jun 2026\nCustomer: Sync Customer\n\nITEMS:\n- Mota Bhujia x1 = €139.00\n\nSubtotal: €139.00\nShipping: €49.00\nTOTAL: €188.00\n\nQuestions? care@saggoji.com | +91 98765 43210','[]','pending',0,3,NULL,'2026-06-08 20:33:18',NULL,'2026-06-08 20:33:18'),(6,3,'order_placed','hello@example.com','New Order: KP-20260608-8F6785 from Sync Customer','<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <style>\n    body{margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif}\n    .wrap{max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}\n    .header{background:linear-gradient(135deg,#0D1827 0%,#1a2f50 100%);padding:28px 32px;text-align:center}\n    .header h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}\n    .header p{color:rgba(255,255,255,.65);margin:4px 0 0;font-size:13px}\n    .accent{height:4px;background:linear-gradient(90deg,#0F766E,#2563EB,#E11D48)}\n    .body{padding:32px}\n    .order-badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;\n        border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;margin-bottom:20px}\n    h2{color:#0D1827;font-size:18px;margin:0 0 16px}\n    .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}\n    .info-row:last-child{border:none}\n    .info-label{color:#64748b;font-weight:600}\n    .info-value{color:#1e293b;text-align:right}\n    table.items{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}\n    table.items th{background:#0D1827;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:.5px}\n    table.items td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151}\n    table.items tr:nth-child(even) td{background:#f8fafc}\n    .totals{margin-top:16px;border-top:2px solid #e2e8f0;padding-top:16px}\n    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#374151}\n    .total-row.grand{font-size:16px;font-weight:700;color:#0D1827;padding-top:8px;margin-top:8px;border-top:2px solid #0D1827}\n    .btn{display:inline-block;background:#22C55E;color:#fff;padding:12px 28px;border-radius:8px;\n        text-decoration:none;font-weight:700;font-size:14px;margin:20px 0}\n    .footer-note{background:#f8fafc;padding:20px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0}\n    .footer-note a{color:#0F766E;text-decoration:none}\n    </style></head><body><div class=\"wrap\">\n    <div class=\"header\">\n        <h1>Saggoji</h1>\n        <p>Authentic Bikaneri Namkeen</p>\n    </div>\n    <div class=\"accent\"></div><div class=\"body\"><span class=\"order-badge\" style=\"background:#fef3c7;color:#92400e;border-color:#fde68a\">🛒 New Order Received</span><h2>New Order: KP-20260608-8F6785</h2><div style=\"background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px\"><div class=\"info-row\"><span class=\"info-label\">Customer</span><span class=\"info-value\">Sync Customer</span></div><div class=\"info-row\"><span class=\"info-label\">Phone</span><span class=\"info-value\"><a href=\"tel:8888888888\">8888888888</a></span></div><div class=\"info-row\"><span class=\"info-label\">Email</span><span class=\"info-value\">sync1780950798@example.com</span></div><div class=\"info-row\"><span class=\"info-label\">Order Number</span><span class=\"info-value\"><strong>KP-20260608-8F6785</strong></span></div><div class=\"info-row\"><span class=\"info-label\">Payment</span><span class=\"info-value\">COD</span></div></div><p style=\"font-size:13px;color:#374151\"><strong>Delivery Address:</strong> Test Address, Jaipur, 302001, India</p><table class=\"items\"><thead><tr>\n        <th>PRODUCT</th><th>QTY</th><th>PRICE</th><th>TOTAL</th>\n    </tr></thead><tbody><tr>\n            <td>Mota Bhujia</td>\n            <td>1</td>\n            <td>€139.00</td>\n            <td>€139.00</td>\n        </tr></tbody></table><div class=\"totals\"><div class=\"total-row\"><span>Subtotal</span><span>€139.00</span></div><div class=\"total-row\"><span>Shipping</span><span>€49.00</span></div><div class=\"total-row\"><span>Tax (VAT)</span><span>€0.00</span></div><div class=\"total-row grand\"><span>TOTAL</span><span>€188.00</span></div></div><div style=\"text-align:center;margin-top:24px\"><a href=\"/admin/orders.php\" class=\"btn\" style=\"background:#0F766E\">View in Admin Panel →</a></div></div><div class=\"footer-note\">\n        <p>Order Reference: <strong>KP-20260608-8F6785</strong></p>\n        <p>Questions? <a href=\"mailto:care@saggoji.com\">care@saggoji.com | +91 98765 43210</a></p>\n        <p><a href=\"http://localhost:8000\">http://localhost:8000</a></p>\n        <p style=\"color:#cbd5e1;margin-top:12px;font-size:11px\">Saggoji | Bikaner Road, Rajasthan</p>\n    </div></div></body></html>','','[]','pending',0,3,NULL,'2026-06-08 20:33:18',NULL,'2026-06-08 20:33:18'),(7,4,'order_placed','sync1780950907@example.com','Order Confirmed - KP-20260608-D2D856 | Saggoji','<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <style>\n    body{margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif}\n    .wrap{max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}\n    .header{background:linear-gradient(135deg,#0D1827 0%,#1a2f50 100%);padding:28px 32px;text-align:center}\n    .header h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}\n    .header p{color:rgba(255,255,255,.65);margin:4px 0 0;font-size:13px}\n    .accent{height:4px;background:linear-gradient(90deg,#0F766E,#2563EB,#E11D48)}\n    .body{padding:32px}\n    .order-badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;\n        border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;margin-bottom:20px}\n    h2{color:#0D1827;font-size:18px;margin:0 0 16px}\n    .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}\n    .info-row:last-child{border:none}\n    .info-label{color:#64748b;font-weight:600}\n    .info-value{color:#1e293b;text-align:right}\n    table.items{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}\n    table.items th{background:#0D1827;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:.5px}\n    table.items td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151}\n    table.items tr:nth-child(even) td{background:#f8fafc}\n    .totals{margin-top:16px;border-top:2px solid #e2e8f0;padding-top:16px}\n    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#374151}\n    .total-row.grand{font-size:16px;font-weight:700;color:#0D1827;padding-top:8px;margin-top:8px;border-top:2px solid #0D1827}\n    .btn{display:inline-block;background:#22C55E;color:#fff;padding:12px 28px;border-radius:8px;\n        text-decoration:none;font-weight:700;font-size:14px;margin:20px 0}\n    .footer-note{background:#f8fafc;padding:20px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0}\n    .footer-note a{color:#0F766E;text-decoration:none}\n    </style></head><body><div class=\"wrap\">\n    <div class=\"header\">\n        <h1>Saggoji</h1>\n        <p>Authentic Bikaneri Namkeen</p>\n    </div>\n    <div class=\"accent\"></div><div class=\"body\"><span class=\"order-badge\">✅ Order Confirmed</span><h2>Thank you, Sync Customer!</h2><p style=\"color:#64748b;font-size:14px;margin:0 0 20px\">Your order has been received and is being prepared. We\'ll keep you updated every step of the way.</p><div style=\"background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px\"><div class=\"info-row\"><span class=\"info-label\">Order Number</span><span class=\"info-value\"><strong>KP-20260608-D2D856</strong></span></div><div class=\"info-row\"><span class=\"info-label\">Order Date</span><span class=\"info-value\">08 Jun 2026, 20:35</span></div><div class=\"info-row\"><span class=\"info-label\">Payment Method</span><span class=\"info-value\">COD</span></div></div><h2 style=\"font-size:15px\">Order Items</h2><table class=\"items\"><thead><tr>\n        <th>PRODUCT</th><th>QTY</th><th>PRICE</th><th>TOTAL</th>\n    </tr></thead><tbody><tr>\n            <td>Mota Bhujia</td>\n            <td>1</td>\n            <td>€139.00</td>\n            <td>€139.00</td>\n        </tr></tbody></table><div class=\"totals\"><div class=\"total-row\"><span>Subtotal</span><span>€139.00</span></div><div class=\"total-row\"><span>Shipping</span><span>€49.00</span></div><div class=\"total-row\"><span>Tax (VAT)</span><span>€0.00</span></div><div class=\"total-row grand\"><span>TOTAL</span><span>€188.00</span></div></div><p style=\"font-size:12px;color:#94a3b8;margin-top:24px\">📎 Your PDF invoice is attached to this email.</p></div><div class=\"footer-note\">\n        <p>Order Reference: <strong>KP-20260608-D2D856</strong></p>\n        <p>Questions? <a href=\"mailto:care@saggoji.com\">care@saggoji.com | +91 98765 43210</a></p>\n        <p><a href=\"http://localhost:8000\">http://localhost:8000</a></p>\n        <p style=\"color:#cbd5e1;margin-top:12px;font-size:11px\">Saggoji | Bikaner Road, Rajasthan</p>\n    </div></div></body></html>','Saggoji - Order Confirmation\n=====================================\nOrder Number: KP-20260608-D2D856\nDate: 08 Jun 2026\nCustomer: Sync Customer\n\nITEMS:\n- Mota Bhujia x1 = €139.00\n\nSubtotal: €139.00\nShipping: €49.00\nTOTAL: €188.00\n\nQuestions? care@saggoji.com | +91 98765 43210','[]','pending',0,3,NULL,'2026-06-08 20:35:08',NULL,'2026-06-08 20:35:08'),(8,4,'order_placed','hello@example.com','New Order: KP-20260608-D2D856 from Sync Customer','<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <style>\n    body{margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif}\n    .wrap{max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}\n    .header{background:linear-gradient(135deg,#0D1827 0%,#1a2f50 100%);padding:28px 32px;text-align:center}\n    .header h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}\n    .header p{color:rgba(255,255,255,.65);margin:4px 0 0;font-size:13px}\n    .accent{height:4px;background:linear-gradient(90deg,#0F766E,#2563EB,#E11D48)}\n    .body{padding:32px}\n    .order-badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;\n        border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;margin-bottom:20px}\n    h2{color:#0D1827;font-size:18px;margin:0 0 16px}\n    .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}\n    .info-row:last-child{border:none}\n    .info-label{color:#64748b;font-weight:600}\n    .info-value{color:#1e293b;text-align:right}\n    table.items{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}\n    table.items th{background:#0D1827;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:.5px}\n    table.items td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151}\n    table.items tr:nth-child(even) td{background:#f8fafc}\n    .totals{margin-top:16px;border-top:2px solid #e2e8f0;padding-top:16px}\n    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#374151}\n    .total-row.grand{font-size:16px;font-weight:700;color:#0D1827;padding-top:8px;margin-top:8px;border-top:2px solid #0D1827}\n    .btn{display:inline-block;background:#22C55E;color:#fff;padding:12px 28px;border-radius:8px;\n        text-decoration:none;font-weight:700;font-size:14px;margin:20px 0}\n    .footer-note{background:#f8fafc;padding:20px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0}\n    .footer-note a{color:#0F766E;text-decoration:none}\n    </style></head><body><div class=\"wrap\">\n    <div class=\"header\">\n        <h1>Saggoji</h1>\n        <p>Authentic Bikaneri Namkeen</p>\n    </div>\n    <div class=\"accent\"></div><div class=\"body\"><span class=\"order-badge\" style=\"background:#fef3c7;color:#92400e;border-color:#fde68a\">🛒 New Order Received</span><h2>New Order: KP-20260608-D2D856</h2><div style=\"background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px\"><div class=\"info-row\"><span class=\"info-label\">Customer</span><span class=\"info-value\">Sync Customer</span></div><div class=\"info-row\"><span class=\"info-label\">Phone</span><span class=\"info-value\"><a href=\"tel:8888888888\">8888888888</a></span></div><div class=\"info-row\"><span class=\"info-label\">Email</span><span class=\"info-value\">sync1780950907@example.com</span></div><div class=\"info-row\"><span class=\"info-label\">Order Number</span><span class=\"info-value\"><strong>KP-20260608-D2D856</strong></span></div><div class=\"info-row\"><span class=\"info-label\">Payment</span><span class=\"info-value\">COD</span></div></div><p style=\"font-size:13px;color:#374151\"><strong>Delivery Address:</strong> Test Address, Jaipur, 302001, India</p><table class=\"items\"><thead><tr>\n        <th>PRODUCT</th><th>QTY</th><th>PRICE</th><th>TOTAL</th>\n    </tr></thead><tbody><tr>\n            <td>Mota Bhujia</td>\n            <td>1</td>\n            <td>€139.00</td>\n            <td>€139.00</td>\n        </tr></tbody></table><div class=\"totals\"><div class=\"total-row\"><span>Subtotal</span><span>€139.00</span></div><div class=\"total-row\"><span>Shipping</span><span>€49.00</span></div><div class=\"total-row\"><span>Tax (VAT)</span><span>€0.00</span></div><div class=\"total-row grand\"><span>TOTAL</span><span>€188.00</span></div></div><div style=\"text-align:center;margin-top:24px\"><a href=\"/admin/orders.php\" class=\"btn\" style=\"background:#0F766E\">View in Admin Panel →</a></div></div><div class=\"footer-note\">\n        <p>Order Reference: <strong>KP-20260608-D2D856</strong></p>\n        <p>Questions? <a href=\"mailto:care@saggoji.com\">care@saggoji.com | +91 98765 43210</a></p>\n        <p><a href=\"http://localhost:8000\">http://localhost:8000</a></p>\n        <p style=\"color:#cbd5e1;margin-top:12px;font-size:11px\">Saggoji | Bikaner Road, Rajasthan</p>\n    </div></div></body></html>','','[]','pending',0,3,NULL,'2026-06-08 20:35:08',NULL,'2026-06-08 20:35:08'),(9,5,'order_placed','hello@example.com','New Order: KP-20260609-83FBEA from Saggoji Customer','<!DOCTYPE html><html><head><meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <style>\n    body{margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif}\n    .wrap{max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}\n    .header{background:linear-gradient(135deg,#0D1827 0%,#1a2f50 100%);padding:28px 32px;text-align:center}\n    .header h1{color:#fff;margin:0;font-size:22px;letter-spacing:.5px}\n    .header p{color:rgba(255,255,255,.65);margin:4px 0 0;font-size:13px}\n    .accent{height:4px;background:linear-gradient(90deg,#0F766E,#2563EB,#E11D48)}\n    .body{padding:32px}\n    .order-badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;\n        border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;margin-bottom:20px}\n    h2{color:#0D1827;font-size:18px;margin:0 0 16px}\n    .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}\n    .info-row:last-child{border:none}\n    .info-label{color:#64748b;font-weight:600}\n    .info-value{color:#1e293b;text-align:right}\n    table.items{width:100%;border-collapse:collapse;margin:20px 0;font-size:13px}\n    table.items th{background:#0D1827;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:.5px}\n    table.items td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#374151}\n    table.items tr:nth-child(even) td{background:#f8fafc}\n    .totals{margin-top:16px;border-top:2px solid #e2e8f0;padding-top:16px}\n    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#374151}\n    .total-row.grand{font-size:16px;font-weight:700;color:#0D1827;padding-top:8px;margin-top:8px;border-top:2px solid #0D1827}\n    .btn{display:inline-block;background:#22C55E;color:#fff;padding:12px 28px;border-radius:8px;\n        text-decoration:none;font-weight:700;font-size:14px;margin:20px 0}\n    .footer-note{background:#f8fafc;padding:20px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0}\n    .footer-note a{color:#0F766E;text-decoration:none}\n    </style></head><body><div class=\"wrap\">\n    <div class=\"header\">\n        <h1>Saggoji</h1>\n        <p>Authentic Bikaneri Namkeen</p>\n    </div>\n    <div class=\"accent\"></div><div class=\"body\"><span class=\"order-badge\" style=\"background:#fef3c7;color:#92400e;border-color:#fde68a\">🛒 New Order Received</span><h2>New Order: KP-20260609-83FBEA</h2><div style=\"background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px\"><div class=\"info-row\"><span class=\"info-label\">Customer</span><span class=\"info-value\">Saggoji Customer</span></div><div class=\"info-row\"><span class=\"info-label\">Phone</span><span class=\"info-value\"><a href=\"tel:+91 98765 43210\">+91 98765 43210</a></span></div><div class=\"info-row\"><span class=\"info-label\">Email</span><span class=\"info-value\"></span></div><div class=\"info-row\"><span class=\"info-label\">Order Number</span><span class=\"info-value\"><strong>KP-20260609-83FBEA</strong></span></div><div class=\"info-row\"><span class=\"info-label\">Payment</span><span class=\"info-value\">UPI</span></div></div><p style=\"font-size:13px;color:#374151\"><strong>Delivery Address:</strong> House no. 24, Civil Lines, Jaipur, 302001, India</p><table class=\"items\"><thead><tr>\n        <th>PRODUCT</th><th>QTY</th><th>PRICE</th><th>TOTAL</th>\n    </tr></thead><tbody><tr>\n            <td>Ratlami Sev 350g</td>\n            <td>1</td>\n            <td>€129.00</td>\n            <td>€129.00</td>\n        </tr><tr>\n            <td>Mota Bhujia</td>\n            <td>2</td>\n            <td>€139.00</td>\n            <td>€278.00</td>\n        </tr><tr>\n            <td>Bikaneri Bhujia</td>\n            <td>1</td>\n            <td>€149.00</td>\n            <td>€149.00</td>\n        </tr></tbody></table><div class=\"totals\"><div class=\"total-row\"><span>Subtotal</span><span>€556.00</span></div><div class=\"total-row\"><span>Shipping</span><span>€49.00</span></div><div class=\"total-row\"><span>Tax (VAT)</span><span>€0.00</span></div><div class=\"total-row grand\"><span>TOTAL</span><span>€605.00</span></div></div><div style=\"text-align:center;margin-top:24px\"><a href=\"/admin/orders.php\" class=\"btn\" style=\"background:#0F766E\">View in Admin Panel →</a></div></div><div class=\"footer-note\">\n        <p>Order Reference: <strong>KP-20260609-83FBEA</strong></p>\n        <p>Questions? <a href=\"mailto:care@saggoji.com\">care@saggoji.com | +91 98765 43210</a></p>\n        <p><a href=\"http://localhost:8000\">http://localhost:8000</a></p>\n        <p style=\"color:#cbd5e1;margin-top:12px;font-size:11px\">Saggoji | Bikaner Road, Rajasthan</p>\n    </div></div></body></html>','','[]','pending',0,3,NULL,'2026-06-09 07:22:08',NULL,'2026-06-09 07:22:08');
/*!40000 ALTER TABLE `email_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hero_products`
--

DROP TABLE IF EXISTS `hero_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hero_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `badge` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_featured` tinyint DEFAULT '0',
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_products`
--

LOCK TABLES `hero_products` WRITE;
/*!40000 ALTER TABLE `hero_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `hero_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `order_number` varchar(50) DEFAULT NULL,
  `pdf_path` varchar(500) DEFAULT NULL,
  `xml_path` varchar(500) DEFAULT NULL,
  `generated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (5,5,NULL,'Ratlami Sev 350g','',129.00,1,129.00),(6,5,NULL,'Mota Bhujia','',139.00,2,278.00),(7,5,1,'Bikaneri Bhujia',NULL,149.00,1,149.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (5,'KP-20260609-83FBEA',NULL,'Saggoji Customer','','+91 98765 43210','{\"address_line1\":\"House no. 24, Civil Lines\",\"city\":\"Jaipur\",\"pincode\":\"302001\",\"country\":\"India\"}','{\"address_line1\":\"House no. 24, Civil Lines\",\"city\":\"Jaipur\",\"pincode\":\"302001\",\"country\":\"India\"}',556.00,0.00,49.00,0.00,605.00,NULL,'upi','pending',NULL,'pending','',NULL,'2026-06-09 07:22:08','2026-06-09 07:22:08');
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (1,'Privacy Policy','privacy-policy','<h2>Privacy Policy</h2><p>We value your privacy. This policy explains how we collect, use, and protect your personal data.</p><p>We do not sell or share your information with third parties without your consent.</p>','Privacy Policy',NULL,1,'2026-06-10 05:51:31','2026-06-10 05:51:31'),(2,'Terms & Conditions','terms-conditions','<h2>Terms &amp; Conditions</h2><p>By using our website and services, you agree to these terms and conditions.</p><p>We reserve the right to update these terms at any time.</p>','Terms & Conditions',NULL,1,'2026-06-10 05:51:31','2026-06-10 05:51:31'),(3,'Returns Policy','returns-policy','<h2>Returns Policy</h2><p>We accept returns within 7 days of delivery for non-perishable items.</p><p>Fresh products cannot be returned. Please contact us if you have any issues.</p>','Returns Policy',NULL,1,'2026-06-10 05:51:31','2026-06-10 05:51:31'),(4,'Delivery Info','delivery-info','<h2>Delivery Information</h2><p>We offer free delivery on orders over €50. Standard delivery is €5.</p><p>Same-day delivery is available for orders placed before 12 noon.</p>','Delivery Info',NULL,1,'2026-06-10 05:51:31','2026-06-10 05:51:31'),(5,'FAQ','faq','<h2>Frequently Asked Questions</h2><h3>How do I track my order?</h3><p>You can track your order using the order number sent in your confirmation email.</p><h3>What payment methods do you accept?</h3><p>We accept all major credit/debit cards and PayPal.</p>','FAQ',NULL,1,'2026-06-10 05:51:31','2026-06-10 05:51:31');
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
INSERT INTO `product_categories` VALUES (1,1),(2,1),(3,2),(5,2),(6,2),(4,3),(7,4),(8,5);
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
-- Table structure for table `product_variations`
--

DROP TABLE IF EXISTS `product_variations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'e.g. 500g, Red, Large',
  `sku` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `image_path` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `product_variations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variations`
--

LOCK TABLES `product_variations` WRITE;
/*!40000 ALTER TABLE `product_variations` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variations` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Whole Chicken (1kg)','whole-chicken-1kg','Crisp, peppery and proudly Bikaneri, made with moth dal flour and heritage spice.','Fresh whole chicken, halal certified and hand-slaughtered. Ideal for curries, roasts and grills.',6.99,5.99,NULL,'SGG-BHUJIA-400',NULL,119,10,400.00,'1 kg','Saggoji',1,1,1,0,2,85,0.00,'Whole Chicken (1kg)','Fresh whole chicken, halal certified and hand-slaughtered. Ideal for curries, roasts and grills.',NULL,'2026-06-08 19:59:55','2026-06-09 15:23:12'),(2,'Lamb Leg Pieces (500g)','lamb-leg-pieces-500g','Thicker, fuller bhujia with a satisfying crunch and lingering spice.','Tender boneless lamb leg pieces, halal certified. Perfect for biryani and slow-cooked curries.',9.99,8.49,NULL,'SGG-MOTA-400',NULL,95,10,400.00,'500 g','Saggoji',1,1,1,0,4,66,0.00,'Lamb Leg Pieces (500g)','Tender boneless lamb leg pieces, halal certified. Perfect for biryani and slow-cooked curries.',NULL,'2026-06-08 19:59:55','2026-06-10 05:43:28'),(3,'Kashmiri Red Chilli Powder (200g)','kashmiri-chilli-powder-200g','Bold clove and pepper aroma with a sharp, addictive crunch.','Premium Kashmiri red chilli powder — vibrant colour, mild heat, rich flavour.',3.49,NULL,NULL,'SGG-RATLAMI-350',NULL,80,10,350.00,'200 g','Saggoji',1,1,1,0,0,52,0.00,'Kashmiri Red Chilli Powder (200g)','Premium Kashmiri red chilli powder — vibrant colour, mild heat, rich flavour.',NULL,'2026-06-08 19:59:55','2026-06-09 15:23:12'),(4,'Basmati Rice (5kg)','basmati-rice-5kg','Sweet, tangy and crisp with sev, boondi, lentils and peanuts.','Extra long grain aged basmati rice. Fluffy, fragrant and perfect for pilau and biryani.',11.99,9.99,NULL,'SGG-KHATTA-350',NULL,110,10,350.00,'5 kg','Saggoji',1,1,1,0,0,74,0.00,'Basmati Rice (5kg)','Extra long grain aged basmati rice. Fluffy, fragrant and perfect for pilau and biryani.',NULL,'2026-06-08 19:59:55','2026-06-09 15:23:12'),(5,'Fresh Coriander Bunch','fresh-coriander-bunch','Golden salted moong dal, crisped just enough for a clean bite.','Locally sourced fresh green coriander. Ideal as garnish or added to curries and chutneys.',0.99,NULL,NULL,'SGG-MOONG-250',NULL,130,10,250.00,'1 bunch','Saggoji',1,0,1,1,1,44,0.00,'Fresh Coriander Bunch','Locally sourced fresh green coriander. Ideal as garnish or added to curries and chutneys.',NULL,'2026-06-08 19:59:55','2026-06-10 05:43:26'),(6,'Cumin Seeds (100g)','cumin-seeds-100g','Roasted peanuts coated with a crisp masala shell.','Whole cumin seeds — earthy, warm and aromatic. Roast and grind for maximum flavour.',1.29,NULL,NULL,'SGG-PEANUT-300',NULL,100,10,300.00,'100 g','Saggoji',1,0,1,1,1,49,0.00,'Cumin Seeds (100g)','Whole cumin seeds — earthy, warm and aromatic. Roast and grind for maximum flavour.',NULL,'2026-06-08 19:59:55','2026-06-10 05:43:23'),(7,'Chicken Breast Fillets (500g)','chicken-breast-fillets-500g','Traditional papad with warm desert spice and a crisp finish.','Skinless boneless chicken breast fillets, halal certified. Great for healthy meals and curries.',4.99,3.99,NULL,'SGG-PAPAD-400',NULL,70,10,400.00,'500 g','Saggoji',1,0,0,1,1,31,0.00,'Chicken Breast Fillets (500g)','Skinless boneless chicken breast fillets, halal certified. Great for healthy meals and curries.',NULL,'2026-06-08 19:59:55','2026-06-09 19:52:00'),(8,'Garam Masala Blend (150g)','garam-masala-blend-150g','A premium assortment of Saggoji favourites in a keepsake box.','Traditional garam masala blend with whole spices ground fresh. Rich, warming and aromatic.',2.99,NULL,NULL,'SGG-GIFT-6',NULL,45,5,6.00,'150 g','Saggoji',1,0,0,1,0,28,0.00,'Garam Masala Blend (150g)','Traditional garam masala blend with whole spices ground fresh. Rich, warming and aromatic.',NULL,'2026-06-08 19:59:55','2026-06-09 15:23:12');
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
) ENGINE=InnoDB AUTO_INCREMENT=6788 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'site_name','Asian Spices & Halal Meats','text','general','2026-06-09 15:15:39'),(2,'site_tagline','Fresh Halal Meats, Premium Spices & Ethnic Groceries','text','general','2026-06-09 15:15:39'),(3,'site_logo','/uploads/branding/1781036080_92eab141.png','image','general','2026-06-09 20:14:40'),(4,'site_favicon','/uploads/branding/1781036080_9b204277.png','image','general','2026-06-09 20:14:40'),(5,'site_email','hello@asianspiceshalal.com','text','general','2026-06-09 15:15:39'),(6,'site_phone','+353 1 234 5678','text','general','2026-06-09 15:15:39'),(7,'site_address','12 Halal Street, Dublin, Ireland','textarea','general','2026-06-09 15:15:39'),(8,'footer_about','Your one-stop shop for fresh halal meats, premium spices, fresh vegetables and daily essentials. Fast delivery, best prices guaranteed.','textarea','footer','2026-06-09 15:15:39'),(9,'footer_copyright','© 2026 Asian Spices & Halal Meats. All rights reserved.','text','footer','2026-06-09 15:15:39'),(10,'social_facebook','','text','social','2026-06-08 16:06:08'),(11,'social_instagram','','text','social','2026-06-08 16:06:08'),(12,'social_twitter','','text','social','2026-06-08 16:06:08'),(13,'social_youtube','','text','social','2026-06-08 16:06:08'),(14,'social_whatsapp','','text','social','2026-06-08 16:06:08'),(15,'shipping_free_above','50','number','shipping','2026-06-09 15:15:39'),(16,'shipping_charge','3.99','number','shipping','2026-06-09 15:15:39'),(17,'tax_percentage','0','number','tax','2026-06-08 16:06:08'),(18,'currency_symbol','€','text','general','2026-06-09 15:15:39'),(19,'currency_code','EUR','text','general','2026-06-09 15:15:39'),(20,'header_offer_text','🚚 Free delivery on orders over €50 — 100% Halal Certified','text','header','2026-06-09 15:15:39'),(21,'maintenance_mode','0','boolean','general','2026-06-08 16:06:08'),(22,'google_analytics_id','','text','seo','2026-06-08 16:06:08'),(23,'meta_title','Asian Spices & Halal Meats — Fresh Halal Groceries Online','text','seo','2026-06-09 15:15:39'),(24,'meta_description','Shop fresh halal meats, premium spices, vegetables and daily essentials. Fast delivery to your door. 100% halal certified.','textarea','seo','2026-06-09 15:15:39'),(25,'site_description','Shop fresh halal meats, premium spices, fresh vegetables and daily essentials online. Fast delivery, best prices guaranteed.','textarea','seo','2026-06-09 15:15:39'),(26,'site_url','','text','general','2026-06-08 16:06:08'),(27,'admin_url','/admin/orders.php','text','general','2026-06-08 16:06:08'),(28,'business_city','Dublin','text','contact','2026-06-09 15:15:39'),(29,'business_region','Leinster','text','contact','2026-06-09 15:15:39'),(30,'business_country','Ireland','text','contact','2026-06-09 15:15:39'),(31,'contact_email','hello@asianspiceshalal.com','text','contact','2026-06-09 15:15:39'),(32,'contact_address','12 Halal Street, Dublin, Ireland','text','contact','2026-06-09 15:15:39'),(33,'contact_hours','Mon–Sat: 8am–8pm | Sun: 10am–6pm','textarea','contact','2026-06-09 15:15:39'),(34,'contact_map_embed','','textarea','contact','2026-06-08 16:06:08'),(35,'newsletter_desc','Get weekly deals, new arrivals and halal recipes straight to your inbox.','textarea','footer','2026-06-09 15:15:39'),(36,'payment_online_url','','text','payments','2026-06-08 16:06:08'),(37,'delivery_free_above','50','number','delivery','2026-06-08 16:06:08'),(38,'delivery_free_enabled','1','boolean','delivery','2026-06-08 16:06:08'),(39,'delivery_local_fee','2.99','number','delivery','2026-06-09 15:15:39'),(40,'delivery_standard_fee','3.99','number','delivery','2026-06-09 15:15:39'),(41,'delivery_small_order_min','25','number','delivery','2026-06-08 16:06:08'),(42,'delivery_small_order_fee','1.50','number','delivery','2026-06-08 16:06:08'),(43,'delivery_small_order_enabled','1','boolean','delivery','2026-06-08 16:06:08'),(44,'delivery_local_zone_label','Local Dublin Delivery','text','delivery','2026-06-09 15:15:39'),(45,'delivery_standard_zone_label','Standard Delivery','text','delivery','2026-06-09 15:15:39'),(46,'delivery_local_keywords','','text','delivery','2026-06-08 16:06:08'),(47,'delivery_local_postcode_prefixes','','text','delivery','2026-06-08 16:06:08'),(48,'meta_keywords','halal meat, asian spices, fresh vegetables, online grocery, halal grocery, spices online, fresh groceries, irish halal','text','seo','2026-06-09 15:15:39'),(49,'smtp_host','','text','email','2026-06-08 16:06:08'),(50,'smtp_port','587','number','email','2026-06-08 16:06:08'),(51,'smtp_encryption','tls','text','email','2026-06-08 16:06:08'),(52,'smtp_username','','text','email','2026-06-08 16:06:08'),(53,'smtp_password','','text','email','2026-06-08 16:06:08'),(54,'smtp_from_email','hello@example.com','text','email','2026-06-08 16:06:08'),(55,'smtp_from_name','Asian Spices & Halal Meats','text','email','2026-06-09 15:15:39'),(56,'admin_email','hello@asianspiceshalal.com','text','email','2026-06-09 15:15:39'),(57,'email_enabled','1','boolean','email','2026-06-08 16:06:08'),(58,'whatsapp_enabled','0','boolean','email','2026-06-08 16:06:08'),(59,'whatsapp_number','','text','email','2026-06-08 16:06:08'),(60,'whatsapp_api_key','','text','email','2026-06-08 16:06:08'),(145,'banner_schema_v2','1','text','system','2026-06-08 16:08:34'),(895,'process_section_eyebrow','Handmade Bhujia Process','text','content','2026-06-08 19:38:28'),(896,'process_section_title','From soft dough to crisp Bikaneri strands.','text','content','2026-06-08 19:38:28'),(897,'process_section_intro','A small-batch, hand-guided process keeps bhujia delicate, even, and full of the familiar Bikaneri crunch.','textarea','content','2026-06-08 19:38:28'),(898,'process_step_1_title','Kneading Dough Hygienically','text','content','2026-06-08 19:38:28'),(899,'process_step_1_copy','Moth dal flour, gram flour and spices are kneaded into a smooth dough so every batch starts even and clean.','textarea','content','2026-06-08 19:38:28'),(900,'process_step_1_image','/uploads/homepage-process/1780947676_d90db9eb.png','image','content','2026-06-08 19:41:16'),(901,'process_step_1_alt','Vector illustration of a worker kneading bhujia dough','text','content','2026-06-08 19:38:28'),(902,'process_step_2_title','Shaping Through Jharra','text','content','2026-06-08 19:38:28'),(903,'process_step_2_copy','The dough is pressed through a traditional jharra to form fine cylindrical bhujia strands.','textarea','content','2026-06-08 19:38:28'),(904,'process_step_2_image','/uploads/homepage-process/1780947676_51982eda.png','image','content','2026-06-08 19:41:16'),(905,'process_step_2_alt','Vector illustration of a worker shaping bhujia with jharra','text','content','2026-06-08 19:38:28'),(906,'process_step_3_title','Deep Frying In Cottonseed Oil','text','content','2026-06-08 19:38:28'),(907,'process_step_3_copy','The shaped strands are fried at controlled heat for a dry, delicate crunch without heaviness.','textarea','content','2026-06-08 19:38:28'),(908,'process_step_3_image','/uploads/homepage-process/1780947717_2bdf2b37.png','image','content','2026-06-08 19:41:57'),(909,'process_step_3_alt','Vector illustration of a worker deep frying bhujia','text','content','2026-06-08 19:38:28'),(910,'process_step_4_title','Draining The Bhujia','text','content','2026-06-08 19:38:28'),(911,'process_step_4_copy','Fresh bhujia is lifted and drained carefully so the final snack stays crisp, light and never oily.','textarea','content','2026-06-08 19:38:28'),(912,'process_step_4_image','/uploads/homepage-process/1780947717_b5474dc6.png','image','content','2026-06-08 19:41:57'),(913,'process_step_4_alt','Vector illustration of a worker draining fried bhujia','text','content','2026-06-08 19:38:28'),(2547,'newsletter_title','Fresh Updates','text','footer','2026-06-08 20:27:50'),(3150,'instagram_eyebrow','Instagram Gallery','text','content','2026-06-09 04:44:45'),(3151,'instagram_handle','@saggoji','text','content','2026-06-09 04:44:45'),(3152,'instagram_copy','Festive boxes, chai trays, kitchen jars and real snack moments.','textarea','content','2026-06-09 04:44:45'),(3153,'instagram_tile_1_title','Chai Tray','text','content','2026-06-09 04:44:45'),(3154,'instagram_tile_1_image','','image','content','2026-06-09 04:44:45'),(3155,'instagram_tile_1_link','','text','content','2026-06-09 04:44:45'),(3156,'instagram_tile_2_title','Gift Box','text','content','2026-06-09 04:44:45'),(3157,'instagram_tile_2_image','','image','content','2026-06-09 04:44:45'),(3158,'instagram_tile_2_link','','text','content','2026-06-09 04:44:45'),(3159,'instagram_tile_3_title','Bhujia Jar','text','content','2026-06-09 04:44:45'),(3160,'instagram_tile_3_image','','image','content','2026-06-09 04:44:45'),(3161,'instagram_tile_3_link','','text','content','2026-06-09 04:44:45'),(3162,'instagram_tile_4_title','Papad Roast','text','content','2026-06-09 04:44:45'),(3163,'instagram_tile_4_image','','image','content','2026-06-09 04:44:45'),(3164,'instagram_tile_4_link','','text','content','2026-06-09 04:44:45'),(5037,'hero_eyebrow','Proudly halal','text','homepage','2026-06-09 20:07:38'),(5038,'hero_media_badge','Premium Grocery Selection','text','homepage','2026-06-09 20:07:38'),(5039,'hero_media_caption_title','Fresh Picks','text','homepage','2026-06-09 20:07:38'),(5040,'hero_media_caption_meta','Curated daily','text','homepage','2026-06-09 20:07:38'),(5041,'trust_item_1_text','100% Halal Certified','text','homepage','2026-06-09 20:07:38'),(5042,'trust_item_2_text','Free Delivery Over €50','text','homepage','2026-06-09 20:07:38'),(5043,'trust_item_3_text','Freshness Guaranteed','text','homepage','2026-06-09 20:07:38'),(5044,'trust_item_4_text','Same-Day Dispatch','text','homepage','2026-06-09 20:07:38'),(5045,'home_categories_label','Browse','text','homepage','2026-06-09 20:07:38'),(5046,'home_categories_title','Shop by Category','text','homepage','2026-06-09 20:07:38'),(5047,'home_categories_link_text','All Categories','text','homepage','2026-06-09 20:07:38'),(5048,'home_featured_label','Bestsellers','text','homepage','2026-06-09 20:07:38'),(5049,'home_featured_title','Featured Products','text','homepage','2026-06-09 20:07:38'),(5050,'home_featured_link_text','View All','text','homepage','2026-06-09 20:07:38'),(5051,'home_new_label','Just In','text','homepage','2026-06-09 20:07:38'),(5052,'home_new_title','New Arrivals','text','homepage','2026-06-09 20:07:38'),(5053,'home_new_link_text','View All','text','homepage','2026-06-09 20:07:38'),(5054,'promo_1_label','Fresh Daily','text','homepage','2026-06-09 20:07:38'),(5055,'promo_1_title','Premium Halal Meats & Poultry','text','homepage','2026-06-09 20:07:38'),(5056,'promo_1_text','Hand-selected, freshly cut halal chicken, mutton, beef and seafood.','textarea','homepage','2026-06-09 20:07:38'),(5057,'promo_1_button','Shop Meats','text','homepage','2026-06-09 20:07:38'),(5058,'promo_1_link','/categories','text','homepage','2026-06-09 20:07:38'),(5059,'promo_2_label','Authentic','text','homepage','2026-06-09 20:07:38'),(5060,'promo_2_title','Premium Spices & Seasonings','text','homepage','2026-06-09 20:07:38'),(5061,'promo_2_text','Whole spices, blends and masalas sourced directly from origin farms.','textarea','homepage','2026-06-09 20:07:38'),(5062,'promo_2_button','Shop Spices','text','homepage','2026-06-09 20:07:38'),(5063,'promo_2_link','/categories','text','homepage','2026-06-09 20:07:38'),(5064,'promo_3_label','Farm to Door','text','homepage','2026-06-09 20:07:38'),(5065,'promo_3_title','Fresh Fruits & Vegetables','text','homepage','2026-06-09 20:07:38'),(5066,'promo_3_text','Locally sourced and imported produce delivered fresh every morning.','textarea','homepage','2026-06-09 20:07:38'),(5067,'promo_3_button','Shop Produce','text','homepage','2026-06-09 20:07:38'),(5068,'promo_3_link','/categories','text','homepage','2026-06-09 20:07:38'),(5069,'promise_label','Our Promise','text','homepage','2026-06-09 20:07:38'),(5070,'promise_title','Why Families Choose Us','text','homepage','2026-06-09 20:07:38'),(5071,'promise_text','We bring the freshest halal products straight to your door with a quality guarantee on every order.','textarea','homepage','2026-06-09 20:07:38'),(5072,'why_1_title','100% Halal Certified','text','homepage','2026-06-09 20:07:38'),(5073,'why_1_text','All meats are certified halal by recognised authorities. Shop with complete confidence and peace of mind.','textarea','homepage','2026-06-09 20:07:38'),(5074,'why_2_title','Freshness Guaranteed','text','homepage','2026-06-09 20:07:38'),(5075,'why_2_text','We source produce daily and guarantee freshness on delivery. Not satisfied? We\'ll make it right.','textarea','homepage','2026-06-09 20:07:38'),(5076,'why_3_title','Fast, Reliable Delivery','text','homepage','2026-06-09 20:07:38'),(5077,'why_3_text','Same-day and next-day delivery options. Your order packed with care and delivered on time, every time.','textarea','homepage','2026-06-09 20:07:38'),(5078,'why_4_title','Trusted by 5,000+ Families','text','homepage','2026-06-09 20:07:38'),(5079,'why_4_text','Our community of satisfied customers grows every day. Join thousands of families across the country.','textarea','homepage','2026-06-09 20:07:38'),(5080,'reviews_label','Reviews','text','homepage','2026-06-09 20:07:38'),(5081,'reviews_title','What Our Customers Say','text','homepage','2026-06-09 20:07:38'),(5187,'review_1_name','Fatima A.','text','homepage','2026-06-09 20:13:05'),(5188,'review_1_location','Dublin','text','homepage','2026-06-09 20:13:05'),(5189,'review_1_text','The quality of the halal meat is outstanding. Always fresh and delivered on time. Our family has been shopping here for over a year now.','textarea','homepage','2026-06-09 20:13:05'),(5190,'review_2_name','Mohammed K.','text','homepage','2026-06-09 20:13:05'),(5191,'review_2_location','Cork','text','homepage','2026-06-09 20:13:05'),(5192,'review_2_text','Best spice selection I have found in Ireland. The whole spices are so fresh and aromatic. Prices are excellent too. Highly recommend!','textarea','homepage','2026-06-09 20:13:05'),(5193,'review_3_name','Aisha R.','text','homepage','2026-06-09 20:13:05'),(5194,'review_3_location','Galway','text','homepage','2026-06-09 20:13:05'),(5195,'review_3_text','Superb quality vegetables, always fresh. The customer service is also brilliant - they resolved a small issue with my order within the hour.','textarea','homepage','2026-06-09 20:13:05'),(5196,'review_4_name','Yusuf H.','text','homepage','2026-06-09 20:13:05'),(5197,'review_4_location','Limerick','text','homepage','2026-06-09 20:13:05'),(5198,'review_4_text','I was so impressed by the packaging and freshness. The lamb was butchered perfectly. Will definitely be a regular customer.','textarea','homepage','2026-06-09 20:13:05'),(5199,'review_5_name','Nadia S.','text','homepage','2026-06-09 20:13:05'),(5200,'review_5_location','Waterford','text','homepage','2026-06-09 20:13:05'),(5201,'review_5_text','So convenient to have halal groceries delivered to my door. The app is easy to use and they always have what I need in stock.','textarea','homepage','2026-06-09 20:13:05'),(5202,'review_6_name','Omar B.','text','homepage','2026-06-09 20:13:05'),(5203,'review_6_location','Belfast','text','homepage','2026-06-09 20:13:05'),(5204,'review_6_text','Great range of ethnic ingredients that I cannot find in regular supermarkets. Top quality products at very fair prices.','textarea','homepage','2026-06-09 20:13:05');
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

--
-- Dumping routines for database 'ecommerce_db'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 12:23:17
