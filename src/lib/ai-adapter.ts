/**
 * KOVA AI Adapter — Unified AI Client
 * Routes to Claude API or local Llama 4 via Ollama
 * Switch with: AI_PROVIDER=ollama (local) or AI_PROVIDER=claude (default)
 */

export type TaskType =
  | "scoring"      // Scout — fast, structured extraction
  | "invoice"      // Scout — simple pre-fill
  | "card_scan"    // Scout — vision + field extraction
  | "personalize"  // Scout — short copy rewrite
  | "quoting"      // Maverick — multi-turn reasoning
  | "estimating"   // Maverick — calculations + reasoning
  | "report"       // Maverick — writing quality matters
  | "query"        // Maverick — data reasoning
  | "agent"        // Maverick — multi-turn agent conversations
  | "atlas"        // Maverick — onboarding + strategy
  | "financial"    // Maverick — financial analysis
  | "erp_agent";   // Maverick — ERP AI agents

const SCOUT_TASKS: TaskType[] = ["scoring", "invoice", "card_scan", "personalize"];

function getOllamaModel(task: TaskType): string {
  return SCOUT_TASKS.includes(task) ? "llama4-scout" : "llama4-maverick";
}

export interface AIMessage { role: "user" | "assistant"; content: string; }

export interface AICallParams {
  task: TaskType;
  system: string;
  messages: AIMessage[];
  maxTokens?: number;
}

// ── MAIN ENTRY POINT ────────────────────────────────────────────────────────
export async function callAI(params: AICallParams): Promise<string> {
  const provider = process.env.AI_PROVIDER || "claude";
  if (provider === "ollama") return callOllama(params);
  return callClaude(params);
}

// ── CLAUDE (cloud, development) ─────────────────────────────────────────────
async function callClaude(params: AICallParams): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: params.maxTokens || 800,
    system: params.system,
    messages: params.messages,
  });

  return (res.content[0] as any).text || "";
}

// ── OLLAMA / LLAMA 4 (private, local production) ────────────────────────────
async function callOllama(params: AICallParams): Promise<string> {
  const model = getOllamaModel(params.task);
  const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: params.system },
        ...params.messages,
      ],
      stream: false,
      options: {
        num_predict: params.maxTokens || 800,
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} — is Ollama running? Run: ./scripts/setup-ollama.sh`);
  }

  const data = await res.json();
  return data.message?.content || "";
}

// ── PROVIDER INFO ────────────────────────────────────────────────────────────
export function getProviderInfo() {
  const provider = process.env.AI_PROVIDER || "claude";
  return {
    provider,
    isLocal: provider === "ollama",
    ollamaUrl: provider === "ollama" ? (process.env.OLLAMA_BASE_URL || "http://localhost:11434") : null,
    scoutModel:    provider === "ollama" ? "llama4-scout"    : "claude-sonnet-4",
    maverickModel: provider === "ollama" ? "llama4-maverick" : "claude-sonnet-4",
  };
}
