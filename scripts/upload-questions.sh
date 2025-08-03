#!/bin/bash

# MARA+ Questions Upload Script
# Usage: ./upload-questions.sh [--mock]

echo "🚀 MARA+ Study Mode Questions Upload"
echo "===================================="
echo ""

if [[ "$1" == "--mock" ]]; then
    echo "Running in MOCK MODE (no actual Firebase uploads)"
    node scripts/firebase-uploader.js --mock
else
    echo "Running LIVE MODE (uploading to Firebase)"
    echo "⚠️  WARNING: This will upload to production Firestore!"
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        node scripts/firebase-uploader.js
    else
        echo "Upload cancelled."
        exit 1
    fi
fi