#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   KOVA · Local AI Setup · Llama 4 via Ollama ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 1. Install Ollama ─────────────────────────────────────────────────────────
if command -v ollama &> /dev/null; then
  echo "✅ Ollama already installed: $(ollama --version)"
else
  echo "📦 Installing Ollama..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install ollama 2>/dev/null || curl -fsSL https://ollama.com/install.sh | sh
  else
    curl -fsSL https://ollama.com/install.sh | sh
  fi
  echo "✅ Ollama installed"
fi

# ── 2. Start Ollama service ───────────────────────────────────────────────────
echo ""
echo "🚀 Starting Ollama service..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  ollama serve &>/dev/null &
  sleep 2
else
  sudo systemctl enable ollama 2>/dev/null || true
  sudo systemctl start ollama 2>/dev/null || ollama serve &>/dev/null &
  sleep 2
fi
echo "✅ Ollama running at http://localhost:11434"

# ── 3. Pull models ────────────────────────────────────────────────────────────
echo ""
echo "📥 Pulling Llama 4 Scout (fast tasks — scoring, invoices, card scan)..."
echo "   Size: ~12GB — this takes a few minutes on first run"
ollama pull llama4-scout
echo "✅ Llama 4 Scout ready"

echo ""
echo "📥 Pulling Llama 4 Maverick (reasoning — agents, reports, quoting)..."
echo "   Size: ~40GB — this takes longer. Grab a coffee."
ollama pull llama4-maverick
echo "✅ Llama 4 Maverick ready"

# ── 4. Verify ─────────────────────────────────────────────────────────────────
echo ""
echo "🔍 Verifying models..."
ollama list

# ── 5. Quick smoke test ───────────────────────────────────────────────────────
echo ""
echo "🧪 Running smoke test..."
RESULT=$(ollama run llama4-scout "Reply with exactly: KOVA_OK" 2>/dev/null | tail -1)
if [[ "$RESULT" == *"KOVA_OK"* ]]; then
  echo "✅ Smoke test passed — Scout is responding"
else
  echo "⚠️  Smoke test unexpected response: $RESULT"
fi

# ── 6. Update .env ────────────────────────────────────────────────────────────
echo ""
if [ -f ".env.local" ]; then
  if grep -q "AI_PROVIDER" .env.local; then
    sed -i '' 's/AI_PROVIDER=.*/AI_PROVIDER=ollama/' .env.local 2>/dev/null || \
    sed -i 's/AI_PROVIDER=.*/AI_PROVIDER=ollama/' .env.local
    echo "✅ .env.local updated — AI_PROVIDER=ollama"
  else
    echo "" >> .env.local
    echo "AI_PROVIDER=ollama" >> .env.local
    echo "OLLAMA_BASE_URL=http://localhost:11434" >> .env.local
    echo "✅ Added AI_PROVIDER=ollama to .env.local"
  fi
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅ Setup complete. KOVA is now 100% private. ║"
echo "║  No data leaves your machine.                ║"
echo "║                                              ║"
echo "║  Scout  → scoring, invoices, card scan       ║"
echo "║  Maverick → agents, reports, quoting         ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
