"use client";
import { useState, useRef, useEffect } from "react";
import { CONTACTS, COMPANIES, ALL_DEALS, ALL_STAGES, ACTIVITIES, VERTICAL_CONFIG, ALL_VERTICALS } from "@/lib/data";
import type { Contact, Company, Deal, View, Modal } from "@/lib/types";
import QuoteBuilder from "@/components/QuoteBuilder";
import DocumentCenter from "@/components/DocumentCenter";
import ContactDetail from "@/components/ContactDetail";
import MapView from "@/components/MapView";
import APIStatus from "@/components/APIStatus";
import FinancialHub from "@/components/FinancialHub";
import AgentDocumentAssistant from "@/components/AgentDocumentAssistant";
import PipelineViz from "@/components/PipelineViz";

type ExtView = View | "pipeline" | "ask" | "quotes" | "docs" | "map" | "finance" | "api";

export default function CRM() {
  const [vertId, setVertId]       = useState("real_estate");
  const [vertOpen, setVertOpen]   = useState(false);
  const [view, setView]           = useState<ExtView>("dashboard");
  const [selC, setSelC]           = useState<Contact|null>(null);
  const [selD, setSelD]           = useState<Deal|null>(null);
  const [selCo, setSelCo]         = useState<Company|null>(null);
  const [modal, setModal]         = useState<Modal>(null);
  const [showDocAgent, setShowDocAgent] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact|null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [cFilter, setCFilter]     = useState("all");
  const [search, setSearch]       = useState("");
  const [oTab, setOTab]           = useState<"sms"|"email"|"call">("sms");
  const [notifOpen, setNotifOpen] = useState(false);
  const [csvStep, setCsvStep]     = useState(0);
  const [lbMin, setLbMin]         = useState(60);
  const [lbStatus, setLbStatus]   = useState("all");
  const [report, setReport]       = useState<string|null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [scoring, setScoring]     = useState<Record<number,any>>({});
  const [scoringId, setScoringId] = useState<number|null>(null);
  const [personalizing, setPersonalizing] = useState(false);
  const msgRef = useRef<HTMLTextAreaElement>(null);

  // ── Score All state ───────────────────────────────────────────────────────
  const [scoringAll, setScoringAll]         = useState(false);
  const [scoreAllIdx, setScoreAllIdx]       = useState(0);
  const [scoreAllDone, setScoreAllDone]     = useState(false);

  // ── NL Query state ────────────────────────────────────────────────────────
  const [nlQ, setNlQ]           = useState("");
  const [nlAnswer, setNlAnswer] = useState<string|null>(null);
  const [nlLoading, setNlLoading] = useState(false);
  const [nlHistory, setNlHistory] = useState<{q:string,a:string}[]>([]);
  const nlBottomRef = useRef<HTMLDivElement>(null);

  const vert     = VERTICAL_CONFIG[vertId];
  const P        = vert.color;
  const contacts  = CONTACTS.filter(c => c.vertical === vertId);
  const companies = COMPANIES.filter(c => c.vertical === vertId);
  const DEALS     = ALL_DEALS.filter((d:any) => d.vertical === vertId);
  const activities = ACTIVITIES.filter((a:any) => !vertId || CONTACTS.find((c:any) => c.id === a.contactId && c.vertical === vertId));
  const allDeals   = DEALS;
  const pipeVal = allDeals.reduce((a:any,d:any)=>a+(d.value||0),0);
  const wonVal = allDeals.filter((d:any)=>d.stage==="Closed Won").reduce((a:any,d:any)=>a+(d.value||0),0);

  useEffect(()=>{ nlBottomRef.current?.scrollIntoView({behavior:"smooth"}); },[nlHistory,nlLoading]);

  const switchVertical = (id:string) => {
    setVertId(id); setVertOpen(false); setView("dashboard");
    setSelC(null); setSelD(null); setSelCo(null);
    setReport(null); setScoring({});
    setNlAnswer(null); setNlHistory([]); setScoreAllDone(false);
  };

  const ini = (f:string,l:string)=>(f[0]||"")+(l[0]||"");
  const fv  = (v:number)=>"$"+(v>=1000?(v/1000).toFixed(0)+"K":v);

  const srStyle = (sc:number|null,sz=34) => ({
    width:sz,height:sz,borderRadius:"50%",display:"flex",alignItems:"center",
    justifyContent:"center",fontSize:sz>34?13:11,fontWeight:700,flexShrink:0,cursor:"pointer",
    background:sc===null?"#F8FAFC":sc>=80?"#F0FDF4":sc>=60?"#FFFBEB":"#FEF2F2",
    border:`1.5px solid ${sc===null?"#E2E8F0":sc>=80?"#86EFAC":sc>=60?"#FDE68A":"#FCA5A5"}`,
    color:sc===null?"#94A3B8":sc>=80?"#15803D":sc>=60?"#B45309":"#B91C1C",
  });

  const bdg = (s:string) => ({
    fontSize:10,padding:"2px 7px",borderRadius:99,fontWeight:600,
    background:s==="new"?"#EFF6FF":s==="contacted"?"#FFFBEB":s==="qualified"?"#F0FDF4":"#F8FAFC",
    color:s==="new"?"#1D4ED8":s==="contacted"?"#B45309":s==="qualified"?"#15803D":"#64748B",
  });

  const goView = (v:ExtView)=>{ setView(v);setSelC(null);setSelD(null);setSelCo(null); };

  // ── Score one lead ─────────────────────────────────────────────────────────
  const scoreOne = async (c:Contact) => {
    setScoringId(c.id);
    const weights:Record<string,number>={};
    vert.signals?.forEach((s:any,i:number)=>{ weights[s]=[30,25,20,15,10][i]||10; });
    try {
      const res = await fetch("/api/score",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({record:c,vertical:vertId,tone:"professional",weights})});
      const data = await res.json();
      setScoring(prev=>({...prev,[c.id]:data}));
    } catch {}
    setScoringId(null);
    return;
  };

  // ── Score ALL contacts ─────────────────────────────────────────────────────
  const scoreAll = async () => {
    setScoringAll(true); setScoreAllDone(false); setScoreAllIdx(0);
    const weights:Record<string,number>={};
    vert.signals?.forEach((s:any,i:number)=>{ weights[s]=[30,25,20,15,10][i]||10; });
    for(let i=0;i<contacts.length;i++){
      setScoreAllIdx(i+1);
      const c = contacts[i];
      try {
        const res = await fetch("/api/score",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({record:c,vertical:vertId,tone:"professional",weights})});
        const data = await res.json();
        setScoring(prev=>({...prev,[c.id]:data}));
      } catch {}
      await new Promise(r=>setTimeout(r,600));
    }
    setScoringAll(false); setScoreAllDone(true);
  };

  // ── NL Query ───────────────────────────────────────────────────────────────
  const askQuery = async (q?:string) => {
    const question = q || nlQ.trim();
    if(!question||nlLoading) return;
    setNlQ(""); setNlLoading(true);
    try {
      const res = await fetch("/api/query",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({question,vertical:vert.label,contacts,deals:allDeals})});
      const data = await res.json();
      setNlHistory(prev=>[...prev,{q:question,a:data.answer||"No answer returned."}]);
    } catch {
      setNlHistory(prev=>[...prev,{q:question,a:"Failed to connect — check your API key."}]);
    }
    setNlLoading(false);
  };

  // ── Generate report ────────────────────────────────────────────────────────
  const generateReport = async () => {
    setGenLoading(true); setReport(null);
    try {
      const res = await fetch("/api/report",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({tenantName:`KOVA ${vert.label}`,vertical:vert.label,leads:contacts,deals:allDeals,tone:"professional"})});
      const data = await res.json();
      setReport(data.report||"");
    } catch { setReport("Failed to generate — check API key in Vercel."); }
    setGenLoading(false);
  };

  const personalizeMsg = async (c:Contact,template:string,channel:string) => {
    setPersonalizing(true);
    try {
      const res = await fetch("/api/personalize",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({lead:c,template,tone:"professional",channel})});
      const data = await res.json();
      if(msgRef.current) msgRef.current.value = data.message||template;
    } catch {}
    setPersonalizing(false);
  };

  const live = (cid:number)=>scoring[cid];
  const liveScore = (cid:number)=>scoring[cid]?.composite_score??null;
  const filteredContacts = contacts.filter(c=>
    (cFilter==="all"||c.status===cFilter)&&
    (!search||`${c.fn} ${c.ln} ${c.co}`.toLowerCase().includes(search.toLowerCase()))
  );

  // ════════════════════════ VIEWS ════════════════════════════════════════════

  const renderDashboard = () => (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
        {[[contacts.length,"Contacts"],[allDeals.length,"Open Deals"],["$"+Math.round(pipeVal/1000)+"K","Pipeline"],["$"+Math.round(wonVal/1000)+"K","Closed"]].map(([v,l])=>(
          <div key={l as string} style={{background:"#F8FAFC",borderRadius:10,padding:"10px 12px",border:"1px solid #E2E8F0"}}>
            <div style={{fontSize:10,color:"#94A3B8",marginBottom:2}}>{l}</div>
            <div style={{fontSize:20,fontWeight:700,color:"#0F172A"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Recent Activity</div>
          {activities.slice(0,4).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"6px 0",borderBottom:i<3?"1px solid #F1F5F9":"none"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>{a.icon}</div>
              <div><div style={{fontSize:11,color:"#1E293B",lineHeight:1.4}}><strong>{a.contact}</strong> — {a?.text?.substring(0,52)||""}…</div><div style={{fontSize:10,color:"#94A3B8",marginTop:1}}>{a.time}</div></div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Top Leads</div>
          {[...contacts].sort((a,b)=>b.score-a.score).slice(0,5).map(c=>(
            <div key={c.id} onClick={()=>{setSelC(c as any);setView("contacts");}} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F1F5F9",cursor:"pointer"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:P,flexShrink:0}}>{ini(c.fn,c.ln)}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"#1E293B"}}>{c.fn} {c.ln}</div><div style={{fontSize:10,color:"#64748B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.co}</div></div>
              <div onClick={e=>{e.stopPropagation();setModalData(c);setModal(null);}} style={srStyle(liveScore(c.id)||c.score)}>
                {scoringId===c.id?"…":(liveScore(c.id)??c.score)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick actions row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        <button onClick={()=>goView("pipeline")} style={{padding:"12px",background:"linear-gradient(135deg,#0F172A,#1E293B)",border:"none",borderRadius:10,cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:18,marginBottom:4}}>🔄</div>
          <div style={{fontSize:12,fontWeight:700,color:"#F1F5F9"}}>Run Pipeline</div>
          <div style={{fontSize:10,color:"#64748B",marginTop:1}}>Watch data flow live</div>
        </button>
        <button onClick={()=>goView("ask")} style={{padding:"12px",background:`linear-gradient(135deg,${P}22,${P}11)`,border:`1px solid ${P}33`,borderRadius:10,cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:18,marginBottom:4}}>💬</div>
          <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>Ask Your Data</div>
          <div style={{fontSize:10,color:"#64748B",marginTop:1}}>Claude answers live</div>
        </button>
        <button onClick={scoreAll} disabled={scoringAll} style={{padding:"12px",background:scoringAll?"#F8FAFC":"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #86EFAC",borderRadius:10,cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:18,marginBottom:4}}>🧠</div>
          <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{scoringAll?`Scoring ${scoreAllIdx}/${contacts.length}…`:scoreAllDone?"All Scored ✓":"Score All Leads"}</div>
          <div style={{fontSize:10,color:"#64748B",marginTop:1}}>{contacts.length} contacts · Claude AI</div>
        </button>
      </div>
    </div>
  );

  // ── NL QUERY ──────────────────────────────────────────────────────────────
  const QUICK_Qs = [
    "Who should I call today?",
    "Which deals are most at risk?",
    `Show me leads with score over 80`,
    "What's my total pipeline value?",
    "Who hasn't been contacted yet?",
    "Give me a 3-sentence pipeline summary",
  ];

  const renderAsk = () => (
    <div>
      <div style={{marginBottom:16,padding:"14px 16px",background:`linear-gradient(135deg,${P}18,${P}08)`,border:`1px solid ${P}33`,borderRadius:12}}>
        <div style={{fontSize:14,fontWeight:700,color:"#0F172A"}}>💬 Ask Your {vert.label} Data</div>
        <div style={{fontSize:11,color:"#64748B",marginTop:3}}>Claude reads your live contacts, deals, and scores — then answers in plain English.</div>
      </div>

      {/* Quick questions */}
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
        {QUICK_Qs.map(q=>(
          <button key={q} onClick={()=>askQuery(q)} disabled={nlLoading} style={{fontSize:11,padding:"5px 11px",borderRadius:99,border:`1px solid ${P}44`,background:P+"10",color:P,cursor:"pointer",fontFamily:"inherit"}}>
            {q}
          </button>
        ))}
      </div>

      {/* Chat history */}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14,maxHeight:340,overflowY:"auto"}}>
        {nlHistory.map((item,i)=>(
          <div key={i}>
            {/* Question */}
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
              <div style={{maxWidth:"75%",padding:"9px 13px",borderRadius:"10px 10px 2px 10px",background:P,fontSize:12,color:"#fff",lineHeight:1.5}}>{item.q}</div>
            </div>
            {/* Answer */}
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,color:"#fff"}}>⚡</div>
              <div style={{flex:1,padding:"10px 13px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:"10px 10px 10px 2px",fontSize:12,color:"#0F172A",lineHeight:1.7}}>{item.a}</div>
            </div>
          </div>
        ))}
        {nlLoading && (
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,color:"#fff"}}>⚡</div>
            <div style={{padding:"10px 14px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:"10px 10px 10px 2px",display:"flex",gap:4}}>
              {[0,1,2].map(j=><div key={j} style={{width:6,height:6,borderRadius:"50%",background:P,animation:`kpulse 1.2s ${j*0.2}s ease-in-out infinite`}} />)}
            </div>
          </div>
        )}
        <div ref={nlBottomRef} />
      </div>

      {nlHistory.length===0&&!nlLoading&&(
        <div style={{textAlign:"center",padding:"30px",color:"#94A3B8",border:"1px dashed #E2E8F0",borderRadius:10,marginBottom:14}}>
          <div style={{fontSize:28,marginBottom:8}}>💬</div>
          <div style={{fontSize:13,fontWeight:600,color:"#64748B",marginBottom:4}}>Ask anything about your {vert.label} data</div>
          <div style={{fontSize:11}}>Try one of the quick questions above or type your own</div>
        </div>
      )}

      {/* Input */}
      <div style={{display:"flex",gap:8,position:"sticky",bottom:0,background:"#F8FAFC",padding:"10px 0 0"}}>
        <input value={nlQ} onChange={e=>setNlQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askQuery()} disabled={nlLoading}
          placeholder={`Ask about your ${vert.label.toLowerCase()} data…`}
          style={{flex:1,padding:"10px 13px",border:"1px solid #E2E8F0",borderRadius:9,fontSize:12,color:"#0F172A",background:"#fff"}} />
        <button onClick={()=>askQuery()} disabled={nlLoading||!nlQ.trim()} style={{padding:"10px 20px",background:nlQ.trim()&&!nlLoading?P:"#E2E8F0",color:nlQ.trim()&&!nlLoading?"#fff":"#94A3B8",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>Ask</button>
      </div>
    </div>
  );

  // ── CONTACTS ─────────────────────────────────────────────────────────────
  const renderContacts = () => selC ? renderContactDetail() : (
    <div>
      <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
        {["all","new","contacted","qualified","customer"].map(f=>(
          <button key={f} onClick={()=>setCFilter(f)} style={{fontSize:10,padding:"3px 9px",borderRadius:99,border:"1px solid",borderColor:cFilter===f?P:"#E2E8F0",background:cFilter===f?P+"15":"#fff",color:cFilter===f?P:"#64748B",cursor:"pointer"}}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
        ))}
        <span style={{fontSize:10,color:"#94A3B8",flex:1}}>{filteredContacts.length} contacts</span>
        <button onClick={scoreAll} disabled={scoringAll} style={{fontSize:11,padding:"4px 12px",background:scoringAll?P+"10":"#0F172A",color:scoringAll?P:"#fff",border:scoringAll?`1px solid ${P}44`:"none",borderRadius:7,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
          {scoringAll?<><span style={{animation:"kspin 1s linear infinite",display:"inline-block"}}>⟳</span> {scoreAllIdx}/{contacts.length}</>:scoreAllDone?"✓ All Scored":"🧠 Score All"}
        </button>
      </div>
      {filteredContacts.map(c=>(
        <div key={c.id} onClick={()=>setSelC(c as any)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 4px",borderBottom:"1px solid #F1F5F9",cursor:"pointer"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:P,flexShrink:0}}>{ini(c.fn,c.ln)}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1E293B"}}>{c.fn} {c.ln}</div>
            <div style={{fontSize:11,color:"#64748B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.co} · {c.city}</div>
            {live(c.id)?.ai_insight&&<div style={{fontSize:10,color:"#94A3B8",marginTop:1,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{live(c.id)?.ai_insight?.substring(0,65)}…</div>}
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <span style={bdg(c.status)}>{c.status}</span>
            <div onClick={e=>{e.stopPropagation();scoreOne(c);}} style={srStyle(liveScore(c.id))} title="Click to score with Claude">
              {scoringId===c.id?<span style={{fontSize:9}}>AI…</span>:(liveScore(c.id)??c.score)}
            </div>
          </div>
        </div>
      ))}
      {scoreAllDone&&(
        <div style={{marginTop:10,padding:"10px 12px",background:"#F0FDF4",border:"1px solid #86EFAC",borderRadius:8,fontSize:12,color:"#15803D",fontWeight:600}}>
          ✓ All {contacts.length} contacts scored by Claude — click any score ring to see the full breakdown
        </div>
      )}
    </div>
  );

  const defaultMsg=(c:Contact)=>oTab==="sms"?`Hi ${c.fn}, following up — do you have 10 minutes this week?`:oTab==="email"?`Hi ${c.fn},\n\nWanted to follow up on a few opportunities that match your profile.\n\nBest,`:"";

  const renderContactDetail = () => selC && (
    <div>
      <button onClick={()=>setSelC(null)} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#64748B",background:"none",border:"none",marginBottom:12,cursor:"pointer"}}>← Contacts</button>
      <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
        <div style={{width:46,height:46,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:P,flexShrink:0}}>{ini(selC.fn,selC.ln)}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:16,fontWeight:700,color:"#0F172A"}}>{selC.fn} {selC.ln}</span>
            <span style={bdg(selC.status)}>{selC.status}</span>
            <div onClick={()=>{setModalData(selC);setModal(null);}} style={srStyle(liveScore(selC.id)||selC.score,40)} title="Full breakdown">
              {scoringId===selC.id?"AI…":(liveScore(selC.id)??selC.score)}
            </div>
          </div>
          <div style={{fontSize:12,color:"#64748B",marginTop:2}}>{selC.role} · {selC.co}</div>
          <button onClick={()=>{setSelectedContact(selC as any);}} style={{marginTop:6,padding:"5px 12px",background:P,color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>View Full Profile →</button>
          <div style={{fontSize:11,color:"#94A3B8",marginTop:4,fontStyle:"italic"}}>{live(selC.id)?.ai_insight||selC.notes}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
        {[["Email",selC.email],["Phone",selC.phone],["Location",selC.city],["Open Deals",selC.deals]].map(([l,v])=>(
          <div key={l as string} style={{background:"#F8FAFC",borderRadius:7,padding:"7px 10px"}}>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{l}</div>
            <div style={{fontSize:12,color:"#0F172A"}}>{String(v)}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Outreach</div>
          <div style={{display:"flex",gap:2,marginBottom:8,background:"#F1F5F9",borderRadius:7,padding:3}}>
            {(["sms","email","call"] as const).map(t=>(
              <button key={t} onClick={()=>setOTab(t)} style={{flex:1,padding:"5px",borderRadius:5,border:"none",background:oTab===t?"#fff":"transparent",color:oTab===t?"#0F172A":"#64748B",fontSize:11,fontWeight:oTab===t?600:400,cursor:"pointer"}}>{t==="sms"?"💬 SMS":t==="email"?"✉️ Email":"📞 Call"}</button>
            ))}
          </div>
          {oTab!=="call"?(
            <>
              <textarea ref={msgRef} defaultValue={defaultMsg(selC)} rows={3} style={{width:"100%",border:"1px solid #E2E8F0",borderRadius:7,padding:"7px 9px",fontSize:11,color:"#0F172A",resize:"none",background:"#F8FAFC"}} />
              <div style={{display:"flex",gap:6,marginTop:6}}>
                <button onClick={()=>alert(`${oTab==="sms"?"SMS":"Email"} sent to ${selC.fn}!`)} style={{flex:1,padding:"7px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Send</button>
                <button onClick={()=>personalizeMsg(selC,msgRef.current?.value||defaultMsg(selC),oTab)} disabled={personalizing} style={{flex:1,padding:"7px",background:P+"15",color:P,border:`1px solid ${P}44`,borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>{personalizing?"Writing…":"✨ AI Personalize"}</button>
              </div>
            </>
          ):(
            <>
              <textarea rows={3} placeholder="Log call notes…" style={{width:"100%",border:"1px solid #E2E8F0",borderRadius:7,padding:"7px 9px",fontSize:11,resize:"none",background:"#F8FAFC"}} />
              <button onClick={()=>alert("Call logged!")} style={{width:"100%",marginTop:6,padding:"7px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Log Call</button>
            </>
          )}
        </div>
        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Timeline</div>
          {activities.filter(a=>a.contact.includes(selC.fn)).concat(activities.slice(0,2)).slice(0,5).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"5px 0",borderBottom:i<4?"1px solid #F1F5F9":"none"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>{a.icon}</div>
              <div><div style={{fontSize:11,color:"#0F172A",lineHeight:1.4}}>{a.text}</div><div style={{fontSize:10,color:"#94A3B8"}}>{a.time}</div></div>
            </div>
          ))}
        </div>
      </div>
      {live(selC.id)?.recommended_action&&(
        <div style={{marginTop:10,padding:"10px 12px",background:P+"10",border:`1px solid ${P}33`,borderRadius:8}}>
          <div style={{fontSize:10,color:P,fontWeight:700,marginBottom:2}}>AI RECOMMENDED ACTION</div>
          <div style={{fontSize:12,color:"#0F172A"}}>{live(selC.id).recommended_action}</div>
        </div>
      )}
    </div>
  );

  const renderCompanies = () => selCo?(
    <div>
      <button onClick={()=>setSelCo(null)} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#64748B",background:"none",border:"none",marginBottom:12,cursor:"pointer"}}>← Companies</button>
      <div style={{display:"flex",gap:12,marginBottom:14}}>
        <div style={{width:46,height:46,borderRadius:8,background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:P,flexShrink:0}}>{selCo.name[0]}</div>
        <div><div style={{fontSize:16,fontWeight:700,color:"#0F172A"}}>{selCo.name}</div><div style={{fontSize:12,color:"#64748B",marginTop:2}}>{selCo.industry} · {selCo.city}</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
        {[["Revenue",selCo.revenue],["Deals",selCo.deals+" open"],["Team",selCo.size],["Since",selCo.since]].map(([l,v])=>(
          <div key={l as string} style={{background:"#F8FAFC",borderRadius:7,padding:"7px 10px"}}>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{l}</div>
            <div style={{fontSize:12,color:"#0F172A",fontWeight:600}}>{String(v)}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px"}}>
        <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Linked Contacts</div>
        {contacts.filter(c=>c.co===selCo.name).map(c=>(
          <div key={c.id} onClick={()=>{setSelC(c as any);setSelCo(null);}} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #F1F5F9",cursor:"pointer"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:P,flexShrink:0}}>{ini(c.fn,c.ln)}</div>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#1E293B"}}>{c.fn} {c.ln}</div><div style={{fontSize:10,color:"#64748B"}}>{c.role}</div></div>
            <span style={bdg(c.status)}>{c.status}</span>
            <div style={srStyle(c.score)}>{c.score}</div>
          </div>
        ))}
      </div>
    </div>
  ):(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:9}}>
      {companies.map(co=>(
        <div key={co.id} onClick={()=>setSelCo(co)} style={{background:"#fff",border:`1px solid ${P}22`,borderTop:`2px solid ${P}`,borderRadius:10,padding:12,cursor:"pointer"}}>
          <div style={{width:32,height:32,borderRadius:7,background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:P,marginBottom:7}}>{co.name[0]}</div>
          <div style={{fontSize:12,fontWeight:600,color:"#0F172A"}}>{co.name}</div>
          <div style={{fontSize:10,color:"#64748B",marginTop:1}}>{co.industry}</div>
          <div style={{display:"flex",gap:9,marginTop:8,paddingTop:8,borderTop:"1px solid #F1F5F9"}}>
            {[["deals",co.deals],["contacts",co.contacts]].map(([l,v])=>(
              <div key={l as string} style={{fontSize:10,color:"#64748B"}}><strong style={{display:"block",fontSize:13,color:P}}>{v}</strong>{l}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderDeals = () => selD?(
    <div>
      <button onClick={()=>setSelD(null)} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#64748B",background:"none",border:"none",marginBottom:12,cursor:"pointer"}}>← Pipeline</button>
      <div style={{display:"flex",gap:12,marginBottom:14}}>
        <div style={{width:46,height:46,borderRadius:8,background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📊</div>
        <div><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:16,fontWeight:700,color:"#0F172A"}}>{selD.title}</span><span style={{fontSize:14,fontWeight:700,color:P}}>{fv(selD?.val||selD?.value||0)}</span></div><div style={{fontSize:12,color:"#64748B",marginTop:2}}>{selD.co} · {selD.contact}</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
        {[["Stage",selD?.stage_hist?.[selD?.stage_hist?.length-1]],["Probability",selD?.prob||selD?.probability||0+"%"],["Close Date",selD.close],["Value",fv(selD?.val||selD?.value||0)]].map(([l,v])=>(
          <div key={l as string} style={{background:"#F8FAFC",borderRadius:7,padding:"7px 10px"}}>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{l}</div>
            <div style={{fontSize:12,fontWeight:600,color:"#0F172A"}}>{String(v)}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px"}}>
        <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Stage History</div>
        <div style={{display:"flex",alignItems:"flex-start",overflowX:"auto"}}>
          {ALL_STAGES.map((st,i)=>{
            const cur=selD?.stage_hist?.[selD?.stage_hist?.length-1];
            const si=ALL_STAGES.indexOf(cur||"");
            const done=i<si;const curr=i===si;
            return(
              <div key={st} style={{display:"flex",alignItems:"center"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,background:done?P+"20":curr?P+"15":"#F8FAFC",border:`1.5px solid ${done?P:curr?P+"66":"#E2E8F0"}`,color:done?P:curr?P:"#94A3B8",fontWeight:700}}>{done?"✓":i+1}</div>
                  <div style={{fontSize:8,color:"#94A3B8",textAlign:"center",maxWidth:48,whiteSpace:"nowrap"}}>{st}</div>
                </div>
                {i<ALL_STAGES.length-1&&<div style={{width:20,height:1,background:done?P+"44":"#E2E8F0",marginBottom:14}} />}
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:12}}>
          {ALL_STAGES.filter(s=>s!==selD?.stage_hist?.[selD?.stage_hist?.length-1]).map(s=>(
            <button key={s} onClick={()=>alert(`Deal moved to "${s}"`)} style={{fontSize:11,padding:"4px 10px",border:"1px solid #E2E8F0",borderRadius:6,background:"#F8FAFC",cursor:"pointer"}}>→ {s}</button>
          ))}
        </div>
      </div>
    </div>
  ):(
    <div style={{display:"flex",gap:9,overflowX:"auto",height:"calc(100vh - 130px)"}}>
      {Object.entries(DEALS).map(([stage,deals])=>(
        <div key={stage} style={{flex:"0 0 150px",display:"flex",flexDirection:"column",gap:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10,fontWeight:600,color:"#64748B",padding:"3px 0"}}>
            <span>{stage}</span><span style={{background:"#F1F5F9",borderRadius:99,fontSize:9,padding:"1px 5px"}}>{deals.length}</span>
          </div>
          {deals.map((d:any)=>(
            <div key={d.id} onClick={()=>setSelD(d as any)} style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,padding:"9px 10px",cursor:"pointer"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#0F172A",marginBottom:2,lineHeight:1.3}}>{d.title}</div>
              <div style={{fontSize:11,color:P,fontWeight:600}}>{fv(d?.val||d?.value||0)}</div>
              <div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>{d.co}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderLists = () => {
    const matches=contacts.filter(c=>c.score>=lbMin&&(lbStatus==="all"||c.status===lbStatus));
    return(
      <div style={{display:"grid",gridTemplateColumns:"190px 1fr",gap:12}}>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"10px 11px"}}>
            <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Filters</div>
            <div style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#64748B",marginBottom:4}}><span>Min Score</span><span style={{fontWeight:700,color:P}}>{lbMin}</span></div>
              <input type="range" min={0} max={100} value={lbMin} onChange={e=>setLbMin(+e.target.value)} style={{width:"100%",accentColor:P}} />
            </div>
            <div>{["all","new","contacted","qualified","customer"].map(s=>(
              <label key={s} style={{display:"flex",gap:5,fontSize:11,cursor:"pointer",marginBottom:4,alignItems:"center"}}>
                <input type="radio" name="lbs" checked={lbStatus===s} onChange={()=>setLbStatus(s)} />
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </label>
            ))}</div>
          </div>
        </div>
        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#F8FAFC",borderBottom:"1px solid #E2E8F0",alignItems:"center"}}>
            <span style={{fontSize:11,color:"#64748B"}}>{matches.length} matching leads</span>
            <button onClick={()=>alert("List saved!")} style={{fontSize:11,padding:"4px 12px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:600}}>Save List</button>
          </div>
          <div style={{overflow:"auto",maxHeight:460}}>
            {matches.sort((a,b)=>b.score-a.score).map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderBottom:"1px solid #F8FAFC"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:P,flexShrink:0}}>{ini(c.fn,c.ln)}</div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"#1E293B"}}>{c.fn} {c.ln}</div><div style={{fontSize:10,color:"#64748B"}}>{c.co}</div></div>
                <span style={bdg(c.status)}>{c.status}</span>
                <div onClick={()=>{setModalData(c);setModal(null);}} style={srStyle(c.score)}>{c.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,padding:"14px 16px",background:"linear-gradient(135deg,#0F172A,#1E293B)",borderRadius:10}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:"#F1F5F9"}}>Weekly Intelligence Briefing</div>
          <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{vert.icon} {vert.label} · Powered by Claude AI</div>
        </div>
        <button onClick={generateReport} disabled={genLoading} style={{padding:"8px 18px",background:genLoading?"#334155":P,color:genLoading?"#94A3B8":"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>
          {genLoading?"Claude is writing…":"⚡ Generate Report"}
        </button>
      </div>
      {report?(
        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em"}}>AI GENERATED · {vert.label.toUpperCase()}</span>
            <span style={{fontSize:10,background:P+"15",color:P,padding:"2px 8px",borderRadius:99,fontWeight:600}}>Claude API</span>
          </div>
          <div style={{fontSize:12,color:"#1E293B",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{report}</div>
        </div>
      ):(
        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"40px",textAlign:"center",color:"#94A3B8"}}>
          <div style={{fontSize:32,marginBottom:12}}>{vert.icon}</div>
          <div style={{fontSize:14,fontWeight:600,color:"#64748B",marginBottom:4}}>No report yet</div>
          <div style={{fontSize:12}}>Click "Generate Report" — Claude writes your {vert.label} briefing live in ~5 seconds</div>
        </div>
      )}
    </div>
  );

  const renderActivity = () => (
    <div>{activities.map((a,i)=>(
      <div key={i} style={{display:"flex",gap:9,alignItems:"flex-start",padding:"9px 0",borderBottom:"1px solid #F1F5F9"}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{a.icon}</div>
        <div style={{flex:1}}><div style={{fontSize:12,color:"#0F172A",lineHeight:1.5}}><strong>{a.contact}</strong> — {a.text}</div><div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>{a.time}</div></div>
      </div>
    ))}</div>
  );

  // ── SCORE MODAL ──────────────────────────────────────────────────────────
  const renderScoreModal = () => {
    const c=modalData as Contact;
    const ld=live(c?.id);
    const breakdown=ld?.score_breakdown?Object.entries(ld.score_breakdown):c?.breakdown?.map(b=>[b.n,b.s])||[];
    const score=ld?.composite_score??c?.score;
    return c?(
      <div>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{...srStyle(score,72) as any,margin:"0 auto 10px",fontSize:22,fontWeight:800}}>{score}</div>
          <div style={{fontSize:14,fontWeight:700,color:"#0F172A"}}>{c.fn} {c.ln}</div>
          <div style={{fontSize:11,color:"#64748B"}}>{c.co}</div>
          <div style={{display:"flex",gap:5,justifyContent:"center",marginTop:6,flexWrap:"wrap"}}>
            <span style={{fontSize:10,background:P+"15",color:P,padding:"2px 8px",borderRadius:99,fontWeight:700}}>{vert.icon} {vert.label}</span>
            {ld&&<span style={{fontSize:10,background:"#F0FDF4",color:"#15803D",padding:"2px 8px",borderRadius:99,fontWeight:700}}>✓ Live Claude Score</span>}
          </div>
        </div>
        {breakdown.map(([name,val]:any,i:number)=>(
          <div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#0F172A",marginBottom:3}}><span>{name}</span><span style={{fontWeight:700}}>{val}</span></div>
            <div style={{height:4,background:"#F1F5F9",borderRadius:99,overflow:"hidden"}}><div style={{width:`${val}%`,height:"100%",background:val>=80?"#86EFAC":val>=60?"#FDE68A":"#FCA5A5",borderRadius:99}} /></div>
          </div>
        ))}
        {(ld?.ai_insight||c?.insight)&&<div style={{marginTop:12,padding:"10px 12px",background:"#F8FAFC",borderRadius:8}}><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",marginBottom:4}}>Claude AI Insight</div><div style={{fontSize:12,color:"#0F172A",lineHeight:1.6}}>{ld?.ai_insight||c?.insight}</div></div>}
        {(ld?.recommended_action||c?.action)&&<div style={{marginTop:8,padding:"10px 12px",background:P+"10",borderRadius:8,border:`1px solid ${P}33`}}><div style={{fontSize:9,color:P,textTransform:"uppercase",marginBottom:4}}>Recommended Action</div><div style={{fontSize:12,color:"#0F172A",fontWeight:600}}>{ld?.recommended_action||c?.action}</div></div>}
        <button onClick={()=>scoreOne(c)} disabled={scoringId===c.id} style={{width:"100%",marginTop:12,padding:"9px",background:scoringId===c.id?"#F1F5F9":"#0F172A",color:scoringId===c.id?"#94A3B8":"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>
          {scoringId===c.id?"Scoring with Claude…":"🧠 Score Live with Claude API"}
        </button>
      </div>
    ):null;
  };

  const renderCSV = () => (
    <div>
      <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:14}}>
        {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:i===csvStep?P:"#E2E8F0"}} />)}
      </div>
      {csvStep===0&&<div onClick={()=>setCsvStep(1)} style={{border:"1.5px dashed #CBD5E1",borderRadius:10,padding:"28px",textAlign:"center",cursor:"pointer",background:"#F8FAFC"}}>
        <div style={{fontSize:32,marginBottom:8}}>📁</div>
        <div style={{fontSize:13,fontWeight:600,color:"#0F172A",marginBottom:3}}>Drop CSV here or click to upload</div>
        <div style={{fontSize:11,color:"#94A3B8"}}>Supports .csv, .xlsx · Any column format</div>
      </div>}
      {csvStep===1&&<>
        <div style={{fontSize:12,fontWeight:600,color:"#0F172A",marginBottom:8}}>Scrubbing preview</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
          <thead><tr>{["Name","Phone (raw)","Cleaned","Quality"].map(h=><th key={h} style={{padding:"4px 7px",background:"#F8FAFC",textAlign:"left",color:"#64748B",borderBottom:"1px solid #E2E8F0"}}>{h}</th>)}</tr></thead>
          <tbody>{[["Sarah Mitchell","3055550142","+1 (305) 555-0142","94%"],["james thornton","813.555.0291","+1 (813) 555-0291","98%"],["MARIA DELGADO","(786)5550384","+1 (786) 555-0384","91%"],["Angela Brooks","","— No phone","42%"]].map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j} style={{padding:"4px 7px",borderBottom:"1px solid #F8FAFC",color:j===3?(v==="42%"?"#B91C1C":"#15803D"):j===2?"#15803D":"#0F172A"}}>{v||"—"}</td>)}</tr>)}</tbody>
        </table>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginTop:10}}>
          {[["247","Total"],["229","Clean"],["14","Dupes"],["4","Invalid"]].map(([v,l])=>(
            <div key={l} style={{background:"#F8FAFC",borderRadius:7,padding:"8px",textAlign:"center"}}><div style={{fontSize:17,fontWeight:700,color:"#0F172A"}}>{v}</div><div style={{fontSize:9,color:"#94A3B8"}}>{l}</div></div>
          ))}
        </div>
        <button onClick={()=>setCsvStep(2)} style={{width:"100%",marginTop:12,padding:"9px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>Import 229 Records</button>
      </>}
      {csvStep===2&&<div style={{textAlign:"center",padding:"20px"}}>
        <div style={{fontSize:40,marginBottom:10}}>✅</div>
        <div style={{fontSize:15,fontWeight:700,color:"#0F172A",marginBottom:5}}>229 contacts imported</div>
        <div style={{fontSize:12,color:"#64748B",marginBottom:16}}>Scrubbing complete · AI scoring queued</div>
        <button onClick={()=>{setModal(null);setCsvStep(0);}} style={{padding:"9px 24px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>View Contacts</button>
      </div>}
    </div>
  );

  const titles:Record<string,string>={dashboard:"Dashboard",contacts:"Contacts",companies:"Companies",deals:"Pipeline",lists:"List Builder",reports:"Reports",activity:"Activity",pipeline:"Data Pipeline",ask:"Ask Your Data",quotes:"Quotes & Proposals",docs:"Document Center",map:"Contact Map",finance:"Financial Hub",api:"API Status & Routes"};
  const NAV=[["dashboard","📊","Dashboard"],["contacts","👥","Contacts"],["companies","🏢","Companies"],["deals","📈","Pipeline"],["quotes","📋","Quotes"],["docs","🗂️","Documents"],["map","🗺️","Map"],["finance","💰","Finance"],["api","⚡","API Status"],["pipeline","🔄","Data Flow"],["ask","💬","Ask AI"],["lists","🗂️","Lists"],["reports","📰","Reports"],["activity","⚡","Activity"]];

  return(
    <div style={{display:"flex",height:"100vh",background:"#F8FAFC",fontFamily:"system-ui,-apple-system,sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`@keyframes kpulse{0%,100%{opacity:1}50%{opacity:.6}}@keyframes kspin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>

      {/* SIDEBAR */}
      <aside style={{width:190,flexShrink:0,background:"#0F172A",display:"flex",flexDirection:"column",padding:"10px 7px",gap:1,overflowY:"auto"}}>
        <div style={{padding:"8px 9px 12px",borderBottom:"1px solid rgba(255,255,255,0.08)",marginBottom:6,position:"relative"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#F1F5F9",letterSpacing:"-0.3px",marginBottom:5}}>KOVA</div>
          <button onClick={()=>setVertOpen(!vertOpen)} style={{display:"flex",alignItems:"center",gap:5,background:P+"20",border:`1px solid ${P}44`,borderRadius:6,padding:"5px 8px",cursor:"pointer",width:"100%",justifyContent:"space-between"}}>
            <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:13}}>{vert.icon}</span><span style={{fontSize:11,fontWeight:600,color:P}}>{vert.label}</span></span>
            <span style={{color:P,fontSize:9,transition:"transform .15s",display:"inline-block",transform:vertOpen?"rotate(180deg)":"rotate(0)"}}>▼</span>
          </button>
          {vertOpen&&(
            <div style={{position:"absolute",top:"100%",left:7,right:7,background:"#1E293B",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,zIndex:200,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
              <div style={{padding:"8px 10px 4px",fontSize:9,color:"#475569",letterSpacing:"2px",textTransform:"uppercase"}}>Switch Vertical</div>
              {ALL_VERTICALS.map(v=>{ const vc=VERTICAL_CONFIG[v]; return (
                <button key={v} onClick={()=>switchVertical(v)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 10px",background:v===vertId?`${vc?.color||"#000"}20`:"transparent",border:"none",cursor:"pointer",textAlign:"left",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontSize:15}}>{vc?.icon}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:v===vertId?vc?.color:"#CBD5E1"}}>{vc?.label}</div>
                    <div style={{fontSize:9,color:"#475569"}}>{CONTACTS.filter(c=>c.vertical===v).length} contacts</div>
                  </div>
                  {v===vertId&&<span style={{marginLeft:"auto",color:vc?.color,fontSize:12}}>✓</span>}
                </button>
              );})}
            </div>
          )}
        </div>
        {NAV.map(([id,icon,label])=>(
          <button key={id} onClick={()=>goView(id as ExtView)} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 9px",borderRadius:6,border:"none",width:"100%",textAlign:"left",background:view===id&&!selC&&!selD&&!selCo?`${P}15`:"transparent",color:view===id&&!selC&&!selD&&!selCo?P:"#94A3B8",fontSize:11,fontWeight:view===id&&!selC&&!selD&&!selCo?600:400,cursor:"pointer"}}>
            <span style={{fontSize:14}}>{icon}</span>{label}
          </button>
        ))}
        <div style={{flex:1}} />
        <button onClick={()=>window.open("/onboard","_self")} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 9px",borderRadius:6,border:"none",background:"transparent",color:"#94A3B8",fontSize:11,cursor:"pointer"}}>
          <span style={{fontSize:14}}>⚙️</span>Settings
        </button>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 13px",background:"#fff",borderBottom:"1px solid #E2E8F0",flexShrink:0,position:"relative"}}>
          <span style={{fontSize:13,fontWeight:600,color:"#0F172A",flex:1}}>{selC?`${selC.fn} ${selC.ln}`:selD?selD.title:selCo?selCo.name:titles[view]}</span>
          <div style={{position:"relative"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{padding:"5px 8px 5px 26px",fontSize:11,border:"1px solid #E2E8F0",borderRadius:7,background:"#F8FAFC",width:140,color:"#0F172A"}} />
            <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#94A3B8",pointerEvents:"none"}}>🔍</span>
          </div>
          {["contacts","deals","lists"].includes(view)&&!selC&&!selD&&!selCo&&(
            <button onClick={()=>setModal("newcontact")} style={{fontSize:11,padding:"5px 10px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,display:"flex",alignItems:"center",gap:3,fontWeight:600,cursor:"pointer"}}>+ Add</button>
          )}
          <button onClick={()=>setShowDocAgent(true)} style={{fontSize:11,padding:"5px 10px",background:P+"15",color:P,border:`1px solid ${P}44`,borderRadius:6,fontWeight:700,cursor:"pointer"}}>✨ Build with Agent</button>
          <button onClick={()=>{setCsvStep(0);setModal("csv");}} style={{fontSize:11,padding:"5px 10px",background:"#F8FAFC",color:"#64748B",border:"1px solid #E2E8F0",borderRadius:6,fontWeight:600,cursor:"pointer"}}>↑ Import</button>
          <div style={{position:"relative"}}>
            <button onClick={()=>setNotifOpen(!notifOpen)} style={{background:"none",border:"none",fontSize:17,cursor:"pointer",padding:"3px",color:"#64748B",position:"relative"}}>
              🔔<span style={{position:"absolute",top:2,right:2,width:6,height:6,background:"#EF4444",borderRadius:"50%",border:"1.5px solid #fff"}} />
            </button>
            {notifOpen&&(
              <div style={{position:"absolute",right:0,top:"100%",marginTop:4,width:270,background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:12,zIndex:99,boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#0F172A",marginBottom:8}}>New lead alerts</div>
                {contacts.filter(c=>c.score>=80).slice(0,3).map((c,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:i<2?"1px solid #F1F5F9":"none"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:P,flexShrink:0}}>{ini(c.fn,c.ln)}</div>
                    <div style={{flex:1}}><div style={{fontSize:11,color:"#0F172A"}}><strong>{c.fn} {c.ln}</strong> — Score {c.score}</div><div style={{fontSize:10,color:"#94A3B8"}}>{c.co}</div></div>
                    <div style={srStyle(c.score,26)}>{c.score}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{width:27,height:27,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:P,cursor:"pointer"}}>DU</div>
        </div>

        <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:view==="pipeline"?"hidden":"auto",padding:view==="pipeline"?0:14}} onClick={()=>setVertOpen(false)}>
          {view==="dashboard"  && renderDashboard()}
          {view==="companies"  && renderCompanies()}
          {view==="deals"      && renderDeals()}
          {view==="lists"      && renderLists()}
          {view==="reports"    && renderReports()}
          {view==="activity"   && renderActivity()}
          {view==="pipeline"   && <div style={{flex:1,minHeight:0,overflow:"hidden"}}><PipelineViz /></div>}
          {view==="ask"        && renderAsk()}
          {showDocAgent && (
          <div onClick={()=>setShowDocAgent(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div onClick={e=>e.stopPropagation()}><AgentDocumentAssistant vertId={vertId} onClose={()=>setShowDocAgent(false)} /></div>
          </div>
        )}
        {selectedContact && view==="contacts" && (
          <ContactDetail contact={selectedContact} accentColor={P} onBack={()=>setSelectedContact(null)} />
        )}
        {!selectedContact && view==="contacts"  && renderContacts()}
        {view==="quotes"     && <QuoteBuilder vertId={vertId} onBack={()=>goView("dashboard")} />}
          {view==="docs"        && <DocumentCenter vertId={vertId} />}
          {view==="map"         && <MapView vertId={vertId} />}
          {view==="finance"     && <FinancialHub vertId={vertId} />}
          {view==="api"        && <APIStatus accentColor={P} />}
        </div>
      </div>

      {modal&&(
        <div onClick={()=>setModal(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:12,width:420,maxHeight:580,overflowY:"auto",padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontSize:15,fontWeight:700,color:"#0F172A"}}>{false?"AI Score Breakdown":modal==="csv"?"Import CSV":"Add New"}</span>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:18,color:"#94A3B8",cursor:"pointer"}}>×</button>
            </div>
            {false  && renderScoreModal()}
            {modal==="csv"    && renderCSV()}
            {modal==="newcontact" && (
              <div>
                {[["First Name","text","Sarah"],["Last Name","text","Mitchell"],["Company","text","Company Name"],["Email","email","email@example.com"],["Phone","tel","(555) 000-0000"]].map(([l,t,ph])=>(
                  <div key={l as string} style={{marginBottom:9}}>
                    <label style={{fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:3}}>{l}</label>
                    <input type={t as string} placeholder={ph as string} style={{width:"100%",padding:"8px 10px",border:"1px solid #E2E8F0",borderRadius:7,fontSize:13,color:"#0F172A",background:"#F8FAFC"}} />
                  </div>
                ))}
                <button onClick={()=>{alert("Contact created!");setModal(null);}} style={{width:"100%",padding:"9px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}>Create Contact</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
