#!/bin/bash

# --- Script Start ---
set -e # Exit immediately if a command exits with a non-zero status.

# The core 'docker run' command.
# This starts the container and executes all the test commands inside it.
docker run \
  --rm \
  -it \
  --workdir /app \
  --volume "$(pwd)/../..:/app" \
  --volume /app/node_modules \
  --env GITHUB_WORKSPACE="/app" \
  mcr.microsoft.com/playwright:v1.54.0 /bin/bash -c "
    set -e

    cd packages/visual-editor
    
    echo '--- Installing pnpm ---'
    npm install -g pnpm

    echo '--- Installing dependencies ---'
    pnpm i --frozen-lockfile --ignore-scripts

    echo '--- Running component tests ---'
    pnpm run test:components
"

echo ">>> Local test run finished. <<<"