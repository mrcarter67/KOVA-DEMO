"use client";
import { useState, useRef } from "react";
import { VERTICAL_CONFIG } from "@/lib/data";
import { Send, Check, Sparkles, FileSpreadsheet, FileText, GitBranch } from "lucide-react";
import { IE } from "@/lib/icon-mode";

interface LineItem {
  id: string; description: string; qty: number; unit: string; price: number; category: string;
}

interface EstimateData {
  title: string; contact: string; company: string; email: string;
  validDays: number; contingency: number; startDate: string; duration: string;
  lines: LineItem[]; tax: number; notes: string; terms: string;
}

interface AgentMessage { role: "user" | "assistant"; text: string; }

interface SavedEstimate {
  title: string; contact: string; company: string; email: string;
  lines: { id: string; description: string; qty: number; unit: string; price: number }[];
  tax: number; notes: string; terms: string; total: number;
}

interface Props {
  vertId: string;
  onAddToPipeline?: (deal: { title: string; co: string; contact: string; val: number }) => void;
  onSave?: (data: SavedEstimate) => void;
}

function fmtCurrency(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const STARTER_PROMPTS = [
  "Help me build a roofing estimate for a 2,400 sq ft house",
  "Create an estimate for a kitchen remodel",
  "Build an IT infrastructure estimate for a mid-size office",
  "Draft a landscaping estimate for commercial property",
];

const AGENT_REPLIES: Record<string, { text: string; prefill?: Partial<EstimateData> }> = {
  "roofing": {
    text: "I'll pre-fill a standard roofing estimate for a 2,400 sq ft house. I've added tear-off, underlayment, shingles, flashing, and cleanup. Adjust quantities based on your roof pitch and any dormers.",
    prefill: {
      title: "Roof Replacement — 2,400 sq ft Residential",
      validDays: 14,
      contingency: 10,
      duration: "3–5 days",
      lines: [
        { id: "l1", description: "Remove & dispose of existing roofing (2 layers max)", qty: 24, unit: "sq", price: 85, category: "Labor" },
        { id: "l2", description: "30-yr architectural shingles — GAF Timberline HDZ", qty: 24, unit: "sq", price: 165, category: "Materials" },
        { id: "l3", description: "Synthetic felt underlayment (2 layers)", qty: 24, unit: "sq", price: 22, category: "Materials" },
        { id: "l4", description: "Ridge cap & ventilation", qty: 1, unit: "job", price: 380, category: "Materials" },
        { id: "l5", description: "Drip edge, step flashing, pipe boots", qty: 1, unit: "job", price: 420, category: "Materials" },
        { id: "l6", description: "Labor — installation crew (2 days)", qty: 2, unit: "day", price: 980, category: "Labor" },
        { id: "l7", description: "Dumpster & cleanup", qty: 1, unit: "job", price: 350, category: "Other" },
      ],
      terms: "50% deposit to schedule. Balance due on completion. Warranty: 10-year labor, 30-year manufacturer.",
    }
  },
  "kitchen": {
    text: "Here's a kitchen remodel estimate framework. I've included demo, cabinet installation, countertops, backsplash, and appliance hook-ups. Adjust scope based on footprint and material selections.",
    prefill: {
      title: "Kitchen Remodel — Mid-Range",
      validDays: 30,
      contingency: 15,
      duration: "3–5 weeks",
      lines: [
        { id: "l1", description: "Demo & disposal — existing cabinets, counters", qty: 1, unit: "job", price: 1800, category: "Labor" },
        { id: "l2", description: "Cabinet installation — 20 linear ft", qty: 20, unit: "lf", price: 320, category: "Labor" },
        { id: "l3", description: "Quartz countertops — 45 sq ft installed", qty: 45, unit: "sf", price: 88, category: "Materials" },
        { id: "l4", description: "Tile backsplash — supply & install", qty: 32, unit: "sf", price: 22, category: "Materials" },
        { id: "l5", description: "Plumbing rough-in & fixture installation", qty: 1, unit: "job", price: 1200, category: "Sub" },
        { id: "l6", description: "Electrical — outlets, under-cabinet lighting", qty: 1, unit: "job", price: 850, category: "Sub" },
        { id: "l7", description: "Painting — walls & trim", qty: 1, unit: "job", price: 680, category: "Labor" },
      ],
      terms: "30% deposit on contract. 40% at cabinet delivery. 30% on completion. Change orders billed at standard rate.",
    }
  },
  "it": {
    text: "Here's an IT infrastructure estimate for a 25-person office. I've broken it into hardware, software, installation, and first-year support. Adjust seat counts and storage as needed.",
    prefill: {
      title: "IT Infrastructure Deployment — 25-User Office",
      validDays: 30,
      contingency: 8,
      duration: "1–2 weeks",
      lines: [
        { id: "l1", description: "Managed switch — 48-port PoE (Cisco)", qty: 1, unit: "ea", price: 2400, category: "Hardware" },
        { id: "l2", description: "Wireless access points — Ubiquiti U6-Pro", qty: 4, unit: "ea", price: 480, category: "Hardware" },
        { id: "l3", description: "Firewall / UTM appliance", qty: 1, unit: "ea", price: 1850, category: "Hardware" },
        { id: "l4", description: "NAS storage — 20TB usable (RAID 5)", qty: 1, unit: "ea", price: 3200, category: "Hardware" },
        { id: "l5", description: "Microsoft 365 Business Standard — 25 seats", qty: 25, unit: "user/yr", price: 180, category: "Software" },
        { id: "l6", description: "Network installation & configuration", qty: 1, unit: "job", price: 2800, category: "Labor" },
        { id: "l7", description: "Managed IT support — first year", qty: 12, unit: "month", price: 480, category: "Support" },
      ],
      terms: "50% on hardware order. Balance on go-live. Annual support billed monthly after the first year.",
    }
  },
  "landscaping": {
    text: "Here's a commercial landscaping estimate. I've included lawn care, mulch beds, shrub installation, and seasonal clean-up. Scale quantities to your property size.",
    prefill: {
      title: "Commercial Landscaping — Grounds Maintenance & Refresh",
      validDays: 21,
      contingency: 10,
      duration: "1 week + ongoing",
      lines: [
        { id: "l1", description: "Lawn aeration & overseeding", qty: 1, unit: "job", price: 480, category: "Labor" },
        { id: "l2", description: "Mulch installation — 4\" depth", qty: 18, unit: "yard", price: 72, category: "Materials" },
        { id: "l3", description: "Ornamental shrub installation (5-gal)", qty: 24, unit: "ea", price: 55, category: "Materials" },
        { id: "l4", description: "Seasonal flower installation — color beds", qty: 6, unit: "bed", price: 220, category: "Materials" },
        { id: "l5", description: "Edging & bed cleaning", qty: 1, unit: "job", price: 380, category: "Labor" },
        { id: "l6", description: "Monthly maintenance contract", qty: 6, unit: "month", price: 640, category: "Service" },
        { id: "l7", description: "Irrigation system check & head replacement", qty: 1, unit: "job", price: 320, category: "Labor" },
      ],
      terms: "Monthly maintenance billed on the 1st. Initial installation: 50% deposit, balance on completion.",
    }
  }
};

function getReply(msg: string): { text: string; prefill?: Partial<EstimateData> } {
  const lower = msg.toLowerCase();
  if (lower.includes("roof")) return AGENT_REPLIES.roofing;
  if (lower.includes("kitchen")) return AGENT_REPLIES.kitchen;
  if (lower.includes("it") || lower.includes("tech") || lower.includes("infrastructure")) return AGENT_REPLIES.it;
  if (lower.includes("landscape") || lower.includes("lawn") || lower.includes("grounds")) return AGENT_REPLIES.landscaping;
  return {
    text: "I can help build estimates for roofing, construction, IT, landscaping, and more. Describe the project scope and I'll pre-fill the line items for you.",
  };
}

const emptyEstimate = (): EstimateData => ({
  title: "", contact: "", company: "", email: "",
  validDays: 30, contingency: 10, startDate: "", duration: "",
  lines: [{ id: "l1", description: "", qty: 1, unit: "job", price: 0, category: "Labor" }],
  tax: 0, notes: "", terms: "This estimate is valid for 30 days. Final price subject to scope confirmation.",
});

export default function EstimateBuilder({ vertId, onAddToPipeline, onSave }: Props) {
  const vert = VERTICAL_CONFIG[vertId];
  const P = vert?.color || "#00C896";

  const [est, setEst] = useState<EstimateData>(emptyEstimate());
  const [view, setView] = useState<"builder" | "preview">("builder");
  const [agentOpen, setAgentOpen] = useState(true);
  const [chat, setChat] = useState<AgentMessage[]>([
    { role: "assistant", text: "Hi! I'm your estimate assistant. Tell me about the project and I'll pre-fill your line items, pricing, and terms. Try: \"Build a roofing estimate for 2,400 sq ft\" or pick a prompt below." }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exportToast, setExportToast] = useState<string|null>(null);
  const [pipelineAdded, setPipelineAdded] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const showExportToast = (label: string) => {
    setExportToast(`${label} export — coming soon`);
    setTimeout(() => setExportToast(null), 2800);
  };

  const addToPipeline = () => {
    if (onAddToPipeline) {
      onAddToPipeline({ title: est.title || "New Estimate", co: est.company || "—", contact: est.contact || "—", val: Math.round(total) });
    } else {
      setPipelineAdded(true);
      setTimeout(() => setPipelineAdded(false), 2800);
    }
  };

  const sub = est.lines.reduce((a, l) => a + l.qty * l.price, 0);
  const contingencyAmt = sub * (est.contingency / 100);
  const taxAmt = (sub + contingencyAmt) * (est.tax / 100);
  const total = sub + contingencyAmt + taxAmt;

  const sendMessage = (msg?: string) => {
    const text = (msg || input).trim();
    if (!text || typing) return;
    setInput("");
    const userMsg: AgentMessage = { role: "user", text };
    setChat(prev => [...prev, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const reply = getReply(text);
      setChat(prev => [...prev, { role: "assistant", text: reply.text }]);
      if (reply.prefill) {
        const pf = reply.prefill;
        setEst(prev => ({
          ...prev,
          ...pf,
          lines: pf.lines || prev.lines,
        }));
      }
      setTyping(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 1200);
  };

  const updateLine = (id: string, field: keyof LineItem, val: any) => {
    setEst(e => ({
      ...e,
      lines: e.lines.map(l => l.id === id ? { ...l, [field]: field === "qty" || field === "price" ? +val : val } : l),
    }));
  };

  const addLine = () => {
    setEst(e => ({
      ...e,
      lines: [...e.lines, { id: "l" + Date.now(), description: "", qty: 1, unit: "unit", price: 0, category: "Labor" }],
    }));
  };

  const removeLine = (id: string) => {
    setEst(e => ({ ...e, lines: e.lines.filter(l => l.id !== id) }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setEst(emptyEstimate());
      setView("builder");
      setChat([{ role: "assistant", text: "Estimate saved! Ready to build a new one. Describe the project and I'll pre-fill the details." }]);
      onSave?.({
        title: est.title, contact: est.contact, company: est.company, email: est.email,
        lines: est.lines.map(l => ({ id: l.id, description: l.description, qty: l.qty, unit: l.unit, price: l.price })),
        tax: est.tax, notes: est.notes, terms: est.terms, total,
      });
    }, 2000);
  };

  if (view === "preview") return (
    <div>
      {exportToast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#0F172A", color: "#F1F5F9", padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          {exportToast}
        </div>
      )}
      {pipelineAdded && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#00C896", color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          ✅ Deal added to pipeline!
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button onClick={() => setView("builder")} style={{ background: "none", border: "none", fontSize: 12, color: "#64748B", cursor: "pointer" }}>← Edit</button>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => showExportToast("Excel")} style={{ padding: "7px 12px", background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <IE emoji="📊" Icon={FileSpreadsheet} size={12} />Export Excel
          </button>
          <button onClick={() => showExportToast("PDF")} style={{ padding: "7px 12px", background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <IE emoji="📄" Icon={FileText} size={12} />Export PDF
          </button>
          <button onClick={addToPipeline} style={{ padding: "7px 12px", background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <IE emoji="🔄" Icon={GitBranch} size={12} />Add to Pipeline
          </button>
          <button onClick={handleSave} style={{ padding: "7px 14px", background: "#0F172A", color: "#fff", border: "none", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            {saved ? <><IE emoji="✅" Icon={Check} size={12} /> Saved!</> : "Save Estimate"}
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: P, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>ESTIMATE</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{est.title || "Untitled Estimate"}</div>
            {est.duration && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>Timeline: {est.duration} · Valid {est.validDays} days</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{fmtCurrency(total)}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Total Estimate</div>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Client + dates row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Prepared For</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{est.contact || "—"}</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>{est.company}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              {est.startDate && <div style={{ fontSize: 12, color: "#64748B" }}>Start: {est.startDate}</div>}
              {est.duration && <div style={{ fontSize: 12, color: "#64748B" }}>Duration: {est.duration}</div>}
            </div>
          </div>

          {/* Line items table */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 7 }}>Scope & Pricing</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Description", "Cat.", "Qty", "Amount"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", fontSize: 10, fontWeight: 600, color: "#64748B", textAlign: h === "Amount" ? "right" : "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {est.lines.filter(l => l.description || l.price > 0).map((l, i) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #F1F5F9", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                    <td style={{ padding: "9px 10px", fontSize: 13, color: "#0F172A" }}>{l.description}</td>
                    <td style={{ padding: "9px 10px", fontSize: 10, color: "#94A3B8" }}>{l.category}</td>
                    <td style={{ padding: "9px 10px", fontSize: 12, color: "#64748B" }}>{l.qty} {l.unit}</td>
                    <td style={{ padding: "9px 10px", fontSize: 13, fontWeight: 500, color: "#0F172A", textAlign: "right" }}>{fmtCurrency(l.qty * l.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Totals */}
            <div style={{ padding: "10px 10px 0", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
              <div style={{ display: "flex", gap: 32, fontSize: 11, color: "#64748B" }}><span>Subtotal</span><span>{fmtCurrency(sub)}</span></div>
              {est.contingency > 0 && <div style={{ display: "flex", gap: 32, fontSize: 11, color: "#64748B" }}><span>Contingency ({est.contingency}%)</span><span>{fmtCurrency(contingencyAmt)}</span></div>}
              {est.tax > 0 && <div style={{ display: "flex", gap: 32, fontSize: 11, color: "#64748B" }}><span>Tax ({est.tax}%)</span><span>{fmtCurrency(taxAmt)}</span></div>}
              <div style={{ display: "flex", gap: 32, fontSize: 15, fontWeight: 700, color: P, paddingTop: 4, borderTop: "1px solid #E2E8F0", marginTop: 2 }}><span>Total Estimate</span><span>{fmtCurrency(total)}</span></div>
            </div>
          </div>

          {/* Notes */}
          {est.notes && (
            <div style={{ marginBottom: 18, padding: "12px 14px", background: "#F8FAFC", borderRadius: 7, borderLeft: `3px solid ${P}` }}>
              <div style={{ fontSize: 11, color: "#0F172A", lineHeight: 1.7 }}>{est.notes}</div>
            </div>
          )}

          {/* Terms */}
          {est.terms && (
            <div style={{ padding: "12px 14px", background: "#F8FAFC", borderRadius: 7 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Terms & Validity</div>
              <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.6 }}>{est.terms}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── BUILDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "grid", gridTemplateColumns: agentOpen ? "1fr 280px" : "1fr", gap: 12, alignItems: "start" }}>
      {/* LEFT: FORM */}
      <div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Estimate Builder</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>Agent-guided estimates with contingency and timeline.</div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <button onClick={() => setAgentOpen(!agentOpen)} style={{ padding: "7px 12px", background: agentOpen ? P + "15" : "#F8FAFC", color: agentOpen ? P : "#64748B", border: `1px solid ${agentOpen ? P + "44" : "#E2E8F0"}`, borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <IE emoji="✨" Icon={Sparkles} size={12} />{agentOpen ? "Hide Agent" : "Build with Agent"}
            </button>
            <button onClick={() => setView("preview")} style={{ padding: "7px 14px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Preview</button>
            <button onClick={handleSave} style={{ padding: "7px 14px", background: "#0F172A", color: "#fff", border: "none", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              {saved ? <><IE emoji="✅" Icon={Check} size={12} /> Saved!</> : "Save"}
            </button>
          </div>
        </div>

        {/* Estimate details */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Estimate Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {([
              ["title", "Project Title", "Roof Replacement — 4200 Oak St"],
              ["contact", "Client Name", "John Smith"],
              ["company", "Company", "Smith Properties LLC"],
              ["email", "Email", "john@company.com"],
              ["startDate", "Proposed Start Date", "Jul 15, 2026"],
              ["duration", "Est. Duration", "3–5 days"],
            ] as [keyof EstimateData, string, string][]).map(([field, label, ph]) => (
              <div key={field}>
                <div style={{ fontSize: 10, color: "#64748B", marginBottom: 3 }}>{label}</div>
                <input
                  value={(est as any)[field] as string}
                  onChange={e => setEst(prev => ({ ...prev, [field]: e.target.value }))}
                  placeholder={ph}
                  style={{ width: "100%", padding: "7px 9px", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12, color: "#0F172A", background: "#F8FAFC" }}
                />
              </div>
            ))}
          </div>
          {/* Contingency + Tax row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginTop: 7 }}>
            {([
              ["validDays", "Valid (days)", 30],
              ["contingency", "Contingency %", 10],
              ["tax", "Tax %", 0],
            ] as [keyof EstimateData, string, number][]).map(([field, label, ph]) => (
              <div key={field}>
                <div style={{ fontSize: 10, color: "#64748B", marginBottom: 3 }}>{label}</div>
                <input
                  type="number" min="0"
                  value={(est as any)[field] as number}
                  onChange={e => setEst(prev => ({ ...prev, [field]: +e.target.value }))}
                  placeholder={String(ph)}
                  style={{ width: "100%", padding: "7px 9px", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12, color: "#0F172A", background: "#F8FAFC", textAlign: "center" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Line items */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Line Items</div>
            <button onClick={addLine} style={{ fontSize: 11, padding: "3px 10px", background: P + "15", color: P, border: `1px solid ${P}44`, borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>+ Add Line</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 60px 70px 80px 24px", gap: 4, marginBottom: 4 }}>
            {["Description", "Category", "Qty", "Unit", "Price", ""].map(h => (
              <div key={h} style={{ fontSize: 9, color: "#94A3B8", fontWeight: 600, padding: "0 2px" }}>{h}</div>
            ))}
          </div>
          {est.lines.map(l => (
            <div key={l.id} style={{ display: "grid", gridTemplateColumns: "2fr 80px 60px 70px 80px 24px", gap: 4, marginBottom: 4 }}>
              <input value={l.description} onChange={e => updateLine(l.id, "description", e.target.value)} placeholder="Description"
                style={{ padding: "5px 7px", border: "1px solid #E2E8F0", borderRadius: 5, fontSize: 11, color: "#0F172A", background: "#F8FAFC" }} />
              <select value={l.category} onChange={e => updateLine(l.id, "category", e.target.value)}
                style={{ padding: "5px 4px", border: "1px solid #E2E8F0", borderRadius: 5, fontSize: 10, color: "#0F172A", background: "#F8FAFC" }}>
                {["Labor", "Materials", "Sub", "Equipment", "Other", "Hardware", "Software", "Support", "Service"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input value={l.qty} type="number" min="0" onChange={e => updateLine(l.id, "qty", e.target.value)}
                style={{ padding: "5px", border: "1px solid #E2E8F0", borderRadius: 5, fontSize: 11, color: "#0F172A", background: "#F8FAFC", textAlign: "center" }} />
              <input value={l.unit} onChange={e => updateLine(l.id, "unit", e.target.value)}
                style={{ padding: "5px", border: "1px solid #E2E8F0", borderRadius: 5, fontSize: 11, color: "#0F172A", background: "#F8FAFC", textAlign: "center" }} />
              <input value={l.price} type="number" min="0" onChange={e => updateLine(l.id, "price", e.target.value)}
                style={{ padding: "5px", border: "1px solid #E2E8F0", borderRadius: 5, fontSize: 11, color: "#0F172A", background: "#F8FAFC", textAlign: "right" }} />
              <button onClick={() => removeLine(l.id)} style={{ background: "none", border: "none", color: "#CBD5E1", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>×</button>
            </div>
          ))}

          {/* Totals */}
          <div style={{ marginTop: 12, padding: "12px 0 0", borderTop: "1px solid #F1F5F9" }}>
            {([
              ["Subtotal", fmtCurrency(sub)],
              est.contingency > 0 ? [`Contingency (${est.contingency}%)`, fmtCurrency(contingencyAmt)] : null,
              est.tax > 0 ? [`Tax (${est.tax}%)`, fmtCurrency(taxAmt)] : null,
              ["Total Estimate", fmtCurrency(total)],
            ] as (string[] | null)[]).filter((x): x is string[] => x !== null).map(([label, value], i, arr) => (
              <div key={label} style={{ display: "flex", justifyContent: "flex-end", gap: 40, marginBottom: 4 }}>
                <span style={{ fontSize: i === arr.length - 1 ? 14 : 11, fontWeight: i === arr.length - 1 ? 700 : 400, color: i === arr.length - 1 ? P : "#64748B" }}>{label}</span>
                <span style={{ fontSize: i === arr.length - 1 ? 14 : 11, fontWeight: i === arr.length - 1 ? 700 : 400, color: i === arr.length - 1 ? P : "#0F172A", minWidth: 90, textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes & Terms */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Notes & Terms</div>
          {([["notes", "Internal / Client Notes", 2], ["terms", "Terms & Conditions", 2]] as [keyof EstimateData, string, number][]).map(([field, label, rows]) => (
            <div key={field} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "#64748B", marginBottom: 3 }}>{label}</div>
              <textarea
                value={(est as any)[field] as string}
                onChange={e => setEst(prev => ({ ...prev, [field]: e.target.value }))}
                rows={rows}
                placeholder={field === "notes" ? "Add context for the client or your team…" : "Payment terms, validity, exclusions…"}
                style={{ width: "100%", padding: "7px 9px", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12, color: "#0F172A", background: "#F8FAFC", resize: "vertical" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: AGENT CHAT */}
      {agentOpen && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", position: "sticky", top: 0 }}>
          {/* Agent header */}
          <div style={{ padding: "10px 12px", background: `linear-gradient(135deg,${P}18,${P}08)`, borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IE emoji="✨" Icon={Sparkles} size={12} color="#fff" /></div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Estimate Agent</div>
              <div style={{ fontSize: 10, color: "#64748B" }}>Pre-fills your estimate live</div>
            </div>
          </div>

          {/* Starter prompts */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #F1F5F9", display: "flex", flexWrap: "wrap", gap: 4 }}>
            {STARTER_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)} disabled={typing}
                style={{ fontSize: 9, padding: "3px 8px", borderRadius: 99, border: `1px solid ${P}33`, background: P + "10", color: P, cursor: "pointer", fontFamily: "inherit" }}>
                {p.replace("Help me build a ", "").replace("Create an ", "").replace("Build an ", "").replace("Draft a ", "")}
              </button>
            ))}
          </div>

          {/* Chat */}
          <div style={{ padding: "10px", maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {chat.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                {m.role === "assistant" && (
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IE emoji="✨" Icon={Sparkles} size={10} color="#fff" /></div>
                )}
                <div style={{
                  maxWidth: "82%", padding: "8px 10px", fontSize: 11, lineHeight: 1.6,
                  borderRadius: m.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                  background: m.role === "user" ? "#0F172A" : "#F8FAFC",
                  color: m.role === "user" ? "#fff" : "#0F172A",
                  border: m.role === "assistant" ? "1px solid #E2E8F0" : "none",
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Sparkles size={10} color="#fff" /></div>
                <div style={{ padding: "8px 12px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px 10px 10px 2px", display: "flex", gap: 3 }}>
                  {[0, 1, 2].map(j => (
                    <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: P, animation: `kpulse 1.2s ${j * 0.2}s ease-in-out infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "8px 10px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 5 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Describe the project…"
              disabled={typing}
              style={{ flex: 1, padding: "7px 9px", border: "1px solid #E2E8F0", borderRadius: 7, fontSize: 11, color: "#0F172A", background: "#F8FAFC" }}
            />
            <button onClick={() => sendMessage()} disabled={typing || !input.trim()}
              style={{ padding: "7px 10px", background: input.trim() && !typing ? "#0F172A" : "#E2E8F0", color: input.trim() && !typing ? "#fff" : "#94A3B8", border: "none", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center" }}>
              <IE emoji="📤" Icon={Send} size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
