#!/bin/bash

# Build script for Tizen TV app
# Usage: ./build-tizen.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIZEN_DIR="$SCRIPT_DIR"
OUTPUT_DIR="$TIZEN_DIR/output"

echo "🔨 Building Angular app for Tizen..."

# Step 1: Build Angular app
cd "$PROJECT_DIR"
npm run build -- --base-href="./" --output-path="$OUTPUT_DIR"

# Step 2: Copy Tizen config files
echo "📦 Copying Tizen configuration..."
cp "$TIZEN_DIR/config.xml" "$OUTPUT_DIR/"

# Step 3: Create a simple icon if none exists
if [ ! -f "$OUTPUT_DIR/icon.png" ]; then
    echo "⚠️  No icon.png found. Please add a 512x512 icon.png to tizen/output/"
    # Create placeholder using ImageMagick if available
    if command -v convert &> /dev/null; then
        convert -size 512x512 xc:#1a1a2e -fill white -gravity center -pointsize 72 -annotate 0 "IPTV" "$OUTPUT_DIR/icon.png"
        echo "✅ Created placeholder icon"
    fi
fi

echo ""
echo "✅ Build complete! Output in: $OUTPUT_DIR"
echo ""
echo "📺 Next steps to install on your Samsung TV:"
echo ""
echo "1. Install Tizen Studio from: https://developer.tizen.org/development/tizen-studio/download"
echo ""
echo "2. Enable Developer Mode on your TV:"
echo "   - Go to Apps → Press 1-2-3-4-5 on remote → Enable Developer Mode"
echo "   - Enter your computer's IP address"
echo "   - Restart TV"
echo ""
echo "3. Connect to TV from Tizen Studio:"
echo "   - Device Manager → Remote Device Manager → Add your TV's IP"
echo ""
echo "4. Create certificate (first time only):"
echo "   - Tools → Certificate Manager → Create Samsung certificate"
echo ""
echo "5. Build & Run:"
echo "   - File → Import → Tizen Project → Select: $OUTPUT_DIR"
echo "   - Right-click project → Run As → Tizen Web Application"
echo ""
