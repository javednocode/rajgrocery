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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '68fe5540-178a-11f1-a91f-c9e82e2c5421:1-232379';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `country_product_flags`
--

LOCK TABLES `country_product_flags` WRITE;
/*!40000 ALTER TABLE `country_product_flags` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_registry`
--

LOCK TABLES `module_registry` WRITE;
/*!40000 ALTER TABLE `module_registry` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_sections`
--

LOCK TABLES `page_sections` WRITE;
/*!40000 ALTER TABLE `page_sections` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,1,'site_name','Kale Gida','text','general','2026-07-26 08:00:05'),(2,1,'site_tagline','Quality products delivered to your door.','text','general','2026-07-26 08:00:05'),(3,1,'site_description','An online store delivering quality products to your door.','textarea','seo','2026-07-26 08:00:05'),(4,1,'site_url','','text','general','2026-07-26 08:00:05'),(5,1,'admin_url','/admin/orders.php','text','general','2026-07-26 08:00:05'),(6,1,'site_logo','/logo.png','image','general','2026-07-26 08:00:05'),(7,1,'site_favicon','/favicon.ico','image','general','2026-07-26 08:00:05'),(8,1,'site_email','hello@kalegida.com','text','general','2026-07-26 08:00:05'),(9,1,'site_phone','','text','general','2026-07-26 08:00:05'),(10,1,'site_address','Configure store address in Admin Settings','textarea','general','2026-07-26 08:00:05'),(11,1,'business_city','','text','contact','2026-07-26 08:00:05'),(12,1,'business_region','','text','contact','2026-07-26 08:00:05'),(13,1,'business_country','GB','text','contact','2026-07-26 08:00:05'),(14,1,'contact_email','hello@kalegida.com','text','contact','2026-07-26 08:00:05'),(15,1,'contact_address','Configure store address in Admin Settings','text','contact','2026-07-26 08:00:05'),(16,1,'contact_hours','Mon–Sat: 9am–6pm | Sun: 10am–4pm','textarea','contact','2026-07-26 08:00:05'),(17,1,'contact_map_embed','','textarea','contact','2026-07-26 08:00:05'),(18,1,'contact_phone','','text','contact','2026-07-26 08:00:05'),(19,1,'footer_about','Your one-stop shop for quality products delivered to your door.','textarea','footer','2026-07-26 08:00:05'),(20,1,'footer_copyright','© 2026 Kale Gida. All rights reserved.','text','footer','2026-07-26 08:00:05'),(21,1,'newsletter_desc','Get exclusive deals, new arrivals and weekly offers delivered straight to your inbox.','textarea','footer','2026-07-26 08:00:05'),(22,1,'header_offer_text','Free delivery on orders over a minimum spend','text','header','2026-07-26 08:00:05'),(23,1,'hero_eyebrow','Quality products','text','homepage','2026-07-26 08:00:05'),(24,1,'hero_media_badge','Premium Selection','text','homepage','2026-07-26 08:00:05'),(25,1,'hero_media_caption_title','Fresh Picks','text','homepage','2026-07-26 08:00:05'),(26,1,'hero_media_caption_meta','Curated daily','text','homepage','2026-07-26 08:00:05'),(27,1,'trust_item_1_text','Quality Guaranteed','text','homepage','2026-07-26 08:00:05'),(28,1,'trust_item_2_text','Free Delivery Available','text','homepage','2026-07-26 08:00:05'),(29,1,'trust_item_3_text','Freshness Guaranteed','text','homepage','2026-07-26 08:00:05'),(30,1,'trust_item_4_text','Fast Dispatch','text','homepage','2026-07-26 08:00:05'),(31,1,'home_categories_label','Browse','text','homepage','2026-07-26 08:00:05'),(32,1,'home_categories_title','Shop by Category','text','homepage','2026-07-26 08:00:05'),(33,1,'home_categories_link_text','All Categories','text','homepage','2026-07-26 08:00:05'),(34,1,'home_featured_label','Bestsellers','text','homepage','2026-07-26 08:00:05'),(35,1,'home_featured_title','Featured Products','text','homepage','2026-07-26 08:00:05'),(36,1,'home_featured_link_text','View All','text','homepage','2026-07-26 08:00:05'),(37,1,'home_trending_label','Trending','text','homepage','2026-07-26 08:00:05'),(38,1,'home_trending_title','Best Sellers','text','homepage','2026-07-26 08:00:05'),(39,1,'home_trending_link_text','View All','text','homepage','2026-07-26 08:00:05'),(40,1,'featured_brands_label','Featured Brands','text','homepage','2026-07-26 08:00:05'),(41,1,'featured_brands_title','Trusted Grocery Brands','text','homepage','2026-07-26 08:00:05'),(42,1,'featured_brands_link_text','Shop Brands','text','homepage','2026-07-26 08:00:05'),(43,1,'featured_brands_list','Aashirvaad, Pillsbury, Everest, MDH, Ching\'s, Haldiram, India Gate','textarea','homepage','2026-07-26 08:00:05'),(44,1,'home_new_label','Just In','text','homepage','2026-07-26 08:00:05'),(45,1,'home_new_title','New Arrivals','text','homepage','2026-07-26 08:00:05'),(46,1,'home_new_link_text','View All','text','homepage','2026-07-26 08:00:05'),(47,1,'promo_1_label','Farm fresh','text','homepage','2026-07-26 08:00:05'),(48,1,'promo_1_title','Fresh Fruits & Vegetables','text','homepage','2026-07-26 08:00:05'),(49,1,'promo_1_text','Picked this morning, on your table today.','textarea','homepage','2026-07-26 08:00:05'),(50,1,'promo_1_button','Shop Now','text','homepage','2026-07-26 08:00:05'),(51,1,'promo_1_link','/categories','text','homepage','2026-07-26 08:00:05'),(52,1,'promo_1_image','/uploads/promos/fresh-produce.jpg','image','homepage','2026-07-26 08:00:05'),(53,1,'promo_1_badge','Up to 30% off','text','homepage','2026-07-26 08:00:05'),(54,1,'promo_2_label','Turkish bakery','text','homepage','2026-07-26 08:00:05'),(55,1,'promo_2_title','Börek, Künefe & Yufka','text','homepage','2026-07-26 08:00:05'),(56,1,'promo_2_text','Warm bakery and frozen classics, the proper way.','textarea','homepage','2026-07-26 08:00:05'),(57,1,'promo_2_button','Shop Now','text','homepage','2026-07-26 08:00:05'),(58,1,'promo_2_link','/categories','text','homepage','2026-07-26 08:00:05'),(59,1,'promo_2_image','/uploads/promos/turkish-bakery.jpg','image','homepage','2026-07-26 08:00:05'),(60,1,'promo_2_badge','New arrivals','text','homepage','2026-07-26 08:00:05'),(61,1,'promo_3_label','Daily essentials','text','homepage','2026-07-26 08:00:05'),(62,1,'promo_3_title','Atta, Rice, Masala & Snacks','text','homepage','2026-07-26 08:00:05'),(63,1,'promo_3_text','The Indian pantry, stocked in one order.','textarea','homepage','2026-07-26 08:00:05'),(64,1,'promo_3_button','Shop Now','text','homepage','2026-07-26 08:00:05'),(65,1,'promo_3_link','/categories','text','homepage','2026-07-26 08:00:05'),(66,1,'promo_3_image','/uploads/promos/indian-spices.jpg','image','homepage','2026-07-26 08:00:05'),(67,1,'promo_3_badge','Bundle & save','text','homepage','2026-07-26 08:00:05'),(68,1,'promo_order','1,2,3','text','homepage','2026-07-26 08:00:05'),(69,1,'promo_1_enabled','1','text','homepage','2026-07-26 08:00:05'),(70,1,'promo_2_enabled','1','text','homepage','2026-07-26 08:00:05'),(71,1,'promo_3_enabled','1','text','homepage','2026-07-26 08:00:05'),(72,1,'promo_1_image_mobile','','image','homepage','2026-07-26 08:00:05'),(73,1,'promo_2_image_mobile','','image','homepage','2026-07-26 08:00:05'),(74,1,'promo_3_image_mobile','','image','homepage','2026-07-26 08:00:05'),(75,1,'promo_1_badge_color','#1E88A8','text','homepage','2026-07-26 08:00:05'),(76,1,'promo_2_badge_color','#29B8D5','text','homepage','2026-07-26 08:00:05'),(77,1,'promo_3_badge_color','#16708C','text','homepage','2026-07-26 08:00:05'),(78,1,'promo_1_overlay_color','#0B1220','text','homepage','2026-07-26 08:00:05'),(79,1,'promo_2_overlay_color','#101826','text','homepage','2026-07-26 08:00:05'),(80,1,'promo_3_overlay_color','#12100B','text','homepage','2026-07-26 08:00:05'),(81,1,'promo_1_overlay_opacity','44','text','homepage','2026-07-26 08:00:05'),(82,1,'promo_2_overlay_opacity','40','text','homepage','2026-07-26 08:00:05'),(83,1,'promo_3_overlay_opacity','42','text','homepage','2026-07-26 08:00:05'),(84,1,'promo_1_height','','text','homepage','2026-07-26 08:00:05'),(85,1,'promo_2_height','','text','homepage','2026-07-26 08:00:05'),(86,1,'promo_3_height','','text','homepage','2026-07-26 08:00:05'),(87,1,'promise_label','Our Promise','text','homepage','2026-07-26 08:00:05'),(88,1,'promise_title','Why Customers Choose Us','text','homepage','2026-07-26 08:00:05'),(89,1,'promise_text','Configure this section from the Admin Settings panel to highlight your unique value proposition.','textarea','homepage','2026-07-26 08:00:05'),(90,1,'why_1_title','Quality Products','text','homepage','2026-07-26 08:00:05'),(91,1,'why_1_text','Update this feature in Admin Settings to describe your first key benefit.','textarea','homepage','2026-07-26 08:00:05'),(92,1,'why_2_title','Satisfaction Guaranteed','text','homepage','2026-07-26 08:00:05'),(93,1,'why_2_text','Update this feature in Admin Settings to describe your second key benefit.','textarea','homepage','2026-07-26 08:00:05'),(94,1,'why_3_title','Fast, Reliable Delivery','text','homepage','2026-07-26 08:00:05'),(95,1,'why_3_text','Update this feature in Admin Settings to describe your third key benefit.','textarea','homepage','2026-07-26 08:00:05'),(96,1,'why_4_title','Trusted by Customers','text','homepage','2026-07-26 08:00:05'),(97,1,'why_4_text','Update this feature in Admin Settings to describe your fourth key benefit.','textarea','homepage','2026-07-26 08:00:05'),(98,1,'reviews_label','Reviews','text','homepage','2026-07-26 08:00:05'),(99,1,'reviews_title','What Our Customers Say','text','homepage','2026-07-26 08:00:05'),(100,1,'review_1_name','Customer A.','text','homepage','2026-07-26 08:00:05'),(101,1,'review_1_location','City','text','homepage','2026-07-26 08:00:05'),(102,1,'review_1_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-26 08:00:05'),(103,1,'review_2_name','Customer B.','text','homepage','2026-07-26 08:00:05'),(104,1,'review_2_location','City','text','homepage','2026-07-26 08:00:05'),(105,1,'review_2_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-26 08:00:05'),(106,1,'review_3_name','Customer C.','text','homepage','2026-07-26 08:00:05'),(107,1,'review_3_location','City','text','homepage','2026-07-26 08:00:05'),(108,1,'review_3_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-26 08:00:05'),(109,1,'review_4_name','Customer D.','text','homepage','2026-07-26 08:00:05'),(110,1,'review_4_location','City','text','homepage','2026-07-26 08:00:05'),(111,1,'review_4_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-26 08:00:05'),(112,1,'review_5_name','Customer E.','text','homepage','2026-07-26 08:00:05'),(113,1,'review_5_location','City','text','homepage','2026-07-26 08:00:05'),(114,1,'review_5_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-26 08:00:05'),(115,1,'review_6_name','Customer F.','text','homepage','2026-07-26 08:00:05'),(116,1,'review_6_location','City','text','homepage','2026-07-26 08:00:05'),(117,1,'review_6_text','Update this review from the Admin Settings panel to show a real customer testimonial.','textarea','homepage','2026-07-26 08:00:05'),(118,1,'payment_online_url','','text','payments','2026-07-26 08:00:05'),(119,1,'social_facebook','','text','social','2026-07-26 08:00:05'),(120,1,'social_instagram','','text','social','2026-07-26 08:00:05'),(121,1,'social_twitter','','text','social','2026-07-26 08:00:05'),(122,1,'social_youtube','','text','social','2026-07-26 08:00:05'),(123,1,'social_tiktok','','text','social','2026-07-26 08:00:05'),(124,1,'social_whatsapp','','text','social','2026-07-26 08:00:05'),(125,1,'social_linkedin','','text','social','2026-07-26 08:00:05'),(126,1,'shipping_free_above','50','number','shipping','2026-07-26 08:00:05'),(127,1,'shipping_charge','4.99','number','shipping','2026-07-26 08:00:05'),(128,1,'tax_percentage','0','number','tax','2026-07-26 08:00:05'),(129,1,'currency_symbol','$','text','general','2026-07-26 08:00:05'),(130,1,'currency_code','USD','text','general','2026-07-26 08:00:05'),(131,1,'active_theme','default','text','general','2026-07-26 08:00:05'),(132,1,'newsletter_title','Stay in the loop','text','footer','2026-07-26 08:00:05'),(133,1,'maintenance_mode','0','boolean','general','2026-07-26 08:00:05'),(134,1,'delivery_free_above','50','number','delivery','2026-07-26 08:00:05'),(135,1,'delivery_free_enabled','1','boolean','delivery','2026-07-26 08:00:05'),(136,1,'delivery_local_fee','2.95','number','delivery','2026-07-26 08:00:05'),(137,1,'delivery_standard_fee','4.95','number','delivery','2026-07-26 08:00:05'),(138,1,'delivery_small_order_min','25','number','delivery','2026-07-26 08:00:05'),(139,1,'delivery_small_order_fee','1.50','number','delivery','2026-07-26 08:00:05'),(140,1,'delivery_small_order_enabled','1','boolean','delivery','2026-07-26 08:00:05'),(141,1,'delivery_local_zone_label','Local delivery','text','delivery','2026-07-26 08:00:05'),(142,1,'delivery_standard_zone_label','Standard delivery','text','delivery','2026-07-26 08:00:05'),(143,1,'delivery_local_keywords','','text','delivery','2026-07-26 08:00:05'),(144,1,'delivery_local_postcode_prefixes','','text','delivery','2026-07-26 08:00:05'),(145,1,'google_analytics_id','','text','seo','2026-07-26 08:00:05'),(146,1,'meta_title','Kale Gida — Online Shop','text','seo','2026-07-26 08:00:05'),(147,1,'meta_description','Shop quality products online. Configure this description in Admin Settings.','textarea','seo','2026-07-26 08:00:05'),(148,1,'meta_keywords','online store, ecommerce, quality products','text','seo','2026-07-26 08:00:05'),(149,1,'smtp_host','','text','email','2026-07-26 08:00:05'),(150,1,'smtp_port','587','number','email','2026-07-26 08:00:05'),(151,1,'smtp_encryption','tls','text','email','2026-07-26 08:00:05'),(152,1,'smtp_username','','text','email','2026-07-26 08:00:05'),(153,1,'smtp_password','','text','email','2026-07-26 08:00:05'),(154,1,'smtp_from_email','hello@kalegida.com','text','email','2026-07-26 08:00:05'),(155,1,'smtp_from_name','Kale Gida','text','email','2026-07-26 08:00:05'),(156,1,'admin_email','hello@kalegida.com','text','email','2026-07-26 08:00:05'),(157,1,'email_enabled','1','boolean','email','2026-07-26 08:00:05'),(158,1,'whatsapp_enabled','0','boolean','email','2026-07-26 08:00:05'),(159,1,'whatsapp_number','','text','email','2026-07-26 08:00:05'),(160,1,'whatsapp_api_key','','text','email','2026-07-26 08:00:05'),(161,1,'ai_image_provider','openai','text','ai','2026-07-26 08:00:05'),(162,1,'ai_image_api_url','https://api.openai.com/v1/images/generations','text','ai','2026-07-26 08:00:05'),(163,1,'ai_image_model','gpt-image-1','text','ai','2026-07-26 08:00:05'),(164,1,'ai_image_size','1024x1024','text','ai','2026-07-26 08:00:05'),(165,1,'ai_image_style_suffix','','textarea','ai','2026-07-26 08:00:05'),(166,1,'ai_image_api_key','','text','ai','2026-07-26 08:00:05');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sites`
--

LOCK TABLES `sites` WRITE;
/*!40000 ALTER TABLE `sites` DISABLE KEYS */;
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

-- Dump completed on 2026-07-26 13:44:13
