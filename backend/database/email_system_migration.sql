-- ============================================================
-- Asian Food Cork - Email System Migration
-- Run this SQL on Hostinger MySQL database
-- ============================================================

-- Email queue (background send queue)
CREATE TABLE IF NOT EXISTS email_queue (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    order_id      INT NOT NULL,
    email_type    ENUM('order_placed','order_confirmed','order_shipped','order_delivered','order_cancelled','test') NOT NULL DEFAULT 'order_placed',
    recipient     VARCHAR(255) NOT NULL,
    subject       VARCHAR(500) NOT NULL,
    body_html     LONGTEXT,
    body_text     TEXT,
    attachments   JSON COMMENT 'Array of file paths to attach',
    status        ENUM('pending','processing','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
    attempts      TINYINT UNSIGNED NOT NULL DEFAULT 0,
    max_attempts  TINYINT UNSIGNED NOT NULL DEFAULT 3,
    error_message TEXT,
    scheduled_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at  DATETIME,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_order (order_id),
    INDEX idx_scheduled (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Email logs (permanent record of every send attempt)
CREATE TABLE IF NOT EXISTS email_logs (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    queue_id      INT,
    order_id      INT,
    email_type    VARCHAR(50),
    recipient     VARCHAR(255),
    subject       VARCHAR(500),
    status        ENUM('sent','failed') NOT NULL,
    smtp_response TEXT,
    error_message TEXT,
    pdf_path      VARCHAR(500),
    xml_path      VARCHAR(500),
    sent_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    INDEX idx_status (status),
    INDEX idx_sent (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Invoice tracking
CREATE TABLE IF NOT EXISTS invoices (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    order_id      INT NOT NULL UNIQUE,
    order_number  VARCHAR(50),
    pdf_path      VARCHAR(500),
    xml_path      VARCHAR(500),
    generated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Email settings (stored in site_settings, just add these keys)
INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES
('smtp_host',       'asianfoodcork.com',         'email'),
('smtp_port',       '465',                        'email'),
('smtp_encryption', 'ssl',                        'email'),
('smtp_username',   'orders@asianfoodcork.com',   'email'),
('smtp_password',   'Asianfoodcork@14',           'email'),
('smtp_from_email', 'orders@asianfoodcork.com',   'email'),
('smtp_from_name',  'Asian Food Cork',            'email'),
('admin_email',     'orders@asianfoodcork.com',   'email'),
('email_enabled',   '1',                          'email'),
('whatsapp_enabled','0',                          'email'),
('whatsapp_number', '',                           'email'),
('whatsapp_api_key','',                           'email');
