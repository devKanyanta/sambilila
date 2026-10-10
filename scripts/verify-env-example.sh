#!/usr/bin/env bash
# Verify sambilila/.env.example matches the env vars the code actually reads.
# Usage: bash scripts/verify-env-example.sh   (from repo root or anywhere)
set -u
cd "$(dirname "$0")/.."

# 1. Collect actual process.env.X reads from source (app, lib, analytics-server, prisma)
ACTUAL=$(grep -rhoE "process\.env\.[A-Z][A-Z0-9_]*" --include="*.ts" --include="*.tsx" --include="*.js" \
  app lib analytics-server prisma types 2>/dev/null | sed 's/^process\.env\.//' | sort -u)

# 2. Collect var names documented in .env.example (KEY=... lines)
DOCUMENTED=$(grep -oE "^[A-Z][A-Z0-9_]*=" .env.example | sed 's/=$//' | sort -u)

FAIL=0

echo "== In code but MISSING from .env.example =="
MISSING=$(comm -23 <(echo "$ACTUAL") <(echo "$DOCUMENTED"))
if [ -n "$MISSING" ]; then echo "$MISSING"; FAIL=1; else echo "(none)"; fi

echo
echo "== In .env.example but NOT read by any code =="
EXTRA=$(comm -13 <(echo "$ACTUAL") <(echo "$DOCUMENTED"))
if [ -n "$EXTRA" ]; then echo "$EXTRA"; FAIL=1; else echo "(none)"; fi

echo
echo "Actual reads: $(echo "$ACTUAL" | wc -l) vars | documented: $(echo "$DOCUMENTED" | wc -l) vars"
exit $FAIL
