#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

if [ -f package.json ]; then
  npm install --no-fund --no-audit
fi

npm start
