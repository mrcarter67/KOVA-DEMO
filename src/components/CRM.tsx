"use client";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Users, Building2, TrendingUp, ClipboardList, Ruler,
  FolderOpen, DollarSign, Map, Target, MessageSquare, LayoutList,
  BarChart2, Zap, Settings, Search, Bell, Sparkles, Upload, Camera,
  RefreshCw, Play, Check, CheckCircle2, Brain, BarChart3,
  Phone, Mail, FileText, Home, HeartPulse, Factory,
  Inbox, Filter, Settings2, Radio, Clock, Smile,
} from "lucide-react";
import { IE, useIconMode } from "@/lib/icon-mode";
import { CONTACTS, COMPANIES, ALL_DEALS, ALL_STAGES, ACTIVITIES, PIPELINE_STAGES, VERTICAL_CONFIG, ALL_VERTICALS } from "@/lib/data";
import type { Contact, Company, Deal, View, Modal } from "@/lib/types";
import QuoteBuilder from "@/components/QuoteBuilder";
import DocumentCenter from "@/components/DocumentCenter";
import ContactDetail from "@/components/ContactDetail";
import MapView from "@/components/MapView";
import AgentDocumentAssistant from "@/components/AgentDocumentAssistant";
import FinancialHub from "@/components/FinancialHub";
import PipelineViz from "@/components/PipelineViz";
import CardScanModal from "@/components/CardScanModal";
import EstimateBuilder from "@/components/EstimateBuilder";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useToast, ToastContainer } from "@/components/ui/toast";

type IconMap = Record<string, React.ComponentType<any>>;

const VERT_ICON_MAP: IconMap = { Home, HeartPulse, Factory };
const ACT_ICON_MAP:  IconMap = { Phone, Mail, TrendingUp, FileText };
const PIPE_ICON_MAP: IconMap = { Inbox, Filter, Search, Settings2, Brain, ClipboardList, Radio, Users, Clock };
const VERT_ICON_EMOJIS: Record<string, string> = { Home: "🏠", HeartPulse: "🏥", Factory: "🏭" };
const ACT_ICON_EMOJIS:  Record<string, string> = { Phone: "📞", Mail: "✉️", TrendingUp: "📈", FileText: "📝" };
const PIPE_ICON_EMOJIS: Record<string, string> = { Inbox: "📥", Filter: "🧹", Search: "🔍", Settings2: "⚙️", Brain: "🧠", ClipboardList: "📋", Radio: "📡", Users: "👥", Clock: "⏰" };

function LkIcon({ m, n, size, color, emoji }: { m: IconMap; n: string; size: number; color?: string; emoji?: string }) {
  const { emojiMode } = useIconMode();
  const key = (n || "").trim();
  const Ic = m[key];
  if (emojiMode) {
    if (emoji) return <span style={{ fontSize: size, lineHeight: 1, display: "inline-flex", alignItems: "center" }}>{emoji}</span>;
    return Ic ? <Ic size={size} color={color} /> : null;
  }
  if (Ic) return <Ic size={size} color={color} />;
  if (emoji) return <span style={{ fontSize: size, lineHeight: 1, display: "inline-flex", alignItems: "center" }}>{emoji}</span>;
  return null;
}

function copyDeals(id: string): Record<string, Deal[]> {
  return Object.fromEntries(
    Object.entries(ALL_DEALS[id] || {}).map(([k, v]) => [k, [...(v as Deal[])]])
  );
}

type ExtView = View | "pipeline" | "ask" | "quotes" | "docs" | "map" | "finance" | "estimates";

export default function CRM() {
  const { emojiMode, toggle } = useIconMode();
  const [vertId, setVertId]       = useState("real_estate");
  const [vertOpen, setVertOpen]   = useState(false);
  const [view, setView]           = useState<ExtView>("dashboard");
  const [selC, setSelC]           = useState<Contact|null>(null);
  const [selD, setSelD]           = useState<Deal|null>(null);
  const [selCo, setSelCo]         = useState<Company|null>(null);
  const [modal, setModal]         = useState<Modal>(null);
  const [showDocAgent, setShowDocAgent] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact|null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [docsInitialTab, setDocsInitialTab] = useState("po");
  const [savedEstDocs,   setSavedEstDocs]   = useState<any[]>([]);
  const [contactsView, setContactsView] = useState<"list"|"map">("list");
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

  // ── Pipeline state ────────────────────────────────────────────────────────
  const [pipeStep, setPipeStep]     = useState(-1);
  const [dealsTab, setDealsTab]       = useState<"kanban"|"flow">("kanban");
  const [pipeRunning, setPipeRunning] = useState(false);
  const [pipeRecord, setPipeRecord] = useState<Contact|null>(null);
  const [pipeDone, setPipeDone]     = useState(false);
  const [pipeCount, setPipeCount]   = useState(0);
  const pipeTimer = useRef<any>(null);

  // ── Deals Kanban state ────────────────────────────────────────────────────
  const [pipeDeals, setPipeDeals]         = useState<Record<string,Deal[]>>(()=>copyDeals("real_estate"));
  const [dragDeal, setDragDeal]           = useState<{deal:Deal; fromStage:string}|null>(null);
  const [dragOverStage, setDragOverStage] = useState<string|null>(null);
  const [newDealStage, setNewDealStage]   = useState(ALL_STAGES[0]);
  const [newDealForm, setNewDealForm]     = useState({title:"",co:"",contact:"",val:"",prob:"50",close:""});
  const [localContacts, setLocalContacts] = useState<Contact[]>([]);
  const [newContactForm, setNewContactForm] = useState({firstName:"",lastName:"",company:"",email:"",phone:""});
  const [smsMessages, setSmsMessages]     = useState<{from:string,text:string,time:string}[]>([]);
  const [emailMessages, setEmailMessages] = useState<{from:string,subject:string,time:string,preview:string}[]>([]);
  const [callHistory, setCallHistory]     = useState<{type:string,duration:string,time:string,notes:string}[]>([]);
  const [callActive, setCallActive]   = useState(false);
  const [callRinging, setCallRinging] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const callTimerRef = useRef<any>(null);
  const smsEndRef     = useRef<HTMLDivElement>(null);
  const emailEndRef   = useRef<HTMLDivElement>(null);
  const callNotesRef  = useRef<HTMLTextAreaElement>(null);
  const { toast, toasts, dismiss } = useToast();

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
  const DEALS     = ALL_DEALS[vertId] || {};
  const activities = ACTIVITIES[vertId] || [];
  const allDeals   = Object.values(DEALS).flat();
  const pipeVal    = allDeals.reduce((a,d)=>a+d.val,0);
  const wonVal     = (DEALS["Closed Won"]||[]).reduce((a,d)=>a+d.val,0);

  useEffect(()=>{ nlBottomRef.current?.scrollIntoView({behavior:"smooth"}); },[nlHistory,nlLoading]);

  useEffect(()=>{
    if(!selC){ setSmsMessages([]); setEmailMessages([]); setCallHistory([]); return; }
    setSmsMessages([
      {from:"contact",text:"Hey, wanted to follow up on the proposal you sent over last week.",time:"Jun 5 · 10:14 AM"},
      {from:"me",text:`Hi ${selC.fn}! Great timing — happy to walk you through it. Free this Thursday?`,time:"Jun 5 · 10:32 AM"},
      {from:"contact",text:"Thursday 3pm works. Send the calendar invite.",time:"Jun 5 · 11:01 AM"},
    ]);
    setEmailMessages([
      {from:"me",subject:"KOVA Platform — Q3 Proposal",time:"Jun 7 · 9:15 AM",preview:`Hi ${selC.fn}, following up on our conversation — attaching the Q3 proposal for your review.`},
      {from:"contact",subject:"Re: KOVA Platform — Q3 Proposal",time:"Jun 7 · 2:43 PM",preview:"Thanks! I've reviewed it with the team. A few questions before we move forward…"},
    ]);
    setCallHistory([
      {type:"outbound",duration:"12 min",time:"Jun 7 · 3:00 PM",notes:"Discussed Q3 budget allocation. Strong interest in full package."},
      {type:"inbound", duration:"4 min", time:"Jun 5 · 11:22 AM",notes:"Returned my call. Reviewing proposal with team this week."},
      {type:"outbound",duration:"8 min", time:"Jun 2 · 10:00 AM",notes:"Initial discovery — confirmed key pain points around reporting."},
    ]);
  },[selC?.id]);

  useEffect(()=>{ smsEndRef.current?.scrollIntoView({behavior:"smooth"}); },[smsMessages]);
  useEffect(()=>{ emailEndRef.current?.scrollIntoView({behavior:"smooth"}); },[emailMessages]);

  useEffect(()=>{
    if(callActive && !callRinging){
      callTimerRef.current = setInterval(()=>setCallSeconds(s=>s+1),1000);
    }
    return ()=>clearInterval(callTimerRef.current);
  },[callActive,callRinging]);

  const startCall = ()=>{ setCallActive(true); setCallRinging(true); setCallSeconds(0); setTimeout(()=>setCallRinging(false),2500); };
  const hangUp    = ()=>{
    clearInterval(callTimerRef.current);
    if(callSeconds>0){
      const mins=Math.floor(callSeconds/60), secs=callSeconds%60;
      const dur=mins>0?`${mins} min ${secs>0?secs+" sec":""}`:`${secs} sec`;
      setCallHistory(p=>[{type:"outbound",duration:dur.trim(),time:"Just now",notes:"Call ended — add notes below."}, ...p]);
    }
    setCallActive(false); setCallRinging(false); setCallSeconds(0);
  };
  const fmtCall   = (s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const switchVertical = (id:string) => {
    setVertId(id); setVertOpen(false); setView("dashboard");
    setSelC(null); setSelD(null); setSelCo(null);
    setReport(null); setScoring({});
    setPipeStep(-1); setPipeRunning(false); setPipeDone(false);
    setNlAnswer(null); setNlHistory([]); setScoreAllDone(false);
    setPipeDeals(copyDeals(id)); setLocalContacts([]);
  };

  const moveDeal = (deal: Deal, fromStage: string, toStage: string) => {
    if (fromStage === toStage) return;
    const updated = { ...deal, stage_hist: [...deal.stage_hist, toStage] };
    setPipeDeals(prev => {
      const next: Record<string, Deal[]> = {};
      for (const [k, v] of Object.entries(prev)) next[k] = [...v];
      next[fromStage] = (next[fromStage] || []).filter(d => d.id !== deal.id);
      next[toStage] = [...(next[toStage] || []), updated];
      return next;
    });
    if (selD?.id === deal.id) setSelD(updated);
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
    vert.signals.forEach((s,i)=>{ weights[s]=[30,25,20,15,10][i]||10; });
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
    vert.signals.forEach((s,i)=>{ weights[s]=[30,25,20,15,10][i]||10; });
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

  // ── Pipeline animation ─────────────────────────────────────────────────────
  const runPipeline = () => {
    if(pipeTimer.current) clearInterval(pipeTimer.current);
    const rec = contacts[Math.floor(Math.random()*contacts.length)];
    setPipeRecord(rec); setPipeRunning(true); setPipeDone(false); setPipeStep(0);
    let step = 0;
    pipeTimer.current = setInterval(()=>{
      step++;
      if(step >= PIPELINE_STAGES.length){
        clearInterval(pipeTimer.current);
        setPipeRunning(false); setPipeDone(true);
        setPipeCount(prev=>prev+1);
      } else { setPipeStep(step); }
    },1100);
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
  const filteredContacts = [...contacts, ...localContacts.filter(lc=>lc.vertical===vertId)].filter(c=>
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
              <div style={{width:24,height:24,borderRadius:"50%",background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><LkIcon m={ACT_ICON_MAP} n={a.icon} size={11} emoji={ACT_ICON_EMOJIS[a.icon]} /></div>
              <div><div style={{fontSize:11,color:"#1E293B",lineHeight:1.4}}><strong>{a.contact}</strong> — {a.text.substring(0,52)}…</div><div style={{fontSize:10,color:"#94A3B8",marginTop:1}}>{a.time}</div></div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Top Leads</div>
          {[...contacts].sort((a,b)=>b.score-a.score).slice(0,5).map(c=>(
            <div key={c.id} onClick={()=>{setSelC(c);setView("contacts");}} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #F1F5F9",cursor:"pointer"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:P,flexShrink:0}}>{ini(c.fn,c.ln)}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"#1E293B"}}>{c.fn} {c.ln}</div><div style={{fontSize:10,color:"#64748B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.co}</div></div>
              <div onClick={e=>{e.stopPropagation();setModalData(c);setModal("score");}} style={srStyle(liveScore(c.id)||c.score)}>
                {scoringId===c.id?"…":(liveScore(c.id)??c.score)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick actions row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        <button onClick={()=>goView("deals")} style={{padding:"12px",background:"linear-gradient(135deg,#0F172A,#1E293B)",border:"none",borderRadius:10,cursor:"pointer",textAlign:"left"}}>
          <div style={{marginBottom:4}}><IE emoji="🎯" Icon={Target} size={18} color="#F1F5F9" /></div>
          <div style={{fontSize:12,fontWeight:700,color:"#F1F5F9"}}>Opportunities</div>
          <div style={{fontSize:10,color:"#64748B",marginTop:1}}>View & manage pipeline</div>
        </button>
        <button onClick={()=>goView("ask")} style={{padding:"12px",background:`linear-gradient(135deg,${P}22,${P}11)`,border:`1px solid ${P}33`,borderRadius:10,cursor:"pointer",textAlign:"left"}}>
          <div style={{marginBottom:4}}><IE emoji="💬" Icon={MessageSquare} size={18} color={P} /></div>
          <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>Ask Your Data</div>
          <div style={{fontSize:10,color:"#64748B",marginTop:1}}>Claude answers live</div>
        </button>
        <button onClick={scoreAll} disabled={scoringAll} style={{padding:"12px",background:scoringAll?"#F8FAFC":"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:"1px solid #86EFAC",borderRadius:10,cursor:"pointer",textAlign:"left"}}>
          <div style={{marginBottom:4}}><IE emoji="🧠" Icon={Brain} size={18} color="#15803D" /></div>
          <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{scoringAll?`Scoring ${scoreAllIdx}/${contacts.length}…`:scoreAllDone?"All Scored":"Score All Leads"}</div>
          <div style={{fontSize:10,color:"#64748B",marginTop:1}}>{contacts.length} contacts · Claude AI</div>
        </button>
      </div>
    </div>
  );

  // ── PIPELINE VISUALIZATION ─────────────────────────────────────────────────
  const renderPipeline = () => (
    <div>
      <style>{`
        @keyframes kpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(.97)}}
        @keyframes kflow{0%{opacity:0;transform:translateX(-8px)}100%{opacity:1;transform:translateX(0)}}
        @keyframes kspin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        .kpulse{animation:kpulse 1.2s ease-in-out infinite}
        .kflow{animation:kflow .4s ease}
        .kspin{animation:kspin 1s linear infinite;display:inline-block}
      `}</style>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,padding:"14px 16px",background:"linear-gradient(135deg,#0F172A,#1E293B)",borderRadius:12}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9"}}>Data Pipeline — 9 Stages</div>
          <div style={{fontSize:11,color:"#64748B",marginTop:2}}>
            {pipeRunning ? <span className="kpulse" style={{color:"#00C896"}}>● Processing record…</span>
            : pipeDone ? <span style={{color:"#00C896"}}>● {pipeCount} record{pipeCount!==1?"s":""} processed this session</span>
            : <span style={{color:"#475569"}}>● Idle — click Run</span>}
          </div>
        </div>
        <button onClick={runPipeline} disabled={pipeRunning} style={{padding:"9px 20px",background:pipeRunning?"#334155":P,color:pipeRunning?"#94A3B8":"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          {pipeRunning?<><RefreshCw size={14} style={{animation:"kspin 1s linear infinite"}} /> Running…</>:<><IE emoji="▶️" Icon={Play} size={14} /> Run Pipeline</>}
        </button>
      </div>

      {/* Record being processed */}
      {pipeRecord && (pipeRunning||pipeDone) && (
        <div className="kflow" style={{marginBottom:14,padding:"10px 14px",background:P+"10",border:`1px solid ${P}33`,borderRadius:10,display:"flex",gap:12,alignItems:"center"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:P+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:P,flexShrink:0}}>{ini(pipeRecord.fn,pipeRecord.ln)}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{pipeRecord.fn} {pipeRecord.ln} · {pipeRecord.co}</div>
            <div style={{fontSize:10,color:"#64748B",marginTop:1}}>Source: County Assessor · Vertical: {vert.label} · {pipeRecord.city}</div>
          </div>
          {pipeDone && <div style={{...srStyle(liveScore(pipeRecord.id)||pipeRecord.score,40),flexShrink:0}}>{liveScore(pipeRecord.id)||pipeRecord.score}</div>}
        </div>
      )}

      {/* 9 Stages */}
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {PIPELINE_STAGES.map((stage,i)=>{
          const done    = pipeDone || (pipeRunning && i < pipeStep);
          const active  = pipeRunning && i === pipeStep;
          const pending = !pipeRunning && !pipeDone && pipeStep < 0;
          const pct     = done?100:active?Math.min(95,((Date.now()%1100)/1100)*100):0;

          return (
            <div key={stage.id} className={active?"kpulse":""} style={{
              padding:"12px 14px",borderRadius:10,
              background:active?P+"10":done?P+"06":"#fff",
              border:`1px solid ${active?P:done?P+"33":"#E2E8F0"}`,
              transition:"all .3s",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:8,background:active?P+"20":done?P+"15":"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,animation:active?"kspin 1s linear infinite":undefined}}>
                  <LkIcon m={PIPE_ICON_MAP} n={stage.icon} size={16} color={active||done?P:"#94A3B8"} emoji={PIPE_ICON_EMOJIS[stage.icon]} />
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:13,fontWeight:600,color:"#0F172A"}}>{stage.label}</span>
                      {active && <span style={{fontSize:9,background:P+"20",color:P,padding:"1px 7px",borderRadius:99,fontWeight:700}}>ACTIVE</span>}
                      {done  && <span style={{fontSize:9,background:"#F0FDF4",color:"#15803D",padding:"1px 7px",borderRadius:99,fontWeight:700,display:"inline-flex",alignItems:"center",gap:3}}>DONE <IE emoji="✓" Icon={Check} size={8} /></span>}
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:done?"#15803D":active?P:"#94A3B8"}}>
                      {done?"100%":active?Math.round(pct)+"%":"—"}
                    </span>
                  </div>
                  <div style={{height:4,background:"#F1F5F9",borderRadius:99,overflow:"hidden"}}>
                    <div style={{width:`${done?100:active?pct:0}%`,height:"100%",background:done?P:P,borderRadius:99,transition:"width .3s"}} />
                  </div>
                </div>
              </div>
              <div style={{fontSize:11,color:"#94A3B8",marginTop:6,marginLeft:44}}>{stage.desc}</div>
            </div>
          );
        })}
      </div>

      {pipeDone && (
        <div className="kflow" style={{marginTop:14,padding:"14px 16px",background:"#F0FDF4",border:"1px solid #86EFAC",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#15803D",display:"flex",alignItems:"center",gap:5}}><IE emoji="✅" Icon={Check} size={14} color="#15803D" />Pipeline complete</div>
            <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{pipeRecord?.fn} {pipeRecord?.ln} processed in ~9 seconds · Score assigned · Outreach queued</div>
          </div>
          <button onClick={runPipeline} style={{padding:"7px 16px",background:"#15803D",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>Run Again</button>
        </div>
      )}
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
        <div style={{fontSize:14,fontWeight:700,color:"#0F172A",display:"flex",alignItems:"center",gap:6}}><IE emoji="💬" Icon={MessageSquare} size={14} />Ask Your {vert.label} Data</div>
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
              <div style={{width:28,height:28,borderRadius:"50%",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><IE emoji="⚡" Icon={Zap} size={12} color="#fff" /></div>
              <div style={{flex:1,padding:"10px 13px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:"10px 10px 10px 2px",fontSize:12,color:"#0F172A",lineHeight:1.7}}>{item.a}</div>
            </div>
          </div>
        ))}
        {nlLoading && (
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><IE emoji="⚡" Icon={Zap} size={12} color="#fff" /></div>
            <div style={{padding:"10px 14px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:"10px 10px 10px 2px",display:"flex",gap:4}}>
              {[0,1,2].map(j=><div key={j} style={{width:6,height:6,borderRadius:"50%",background:P,animation:`kpulse 1.2s ${j*0.2}s ease-in-out infinite`}} />)}
            </div>
          </div>
        )}
        <div ref={nlBottomRef} />
      </div>

      {nlHistory.length===0&&!nlLoading&&(
        <div style={{textAlign:"center",padding:"30px",color:"#94A3B8",border:"1px dashed #E2E8F0",borderRadius:10,marginBottom:14}}>
          <div style={{marginBottom:8}}><IE emoji="💬" Icon={MessageSquare} size={28} color="#94A3B8" /></div>
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
        <button onClick={()=>setShowScanModal(true)} style={{fontSize:10,padding:"3px 9px",borderRadius:99,border:`1px solid ${P}44`,background:P+"15",color:P,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:3}}><IE emoji="📷" Icon={Camera} size={11} />Scan Card</button>
        <span style={{fontSize:10,color:"#94A3B8",flex:1}}>{filteredContacts.length} contacts</span>
        <div style={{display:"flex",background:"#F1F5F9",borderRadius:7,padding:2,gap:1}}>
          <button onClick={()=>setContactsView("list")} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:"none",background:contactsView==="list"?"#fff":"transparent",color:contactsView==="list"?"#0F172A":"#64748B",cursor:"pointer",fontWeight:contactsView==="list"?600:400,display:"flex",alignItems:"center",gap:4}}><IE emoji="📋" Icon={LayoutList} size={12} />List</button>
          <button onClick={()=>setContactsView("map")} style={{fontSize:11,padding:"4px 10px",borderRadius:5,border:"none",background:contactsView==="map"?"#fff":"transparent",color:contactsView==="map"?"#0F172A":"#64748B",cursor:"pointer",fontWeight:contactsView==="map"?600:400,display:"flex",alignItems:"center",gap:4}}><IE emoji="🗺️" Icon={Map} size={12} />Map</button>
        </div>
        <button onClick={scoreAll} disabled={scoringAll} style={{fontSize:11,padding:"4px 12px",background:scoringAll?P+"10":"#0F172A",color:scoringAll?P:"#fff",border:scoringAll?`1px solid ${P}44`:"none",borderRadius:7,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
          {scoringAll?<><RefreshCw size={12} style={{animation:"kspin 1s linear infinite"}} /> {scoreAllIdx}/{contacts.length}</>:scoreAllDone?<><IE emoji="✅" Icon={Check} size={12} /> All Scored</>:<><IE emoji="🧠" Icon={Brain} size={12} /> Score All</>}
        </button>
      </div>
      {contactsView==="map" && <MapView vertId={vertId} />}
      {contactsView==="list" && filteredContacts.map(c=>(
        <div key={c.id} onClick={()=>setSelC(c)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 4px",borderBottom:"1px solid #F1F5F9",cursor:"pointer"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:P,flexShrink:0}}>{ini(c.fn,c.ln)}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1E293B"}}>{c.fn} {c.ln}</div>
            <div style={{fontSize:11,color:"#64748B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.co} · {c.city}</div>
            {live(c.id)?.ai_insight&&<div style={{fontSize:10,color:"#94A3B8",marginTop:1,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{live(c.id).ai_insight?.substring(0,65)}…</div>}
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <span style={bdg(c.status)}>{c.status}</span>
            <div onClick={e=>{e.stopPropagation();scoreOne(c);}} style={srStyle(liveScore(c.id))} title="Click to score with Claude">
              {scoringId===c.id?<span style={{fontSize:9}}>AI…</span>:(liveScore(c.id)??c.score)}
            </div>
          </div>
        </div>
      ))}
      {contactsView==="list" && scoreAllDone&&(
        <div style={{marginTop:10,padding:"10px 12px",background:"#F0FDF4",border:"1px solid #86EFAC",borderRadius:8,fontSize:12,color:"#15803D",fontWeight:600}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:5}}><IE emoji="✅" Icon={Check} size={12} /> All {contacts.length} contacts scored by Claude — click any score ring to see the full breakdown</span>
        </div>
      )}
    </div>
  );

  const defaultMsg=(c:Contact)=>oTab==="sms"?`Hi ${c.fn}, following up — do you have 10 minutes this week?`:oTab==="email"?`Hi ${c.fn},\n\nWanted to follow up on a few opportunities that match your profile.\n\nBest,`:"";

  const renderContactDetail = () => selC && (
    <div>
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={()=>setSelC(null)}>Contacts</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{selC.fn} {selC.ln}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
        <div style={{width:46,height:46,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:P,flexShrink:0}}>{ini(selC.fn,selC.ln)}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:16,fontWeight:700,color:"#0F172A"}}>{selC.fn} {selC.ln}</span>
            <span style={bdg(selC.status)}>{selC.status}</span>
            <div onClick={()=>{setModalData(selC);setModal("score");}} style={srStyle(liveScore(selC.id)||selC.score,40)} title="Full breakdown">
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
              <button key={t} onClick={()=>setOTab(t)} style={{flex:1,padding:"5px",borderRadius:5,border:"none",background:oTab===t?"#fff":"transparent",color:oTab===t?"#0F172A":"#64748B",fontSize:11,fontWeight:oTab===t?600:400,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{t==="sms"?<><IE emoji="💬" Icon={MessageSquare} size={11} />SMS</>:t==="email"?<><IE emoji="✉️" Icon={Mail} size={11} />Email</>:<><IE emoji="📞" Icon={Phone} size={11} />Call</>}</button>
            ))}
          </div>
          {oTab==="sms" && (
            <>
              <div style={{height:118,overflowY:"auto",marginBottom:7,display:"flex",flexDirection:"column",gap:5}}>
                {smsMessages.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"76%",padding:"6px 9px",borderRadius:m.from==="me"?"10px 10px 2px 10px":"10px 10px 10px 2px",background:m.from==="me"?P:"#F1F5F9",color:m.from==="me"?"#fff":"#0F172A",fontSize:10,lineHeight:1.4}}>
                      {m.text}
                      <div style={{fontSize:9,opacity:0.55,marginTop:2,textAlign:m.from==="me"?"right":"left"}}>{m.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={smsEndRef} />
              </div>
              <textarea ref={msgRef} defaultValue={defaultMsg(selC)} rows={2} style={{width:"100%",border:"1px solid #E2E8F0",borderRadius:7,padding:"7px 9px",fontSize:11,color:"#0F172A",resize:"none",background:"#F8FAFC"}} />
              <div style={{display:"flex",gap:6,marginTop:6}}>
                <button onClick={()=>{
                  const txt=(msgRef.current?.value||"").trim();
                  if(!txt) return;
                  setSmsMessages(p=>[...p,{from:"me",text:txt,time:"Just now"}]);
                  if(msgRef.current) msgRef.current.value="";
                }} style={{flex:1,padding:"7px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Send</button>
                <button onClick={()=>personalizeMsg(selC,msgRef.current?.value||defaultMsg(selC),"sms")} disabled={personalizing} style={{flex:1,padding:"7px",background:P+"15",color:P,border:`1px solid ${P}44`,borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{personalizing?"Writing…":<><IE emoji="✨" Icon={Sparkles} size={11} />AI Personalize</>}</button>
              </div>
            </>
          )}
          {oTab==="email" && (
            <>
              <div style={{maxHeight:138,overflowY:"auto",marginBottom:7,display:"flex",flexDirection:"column",gap:5}}>
                {emailMessages.map((e,i)=>(
                  <div key={i} style={{padding:"7px 10px",borderRadius:7,background:"#F8FAFC",border:"1px solid #E2E8F0",borderLeft:`3px solid ${e.from==="me"?P:"#CBD5E1"}`,flexShrink:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:10,fontWeight:700,color:"#0F172A"}}>{e.from==="me"?"You":selC.fn}</span>
                      <span style={{fontSize:9,color:"#94A3B8"}}>{e.time}</span>
                    </div>
                    <div style={{fontSize:10,fontWeight:600,color:"#334155",marginBottom:2}}>{e.subject}</div>
                    <div style={{fontSize:10,color:"#64748B",lineHeight:1.4}}>{e.preview.length>64?e.preview.substring(0,64)+"…":e.preview}</div>
                  </div>
                ))}
                <div ref={emailEndRef} />
              </div>
              <textarea ref={msgRef} defaultValue={defaultMsg(selC)} rows={2} style={{width:"100%",border:"1px solid #E2E8F0",borderRadius:7,padding:"7px 9px",fontSize:11,color:"#0F172A",resize:"none",background:"#F8FAFC"}} />
              <div style={{display:"flex",gap:6,marginTop:6}}>
                <button onClick={()=>{
                  const txt=(msgRef.current?.value||"").trim();
                  if(!txt) return;
                  const lastSubj = emailMessages.length>0 ? emailMessages[emailMessages.length-1].subject : "Follow-Up";
                  const subj = lastSubj.startsWith("Re:") ? lastSubj : `Re: ${lastSubj}`;
                  setEmailMessages(p=>[...p,{from:"me",subject:subj,time:"Just now",preview:txt}]);
                  if(msgRef.current) msgRef.current.value="";
                }} style={{flex:1,padding:"7px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Send</button>
                <button onClick={()=>personalizeMsg(selC,msgRef.current?.value||defaultMsg(selC),"email")} disabled={personalizing} style={{flex:1,padding:"7px",background:P+"15",color:P,border:`1px solid ${P}44`,borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{personalizing?"Writing…":<><IE emoji="✨" Icon={Sparkles} size={11} />AI Personalize</>}</button>
              </div>
            </>
          )}
          {oTab==="call" && (
            <>
              <button onClick={startCall} style={{width:"100%",marginBottom:8,padding:"8px",background:P,color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <IE emoji="📞" Icon={Phone} size={12} /> Start Call
              </button>
              <div style={{maxHeight:130,overflowY:"auto",marginBottom:7,display:"flex",flexDirection:"column",gap:4}}>
                {callHistory.map((c,i)=>(
                  <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"6px 8px",borderRadius:6,background:"#F8FAFC",border:"1px solid #E2E8F0",flexShrink:0}}>
                    <IE emoji={c.type==="inbound"?"📲":"📞"} Icon={Phone} size={13} color={c.type==="inbound"?P:"#64748B"} />
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontSize:10,fontWeight:600,color:"#0F172A",textTransform:"capitalize"}}>{c.type} · {c.duration}</span>
                        <span style={{fontSize:9,color:"#94A3B8"}}>{c.time}</span>
                      </div>
                      <div style={{fontSize:10,color:"#64748B",lineHeight:1.4,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
              <textarea ref={callNotesRef} rows={2} placeholder="Log call notes…" style={{width:"100%",border:"1px solid #E2E8F0",borderRadius:7,padding:"7px 9px",fontSize:11,resize:"none",background:"#F8FAFC",color:"#0F172A"}} />
              <button onClick={()=>{
                const notes=(callNotesRef.current?.value||"").trim();
                if(!notes) return;
                setCallHistory(p=>[{type:"outbound",duration:"just now",time:"Just now",notes},  ...p]);
                if(callNotesRef.current) callNotesRef.current.value="";
              }} style={{width:"100%",marginTop:6,padding:"7px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Log Call</button>
            </>
          )}
        </div>
        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Timeline</div>
          {activities.filter(a=>a.contact.includes(selC.fn)).concat(activities.slice(0,2)).slice(0,5).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"5px 0",borderBottom:i<4?"1px solid #F1F5F9":"none"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}><LkIcon m={ACT_ICON_MAP} n={a.icon} size={10} emoji={ACT_ICON_EMOJIS[a.icon]} /></div>
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
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={()=>setSelCo(null)}>Companies</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{selCo.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
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
          <div key={c.id} onClick={()=>{setSelC(c);setSelCo(null);}} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #F1F5F9",cursor:"pointer"}}>
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

  const renderDeals = () => {
    if (selD) {
      const curStage = selD.stage_hist[selD.stage_hist.length - 1];
      return (
        <div>
          <Breadcrumb className="mb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={()=>setSelD(null)}>Opportunities</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selD.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div style={{display:"flex",gap:12,marginBottom:14}}>
            <div style={{width:46,height:46,borderRadius:8,background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><IE emoji="📊" Icon={BarChart3} size={20} color={P} /></div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16,fontWeight:700,color:"#0F172A"}}>{selD.title}</span>
                <span style={{fontSize:14,fontWeight:700,color:P}}>{fv(selD.val)}</span>
              </div>
              <div style={{fontSize:12,color:"#64748B",marginTop:2}}>{selD.co} · {selD.contact}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
            {[["Stage",curStage],["Probability",selD.prob+"%"],["Close Date",selD.close],["Value",fv(selD.val)]].map(([l,v])=>(
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
                const si=ALL_STAGES.indexOf(curStage);
                const done=i<si; const curr=i===si;
                return(
                  <div key={st} style={{display:"flex",alignItems:"center"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                      <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,background:done?P+"20":curr?P+"15":"#F8FAFC",border:`1.5px solid ${done?P:curr?P+"66":"#E2E8F0"}`,color:done?P:curr?P:"#94A3B8",fontWeight:700}}>{done?<IE emoji="✓" Icon={Check} size={10} />:i+1}</div>
                      <div style={{fontSize:8,color:"#94A3B8",textAlign:"center",maxWidth:48,whiteSpace:"nowrap"}}>{st}</div>
                    </div>
                    {i<ALL_STAGES.length-1&&<div style={{width:20,height:1,background:done?P+"44":"#E2E8F0",marginBottom:14}} />}
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:12}}>
              {ALL_STAGES.filter(s=>s!==curStage).map(s=>(
                <Button key={s} variant="outline" size="sm" className="text-xs h-7"
                  style={{borderColor:"#E2E8F0",color:"#64748B"}}
                  onClick={()=>moveDeal(selD,curStage,s)}>
                  → {s}
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    const openCount = Object.values(pipeDeals).flat().length;
    const openVal   = Object.values(pipeDeals).flat().reduce((a,d)=>a+d.val,0);
    const wonCount  = (pipeDeals["Closed Won"]||[]).length;
    const wonValOpp = (pipeDeals["Closed Won"]||[]).reduce((a,d)=>a+d.val,0);
    return (
      <div style={{display:"flex",flexDirection:"column",gap:10,height:"calc(100vh - 100px)"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:"#0F172A"}}>Opportunities</div>
              <div style={{fontSize:11,color:"#64748B",marginTop:1}}>{dealsTab==="kanban"?"Drag cards to advance · Click to open":"Live data pipeline — 9 processing stages"}</div>
            </div>
            {/* Tab toggle */}
            <div style={{display:"flex",background:"#F1F5F9",borderRadius:8,padding:2,gap:2}}>
              {([["kanban","Kanban"],["flow","Pipeline Flow"]] as [string,string][]).map(([id,label])=>(
                <button key={id} onClick={()=>setDealsTab(id as "kanban"|"flow")}
                  style={{fontSize:10,padding:"4px 10px",borderRadius:6,border:"none",background:dealsTab===id?"#fff":"transparent",color:dealsTab===id?"#0F172A":"#64748B",fontWeight:dealsTab===id?700:400,cursor:"pointer",boxShadow:dealsTab===id?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {[[openCount+" open","#0F172A",fv(openVal)+" pipeline"],[wonCount+" won","#15803D",fv(wonValOpp)+" closed"]].map(([l,c,sub])=>(
              <div key={l as string} style={{padding:"6px 14px",background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:c as string}}>{l}</div>
                <div style={{fontSize:10,color:"#94A3B8"}}>{sub}</div>
              </div>
            ))}
            {dealsTab==="kanban"&&<button onClick={()=>{setNewDealStage(ALL_STAGES[0]);setModal("create");}} style={{padding:"6px 14px",background:"#0F172A",color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Add Opportunity</button>}
          </div>
        </div>
        {/* Pipeline Flow tab */}
        {dealsTab==="flow" && renderPipeline()}
        {/* Kanban */}
        {dealsTab==="kanban" && <div style={{display:"flex",gap:9,overflowX:"auto",flex:1}}>
        {ALL_STAGES.map(stage=>{
          const deals = pipeDeals[stage]||[];
          const isOver = dragOverStage===stage;
          return(
            <div key={stage}
              style={{flex:"0 0 150px",display:"flex",flexDirection:"column",gap:6,borderRadius:8,padding:"4px",transition:"background 0.15s",background:isOver?P+"08":"transparent"}}
              onDragOver={e=>{e.preventDefault();setDragOverStage(stage);}}
              onDragLeave={e=>{if(!e.relatedTarget||!e.currentTarget.contains(e.relatedTarget as Node))setDragOverStage(null);}}
              onDrop={e=>{e.preventDefault();if(dragDeal&&dragDeal.fromStage!==stage){moveDeal(dragDeal.deal,dragDeal.fromStage,stage);}setDragDeal(null);setDragOverStage(null);}}
            >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10,fontWeight:600,color:"#64748B",padding:"3px 4px"}}>
                <span>{stage}</span>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{background:"#F1F5F9",borderRadius:99,fontSize:9,padding:"1px 5px"}}>{deals.length}</span>
                  <button onClick={()=>{setNewDealStage(stage);setModal("create");}} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",fontSize:16,lineHeight:1,padding:"0 2px",display:"flex",alignItems:"center"}}>+</button>
                </div>
              </div>
              {isOver&&<div style={{borderRadius:6,border:`1.5px dashed ${P}`,padding:"8px 4px",textAlign:"center",fontSize:10,fontWeight:600,color:P,background:P+"05"}}>Drop here</div>}
              {deals.map(d=>(
                <div key={d.id}
                  draggable
                  onDragStart={e=>{e.dataTransfer.effectAllowed="move";setDragDeal({deal:d,fromStage:stage});}}
                  onDragEnd={()=>{setDragDeal(null);setDragOverStage(null);}}
                  onClick={()=>setSelD(d)}
                  style={{background:"#fff",border:`1px solid ${dragDeal?.deal.id===d.id?P+"66":"#E2E8F0"}`,borderRadius:8,padding:"9px 10px",cursor:"grab",opacity:dragDeal?.deal.id===d.id?0.45:1,transition:"opacity 0.1s,border-color 0.1s",userSelect:"none"}}
                >
                  <div style={{fontSize:11,fontWeight:600,color:"#0F172A",marginBottom:2,lineHeight:1.3}}>{d.title}</div>
                  <div style={{fontSize:11,color:P,fontWeight:600}}>{fv(d.val)}</div>
                  <div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>{d.co}</div>
                </div>
              ))}
            </div>
          );
        })}
        </div>}
      </div>
    );
  };

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
            <button onClick={()=>toast("List saved")} style={{fontSize:11,padding:"4px 12px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:600}}>Save List</button>
          </div>
          <div style={{overflow:"auto",maxHeight:460}}>
            {matches.sort((a,b)=>b.score-a.score).map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderBottom:"1px solid #F8FAFC"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:P+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:P,flexShrink:0}}>{ini(c.fn,c.ln)}</div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"#1E293B"}}>{c.fn} {c.ln}</div><div style={{fontSize:10,color:"#64748B"}}>{c.co}</div></div>
                <span style={bdg(c.status)}>{c.status}</span>
                <div onClick={()=>{setModalData(c);setModal("score");}} style={srStyle(c.score)}>{c.score}</div>
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
          <div style={{fontSize:11,color:"#64748B",marginTop:2,display:"flex",alignItems:"center",gap:4}}><LkIcon m={VERT_ICON_MAP} n={vert.icon} size={11} color="#64748B" emoji={vert.emoji || VERT_ICON_EMOJIS[vert.icon]} />{vert.label} · Powered by Claude AI</div>
        </div>
        <button onClick={generateReport} disabled={genLoading} style={{padding:"8px 18px",background:genLoading?"#334155":P,color:genLoading?"#94A3B8":"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>
          {genLoading?"Claude is writing…":<><IE emoji="⚡" Icon={Zap} size={13} />Generate Report</>}
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
          <div style={{marginBottom:12}}><LkIcon m={VERT_ICON_MAP} n={vert.icon} size={32} color="#94A3B8" emoji={vert.emoji || VERT_ICON_EMOJIS[vert.icon]} /></div>
          <div style={{fontSize:14,fontWeight:600,color:"#64748B",marginBottom:4}}>No report yet</div>
          <div style={{fontSize:12}}>Click "Generate Report" — Claude writes your {vert.label} briefing live in ~5 seconds</div>
        </div>
      )}
    </div>
  );

  const renderActivity = () => (
    <div>{activities.map((a,i)=>(
      <div key={i} style={{display:"flex",gap:9,alignItems:"flex-start",padding:"9px 0",borderBottom:"1px solid #F1F5F9"}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><LkIcon m={ACT_ICON_MAP} n={a.icon} size={13} emoji={ACT_ICON_EMOJIS[a.icon]} /></div>
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
            <span style={{fontSize:10,background:P+"15",color:P,padding:"2px 8px",borderRadius:99,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><LkIcon m={VERT_ICON_MAP} n={vert.icon} size={10} color={P} emoji={vert.emoji || VERT_ICON_EMOJIS[vert.icon]} />{vert.label}</span>
            {ld&&<span style={{fontSize:10,background:"#F0FDF4",color:"#15803D",padding:"2px 8px",borderRadius:99,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><IE emoji="✅" Icon={Check} size={10} color="#15803D" />Live Claude Score</span>}
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
          {scoringId===c.id?"Scoring with Claude…":<><IE emoji="🧠" Icon={Brain} size={14} />Score Live with Claude API</>}
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
        <div style={{marginBottom:8}}><IE emoji="📂" Icon={FolderOpen} size={32} color="#94A3B8" /></div>
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
        <div style={{marginBottom:10}}><IE emoji="✅" Icon={CheckCircle2} size={40} color="#15803D" /></div>
        <div style={{fontSize:15,fontWeight:700,color:"#0F172A",marginBottom:5}}>229 contacts imported</div>
        <div style={{fontSize:12,color:"#64748B",marginBottom:16}}>Scrubbing complete · AI scoring queued</div>
        <button onClick={()=>{setModal(null);setCsvStep(0);}} style={{padding:"9px 24px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>View Contacts</button>
      </div>}
    </div>
  );

  const titles:Record<string,string>={dashboard:"Dashboard",contacts:"Contacts",companies:"Companies",deals:"Opportunities",lists:"List Builder",reports:"Reports",activity:"Activity",pipeline:"Data Pipeline",ask:"Ask Your Data",quotes:"Quotes & Proposals",docs:"Documents",finance:"Financial Hub",estimates:"Estimate Builder",map:"Map View"};
  const NAV: [string, React.ComponentType<any>, string, string][] = [
    ["dashboard",     LayoutDashboard, "Dashboard",     "📊"],
    ["contacts",      Users,           "Contacts",      "👥"],
    ["companies",     Building2,       "Companies",     "🏢"],
    ["deals",         Target,          "Opportunities", "🎯"],
    ["quotes",        ClipboardList,   "Quotes",        "📋"],
    ["estimates",     Ruler,           "Estimates",     "📐"],
    ["docs",          FolderOpen,      "Documents",     "🗂️"],
    ["finance",       DollarSign,      "Financials",    "💰"],
    ["map",           Map,             "Map",           "🗺️"],
    ["ask",           MessageSquare,   "Ask AI",        "💬"],
    ["lists",         LayoutList,      "Lists",         "🗂️"],
    ["reports",       BarChart2,       "Reports",       "📰"],
    ["activity",      Zap,             "Activity",      "⚡"],
  ];

  return(
    <div style={{display:"flex",height:"100vh",background:"#F8FAFC",fontFamily:"system-ui,-apple-system,sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`@keyframes kpulse{0%,100%{opacity:1}50%{opacity:.6}}@keyframes kspin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>

      {/* SIDEBAR */}
      <aside style={{width:190,flexShrink:0,background:"#0F172A",display:"flex",flexDirection:"column",padding:"10px 7px",gap:1,overflowY:"auto"}}>
        <div style={{padding:"8px 9px 12px",borderBottom:"1px solid rgba(255,255,255,0.08)",marginBottom:6,position:"relative"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#F1F5F9",letterSpacing:"-0.3px",marginBottom:5}}>KOVA</div>
          <button onClick={()=>setVertOpen(!vertOpen)} style={{display:"flex",alignItems:"center",gap:5,background:P+"20",border:`1px solid ${P}44`,borderRadius:6,padding:"5px 8px",cursor:"pointer",width:"100%",justifyContent:"space-between"}}>
            <span style={{display:"flex",alignItems:"center",gap:5}}><LkIcon m={VERT_ICON_MAP} n={vert.icon} size={13} color={P} emoji={vert.emoji || VERT_ICON_EMOJIS[vert.icon]} /><span style={{fontSize:11,fontWeight:600,color:P}}>{vert.label}</span></span>
            <span style={{color:P,fontSize:9,transition:"transform .15s",display:"inline-block",transform:vertOpen?"rotate(180deg)":"rotate(0)"}}>▼</span>
          </button>
          {vertOpen&&(
            <div style={{position:"absolute",top:"100%",left:7,right:7,background:"#1E293B",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,zIndex:200,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
              <div style={{padding:"8px 10px 4px",fontSize:9,color:"#475569",letterSpacing:"2px",textTransform:"uppercase"}}>Switch Vertical</div>
              {ALL_VERTICALS.map(v=>(
                <button key={v.id} onClick={()=>switchVertical(v.id)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 10px",background:v.id===vertId?`${v.color}20`:"transparent",border:"none",cursor:"pointer",textAlign:"left",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <LkIcon m={VERT_ICON_MAP} n={v.icon} size={15} color={v.id===vertId?v.color:"#CBD5E1"} emoji={v.emoji || VERT_ICON_EMOJIS[v.icon]} />
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:v.id===vertId?v.color:"#CBD5E1"}}>{v.label}</div>
                    <div style={{fontSize:9,color:"#475569"}}>{CONTACTS.filter(c=>c.vertical===v.id).length} contacts</div>
                  </div>
                  {v.id===vertId&&<IE emoji="✓" Icon={Check} size={12} color={v.color} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
        {NAV.map(([id, Icon, label, emoji])=>(
          <button key={id} onClick={()=>goView(id as ExtView)} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 9px",borderRadius:6,border:"none",width:"100%",textAlign:"left",background:view===id&&!selC&&!selD&&!selCo?`${P}15`:"transparent",color:view===id&&!selC&&!selD&&!selCo?P:"#94A3B8",fontSize:11,fontWeight:view===id&&!selC&&!selD&&!selCo?600:400,cursor:"pointer"}}>
            <IE emoji={emoji} Icon={Icon} size={14} />{label}
          </button>
        ))}
        <div style={{flex:1}} />
        <button onClick={()=>window.open("/onboard","_self")} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 9px",borderRadius:6,border:"none",background:"transparent",color:"#94A3B8",fontSize:11,cursor:"pointer"}}>
          <IE emoji="⚙️" Icon={Settings} size={14} />Settings
        </button>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 13px",background:"#fff",borderBottom:"1px solid #E2E8F0",flexShrink:0,position:"relative"}}>
          <div style={{flex:1,minWidth:0}}>
            <Breadcrumb>
              <BreadcrumbList>
                {selectedContact && view==="contacts" ? (<>
                  <BreadcrumbItem><BreadcrumbLink onClick={()=>{setSelC(null);setSelectedContact(null);}}>Contacts</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbLink onClick={()=>setSelectedContact(null)}>{selC?.fn} {selC?.ln}</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>Full Profile</BreadcrumbPage></BreadcrumbItem>
                </>) : selC ? (<>
                  <BreadcrumbItem><BreadcrumbLink onClick={()=>setSelC(null)}>Contacts</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>{selC.fn} {selC.ln}</BreadcrumbPage></BreadcrumbItem>
                </>) : selD ? (<>
                  <BreadcrumbItem><BreadcrumbLink onClick={()=>setSelD(null)}>Pipeline</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>{selD.title}</BreadcrumbPage></BreadcrumbItem>
                </>) : selCo ? (<>
                  <BreadcrumbItem><BreadcrumbLink onClick={()=>setSelCo(null)}>Companies</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>{selCo.name}</BreadcrumbPage></BreadcrumbItem>
                </>) : view==="dashboard" ? (
                  <BreadcrumbItem><BreadcrumbPage>Dashboard</BreadcrumbPage></BreadcrumbItem>
                ) : (<>
                  <BreadcrumbItem><BreadcrumbLink onClick={()=>goView("dashboard")}>Dashboard</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>{titles[view]}</BreadcrumbPage></BreadcrumbItem>
                </>)}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div style={{position:"relative"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{padding:"5px 8px 5px 26px",fontSize:11,border:"1px solid #E2E8F0",borderRadius:7,background:"#F8FAFC",width:140,color:"#0F172A"}} />
            <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",display:"flex"}}><Search size={12} color="#94A3B8" /></span>
          </div>
          {["contacts","deals","lists"].includes(view)&&!selC&&!selD&&!selCo&&(
            <button onClick={()=>setModal("create")} style={{fontSize:11,padding:"5px 10px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,display:"flex",alignItems:"center",gap:3,fontWeight:600,cursor:"pointer"}}>+ Add</button>
          )}
          <button onClick={()=>setShowDocAgent(true)} style={{fontSize:11,padding:"5px 10px",background:P+"15",color:P,border:`1px solid ${P}44`,borderRadius:6,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><IE emoji="✨" Icon={Sparkles} size={12} />Build with Agent</button>
          <button onClick={()=>{setCsvStep(0);setModal("csv");}} style={{fontSize:11,padding:"5px 10px",background:"#F8FAFC",color:"#64748B",border:"1px solid #E2E8F0",borderRadius:6,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><IE emoji="📤" Icon={Upload} size={12} />Import</button>
          <button onClick={toggle} title={emojiMode?"Switch to Icons":"Switch to Emoji"} style={{fontSize:11,padding:"4px 9px",background:emojiMode?"#FFFBEB":"#F1F5F9",color:emojiMode?"#B45309":"#64748B",border:`1px solid ${emojiMode?"#FDE68A":"#E2E8F0"}`,borderRadius:6,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
            {emojiMode?<span style={{fontSize:13,lineHeight:1}}>😊</span>:<Smile size={12} />}
            {emojiMode?"Emoji":"Icons"}
          </button>
          <div style={{position:"relative"}}>
            <button onClick={()=>setNotifOpen(!notifOpen)} style={{background:"none",border:"none",cursor:"pointer",padding:"3px",color:"#64748B",position:"relative",display:"flex"}}>
              <IE emoji="🔔" Icon={Bell} size={17} /><span style={{position:"absolute",top:2,right:2,width:6,height:6,background:"#EF4444",borderRadius:"50%",border:"1.5px solid #fff"}} />
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

        <div style={{flex:1,overflowY:"auto",padding:14,position:"relative"}} onClick={()=>setVertOpen(false)}>
          {view==="dashboard"  && renderDashboard()}
          {view==="companies"  && renderCompanies()}
          {view==="deals"      && renderDeals()}
          {view==="lists"      && renderLists()}
          {view==="reports"    && renderReports()}
          {view==="activity"   && renderActivity()}
          {view==="pipeline"   && <div style={{position:"absolute",inset:0,overflow:"hidden"}}><PipelineViz /></div>}
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
          {view==="map"         && <MapView vertId={vertId} onSelectContact={(loc)=>{
            if(loc.type==="contact"){
              const match=contacts.find(c=>`${c.fn} ${c.ln}`===loc.name)||contacts[0];
              if(match){setSelC(match);goView("contacts");}
            } else {
              const match=companies.find(co=>co.name===loc.name)||companies[0];
              if(match){setSelCo(match);goView("companies");}
            }
          }} />}
          {view==="docs"        && <DocumentCenter vertId={vertId} onNewEstimate={()=>goView("estimates")} initialTab={docsInitialTab} extraDocs={savedEstDocs} />}
          {view==="finance"     && <FinancialHub />}
          {view==="estimates"   && <EstimateBuilder vertId={vertId} onSave={(data)=>{
            if(data){
              const today = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
              const due   = new Date(Date.now()+30*24*60*60*1000).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
              setSavedEstDocs(p=>[...p,{
                id:"est"+Date.now(), type:"estimate", templateId:"", number:"EST-2026-"+String(400+p.length+2),
                title:data.title||"New Estimate", contact:data.contact, company:data.company, email:data.email,
                vendor:"",vendorContact:"",status:"draft",created:today,dueDate:due,
                companyName:"KOVA Services LLC",companyAddress:"Tampa, FL",
                lines:data.lines, tax:data.tax, notes:data.notes, terms:data.terms,
                accentColor:"#F97316",font:"Inter",
              }]);
            }
            setDocsInitialTab("estimate"); goView("docs");
          }} onAddToPipeline={(d)=>{
            const newDeal = { id: Date.now(), title: d.title, co: d.co, contact: d.contact, val: d.val, prob: 50, close: new Date(Date.now()+30*24*60*60*1000).toISOString().split("T")[0], stage_hist: [ALL_STAGES[0]] };
            setPipeDeals(prev=>{ const n={...prev}; n[ALL_STAGES[0]]=[...(n[ALL_STAGES[0]]||[]),newDeal]; return n; });
            setDealsTab("kanban");
            goView("deals");
          }} />}
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ── Active Call Modal ── */}
      {callActive && selC && (
        <div style={{position:"fixed",inset:0,background:"rgba(10,15,40,0.88)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)"}}>
          <div style={{background:"linear-gradient(160deg,#0f1f4a 0%,#0a1330 100%)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,width:280,padding:"36px 24px 28px",display:"flex",flexDirection:"column",alignItems:"center",gap:16,boxShadow:"0 32px 80px rgba(0,0,0,0.6)"}}>
            {/* Avatar */}
            <div style={{width:72,height:72,borderRadius:"50%",background:P+"25",border:`2px solid ${P}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:P}}>
              {ini(selC.fn,selC.ln)}
            </div>
            {/* Name & number */}
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:4}}>{selC.fn} {selC.ln}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.45)"}}>{selC.phone||"+1 (555) 234-5678"}</div>
            </div>
            {/* Status / timer */}
            {callRinging ? (
              <div style={{fontSize:13,color:P,fontWeight:600,letterSpacing:"0.04em",animation:"pulse 1.4s ease-in-out infinite"}}>
                Calling…
              </div>
            ) : (
              <div style={{fontSize:22,color:"#fff",fontWeight:300,fontVariantNumeric:"tabular-nums",letterSpacing:"0.05em"}}>
                {fmtCall(callSeconds)}
              </div>
            )}
            {/* Action buttons */}
            {!callRinging && (
              <div style={{display:"flex",gap:20,marginTop:4}}>
                {[["🔇","Mute"],["🔊","Speaker"],["⌨️","Keypad"]].map(([em,lbl])=>(
                  <div key={lbl} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <button style={{width:46,height:46,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {em}
                    </button>
                    <span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>{lbl}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Hang up */}
            <button onClick={hangUp} style={{marginTop:8,width:64,height:64,borderRadius:"50%",background:"#EF4444",border:"none",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(239,68,68,0.45)"}}>
              📵
            </button>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:-8}}>Hang Up</span>
          </div>
        </div>
      )}

      {showScanModal && (
        <CardScanModal
          onClose={()=>setShowScanModal(false)}
          onAdd={(c)=>{ toast(`${c.firstName} ${c.lastName} added to contacts`); setShowScanModal(false); }}
        />
      )}

      {modal&&(
        <div onClick={()=>setModal(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:12,width:420,maxHeight:580,overflowY:"auto",padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontSize:15,fontWeight:700,color:"#0F172A"}}>{modal==="score"?"AI Score Breakdown":modal==="csv"?"Import CSV":view==="deals"?"Add New Deal":"Add New Contact"}</span>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:18,color:"#94A3B8",cursor:"pointer"}}>×</button>
            </div>
            {modal==="score"  && renderScoreModal()}
            {modal==="csv"    && renderCSV()}
            {modal==="create" && view!=="deals" && (
              <div>
                {([["First Name","text","Sarah","firstName"],["Last Name","text","Mitchell","lastName"],["Company","text","Company Name","company"],["Email","email","email@example.com","email"],["Phone","tel","(555) 000-0000","phone"]] as [string,string,string,string][]).map(([l,t,ph,key])=>(
                  <div key={l} style={{marginBottom:9}}>
                    <label style={{fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:3}}>{l}</label>
                    <input type={t} placeholder={ph}
                      value={(newContactForm as any)[key]}
                      onChange={e=>setNewContactForm(prev=>({...prev,[key]:e.target.value}))}
                      style={{width:"100%",padding:"8px 10px",border:"1px solid #E2E8F0",borderRadius:7,fontSize:13,color:"#0F172A",background:"#F8FAFC"}} />
                  </div>
                ))}
                <button onClick={()=>{
                  if(!newContactForm.firstName.trim())return;
                  const nc:Contact={id:Date.now(),vertical:vertId,fn:newContactForm.firstName,ln:newContactForm.lastName,co:newContactForm.company,role:"",email:newContactForm.email,phone:newContactForm.phone,status:"new",score:0,city:"",deals:0,lastAct:"Just now",notes:"",breakdown:[],insight:"",action:""};
                  setLocalContacts(prev=>[...prev,nc]);
                  setNewContactForm({firstName:"",lastName:"",company:"",email:"",phone:""});
                  setModal(null);
                  goView("contacts");
                }} style={{width:"100%",padding:"9px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}>Create Contact</button>
              </div>
            )}
            {modal==="create" && view==="deals" && (
              <div>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:6}}>Stage</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {ALL_STAGES.map(s=>(
                      <button key={s} onClick={()=>setNewDealStage(s)} style={{fontSize:11,padding:"3px 9px",borderRadius:6,border:`1px solid ${newDealStage===s?P:"#E2E8F0"}`,background:newDealStage===s?P+"15":"#F8FAFC",color:newDealStage===s?P:"#64748B",cursor:"pointer",fontWeight:newDealStage===s?600:400}}>{s}</button>
                    ))}
                  </div>
                </div>
                {([["Deal Title","text","e.g. Office Renovation","title"],["Company","text","Company name","co"],["Contact","text","Contact name","contact"],["Value ($)","number","25000","val"],["Probability (%)","number","50","prob"],["Close Date","date","","close"]] as [string,string,string,string][]).map(([l,t,ph,key])=>(
                  <div key={l} style={{marginBottom:9}}>
                    <label style={{fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:3}}>{l}</label>
                    <input type={t} placeholder={ph}
                      value={(newDealForm as any)[key]}
                      onChange={e=>setNewDealForm(prev=>({...prev,[key]:e.target.value}))}
                      style={{width:"100%",padding:"8px 10px",border:"1px solid #E2E8F0",borderRadius:7,fontSize:13,color:"#0F172A",background:"#F8FAFC"}} />
                  </div>
                ))}
                <Button className="w-full mt-1" style={{background:"#0F172A",color:"#fff"}} onClick={()=>{
                  if(!newDealForm.title.trim())return;
                  const d:Deal={id:Date.now(),title:newDealForm.title,co:newDealForm.co,contact:newDealForm.contact,val:parseInt(newDealForm.val)||0,prob:parseInt(newDealForm.prob)||50,close:newDealForm.close||"TBD",stage_hist:[newDealStage]};
                  setPipeDeals(prev=>{const n:Record<string,Deal[]>={};for(const[k,v]of Object.entries(prev))n[k]=[...v];n[newDealStage]=[...(n[newDealStage]||[]),d];return n;});
                  setNewDealForm({title:"",co:"",contact:"",val:"",prob:"50",close:""});
                  setModal(null);
                }}>Create Deal</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
