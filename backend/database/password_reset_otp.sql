-- ════════════════════════════════════════════════════════════════════════
-- Password Reset OTP System
-- Stores one-time codes sent via email for customer self-service
-- password resets. Safe to run multiple times.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `password_reset_otps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `reset_token` VARCHAR(64) DEFAULT NULL,
  `expires_at` DATETIME NOT NULL,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `attempts` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_email_otp` (`email`, `otp`),
  INDEX `idx_reset_token` (`reset_token`),
  INDEX `idx_expires` (`expires_at`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Password reset OTP table ready.' AS status;
