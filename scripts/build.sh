#!/bin/bash

# Build script for DoubleTrack Browser
# This script handles the complete build process

set -e  # Exit on error

echo "🔨 Building DoubleTrack Browser..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || {
    echo -e "${RED}❌ Node.js is required but not installed.${NC}" >&2
    echo "Install from: https://nodejs.org/"
    exit 1
}

command -v cargo >/dev/null 2>&1 || {
    echo -e "${RED}❌ Rust is required but not installed.${NC}" >&2
    echo "Install from: https://rustup.rs/"
    exit 1
}

command -v wasm-pack >/dev/null 2>&1 || {
    echo -e "${RED}❌ wasm-pack is required but not installed.${NC}" >&2
    echo "Install: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh"
    exit 1
}

echo -e "${GREEN}✓ All prerequisites found${NC}"
echo ""

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Build Rust core
echo "🦀 Building Rust core (WASM)..."
cd rust_core
wasm-pack build --target web --release

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Rust core built successfully${NC}"
else
    echo -e "${RED}❌ Rust build failed${NC}"
    exit 1
fi

cd ..
echo ""

# Build TypeScript extension
echo "📦 Building TypeScript extension..."
npm run build:extension

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Extension built successfully${NC}"
else
    echo -e "${RED}❌ Extension build failed${NC}"
    exit 1
fi

echo ""

# Check output
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Build complete!${NC}"
    echo ""
    echo "📁 Build output in: dist/"
    echo ""
    echo "Next steps:"
    echo "  1. Open chrome://extensions/ (or about:debugging in Firefox)"
    echo "  2. Enable Developer Mode"
    echo "  3. Click 'Load unpacked' and select the 'dist' folder"
    echo ""
    echo "Build summary:"
    echo "  • Rust core: $(ls -lh rust_core/pkg/*.wasm 2>/dev/null | awk '{print $5}' | head -1) WASM"
    echo "  • Files in dist/: $(ls -1 dist/ | wc -l)"
    echo ""
else
    echo -e "${RED}❌ Build failed - dist/ directory not found${NC}"
    exit 1
fi
