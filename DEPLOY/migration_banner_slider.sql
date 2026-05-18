-- Asian Food Cork — Migration: Banner Slider Updates
-- Run this on your Hostinger MySQL database

-- 1. Add button_color column if it doesn't exist
ALTER TABLE banners ADD COLUMN IF NOT EXISTS button_color VARCHAR(30) DEFAULT '#e06400' AFTER button_text;

-- 2. Verify final banners table structure
DESCRIBE banners;
