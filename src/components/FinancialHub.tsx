"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, Landmark, Target,
  ArrowUpRight, MapPin, Zap, Package, Clock, BarChart3,
} from "lucide-react";
import { IE } from "@/lib/icon-mode";
import RevenueChart    from "@/components/financial/RevenueChart";
import ExpenseRing     from "@/components/financial/ExpenseRing";
import CashFlowChart   from "@/components/financial/CashFlowChart";
import ForecastTable   from "@/components/financial/ForecastTable";
import TransactionFeed from "@/components/financial/TransactionFeed";
import DragSection     from "@/components/financial/DragSection";

interface Msg { role: "user" | "assistant"; content: string; }

// ── DATA ──────────────────────────────────────────────────────────────────────
const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun"];
const REVENUE  = [68400, 74200, 71800, 89600, 94200, 102400];
const EXPENSES = [51200, 54800, 53100, 61400, 67800, 71200];
const GROSS_PROFIT = REVENUE.map((r, i) => r - EXPENSES[i]);
const GROSS_MARGIN  = GROSS_PROFIT.map((g, i) => Math.round(g / REVENUE[i] * 100));
const BAR_MAX       = Math.max(...REVENUE);

const KPIs = [
  { label:"Monthly Revenue",  value:"$102,400", delta:"+8.7%",  up:true,  Icon:DollarSign,    sub:"vs last month" },
  { label:"Gross Profit",     value:"$31,200",  delta:"+4.2%",  up:true,  Icon:TrendingUp,    sub:"30.5% margin" },
  { label:"Outstanding AR",   value:"$48,600",  delta:"+12K",   up:false, Icon:AlertTriangle, sub:"3 invoices overdue" },
  { label:"Monthly Expenses", value:"$71,200",  delta:"+5.0%",  up:false, Icon:TrendingDown,  sub:"vs last month" },
  { label:"Cash on Hand",     value:"$186,400", delta:"+18K",   up:true,  Icon:Landmark,      sub:"Estimated runway: 2.6 mo" },
  { label:"YTD Revenue",      value:"$500,600", delta:"+23.4%", up:true,  Icon:Target,        sub:"vs same period last year" },
];

const EXPENSE_CATS = [
  { label:"Labor & Payroll",   amount:32400, pct:45, color:"#3B9EFF" },
  { label:"Materials & Parts", amount:18600, pct:26, color:"#F59E0B" },
  { label:"Overhead",          amount:10100, pct:14, color:"#A78BFA" },
  { label:"Subcontractors",    amount:6400,  pct:9,  color:"#10B981" },
  { label:"Equipment",         amount:2800,  pct:4,  color:"#EC4899" },
  { label:"Software & Tools",  amount:900,   pct:2,  color:"#64748B" },
];

const REVENUE_CATS = [
  { label:"Service Contracts", amount:52400, pct:51, color:"#10B981" },
  { label:"Construction Jobs",  amount:31800, pct:31, color:"#00C896" },
  { label:"Maintenance",        amount:12200, pct:12, color:"#3B9EFF" },
  { label:"Inspections",        amount:6000,  pct:6,  color:"#A78BFA" },
];

const UPTAKES = [
  { title:"Service contracts up 31%",      body:"Recurring service agreements increased from $40K to $52.4K — strongest growing segment. 3 new annual contracts signed in May.",  Icon:ArrowUpRight, value:"+$12.4K" },
  { title:"Tampa market expanding",         body:"Tampa territory generated $38K this month — up from $29K in April. Demand for construction services outpacing capacity.",          Icon:MapPin,       value:"+$9K" },
  { title:"On-time collections improving",  body:"DSO (days sales outstanding) dropped from 38 to 31 days. Faster payment collection improving cash position.",                   Icon:Zap,          value:"-7 days DSO" },
];

const DOWNTAKES = [
  { title:"Material costs rising",          body:"Materials jumped 18% in May — likely tied to lumber and copper index increases. Recommend reviewing Q3 job bids to adjust pricing.",  Icon:Package,       value:"+$2,840" },
  { title:"3 overdue invoices — $48,600",  body:"INV-2026-202 ($1,610, 36 days), INV-2026-198 ($22,400, 28 days), INV-2026-189 ($24,590, 22 days). Follow-up needed this week.",     Icon:AlertTriangle, value:"$48,600 at risk" },
  { title:"Margin compression",             body:"Average job margin dropped from 34% to 30.5% over 3 months. Labor cost increases not yet reflected in estimating templates.",          Icon:TrendingDown,  value:"-3.5% margin" },
  { title:"Overtime spend elevated",        body:"Overtime hours ran 14% above budget in May — two jobs hit delays. Scheduling review recommended before June 10 project kick-offs.",  Icon:Clock,         value:"+$4,200 OT" },
];

const RECENT_TRANSACTIONS = [
  { date:"Jun 3",  desc:"Payment received — Apex Realty Group",   amount:8180,   type:"in",  cat:"Revenue" },
  { date:"Jun 2",  desc:"ABC Building Supply — PO-2026-101",       amount:-4820,  type:"out", cat:"Materials" },
  { date:"Jun 2",  desc:"Payroll — Bi-weekly cycle",               amount:-16200, type:"out", cat:"Payroll" },
  { date:"Jun 1",  desc:"Invoice sent — Thompson Properties",       amount:10852,  type:"in",  cat:"Revenue" },
  { date:"Jun 1",  desc:"Subcontractor — Coastal Electric",         amount:-3200,  type:"out", cat:"Subcontractor" },
  { date:"May 30", desc:"Insurance — Monthly premium",              amount:-1240,  type:"out", cat:"Overhead" },
  { date:"May 29", desc:"Payment received — Harmon Industrial",     amount:14000,  type:"in",  cat:"Revenue" },
  { date:"May 28", desc:"Equipment rental — Scaffold 2 weeks",      amount:-2800,  type:"out", cat:"Equipment" },
];

const ATLAS_SYSTEM = `You are Atlas, KOVA's financial intelligence agent. You are the CFO of the AI team.
You have full access to this business's financial data:
- June revenue: $102,400 (+8.7% MoM). YTD: $500,600 (+23.4% YoY)
- June expenses: $71,200. Gross margin: 30.5%
- Cash on hand: $186,400
- 3 overdue invoices totaling $48,600
- Material costs up 18% in May
- Job margins declining: 34% → 30.5% over 3 months
- Top revenue: Service contracts (51%), Construction (31%)
- Top expense: Payroll (45%), Materials (26%)
- Tampa market growing fast — up $9K month-over-month
- DSO improved: 38 → 31 days

Be specific. Reference real numbers. Speak like a CFO who knows this business intimately.
Explain what's happening, why it matters, and exactly what the owner should do.
Flag both opportunities (uptakes) and risks (downtakes).
Keep answers concise — 3-5 sentences max unless asked for detail.`;

function fv(n: number) {
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (n < 0 ? "-" : "") + "$" + abs;
}

type SectionId = "revenue" | "expenses" | "cashflow" | "forecast" | "transactions";
const DEFAULT_ORDER: SectionId[] = ["revenue", "expenses", "cashflow", "forecast", "transactions"];

export default function FinancialHub({ vertId }: { vertId?: string }) {
  const [tab,      setTab]      = useState<"overview" | "pl" | "cashflow" | "atlas">("overview");
  const [msgs,     setMsgs]     = useState<Msg[]>([{ role:"assistant", content:"Good morning. Your June revenue is $102,400 — up 8.7% from May. Strong month, but I'm watching three things: the $48,600 in overdue AR, your job margins compressing from 34% to 30.5%, and material costs up 18%. What do you want to dig into first?" }]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [sections, setSections] = useState<SectionId[]>(DEFAULT_ORDER);
  const [dragged,  setDragged]  = useState<SectionId | null>(null);
  const [barHover, setBarHover] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const handleDragStart = useCallback((id: string) => setDragged(id as SectionId), []);
  const handleDrop      = useCallback((targetId: string) => {
    if (!dragged || dragged === targetId) { setDragged(null); return; }
    setSections(prev => {
      const next = [...prev];
      const from = next.indexOf(dragged as SectionId);
      const to   = next.indexOf(targetId as SectionId);
      next.splice(from, 1);
      next.splice(to, 0, dragged as SectionId);
      return next;
    });
    setDragged(null);
  }, [dragged]);

  const sendMsg = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: "atlas_finance", messages: newMsgs, businessContext: { agentOverride: ATLAS_SYSTEM } }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role:"assistant", content: data.message || "I'm analyzing your financials. Give me a moment." }]);
    } catch {
      const fallbacks: Record<string, string> = {
        margin:   "Your gross margin dropped 3.5 points over 90 days — from 34% to 30.5%. The driver is labor cost inflation, not revenue softness. The fix is in your estimating templates — bump labor cost assumptions by 12% before you quote any new jobs.",
        overdue:  "Three invoices: INV-2026-202 ($1,610 — 36 days), INV-2026-198 ($22,400 — 28 days), INV-2026-189 ($24,590 — 22 days). The big risk is INV-2026-198. At $22K and 28 days out, that's the one to call today — not email.",
        material: "Materials jumped from $15,800 in April to $18,600 in May — an 18% increase driven primarily by lumber and copper pricing. Short-term: add a material cost escalation clause to any job over $10K.",
        cash:     "You have $186,400 on hand. At current monthly burn of $71,200, that's about 2.6 months of runway without any new revenue. But you're bringing in $102K monthly, so this is healthy. Get the $48.6K AR collected and you're in strong shape.",
      };
      const key = Object.keys(fallbacks).find(k => text.toLowerCase().includes(k));
      setMsgs(m => [...m, { role:"assistant", content: key ? fallbacks[key] : "Your financials are strong overall — $102K in June, 30.5% margin, $186K cash. The three areas that need attention: collect the $48.6K in overdue AR, adjust your estimating for the new material cost baseline, and review the jobs that ran overtime in May." }]);
    }
    setLoading(false);
  };

  const SECTION_MAP: Record<SectionId, React.ReactNode> = {
    revenue:      <RevenueChart />,
    expenses:     <ExpenseRing />,
    cashflow:     <CashFlowChart />,
    forecast:     <ForecastTable />,
    transactions: <TransactionFeed />,
  };
  const SECTION_COLS: Record<SectionId, string> = {
    revenue: "col-span-2", expenses: "col-span-1", cashflow: "col-span-1",
    forecast: "col-span-2", transactions: "col-span-2",
  };

  const TABS = [["overview","Overview"],["pl","P&L"],["cashflow","Cash Flow"],["atlas","Atlas AI"]];

  return (
    <div>
      <style>{`
        .fh-chart-outer { height: 44px !important; max-height: 44px !important; }
        .fh-chart-bars  { height: 32px !important; max-height: 32px !important; }
      `}</style>
      {/* ── Dark KPI header ── */}
      <div style={{ background:"linear-gradient(135deg,#0F172A,#1E3A5F)", borderRadius:12, padding:"16px 18px", marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:3 }}>Financial Hub · Atlas AI</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#F1F5F9" }}>June 2026 — Performance Overview</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:26, fontWeight:700, color:"#00C896" }}>$102,400</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Monthly Revenue · +8.7% MoM</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          {KPIs.map(k => (
            <div key={k.label} style={{ background:"rgba(255,255,255,0.07)", borderRadius:9, padding:"10px 13px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                <k.Icon size={13} color="rgba(255,255,255,0.65)" />
                <span style={{ fontSize:10, fontWeight:700, color: k.up ? "#10B981" : "#EF4444" }}>{k.delta}</span>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:"#F1F5F9" }}>{k.value}</div>
              <div style={{ fontSize:9.5, color:"rgba(255,255,255,0.38)", marginTop:2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid #E2E8F0", background:"#fff", borderRadius:"8px 8px 0 0" }}>
        {TABS.map(([t, l]) => (
          <button key={t} onClick={() => setTab(t as any)} style={{ padding:"10px 16px", fontSize:12, fontWeight: tab===t ? 600 : 400, border:"none", background:"none", cursor:"pointer", color: tab===t ? "#1D4ED8" : "#64748B", borderBottom: tab===t ? "2px solid #1D4ED8" : "2px solid transparent", whiteSpace:"nowrap" }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderTop:"none", borderRadius:"0 0 10px 10px", padding:"16px 18px", minHeight:420 }}>

        {/* OVERVIEW — drag-and-drop sections */}
        {tab === "overview" && (
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:"#94A3B8", marginBottom:12 }}>Drag sections to reorder your dashboard</div>
            <div className="grid grid-cols-2 gap-4">
              {sections.map(id => (
                <DragSection key={id} id={id} onDragStart={handleDragStart} onDrop={handleDrop} className={SECTION_COLS[id]} title={id}>
                  {SECTION_MAP[id]}
                </DragSection>
              ))}
            </div>
          </div>
        )}

        {/* P&L */}
        {tab === "pl" && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"#0F172A", marginBottom:12 }}>Profit & Loss — June 2026</div>

            {/* Revenue bar chart */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:600, color:"#64748B", marginBottom:8 }}>Revenue vs Expenses — 6 Month Trend</div>
              <div className="fh-chart-outer" style={{ display:"flex", gap:4, alignItems:"flex-end", height:44, marginBottom:4 }}>
                {MONTHS.map((m, i) => (
                  <div key={m} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative", cursor:"default" }}
                    onMouseEnter={() => setBarHover(i)}
                    onMouseLeave={() => setBarHover(null)}>
                    {barHover === i && (
                      <div style={{ position:"absolute", bottom:"100%", left:"50%", transform:"translateX(-50%)", background:"#1E293B", color:"#fff", borderRadius:4, padding:"3px 6px", fontSize:9, whiteSpace:"nowrap", zIndex:20, marginBottom:3, boxShadow:"0 1px 6px rgba(0,0,0,0.2)", lineHeight:1.5, pointerEvents:"none" }}>
                        <span style={{ color:"#4ADE80" }}>{fv(REVENUE[i])}</span>
                        <span style={{ color:"#94A3B8", margin:"0 3px" }}>·</span>
                        <span style={{ color:"#FCA5A5" }}>{fv(EXPENSES[i])}</span>
                      </div>
                    )}
                    <div className="fh-chart-bars" style={{ width:"100%", display:"flex", gap:1, alignItems:"flex-end", height:32 }}>
                      <div style={{ flex:1, background:"#00C896", borderRadius:"2px 2px 0 0", height:`${REVENUE[i]/BAR_MAX*100}%`, minHeight:3 }} />
                      <div style={{ flex:1, background:"#EF4444", opacity:0.6, borderRadius:"2px 2px 0 0", height:`${EXPENSES[i]/BAR_MAX*100}%`, minHeight:3 }} />
                    </div>
                    <div style={{ fontSize:8, color:"#94A3B8" }}>{m}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:14, fontSize:10, color:"#64748B" }}>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:8, height:8, background:"#00C896", borderRadius:2 }} />Revenue</div>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:8, height:8, background:"#EF4444", opacity:0.65, borderRadius:2 }} />Expenses</div>
                <div style={{ marginLeft:"auto", fontWeight:600, color:"#10B981" }}>Avg margin: {Math.round(GROSS_MARGIN.reduce((a,b)=>a+b,0)/GROSS_MARGIN.length)}%</div>
              </div>
            </div>

            <div style={{ height:1, background:"#E2E8F0", marginBottom:16 }} />

            {/* Revenue breakdown */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#0F172A" }}>Revenue</span>
                <span style={{ fontSize:14, fontWeight:700, color:"#10B981" }}>$102,400</span>
              </div>
              {REVENUE_CATS.map(r => (
                <div key={r.label} style={{ marginBottom:7 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                    <span style={{ color:"#64748B" }}>{r.label}</span>
                    <span style={{ color:"#0F172A", fontWeight:500 }}>{fv(r.amount)} <span style={{ color:"#94A3B8", fontSize:10 }}>({r.pct}%)</span></span>
                  </div>
                  <div style={{ height:5, background:"#F1F5F9", borderRadius:99 }}><div style={{ height:"100%", background:r.color, borderRadius:99, width:`${r.pct}%` }} /></div>
                </div>
              ))}
            </div>

            <div style={{ height:1, background:"#E2E8F0", marginBottom:16 }} />

            {/* Expense breakdown */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#0F172A" }}>Expenses</span>
                <span style={{ fontSize:14, fontWeight:700, color:"#EF4444" }}>$71,200</span>
              </div>
              {EXPENSE_CATS.map(e => (
                <div key={e.label} style={{ marginBottom:7 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                    <span style={{ color:"#64748B" }}>{e.label}</span>
                    <span style={{ color:"#0F172A", fontWeight:500 }}>{fv(e.amount)} <span style={{ color:"#94A3B8", fontSize:10 }}>({e.pct}%)</span></span>
                  </div>
                  <div style={{ height:5, background:"#F1F5F9", borderRadius:99 }}><div style={{ height:"100%", background:e.color, borderRadius:99, width:`${e.pct}%` }} /></div>
                </div>
              ))}
            </div>

            <div style={{ height:1, background:"#E2E8F0", marginBottom:12 }} />

            {/* Summary totals */}
            {[
              ["Gross Revenue","$102,400","#10B981"],
              ["Total Expenses","($71,200)","#EF4444"],
              ["Gross Profit","$31,200","#0F172A"],
              ["Gross Margin","30.5%","#3B9EFF"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom: l === "Gross Margin" ? "none" : "1px solid #F8FAFC" }}>
                <span style={{ fontSize:12, fontWeight: l==="Gross Profit"||l==="Gross Margin" ? 700 : 400, color: l==="Gross Profit"||l==="Gross Margin" ? "#0F172A" : "#64748B" }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:700, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* CASH FLOW */}
        {tab === "cashflow" && (
          <div>
            {/* Summary cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
              {[["Cash In","$72,180","#10B981","↑"],["Cash Out","($54,260)","#EF4444","↓"],["Net Cash","$17,920","#3B9EFF","→"]].map(([l, v, c, a]) => (
                <div key={l as string} style={{ padding:"13px 14px", background:"#F8FAFC", borderRadius:9, border:"1px solid #E2E8F0", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:"#64748B", marginBottom:4 }}>{a} {l}</div>
                  <div style={{ fontSize:18, fontWeight:700, color: c as string }}>{v}</div>
                  <div style={{ fontSize:9, color:"#94A3B8", marginTop:2 }}>This month</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize:11, fontWeight:700, color:"#0F172A", marginBottom:10 }}>Recent Transactions</div>
            {RECENT_TRANSACTIONS.map((t, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid #F8FAFC" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background: t.type==="in" ? "#10B981" : "#EF4444", flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#0F172A" }}>{t.desc}</div>
                  <div style={{ fontSize:10, color:"#94A3B8", marginTop:1 }}>{t.date} · {t.cat}</div>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color: t.type==="in" ? "#15803D" : "#B91C1C" }}>{fv(t.amount)}</div>
              </div>
            ))}

            {/* AR aging */}
            <div style={{ marginTop:16, padding:"13px 14px", background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:9 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#B91C1C", marginBottom:8, display:"flex", alignItems:"center", gap:5 }}><IE emoji="⚠️" Icon={AlertTriangle} size={12} />Accounts Receivable Aging</div>
              {[["0-30 days","$24,590","low"],["30-45 days","$22,400","medium"],["45-60 days","$1,610","high"]].map(([r, v, risk]) => (
                <div key={r} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #FEE2E2" }}>
                  <span style={{ fontSize:11, color:"#64748B" }}>{r}</span>
                  <span style={{ fontSize:11, fontWeight:700, color: risk==="high"?"#B91C1C":risk==="medium"?"#B45309":"#0F172A" }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:7 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#B91C1C" }}>Total Overdue</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#B91C1C" }}>$48,600</span>
              </div>
            </div>
          </div>
        )}

        {/* ATLAS AI */}
        {tab === "atlas" && (
          <div style={{ display:"flex", flexDirection:"column", height:490 }}>
            {/* Agent header */}
            <div style={{ paddingBottom:10, borderBottom:"1px solid #F1F5F9", marginBottom:12, display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"#6366F115", display:"flex", alignItems:"center", justifyContent:"center" }}><IE emoji="📊" Icon={BarChart3} size={17} color="#6366F1" /></div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"#0F172A" }}>Atlas — Financial Intelligence</div>
                <div style={{ fontSize:10, color:"#6366F1" }}>CFO · Your numbers. Plain English. Every day.</div>
              </div>
            </div>

            {/* Quick questions */}
            <div style={{ display:"flex", gap:5, marginBottom:12, flexWrap:"wrap" }}>
              {["Why is my margin dropping?","What are my overdue invoices?","How are my material costs?","What's my cash position?"].map(q => (
                <button key={q} onClick={() => sendMsg(q)} style={{ fontSize:10, padding:"4px 10px", borderRadius:99, border:"1px solid #E2E8F0", background:"#F8FAFC", cursor:"pointer", color:"#64748B" }}>{q}</button>
              ))}
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display:"flex", gap:8, justifyContent: m.role==="user" ? "flex-end" : "flex-start", alignItems:"flex-end" }}>
                  {m.role==="assistant" && (
                    <div style={{ width:28, height:28, borderRadius:"50%", background:"#6366F115", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><IE emoji="📊" Icon={BarChart3} size={13} color="#6366F1" /></div>
                  )}
                  <div style={{ maxWidth:"80%", padding:"9px 12px", borderRadius: m.role==="user" ? "9px 9px 2px 9px" : "9px 9px 9px 2px", background: m.role==="user" ? "#6366F1" : "#F8FAFC", color: m.role==="user" ? "#fff" : "#0F172A", fontSize:12, lineHeight:1.6 }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"#6366F115", display:"flex", alignItems:"center", justifyContent:"center" }}><IE emoji="📊" Icon={BarChart3} size={13} color="#6366F1" /></div>
                  <div style={{ padding:"9px 14px", background:"#F8FAFC", borderRadius:"9px 9px 9px 2px", display:"flex", gap:4 }}>
                    {[0,1,2].map(j => <div key={j} style={{ width:5, height:5, borderRadius:"50%", background:"#6366F1", animation:`atlas-pulse 1.2s ${j*0.2}s ease-in-out infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ display:"flex", gap:8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg(input)}
                disabled={loading}
                placeholder="Ask Atlas about your financials…"
                style={{ flex:1, padding:"9px 13px", border:"1px solid #E2E8F0", borderRadius:8, fontSize:12, background:"#F8FAFC", outline:"none" }}
              />
              <button
                onClick={() => sendMsg(input)}
                disabled={loading || !input.trim()}
                style={{ padding:"9px 20px", background: input.trim()&&!loading ? "#6366F1" : "#E2E8F0", color: input.trim()&&!loading ? "#fff" : "#94A3B8", border:"none", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer" }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes atlas-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}
