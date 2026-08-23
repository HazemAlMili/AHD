#!/bin/sh
set -eu

cd /workspace
pnpm install --offline --frozen-lockfile --node-linker=hoisted --store-dir=/pnpm/store --ignore-scripts
exec "$@"
