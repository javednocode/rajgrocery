-- Product Migration System
-- Adds queue, logs, imported item tracking, and reusable column mappings.

CREATE TABLE IF NOT EXISTS `import_jobs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `batch_id` VARCHAR(64) NOT NULL,
  `method` ENUM('scraper','woocommerce','shopify','csv','xml') NOT NULL,
  `source_url` VARCHAR(500) DEFAULT NULL,
  `import_type` VARCHAR(50) DEFAULT 'entire',
  `duplicate_strategy` ENUM('skip','update','copy') DEFAULT 'skip',
  `status` ENUM('pending','running','completed','failed','rolled_back') DEFAULT 'pending',
  `total` INT DEFAULT 0,
  `processed` INT DEFAULT 0,
  `imported` INT DEFAULT 0,
  `updated` INT DEFAULT 0,
  `skipped` INT DEFAULT 0,
  `failed` INT DEFAULT 0,
  `options_json` LONGTEXT,
  `report_json` LONGTEXT,
  `started_at` DATETIME DEFAULT NULL,
  `finished_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_batch_id` (`batch_id`),
  KEY `idx_status` (`status`),
  KEY `idx_method` (`method`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `import_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `job_id` INT NOT NULL,
  `batch_id` VARCHAR(64) NOT NULL,
  `level` ENUM('info','success','warning','error') DEFAULT 'info',
  `message` TEXT NOT NULL,
  `context_json` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job_id` (`job_id`),
  KEY `idx_batch_id` (`batch_id`),
  CONSTRAINT `import_logs_job_fk` FOREIGN KEY (`job_id`) REFERENCES `import_jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `import_job_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `job_id` INT NOT NULL,
  `batch_id` VARCHAR(64) NOT NULL,
  `product_id` INT DEFAULT NULL,
  `source_url` VARCHAR(500) DEFAULT NULL,
  `source_sku` VARCHAR(150) DEFAULT NULL,
  `source_name` VARCHAR(255) DEFAULT NULL,
  `action` ENUM('imported','updated','skipped','failed') NOT NULL,
  `status` ENUM('ok','error') DEFAULT 'ok',
  `error` TEXT DEFAULT NULL,
  `image_paths_json` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job_id` (`job_id`),
  KEY `idx_batch_id` (`batch_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_source_sku` (`source_sku`),
  KEY `idx_source_url` (`source_url`),
  CONSTRAINT `import_items_job_fk` FOREIGN KEY (`job_id`) REFERENCES `import_jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `import_column_mappings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `method` ENUM('csv','xml') NOT NULL,
  `mapping_json` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_name_method` (`name`, `method`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
