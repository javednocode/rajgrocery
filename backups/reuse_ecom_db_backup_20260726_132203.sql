Warning: A partial dump from a server that has GTIDs will by default include the GTIDs of all transactions, even those that changed suppressed parts of the database. If you don't want to restore GTIDs, pass --set-gtid-purged=OFF. To make a complete dump, pass --all-databases --triggers --routines --events. 
Warning: A dump from a server that has GTIDs enabled will by default include the GTIDs of all transactions, even those that were executed during its extraction and might not be represented in the dumped data. This might result in an inconsistent data dump. 
In order to ensure a consistent backup of the database, pass --single-transaction or --lock-all-tables or --source-data. 
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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '68fe5540-178a-11f1-a91f-c9e82e2c5421:1-232171';

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Home',
  `full_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pincode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('super_admin','admin','editor') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'admin',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `admins` VALUES (1,NULL,'Super Admin','admin@example.com','$2y$12$5iDWMlreMD6b3pLTPOFGue8pgUZU4iJTK.uH0x8ijpPOcoTpJptt2','super_admin',NULL,1,'2026-07-14 12:21:07','2026-07-08 13:11:51','2026-07-14 12:21:07');
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
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `media_type` enum('image','video') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image',
  `video` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile_video` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fallback_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_text` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_color` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#3BB77E',
  `position` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'hero',
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
INSERT INTO `banners` VALUES (1,1,'','',NULL,NULL,'image',NULL,NULL,NULL,'/categories','Shop Now','#3BB77E','hero',NULL,1,1,NULL,NULL,'2026-07-08 13:11:52','2026-07-14 12:35:28'),(2,1,'Fresh Arrivals This Week','Discover new products added every day.',NULL,NULL,'image',NULL,NULL,NULL,'/categories','Explore','#3BB77E','hero',NULL,2,1,NULL,NULL,'2026-07-08 13:11:52','2026-07-14 12:35:28'),(3,1,'Free Delivery on $50+','Shop more, save more. No code needed.',NULL,NULL,'image',NULL,NULL,NULL,'/categories','Shop Now','#3BB77E','promo',NULL,1,1,NULL,NULL,'2026-07-08 13:11:52','2026-07-14 12:35:28');
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
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `featured_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Admin',
  `status` enum('draft','published','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `views` int DEFAULT '0',
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `focus_keyword` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `focus_keyword` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'index,follow',
  `seo_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_slug` (`site_id`,`slug`),
  KEY `parent_id` (`parent_id`),
  KEY `idx_site` (`site_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (16,1,NULL,'Bilona Ghee','bilona-ghee','Traditional A2 Bilona ghee — golden & danedar','/uploads/categories/1784038027_ba08e451.png','',0,1,1,'','','','index,follow',NULL,'2026-07-14 12:32:46','2026-07-19 15:10:30'),(17,1,NULL,'Cold-Pressed Oils','cold-pressed-oils','Single-origin, wood-pressed cooking oils',NULL,NULL,2,1,1,NULL,NULL,NULL,'index,follow',NULL,'2026-07-14 12:32:46','2026-07-19 16:48:37'),(18,1,NULL,'Honey & Sweeteners','honey-sweeteners','Raw, unfiltered honey and natural sweeteners',NULL,NULL,3,1,1,NULL,NULL,NULL,'index,follow',NULL,'2026-07-14 12:32:46','2026-07-19 15:18:38'),(19,1,NULL,'Kitchen Staples','kitchen-staples','Honest pantry essentials from trusted sources',NULL,NULL,4,1,1,NULL,NULL,NULL,'index,follow',NULL,'2026-07-14 12:32:46','2026-07-16 17:53:01'),(20,1,NULL,'Spices & Masalas','spices-masalas','Pure whole spices and handcrafted blends',NULL,NULL,5,1,1,NULL,NULL,NULL,'index,follow',NULL,'2026-07-14 12:32:46','2026-07-16 17:53:01'),(21,1,NULL,'Gift Hampers','gift-hampers','Curated boxes for pure-food lovers',NULL,NULL,6,1,1,NULL,NULL,NULL,'index,follow',NULL,'2026-07-14 12:32:46','2026-07-14 12:32:46'),(22,1,NULL,'Snacks & Namkeen','snacks-namkeen','Wholesome traditional snacks',NULL,NULL,7,1,1,NULL,NULL,NULL,'index,follow',NULL,'2026-07-14 12:32:46','2026-07-16 17:53:01'),(23,1,NULL,'Suppen, Gewürze und Saucen','suppen-gew-urze-und-saucen',NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,'index,follow',NULL,'2026-07-18 05:10:59','2026-07-19 00:41:18');
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
INSERT INTO `category_countries` VALUES (16,1),(17,1),(18,1),(19,1),(20,1),(21,1),(22,1),(16,2),(17,2),(18,2),(19,2),(20,2),(21,2),(22,2),(23,2),(16,3),(17,3),(18,3),(19,3),(20,3),(21,3),(22,3);
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
INSERT INTO `countries` VALUES (1,'in','India','🇮🇳','The spice route, delivered.','Hand-ground masalas, heritage snacks and pantry staples from makers who never left the old recipes behind.','Bhujia, Masala, Basmati rice, Papad, Namkeen','₹','INR','',NULL,'','','','Delivery across all major Indian cities in 2–4 working days.',1,1,1,'2026-07-08 14:18:53','2026-07-09 09:48:48'),(2,'tr','Turkey','🇹🇷','From the bazaars of Anatolia.','Olives, dried figs, baklava and bazaar spices — the warmth of a Turkish pantry, packed with care.','Baklava, Olives, Turkish tea, Dried figs, Simit','₺','TRY','',NULL,'','','','Delivery across Turkey in 1–3 working days.',0,1,2,'2026-07-08 14:18:53','2026-07-09 09:48:48'),(3,'fi','Finland','🇫🇮','Nordic purity, harvested wild.','Rye, wild berries and clean Nordic flavours — quietly perfected under the midnight sun.','Rye bread, Cloudberry jam, Salmiakki, Coffee, Oats','€','EUR','',NULL,'','','','Delivery across Finland in 1–3 working days.',0,1,3,'2026-07-08 14:18:53','2026-07-09 09:48:48');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `country_product_flags`
--

DROP TABLE IF EXISTS `country_product_flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `country_product_flags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `country_id` int NOT NULL,
  `product_id` int NOT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_trending` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_country_product` (`country_id`,`product_id`),
  KEY `idx_country_featured` (`country_id`,`is_featured`),
  KEY `idx_country_trending` (`country_id`,`is_trending`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `country_product_flags`
--

LOCK TABLES `country_product_flags` WRITE;
/*!40000 ALTER TABLE `country_product_flags` DISABLE KEYS */;
INSERT INTO `country_product_flags` VALUES (1,1,21,1,1,0),(2,1,22,1,0,0),(3,1,23,1,1,0),(4,1,24,1,0,0),(5,1,25,1,1,0),(6,1,26,1,0,0),(7,1,27,1,1,0),(8,1,28,0,0,0),(9,1,29,1,0,0),(10,1,30,0,1,0);
/*!40000 ALTER TABLE `country_product_flags` ENABLE KEYS */;
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
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_type` enum('percentage','fixed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'percentage',
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
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `email_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('sent','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `smtp_response` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pdf_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `xml_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `email_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'order_placed',
  `recipient` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_html` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `body_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `attachments` json DEFAULT NULL,
  `status` enum('pending','processing','sent','failed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `attempts` tinyint unsigned NOT NULL DEFAULT '0',
  `max_attempts` tinyint unsigned NOT NULL DEFAULT '3',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `badge` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `xml_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `module_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `config` json DEFAULT NULL,
  `installed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_module` (`site_id`,`module_key`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `order_number` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int DEFAULT NULL,
  `customer_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(12,2) DEFAULT '0.00',
  `shipping_charge` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `coupon_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` enum('cod','online','bank_transfer','stripe','paypal','razorpay') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'cod',
  `payment_status` enum('pending','paid','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','returned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `section_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_enabled` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `config` json DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_section` (`site_id`,`section_key`),
  KEY `idx_site` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
INSERT INTO `product_categories` VALUES (21,16),(22,16),(23,17),(24,17),(25,18),(26,20),(27,20),(28,20),(29,21),(30,22);
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
INSERT INTO `product_countries` VALUES (21,1),(22,1),(23,1),(24,1),(25,1),(26,1),(27,1),(28,1),(29,1),(30,1);
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
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,22,'/uploads/products/1784038331_baaa7d0d.png',NULL,0,1,'2026-07-14 14:12:11'),(2,21,'https://images.unsplash.com/photo-1592178036182-5400889dfc74?w=600&q=78&auto=format&fit=crop','A2 Bilona Ghee 500ml',0,1,'2026-07-14 14:33:01'),(3,22,'https://images.unsplash.com/photo-1605880980331-20a711b27338?w=600&q=78&auto=format&fit=crop','A2 Bilona Ghee 1L',0,0,'2026-07-14 14:33:01'),(4,23,'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=78&auto=format&fit=crop','Groundnut Cold-Press Oil',0,1,'2026-07-14 14:33:01'),(5,24,'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=78&auto=format&fit=crop','Sesame Cold-Press Oil',0,1,'2026-07-14 14:33:01'),(6,25,'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600&q=78&auto=format&fit=crop','Wild Forest Honey',0,1,'2026-07-14 14:33:01'),(7,26,'https://images.unsplash.com/photo-1519671282429-b44660ead0a7?w=600&q=78&auto=format&fit=crop','Himalayan Pink Salt',0,1,'2026-07-14 14:33:01'),(8,27,'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=78&auto=format&fit=crop','Turmeric Powder',0,1,'2026-07-14 14:33:01'),(9,28,'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=78&auto=format&fit=crop','Coriander Cumin Blend',0,1,'2026-07-14 14:33:01'),(10,29,'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=78&auto=format&fit=crop','Ghee Gift Box (2x250ml)',0,1,'2026-07-14 14:33:01'),(11,30,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=78&auto=format&fit=crop','Millet Namkeen',0,1,'2026-07-14 14:33:01');
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
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g. 500g, Red, Large',
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(10,2) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock` int DEFAULT '0',
  `low_stock_threshold` int DEFAULT '5',
  `weight` decimal(8,2) DEFAULT NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'piece',
  `brand` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_trending` tinyint(1) DEFAULT '0',
  `is_new` tinyint(1) DEFAULT '0',
  `views` int DEFAULT '0',
  `sales_count` int DEFAULT '0',
  `avg_rating` decimal(3,2) DEFAULT '0.00',
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'index,follow',
  `focus_keyword` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (21,1,'A2 Bilona Ghee 500ml','a2-bilona-ghee-500ml','Traditional hand-churned A2 cow ghee',NULL,899.00,799.00,NULL,NULL,NULL,100,5,NULL,'500ml','Ovlin',1,1,1,0,2,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-14 12:32:46','2026-07-14 14:30:38'),(22,1,'A2 Bilona Ghee 1L','a2-bilona-ghee-1l','Premium A2 Bilona ghee — family pack','<p><br></p>',1599.00,1399.00,NULL,'',NULL,80,5,NULL,'piece','Ovlin',1,1,0,0,2,0,0.00,'','',NULL,NULL,'index,follow','',NULL,'2026-07-14 12:32:46','2026-07-14 14:37:20'),(23,1,'Groundnut Cold-Press Oil','groundnut-cold-press-oil','Wood-pressed peanut oil, single origin',NULL,450.00,NULL,NULL,NULL,NULL,60,5,NULL,'1L','Ovlin',1,0,1,1,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-14 12:32:46','2026-07-14 12:32:46'),(24,1,'Sesame Cold-Press Oil','sesame-cold-press-oil','Wood-pressed sesame oil, kachi ghani style',NULL,480.00,NULL,NULL,NULL,NULL,50,5,NULL,'500ml','Ovlin',1,0,0,1,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-14 12:32:46','2026-07-14 12:32:46'),(25,1,'Wild Forest Honey','wild-forest-honey','Raw, unfiltered multiflora forest honey',NULL,599.00,499.00,NULL,NULL,NULL,120,5,NULL,'500g','Ovlin',1,1,1,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-14 12:32:46','2026-07-14 12:32:46'),(26,1,'Himalayan Pink Salt','himalayan-pink-salt','Unprocessed mineral-rich rock salt',NULL,120.00,NULL,NULL,NULL,NULL,200,5,NULL,'1kg','Ovlin',1,0,0,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-14 12:32:46','2026-07-14 12:32:46'),(27,1,'Turmeric Powder','turmeric-powder','Single-origin, high curcumin turmeric',NULL,180.00,NULL,NULL,NULL,NULL,150,5,NULL,'200g','Ovlin',1,0,1,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-14 12:32:46','2026-07-14 12:32:46'),(28,1,'Coriander Cumin Blend','coriander-cumin-blend','Freshly ground dhania-jeera mix',NULL,150.00,NULL,NULL,NULL,NULL,130,5,NULL,'200g','Ovlin',1,0,0,1,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-14 12:32:46','2026-07-14 12:32:46'),(29,1,'Ghee Gift Box (2x250ml)','ghee-gift-box-2x250ml','Two jars of premium Bilona ghee — gift packed',NULL,1299.00,1099.00,NULL,NULL,NULL,40,5,NULL,'box','Ovlin',1,1,0,0,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-14 12:32:46','2026-07-14 12:32:46'),(30,1,'Millet Namkeen','millet-namkeen','Crispy, low-oil millet-based namkeen snack',NULL,199.00,NULL,NULL,NULL,NULL,90,5,NULL,'200g','Ovlin',1,0,1,1,0,0,0.00,NULL,NULL,NULL,NULL,'index,follow',NULL,NULL,'2026-07-14 12:32:46','2026-07-14 12:32:46');
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
  `customer_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `entity_type` enum('product','category','blog','page','url') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `url_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `og_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `robots` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'index,follow',
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
  `setting_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `setting_type` enum('text','textarea','image','json','boolean','number') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'text',
  `setting_group` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_site_setting` (`site_id`,`setting_key`),
  KEY `idx_site` (`site_id`),
  KEY `idx_group` (`setting_group`)
) ENGINE=InnoDB AUTO_INCREMENT=24860 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (6,1,'active_theme','default','text','general','2026-07-08 13:11:52'),(19,1,'admin_url','/admin/orders.php','text','general','2026-07-08 13:14:45'),(107,1,'payment_online_url','','text','payments','2026-07-08 13:14:45'),(122,1,'maintenance_mode','0','boolean','general','2026-07-08 13:14:45'),(134,1,'google_analytics_id','','text','seo','2026-07-08 13:14:45'),(138,1,'smtp_host','','text','email','2026-07-08 13:14:45'),(139,1,'smtp_port','587','number','email','2026-07-08 13:14:45'),(140,1,'smtp_encryption','tls','text','email','2026-07-08 13:14:45'),(141,1,'smtp_username','','text','email','2026-07-08 13:14:45'),(142,1,'smtp_password','','text','email','2026-07-08 13:14:45'),(143,1,'smtp_from_email','hello@example.com','text','email','2026-07-08 13:14:45'),(146,1,'email_enabled','1','boolean','email','2026-07-08 13:14:45'),(147,1,'whatsapp_enabled','0','boolean','email','2026-07-08 13:14:45'),(149,1,'whatsapp_api_key','','text','email','2026-07-08 13:14:45'),(285,1,'banner_schema_v2','1','text','system','2026-07-08 14:19:10'),(10905,1,'site_name','KaleGida','text','general','2026-07-19 15:15:13'),(10906,1,'site_tagline','Traditional Bilona Ghee','text','general','2026-07-14 14:16:12'),(10907,1,'site_description','OVLIN crafts premium A2 Bilona ghee the slow, traditional way — curd-churned by hand, simmered on a gentle flame and poured in small batches. Pure, lab-tested and delivered across India.','textarea','seo','2026-07-14 14:18:25'),(10908,1,'site_url','https://ovlin.in','text','general','2026-07-14 14:16:12'),(10909,1,'site_email','care@ovlin.in','text','general','2026-07-14 14:16:12'),(10910,1,'site_phone','','text','general','2026-07-14 14:16:12'),(10911,1,'site_address','India','textarea','general','2026-07-14 14:18:25'),(10912,1,'site_favicon','/uploads/branding/1784041336_73853ae6.png','image','general','2026-07-14 15:02:16'),(10913,1,'site_logo','/uploads/branding/1784041336_b3fb2563.png','image','general','2026-07-14 15:02:16'),(10914,1,'currency_symbol','₹','text','general','2026-07-14 14:16:12'),(10915,1,'currency_code','INR','text','general','2026-07-14 14:16:12'),(10916,1,'contact_email','care@ovlin.in','text','contact','2026-07-14 14:16:12'),(10917,1,'contact_phone','','text','contact','2026-07-14 14:16:12'),(10918,1,'contact_address','India','text','contact','2026-07-14 14:16:12'),(10919,1,'contact_hours','Mon–Sat: 10am–7pm IST','textarea','contact','2026-07-14 14:18:25'),(10920,1,'contact_map_embed','','textarea','contact','2026-07-14 14:18:25'),(10921,1,'business_city','','text','contact','2026-07-14 14:16:12'),(10922,1,'business_region','','text','contact','2026-07-14 14:16:12'),(10923,1,'business_country','India','text','contact','2026-07-14 14:16:12'),(10924,1,'smtp_from_name','OVLIN','text','email','2026-07-14 14:16:12'),(10925,1,'admin_email','care@ovlin.in','text','email','2026-07-14 14:16:12'),(10926,1,'shipping_free_above','699','number','shipping','2026-07-14 14:18:25'),(10927,1,'shipping_charge','49','number','shipping','2026-07-14 14:18:25'),(10928,1,'delivery_free_above','699','number','delivery','2026-07-14 14:18:25'),(10929,1,'delivery_free_enabled','1','boolean','delivery','2026-07-14 14:18:25'),(10930,1,'delivery_standard_fee','49','number','delivery','2026-07-14 14:18:25'),(10931,1,'delivery_standard_zone_label','Standard delivery','text','delivery','2026-07-14 14:16:12'),(10932,1,'delivery_local_fee','29','number','delivery','2026-07-14 14:18:25'),(10933,1,'delivery_local_zone_label','Express delivery','text','delivery','2026-07-14 14:16:12'),(10934,1,'delivery_small_order_enabled','0','boolean','delivery','2026-07-14 14:18:25'),(10935,1,'delivery_small_order_fee','0','number','delivery','2026-07-14 14:18:25'),(10936,1,'delivery_small_order_min','0','number','delivery','2026-07-14 14:18:25'),(10937,1,'delivery_local_keywords','','text','delivery','2026-07-14 14:16:12'),(10938,1,'delivery_local_postcode_prefixes','','text','delivery','2026-07-14 14:16:12'),(10939,1,'tax_percentage','0','number','tax','2026-07-14 14:18:25'),(10940,1,'header_offer_text','Free shipping on orders above ₹699 · Ships across India','text','header','2026-07-14 14:18:25'),(10941,1,'hero_eyebrow','The Traditional Bilona Method','text','homepage','2026-07-14 14:16:12'),(10942,1,'hero_title','Ghee, the way it was always meant to be.','text','homepage','2026-07-14 14:16:12'),(10943,1,'hero_subtitle','Whole desi-cow milk, set into curd, hand-churned and slow-simmered on a gentle flame — golden Bilona ghee in small, honest batches.','text','homepage','2026-07-14 14:16:12'),(10944,1,'hero_media_badge','Small batch','text','homepage','2026-07-14 14:16:12'),(10945,1,'hero_media_caption_title','Churned this week','text','homepage','2026-07-14 14:16:12'),(10946,1,'hero_media_caption_meta','Slow-simmered · Lab tested','text','homepage','2026-07-14 14:16:12'),(10947,1,'trust_item_1_text','Traditional Bilona method','text','homepage','2026-07-14 14:16:12'),(10948,1,'trust_item_2_text','A2 desi cow milk','text','homepage','2026-07-14 14:16:12'),(10949,1,'trust_item_3_text','Lab-tested purity','text','homepage','2026-07-14 14:16:12'),(10950,1,'trust_item_4_text','Small batches','text','homepage','2026-07-14 14:16:12'),(10951,1,'home_categories_label','The collection','text','homepage','2026-07-14 14:16:12'),(10952,1,'home_categories_title','Shop by category','text','homepage','2026-07-14 14:16:12'),(10953,1,'home_categories_link_text','All categories','text','homepage','2026-07-14 14:16:12'),(10954,1,'home_featured_label','The signature shelf','text','homepage','2026-07-14 14:16:12'),(10955,1,'home_featured_title','Featured by OVLIN','text','homepage','2026-07-14 14:16:12'),(10956,1,'home_featured_link_text','View all','text','homepage','2026-07-14 14:16:12'),(10957,1,'home_trending_label','Most loved','text','homepage','2026-07-14 14:16:12'),(10958,1,'home_trending_title','Our best sellers','text','homepage','2026-07-14 14:16:12'),(10959,1,'home_trending_link_text','View all','text','homepage','2026-07-14 14:16:12'),(10960,1,'home_new_label','Just poured','text','homepage','2026-07-14 14:16:12'),(10961,1,'home_new_title','New this season','text','homepage','2026-07-14 14:16:12'),(10962,1,'home_new_link_text','View all','text','homepage','2026-07-14 14:16:12'),(10963,1,'promise_label','Our promise','text','homepage','2026-07-14 14:16:12'),(10964,1,'promise_title','Why homes choose OVLIN','text','homepage','2026-07-14 14:16:12'),(10965,1,'promise_text','One method, no shortcuts — traditional Bilona ghee and honest Indian staples, tested for purity in every single batch.','textarea','homepage','2026-07-14 14:18:25'),(10966,1,'why_1_title','Traditional Bilona method','text','homepage','2026-07-14 14:16:12'),(10967,1,'why_1_text','Curd is churned both ways, the old way — never cream, never machines that rush it.','textarea','homepage','2026-07-14 14:18:25'),(10968,1,'why_2_title','A2 desi cow milk','text','homepage','2026-07-14 14:16:12'),(10969,1,'why_2_text','From native Indian cows raised on open pastures, milked with care.','textarea','homepage','2026-07-14 14:18:25'),(10970,1,'why_3_title','Lab-tested, every batch','text','homepage','2026-07-14 14:16:12'),(10971,1,'why_3_text','Each batch is tested for purity and adulterants before it is poured.','textarea','homepage','2026-07-14 14:18:25'),(10972,1,'why_4_title','Small batches only','text','homepage','2026-07-14 14:16:12'),(10973,1,'why_4_text','Slow heat and small vessels — flavour that mass production cannot copy.','textarea','homepage','2026-07-14 14:18:25'),(10974,1,'promo_1_label','The hero','text','homepage','2026-07-14 14:16:12'),(10975,1,'promo_1_title','A2 Bilona Ghee','text','homepage','2026-07-14 14:16:12'),(10976,1,'promo_1_text','Curd-churned, slow-simmered, golden to the last spoon.','textarea','homepage','2026-07-14 14:18:25'),(10977,1,'promo_1_button','Shop ghee','text','homepage','2026-07-14 14:16:12'),(10978,1,'promo_1_link','/categories','text','homepage','2026-07-14 14:16:12'),(10979,1,'promo_1_badge','','text','homepage','2026-07-14 14:16:12'),(10980,1,'promo_1_image','','image','homepage','2026-07-15 18:54:27'),(10981,1,'promo_2_label','From the farm','text','homepage','2026-07-14 14:16:12'),(10982,1,'promo_2_title','Cold-pressed & kitchen staples','text','homepage','2026-07-14 14:16:12'),(10983,1,'promo_2_text','Single-origin pantry essentials, made the old way.','textarea','homepage','2026-07-14 14:18:25'),(10984,1,'promo_2_button','Shop now','text','homepage','2026-07-14 14:16:12'),(10985,1,'promo_2_link','/categories','text','homepage','2026-07-14 14:16:12'),(10986,1,'promo_2_badge','','text','homepage','2026-07-14 14:16:12'),(10987,1,'promo_2_image','','image','homepage','2026-07-15 18:54:27'),(10988,1,'promo_3_label','Gifting','text','homepage','2026-07-14 14:16:12'),(10989,1,'promo_3_title','Festive & wellness hampers','text','homepage','2026-07-14 14:16:12'),(10990,1,'promo_3_text','Thoughtful boxes for homes that value purity.','textarea','homepage','2026-07-14 14:18:25'),(10991,1,'promo_3_button','Explore','text','homepage','2026-07-14 14:16:12'),(10992,1,'promo_3_link','/categories','text','homepage','2026-07-14 14:16:12'),(10993,1,'promo_3_badge','','text','homepage','2026-07-14 14:16:12'),(10994,1,'promo_3_image','','image','homepage','2026-07-15 18:54:27'),(10995,1,'featured_brands_label','Where to find us','text','homepage','2026-07-14 14:16:12'),(10996,1,'featured_brands_title','Loved across marketplaces','text','homepage','2026-07-14 14:16:12'),(10997,1,'featured_brands_link_text','Shop direct','text','homepage','2026-07-14 14:16:12'),(10998,1,'featured_brands_list','','textarea','homepage','2026-07-14 14:18:25'),(10999,1,'reviews_label','Reviews','text','homepage','2026-07-14 14:16:12'),(11000,1,'reviews_title','From kitchens across India','text','homepage','2026-07-14 14:16:12'),(11001,1,'review_1_name','Anjali M.','text','homepage','2026-07-14 14:16:12'),(11002,1,'review_1_location','Mumbai','text','homepage','2026-07-14 14:16:12'),(11003,1,'review_1_text','The aroma when you open the jar takes me straight back to my grandmother\'s kitchen. Danedar, golden and honest.','textarea','homepage','2026-07-14 14:18:25'),(11004,1,'review_2_name','Rohan S.','text','homepage','2026-07-14 14:16:12'),(11005,1,'review_2_location','Bengaluru','text','homepage','2026-07-14 14:16:12'),(11006,1,'review_2_text','You can taste the difference of the Bilona method. My morning rotis have never been happier.','textarea','homepage','2026-07-14 14:18:25'),(11007,1,'review_3_name','Kavitha R.','text','homepage','2026-07-14 14:16:12'),(11008,1,'review_3_location','Chennai','text','homepage','2026-07-14 14:16:12'),(11009,1,'review_3_text','We switched to OVLIN for my toddler and never looked back. The lab reports with every batch seal the trust.','textarea','homepage','2026-07-14 14:18:25'),(11010,1,'review_4_name','Harpreet K.','text','homepage','2026-07-14 14:16:12'),(11011,1,'review_4_location','Chandigarh','text','homepage','2026-07-14 14:16:12'),(11012,1,'review_4_text','Packed beautifully, arrived fast, and the ghee is the closest to homemade I have found in years.','textarea','homepage','2026-07-14 14:18:25'),(11013,1,'review_5_name','Devang P.','text','homepage','2026-07-14 14:16:12'),(11014,1,'review_5_location','Ahmedabad','text','homepage','2026-07-14 14:16:12'),(11015,1,'review_5_text','The granular texture and nutty aroma tell you it is real Bilona ghee. Worth every rupee.','textarea','homepage','2026-07-14 14:18:25'),(11016,1,'review_6_name','Ishita B.','text','homepage','2026-07-14 14:16:12'),(11017,1,'review_6_location','Kolkata','text','homepage','2026-07-14 14:16:12'),(11018,1,'review_6_text','From the jar to the little thank-you note, everything feels crafted. This is how food brands should be.','textarea','homepage','2026-07-14 14:18:25'),(11019,1,'footer_about','OVLIN crafts traditional Bilona ghee and premium Indian staples in small batches — pure ingredients, slow processes and lab-tested quality, delivered across India.','textarea','footer','2026-07-14 14:18:25'),(11020,1,'footer_copyright','© 2026 OVLIN. All rights reserved.','text','footer','2026-07-14 14:18:25'),(11021,1,'newsletter_title','A letter from the ghee room','text','footer','2026-07-14 14:18:25'),(11022,1,'newsletter_desc','Small-batch drops, recipes and rituals from the OVLIN kitchen — one short letter, once a month.','textarea','footer','2026-07-14 14:18:25'),(11023,1,'meta_title','OVLIN | Traditional A2 Bilona Ghee & Premium Indian Foods','text','seo','2026-07-14 14:16:12'),(11024,1,'meta_description','Shop OVLIN — traditional A2 Bilona ghee, hand-churned from desi cow curd and slow-simmered in small batches. Lab-tested purity, delivered across India.','textarea','seo','2026-07-14 14:18:25'),(11025,1,'meta_keywords','bilona ghee, A2 ghee, desi cow ghee, traditional ghee, pure ghee India, OVLIN, premium Indian foods','text','seo','2026-07-14 14:16:12'),(11026,1,'social_facebook','','text','social','2026-07-14 14:16:12'),(11027,1,'social_instagram','','text','social','2026-07-14 14:16:12'),(11028,1,'social_twitter','','text','social','2026-07-14 14:16:12'),(11029,1,'social_youtube','','text','social','2026-07-14 14:16:12'),(11030,1,'social_tiktok','','text','social','2026-07-14 14:16:12'),(11031,1,'social_whatsapp','','text','social','2026-07-14 14:16:12'),(11032,1,'social_linkedin','','text','social','2026-07-14 14:16:12'),(11033,1,'whatsapp_number','','text','email','2026-07-14 14:18:25'),(11034,1,'journey_title','The Bilona journey, A to Z.','text','general','2026-07-14 15:02:16'),(11035,1,'journey_subtitle','Eight patient steps. Zero shortcuts. This is how ghee was made in Indian homes for centuries — and exactly how we still make it.','text','general','2026-07-14 15:02:16'),(13780,1,'journey_eyebrow','','text','general','2026-07-14 15:02:16'),(13783,1,'journey_step_1_title','','text','general','2026-07-14 15:02:16'),(13784,1,'journey_step_1_copy','','text','general','2026-07-14 15:02:16'),(13785,1,'journey_step_1_image','','text','general','2026-07-14 15:02:16'),(13786,1,'journey_step_2_title','','text','general','2026-07-14 15:02:16'),(13787,1,'journey_step_2_copy','','text','general','2026-07-14 15:02:16'),(13788,1,'journey_step_2_image','','text','general','2026-07-14 15:02:16'),(13789,1,'journey_step_3_title','','text','general','2026-07-14 15:02:16'),(13790,1,'journey_step_3_copy','','text','general','2026-07-14 15:02:16'),(13791,1,'journey_step_3_image','','text','general','2026-07-14 15:02:16'),(13792,1,'journey_step_4_title','','text','general','2026-07-14 15:02:16'),(13793,1,'journey_step_4_copy','','text','general','2026-07-14 15:02:16'),(13794,1,'journey_step_4_image','','text','general','2026-07-14 15:02:16'),(13795,1,'journey_step_5_title','','text','general','2026-07-14 15:02:16'),(13796,1,'journey_step_5_copy','','text','general','2026-07-14 15:02:16'),(13797,1,'journey_step_5_image','','text','general','2026-07-14 15:02:16'),(13798,1,'journey_step_6_title','','text','general','2026-07-14 15:02:16'),(13799,1,'journey_step_6_copy','','text','general','2026-07-14 15:02:16'),(13800,1,'journey_step_6_image','','text','general','2026-07-14 15:02:16'),(13801,1,'journey_step_7_title','','text','general','2026-07-14 15:02:16'),(13802,1,'journey_step_7_copy','','text','general','2026-07-14 15:02:16'),(13803,1,'journey_step_7_image','','text','general','2026-07-14 15:02:16'),(13804,1,'journey_step_8_title','','text','general','2026-07-14 15:02:16'),(13805,1,'journey_step_8_copy','','text','general','2026-07-14 15:02:16'),(13806,1,'journey_step_8_image','','text','general','2026-07-14 15:02:16'),(13807,1,'home_farm_image_1','','text','homepage','2026-07-14 15:02:16'),(13808,1,'home_farm_image_2','','text','homepage','2026-07-14 15:02:16'),(13809,1,'home_lab_image','','text','homepage','2026-07-14 15:02:16'),(17092,1,'promo_order','1,2,3','text','homepage','2026-07-17 09:42:32'),(17093,1,'promo_3_enabled','1','text','homepage','2026-07-17 17:33:40'),(17162,1,'promo_1_enabled','1','text','homepage','2026-07-17 09:39:35'),(17163,1,'promo_2_enabled','1','text','homepage','2026-07-17 17:33:40'),(17165,1,'promo_1_image_mobile','','image','homepage','2026-07-17 09:39:35'),(17166,1,'promo_2_image_mobile','','image','homepage','2026-07-17 09:39:35'),(17167,1,'promo_3_image_mobile','','image','homepage','2026-07-17 09:39:35'),(17168,1,'promo_1_badge_color','#1e88a8','text','homepage','2026-07-19 17:15:08'),(17169,1,'promo_2_badge_color','#29b8d5','text','homepage','2026-07-19 17:15:08'),(17170,1,'promo_3_badge_color','#16708c','text','homepage','2026-07-19 17:15:08'),(17171,1,'promo_1_overlay_color','#0b1220','text','homepage','2026-07-19 17:15:08'),(17172,1,'promo_2_overlay_color','#101826','text','homepage','2026-07-17 09:39:35'),(17173,1,'promo_3_overlay_color','#12100b','text','homepage','2026-07-19 17:15:08'),(17174,1,'promo_1_overlay_opacity','44','text','homepage','2026-07-17 09:39:35'),(17175,1,'promo_2_overlay_opacity','40','text','homepage','2026-07-17 09:39:35'),(17176,1,'promo_3_overlay_opacity','42','text','homepage','2026-07-17 09:39:35'),(17177,1,'promo_1_height','','text','homepage','2026-07-17 09:39:35'),(17178,1,'promo_2_height','','text','homepage','2026-07-17 09:39:35'),(17179,1,'promo_3_height','','text','homepage','2026-07-17 09:39:35'),(20229,1,'google_site_verification','','text','general','2026-07-19 00:41:18'),(20230,1,'bing_site_verification','','text','general','2026-07-19 00:41:18'),(20231,1,'google_tag_manager_id','','text','general','2026-07-19 00:41:18'),(20907,1,'ai_image_api_key','','text','ai','2026-07-19 17:15:41'),(21068,1,'ai_image_provider','openai','text','ai','2026-07-19 17:15:41'),(21069,1,'ai_image_api_url','https://api.openai.com/v1/images/generations','text','ai','2026-07-19 17:15:41'),(21070,1,'ai_image_model','gpt-image-1','text','ai','2026-07-19 17:15:41'),(21071,1,'ai_image_size','1024x1024','text','ai','2026-07-19 15:08:25'),(21072,1,'ai_image_style_suffix','','textarea','ai','2026-07-19 15:08:25');
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
  `site_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `theme` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'default',
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `timezone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'UTC',
  `status` enum('active','maintenance','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
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
INSERT INTO `sites` VALUES (1,'Ovlin','localhost','default','USD','UTC','active','2026-07-08 13:11:51');
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
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-26 13:22:03
