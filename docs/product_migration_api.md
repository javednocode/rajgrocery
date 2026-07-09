# Product Migration API

Admin-only endpoints. Send `Authorization: Bearer <admin_token>` with every request.

## Create Job

`POST /api/product-migration/jobs`

Creates an import batch, discovers/parses products, stores them in a queue payload, and returns the created job.

Common fields:

```json
{
  "method": "scraper",
  "duplicate_strategy": "skip",
  "limit": 500
}
```

`duplicate_strategy` accepts:

- `skip`
- `update`
- `copy`

### Website Scraper

```json
{
  "method": "scraper",
  "source_url": "https://example.com",
  "import_type": "entire",
  "category_url": "",
  "product_url": "",
  "limit": 250
}
```

`import_type` accepts `entire`, `category`, or `single`.

### WooCommerce

```json
{
  "method": "woocommerce",
  "store_url": "https://oldstore.com",
  "consumer_key": "ck_xxx",
  "consumer_secret": "cs_xxx",
  "limit": 500
}
```

Uses `/wp-json/wc/v3/products`.

### Shopify

```json
{
  "method": "shopify",
  "store_url": "https://store.myshopify.com",
  "access_token": "shpat_xxx",
  "limit": 250
}
```

Uses Shopify Admin API `2024-04`.

### CSV/XLSX

Submit as `multipart/form-data`:

- `method=csv`
- `file=<csv|xlsx|xls>`
- `duplicate_strategy=skip`
- optional `mapping_name`
- optional `mapping` JSON, for example:

```json
{
  "name": "product_name",
  "price": "price",
  "description": "description",
  "images": "image_url",
  "categories": "category"
}
```

### XML Feed

```json
{
  "method": "xml",
  "xml_url": "https://example.com/feed.xml",
  "mapping": {
    "name": "title",
    "price": "price",
    "images": "image",
    "categories": "category"
  }
}
```

## Process Job

`POST /api/product-migration/jobs/{id}/process`

```json
{ "limit": 25 }
```

Processes the next chunk and returns updated progress. The admin UI loops this endpoint until status is `completed`.

## Job Status

`GET /api/product-migration/jobs/{id}`

Returns counters:

- `total`
- `processed`
- `imported`
- `updated`
- `skipped`
- `failed`
- `progress_percent`

## Logs

`GET /api/product-migration/jobs/{id}/logs?limit=300`

## History

`GET /api/product-migration/jobs`

## Report

`GET /api/product-migration/jobs/{id}/report`

Returns CSV with product-level actions and errors.

## Rollback

`POST /api/product-migration/jobs/{id}/rollback`

Deletes only products that were created by that import batch. Updated or skipped products are not deleted.

## Tables

- `import_jobs`
- `import_logs`
- `import_job_items`
- `import_column_mappings`

Schema files:

- `database/migrations/003_product_migration_system.sql`
- `backend/database/product_migration_system.sql`
