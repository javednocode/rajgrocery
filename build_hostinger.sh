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

# Never ship ad-hoc local test scripts or dev logs — they're unauthenticated,
# web-accessible once deployed, and were only ever meant to be run from the
# CLI on a dev machine (one even runs a DB update with zero auth check).
echo "Excluding local test scripts and dev logs from the deploy bundle..."
rm -f hostinger_public_html/test_*.php
rm -f hostinger_public_html/*.log
rm -rf hostinger_public_html/tests

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
echo "Excluding general local uploads/ from the lightweight deploy bundle (server uploads are the source of truth)..."
rm -rf hostinger_public_html/uploads
mkdir -p hostinger_public_html/uploads
mkdir -p hostinger_public_html/uploads/payment_proofs
if [ -d "backend/uploads/qr" ]; then
    cp -R backend/uploads/qr hostinger_public_html/uploads/
fi

# Create backups directory on server with .htaccess protection
mkdir -p hostinger_public_html/backups
cp backups/.htaccess hostinger_public_html/backups/.htaccess 2>/dev/null || echo 'Deny from all' > hostinger_public_html/backups/.htaccess

echo "Copying frontend files..."
cp -R frontend/dist/frontend/browser/* hostinger_public_html/

echo "Applying custom htaccess..."
cp htaccess hostinger_public_html/.htaccess

echo "Zipping lightweight build (without general images)..."
rm -f hostinger_public_html.zip
cd hostinger_public_html
zip -rq ../hostinger_public_html.zip .
cd ..

echo "Creating full build package (with all uploads/images for initial Hostinger File Manager setup)..."
rm -rf rajgrocerystore-full-hostinger-build
cp -R hostinger_public_html rajgrocerystore-full-hostinger-build
cp -R backend/uploads/* rajgrocerystore-full-hostinger-build/uploads/ 2>/dev/null || true
rm -f rajgrocerystore-full-hostinger-build.zip
cd rajgrocerystore-full-hostinger-build
zip -rq ../rajgrocerystore-full-hostinger-build.zip .
cd ..

echo "Build complete!"
echo "  1) Lightweight build (does not overwrite existing server images): hostinger_public_html.zip"
echo "  2) Full build (includes all local images & uploads): rajgrocerystore-full-hostinger-build.zip"

