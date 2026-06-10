"use client";
import { useState, useRef, useEffect } from "react";

const SYSTEM = `You are Atlas, KOVA's onboarding assistant. Walk the customer through 6 steps to configure their KOVA account. Ask ONE question at a time. Keep responses under 80 words.

Steps in order:
1. Company name + platform name
2. Industry vertical (map to: real_estate, insurance, manufacturing, healthcare, retail, legal, car_dealership, land_surveyor, construction, landscaping, mechanic, fabrication)
3. Specific business sub-type
4. Primary goal (find leads / manage pipeline / automate outreach / market intelligence)
5. Suggest 2-3 optional modules based on goal, confirm
6. AI tone preference: Professional, Conversational, Aggressive, or Consultative

After EVERY message, append a JSON block:
\`\`\`json
{"step":"company|vertical|subtype|goals|modules|tone|complete","progress":0,"config":{"company_name":"","product_name":"","vertical_id":"","vertical_label":"","sub_type":"","tone":"","active_modules":[],"goals":[]},"suggestion":""}
\`\`\`
Set step to "complete" and progress to 100 when all info collected. Always carry forward all collected fields.`;

const QUICK: Record<string, string[]> = {
  vertical: ["Real Estate","Insurance","Manufacturing","Construction","Car Dealerships","Landscaping","Mechanic Shops","Legal Services","Healthcare","Retail/E-Com","Fabrication Shops"],
  goals: ["Find more leads","Manage pipeline","Automate outreach","Market intelligence"],
  tone: ["Professional","Conversational","Aggressive","Consultative"],
  modules: ["Yes, add those","Core modules only","Tell me more"],
};

const VERT_ICONS: Record<string,string> = { real_estate:"🏠", insurance:"🛡️", manufacturing:"🏭", healthcare:"🏥", retail:"🛍️", legal:"⚖️", car_dealership:"🚗", land_surveyor:"📐", construction:"🏗️", landscaping:"🌿", mechanic:"🔧", fabrication:"⚙️" };
const MOD_LABELS: Record<string,string> = { skip_trace:"Skip Trace", list_builder:"List Builder", ai_scoring:"AI Scoring", outreach:"Outreach", market_share:"Market Share", lifecycle_triggers:"Life Events", b2b_intel:"B2B Intel", compliance_monitor:"Compliance", scheduled_reports:"Reports", nl_query:"NL Query" };
const TONE_COLORS: Record<string,string> = { Professional:"#1D4ED8", Conversational:"#15803D", Aggressive:"#B91C1C", Consultative:"#7C3AED" };

function parse(raw: string) {
  const m = raw.match(/```json\n([\s\S]*?)\n```/);
  const display = raw.replace(/```json[\s\S]*?```/g,"").trim();
  let data = null;
  if (m) { try { data = JSON.parse(m[1]); } catch {} }
  return { display, data };
}

const INIT_RAW = `Hi there! 👋 I'm **Atlas**, your KOVA setup guide. I'll have your account configured in about 2 minutes.

Let's start: **what's your company name**, and what would you like to call your KOVA platform?

\`\`\`json
{"step":"company","progress":5,"config":{"company_name":"","product_name":"","vertical_id":"","vertical_label":"","sub_type":"","tone":"","active_modules":[],"goals":[]},"suggestion":"Most clients name it after their company."}
\`\`\``;

export default function Atlas() {
  const { display: initDisplay } = parse(INIT_RAW);
  const [msgs, setMsgs] = useState([{ role:"assistant", raw:INIT_RAW, display:initDisplay }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>({ company_name:"", product_name:"", vertical_id:"", vertical_label:"", sub_type:"", tone:"", active_modules:[], goals:[] });
  const [progress, setProgress] = useState(5);
  const [step, setStep] = useState("company");
  const [suggestion, setSuggestion] = useState("Most clients name it after their company.");
  const [complete, setComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const history = [...msgs, { role:"user", raw:msg, display:msg }];
    setMsgs(history);
    setLoading(true);
    try {
      const res = await fetch("/api/atlas", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages: history.map(m=>({role:m.role,content:m.raw||m.display||""})), system: SYSTEM }) });
      const data = await res.json();
      const raw = data.text || "Sorry, try again.";
      const { display, data: parsed } = parse(raw);
      if (parsed?.config) {
        setConfig((prev: any) => ({ ...prev, ...Object.fromEntries(Object.entries(parsed.config).filter(([,v])=> v !== "" && !(Array.isArray(v) && (v as any[]).length===0))) }));
        if (parsed.progress) setProgress(parsed.progress);
        if (parsed.step) setStep(parsed.step);
        if (parsed.suggestion) setSuggestion(parsed.suggestion);
        if (parsed.step==="complete") setComplete(true);
      }
      setMsgs([...history, { role:"assistant", raw, display }]);
    } catch { setMsgs([...history, { role:"assistant", raw:"Connection error.", display:"Connection error." }]); }
    setLoading(false);
  };

  const qr = QUICK[step] || [];
  const core = ["skip_trace","list_builder","ai_scoring","outreach"];
  const allMods = [...new Set([...core,...(config.active_modules||[])])];
  const icon = VERT_ICONS[config.vertical_id] || "⚡";

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", height:560, background:"#0F172A", borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)", fontFamily:"system-ui,-apple-system,sans-serif" }}>
      {/* Chat */}
      <div style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10, background:"#0A1120", flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#00C896,#3B9EFF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
          <div><div style={{ fontSize:13, fontWeight:700, color:"#F1F5F9" }}>Atlas</div><div style={{ fontSize:10, color:"#00C896" }}>KOVA Onboarding Guide · Online</div></div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"14px" }}>
          {msgs.map((m,i) => {
            const isUser = m.role==="user";
            const parts = (m.display||"").split(/(\*\*[^*]+\*\*)/g);
            return (
              <div key={i} style={{ display:"flex", justifyContent: isUser?"flex-end":"flex-start", marginBottom:10, alignItems:"flex-end", gap:7 }}>
                {!isUser && <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#00C896,#3B9EFF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, marginBottom:2 }}>⚡</div>}
                <div style={{ maxWidth:"75%", padding:"9px 13px", borderRadius: isUser?"10px 10px 2px 10px":"10px 10px 10px 2px", background: isUser?"linear-gradient(135deg,#00C896,#007A5C)":"rgba(255,255,255,0.06)", fontSize:12, color: isUser?"#fff":"#CBD5E1", lineHeight:1.65 }}>
                  {parts.map((p,j) => p.startsWith("**") ? <strong key={j} style={{ color: isUser?"#fff":"#F1F5F9", fontWeight:700 }}>{p.slice(2,-2)}</strong> : <span key={j}>{p}</span>)}
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#00C896,#3B9EFF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>⚡</div>
              <div style={{ padding:"9px 13px", borderRadius:"10px 10px 10px 2px", background:"rgba(255,255,255,0.06)", display:"flex", gap:4 }}>
                {[0,1,2].map(j=><div key={j} style={{ width:6, height:6, borderRadius:"50%", background:"#3B9EFF", animation:`dot ${1.2}s ${j*0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {qr.length>0 && !loading && !complete && (
          <div style={{ padding:"7px 13px", display:"flex", flexWrap:"wrap", gap:4, borderTop:"1px solid rgba(255,255,255,0.05)", background:"#0A1120", flexShrink:0 }}>
            {qr.map(r=><button key={r} onClick={()=>send(r)} style={{ fontSize:10, padding:"3px 9px", borderRadius:99, background:"rgba(59,158,255,0.1)", border:"0.5px solid rgba(59,158,255,0.3)", color:"#3B9EFF", cursor:"pointer", fontFamily:"inherit" }}>{r}</button>)}
          </div>
        )}
        {!complete && (
          <div style={{ padding:"9px 13px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:7, background:"#0A1120", flexShrink:0 }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type your answer…" disabled={loading}
              style={{ flex:1, padding:"8px 11px", borderRadius:7, fontSize:12, background:"rgba(255,255,255,0.05)", border:"0.5px solid rgba(255,255,255,0.1)", color:"#E2E8F0", fontFamily:"inherit" }} />
            <button onClick={()=>send()} disabled={loading||!input.trim()} style={{ padding:"8px 14px", borderRadius:7, fontSize:12, fontWeight:700, background: input.trim()&&!loading?"linear-gradient(135deg,#00C896,#007A5C)":"rgba(255,255,255,0.06)", border:"none", color: input.trim()&&!loading?"#fff":"#475569", cursor:"pointer", fontFamily:"inherit" }}>Send</button>
          </div>
        )}
        {complete && <div style={{ padding:"10px 13px", textAlign:"center", fontSize:11, color:"#475569", borderTop:"1px solid rgba(255,255,255,0.06)", background:"#0A1120" }}>✅ Setup complete — your profile is ready →</div>}
      </div>

      {/* Config panel */}
      {complete ? (
        <div style={{ padding:16, background:"#070B12", borderLeft:"0.5px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, textAlign:"center" }}>
          <div style={{ fontSize:32 }}>🎉</div>
          <div style={{ fontSize:15, fontWeight:800, color:"#F1F5F9" }}>You're all set!</div>
          <div style={{ padding:14, background:"rgba(0,200,150,0.08)", border:"0.5px solid rgba(0,200,150,0.3)", borderRadius:9, width:"100%", textAlign:"left" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
              <div style={{ width:32, height:32, borderRadius:7, background:"rgba(0,200,150,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{icon}</div>
              <div><div style={{ fontSize:13, fontWeight:700, color:"#F1F5F9" }}>{config.product_name||config.company_name}</div><div style={{ fontSize:10, color:"#00C896" }}>{config.vertical_label}</div></div>
            </div>
            {[["Sub-type",config.sub_type],["AI Tone",config.tone],["Modules",`${allMods.length} active`]].filter(([,v])=>v).map(([l,v])=>(
              <div key={l as string} style={{ display:"flex", justifyContent:"space-between", fontSize:11, padding:"4px 0", borderBottom:"0.5px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color:"#475569" }}>{l}</span><span style={{ color:"#CBD5E1", fontWeight:600 }}>{String(v)}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>window.open("/dashboard","_self")} style={{ width:"100%", padding:"10px", borderRadius:8, background:"linear-gradient(135deg,#00C896,#007A5C)", border:"none", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>Launch KOVA →</button>
        </div>
      ) : (
        <div style={{ padding:14, background:"#070B12", borderLeft:"0.5px solid rgba(255,255,255,0.06)", overflowY:"auto", display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ fontSize:9, fontWeight:700, color:"#475569", letterSpacing:"2px", fontFamily:"monospace" }}>BUILDING YOUR PROFILE</div>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#475569", marginBottom:4 }}><span>Progress</span><span style={{ color: progress===100?"#00C896":"#3B9EFF", fontWeight:700 }}>{progress}%</span></div>
            <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:`${progress}%`, height:"100%", background:"linear-gradient(90deg,#3B9EFF,#00C896)", borderRadius:99, transition:"width 0.5s" }} />
            </div>
          </div>
          {[["Company",config.company_name],["Platform",config.product_name],["Vertical",config.vertical_label?`${icon} ${config.vertical_label}`:""],["Sub-Type",config.sub_type],["AI Tone",config.tone]].map(([l,v])=>(
            <div key={l as string} style={{ padding:"7px 9px", borderRadius:6, border:"0.5px solid", borderColor: v?"rgba(0,200,150,0.2)":"rgba(255,255,255,0.05)", background: v?"rgba(0,200,150,0.06)":"rgba(255,255,255,0.02)", transition:"all 0.3s" }}>
              <div style={{ fontSize:8, color:"#475569", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:2 }}>{l}</div>
              <div style={{ fontSize:11, color: v?"#F1F5F9":"#1E2A3A", fontWeight: v?500:400, minHeight:15 }}>{String(v)||"—"}</div>
            </div>
          ))}
          <div>
            <div style={{ fontSize:8, color:"#475569", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:5 }}>Modules</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
              {allMods.map(m=>{
                const isCore = core.includes(m);
                return <span key={m} style={{ fontSize:9, padding:"2px 6px", borderRadius:99, fontWeight:600, background: isCore?"rgba(0,200,150,0.15)":"rgba(59,158,255,0.15)", color: isCore?"#00C896":"#3B9EFF", border:`0.5px solid ${isCore?"rgba(0,200,150,0.3)":"rgba(59,158,255,0.3)"}` }}>{MOD_LABELS[m]||m}</span>;
              })}
            </div>
          </div>
          {suggestion && (
            <div style={{ marginTop:"auto", padding:"8px 10px", background:"rgba(59,158,255,0.08)", borderRadius:7, border:"0.5px solid rgba(59,158,255,0.2)" }}>
              <div style={{ fontSize:9, color:"#3B9EFF", marginBottom:2 }}>💡 TIP</div>
              <div style={{ fontSize:10, color:"#94A3B8", lineHeight:1.5 }}>{suggestion}</div>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes dot{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
