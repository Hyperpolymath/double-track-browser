#!/bin/bash

# Simple script to generate placeholder icons using ImageMagick
# Install ImageMagick: sudo apt-get install imagemagick (Linux) or brew install imagemagick (Mac)

set -e

ICONS_DIR="../icons"
SIZES=(16 32 48 128)

echo "Generating placeholder icons..."

for size in "${SIZES[@]}"; do
  output="${ICONS_DIR}/icon${size}.png"

  # Create a simple icon with two parallel tracks
  convert -size ${size}x${size} xc:none \
    -fill "#667eea" \
    -draw "roundrectangle $((size/6)),$((size/3)),$((size/3)),$((2*size/3)) $((size/10)),$((size/10))" \
    -draw "roundrectangle $((2*size/3)),$((size/3)),$((5*size/6)),$((2*size/3)) $((size/10)),$((size/10))" \
    "$output"

  echo "Created ${output}"
done

echo "Done! Placeholder icons created in ${ICONS_DIR}/"
echo ""
echo "NOTE: These are simple placeholders. For production, create proper icons using:"
echo "- Figma, Adobe Illustrator, or Inkscape"
echo "- Follow the design guidelines in icons/README.md"
echo "- Consider the 'double track' theme with modern styling"
