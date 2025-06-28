#!/bin/bash

echo "Birth Plan Generator"
echo "==================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Install from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo ""

# Install and start
echo "Installing dependencies..."
npm install

echo ""
echo "Starting Birth Plan Generator..."
echo "Browser will open to http://localhost:3000"
echo ""

npm start
