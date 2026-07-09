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
