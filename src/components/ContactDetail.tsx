"use client";
import { useState } from "react";

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
  email:"s.mitchell@apexrealty.com", phone:"(305) 555-0142",
  address:"2400 Brickell Ave", city:"Miami", state:"FL", zip:"33129",
  website:"apexrealtygroup.com", linkedin:"linkedin.com/in/sarahmitchell",
  source:"Google Ads", tags:["VIP","Referral Partner","Active"],
  score:87, stage:"Customer", status:"Active", vertical:"Real Estate",
  avatar:"", initials:"SM",
  lifetimeValue:48600, dealCount:4, quoteCount:6,
  avgDealSize:12150, lastContact:"Jun 2, 2026", firstContact:"Mar 14, 2024",
  lastPurchase:"May 28, 2026", nextLikelyAction:"Refer new listing client",
  buyProbability:72, preferredChannel:"Email", responseTime:"< 2 hours",
  emailsOpened:34, emailsSent:42, meetingsHeld:8,
  quotesAccepted:4, quotesSent:6, pageVisits:156,
  lastPageVisited:"Pricing page — May 30", referralSource:"Google Ads → Landing Page",
};

const SAMPLE_ACTIVITIES: Activity[] = [
  {id:"a1",type:"email",title:"Re: Hialeah listing staging proposal",body:"Sarah confirmed she wants to move forward with the staging package. Signed the quote same day. Invoice sent.",date:"Jun 2",time:"2:14 PM",from:"s.mitchell@apexrealty.com",to:"you"},
  {id:"a2",type:"quote",title:"Quote sent — Property Staging Q-2026-001",body:"$8,180 — staging, photography, landscaping for Hialeah listing. Accepted same day.",date:"May 30",time:"10:30 AM",status:"accepted"},
  {id:"a3",type:"meeting",title:"Listing strategy review — 45 min",body:"Reviewed 3 upcoming listings. Sarah wants staging proposals for all three. Discussed referral arrangement for property management clients.",date:"May 28",time:"11:00 AM"},
  {id:"a4",type:"call",title:"Inbound call — new listing inquiry",body:"Sarah called about staging a new listing at 1420 W 49th St. Wants a quote by Friday. Budget ~$8K. Timeline: 2 weeks.",date:"May 27",time:"3:45 PM"},
  {id:"a5",type:"score",title:"AI Score updated: 87",body:"Fit: 92 · Intent: 84 · Timing: 88 · Value: 85. Recommendation: Strong referral partner. Nurture with quarterly check-ins and first access to new services.",date:"May 25",time:"Auto"},
  {id:"a6",type:"note",title:"Internal note",body:"Sarah mentioned she's expanding to Broward County. Could be 3-5 new listings per quarter. Follow up in July about a volume pricing arrangement.",date:"May 20",time:"4:10 PM"},
  {id:"a7",type:"email",title:"Welcome to KOVA — Your CRM is ready",body:"Automated welcome email delivered. Opened within 2 hours.",date:"Mar 14",time:"9:00 AM",status:"opened"},
  {id:"a8",type:"sms",title:"Quote follow-up",body:"Hi Sarah, just checking — did you get a chance to review the staging proposal? Happy to adjust anything. - Michael",date:"May 31",time:"10:15 AM",status:"delivered"},
];

const SAMPLE_DEALS: Deal[] = [
  {id:"d1",name:"Hialeah Listing Staging",value:8180,stage:"Closed Won",probability:100,closeDate:"Jun 2, 2026"},
  {id:"d2",name:"Coral Gables Home Staging",value:12400,stage:"Proposal Sent",probability:65,closeDate:"Jun 20, 2026"},
  {id:"d3",name:"Volume Staging Agreement — Q3",value:24000,stage:"Discovery",probability:30,closeDate:"Jul 15, 2026"},
  {id:"d4",name:"Brickell Condo Photography",value:2600,stage:"Closed Won",probability:100,closeDate:"Apr 10, 2026"},
];

const SAMPLE_QUOTES: Quote[] = [
  {id:"q1",number:"Q-2026-001",title:"Property Staging — Hialeah",total:8180,status:"accepted",date:"May 30"},
  {id:"q2",number:"Q-2026-004",title:"Home Staging — Coral Gables",total:12400,status:"sent",date:"Jun 1"},
  {id:"q3",number:"Q-2026-005",title:"Photography Package — Brickell",total:2600,status:"accepted",date:"Apr 8"},
];

const SAMPLE_TASKS: Task[] = [
  {id:"t1",title:"Send Coral Gables staging proposal",due:"Jun 5",done:false,priority:"high"},
  {id:"t2",title:"Follow up on Q3 volume pricing discussion",due:"Jul 1",done:false,priority:"medium"},
  {id:"t3",title:"Schedule quarterly review meeting",due:"Jun 15",done:false,priority:"low"},
  {id:"t4",title:"Send welcome package to Sarah's new agents",due:"May 20",done:true,priority:"medium"},
];

const SAMPLE_NOTES = [
  {id:"n1",text:"Sarah is expanding to Broward County — could mean 3-5 new listings per quarter. Volume pricing discussion planned for July.",date:"May 20",by:"Michael"},
  {id:"n2",text:"Prefers email over phone for proposals. Responds within 2 hours during business hours. Best day to reach: Tuesday or Thursday AM.",date:"Apr 15",by:"Michael"},
  {id:"n3",text:"Referral partner — has sent 2 property management clients our way. Consider a referral discount or priority scheduling.",date:"Mar 28",by:"AI Agent"},
];

const ACTIVITY_ICONS:Record<string,{icon:string,color:string}> = {
  email:{icon:"✉️",color:"#3B9EFF"}, call:{icon:"📞",color:"#10B981"}, note:{icon:"📝",color:"#F59E0B"},
  task:{icon:"☑️",color:"#64748B"}, meeting:{icon:"📅",color:"#A78BFA"}, quote:{icon:"📋",color:"#00C896"},
  deal:{icon:"💰",color:"#EC4899"}, score:{icon:"🎯",color:"#EF4444"}, sms:{icon:"💬",color:"#6366F1"},
};

function fv(n:number){ return "$"+n.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0}); }

export default function ContactDetail({ contact, accentColor, onBack }:{ contact?:any; accentColor:string; onBack:()=>void }) {
  const [tab, setTab] = useState("activity");
  const [taskDone, setTaskDone] = useState<Record<string,boolean>>({t4:true});
  const c = contact || SAMPLE_CONTACT;
  const P = accentColor;

  const TABS = [
    {id:"activity", label:"Activity",  icon:"⚡", count:SAMPLE_ACTIVITIES.length},
    {id:"email",    label:"Email",     icon:"✉️", count:3},
    {id:"tasks",    label:"Tasks",     icon:"☑️", count:SAMPLE_TASKS.filter(t=>!taskDone[t.id]).length},
    {id:"notes",    label:"Notes",     icon:"📝", count:SAMPLE_NOTES.length},
    {id:"calendar", label:"Calendar",  icon:"📅", count:2},
    {id:"quotes",   label:"Quotes",    icon:"📋", count:SAMPLE_QUOTES.length},
    {id:"deals",    label:"Deals",     icon:"💰", count:SAMPLE_DEALS.length},
    {id:"stats",    label:"Stats",     icon:"📊"},
    {id:"docs",     label:"Documents", icon:"🗂️", count:4},
  ];

  const scoreColor = c.score>=80?"#15803D":c.score>=60?"#F59E0B":c.score>=40?"#3B9EFF":"#EF4444";

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} style={{background:"none",border:"none",fontSize:12,color:"#64748B",cursor:"pointer",marginBottom:8}}>← Back to Contacts</button>

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
              <span>📧 {c.email}</span>
              <span>📞 {c.phone}</span>
              <span>📍 {c.city}, {c.state}</span>
            </div>
            <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
              {c.tags.map((t:string)=><span key={t} style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:"#F1F5F9",color:"#64748B",fontWeight:500}}>{t}</span>)}
              <span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:"#EFF6FF",color:"#1D4ED8",fontWeight:500}}>Source: {c.source}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
            <button style={{padding:"6px 12px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>+ New Deal</button>
            <button style={{padding:"6px 12px",background:P+"15",color:P,border:`1px solid ${P}44`,borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>📋 Create Quote</button>
            <button style={{padding:"6px 12px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:6,fontSize:11,color:"#64748B",cursor:"pointer"}}>📧 Follow Up</button>
          </div>
        </div>

        {/* AI Next Best Action */}
        <div style={{padding:"10px 18px",background:"#FFFBEB",borderTop:"1px solid #FDE68A",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:13}}>🧠</span>
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
            <span style={{fontSize:12}}>{t.icon}</span>{t.label}
            {t.count!==undefined && <span style={{fontSize:9,background:tab===t.id?P+"15":"#F1F5F9",color:tab===t.id?P:"#94A3B8",padding:"1px 5px",borderRadius:99,fontWeight:700}}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"14px 16px",minHeight:300}}>

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
            {SAMPLE_ACTIVITIES.map((a,i)=>{
              const ai = ACTIVITY_ICONS[a.type] || {icon:"📌",color:"#64748B"};
              return (
                <div key={a.id} style={{display:"flex",gap:0,marginBottom:0}}>
                  {/* Timeline line */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginRight:12,width:20}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:ai.color,flexShrink:0,marginTop:14,zIndex:1}} />
                    {i<SAMPLE_ACTIVITIES.length-1 && <div style={{width:1,flex:1,background:"#E2E8F0"}} />}
                  </div>
                  {/* Content */}
                  <div style={{flex:1,paddingBottom:14}}>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                      <span style={{fontSize:12}}>{ai.icon}</span>
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
              <span style={{fontSize:13}}>✉️</span>
              <div style={{flex:1,fontSize:12,color:"#1D4ED8"}}>Email sync active — showing all threads with {c.email}</div>
              <button style={{fontSize:10,padding:"4px 10px",background:"#1D4ED8",color:"#fff",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>Compose</button>
            </div>
            {SAMPLE_ACTIVITIES.filter(a=>a.type==="email").map(a=>(
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
            {SAMPLE_TASKS.map(t=>{
              const done = taskDone[t.id]||false;
              return (
                <div key={t.id} onClick={()=>setTaskDone(p=>({...p,[t.id]:!p[t.id]}))} style={{display:"flex",gap:9,alignItems:"center",padding:"9px 12px",border:"1px solid #E2E8F0",borderRadius:7,marginBottom:5,cursor:"pointer",opacity:done?0.5:1}}>
                  <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${done?"#10B981":"#CBD5E1"}`,background:done?"#10B981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff",fontSize:9,fontWeight:700}}>{done?"✓":""}</div>
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
            {SAMPLE_NOTES.map(n=>(
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
              <span style={{fontSize:13}}>📅</span>
              <div style={{flex:1,fontSize:12,color:"#7C3AED"}}>Calendar sync shows meetings with {c.name}</div>
              <button style={{fontSize:10,padding:"4px 10px",background:"#7C3AED",color:"#fff",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>Schedule</button>
            </div>
            {[{title:"Quarterly Review — Sarah Mitchell",date:"Jun 15, 2026",time:"11:00 AM — 11:45 AM",type:"Upcoming"},{title:"Listing Strategy Review",date:"May 28, 2026",time:"11:00 AM — 11:45 AM",type:"Completed"}].map((m,i)=>(
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
              <div style={{fontSize:11,color:"#64748B"}}>{SAMPLE_QUOTES.length} quotes sent to {c.name}</div>
              <button style={{fontSize:10,padding:"4px 10px",background:P,color:"#fff",border:"none",borderRadius:5,cursor:"pointer",fontWeight:600}}>+ New Quote</button>
            </div>
            {SAMPLE_QUOTES.map(q=>(
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
            <div style={{fontSize:10,color:"#94A3B8",marginTop:6}}>Win rate: {Math.round(SAMPLE_QUOTES.filter(q=>q.status==="accepted").length/SAMPLE_QUOTES.length*100)}% · Avg quote: {fv(SAMPLE_QUOTES.reduce((a,q)=>a+q.total,0)/SAMPLE_QUOTES.length)}</div>
          </div>
        )}

        {/* DEALS */}
        {tab==="deals" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,color:"#64748B"}}>{SAMPLE_DEALS.length} deals with {c.name}</div>
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
              <div style={{fontSize:10,fontWeight:700,color:"#B45309",marginBottom:3}}>🧠 AI Prediction</div>
              <div style={{fontSize:12,color:"#92400E",lineHeight:1.6}}>Sarah is {c.buyProbability}% likely to close the Coral Gables staging deal within 14 days. Her engagement pattern (email opens within 2 hours, 8 meetings held, 67% quote acceptance rate) indicates strong intent. Recommended: send follow-up Tuesday AM with revised pricing for the Q3 volume arrangement.</div>
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {tab==="docs" && (
          <div>
            <div style={{fontSize:11,color:"#64748B",marginBottom:10}}>All documents linked to {c.name}</div>
            {[
              {type:"Quote",num:"Q-2026-001",title:"Property Staging — Hialeah",total:8180,status:"accepted",color:"#10B981"},
              {type:"Invoice",num:"INV-2026-201",title:"Staging Services — Hialeah",total:8180,status:"paid",color:"#15803D"},
              {type:"Quote",num:"Q-2026-004",title:"Home Staging — Coral Gables",total:12400,status:"sent",color:"#3B9EFF"},
              {type:"Receipt",num:"REC-2026-050",title:"Deposit — Hialeah Staging",total:4090,status:"generated",color:"#64748B"},
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
