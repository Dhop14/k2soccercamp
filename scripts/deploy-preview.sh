#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/k2-preview}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"

cd "$APP_DIR"
git pull
npm install
npm run build
# Runtime secrets live in /etc/k2-preview/env (systemd), not only .env — see docs/DEPLOYMENT.md
systemctl restart k2-preview
sleep 2
systemctl is-active --quiet k2-preview
curl -sf -o /dev/null http://127.0.0.1:3000
echo "Deploy OK — preview app responding on port 3000"
