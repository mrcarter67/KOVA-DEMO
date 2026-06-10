/**
 * KOVA AI Adapter
 * Switches between Claude API and local Llama 4 via Ollama
 * Set AI_PROVIDER=ollama in .env to use local models
 * Set AI_PROVIDER=claude (default) to use Anthropic Claude
 */

export type TaskType =
  | "scoring"      // → Scout 17B (fast)
  | "invoice"      // → Scout 17B (fast)
  | "card_scan"    // → Scout 17B (vision)
  | "personalize"  // → Scout 17B
  | "quoting"      // → Maverick (reasoning)
  | "estimating"   // → Maverick (reasoning)
  | "report"       // → Maverick (writing)
  | "query"        // → Maverick (data reasoning)
  | "agent"        // → Maverick (multi-turn)
  | "atlas";       // → Maverick (strategy)

// Which tasks route to Scout (fast) vs Maverick (powerful)
const SCOUT_TASKS: TaskType[] = ["scoring","invoice","card_scan","personalize"];
const MAVERICK_TASKS: TaskType[] = ["quoting","estimating","report","query","agent","atlas"];

function getModel(task: TaskType): string {
  const provider = process.env.AI_PROVIDER || "claude";
  if(provider !== "ollama") return "claude-sonnet-4-20250514";
  return SCOUT_TASKS.includes(task) ? "llama4-scout" : "llama4-maverick";
}

interface AIMessage { role: "user" | "assistant"; content: string; }

interface AICallParams {
  task: TaskType;
  system: string;
  messages: AIMessage[];
  maxTokens?: number;
}

export async function callAI(params: AICallParams): Promise<string> {
  const provider = process.env.AI_PROVIDER || "claude";

  if(provider === "ollama") {
    return callOllama(params);
  }
  return callClaude(params);
}

// ── CLAUDE (default — cloud, development) ────────────────────────────────────
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

// ── OLLAMA / LLAMA 4 (private — local production) ───────────────────────────
async function callOllama(params: AICallParams): Promise<string> {
  const model = getModel(params.task);
  const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  const body = {
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
  };

  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if(!res.ok) throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.message?.content || "";
}

// ── PROVIDER STATUS ───────────────────────────────────────────────────────────
export function getProviderInfo() {
  const provider = process.env.AI_PROVIDER || "claude";
  const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  return {
    provider,
    isLocal: provider === "ollama",
    ollamaUrl: provider === "ollama" ? ollamaUrl : null,
    scoutModel: provider === "ollama" ? "llama4-scout" : "claude-sonnet-4",
    maverickModel: provider === "ollama" ? "llama4-maverick" : "claude-sonnet-4",
  };
}
