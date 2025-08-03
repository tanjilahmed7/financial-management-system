#!/bin/bash

# Cleanup script for coin-compost-main integration
echo "Cleaning up integration files..."

# Remove the original coin-compost-main directory
if [ -d "coin-compost-main" ]; then
    echo "Removing original coin-compost-main directory..."
    rm -rf coin-compost-main
    echo "✅ Original coin-compost-main directory removed"
else
    echo "⚠️  coin-compost-main directory not found (already cleaned up)"
fi

# Remove cleanup script itself
echo "Removing cleanup script..."
rm -f cleanup-integration.sh

echo ""
echo "🎉 Integration cleanup complete!"
echo ""
echo "Your Laravel + Inertia.js + React financial management application is ready!"
echo "Access it at: http://localhost:8000/dashboard"
echo ""
echo "All components have been successfully integrated into:"
echo "- resources/js/Components/ui/ (shadcn/ui components)"
echo "- resources/js/Components/Financial/ (financial components)"
echo "- resources/js/Pages/ (Inertia.js pages)" 