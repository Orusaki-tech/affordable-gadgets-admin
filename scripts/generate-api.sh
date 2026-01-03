#!/bin/bash
# Regenerate TypeScript API clients from openapi.yaml
# This should be run whenever the backend API changes

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "🔄 Regenerating API clients from openapi.yaml..."

# Check if openapi.yaml exists
if [ ! -f "openapi.yaml" ]; then
    echo "❌ Error: openapi.yaml not found in project root"
    echo "   Please copy the latest openapi.yaml from the backend repository"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate API clients
echo "🔧 Generating TypeScript API clients..."
npx openapi-typescript-codegen \
  --input ./openapi.yaml \
  --output ./src/api \
  --client axios

# Fix auth header (if fix script exists)
if [ -f "fix-auth-header.js" ]; then
    node fix-auth-header.js
fi

echo "✅ API clients regenerated successfully!"
echo "   Location: src/api/"
