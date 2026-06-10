"use client";
import { useState, useEffect } from "react";

interface RouteStatus {
  name: string;
  path: string;
  status: "idle"|"testing"|"ok"|"error";
  ms?: number;
  error?: string;
  response?: string;
}

const ROUTES: RouteStatus[] = [
  { name:"Lead Scoring",     path:"/api/score",       status:"idle" },
  { name:"Intelligence Report", path:"/api/report",   status:"idle" },
  { name:"NL Data Query",    path:"/api/query",       status:"idle" },
  { name:"Personalize",      path:"/api/personalize", status:"idle" },
  { name:"Atrium Agents",    path:"/api/agents",      status:"idle" },
  { name:"Atlas Onboarding", path:"/api/atlas",       status:"idle" },
  { name:"Card Scanner",     path:"/api/card-scan",   status:"idle" },
  { name:"Quote Agent",      path:"/api/quote-agent", status:"idle" },
  { name:"ERP Agent",        path:"/api/erp-agent",   status:"idle" },
  { name:"Financial AI",     path:"/api/financial",   status:"idle" },
];

const TEST_PAYLOADS: Record<string, any> = {
  "/api/score":       { contact:{ name:"Test Contact", company:"Test Co", vertical:"construction" }, vertical:"construction" },
  "/api/report":      { contacts:[{ name:"Sarah Mitchell", company:"Apex Realty" }], deals:[{ title:"Staging Deal", value:8000, stage:"Proposal Sent" }], vertical:"real_estate", companyName:"Apex Realty" },
  "/api/query":       { question:"Who should I follow up with today?", contacts:[{ name:"Marcus Rodriguez", lastContact:"3 days ago", score:85 }], deals:[], vertical:"construction" },
  "/api/personalize": { content:"Hi, I wanted to follow up on your recent quote.", contact:{ name:"Derek Mills", title:"Owner", company:"Gulf Coast HVAC" }, vertical:"construction" },
  "/api/agents":      { agentId:"maven", messages:[{ role:"user", content:"Hi, I run a small roofing company in Tampa." }], vertical:"construction" },
  "/api/atlas":       { messages:[{ role:"user", content:"I need help setting up my pipeline." }], vertical:"construction" },
  "/api/card-scan":   { imageBase64:"", mediaType:"image/jpeg" },
  "/api/quote-agent": { messages:[{ role:"user", content:"I need a quote for a roof replacement" }], docType:"quote", vertical:"construction" },
  "/api/erp-agent":   { agentType:"estimator", messages:[{ role:"user", content:"I need to estimate a commercial HVAC replacement" }] },
  "/api/financial":   { messages:[{ role:"user", content:"What is my cash position?" }], analysisType:"chat", financialData:{ revenue:102400, expenses:71200, cash:186400 } },
};

export default function APIStatus({ accentColor }: { accentColor: string }) {
  const [routes, setRoutes] = useState<RouteStatus[]>(ROUTES);
  const [providerInfo, setProviderInfo] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then(r => r.json())
      .then(d => setProviderInfo(d))
      .catch(() => {});
  }, []);

  const testRoute = async (route: RouteStatus) => {
    setRoutes(r => r.map(x => x.path === route.path ? { ...x, status:"testing" } : x));
    const start = Date.now();
    try {
      const payload = TEST_PAYLOADS[route.path];
      if (route.path === "/api/card-scan" && !payload.imageBase64) {
        setRoutes(r => r.map(x => x.path === route.path ? { ...x, status:"ok", ms: 0, response:"Skipped — requires image upload" } : x));
        return;
      }
      const res = await fetch(route.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const ms = Date.now() - start;
      if (data.error) {
        setRoutes(r => r.map(x => x.path === route.path ? { ...x, status:"error", ms, error: data.error } : x));
      } else {
        const response = data.message || data.report || data.answer || data.personalized || JSON.stringify(data).slice(0, 80) + "…";
        setRoutes(r => r.map(x => x.path === route.path ? { ...x, status:"ok", ms, response } : x));
      }
    } catch (e: any) {
      setRoutes(r => r.map(x => x.path === route.path ? { ...x, status:"error", ms: Date.now()-start, error: e.message } : x));
    }
  };

  const testAll = async () => {
    setTesting(true);
    for (const route of routes) {
      await testRoute(route);
      await new Promise(r => setTimeout(r, 400));
    }
    setTesting(false);
  };

  const P = accentColor;
  const okCount = routes.filter(r => r.status === "ok").length;
  const errCount = routes.filter(r => r.status === "error").length;

  return (
    <div>
      {/* Header */}
      <div style={{ background: "#0F172A", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>Claude API Status</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
              {providerInfo?.ai?.provider === "ollama" ? "🦙 Llama 4 via Ollama — Private" : "☁️ Claude API — Anthropic"}
              {providerInfo?.ai?.apiKeyPresent === false && <span style={{ color: "#EF4444", marginLeft: 8 }}>⚠ API key not set in environment</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {okCount > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>✓ {okCount} passing</span>}
            {errCount > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#EF4444" }}>✗ {errCount} errors</span>}
            <button onClick={testAll} disabled={testing} style={{ padding: "7px 16px", background: testing ? "#334155" : P, color: "#fff", border: "none", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: testing ? "not-allowed" : "pointer" }}>
              {testing ? "Testing…" : "Test All Routes"}
            </button>
          </div>
        </div>

        {/* Provider info */}
        {providerInfo && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              ["Provider", providerInfo.ai?.provider?.toUpperCase()],
              ["Scout Model", providerInfo.ai?.scoutModel],
              ["Maverick Model", providerInfo.ai?.maverickModel],
              ["API Key", providerInfo.ai?.apiKeyPresent ? "✓ Set" : "✗ Missing"],
            ].map(([l, v]) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.06)", padding: "5px 10px", borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: l === "API Key" && v === "✗ Missing" ? "#EF4444" : "#F1F5F9" }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Route list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {routes.map((route) => (
          <div key={route.path} style={{
            background: "#fff",
            border: `1px solid ${route.status === "ok" ? "#86EFAC" : route.status === "error" ? "#FCA5A5" : "#E2E8F0"}`,
            borderRadius: 9,
            padding: "10px 14px",
            borderLeft: `3px solid ${route.status === "ok" ? "#10B981" : route.status === "error" ? "#EF4444" : route.status === "testing" ? P : "#CBD5E1"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Status indicator */}
              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
                background: route.status === "ok" ? "#10B981" : route.status === "error" ? "#EF4444" : route.status === "testing" ? P + "33" : "#F1F5F9",
                color: route.status === "ok" || route.status === "error" ? "#fff" : route.status === "testing" ? P : "#94A3B8",
                fontWeight: 700,
              }}>
                {route.status === "ok" ? "✓" : route.status === "error" ? "✗" : route.status === "testing" ? "…" : "○"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: route.response || route.error ? 3 : 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{route.name}</span>
                  <code style={{ fontSize: 10, color: "#A78BFA", background: "#F5F3FF", padding: "1px 6px", borderRadius: 3 }}>{route.path}</code>
                  {route.ms !== undefined && (
                    <span style={{ fontSize: 10, color: route.ms < 1000 ? "#10B981" : route.ms < 3000 ? "#F59E0B" : "#EF4444", fontWeight: 600 }}>{route.ms}ms</span>
                  )}
                </div>
                {route.status === "ok" && route.response && (
                  <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.5 }}>{route.response.slice(0, 120)}{route.response.length > 120 ? "…" : ""}</div>
                )}
                {route.status === "error" && route.error && (
                  <div style={{ fontSize: 11, color: "#B91C1C", lineHeight: 1.5 }}>
                    {route.error.includes("API key") || route.error.includes("api_key") ? "⚠ API key not configured — set ANTHROPIC_API_KEY in Vercel or .env.local" : route.error}
                  </div>
                )}
              </div>

              <button onClick={() => testRoute(route)} disabled={route.status === "testing"} style={{ padding: "5px 12px", background: route.status === "testing" ? "#F1F5F9" : "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: route.status === "testing" ? "not-allowed" : "pointer", color: "#64748B", flexShrink: 0 }}>
                {route.status === "testing" ? "…" : "Test"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Setup guide */}
      <div style={{ marginTop: 12, padding: "12px 14px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 9 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#B45309", marginBottom: 5 }}>Quick Setup</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            ["Claude API (development)", "Add ANTHROPIC_API_KEY=sk-ant-... to .env.local or Vercel environment"],
            ["Llama 4 (private production)", "Run: ./scripts/setup-ollama.sh then set AI_PROVIDER=ollama in .env.local"],
            ["Switch providers", "Change AI_PROVIDER=claude or AI_PROVIDER=ollama — no other code changes needed"],
          ].map(([t, d]) => (
            <div key={t} style={{ fontSize: 11, color: "#92400E" }}>
              <strong>{t}:</strong> {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
