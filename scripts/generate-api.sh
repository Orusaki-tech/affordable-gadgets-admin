#!/bin/bash
# Regenerate TypeScript API clients from openapi.yaml
# This should be run whenever the backend API changes

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "🔄 Regenerating shared API client from backend openapi.yaml..."

# Check if openapi.yaml exists
if [ ! -f "../affordable-gadgets-backend/openapi.yaml" ]; then
    echo "❌ Error: openapi.yaml not found in backend repository"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate API clients (shared package)
echo "🔧 Generating TypeScript API clients..."
cd ../packages/api-client
npm install
npm run generate
npm run build

echo "✅ API client regenerated successfully!"
echo "   Location: packages/api-client/"
