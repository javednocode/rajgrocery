SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE banners DROP COLUMN country_id;
ALTER TABLE import_jobs DROP INDEX idx_country_id, DROP COLUMN country_id;
ALTER TABLE import_job_items DROP INDEX idx_country_id, DROP COLUMN country_id;

DROP TABLE IF EXISTS country_product_flags;
DROP TABLE IF EXISTS product_countries;
DROP TABLE IF EXISTS category_countries;
DROP TABLE IF EXISTS countries;

SET FOREIGN_KEY_CHECKS=1;
