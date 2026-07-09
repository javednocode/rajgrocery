-- ═══════════════════════════════════════════════════════════════
-- Kale Gida — Country marketplace system
-- Countries are fully admin-managed. Products and categories are
-- assigned to one or more countries; banners can target a single
-- country (NULL = shown everywhere). One country is the default.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(8) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  flag VARCHAR(16) DEFAULT '',
  headline VARCHAR(255) DEFAULT '',
  subtext TEXT,
  suggestions VARCHAR(500) DEFAULT '',
  currency_symbol VARCHAR(8) DEFAULT '',
  currency_code VARCHAR(8) DEFAULT '',
  meta_title VARCHAR(255) DEFAULT '',
  meta_description TEXT,
  contact_email VARCHAR(190) DEFAULT '',
  contact_phone VARCHAR(64) DEFAULT '',
  contact_address VARCHAR(255) DEFAULT '',
  delivery_info VARCHAR(500) DEFAULT '',
  is_default TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_countries (
  product_id INT NOT NULL,
  country_id INT NOT NULL,
  PRIMARY KEY (product_id, country_id),
  KEY idx_pc_country (country_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS category_countries (
  category_id INT NOT NULL,
  country_id INT NOT NULL,
  PRIMARY KEY (category_id, country_id),
  KEY idx_cc_country (country_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Banners: optional single-country targeting (NULL = all countries)
ALTER TABLE banners ADD COLUMN country_id INT NULL AFTER position;

-- ── Seed: India (default), Turkey, Finland ──
INSERT INTO countries (code, name, flag, headline, subtext, suggestions, currency_symbol, currency_code, delivery_info, is_default, is_active, sort_order) VALUES
('in', 'India',   '🇮🇳', 'The spice route, delivered.',
 'Hand-ground masalas, heritage snacks and pantry staples from makers who never left the old recipes behind.',
 'Bhujia, Masala, Basmati rice, Papad, Namkeen', '₹', 'INR',
 'Delivery across all major Indian cities in 2–4 working days.', 1, 1, 1),
('tr', 'Turkey',  '🇹🇷', 'From the bazaars of Anatolia.',
 'Olives, dried figs, baklava and bazaar spices — the warmth of a Turkish pantry, packed with care.',
 'Baklava, Olives, Turkish tea, Dried figs, Simit', '₺', 'TRY',
 'Delivery across Turkey in 1–3 working days.', 0, 1, 2),
('fi', 'Finland', '🇫🇮', 'Nordic purity, harvested wild.',
 'Rye, wild berries and clean Nordic flavours — quietly perfected under the midnight sun.',
 'Rye bread, Cloudberry jam, Salmiakki, Coffee, Oats', '€', 'EUR',
 'Delivery across Finland in 1–3 working days.', 0, 1, 3);

-- ── Existing catalogue is Indian: assign everything to India ──
INSERT IGNORE INTO product_countries (product_id, country_id)
  SELECT p.id, c.id FROM products p JOIN countries c ON c.code = 'in';

INSERT IGNORE INTO category_countries (category_id, country_id)
  SELECT cat.id, c.id FROM categories cat JOIN countries c ON c.code = 'in';
