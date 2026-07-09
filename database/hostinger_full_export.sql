-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: localhost    Database: reuse_ecom_db
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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '68fe5540-178a-11f1-a91f-c9e82e2c5421:1-221365';

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `label` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Home',
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pincode` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `site_id` int DEFAULT NULL COMMENT 'NULL = super admin (all sites)',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('super_admin','admin','editor') COLLATE utf8mb4_unicode_ci DEFAULT 'admin',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,NULL,'Super Admin','admin@example.com','$2y$12$6l9VxfAF.A.YirIBH8A/YO5KfjCqGFqK96m1ndUuV45lOYKqbq7N.','super_admin',NULL,1,'2026-07-08 15:00:59','2026-07-08 13:11:51','2026-07-08 15:00:59');
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
  `site_id` int NOT NULL DEFAULT '1',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `media_type` enum('image','video') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image',
  `video` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile_video` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fallback_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_text` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_color` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '#3BB77E',
  `position` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'hero',
  `country_id` int DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,1,'','','/uploads/banners/demo-hero-1.jpg',NULL,'image',NULL,NULL,NULL,'/categories','Shop Now','#3BB77E','hero',NULL,1,1,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 14:32:43'),(2,1,'Fresh Arrivals This Week','Discover new products added every day.','/uploads/banners/demo-hero-2.jpg',NULL,'image',NULL,NULL,NULL,'/categories','Explore','#3BB77E','hero',NULL,2,1,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(3,1,'Free Delivery on $50+','Shop more, save more. No code needed.','/uploads/banners/demo-promo-1.jpg',NULL,'image',NULL,NULL,NULL,'/categories','Shop Now','#3BB77E','promo',NULL,1,1,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52');
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
  `site_id` int NOT NULL DEFAULT '1',
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`,`slug`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_categories`
--

LOCK TABLES `blog_categories` WRITE;
/*!40000 ALTER TABLE `blog_categories` DISABLE KEYS */;
INSERT INTO `blog_categories` VALUES (1,1,'Recipes','recipes','2026-07-08 13:11:52'),(2,1,'Store News','store-news','2026-07-08 13:11:52'),(3,1,'Tips & Guides','tips-guides','2026-07-08 13:11:52');
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
  `site_id` int NOT NULL DEFAULT '1',
  `category_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `featured_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Admin',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `views` int DEFAULT '0',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `focus_keyword` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`,`slug`),
  KEY `category_id` (`category_id`),
  KEY `idx_site` (`site_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
INSERT INTO `blog_posts` VALUES (1,1,1,'5 Easy Recipes Using Everyday Pantry Items','5-easy-recipes-everyday-pantry','Make delicious meals at home using simple ingredients you already have.','<p>Cooking great food at home doesn\'t have to be complicated. Here are 5 easy recipes using ingredients you likely already have in your pantry.</p><h2>1. Simple Spiced Rice</h2><p>Combine basmati rice with whole spices for a fragrant, flavourful side dish in under 30 minutes.</p><h2>2. Quick Chana Masala</h2><p>Canned chickpeas, tomatoes, and a good masala blend make this dish incredibly easy.</p>',NULL,'Admin','published',0,'5 Easy Pantry Recipes — Demo Store','Make great food at home with these 5 simple pantry recipes.',NULL,'2026-07-08 18:41:52','2026-07-08 13:11:52','2026-07-08 13:11:52'),(2,1,3,'How to Store Spices for Maximum Freshness','how-to-store-spices-freshness','Learn the best ways to store your spices so they stay fresh and aromatic longer.','<p>Spices are the heart of great cooking, but they lose potency when stored incorrectly. Follow these tips to keep your spices fresh.</p><h2>Keep Them Cool and Dry</h2><p>Store spices away from heat and humidity. A dedicated spice drawer or cupboard works best.</p>',NULL,'Admin','published',0,'How to Store Spices — Demo Store','Keep your spices fresh with these simple storage tips.',NULL,'2026-07-08 18:41:52','2026-07-08 13:11:52','2026-07-08 13:11:52'),(3,1,2,'Welcome to Our Store!','welcome-to-our-store','We are excited to launch our online store. Find out what makes us different.','<p>Welcome! We are thrilled to open our doors and bring quality products to your doorstep. Our team has carefully curated a range of products to make your life easier.</p>',NULL,'Admin','published',0,'Welcome to Our Store!','We\'re open and ready to serve you.',NULL,'2026-07-08 18:41:52','2026-07-08 13:11:52','2026-07-08 13:11:52');
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
  `site_id` int NOT NULL DEFAULT '1',
  `parent_id` int DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `focus_keyword` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`,`slug`),
  KEY `parent_id` (`parent_id`),
  KEY `idx_site` (`site_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,1,NULL,'Snacks & Chips','snacks-chips','A wide selection of snacks and chips.',NULL,NULL,1,1,1,NULL,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(2,1,NULL,'Beverages','beverages','Cold drinks, juices, teas and more.',NULL,NULL,2,1,1,NULL,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(3,1,NULL,'Spices & Masalas','spices-masalas','Premium spices and spice blends.',NULL,NULL,3,1,1,NULL,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(4,1,NULL,'Sweets & Confectionery','sweets','Traditional sweets and confectionery.',NULL,NULL,4,1,1,NULL,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(5,1,NULL,'Staples & Grains','staples-grains','Rice, flour, lentils and everyday staples.',NULL,NULL,5,1,1,NULL,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(6,1,NULL,'Dairy & Eggs','dairy-eggs','Fresh dairy products and eggs.',NULL,NULL,6,1,0,NULL,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(7,1,NULL,'Frozen Foods','frozen-foods','Ready-to-cook frozen products.',NULL,NULL,7,1,0,NULL,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(8,1,NULL,'Personal Care','personal-care','Health and personal care products.',NULL,NULL,8,1,0,NULL,NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_countries`
--

DROP TABLE IF EXISTS `category_countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_countries` (
  `category_id` int NOT NULL,
  `country_id` int NOT NULL,
  PRIMARY KEY (`category_id`,`country_id`),
  KEY `idx_cc_country` (`country_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_countries`
--

LOCK TABLES `category_countries` WRITE;
/*!40000 ALTER TABLE `category_countries` DISABLE KEYS */;
INSERT INTO `category_countries` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(1,2),(2,2),(2,3),(5,3);
/*!40000 ALTER TABLE `category_countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(8) NOT NULL,
  `name` varchar(100) NOT NULL,
  `flag` varchar(16) DEFAULT '',
  `headline` varchar(255) DEFAULT '',
  `subtext` text,
  `suggestions` varchar(500) DEFAULT '',
  `currency_symbol` varchar(8) DEFAULT '',
  `currency_code` varchar(8) DEFAULT '',
  `meta_title` varchar(255) DEFAULT '',
  `meta_description` text,
  `contact_email` varchar(190) DEFAULT '',
  `contact_phone` varchar(64) DEFAULT '',
  `contact_address` varchar(255) DEFAULT '',
  `delivery_info` varchar(500) DEFAULT '',
  `is_default` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'in','India','🇮🇳','The spice route, delivered.','Hand-ground masalas, heritage snacks and pantry staples from makers who never left the old recipes behind.','Bhujia, Masala, Basmati rice, Papad, Namkeen','â‚¹','INR','',NULL,'','','','Delivery across all major Indian cities in 2â€“4 working days.',1,1,1,'2026-07-08 14:18:53','2026-07-08 14:19:26'),(2,'tr','Turkey','🇹🇷','From the bazaars of Anatolia.','Olives, dried figs, baklava and bazaar spices — the warmth of a Turkish pantry, packed with care.','Baklava, Olives, Turkish tea, Dried figs, Simit','â‚º','TRY','',NULL,'','','','Delivery across Turkey in 1â€“3 working days.',0,1,2,'2026-07-08 14:18:53','2026-07-08 14:34:01'),(3,'fi','Finland','🇫🇮','Nordic purity, harvested wild.','Rye, wild berries and clean Nordic flavours — quietly perfected under the midnight sun.','Rye bread, Cloudberry jam, Salmiakki, Coffee, Oats','â‚¬','EUR','',NULL,'','','','Delivery across Finland in 1â€“3 working days.',0,1,3,'2026-07-08 14:18:53','2026-07-08 14:34:01');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` int NOT NULL DEFAULT '1',
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_type` enum('percentage','fixed') COLLATE utf8mb4_unicode_ci DEFAULT 'percentage',
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
  UNIQUE KEY `site_code` (`site_id`,`code`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,1,'WELCOME10','10% off first order','percentage',10.00,20.00,NULL,NULL,0,1,NULL,'2027-07-08 18:41:52','2026-07-08 13:11:52'),(2,1,'SAVE5','$5 off orders over $40','fixed',5.00,40.00,NULL,NULL,0,1,NULL,'2027-07-08 18:41:52','2026-07-08 13:11:52');
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
  `site_id` int NOT NULL DEFAULT '1',
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_guest` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `total_orders` int DEFAULT '0',
  `total_spent` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `email_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('sent','failed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `smtp_response` text COLLATE utf8mb4_unicode_ci,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `pdf_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `xml_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sent` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `email_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'order_placed',
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_html` longtext COLLATE utf8mb4_unicode_ci,
  `body_text` text COLLATE utf8mb4_unicode_ci,
  `attachments` json DEFAULT NULL,
  `status` enum('pending','processing','sent','failed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `attempts` tinyint unsigned NOT NULL DEFAULT '0',
  `max_attempts` tinyint unsigned NOT NULL DEFAULT '3',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `scheduled_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_order` (`order_id`),
  KEY `idx_scheduled` (`status`,`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_queue`
--

LOCK TABLES `email_queue` WRITE;
/*!40000 ALTER TABLE `email_queue` DISABLE KEYS */;
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
  `site_id` int NOT NULL DEFAULT '1',
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
  PRIMARY KEY (`id`),
  KEY `idx_site` (`site_id`)
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
-- Table structure for table `import_column_mappings`
--

DROP TABLE IF EXISTS `import_column_mappings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_column_mappings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `method` enum('csv','xml') NOT NULL,
  `mapping_json` longtext NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_name_method` (`name`,`method`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_column_mappings`
--

LOCK TABLES `import_column_mappings` WRITE;
/*!40000 ALTER TABLE `import_column_mappings` DISABLE KEYS */;
/*!40000 ALTER TABLE `import_column_mappings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_job_items`
--

DROP TABLE IF EXISTS `import_job_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_job_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `batch_id` varchar(64) NOT NULL,
  `product_id` int DEFAULT NULL,
  `country_id` int DEFAULT NULL,
  `source_url` varchar(500) DEFAULT NULL,
  `source_sku` varchar(150) DEFAULT NULL,
  `source_name` varchar(255) DEFAULT NULL,
  `action` enum('imported','updated','skipped','failed') NOT NULL,
  `status` enum('ok','error') DEFAULT 'ok',
  `error` text,
  `image_paths_json` longtext,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job_id` (`job_id`),
  KEY `idx_batch_id` (`batch_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_source_sku` (`source_sku`),
  KEY `idx_country_id` (`country_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_job_items`
--

LOCK TABLES `import_job_items` WRITE;
/*!40000 ALTER TABLE `import_job_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `import_job_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_jobs`
--

DROP TABLE IF EXISTS `import_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `batch_id` varchar(64) NOT NULL,
  `method` enum('scraper','woocommerce','shopify','csv','xml') NOT NULL,
  `source_url` varchar(500) DEFAULT NULL,
  `import_type` varchar(50) DEFAULT 'entire',
  `duplicate_strategy` enum('skip','update','copy') DEFAULT 'skip',
  `country_id` int DEFAULT NULL,
  `status` enum('pending','running','completed','failed','rolled_back') DEFAULT 'pending',
  `total` int DEFAULT '0',
  `processed` int DEFAULT '0',
  `imported` int DEFAULT '0',
  `updated` int DEFAULT '0',
  `skipped` int DEFAULT '0',
  `failed` int DEFAULT '0',
  `options_json` longtext,
  `report_json` longtext,
  `started_at` datetime DEFAULT NULL,
  `finished_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `batch_id` (`batch_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_country_id` (`country_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_jobs`
--

LOCK TABLES `import_jobs` WRITE;
/*!40000 ALTER TABLE `import_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `import_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_logs`
--

DROP TABLE IF EXISTS `import_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `batch_id` varchar(64) NOT NULL,
  `level` enum('info','success','warning','error') DEFAULT 'info',
  `message` text NOT NULL,
  `context_json` longtext,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job_id` (`job_id`),
  KEY `idx_batch_id` (`batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_logs`
--

LOCK TABLES `import_logs` WRITE;
/*!40000 ALTER TABLE `import_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `import_logs` ENABLE KEYS */;
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
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `xml_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `generated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module_registry`
--

DROP TABLE IF EXISTS `module_registry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module_registry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` int NOT NULL DEFAULT '1',
  `module_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `config` json DEFAULT NULL,
  `installed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_module` (`site_id`,`module_key`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_registry`
--

LOCK TABLES `module_registry` WRITE;
/*!40000 ALTER TABLE `module_registry` DISABLE KEYS */;
INSERT INTO `module_registry` VALUES (1,1,'wishlist',0,NULL,'2026-07-08 13:11:52'),(2,1,'rewards',0,NULL,'2026-07-08 13:11:52'),(3,1,'affiliate',0,NULL,'2026-07-08 13:11:52'),(4,1,'referral',0,NULL,'2026-07-08 13:11:52'),(5,1,'subscriptions',0,NULL,'2026-07-08 13:11:52'),(6,1,'vendor_marketplace',0,NULL,'2026-07-08 13:11:52'),(7,1,'pos',0,NULL,'2026-07-08 13:11:52'),(8,1,'inventory',0,NULL,'2026-07-08 13:11:52'),(9,1,'multi_warehouse',0,NULL,'2026-07-08 13:11:52'),(10,1,'whatsapp_marketing',0,NULL,'2026-07-08 13:11:52'),(11,1,'email_marketing',0,NULL,'2026-07-08 13:11:52');
/*!40000 ALTER TABLE `module_registry` ENABLE KEYS */;
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
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `site_id` int NOT NULL DEFAULT '1',
  `order_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_address` text COLLATE utf8mb4_unicode_ci,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(12,2) DEFAULT '0.00',
  `shipping_charge` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` enum('cod','online','bank_transfer','stripe','paypal','razorpay') COLLATE utf8mb4_unicode_ci DEFAULT 'cod',
  `payment_status` enum('pending','paid','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','returned') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `delivered_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_site` (`site_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_sections`
--

DROP TABLE IF EXISTS `page_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` int NOT NULL DEFAULT '1',
  `section_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_enabled` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `config` json DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_section` (`site_id`,`section_key`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_sections`
--

LOCK TABLES `page_sections` WRITE;
/*!40000 ALTER TABLE `page_sections` DISABLE KEYS */;
INSERT INTO `page_sections` VALUES (1,1,'hero_banner',1,1,NULL,'2026-07-08 13:11:51'),(2,1,'featured_categories',1,2,NULL,'2026-07-08 13:11:51'),(3,1,'best_sellers',1,3,NULL,'2026-07-08 13:11:51'),(4,1,'featured_products',1,4,NULL,'2026-07-08 13:11:51'),(5,1,'promo_banners',1,5,NULL,'2026-07-08 13:11:51'),(6,1,'trust_section',1,6,NULL,'2026-07-08 13:11:51'),(7,1,'testimonials',1,7,NULL,'2026-07-08 13:11:51'),(8,1,'blog_section',1,8,NULL,'2026-07-08 13:11:51'),(9,1,'newsletter',1,9,NULL,'2026-07-08 13:11:51'),(10,1,'instagram_feed',0,10,NULL,'2026-07-08 13:11:51');
/*!40000 ALTER TABLE `page_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` int NOT NULL DEFAULT '1',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`,`slug`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (1,1,'About Us','about','<h1>About Our Store</h1><p>We are a passionate team dedicated to bringing you the finest products at great prices. Our mission is to make quality products accessible to everyone, delivered straight to your door.</p><h2>Our Story</h2><p>Founded with a simple idea — make shopping easy, affordable, and enjoyable. Update this page from Admin → Static Pages to tell your brand story.</p>','About Us','Learn more about our store and our mission.',1,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(2,1,'Delivery Information','delivery','<h1>Delivery Information</h1><p>We offer fast and reliable delivery. Update the delivery options from Admin → Delivery Settings.</p><h2>Free Delivery</h2><p>Enjoy free delivery on all orders over the minimum threshold set in your admin panel.</p>','Delivery Information','Learn about our delivery options and timeframes.',1,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(3,1,'Privacy Policy','privacy','<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p><p>Update this page from Admin → Static Pages to include your actual privacy policy.</p>','Privacy Policy','Read our privacy policy and how we protect your data.',1,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(4,1,'Terms & Conditions','terms','<h1>Terms & Conditions</h1><p>By using our website and placing orders, you agree to our terms and conditions.</p><p>Update this page from Admin → Static Pages to include your actual terms.</p>','Terms & Conditions','Read our terms and conditions of service.',1,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(5,1,'Returns & Refunds','returns','<h1>Returns & Refunds</h1><p>We want you to be completely happy with your purchase. If you are not satisfied, contact us and we will make it right.</p><p>Update this page from Admin → Static Pages to include your returns policy.</p>','Returns & Refunds','Our returns and refunds policy — your satisfaction guaranteed.',1,'2026-07-08 13:11:52','2026-07-08 13:11:52');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,1),(2,1),(3,2),(13,2),(5,3),(8,3),(11,3),(12,3),(6,4),(4,5),(7,5),(14,5),(10,6),(15,6),(9,7);
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_countries`
--

DROP TABLE IF EXISTS `product_countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_countries` (
  `product_id` int NOT NULL,
  `country_id` int NOT NULL,
  PRIMARY KEY (`product_id`,`country_id`),
  KEY `idx_pc_country` (`country_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_countries`
--

LOCK TABLES `product_countries` WRITE;
/*!40000 ALTER TABLE `product_countries` DISABLE KEYS */;
INSERT INTO `product_countries` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(9,1),(10,1),(11,1),(12,1),(13,1),(14,1),(15,1),(1,2),(3,2),(13,2),(15,2),(3,3),(4,3),(8,3),(15,3);
/*!40000 ALTER TABLE `product_countries` ENABLE KEYS */;
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
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g. 500g, Red, Large',
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `product_variations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `site_id` int NOT NULL DEFAULT '1',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(10,2) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock` int DEFAULT '0',
  `low_stock_threshold` int DEFAULT '5',
  `weight` decimal(8,2) DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'piece',
  `brand` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_trending` tinyint(1) DEFAULT '0',
  `is_new` tinyint(1) DEFAULT '0',
  `views` int DEFAULT '0',
  `sales_count` int DEFAULT '0',
  `avg_rating` decimal(3,2) DEFAULT '0.00',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'index,follow',
  `focus_keyword` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `schema_json` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`,`slug`),
  KEY `idx_site` (`site_id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_price` (`price`),
  KEY `idx_featured` (`is_featured`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Classic Salted Chips 200g','classic-salted-chips-200g','Crispy, light salted potato chips.',NULL,2.49,NULL,NULL,NULL,NULL,250,5,NULL,'pack',NULL,1,1,1,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(2,1,'Spicy Masala Peanuts 250g','spicy-masala-peanuts-250g','Roasted peanuts with masala coating.',NULL,1.99,1.49,NULL,NULL,NULL,180,5,NULL,'pack',NULL,1,1,1,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(3,1,'Mango Juice 1L','mango-juice-1l','100% pure mango juice, no added sugar.',NULL,3.29,NULL,NULL,NULL,NULL,120,5,NULL,'bottle',NULL,1,1,0,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(4,1,'Premium Basmati Rice 5kg','premium-basmati-rice-5kg','Long grain aged basmati rice.',NULL,12.99,9.99,NULL,NULL,NULL,80,5,NULL,'bag',NULL,1,1,0,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(5,1,'Garam Masala Blend 100g','garam-masala-blend-100g','Classic aromatic garam masala.',NULL,2.79,NULL,NULL,NULL,NULL,200,5,NULL,'jar',NULL,1,0,0,1,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(6,1,'Gulab Jamun Mix 200g','gulab-jamun-mix-200g','Ready-to-cook gulab jamun mix.',NULL,2.49,NULL,NULL,NULL,NULL,150,5,NULL,'pack',NULL,1,0,0,1,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(7,1,'Whole Wheat Atta 5kg','whole-wheat-atta-5kg','Stone ground whole wheat flour.',NULL,7.99,6.49,NULL,NULL,NULL,90,5,NULL,'bag',NULL,1,0,1,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(8,1,'Masala Chai Mix 250g','masala-chai-mix-250g','Traditional spiced tea blend.',NULL,3.99,NULL,NULL,NULL,NULL,130,5,NULL,'pack',NULL,1,0,0,1,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(9,1,'Frozen Aloo Paratha (8pcs)','frozen-aloo-paratha-8pcs','Ready-to-cook stuffed flatbreads.',NULL,4.99,NULL,NULL,NULL,NULL,60,5,NULL,'pack',NULL,1,1,1,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(10,1,'Desi Ghee 500ml','desi-ghee-500ml','Pure clarified butter, traditional taste.',NULL,8.49,7.99,NULL,NULL,NULL,70,5,NULL,'jar',NULL,1,1,0,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(11,1,'Turmeric Powder 200g','turmeric-powder-200g','Pure ground turmeric.',NULL,1.99,NULL,NULL,NULL,NULL,220,5,NULL,'pack',NULL,1,0,0,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(12,1,'Tamarind Paste 400g','tamarind-paste-400g','Thick tamarind paste for cooking.',NULL,2.29,NULL,NULL,NULL,NULL,140,5,NULL,'jar',NULL,1,0,0,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(13,1,'Rose Sharbat 750ml','rose-sharbat-750ml','Sweet rose-flavoured syrup.',NULL,3.49,2.99,NULL,NULL,NULL,100,5,NULL,'bottle',NULL,1,0,1,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(14,1,'Chickpea Flour (Besan) 1kg','chickpea-flour-besan-1kg','Fine grade gram flour.',NULL,2.99,NULL,NULL,NULL,NULL,160,5,NULL,'bag',NULL,1,0,0,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52'),(15,1,'Organic Coconut Oil 500ml','organic-coconut-oil-500ml','Cold-pressed extra virgin coconut oil.',NULL,6.99,5.99,NULL,NULL,NULL,85,5,NULL,'bottle',NULL,1,1,0,1,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-08 13:11:52','2026-07-08 13:11:52');
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
  `site_id` int NOT NULL DEFAULT '1',
  `product_id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `is_approved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_site` (`site_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seo_overrides`
--

DROP TABLE IF EXISTS `seo_overrides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seo_overrides` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` int NOT NULL DEFAULT '1',
  `entity_type` enum('product','category','blog','page','url') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `url_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'index,follow',
  `schema_json` json DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_site` (`site_id`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_url` (`url_path`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seo_overrides`
--

LOCK TABLES `seo_overrides` WRITE;
/*!40000 ALTER TABLE `seo_overrides` DISABLE KEYS */;
/*!40000 ALTER TABLE `seo_overrides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_id` int NOT NULL DEFAULT '1',
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `setting_type` enum('text','textarea','image','json','boolean','number') COLLATE utf8mb4_unicode_ci DEFAULT 'text',
  `setting_group` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_site_setting` (`site_id`,`setting_key`),
  KEY `idx_site` (`site_id`),
  KEY `idx_group` (`setting_group`)
) ENGINE=InnoDB AUTO_INCREMENT=1366 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,1,'site_name','Kale Gida','text','general','2026-07-08 14:18:53'),(2,1,'site_tagline','Premium groceries from India, Turkey & Finland','text','general','2026-07-08 14:18:53'),(3,1,'site_email','hello@example.com','text','general','2026-07-08 13:11:52'),(4,1,'currency_symbol','$','text','general','2026-07-08 13:11:52'),(5,1,'currency_code','USD','text','general','2026-07-08 13:11:52'),(6,1,'active_theme','default','text','general','2026-07-08 13:11:52'),(7,1,'hero_eyebrow','Fresh & Quality','text','homepage','2026-07-08 13:11:52'),(8,1,'hero_title','Everything you need, delivered to your door.','text','homepage','2026-07-08 13:11:52'),(9,1,'footer_copyright','Â© 2026 Kale Gida. All rights reserved.','text','footer','2026-07-08 14:18:53'),(10,1,'footer_about','A curated international grocery marketplace â€” authentic staples, snacks and delicacies from India, Turkey and Finland, delivered to your door.','textarea','footer','2026-07-08 14:18:53'),(11,1,'meta_title','Kale Gida | Premium Groceries from India, Turkey & Finland','text','seo','2026-07-08 14:18:53'),(12,1,'meta_description','Shop Kale Gida â€” a premium international grocery marketplace. Authentic flavours from India, Turkey and Finland, delivered fresh to your door.','textarea','seo','2026-07-08 14:18:53'),(13,1,'shipping_free_above','50','number','shipping','2026-07-08 13:11:52'),(14,1,'shipping_charge','4.99','number','shipping','2026-07-08 13:11:52'),(17,1,'site_description','A curated international grocery marketplace â€” authentic staples, snacks and delicacies from India, Turkey and Finland, delivered to your door.','textarea','seo','2026-07-08 14:18:53'),(18,1,'site_url','','text','general','2026-07-08 13:14:45'),(19,1,'admin_url','/admin/orders.php','text','general','2026-07-08 13:14:45'),(20,1,'site_logo','','image','general','2026-07-08 14:36:13'),(21,1,'site_favicon','/favicon.ico','image','general','2026-07-08 13:14:45'),(23,1,'site_phone','','text','general','2026-07-08 13:14:45'),(24,1,'site_address','Configure store address in Admin Settings','textarea','general','2026-07-08 13:14:45'),(25,1,'business_city','','text','contact','2026-07-08 13:14:45'),(26,1,'business_region','','text','contact','2026-07-08 13:14:45'),(27,1,'business_country','GB','text','contact','2026-07-08 13:14:45'),(28,1,'contact_email','hello@example.com','text','contact','2026-07-08 13:14:45'),(29,1,'contact_address','Configure store address in Admin Settings','text','contact','2026-07-08 13:14:45'),(30,1,'contact_hours','Mon–Sat: 9am–6pm | Sun: 10am–4pm','textarea','contact','2026-07-08 13:14:45'),(31,1,'contact_map_embed','','textarea','contact','2026-07-08 13:14:45'),(32,1,'contact_phone','','text','contact','2026-07-08 13:14:45'),(35,1,'newsletter_desc','Get exclusive deals, new arrivals and weekly offers delivered straight to your inbox.','textarea','footer','2026-07-08 13:14:45'),(36,1,'header_offer_text','Free delivery on orders over a minimum spend','text','header','2026-07-08 13:14:45'),(38,1,'hero_media_badge','Premium Selection','text','homepage','2026-07-08 13:14:45'),(39,1,'hero_media_caption_title','Fresh Picks','text','homepage','2026-07-08 13:14:45'),(40,1,'hero_media_caption_meta','Curated daily','text','homepage','2026-07-08 13:14:45'),(41,1,'trust_item_1_text','Quality Guaranteed','text','homepage','2026-07-08 13:14:45'),(42,1,'trust_item_2_text','Free Delivery Available','text','homepage','2026-07-08 13:14:45'),(43,1,'trust_item_3_text','Freshness Guaranteed','text','homepage','2026-07-08 13:14:45'),(44,1,'trust_item_4_text','Fast Dispatch','text','homepage','2026-07-08 13:14:45'),(45,1,'home_categories_label','Browse','text','homepage','2026-07-08 13:14:45'),(46,1,'home_categories_title','Shop by Category','text','homepage','2026-07-08 13:14:45'),(47,1,'home_categories_link_text','All Categories','text','homepage','2026-07-08 13:14:45'),(48,1,'home_featured_label','Bestsellers','text','homepage','2026-07-08 13:14:45'),(49,1,'home_featured_title','Featured Products','text','homepage','2026-07-08 13:14:45'),(50,1,'home_featured_link_text','View All','text','homepage','2026-07-08 13:14:45'),(51,1,'home_trending_label','Trending','text','homepage','2026-07-08 13:14:45'),(52,1,'home_trending_title','Best Sellers','text','homepage','2026-07-08 13:14:45'),(53,1,'home_trending_link_text','View All','text','homepage','2026-07-08 13:14:45'),(54,1,'featured_brands_label','Featured Brands','text','homepage','2026-07-08 13:14:45'),(55,1,'featured_brands_title','Trusted Grocery Brands','text','homepage','2026-07-08 13:14:45'),(56,1,'featured_brands_link_text','Shop Brands','text','homepage','2026-07-08 13:14:45'),(57,1,'featured_brands_list','Aashirvaad, Pillsbury, Everest, MDH, Ching\'s, Haldiram, India Gate','textarea','homepage','2026-07-08 13:14:45'),(58,1,'home_new_label','Just In','text','homepage','2026-07-08 13:14:45'),(59,1,'home_new_title','New Arrivals','text','homepage','2026-07-08 13:14:45'),(60,1,'home_new_link_text','View All','text','homepage','2026-07-08 13:14:45'),(61,1,'promo_1_label','Category 1','text','homepage','2026-07-08 13:14:45'),(62,1,'promo_1_title','Configure This Promo','text','homepage','2026-07-08 13:14:45'),(63,1,'promo_1_text','Update this promo banner content from the Admin Settings panel.','textarea','homepage','2026-07-08 13:14:45'),(64,1,'promo_1_button','Shop Now','text','homepage','2026-07-08 13:14:45'),(65,1,'promo_1_link','/categories','text','homepage','2026-07-08 13:14:45'),(66,1,'promo_2_label','Category 2','text','homepage','2026-07-08 13:14:45'),(67,1,'promo_2_title','Configure This Promo','text','homepage','2026-07-08 13:14:45'),(68,1,'promo_2_text','Update this promo banner content from the Admin Settings panel.','textarea','homepage','2026-07-08 13:14:45'),(69,1,'promo_2_button','Shop Now','text','homepage','2026-07-08 13:14:45'),(70,1,'promo_2_link','/categories','text','homepage','2026-07-08 13:14:45'),(71,1,'promo_3_label','Category 3','text','homepage','2026-07-08 13:14:45'),(72,1,'promo_3_title','Configure This Promo','text','homepage','2026-07-08 13:14:45'),(73,1,'promo_3_text','Update this promo banner content from the Admin Settings panel.','textarea','homepage','2026-07-08 13:14:45'),(74,1,'promo_3_button','Shop Now','text','homepage','2026-07-08 13:14:45'),(75,1,'promo_3_link','/categories','text','homepage','2026-07-08 13:14:45'),(76,1,'promise_label','Our Promise','text','homepage','2026-07-08 13:14:45'),(77,1,'promise_title','Why Customers Choose Us','text','homepage','2026-07-08 13:14:45'),(78,1,'promise_text','Configure this section from the Admin Settings panel to highlight your unique value proposition.','textarea','homepage','2026-07-08 13:14:45'),(79,1,'why_1_title','Quality Products','text','homepage','2026-07-08 13:14:45'),(80,1,'why_1_text','Update this feature in Admin Settings to describe your first key benefit.','textarea','homepage','2026-07-08 13:14:45'),(81,1,'why_2_title','Satisfaction Guaranteed','text','homepage','2026-07-08 13:14:45'),(82,1,'why_2_text','Update this feature in Admin Settings to describe your second key benefit.','textarea','homepage','2026-07-08 13:14:45'),(83,1,'why_3_title','Fast, Reliable Delivery','text','homepage','2026-07-08 13:14:45'),(84,1,'why_3_text','Update this feature in Admin Settings to describe your third key benefit.','textarea','homepage','2026-07-08 13:14:45'),(85,1,'why_4_title','Trusted by Customers','text','homepage','2026-07-08 13:14:45'),(86,1,'why_4_text','Update this feature in Admin Settings to describe your fourth key benefit.','textarea','homepage','2026-07-08 13:14:45'),(87,1,'reviews_label','Reviews','text','homepage','2026-07-08 13:14:45'),(88,1,'reviews_title','What Our Customers Say','text','homepage','2026-07-08 13:14:45'),(89,1,'review_1_name','Customer A.','text','homepage','2026-07-08 13:14:45'),(90,1,'review_1_location','City','text','homepage','2026-07-08 13:14:45'),(91,1,'review_1_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-08 13:14:45'),(92,1,'review_2_name','Customer B.','text','homepage','2026-07-08 13:14:45'),(93,1,'review_2_location','City','text','homepage','2026-07-08 13:14:45'),(94,1,'review_2_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-08 13:14:45'),(95,1,'review_3_name','Customer C.','text','homepage','2026-07-08 13:14:45'),(96,1,'review_3_location','City','text','homepage','2026-07-08 13:14:45'),(97,1,'review_3_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-08 13:14:45'),(98,1,'review_4_name','Customer D.','text','homepage','2026-07-08 13:14:45'),(99,1,'review_4_location','City','text','homepage','2026-07-08 13:14:45'),(100,1,'review_4_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-08 13:14:45'),(101,1,'review_5_name','Customer E.','text','homepage','2026-07-08 13:14:45'),(102,1,'review_5_location','City','text','homepage','2026-07-08 13:14:45'),(103,1,'review_5_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-08 13:14:45'),(104,1,'review_6_name','Customer F.','text','homepage','2026-07-08 13:14:45'),(105,1,'review_6_location','City','text','homepage','2026-07-08 13:14:45'),(106,1,'review_6_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-08 13:14:45'),(107,1,'payment_online_url','','text','payments','2026-07-08 13:14:45'),(108,1,'social_facebook','','text','social','2026-07-08 13:14:45'),(109,1,'social_instagram','','text','social','2026-07-08 13:14:45'),(110,1,'social_twitter','','text','social','2026-07-08 13:14:45'),(111,1,'social_youtube','','text','social','2026-07-08 13:14:45'),(112,1,'social_tiktok','','text','social','2026-07-08 13:14:45'),(113,1,'social_whatsapp','','text','social','2026-07-08 13:14:45'),(114,1,'social_linkedin','','text','social','2026-07-08 13:14:45'),(117,1,'tax_percentage','0','number','tax','2026-07-08 13:14:45'),(121,1,'newsletter_title','Stay in the loop','text','footer','2026-07-08 13:14:45'),(122,1,'maintenance_mode','0','boolean','general','2026-07-08 13:14:45'),(123,1,'delivery_free_above','50','number','delivery','2026-07-08 13:14:45'),(124,1,'delivery_free_enabled','1','boolean','delivery','2026-07-08 13:14:45'),(125,1,'delivery_local_fee','2.95','number','delivery','2026-07-08 13:14:45'),(126,1,'delivery_standard_fee','4.95','number','delivery','2026-07-08 13:14:45'),(127,1,'delivery_small_order_min','25','number','delivery','2026-07-08 13:14:45'),(128,1,'delivery_small_order_fee','1.50','number','delivery','2026-07-08 13:14:45'),(129,1,'delivery_small_order_enabled','1','boolean','delivery','2026-07-08 13:14:45'),(130,1,'delivery_local_zone_label','Local delivery','text','delivery','2026-07-08 13:14:45'),(131,1,'delivery_standard_zone_label','Standard delivery','text','delivery','2026-07-08 13:14:45'),(132,1,'delivery_local_keywords','','text','delivery','2026-07-08 13:14:45'),(133,1,'delivery_local_postcode_prefixes','','text','delivery','2026-07-08 13:14:45'),(134,1,'google_analytics_id','','text','seo','2026-07-08 13:14:45'),(137,1,'meta_keywords','online store, ecommerce, quality products','text','seo','2026-07-08 13:14:45'),(138,1,'smtp_host','','text','email','2026-07-08 13:14:45'),(139,1,'smtp_port','587','number','email','2026-07-08 13:14:45'),(140,1,'smtp_encryption','tls','text','email','2026-07-08 13:14:45'),(141,1,'smtp_username','','text','email','2026-07-08 13:14:45'),(142,1,'smtp_password','','text','email','2026-07-08 13:14:45'),(143,1,'smtp_from_email','hello@example.com','text','email','2026-07-08 13:14:45'),(144,1,'smtp_from_name','Kale Gida','text','email','2026-07-08 14:18:53'),(145,1,'admin_email','hello@example.com','text','email','2026-07-08 13:14:45'),(146,1,'email_enabled','1','boolean','email','2026-07-08 13:14:45'),(147,1,'whatsapp_enabled','0','boolean','email','2026-07-08 13:14:45'),(148,1,'whatsapp_number','','text','email','2026-07-08 13:14:45'),(149,1,'whatsapp_api_key','','text','email','2026-07-08 13:14:45'),(285,1,'banner_schema_v2','1','text','system','2026-07-08 14:19:10');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sites`
--

DROP TABLE IF EXISTS `sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `theme` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'default',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'UTC',
  `status` enum('active','maintenance','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain` (`domain`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sites`
--

LOCK TABLES `sites` WRITE;
/*!40000 ALTER TABLE `sites` DISABLE KEYS */;
INSERT INTO `sites` VALUES (1,'Your Store','localhost','default','USD','UTC','active','2026-07-08 13:11:51');
/*!40000 ALTER TABLE `sites` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'reuse_ecom_db'
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

-- Dump completed on 2026-07-08 20:53:16
