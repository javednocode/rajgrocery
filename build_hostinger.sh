#!/bin/bash
set -e
echo "Starting Hostinger build..."

# Get current directory and ensure we're at project root
cd "$(dirname "$0")"
echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Setting up build directory..."
rm -rf hostinger_public_html
mkdir -p hostinger_public_html

echo "Copying backend files..."
cp -R backend/* hostinger_public_html/
cp backend/.htaccess hostinger_public_html/ 2>/dev/null || true
cp backend/.user.ini hostinger_public_html/ 2>/dev/null || true

# Never ship this machine's local uploads/ — it is not the source of truth.
# Real product/category/banner/promo/logo images get uploaded directly on
# the LIVE server through the admin panel and only ever exist there. If a
# deploy overwrites the server's uploads/ with whatever (usually stale or
# placeholder) files happen to be sitting in this local checkout, every
# image an admin has uploaded since the last sync gets silently wiped —
# the database still points at the right filenames, but the files are
# gone, so the frontend falls back to its placeholder art. Every upload
# handler in helpers/upload.php (and the promo banner uploader) creates
# its target folder on first use, so shipping an empty uploads/ tree is
# safe — nothing depends on it being pre-populated.
echo "Excluding local uploads/ from the deploy bundle (server uploads are the source of truth)..."
rm -rf hostinger_public_html/uploads
mkdir -p hostinger_public_html/uploads

echo "Copying frontend files..."
cp -R frontend/dist/frontend/browser/* hostinger_public_html/

echo "Applying custom htaccess..."
cp htaccess hostinger_public_html/.htaccess

echo "Zipping build..."
rm -f hostinger_public_html.zip
cd hostinger_public_html
zip -rq ../hostinger_public_html.zip .
cd ..

echo "Build complete! Upload hostinger_public_html.zip to Hostinger public_html directory."
