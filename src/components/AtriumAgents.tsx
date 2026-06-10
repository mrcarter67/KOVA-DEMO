"use client";
import { useState, useRef, useEffect } from "react";

interface Message { role:"user"|"assistant"; content:string; }
interface BusinessCtx { [key:string]: any; }

const AGENTS = [
  { id:"maven",  name:"Maven",  role:"Team Lead",       icon:"🎯", color:"#00C8A0", desc:"Discovery, strategy, coordination. Start here.",        badge:"Start here" },
  { id:"iris",   name:"Iris",   role:"Brand",           icon:"🎨", color:"#EC4899", desc:"Voice, visual identity, messaging guide.",              badge:"" },
  { id:"dash",   name:"Dash",   role:"Paid Media",      icon:"📈", color:"#3B82F6", desc:"Audiences, ads, conversion. Google + Meta.",            badge:"" },
  { id:"poppy",  name:"Poppy",  role:"Organic Social",  icon:"🌸", color:"#F59E0B", desc:"Instagram, Facebook, TikTok, LinkedIn.",                badge:"" },
  { id:"sage",   name:"Sage",   role:"SEO + Web",       icon:"🌿", color:"#10B981", desc:"Search rankings, website, landing pages.",              badge:"" },
  { id:"echo",   name:"Echo",   role:"Email + SMS",     icon:"💬", color:"#8B5CF6", desc:"Sequences, newsletters, lifecycle campaigns.",          badge:"" },
  { id:"stella", name:"Stella", role:"Reputation",      icon:"⭐", color:"#EF4444", desc:"Reviews, listings, response strategy.",                 badge:"" },
  { id:"atlas",  name:"Atlas",  role:"Data + CRM",      icon:"📊", color:"#6366F1", desc:"Revenue, attribution, dashboards. Honest reporting.",   badge:"" },
];

const QUICK_STARTS: Record<string, string> = {
  maven:  "Hi Maven, I run a roofing company in Tampa, FL. We've been in business 8 years, 12 employees, and our marketing has never really been organized. Where do we start?",
  iris:   "Iris, Maven has done discovery on us. I'm ready to work on our brand voice.",
  dash:   "Dash, we've never run paid ads before. Help me figure out where to start.",
  poppy:  "Poppy, we're not on social at all. What's the right move for a construction company?",
  sage:   "Sage, we have a basic website but we've never done any SEO. Can you help?",
  echo:   "Echo, we have zero follow-up process. Leads come in and we sometimes don't get back to them for days.",
  stella: "Stella, we have 14 Google reviews, mostly good, but we never ask customers to leave one. Help.",
  atlas:  "Atlas, I honestly have no idea where our best customers come from. Can you help me figure that out?",
};

export default function AtriumAgents() {
  const [activeId, setActiveId]       = useState<string|null>(null);
  const [convs, setConvs]             = useState<Record<string,Message[]>>({});
  const [bCtx, setBCtx]               = useState<BusinessCtx>({});
  const [loading, setLoading]         = useState(false);
  const [input, setInput]             = useState("");
  const [completed, setCompleted]     = useState<Set<string>>(new Set());
  const [ctxOpen, setCtxOpen]         = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[convs, activeId]);
  useEffect(()=>{ if(activeId) inputRef.current?.focus(); },[activeId]);

  const agent = AGENTS.find(a=>a.id===activeId);
  const msgs  = activeId ? (convs[activeId]||[]) : [];

  const send = async (text: string) => {
    if(!activeId||!text.trim()||loading) return;
    const userMsg: Message = { role:"user", content:text };
    const updated = [...(convs[activeId]||[]), userMsg];
    setConvs(p=>({...p,[activeId]:updated}));
    setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/agents",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ agentId:activeId, messages:updated, businessContext:bCtx }),
      });
      const data = await res.json();
      if(data.message) {
        setConvs(p=>({...p,[activeId]:[...updated,{role:"assistant",content:data.message}]}));
        if(data.contextUpdate) setBCtx(p=>({...p,...data.contextUpdate}));
        setCompleted(p=>new Set([...p,activeId]));
      }
    } catch(e) {
      setConvs(p=>({...p,[activeId]:[...updated,{role:"assistant",content:"Connection error — check ANTHROPIC_API_KEY."}]}));
    }
    setLoading(false);
  };

  const quickStart = (id:string) => {
    setActiveId(id);
    setTimeout(()=>send(QUICK_STARTS[id]||`Hi ${id}, I'm ready to get started.`),100);
  };

  const ctxKeys = Object.keys(bCtx).filter(k=>bCtx[k]&&bCtx[k]!=="");

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"#F8FAFC",fontFamily:"system-ui,-apple-system,sans-serif"}}>

      {/* HEADER */}
      <div style={{background:"#0F172A",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {activeId && (
            <button onClick={()=>setActiveId(null)} style={{background:"none",border:"none",color:"#64748B",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0}}>
              ← Team
            </button>
          )}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:15,fontWeight:700,color:"#F1F5F9"}}>Atrium</span>
              <span style={{fontSize:11,color:"#334155"}}>Your marketing team</span>
            </div>
            {activeId && agent && (
              <div style={{fontSize:11,color:agent.color,marginTop:1}}>{agent.icon} Talking to {agent.name} · {agent.role}</div>
            )}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {ctxKeys.length>0 && (
            <button onClick={()=>setCtxOpen(!ctxOpen)} style={{fontSize:10,padding:"4px 10px",background:"#00C8A020",color:"#00C8A0",border:"1px solid #00C8A044",borderRadius:5,cursor:"pointer"}}>
              {ctxKeys.length} context fields {ctxOpen?"▲":"▼"}
            </button>
          )}
          <div style={{display:"flex",gap:4}}>
            {AGENTS.map(a=>(
              <div key={a.id} onClick={()=>setActiveId(a.id)} title={a.name}
                style={{width:8,height:8,borderRadius:"50%",background:completed.has(a.id)?a.color:"#1E293B",cursor:"pointer",border:`1px solid ${a.color}44`}} />
            ))}
          </div>
        </div>
      </div>

      {/* BUSINESS CONTEXT DRAWER */}
      {ctxOpen && ctxKeys.length>0 && (
        <div style={{background:"#0A1520",borderBottom:"1px solid #1E293B",padding:"10px 16px",flexShrink:0}}>
          <div style={{fontSize:9,color:"#475569",letterSpacing:"2px",textTransform:"uppercase",marginBottom:8}}>Business context — shared across all agents</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {ctxKeys.map(k=>(
              <div key={k} style={{fontSize:10,padding:"3px 8px",background:"#0F172A",border:"1px solid #1E293B",borderRadius:4,color:"#94A3B8"}}>
                <span style={{color:"#475569"}}>{k}: </span>
                <span style={{color:"#CBD5E1"}}>{Array.isArray(bCtx[k])?bCtx[k].join(", "):String(bCtx[k]).substring(0,60)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AGENT GRID */}
      {!activeId && (
        <div style={{flex:1,overflowY:"auto",padding:16}}>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:600,color:"#0F172A",marginBottom:4}}>Your marketing team — 8 specialists</div>
            <div style={{fontSize:12,color:"#64748B"}}>Each agent has a specific job. Start with Maven for discovery. Then engage specialists in any order. They share what they learn.</div>
          </div>

          {/* Context status */}
          {ctxKeys.length===0 && (
            <div style={{padding:"10px 14px",background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:8,marginBottom:14,fontSize:12,color:"#92400E",display:"flex",gap:8,alignItems:"center"}}>
              <span>💡</span>
              <span>Start with <strong>Maven</strong> to run discovery. The more she learns, the smarter every other agent becomes.</span>
            </div>
          )}
          {ctxKeys.length>=3 && (
            <div style={{padding:"10px 14px",background:"#F0FDF4",border:"1px solid #86EFAC",borderRadius:8,marginBottom:14,fontSize:12,color:"#15803D",display:"flex",gap:8,alignItems:"center"}}>
              <span>✓</span>
              <span><strong>{bCtx.company_name||"Your business"}</strong> context loaded. All agents are reading from the same discovery.</span>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:9}}>
            {AGENTS.map(a=>{
              const done = completed.has(a.id);
              const msgs = convs[a.id]||[];
              return (
                <div key={a.id} style={{background:"#fff",border:`1px solid ${done?a.color+"44":"#E2E8F0"}`,borderTop:`2px solid ${a.color}`,borderRadius:10,padding:"13px 14px",cursor:"pointer",position:"relative"}}
                  onClick={()=>setActiveId(a.id)}>
                  {a.badge&&<div style={{position:"absolute",top:10,right:10,fontSize:9,background:a.color+"20",color:a.color,padding:"2px 7px",borderRadius:99,fontWeight:600}}>{a.badge}</div>}
                  {done&&<div style={{position:"absolute",top:10,right:10,fontSize:10,color:a.color,fontWeight:700}}>✓ Active</div>}
                  <div style={{fontSize:22,marginBottom:7}}>{a.icon}</div>
                  <div style={{fontSize:14,fontWeight:600,color:"#0F172A"}}>{a.name}</div>
                  <div style={{fontSize:11,color:a.color,fontWeight:600,marginBottom:5}}>{a.role}</div>
                  <div style={{fontSize:11,color:"#64748B",lineHeight:1.5,marginBottom:10}}>{a.desc}</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={e=>{e.stopPropagation();setActiveId(a.id);}} style={{flex:1,padding:"6px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                      {msgs.length>0?"Continue":"Open"}
                    </button>
                    {msgs.length===0&&(
                      <button onClick={e=>{e.stopPropagation();quickStart(a.id);}} style={{flex:1,padding:"6px",background:a.color+"15",color:a.color,border:`1px solid ${a.color}44`,borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                        Quick start
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* KOVA handoff */}
          <div style={{marginTop:14,padding:"12px 14px",background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:10,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{fontSize:20,flexShrink:0}}>🔗</div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:"#1E40AF",marginBottom:2}}>Day 8 — The KOVA handoff</div>
              <div style={{fontSize:11,color:"#3B82F6"}}>When Maven completes discovery, KOVA reads the business_knowledge and builds your CRM — pipelines, lifecycles, contact strategy — without a consultant. Agents do the configuration. You review and approve.</div>
            </div>
          </div>
        </div>
      )}

      {/* AGENT CONVERSATION */}
      {activeId && agent && (
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* Agent info bar */}
          <div style={{background:"#fff",borderBottom:"1px solid #E2E8F0",padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:agent.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{agent.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:"#0F172A"}}>{agent.name}</div>
              <div style={{fontSize:11,color:agent.color}}>{agent.role}</div>
            </div>
            {/* Other agents quick-switch */}
            <div style={{display:"flex",gap:4}}>
              {AGENTS.filter(a=>a.id!==activeId).slice(0,4).map(a=>(
                <button key={a.id} onClick={()=>setActiveId(a.id)} title={`Switch to ${a.name}`}
                  style={{width:28,height:28,borderRadius:"50%",background:completed.has(a.id)?a.color+"20":"#F8FAFC",border:`1px solid ${a.color}44`,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {a.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
            {msgs.length===0&&(
              <div style={{textAlign:"center",padding:"28px 20px",color:"#94A3B8"}}>
                <div style={{fontSize:28,marginBottom:8}}>{agent.icon}</div>
                <div style={{fontSize:13,fontWeight:600,color:"#64748B",marginBottom:4}}>Talk to {agent.name}</div>
                <div style={{fontSize:11,marginBottom:16}}>{agent.desc}</div>
                <button onClick={()=>send(QUICK_STARTS[activeId]||`Hi ${agent.name}, I'm ready.`)}
                  style={{padding:"8px 18px",background:agent.color,color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  Start conversation
                </button>
              </div>
            )}
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",gap:8,justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-end"}}>
                {m.role==="assistant"&&(
                  <div style={{width:28,height:28,borderRadius:"50%",background:agent.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginBottom:2}}>{agent.icon}</div>
                )}
                <div style={{maxWidth:"78%",padding:"10px 13px",borderRadius:m.role==="user"?"10px 10px 2px 10px":"10px 10px 10px 2px",background:m.role==="user"?agent.color:"#fff",color:m.role==="user"?"#fff":"#0F172A",fontSize:12,lineHeight:1.7,border:m.role==="assistant"?"1px solid #E2E8F0":"none",whiteSpace:"pre-wrap"}}>
                  {m.content}
                </div>
                {m.role==="user"&&(
                  <div style={{width:28,height:28,borderRadius:"50%",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0,marginBottom:2}}>U</div>
                )}
              </div>
            ))}
            {loading&&(
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:agent.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{agent.icon}</div>
                <div style={{padding:"10px 14px",background:"#fff",border:"1px solid #E2E8F0",borderRadius:"10px 10px 10px 2px",display:"flex",gap:4,alignItems:"center"}}>
                  {[0,1,2].map(j=><div key={j} style={{width:6,height:6,borderRadius:"50%",background:agent.color,animation:`pulse 1.2s ${j*0.2}s ease-in-out infinite`}} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {msgs.length>0&&msgs.length<3&&(
            <div style={{padding:"6px 14px",display:"flex",gap:5,overflowX:"auto",borderTop:"1px solid #F1F5F9",flexShrink:0}}>
              {activeId==="maven"&&["Tell me about our services","We have no CRM right now","Our main goal is more leads","We mostly get referrals"].map(q=>(
                <button key={q} onClick={()=>send(q)} style={{fontSize:10,padding:"4px 10px",borderRadius:99,border:"1px solid #E2E8F0",background:"#F8FAFC",cursor:"pointer",whiteSpace:"nowrap",color:"#64748B"}}>{q}</button>
              ))}
              {activeId==="iris"&&["We're professional but approachable","Definitely NOT corporate sounding","We want to sound like an expert neighbors would trust"].map(q=>(
                <button key={q} onClick={()=>send(q)} style={{fontSize:10,padding:"4px 10px",borderRadius:99,border:"1px solid #E2E8F0",background:"#F8FAFC",cursor:"pointer",whiteSpace:"nowrap",color:"#64748B"}}>{q}</button>
              ))}
              {activeId==="echo"&&["We lose most leads after the first call","Customers rarely leave reviews unless we ask","Our average job takes 3–5 days"].map(q=>(
                <button key={q} onClick={()=>send(q)} style={{fontSize:10,padding:"4px 10px",borderRadius:99,border:"1px solid #E2E8F0",background:"#F8FAFC",cursor:"pointer",whiteSpace:"nowrap",color:"#64748B"}}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{padding:"10px 14px",background:"#fff",borderTop:"1px solid #E2E8F0",display:"flex",gap:8,flexShrink:0}}>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send(input))}
              placeholder={`Message ${agent.name}…`}
              disabled={loading}
              style={{flex:1,padding:"9px 12px",border:"1px solid #E2E8F0",borderRadius:8,fontSize:12,color:"#0F172A",background:"#F8FAFC",outline:"none"}} />
            <button onClick={()=>send(input)} disabled={loading||!input.trim()}
              style={{padding:"9px 18px",background:input.trim()&&!loading?agent.color:"#E2E8F0",color:input.trim()&&!loading?"#fff":"#94A3B8",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {loading?"…":"Send"}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}
