#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo "  MyDash VPS — Service Status"
echo "================================================"

pm2 status 2>/dev/null || echo "No PM2 processes found."

echo ""

# ─── Check Ngrok URL ──────────────────────────────────────
NGROK_API="http://127.0.0.1:4040/api/tunnels"
NGROK_URL=""

if curl -s --max-time 3 "$NGROK_API" >/dev/null 2>&1; then
  NGROK_DATA=$(curl -s --max-time 3 "$NGROK_API" 2>/dev/null)

  # Try python3 first, fall back to grep
  if command -v python3 &>/dev/null; then
    NGROK_URL=$(echo "$NGROK_DATA" | python3 -c \
      "import sys,json; \
       tunnels = json.load(sys.stdin).get('tunnels', []); \
       public_urls = [t['public_url'] for t in tunnels if t.get('public_url')]; \
       print(public_urls[0] if public_urls else 'No public URL')" 2>/dev/null || true)
  elif command -v grep &>/dev/null; then
    NGROK_URL=$(echo "$NGROK_DATA" | grep -o '"public_url":"[^"]*"' | head -1 | sed 's/"public_url":"//;s/"//' 2>/dev/null || true)
  fi

  if [ -n "$NGROK_URL" ] && [ "$NGROK_URL" != "No public URL" ]; then
    echo "🔗 Ngrok URL: $NGROK_URL"
  else
    echo "⚠️  Ngrok tunnel is running but no public URL yet (may take a few seconds)"
  fi
else
  echo "⚠️  Ngrok API not available (use: pm2 logs mydash-ngrok to check)"
fi

echo ""

# ─── Check backend health ─────────────────────────────────
if curl -s --max-time 3 http://localhost:3000/health >/dev/null 2>&1; then
  HEALTH=$(curl -s --max-time 3 http://localhost:3000/health)
  echo "🟢 Backend: $HEALTH"
else
  echo "🔴 Backend: Not responding on port 3000"
fi

echo "================================================"
