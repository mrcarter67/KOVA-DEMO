import { useState, useRef, useCallback, useEffect } from "react";
import { Inbox, Filter, Search, Settings2, Brain, ClipboardList, Radio, Users, Clock, Check, CheckCircle2, Zap } from "lucide-react";
import { IE } from "@/lib/icon-mode";

type IconMap = Record<string, React.ComponentType<any>>;
const PIPE_ICON_MAP: IconMap = { Inbox, Filter, Search, Settings2, Brain, ClipboardList, Radio, Users, Clock };
function LkIcon({ m, n, size, color }: { m: IconMap; n: string; size: number; color?: string }) {
  const Ic = m[n];
  return Ic ? <Ic size={size} color={color} /> : null;
}

const CW = 162, CH = 92;

const STAGES = [
  { id:"ingest",    label:"Ingest",      icon:"Inbox",         emoji:"📥", color:"#00C896", glow:"#00C89655", desc:"County Records · MLS · APIs",           type:"data",   count:2840 },
  { id:"scrub",     label:"Scrub",       icon:"Filter",        emoji:"🧹", color:"#00C896", glow:"#00C89655", desc:"Normalize · Dedup · Validate",          type:"data",   count:2761 },
  { id:"skiptrace", label:"Skip Trace",  icon:"Search",        emoji:"🔍", color:"#3B9EFF", glow:"#3B9EFF55", desc:"BeenVerified · TLO · Whitepages",       type:"enrich", count:2588 },
  { id:"profile",   label:"Profile",     icon:"Settings2",     emoji:"⚙️", color:"#3B9EFF", glow:"#3B9EFF55", desc:"Vertical Config · Signal Weights",      type:"enrich", count:2588 },
  { id:"score",     label:"AI Score",    icon:"Brain",         emoji:"🧠", color:"#A78BFA", glow:"#A78BFA55", desc:"Claude Sonnet · 0–100 Composite",       type:"ai",     count:2401 },
  { id:"listbuild", label:"List Build",  icon:"ClipboardList", emoji:"📋", color:"#F59E0B", glow:"#F59E0B55", desc:"Filter · Stack · Rank",                 type:"output", count:1847 },
  { id:"outreach",  label:"Outreach",    icon:"Radio",         emoji:"📡", color:"#F59E0B", glow:"#F59E0B55", desc:"SMS · Email · AI-Personalized",         type:"output", count:934  },
  { id:"crm",       label:"CRM",         icon:"Users",         emoji:"👥", color:"#10B981", glow:"#10B98155", desc:"Pipeline · Activities · Insights",      type:"output", count:934  },
  { id:"reports",   label:"Reports",     icon:"Clock",         emoji:"⏰", color:"#10B981", glow:"#10B98155", desc:"Monday AM · Claude-Generated Brief",     type:"output", count:189  },
];

const CONNS: [string,string][] = [
  ["ingest","scrub"],["scrub","skiptrace"],["skiptrace","profile"],
  ["profile","score"],["score","listbuild"],["listbuild","outreach"],
  ["outreach","crm"],["crm","reports"],
];

const INIT: Record<string,{x:number,y:number}> = {
  ingest:    {x:28,  y:48  },
  scrub:     {x:234, y:48  },
  skiptrace: {x:440, y:48  },
  profile:   {x:646, y:48  },
  score:     {x:646, y:220 },
  listbuild: {x:440, y:220 },
  outreach:  {x:234, y:220 },
  crm:       {x:28,  y:220 },
  reports:   {x:28,  y:392 },
};

const RECORDS = [
  {name:"Sarah Mitchell",   co:"Apex Realty",         score:88, insight:"High distress + equity signals",    src:"County Assessor"},
  {name:"Priya Sharma",     co:"Clearwater Invest.",  score:91, insight:"Distress Index 94% — priority",     src:"MLS / RETS"},
  {name:"Marcus Williams",  co:"Gulf Coast Homes",    score:44, insight:"Low data completeness — 62%",       src:"Business License"},
  {name:"Dr. Linda Okafor", co:"Okafor Family Med.",  score:87, insight:"Expansion signal — 2nd location",   src:"NPI Registry"},
  {name:"Greg Harmon",      co:"Harmon Industrial",   score:89, insight:"$2.1M equipment cycle active",      src:"UCC Filings"},
];

const STAGE_ORDER = ["ingest","scrub","skiptrace","profile","score","listbuild","outreach","crm","reports"];

export default function PipelineViz() {
  const [pos, setPos]           = useState({...INIT});
  const [runStep, setRunStep]   = useState(-1);
  const [running, setRunning]   = useState(false);
  const [done, setDone]         = useState(false);
  const [recIdx, setRecIdx]     = useState(0);
  const [curRec, setCurRec]     = useState<typeof RECORDS[0]|null>(null);
  const [aiLog, setAiLog]       = useState([
    "● System online — all services connected",
    "● Claude claude-sonnet-4 ready",
    "● Scoring weights loaded",
    "● Awaiting next record…",
  ]);
  const [stats, setStats]       = useState({processed:2588, scored:2401, outreach:934, saved:"$4.2M"});
  const [ticks, setTicks]       = useState(0);
  const [activeConn, setActiveConn] = useState<string|null>(null);

  const dragRef  = useRef<{id:string;ox:number;oy:number;mx:number;my:number}|null>(null);
  const timerRef = useRef<any>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  // Live tick for particle animation variety
  useEffect(()=>{
    const t = setInterval(()=>setTicks(n=>n+1),50);
    return ()=>clearInterval(t);
  },[]);

  // ── Drag ─────────────────────────────────────────────────────────────────
  const startDrag = (id:string,e:React.MouseEvent)=>{
    e.preventDefault(); e.stopPropagation();
    const rect = wrapRef.current!.getBoundingClientRect();
    dragRef.current = {id, ox:pos[id].x, oy:pos[id].y, mx:e.clientX-rect.left, my:e.clientY-rect.top};
  };

  const onMove = useCallback((e:React.MouseEvent<HTMLDivElement>)=>{
    if(!dragRef.current) return;
    const rect = wrapRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const {id,ox,oy,mx,my} = dragRef.current;
    setPos(p=>({...p,[id]:{x:ox+cx-mx, y:oy+cy-my}}));
  },[]);

  const endDrag = ()=>{ dragRef.current = null; };

  // ── Run simulation ─────────────────────────────────────────────────────────
  const runSim = ()=>{
    if(running) return;
    const rec = RECORDS[recIdx % RECORDS.length];
    setRecIdx(i=>i+1); setCurRec(rec);
    setRunning(true); setDone(false); setRunStep(0);
    setAiLog(prev=>[`▶  Ingesting: ${rec.name} · ${rec.src}`, ...prev.slice(0,9)]);

    let step = 0;
    timerRef.current = setInterval(()=>{
      step++;
      setRunStep(step);
      const sid = STAGE_ORDER[step];
      const prevSid = STAGE_ORDER[step-1];
      if(prevSid && sid) setActiveConn(`${prevSid}-${sid}`);

      const msgs: Record<string,string[]> = {
        scrub:     [`[SCRUB] Normalized: "${rec.name}"`, `   Phone: +1 (305) 555-0142 · Quality 96%`],
        skiptrace: [`[SEARCH] Skip tracing via BeenVerified…`, `   >> Phone confirmed · Email resolved`],
        profile:   [`[PROFILE] ${rec.co}`, `   Weights applied · ${rec.insight}`],
        score:     [`[AI] Claude scoring record…`, `   Analyzing ${rec.insight}`],
        listbuild: [`[LIST] Ranked #${Math.floor(Math.random()*8)+2} in priority list`],
        outreach:  [`[OUTREACH] AI personalizing message…`, `   >> SMS queued · Hi ${rec.name.split(" ")[0]}…`],
        crm:       [`[CRM] Added to pipeline · Stage: Qualified`],
        reports:   [`[REPORT] Added to Monday briefing`],
      };
      const logLines = msgs[sid] || [];
      if(logLines.length) setAiLog(prev=>[...logLines.reverse(), ...prev.slice(0,9)]);

      if(sid==="score"){
        setTimeout(()=>{
          setAiLog(prev=>[`[SCORE] ${rec.score}/100 — "${rec.insight.substring(0,36)}"`, ...prev.slice(0,9)]);
          setStats(s=>({...s,scored:s.scored+1}));
        },700);
      }
      if(sid==="outreach") setStats(s=>({...s,outreach:s.outreach+1}));

      if(step >= STAGE_ORDER.length-1){
        clearInterval(timerRef.current);
        setActiveConn(null);
        setTimeout(()=>{
          setRunning(false); setDone(true); setRunStep(-1);
          setStats(s=>({...s,processed:s.processed+1}));
          setAiLog(prev=>[`[DONE] ${rec.name} complete — score ${rec.score} · outreach queued`, ...prev.slice(0,9)]);
        },600);
      }
    },1150);
  };

  const reset = ()=>{
    clearInterval(timerRef.current);
    setRunning(false); setDone(false); setRunStep(-1);
    setActiveConn(null); setCurRec(null);
    setPos({...INIT});
    setAiLog(["● Positions reset","● Awaiting next record…"]);
  };

  // ── Connection path ────────────────────────────────────────────────────────
  const ctr = (id:string)=>({ x:pos[id].x+CW/2, y:pos[id].y+CH/2 });

  const bezier = (a:string,b:string)=>{
    const f=ctr(a); const t=ctr(b);
    const mx=(f.x+t.x)/2;
    return `M ${f.x} ${f.y} C ${mx} ${f.y} ${mx} ${t.y} ${t.x} ${t.y}`;
  };

  const stageIdx = (id:string)=>STAGE_ORDER.indexOf(id);
  const isActive = (id:string)=>runStep>=0 && stageIdx(id)<=runStep;
  const isCurrent = (id:string)=>stageIdx(id)===runStep;

  return (
    <div style={{background:"#040810",minHeight:"100%",fontFamily:"'JetBrains Mono',monospace",userSelect:"none",overflow:"hidden"}}>
      <style suppressHydrationWarning>{`
        * { box-sizing:border-box; }
        .stage-card { transition: box-shadow 0.3s, border-color 0.3s; }
        .stage-card:hover { filter:brightness(1.08); }
        @keyframes pulse2{0%,100%{opacity:.9}50%{opacity:.4}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(400%)}}
        @keyframes glow-pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes flow-in{0%{opacity:0;transform:translateY(-4px)}100%{opacity:1;transform:none}}
        .log-line{animation:flow-in .25s ease}
        .ai-blink{animation:pulse2 1.4s ease-in-out infinite}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1E293B}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:"1px solid #0D1A2B",background:"#040D16"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontSize:15,fontWeight:700,color:"#F1F5F9",letterSpacing:"-0.5px"}}>KOVA<span style={{color:"#00C896"}}> // </span>Data Pipeline</div>
          <span style={{fontSize:9,padding:"2px 8px",background:"#00C89620",color:"#00C896",borderRadius:3,fontWeight:700,letterSpacing:"2px",border:"1px solid #00C89644"}}>LIVE SIM</span>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <div style={{display:"flex",gap:10,marginRight:6}}>
            {[["Processed",stats.processed.toLocaleString()],["Scored",stats.scored.toLocaleString()],["Outreach",stats.outreach.toLocaleString()]].map(([l,v])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9"}}>{v}</div>
                <div style={{fontSize:8,color:"#334155",letterSpacing:"1.5px"}}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={runSim} disabled={running} style={{padding:"6px 16px",background:running?"#0F1A28":"#00C896",color:running?"#334155":"#000",border:`1px solid ${running?"#1E293B":"#00C896"}`,borderRadius:5,fontSize:11,fontWeight:700,cursor:running?"default":"pointer",fontFamily:"inherit",letterSpacing:"1px"}}>
            {running?"● RUNNING…":"▶ RUN PIPELINE"}
          </button>
          <button onClick={reset} style={{padding:"6px 12px",background:"transparent",color:"#334155",border:"1px solid #1E293B",borderRadius:5,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>RESET</button>
        </div>
      </div>

      <div style={{display:"flex",height:"calc(100% - 48px)"}}>
        {/* ── CANVAS ── */}
        <div ref={wrapRef} onMouseMove={onMove} onMouseUp={endDrag} onMouseLeave={endDrag}
          style={{flex:1,position:"relative",overflow:"hidden",cursor:dragRef.current?"grabbing":"default"}}>

          {/* Starfield dots */}
          {Array.from({length:60}).map((_,i)=>(
            <div key={i} style={{position:"absolute",width:i%7===0?2:1,height:i%7===0?2:1,borderRadius:"50%",background:"#1E293B",
              left:`${(i*137.5)%100}%`,top:`${(i*97.3)%100}%`,opacity:0.5+(i%3)*0.15}} />
          ))}

          {/* SVG connections */}
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",overflow:"visible",pointerEvents:"none"}}>
            <defs>
              {STAGES.map(s=>(
                <filter key={s.id} id={`gf-${s.id}`}>
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              ))}
              <filter id="gf-conn">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Connection lines */}
            {CONNS.map(([a,b])=>{
              const connId = `${a}-${b}`;
              const d = bezier(a,b);
              const aStage = STAGES.find(s=>s.id===a)!;
              const isConnActive = activeConn===connId || (isActive(a)&&isActive(b));
              const col = isConnActive ? aStage.color : "#0D1A2B";
              const opacity = isConnActive ? 1 : 0.7;
              return (
                <g key={connId}>
                  {/* Glow layer */}
                  {isConnActive && <path d={d} stroke={aStage.color} strokeWidth="6" fill="none" opacity="0.15" filter="url(#gf-conn)" />}
                  {/* Main line */}
                  <path id={`path-${connId}`} d={d} stroke={col} strokeWidth={isConnActive?1.5:1} fill="none" strokeDasharray={isConnActive?"none":"4 4"} opacity={opacity} />
                  {/* Particles */}
                  {isConnActive && [0,1,2].map(pi=>(
                    <circle key={pi} r="3.5" fill={aStage.color} opacity="0.9" filter={`url(#gf-${a})`}>
                      <animateMotion dur={`${1.8+pi*0.4}s`} repeatCount="indefinite" begin={`${pi*0.6}s`}>
                        <mpath href={`#path-${connId}`}/>
                      </animateMotion>
                    </circle>
                  ))}
                  {/* Always-on slow particles */}
                  {!isConnActive && (
                    <circle r="2" fill="#1E293B" opacity="0.6">
                      <animateMotion dur={`${4+CONNS.indexOf([a,b])*0.7}s`} repeatCount="indefinite" begin={`${CONNS.indexOf([a,b])*0.5}s`}>
                        <mpath href={`#path-${connId}`}/>
                      </animateMotion>
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Stage windows */}
          {STAGES.map((stage)=>{
            const active   = isCurrent(stage.id);
            const complete = !active && isActive(stage.id);
            const p        = pos[stage.id];
            return (
              <div key={stage.id} className="stage-card"
                onMouseDown={e=>startDrag(stage.id,e)}
                style={{
                  position:"absolute",left:p.x,top:p.y,width:CW,height:CH,
                  background: active?"#0D1A2B":complete?"#080F18":"#070C14",
                  border:`1px solid ${active?stage.color:complete?stage.color+"66":"#0D1A2B"}`,
                  borderRadius:9,cursor:"grab",overflow:"hidden",
                  boxShadow: active?`0 0 20px ${stage.color}44, 0 0 40px ${stage.color}22`:complete?`0 0 8px ${stage.color}22`:"0 2px 8px rgba(0,0,0,0.5)",
                  transition:"box-shadow 0.4s,border-color 0.4s",
                }}>

                {/* Scanline effect when active */}
                {active && <div style={{position:"absolute",inset:0,background:`linear-gradient(transparent,${stage.color}12,transparent)`,animation:"scanline 1.2s linear infinite",pointerEvents:"none",zIndex:10}} />}

                {/* Top bar */}
                <div style={{background:`linear-gradient(90deg,${stage.color}22,transparent)`,borderBottom:`1px solid ${stage.color}22`,padding:"6px 9px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <IE emoji={stage.emoji} Icon={PIPE_ICON_MAP[stage.icon] || Inbox} size={14} color={active?stage.color:complete?stage.color+"cc":"#94A3B8"} />
                    <span style={{fontSize:11,fontWeight:700,color:active?stage.color:complete?stage.color+"cc":"#94A3B8",letterSpacing:"0.5px"}}>{stage.label}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    {active && <span className="ai-blink" style={{width:6,height:6,borderRadius:"50%",background:stage.color,display:"inline-block"}} />}
                    {complete && <IE emoji="✓" Icon={Check} size={8} color={stage.color} />}
                    <span style={{fontSize:8,color:"#334155",background:"#0A1018",padding:"1px 5px",borderRadius:2,border:"1px solid #1E293B"}}>
                      {stage.type==="ai"?"AI":stage.type==="enrich"?"ENR":"SYS"}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div style={{padding:"7px 9px"}}>
                  <div style={{fontSize:9,color:"#334155",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{stage.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:16,fontWeight:700,color:active?stage.color:complete?stage.color+"aa":"#1E293B"}}>{stage.count.toLocaleString()}</div>
                    <div style={{fontSize:8,color:"#1E293B"}}>RECORDS</div>
                  </div>
                  {/* Mini progress bar */}
                  <div style={{height:2,background:"#0A1018",borderRadius:99,overflow:"hidden",marginTop:6}}>
                    <div style={{width:active?"60%":complete?"100%":"30%",height:"100%",background:active?stage.color:complete?stage.color:"#1E293B",borderRadius:99,transition:"width 1s"}} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Current record card */}
          {curRec && runStep >= 0 && (
            <div style={{
              position:"absolute",
              left: pos[STAGE_ORDER[Math.min(runStep,STAGE_ORDER.length-1)]]?.x + CW/2 - 75 || 0,
              top:  pos[STAGE_ORDER[Math.min(runStep,STAGE_ORDER.length-1)]]?.y + CH + 8 || 0,
              width:150,padding:"7px 10px",
              background:"#0A1520",border:"1px solid #00C89666",borderRadius:7,
              boxShadow:"0 0 16px #00C89633",
              fontSize:10,color:"#CBD5E1",lineHeight:1.6,
              pointerEvents:"none",zIndex:50,
              animation:"flow-in 0.3s ease",
            }}>
              <div style={{fontWeight:700,color:"#00C896",marginBottom:2,fontSize:11}}>{curRec.name}</div>
              <div style={{color:"#475569",fontSize:9}}>{curRec.co}</div>
              {runStep>=4 && <div style={{color:"#A78BFA",marginTop:3,fontSize:9}}>Score: {curRec.score}/100</div>}
            </div>
          )}

          {/* Done celebration */}
          {done && (
            <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",background:"#0A1520",border:"1px solid #00C896",borderRadius:12,padding:"16px 24px",textAlign:"center",boxShadow:"0 0 40px #00C89633",zIndex:100,animation:"flow-in 0.3s ease"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><IE emoji="✅" Icon={CheckCircle2} size={22} color="#00C896" /></div>
              <div style={{fontSize:13,fontWeight:700,color:"#00C896"}}>{curRec?.name}</div>
              <div style={{fontSize:11,color:"#475569",marginTop:2}}>Score {curRec?.score}/100 · Outreach queued</div>
              <button onClick={runSim} style={{marginTop:10,padding:"5px 14px",background:"#00C896",color:"#000",border:"none",borderRadius:5,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Next Record ▶</button>
            </div>
          )}

          {/* Drag hint */}
          <div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",fontSize:9,color:"#1E293B",letterSpacing:"2px",pointerEvents:"none"}}>
            DRAG STAGES TO REARRANGE · CLICK ▶ RUN PIPELINE
          </div>
        </div>

        {/* ── AI PANEL ── */}
        <div style={{width:240,borderLeft:"1px solid #0D1A2B",background:"#040C16",display:"flex",flexDirection:"column",flexShrink:0}}>
          {/* Claude header */}
          <div style={{padding:"10px 12px",borderBottom:"1px solid #0D1A2B",display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#00C896,#3B9EFF)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><IE emoji="⚡" Icon={Zap} size={13} color="#fff" /></div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#F1F5F9"}}>Claude API</div>
              <div style={{fontSize:9,color:"#00C896",display:"flex",alignItems:"center",gap:4}}>
                <span className="ai-blink" style={{width:5,height:5,borderRadius:"50%",background:"#00C896",display:"inline-block"}} />
                <span>claude-sonnet-4 · active</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,borderBottom:"1px solid #0D1A2B"}}>
            {[["Scored",stats.scored.toLocaleString(),"#A78BFA"],["Outreach",stats.outreach.toLocaleString(),"#F59E0B"],["Processed",stats.processed.toLocaleString(),"#00C896"],["Pipeline",stats.saved,"#3B9EFF"]].map(([l,v,c])=>(
              <div key={l} style={{padding:"8px 10px",borderBottom:"1px solid #0D1A2B",borderRight:"1px solid #0D1A2B"}}>
                <div style={{fontSize:13,fontWeight:700,color:c as string}}>{v}</div>
                <div style={{fontSize:8,color:"#334155",letterSpacing:"1px"}}>{l}</div>
              </div>
            ))}
          </div>

          {/* Activity log */}
          <div style={{padding:"8px 10px 4px",fontSize:8,color:"#334155",letterSpacing:"2px",borderBottom:"1px solid #0D1A2B"}}>ACTIVITY LOG</div>
          <div style={{flex:1,overflowY:"auto",padding:"4px 0"}}>
            {aiLog.map((line,i)=>(
              <div key={i} className="log-line" style={{
                padding:"4px 10px",
                fontSize:10,lineHeight:1.5,
                color: line.startsWith("[DONE]")?"#00C896":line.startsWith("[SCORE]")?"#A78BFA":line.startsWith("[AI]")?"#A78BFA":line.startsWith("▶")?"#F1F5F9":line.startsWith("●")?"#334155":"#475569",
                borderBottom:"1px solid #060D16",
                background:i===0?"#0A1520":"transparent",
              }}>{line}</div>
            ))}
          </div>

          {/* Stage legend */}
          <div style={{borderTop:"1px solid #0D1A2B",padding:"8px 10px"}}>
            <div style={{fontSize:8,color:"#334155",letterSpacing:"2px",marginBottom:6}}>STAGE TYPES</div>
            {[["data","Data Processing","#00C896"],["enrich","Enrichment","#3B9EFF"],["ai","AI Intelligence","#A78BFA"],["output","Output / Action","#F59E0B"]].map(([t,l,c])=>(
              <div key={t} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:c as string,flexShrink:0}} />
                <span style={{fontSize:9,color:"#475569"}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
