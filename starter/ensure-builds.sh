#!/bin/bash
# Ensure all packages are built before testing

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"

echo "🔨 Building all packages..."
echo "Script dir: $SCRIPT_DIR"
echo "Root dir: $ROOT_DIR"

# Build puck
echo "Building @measured/puck..."
cd "$ROOT_DIR/puck/packages/core"
yarn build
cd "$SCRIPT_DIR"

# Build pages
echo "Building @yext/pages..."
cd "$ROOT_DIR/pages/packages/pages"
pnpm build
cd "$SCRIPT_DIR"

# Build visual-editor
echo "Building @yext/visual-editor..."
cd "$ROOT_DIR/visual-editor/packages/visual-editor"
pnpm build
cd "$SCRIPT_DIR"

# Build starter
echo "Building starter..."
pnpm install && pnpm build

echo "✅ All packages built successfully!"
