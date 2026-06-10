import { NextResponse } from "next/server";
import { getProviderInfo } from "@/lib/ai-adapter";

export async function GET() {
  const provider = getProviderInfo();
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const hasOllama = provider.provider === "ollama";

  const routes = [
    { name: "score",       path: "/api/score",       method: "POST", status: "configured" },
    { name: "report",      path: "/api/report",       method: "POST", status: "configured" },
    { name: "query",       path: "/api/query",        method: "POST", status: "configured" },
    { name: "personalize", path: "/api/personalize",  method: "POST", status: "configured" },
    { name: "agents",      path: "/api/agents",       method: "POST", status: "configured" },
    { name: "atlas",       path: "/api/atlas",        method: "POST", status: "configured" },
    { name: "card-scan",   path: "/api/card-scan",    method: "POST", status: "configured" },
    { name: "quote-agent", path: "/api/quote-agent",  method: "POST", status: "configured" },
    { name: "erp-agent",   path: "/api/erp-agent",    method: "POST", status: "configured" },
  ];

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    ai: {
      provider: provider.provider,
      apiKeyPresent: hasKey,
      scoutModel: provider.scoutModel,
      maverickModel: provider.maverickModel,
      ollamaUrl: provider.ollamaUrl,
      ready: hasKey || hasOllama,
    },
    routes,
    version: "1.0.0",
  });
}
