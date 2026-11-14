#!/usr/bin/env bash
# Starts the application inside GitHub Codespaces (runs automatically when the codespace opens).
cd "$(dirname "$0")/.."
if curl -sf http://localhost:4000/api/health >/dev/null 2>&1; then
  echo "The application is already running. Open the 'Web application' port (5173) from the Ports tab."
  exit 0
fi
if [ ! -d server/node_modules ]; then npm run install:all; fi
if [ ! -f server/data-local/Users.json ] && [ -z "$GOOGLE_SHEET_ID" ]; then npm run seed:demo; fi
echo ""
echo "=============================================================="
echo " Starting the Technopreneurship Final Assessment system..."
echo " When the browser tab opens, sign in with:"
echo "   lecturer / Demo@2026      admin / Demo@2026"
echo "   students: DEMO-A001 ... DEMO-C003 / Demo@2026"
echo "=============================================================="
echo ""
npm run dev
