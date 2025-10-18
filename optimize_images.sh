#!/bin/bash

# Image Optimization Script for Portfolio
# This will optimize all images for web while maintaining visual quality

echo "=== Starting Image Optimization ==="
echo "This will optimize images for web performance"
echo ""

# Counter
count=0
total_before=0
total_after=0

# Optimize JPG and JPEG files
echo "Optimizing JPG/JPEG files..."
find . -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read img; do
    if [ -f "$img" ]; then
        size=$(stat -c%s "$img" 2>/dev/null || stat -f%z "$img" 2>/dev/null)
        if [ "$size" -gt 1000 ]; then
            before=$size
            
            # Backup original
            cp "$img" "optimized_backup/$(basename "$img").original"
            
            # Optimize: resize if > 2000px width, compress to 85% quality
            convert "$img" -resize '2000x2000>' -quality 85 -strip "$img.tmp"
            
            if [ -f "$img.tmp" ]; then
                mv "$img.tmp" "$img"
                after=$(stat -c%s "$img" 2>/dev/null || stat -f%z "$img" 2>/dev/null)
                saved=$((before - after))
                if [ $before -gt 0 ]; then
                    percent=$((saved * 100 / before))
                    echo "  ✓ $(basename "$img"): ${before} → ${after} bytes (saved ${percent}%)"
                fi
            fi
        fi
    fi
done

# Optimize PNG files
echo ""
echo "Optimizing PNG files..."
find . -maxdepth 1 -type f -iname "*.png" | while read img; do
    if [ -f "$img" ]; then
        size=$(stat -c%s "$img" 2>/dev/null || stat -f%z "$img" 2>/dev/null)
        if [ "$size" -gt 1000 ]; then
            before=$size
            
            # Backup original
            cp "$img" "optimized_backup/$(basename "$img").original"
            
            # Optimize: resize if > 2000px width, quality 90
            convert "$img" -resize '2000x2000>' -quality 90 -strip "$img.tmp"
            
            if [ -f "$img.tmp" ]; then
                mv "$img.tmp" "$img"
                after=$(stat -c%s "$img" 2>/dev/null || stat -f%z "$img" 2>/dev/null)
                saved=$((before - after))
                if [ $before -gt 0 ] && [ $saved -gt 0 ]; then
                    percent=$((saved * 100 / before))
                    echo "  ✓ $(basename "$img"): ${before} → ${after} bytes (saved ${percent}%)"
                else
                    echo "  ✓ $(basename "$img"): already optimized"
                fi
            fi
        fi
    fi
done

echo ""
echo "=== Optimization Complete ==="
echo "Originals backed up to: optimized_backup/"
