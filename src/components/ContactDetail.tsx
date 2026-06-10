"use client";
import { useState, useCallback, useEffect } from "react";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Mail, Phone, MapPin, FileText, CheckCircle2, Calendar, ClipboardList,
  DollarSign, Target, MessageSquare, Zap, Brain, LayoutDashboard,
  BarChart2, FolderOpen, User, Check, Bookmark
} from "lucide-react";
import { IE } from "@/lib/icon-mode";
import CONTACT_DATA from "@/lib/contact-data";

type LkIconType = React.ComponentType<any>;

interface ContactFull {
  id:number; name:string; company:string; title:string; email:string;
  phone:string; address:string; city:string; state:string; zip:string;
  website:string; linkedin:string; source:string; tags:string[];
  score:number; stage:string; status:string; vertical:string;
  avatar:string; initials:string;
  // Stats
  lifetimeValue:number; dealCount:number; quoteCount:number;
  avgDealSize:number; lastContact:string; firstContact:string;
  lastPurchase:string; nextLikelyAction:string; buyProbability:number;
  preferredChannel:string; responseTime:string;
  // Behavior
  emailsOpened:number; emailsSent:number; meetingsHeld:number;
  quotesAccepted:number; quotesSent:number; pageVisits:number;
  lastPageVisited:string; referralSource:string;
}

interface Activity {
  id:string; type:"email"|"call"|"note"|"task"|"meeting"|"quote"|"deal"|"score"|"sms";
  title:string; body:string; date:string; time:string; status?:string;
  from?:string; to?:string;
}

interface Deal { id:string; name:string; value:number; stage:string; probability:number; closeDate:string; }
interface Quote { id:string; number:string; title:string; total:number; status:string; date:string; }
interface Task { id:string; title:string; due:string; done:boolean; priority:string; }

// ── SAMPLE DATA ──────────────────────────────────────────────────────────────
const SAMPLE_CONTACT: ContactFull = {
  id:1, name:"Sarah Mitchell", company:"Apex Realty Group", title:"Managing Broker",
  email:"s.mitchell@apexrealty.com", phone:"(305) 714-2381",
  address:"2400 Brickell Ave, Suite 310", city:"Miami", state:"FL", zip:"33129",
  website:"apexrealtygroup.com", linkedin:"linkedin.com/in/sarahmitchell",
  source:"Google Ads", tags:["VIP","Referral Partner","Active"],
  score:87, stage:"Customer", status:"Active", vertical:"Real Estate",
  avatar:"", initials:"SM",
  lifetimeValue:48600, dealCount:4, quoteCount:6,
  avgDealSize:12150, lastContact:"Jun 4, 2026", firstContact:"Mar 14, 2024",
  lastPurchase:"Jun 2, 2026", nextLikelyAction:"Close Coral Gables staging deal — follow up Tue AM",
  buyProbability:72, preferredChannel:"Email", responseTime:"< 2 hours",
  emailsOpened:34, emailsSent:42, meetingsHeld:8,
  quotesAccepted:4, quotesSent:6, pageVisits:156,
  lastPageVisited:"Pricing page — May 30", referralSource:"Google Ads → Landing Page",
};

const SAMPLE_ACTIVITIES: Activity[] = [
  {id:"a1",type:"sms",title:"Coral Gables proposal follow-up",body:"Hi Sarah — did you get a chance to look at Q-2026-004? Happy to adjust the furniture package if the budget needs to shift. – Michael",date:"Jun 4",time:"9:22 AM",status:"delivered"},
  {id:"a2",type:"email",title:"Re: Hialeah listing staging proposal",body:"Sarah replied confirming she wants to move forward with the full package. Signed the quote the same afternoon. Invoice sent, deposit due in 5 days.",date:"Jun 2",time:"2:14 PM",from:"s.mitchell@apexrealty.com",to:"you"},
  {id:"a3",type:"sms",title:"Pre-close follow-up — Hialeah quote",body:"Hi Sarah, just checking in — did you get a chance to review the staging proposal? Happy to adjust anything. – Michael",date:"May 31",time:"10:15 AM",status:"delivered"},
  {id:"a4",type:"quote",title:"Quote accepted — Property Staging Q-2026-001",body:"$8,180 — full staging, professional photography, and landscaping touch-up for the Hialeah listing. Sarah accepted within 3 hours of receiving it.",date:"May 30",time:"10:30 AM",status:"accepted"},
  {id:"a5",type:"meeting",title:"Listing strategy review — 45 min",body:"Walked through 3 upcoming listings: Hialeah, Coral Gables, and a Brickell condo. Sarah wants staging proposals for all three. Also discussed a referral arrangement for her property management clients.",date:"May 28",time:"11:00 AM"},
  {id:"a6",type:"call",title:"Inbound call — Hialeah listing inquiry",body:"Sarah called about staging a new 3BR at 1420 W 49th St, Hialeah. Wants a quote by Friday. Budget ~$8K. Timeline: 2 weeks out from listing. Said the last place we staged sold above ask.",date:"May 27",time:"3:45 PM"},
  {id:"a7",type:"score",title:"AI Score updated → 87",body:"Fit: 92 · Intent: 84 · Timing: 88 · Value: 85. Moved from 74 to 87 in 30 days. Strong referral partner. Nurture with quarterly check-ins and early access to new service packages.",date:"May 25",time:"9:00 AM"},
  {id:"a8",type:"note",title:"Broward County expansion — flag for July",body:"Sarah mentioned she's opening a second office in Broward County in Q3. Expects 3–5 listings per quarter from that market. Flagged for volume pricing conversation in early July.",date:"May 20",time:"4:10 PM"},
  {id:"a9",type:"call",title:"Check-in call — market timing",body:"10-minute catch-up. She's watching the Broward market closely before committing to the second office. Said staging turnaround time matters a lot to her team. Noted: she evaluates vendors primarily on speed and reliability.",date:"May 5",time:"2:30 PM"},
  {id:"a10",type:"deal",title:"Deal closed — Brickell Condo Photography",body:"$2,600 photography package for a Brickell condo listing. First closed deal. Delivered 3 days early. Sarah sent a referral the following week.",date:"Apr 10",time:"3:00 PM",status:"won"},
  {id:"a11",type:"meeting",title:"First meeting — discovery & needs assessment",body:"45-minute intro call. Sarah manages 12 agents and handles roughly 8–10 listings per month. Looking for a reliable staging and photography partner. Pain point: slow turnaround from current vendors.",date:"Mar 20",time:"10:00 AM"},
  {id:"a12",type:"email",title:"Welcome to KOVA — your CRM is ready",body:"Automated onboarding email delivered. Opened within 90 minutes. Clicked the 'View Your Dashboard' CTA.",date:"Mar 14",time:"9:00 AM",status:"opened"},
];

const SAMPLE_DEALS: Deal[] = [
  {id:"d1",name:"Hialeah Listing — Full Staging Package",value:8180,stage:"Closed Won",probability:100,closeDate:"Jun 2, 2026"},
  {id:"d2",name:"Coral Gables Home Staging",value:12400,stage:"Proposal Sent",probability:65,closeDate:"Jun 20, 2026"},
  {id:"d3",name:"Broward Volume Staging Agreement — Q3",value:24000,stage:"Discovery",probability:28,closeDate:"Aug 1, 2026"},
  {id:"d4",name:"Brickell Condo Photography",value:2600,stage:"Closed Won",probability:100,closeDate:"Apr 10, 2026"},
  {id:"d5",name:"Annual Photography Retainer — Apex Realty",value:9600,stage:"Qualifying",probability:45,closeDate:"Jul 8, 2026"},
];

const SAMPLE_QUOTES: Quote[] = [
  {id:"q1",number:"Q-2026-001",title:"Property Staging — Hialeah",total:8180,status:"accepted",date:"May 30"},
  {id:"q2",number:"Q-2026-004",title:"Home Staging — Coral Gables",total:12400,status:"sent",date:"Jun 1"},
  {id:"q3",number:"Q-2026-009",title:"Annual Photography Retainer — Apex",total:9600,status:"viewed",date:"Jun 3"},
  {id:"q4",number:"Q-2026-005",title:"Photography Package — Brickell",total:2600,status:"accepted",date:"Apr 8"},
  {id:"q5",number:"Q-2026-002",title:"Staging — Kendall Listing (declined)",total:7400,status:"declined",date:"Apr 22"},
];

const SAMPLE_TASKS: Task[] = [
  {id:"t1",title:"Follow up on Coral Gables proposal (Q-2026-004)",due:"Jun 6",done:false,priority:"high"},
  {id:"t2",title:"Prepare volume pricing deck for Broward office opening",due:"Jun 30",done:false,priority:"medium"},
  {id:"t3",title:"Schedule Q3 check-in — Broward expansion timing",due:"Jun 15",done:false,priority:"medium"},
  {id:"t4",title:"Send retainer contract for annual photography agreement",due:"Jun 10",done:false,priority:"high"},
  {id:"t5",title:"Send welcome package to Sarah's 3 new Broward agents",due:"May 20",done:true,priority:"low"},
];

const SAMPLE_NOTES = [
  {id:"n1",text:"Sarah is opening a Broward office in Q3 (August target). She's expecting 3–5 new listings per month from that market. Volume pricing deck needs to be ready before the June 30 follow-up.",date:"May 20",by:"Michael"},
  {id:"n2",text:"Prefers email for proposals — always responds within 2 hours during business hours. Best days to reach: Tuesday or Thursday AM. Never call before 9am.",date:"Apr 15",by:"Michael"},
  {id:"n3",text:"Referral partner value: has sent 2 property management clients who each converted. One at $6,200/yr, one at $4,800/yr. Consider locking in a formal referral discount (10%) to protect this channel.",date:"Mar 28",by:"AI Agent"},
  {id:"n4",text:"Lost the Kendall staging quote in April to a cheaper local competitor ($7,400 vs our $7,400 — they just moved faster). She came back 3 weeks later. Speed and responsiveness are key differentiators for her team.",date:"Apr 22",by:"Michael"},
];

const ACTIVITY_ICONS: Record<string,{icon: LkIconType, emoji: string, color:string}> = {
  email:   {icon: Mail,          emoji:"✉️",  color:"#3B9EFF"},
  call:    {icon: Phone,         emoji:"📞",  color:"#10B981"},
  note:    {icon: FileText,      emoji:"📝",  color:"#F59E0B"},
  task:    {icon: CheckCircle2,  emoji:"☑️",  color:"#64748B"},
  meeting: {icon: Calendar,      emoji:"📅",  color:"#A78BFA"},
  quote:   {icon: ClipboardList, emoji:"📋",  color:"#00C896"},
  deal:    {icon: DollarSign,    emoji:"💰",  color:"#EC4899"},
  score:   {icon: Target,        emoji:"🎯",  color:"#EF4444"},
  sms:     {icon: MessageSquare, emoji:"💬",  color:"#6366F1"},
};

function fv(n:number){ return "$"+n.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0}); }

type BlockId = "score" | "activity" | "deals" | "info" | "nextaction" | "tasks";

const DEFAULT_BLOCKS: BlockId[] = ["score", "activity", "deals", "info", "nextaction", "tasks"];

export default function ContactDetail({ contact, accentColor, onBack }:{ contact?:any; accentColor:string; onBack:()=>void }) {
  const [tab, setTab] = useState("overview");
  const [taskDone, setTaskDone] = useState<Record<string,boolean>>({});
  useEffect(() => {
    const id = (contact?.id as number) || 0;
    const tasks = CONTACT_DATA[id]?.tasks ?? SAMPLE_TASKS;
    const map: Record<string,boolean> = {};
    tasks.forEach((t:any) => { if (t.done) map[t.id] = true; });
    setTaskDone(map);
  }, [contact?.id]);
  const [blocks, setBlocks] = useState<BlockId[]>(DEFAULT_BLOCKS);
  const [draggingBlock, setDraggingBlock] = useState<BlockId|null>(null);
  const P = accentColor;

  // Normalize CRM Contact format (fn/ln/co) to the full ContactDetail format
  const raw = contact || SAMPLE_CONTACT;
  const rawId = (raw.id as number) || 0;
  const cd = CONTACT_DATA[rawId] ?? null;
  const c: any = raw.fn !== undefined ? {
    ...SAMPLE_CONTACT,
    ...(cd ? {
      address:cd.address, zip:cd.zip, website:cd.website, linkedin:cd.linkedin,
      source:cd.source, tags:cd.tags,
      lifetimeValue:cd.lifetimeValue, dealCount:cd.dealCount, quoteCount:cd.quoteCount,
      avgDealSize:cd.avgDealSize, lastContact:cd.lastContact, firstContact:cd.firstContact,
      lastPurchase:cd.lastPurchase, buyProbability:cd.buyProbability,
      preferredChannel:cd.preferredChannel, responseTime:cd.responseTime,
      emailsOpened:cd.emailsOpened, emailsSent:cd.emailsSent, meetingsHeld:cd.meetingsHeld,
      quotesAccepted:cd.quotesAccepted, quotesSent:cd.quotesSent, pageVisits:cd.pageVisits,
      lastPageVisited:cd.lastPageVisited, referralSource:cd.referralSource,
    } : {}),
    name:    `${raw.fn} ${raw.ln}`,
    company: raw.co,
    title:   raw.role,
    email:   raw.email,
    phone:   raw.phone,
    city:    raw.city?.split(",")[0]  ?? "Miami",
    state:   raw.city?.split(", ")[1] ?? "FL",
    score:   raw.score,
    initials:(raw.fn[0] || "") + (raw.ln[0] || ""),
    status:  raw.status === "customer" ? "Active" : raw.status.charAt(0).toUpperCase() + raw.status.slice(1),
    stage:   raw.status === "customer" ? "Customer" : raw.status === "qualified" ? "Qualified" : "Lead",
    notes:   raw.notes  ?? "",
    nextLikelyAction: cd?.nextLikelyAction ?? raw.action ?? SAMPLE_CONTACT.nextLikelyAction,
  } : raw;
  const cActs   = cd?.activities ?? SAMPLE_ACTIVITIES;
  const cDeals  = cd?.deals      ?? SAMPLE_DEALS;
  const cQuotes = cd?.quotes     ?? SAMPLE_QUOTES;
  const cTasks  = cd?.tasks      ?? SAMPLE_TASKS;
  const cNotes  = cd?.notes      ?? SAMPLE_NOTES;
  const cDocs   = cd?.docs       ?? ([] as any[]);
  const cCal    = cd?.calendar   ?? ([] as any[]);
  const aiPred  = cd?.aiPrediction ?? `${c.name} is ${c.buyProbability}% likely to close. Best channel: ${c.preferredChannel}. Response time: ${c.responseTime}.`;

  const handleBlockDragStart = useCallback((id: BlockId) => setDraggingBlock(id), []);
  const handleBlockDrop = useCallback((targetId: BlockId) => {
    if (!draggingBlock || draggingBlock === targetId) { setDraggingBlock(null); return; }
    setBlocks(prev => {
      const next = [...prev];
      const from = next.indexOf(draggingBlock);
      const to = next.indexOf(targetId);
      next.splice(from, 1);
      next.splice(to, 0, draggingBlock);
      return next;
    });
    setDraggingBlock(null);
  }, [draggingBlock]);

  const TABS: {id:string; label:string; icon: LkIconType; emoji: string; count?: number}[] = [
    {id:"overview",  label:"Overview",   icon:LayoutDashboard, emoji:"🧩"},
    {id:"activity",  label:"Activity",   icon:Zap,             emoji:"⚡", count:cActs.length},
    {id:"email",     label:"Email",      icon:Mail,             emoji:"✉️", count:cActs.filter((a:any)=>a.type==="email").length},
    {id:"tasks",     label:"Tasks",      icon:CheckCircle2,     emoji:"☑️", count:cTasks.filter((t:any)=>!taskDone[t.id]&&!t.done).length},
    {id:"notes",     label:"Notes",      icon:FileText,         emoji:"📝", count:cNotes.length},
    {id:"calendar",  label:"Calendar",   icon:Calendar,         emoji:"📅", count:cCal.length},
    {id:"quotes",    label:"Quotes",     icon:ClipboardList,    emoji:"📋", count:cQuotes.length},
    {id:"deals",     label:"Deals",      icon:DollarSign,       emoji:"💰", count:cDeals.length},
    {id:"stats",     label:"Stats",      icon:BarChart2,        emoji:"📊"},
    {id:"docs",      label:"Documents",  icon:FolderOpen,       emoji:"🗂️", count:cDocs.length},
  ];

  const scoreColor = c.score>=80?"#15803D":c.score>=60?"#F59E0B":c.score>=40?"#3B9EFF":"#EF4444";

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink onClick={onBack}>Contacts</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink onClick={onBack}>{c.name}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Full Profile</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* CONTACT HEADER */}
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:12,overflow:"hidden",marginBottom:10}}>
        <div style={{background:`linear-gradient(135deg,${P}12,${P}04)`,padding:"16px 18px",display:"flex",gap:14,alignItems:"flex-start"}}>
          {/* Avatar + Score */}
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:P+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:P,border:`2px solid ${P}44`}}>
              {c.initials}
            </div>
            {/* Score ring */}
            <div style={{position:"absolute",bottom:-4,right:-4,width:26,height:26,borderRadius:"50%",background:scoreColor,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}>
              <span style={{fontSize:10,fontWeight:700,color:"#fff"}}>{c.score}</span>
            </div>
          </div>

          {/* Name + Info */}
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
              <span style={{fontSize:18,fontWeight:700,color:"#0F172A"}}>{c.name}</span>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"#F0FDF4",color:"#15803D",fontWeight:600,border:"1px solid #86EFAC"}}>{c.status}</span>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:P+"15",color:P,fontWeight:600}}>{c.stage}</span>
            </div>
            <div style={{fontSize:12,color:"#64748B",marginBottom:4}}>{c.title} · {c.company}</div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:11,color:"#64748B"}}>
              <span style={{display:"flex",alignItems:"center",gap:3}}><IE emoji="✉️" Icon={Mail} size={11} color="#94A3B8" />{c.email}</span>
              <span style={{display:"flex",alignItems:"center",gap:3}}><IE emoji="📞" Icon={Phone} size={11} color="#94A3B8" />{c.phone}</span>
              <span style={{display:"flex",alignItems:"center",gap:3}}><IE emoji="📍" Icon={MapPin} size={11} color="#94A3B8" />{c.city}, {c.state}</span>
            </div>
            <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
              {c.tags.map((t:string)=><span key={t} style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:"#F1F5F9",color:"#64748B",fontWeight:500}}>{t}</span>)}
              <span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:"#EFF6FF",color:"#1D4ED8",fontWeight:500}}>Source: {c.source}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
            <button style={{padding:"6px 12px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>+ New Deal</button>
            <button style={{padding:"6px 12px",background:P+"15",color:P,border:`1px solid ${P}44`,borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><IE emoji="📋" Icon={ClipboardList} size={11} /> Create Quote</button>
            <button style={{padding:"6px 12px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:6,fontSize:11,color:"#64748B",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><IE emoji="✉️" Icon={Mail} size={11} /> Follow Up</button>
          </div>
        </div>

        {/* AI Next Best Action */}
        <div style={{padding:"10px 18px",background:"#FFFBEB",borderTop:"1px solid #FDE68A",display:"flex",gap:8,alignItems:"center"}}>
          <IE emoji="🧠" Icon={Brain} size={13} color="#B45309" />
          <div style={{flex:1}}>
            <span style={{fontSize:10,fontWeight:700,color:"#B45309"}}>AI Recommendation: </span>
            <span style={{fontSize:11,color:"#92400E"}}>{c.nextLikelyAction}. Buy probability: {c.buyProbability}%. Best channel: {c.preferredChannel}. Response time: {c.responseTime}.</span>
          </div>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #E2E8F0",background:"#fff",borderRadius:"8px 8px 0 0",overflowX:"auto",marginBottom:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 12px",fontSize:11,fontWeight:tab===t.id?600:400,border:"none",background:"none",cursor:"pointer",color:tab===t.id?P:"#64748B",borderBottom:tab===t.id?`2px solid ${P}`:"2px solid transparent",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
            <IE emoji={t.emoji} Icon={t.icon} size={12} />{t.label}
            {t.count!==undefined && <span style={{fontSize:9,background:tab===t.id?P+"15":"#F1F5F9",color:tab===t.id?P:"#94A3B8",padding:"1px 5px",borderRadius:99,fontWeight:700}}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"14px 16px",minHeight:300}}>

        {/* OVERVIEW — draggable blocks */}
        {tab==="overview" && (() => {
          const scoreColor = c.score>=80?"#15803D":c.score>=60?"#F59E0B":c.score>=40?"#3B9EFF":"#EF4444";
          const openDeals = cDeals.filter((d:any)=>d.stage!=="Closed Won");
          const openTasks = cTasks.filter((t:any)=>!taskDone[t.id]&&!t.done);

          const BLOCK_MAP: Record<BlockId, { title: string; icon: LkIconType; emoji: string; content: React.ReactNode }> = {
            score: {
              title: "AI Lead Score",
              icon: Target, emoji: "🎯",
              content: (
                <div style={{display:"flex",alignItems:"center",gap:14,padding:"6px 0"}}>
                  <div style={{width:56,height:56,borderRadius:"50%",background:scoreColor,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff",boxShadow:"0 0 0 3px "+scoreColor+"33",flexShrink:0}}>
                    <span style={{fontSize:18,fontWeight:800,color:"#fff"}}>{c.score}</span>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#0F172A",marginBottom:2}}>{c.score>=80?"High Priority":c.score>=60?"Warm Lead":"Needs Nurture"}</div>
                    <div style={{fontSize:11,color:"#64748B"}}>Buy probability: {c.buyProbability}%</div>
                    <div style={{fontSize:11,color:"#64748B"}}>Stage: {c.stage}</div>
                  </div>
                </div>
              )
            },
            activity: {
              title: "Recent Activity",
              icon: Zap, emoji: "⚡",
              content: (
                <div style={{display:"flex",flexDirection:"column",gap:0}}>
                  {cActs.slice(0,3).map((a:any,i:number)=>{
                    const ai = ACTIVITY_ICONS[a.type]||{icon:Bookmark, emoji:"📌", color:"#64748B"};
                    return (
                      <div key={a.id} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"5px 0",borderBottom:i<2?"1px solid #F8FAFC":"none"}}>
                        <div style={{width:22,height:22,borderRadius:"50%",background:ai.color+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><IE emoji={ai.emoji} Icon={ai.icon} size={10} color={ai.color} /></div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:600,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>
                          <div style={{fontSize:10,color:"#94A3B8"}}>{a.date}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            },
            deals: {
              title: "Open Deals",
              icon: DollarSign, emoji: "💰",
              content: openDeals.length===0 ? (
                <div style={{fontSize:11,color:"#94A3B8",textAlign:"center",padding:"10px 0"}}>No open deals</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {openDeals.map(d=>(
                    <div key={d.id} style={{display:"flex",alignItems:"center",gap:7,padding:"4px 6px",background:"#F8FAFC",borderRadius:5}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:600,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div>
                        <div style={{fontSize:10,color:"#64748B"}}>{d.stage} · {d.probability}%</div>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:P,flexShrink:0}}>{fv(d.value)}</span>
                    </div>
                  ))}
                </div>
              )
            },
            info: {
              title: "Contact Info",
              icon: User, emoji: "👤",
              content: (
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {[["Email",c.email],["Phone",c.phone],["Company",c.company],["Location",c.city+", "+c.state]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",gap:7,fontSize:11}}>
                      <span style={{color:"#94A3B8",minWidth:55}}>{l}</span>
                      <span style={{color:"#0F172A",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v as string}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                    {c.tags.map((t:string)=><span key={t} style={{fontSize:9,padding:"2px 6px",borderRadius:99,background:"#F1F5F9",color:"#64748B"}}>{t}</span>)}
                  </div>
                </div>
              )
            },
            nextaction: {
              title: "Next Best Action",
              icon: Brain, emoji: "🧠",
              content: (
                <div style={{padding:"8px 10px",background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:7}}>
                  <div style={{fontSize:11,color:"#92400E",lineHeight:1.6,marginBottom:5}}>{c.nextLikelyAction}.</div>
                  <div style={{display:"flex",gap:10,fontSize:10,color:"#B45309"}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:3}}><IE emoji="✉️" Icon={Mail} size={9} /> {c.preferredChannel}</span>
                    <span style={{display:"inline-flex",alignItems:"center",gap:3}}><IE emoji="⚡" Icon={Zap} size={9} /> {c.responseTime}</span>
                    <span style={{display:"inline-flex",alignItems:"center",gap:3}}><IE emoji="🎯" Icon={Target} size={9} /> {c.buyProbability}% close</span>
                  </div>
                </div>
              )
            },
            tasks: {
              title: "Open Tasks",
              icon: CheckCircle2, emoji: "☑️",
              content: openTasks.length===0 ? (
                <div style={{fontSize:11,color:"#94A3B8",textAlign:"center",padding:"10px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>All tasks complete <IE emoji="✅" Icon={Check} size={11} /></div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {openTasks.slice(0,3).map(t=>(
                    <div key={t.id} onClick={()=>setTaskDone(p=>({...p,[t.id]:true}))} style={{display:"flex",gap:7,alignItems:"center",padding:"4px 6px",background:"#F8FAFC",borderRadius:5,cursor:"pointer"}}>
                      <div style={{width:14,height:14,borderRadius:3,border:"1.5px solid #CBD5E1",flexShrink:0}} />
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div>
                        <div style={{fontSize:10,color:"#94A3B8"}}>{t.due}</div>
                      </div>
                      <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:t.priority==="high"?"#FEF2F2":"#F8FAFC",color:t.priority==="high"?"#B91C1C":"#64748B",fontWeight:600}}>{t.priority}</span>
                    </div>
                  ))}
                  {openTasks.length>3 && <div style={{fontSize:10,color:"#94A3B8",textAlign:"center",paddingTop:2}}>+{openTasks.length-3} more</div>}
                </div>
              )
            }
          };

          return (
            <div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
                <span style={{fontSize:11,color:"#64748B"}}>Drag blocks to customize your layout</span>
                <button onClick={()=>setBlocks(DEFAULT_BLOCKS)} style={{fontSize:9,padding:"2px 7px",borderRadius:99,border:"1px solid #E2E8F0",background:"#F8FAFC",color:"#64748B",cursor:"pointer"}}>Reset</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {blocks.map((id)=>{
                  const b = BLOCK_MAP[id];
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={()=>handleBlockDragStart(id)}
                      onDragOver={e=>{e.preventDefault();}}
                      onDrop={()=>handleBlockDrop(id)}
                      style={{
                        background:"#fff",
                        border:`1px solid ${draggingBlock===id?"#0F172A":"#E2E8F0"}`,
                        borderRadius:10,
                        padding:"10px 12px",
                        cursor:"grab",
                        opacity:draggingBlock===id?0.5:1,
                        transition:"all .2s",
                        boxShadow:draggingBlock===id?"0 4px 12px rgba(0,0,0,0.12)":"none",
                      }}
                    >
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8}}>
                        <IE emoji={b.emoji} Icon={b.icon} size={13} />
                        <span style={{fontSize:11,fontWeight:700,color:"#0F172A"}}>{b.title}</span>
                        <span style={{marginLeft:"auto",fontSize:14,color:"#CBD5E1",cursor:"grab"}}>⋮⋮</span>
                      </div>
                      {b.content}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ACTIVITY TIMELINE */}
        {tab==="activity" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:"#64748B"}}>All interactions · most recent first</div>
              <div style={{display:"flex",gap:3}}>
                {["All","Email","Call","Meeting","Quote"].map(f=>(
                  <button key={f} style={{fontSize:9,padding:"2px 8px",borderRadius:99,border:"1px solid #E2E8F0",background:f==="All"?"#0F172A":"#F8FAFC",color:f==="All"?"#fff":"#64748B",cursor:"pointer"}}>{f}</button>
                ))}
              </div>
            </div>
            {cActs.map((a:any,i:number)=>{
              const ai = ACTIVITY_ICONS[a.type] || {icon:Bookmark,color:"#64748B"};
              return (
                <div key={a.id} style={{display:"flex",gap:0,marginBottom:0}}>
                  {/* Timeline line */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginRight:12,width:20}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:ai.color,flexShrink:0,marginTop:14,zIndex:1}} />
                    {i<cActs.length-1 && <div style={{width:1,flex:1,background:"#E2E8F0"}} />}
                  </div>
                  {/* Content */}
                  <div style={{flex:1,paddingBottom:14}}>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                      <IE emoji={ai.emoji} Icon={ai.icon} size={12} color={ai.color} />
                      <span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:ai.color+"15",color:ai.color,fontWeight:600,textTransform:"capitalize"}}>{a.type}</span>
                      <span style={{fontSize:12,fontWeight:600,color:"#0F172A"}}>{a.title}</span>
                      <span style={{fontSize:10,color:"#94A3B8",marginLeft:"auto"}}>{a.date} · {a.time}</span>
                    </div>
                    <div style={{fontSize:11,color:"#64748B",lineHeight:1.6,marginLeft:18}}>{a.body}</div>
                    {a.status && <div style={{marginLeft:18,marginTop:3}}><span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:a.status==="accepted"||a.status==="opened"?"#F0FDF4":"#EFF6FF",color:a.status==="accepted"||a.status==="opened"?"#15803D":"#1D4ED8",fontWeight:600}}>{a.status}</span></div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EMAIL */}
        {tab==="email" && (
          <div>
            <div style={{padding:"10px 14px",background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,marginBottom:12,display:"flex",gap:8,alignItems:"center"}}>
              <IE emoji="✉️" Icon={Mail} size={13} color="#1D4ED8" />
              <div style={{flex:1,fontSize:12,color:"#1D4ED8"}}>Email sync active — showing all threads with {c.email}</div>
              <button style={{fontSize:10,padding:"4px 10px",background:"#1D4ED8",color:"#fff",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>Compose</button>
            </div>
            {cActs.filter((a:any)=>a.type==="email").map((a:any)=>(
              <div key={a.id} style={{padding:"10px 12px",border:"1px solid #E2E8F0",borderRadius:7,marginBottom:6,borderLeft:"3px solid #3B9EFF"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#0F172A"}}>{a.title}</span>
                  <span style={{fontSize:10,color:"#94A3B8"}}>{a.date} · {a.time}</span>
                </div>
                <div style={{fontSize:11,color:"#64748B",lineHeight:1.6}}>{a.body}</div>
                {a.from && <div style={{fontSize:10,color:"#94A3B8",marginTop:3}}>From: {a.from}</div>}
              </div>
            ))}
          </div>
        )}

        {/* TASKS */}
        {tab==="tasks" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:"#64748B"}}>Open tasks for this contact</div>
              <button style={{fontSize:10,padding:"4px 10px",background:"#0F172A",color:"#fff",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>+ Add Task</button>
            </div>
            {cTasks.map((t:any)=>{
              const done = taskDone[t.id]||t.done||false;
              return (
                <div key={t.id} onClick={()=>setTaskDone(p=>({...p,[t.id]:!p[t.id]}))} style={{display:"flex",gap:9,alignItems:"center",padding:"9px 12px",border:"1px solid #E2E8F0",borderRadius:7,marginBottom:5,cursor:"pointer",opacity:done?0.5:1}}>
                  <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${done?"#10B981":"#CBD5E1"}`,background:done?"#10B981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff"}}>{done ? <IE emoji="✓" Icon={Check} size={9} /> : null}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:done?400:600,color:"#0F172A",textDecoration:done?"line-through":"none"}}>{t.title}</div>
                  </div>
                  <span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:t.priority==="high"?"#FEF2F2":t.priority==="medium"?"#FFFBEB":"#F1F5F9",color:t.priority==="high"?"#B91C1C":t.priority==="medium"?"#B45309":"#64748B",fontWeight:600}}>{t.priority}</span>
                  <span style={{fontSize:10,color:"#94A3B8"}}>{t.due}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* NOTES */}
        {tab==="notes" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:"#64748B"}}>Internal notes about {c.name}</div>
              <button style={{fontSize:10,padding:"4px 10px",background:"#0F172A",color:"#fff",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>+ Add Note</button>
            </div>
            {cNotes.map((n:any)=>(
              <div key={n.id} style={{padding:"10px 12px",background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:7,marginBottom:6}}>
                <div style={{fontSize:12,color:"#334155",lineHeight:1.6,marginBottom:4}}>{n.text}</div>
                <div style={{fontSize:10,color:"#94A3B8"}}>{n.date} · {n.by}</div>
              </div>
            ))}
          </div>
        )}

        {/* CALENDAR */}
        {tab==="calendar" && (
          <div>
            <div style={{padding:"10px 14px",background:"#F5F3FF",border:"1px solid #DDD6FE",borderRadius:8,marginBottom:12,display:"flex",gap:8,alignItems:"center"}}>
              <IE emoji="📅" Icon={Calendar} size={13} color="#7C3AED" />
              <div style={{flex:1,fontSize:12,color:"#7C3AED"}}>Calendar sync shows meetings with {c.name}</div>
              <button style={{fontSize:10,padding:"4px 10px",background:"#7C3AED",color:"#fff",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>Schedule</button>
            </div>
            {cCal.map((m:any,i:number)=>(
              <div key={i} style={{padding:"10px 12px",border:"1px solid #E2E8F0",borderRadius:7,marginBottom:6,borderLeft:`3px solid ${m.type==="Upcoming"?"#A78BFA":"#CBD5E1"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#0F172A"}}>{m.title}</span>
                  <span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:m.type==="Upcoming"?"#F5F3FF":"#F1F5F9",color:m.type==="Upcoming"?"#7C3AED":"#64748B",fontWeight:600}}>{m.type}</span>
                </div>
                <div style={{fontSize:11,color:"#64748B"}}>{m.date} · {m.time}</div>
              </div>
            ))}
          </div>
        )}

        {/* QUOTES */}
        {tab==="quotes" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:"#64748B"}}>{cQuotes.length} quotes sent to {c.name}</div>
              <button style={{fontSize:10,padding:"4px 10px",background:P,color:"#fff",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>+ New Quote</button>
            </div>
            {cQuotes.map((q:any)=>(
              <div key={q.id} style={{padding:"10px 12px",border:"1px solid #E2E8F0",borderRadius:7,marginBottom:6,borderLeft:`3px solid ${q.status==="accepted"?"#10B981":"#3B9EFF"}`,display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                    <span style={{fontSize:10,fontFamily:"monospace",color:"#94A3B8"}}>{q.number}</span>
                    <span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:q.status==="accepted"?"#F0FDF4":"#EFF6FF",color:q.status==="accepted"?"#15803D":"#1D4ED8",fontWeight:600}}>{q.status}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:600,color:"#0F172A"}}>{q.title}</div>
                  <div style={{fontSize:10,color:"#94A3B8"}}>{q.date}</div>
                </div>
                <div style={{fontSize:16,fontWeight:700,color:P}}>{fv(q.total)}</div>
              </div>
            ))}
            {cQuotes.length>0 && <div style={{fontSize:10,color:"#94A3B8",marginTop:6}}>Win rate: {Math.round(cQuotes.filter((q:any)=>q.status==="accepted").length/cQuotes.length*100)}% · Avg quote: {fv(cQuotes.reduce((a:number,q:any)=>a+q.total,0)/cQuotes.length)}</div>}
          </div>
        )}

        {/* DEALS */}
        {tab==="deals" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:"#64748B"}}>{cDeals.length} deals with {c.name}</div>
              <button style={{fontSize:10,padding:"4px 10px",background:"#0F172A",color:"#fff",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>+ New Deal</button>
            </div>
            {SAMPLE_DEALS.map(d=>{
              const isWon = d.stage==="Closed Won";
              return (
                <div key={d.id} style={{padding:"10px 12px",border:`1px solid ${isWon?"#86EFAC":"#E2E8F0"}`,borderRadius:7,marginBottom:6,borderLeft:`3px solid ${isWon?"#10B981":d.probability>=50?"#F59E0B":"#3B9EFF"}`,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                      <span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:isWon?"#F0FDF4":"#FFFBEB",color:isWon?"#15803D":"#B45309",fontWeight:600}}>{d.stage}</span>
                      <span style={{fontSize:10,color:"#94A3B8"}}>{d.probability}% probability</span>
                    </div>
                    <div style={{fontSize:12,fontWeight:600,color:"#0F172A"}}>{d.name}</div>
                    <div style={{fontSize:10,color:"#94A3B8"}}>Close: {d.closeDate}</div>
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:isWon?"#15803D":P}}>{fv(d.value)}</div>
                </div>
              );
            })}
            <div style={{padding:"10px 12px",background:"#F8FAFC",borderRadius:7,marginTop:8,display:"flex",gap:20}}>
              <div><div style={{fontSize:10,color:"#94A3B8"}}>Total Pipeline</div><div style={{fontSize:14,fontWeight:700,color:P}}>{fv(SAMPLE_DEALS.reduce((a,d)=>a+d.value,0))}</div></div>
              <div><div style={{fontSize:10,color:"#94A3B8"}}>Weighted</div><div style={{fontSize:14,fontWeight:700,color:"#0F172A"}}>{fv(SAMPLE_DEALS.reduce((a,d)=>a+d.value*(d.probability/100),0))}</div></div>
              <div><div style={{fontSize:10,color:"#94A3B8"}}>Won</div><div style={{fontSize:14,fontWeight:700,color:"#15803D"}}>{fv(SAMPLE_DEALS.filter(d=>d.stage==="Closed Won").reduce((a,d)=>a+d.value,0))}</div></div>
            </div>
          </div>
        )}

        {/* CUSTOMER STATS */}
        {tab==="stats" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {[
                ["Lifetime Value",fv(c.lifetimeValue),"#10B981"],
                ["Avg Deal Size",fv(c.avgDealSize),P],
                ["Buy Probability",c.buyProbability+"%",c.buyProbability>=70?"#15803D":"#F59E0B"],
              ].map(([l,v,color])=>(
                <div key={l as string} style={{padding:"12px",background:"#F8FAFC",borderRadius:8,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:700,color:color as string}}>{v}</div>
                  <div style={{fontSize:10,color:"#64748B"}}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Engagement</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:14}}>
              {[
                ["Emails Sent",c.emailsSent],["Emails Opened",c.emailsOpened],
                ["Meetings",c.meetingsHeld],["Page Visits",c.pageVisits],
              ].map(([l,v])=>(
                <div key={l as string} style={{padding:"8px",background:"#fff",border:"1px solid #E2E8F0",borderRadius:6,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:700,color:"#0F172A"}}>{v}</div>
                  <div style={{fontSize:9,color:"#94A3B8"}}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Behavior Insights</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {[
                ["Last Contact",c.lastContact],["First Contact",c.firstContact],
                ["Last Purchase",c.lastPurchase],["Preferred Channel",c.preferredChannel],
                ["Response Time",c.responseTime],["Last Page Visited",c.lastPageVisited],
                ["Source",c.referralSource],["Quotes Sent / Accepted",`${c.quotesSent} / ${c.quotesAccepted} (${Math.round(c.quotesAccepted/c.quotesSent*100)}% win rate)`],
              ].map(([l,v])=>(
                <div key={l as string} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",background:"#F8FAFC",borderRadius:5}}>
                  <span style={{fontSize:11,color:"#64748B"}}>{l}</span>
                  <span style={{fontSize:11,fontWeight:600,color:"#0F172A"}}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{marginTop:12,padding:"10px 14px",background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8}}>
              <div style={{fontSize:10,fontWeight:700,color:"#B45309",marginBottom:3,display:"flex",alignItems:"center",gap:4}}><IE emoji="🧠" Icon={Brain} size={10} /> AI Prediction</div>
              <div style={{fontSize:12,color:"#92400E",lineHeight:1.6}}>Sarah is {c.buyProbability}% likely to close the Coral Gables staging deal within 14 days. Engagement signals are strong: last email opened in under 90 minutes, 8 meetings held, 67% quote win rate. The annual photography retainer (Q-2026-009) has been viewed but not actioned — bundle it into the Tuesday follow-up. Priority: reach her before she routes the Broward listings to another vendor.</div>
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {tab==="docs" && (
          <div>
            <div style={{fontSize:11,color:"#64748B",marginBottom:10}}>All documents linked to {c.name}</div>
            {[
              {type:"Invoice",num:"INV-2026-201",title:"Staging Services — Hialeah",total:8180,status:"paid",color:"#15803D"},
              {type:"Quote",num:"Q-2026-009",title:"Annual Photography Retainer — Apex",total:9600,status:"viewed",color:"#F59E0B"},
              {type:"Quote",num:"Q-2026-004",title:"Home Staging — Coral Gables",total:12400,status:"sent",color:"#3B9EFF"},
              {type:"Quote",num:"Q-2026-001",title:"Property Staging — Hialeah",total:8180,status:"accepted",color:"#10B981"},
              {type:"Receipt",num:"REC-2026-050",title:"Deposit — Hialeah Staging",total:4090,status:"generated",color:"#64748B"},
              {type:"Quote",num:"Q-2026-005",title:"Photography Package — Brickell",total:2600,status:"accepted",color:"#10B981"},
            ].map((d,i)=>(
              <div key={i} style={{padding:"9px 12px",border:"1px solid #E2E8F0",borderRadius:7,marginBottom:5,borderLeft:`3px solid ${d.color}`,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:d.color+"15",color:d.color,fontWeight:600}}>{d.type}</span>
                <span style={{fontSize:10,fontFamily:"monospace",color:"#94A3B8"}}>{d.num}</span>
                <span style={{flex:1,fontSize:12,fontWeight:600,color:"#0F172A"}}>{d.title}</span>
                <span style={{fontSize:13,fontWeight:700,color:d.color}}>{fv(d.total)}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
