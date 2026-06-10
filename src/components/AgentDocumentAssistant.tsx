"use client";
import { useState, useRef, useEffect } from "react";
import { ClipboardList, BarChart2, FileText, PenLine, Send, X, Check } from "lucide-react";
import { IE, useIconMode } from "@/lib/icon-mode";
import { VERTICAL_CONFIG } from "@/lib/data";
import { useToast, ToastContainer } from "@/components/ui/toast";

type IconMap = Record<string, React.ComponentType<any>>;
const DOC_LABELS_ICON_MAP: IconMap = { ClipboardList, BarChart2, FileText };
const DOC_LABELS_EMOJI_MAP: Record<string, string> = { ClipboardList: "📋", BarChart2: "📊", FileText: "📝" };
function LkIcon({ m, n, size, color }: { m: IconMap; n: string; size: number; color?: string }) {
  const { emojiMode } = useIconMode();
  if (emojiMode && DOC_LABELS_EMOJI_MAP[n]) return <span style={{ fontSize: size, lineHeight: 1, display: "inline-flex", alignItems: "center" }}>{DOC_LABELS_EMOJI_MAP[n]}</span>;
  const Ic = m[n];
  return Ic ? <Ic size={size} color={color} /> : null;
}

interface Msg { role:"user"|"assistant"; content:string; }
interface LineItem { id:string; desc:string; qty:number; unit:string; price:number; }
interface Doc {
  title:string; contact:string; company:string; email:string;
  intro:string; scope:string; terms:string; lines:LineItem[]; tax:number;
}

type DocType = "quote"|"estimate"|"invoice";

const DOC_LABELS: Record<DocType,{label:string;icon:string;agentName:string;greeting:string}> = {
  quote:    { label:"Quote",    icon:"ClipboardList", agentName:"Quoting Agent",    greeting:"Let me help you build a quote that closes. What's the project?" },
  estimate: { label:"Estimate", icon:"BarChart2",     agentName:"Estimating Agent", greeting:"I'll help you estimate this job accurately. What kind of work are we estimating?" },
  invoice:  { label:"Invoice",  icon:"FileText",      agentName:"Invoice Agent",    greeting:"Your quote was accepted — let me pre-fill the invoice. Who is this for and what's the total?" },
};

function fv(n:number){ return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }

export default function AgentDocumentAssistant({ vertId, onClose }:{ vertId:string; onClose:()=>void }) {
  const vert = VERTICAL_CONFIG[vertId] || VERTICAL_CONFIG.real_estate;
  const P = vert.color;

  const [docType, setDocType] = useState<DocType>("quote");
  const [phase, setPhase]     = useState<"pick"|"build"|"preview">("pick");
  const [msgs, setMsgs]       = useState<Msg[]>([]);
  const [doc, setDoc]         = useState<Doc>({ title:"", contact:"", company:"", email:"", intro:"", scope:"", terms:"Net 30. 50% deposit to begin. Balance due on completion.", lines:[{id:"l1",desc:"",qty:1,unit:"job",price:0}], tax:0 });
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast, toasts, dismiss } = useToast();
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);
  useEffect(()=>{ if(phase==="build") inputRef.current?.focus(); },[phase]);

  const startSession = async(dt:DocType) => {
    setDocType(dt); setPhase("build"); setMsgs([]);
    const greeting = DOC_LABELS[dt].greeting;
    setMsgs([{role:"assistant", content:greeting}]);
  };

  const getScriptedReply = (text: string, dt: DocType): { message: string; quoteUpdate?: Partial<Doc> } => {
    const lower = text.toLowerCase();
    if (dt === "estimate" || dt === "quote") {
      if (lower.includes("roof") || lower.includes("shingle") || lower.includes("gutter")) {
        return {
          message: "Perfect — I've pre-filled a roofing estimate with standard line items. Adjust quantities for actual job size, then hit Preview to review before sending.",
          quoteUpdate: {
            title: "Roof Replacement Estimate",
            contact: "James Thompson",
            company: "Thompson Properties",
            intro: "We're pleased to provide this detailed estimate for your roofing project. All materials carry manufacturer warranties and labor is backed by our 5-year workmanship guarantee.",
            scope: "Full tear-off & disposal · Install 30-year architectural shingles · Replace all flashing · Ridge cap & sealing · Final inspection and clean-up",
            terms: "50% deposit required to mobilize. Balance due upon completion. Valid for 30 days.",
            lines: [
              {id:"l1",desc:"Tear-off & disposal",qty:1,unit:"job",price:2400},
              {id:"l2",desc:"Architectural shingles — 30yr",qty:28,unit:"sq",price:255},
              {id:"l3",desc:"Synthetic underlayment",qty:6,unit:"rolls",price:145},
              {id:"l4",desc:"Flashing replacement",qty:1,unit:"job",price:780},
              {id:"l5",desc:"Ridge cap & sealing",qty:1,unit:"job",price:420},
            ],
            tax: 7
          }
        };
      }
      if (lower.includes("kitchen") || lower.includes("remodel") || lower.includes("renovate")) {
        return {
          message: "Kitchen remodel — loaded line items from demo to finish. Adjust sqft and unit counts to match the actual job scope.",
          quoteUpdate: {
            title: "Kitchen Remodel Estimate",
            contact: "Maria Garcia",
            intro: "Full kitchen remodel including demo, cabinets, countertops, plumbing, and electrical. Price reflects mid-grade materials.",
            scope: "Demo existing kitchen · Shaker cabinets · Quartz countertops · Plumbing rough-in · Electrical — 4 circuits · Tile backsplash · Finish labor",
            terms: "50% deposit. 25% at rough-in. 25% at completion.",
            lines: [
              {id:"l1",desc:"Demo — existing kitchen",qty:1,unit:"job",price:1800},
              {id:"l2",desc:"Cabinets — shaker style",qty:12,unit:"units",price:420},
              {id:"l3",desc:"Countertops — quartz",qty:42,unit:"sqft",price:85},
              {id:"l4",desc:"Plumbing rough-in",qty:1,unit:"job",price:2200},
              {id:"l5",desc:"Electrical — 4 circuits",qty:4,unit:"circuits",price:380},
              {id:"l6",desc:"Labor — finish work",qty:40,unit:"hrs",price:75},
            ],
            tax: 7
          }
        };
      }
      if (lower.includes("hvac") || lower.includes("dental") || lower.includes("medical") || lower.includes("service")) {
        return {
          message: "Commercial service estimate ready. Adjust unit counts based on your facility size and scope.",
          quoteUpdate: {
            title: "HVAC Service & Maintenance Estimate",
            contact: "Lisa Greenfield",
            company: "Greenfield Dental Group",
            intro: "Comprehensive HVAC service estimate covering diagnostics, parts, and labor for your commercial facility.",
            scope: "Full system diagnostics · Filter replacement · Coil cleaning · Refrigerant top-off · Labor",
            terms: "Net 30. 90-day parts & labor warranty.",
            lines: [
              {id:"l1",desc:"System diagnostic — commercial",qty:1,unit:"visit",price:175},
              {id:"l2",desc:"Filter replacement (all units)",qty:6,unit:"units",price:48},
              {id:"l3",desc:"Coil cleaning",qty:2,unit:"units",price:280},
              {id:"l4",desc:"Labor — 4 hours",qty:4,unit:"hrs",price:95},
            ],
            tax: 7
          }
        };
      }
      if (lower.includes("it") || lower.includes("software") || lower.includes("tech") || lower.includes("web")) {
        return {
          message: "IT project estimate loaded. Discovery, development, and QA are pre-filled — update hours to match your SOW.",
          quoteUpdate: {
            title: "Software Development Estimate",
            contact: "David Park",
            intro: "End-to-end development estimate including discovery, build, testing, and launch support.",
            scope: "Discovery & requirements · UI/UX design · Frontend development · Backend API · QA & testing · Launch support",
            terms: "50% upfront. Remaining billed at milestones. Net 15.",
            lines: [
              {id:"l1",desc:"Discovery & requirements",qty:8,unit:"hrs",price:150},
              {id:"l2",desc:"UI/UX design",qty:16,unit:"hrs",price:125},
              {id:"l3",desc:"Frontend development",qty:40,unit:"hrs",price:140},
              {id:"l4",desc:"Backend API",qty:32,unit:"hrs",price:155},
              {id:"l5",desc:"QA & testing",qty:12,unit:"hrs",price:110},
            ],
            tax: 0
          }
        };
      }
      return {
        message: "Got it — I've set up a project template. Describe the scope in more detail and I'll refine the line items, or edit them directly on the left.",
        quoteUpdate: {
          title: text.length > 45 ? text.substring(0, 45) + "…" : text,
          intro: "We're pleased to provide this estimate for your project. All pricing reflects current market rates.",
          scope: "Describe scope here · Add specific line items as needed",
          terms: "50% deposit required. Balance due on completion. Valid 30 days.",
          lines: [
            {id:"l1",desc:"Labor",qty:1,unit:"job",price:0},
            {id:"l2",desc:"Materials",qty:1,unit:"lot",price:0},
          ],
          tax: 0
        }
      };
    }
    if (dt === "invoice") {
      return {
        message: "Invoice pre-filled. Confirm the client name and amounts, then send directly from the preview.",
        quoteUpdate: {
          title: "Invoice — " + new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),
          contact: text.length > 3 ? text : "Client Name",
          intro: "Thank you for your business. Please find your invoice details below.",
          terms: "Net 30. Late fee 1.5%/month after due date.",
          lines: [
            {id:"l1",desc:"Professional services",qty:1,unit:"job",price:2500},
          ],
          tax: 7
        }
      };
    }
    return { message: "Got it. Tell me more about the project scope and I'll build out the line items." };
  };

  const send = async(text:string) => {
    if(!text.trim()||loading) return;
    const userMsg: Msg = {role:"user", content:text};
    setMsgs(p=>[...p,userMsg]); setInput(""); setLoading(true);
    const reply = getScriptedReply(text, docType);
    setTimeout(() => {
      setMsgs(p=>[...p,{role:"assistant",content:reply.message}]);
      if(reply.quoteUpdate){
        setDoc(d=>({...d,...reply.quoteUpdate,
          lines: (reply.quoteUpdate as any).lines?.length
            ? (reply.quoteUpdate as any).lines.map((l:any)=>({id:l.id||"l"+Date.now(),desc:l.desc,qty:l.qty||1,unit:l.unit||"job",price:l.price||0}))
            : d.lines
        }));
      }
      setLoading(false);
    }, 900 + Math.random() * 600);
  };

  const sub   = doc.lines.reduce((a,l)=>a+l.qty*l.price,0);
  const total = sub + sub*(doc.tax/100);
  const dl    = DOC_LABELS[docType];

  // PHASE: pick
  if(phase==="pick") return (
    <div style={{background:"#fff",borderRadius:14,overflow:"hidden",maxWidth:520,margin:"0 auto",boxShadow:"0 8px 40px rgba(0,0,0,0.12)"}}>
      <div style={{background:P,padding:"18px 22px"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:4}}>Agent-Guided</div>
        <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>Build a Document</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:3}}>Tell the agent what you need. It builds the document for you.</div>
      </div>
      <div style={{padding:"18px 22px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {(["quote","estimate","invoice"] as DocType[]).map(dt=>(
            <button key={dt} onClick={()=>startSession(dt)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"#F8FAFC",border:`1px solid ${P}22`,borderRadius:10,cursor:"pointer",textAlign:"left",borderLeft:`3px solid ${P}`}}>
              <LkIcon m={DOC_LABELS_ICON_MAP} n={DOC_LABELS[dt].icon} size={22} color={P} />
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#0F172A"}}>{DOC_LABELS[dt].label}</div>
                <div style={{fontSize:11,color:"#64748B",marginTop:1}}>{DOC_LABELS[dt].agentName} will walk you through it</div>
              </div>
              <span style={{marginLeft:"auto",color:P,fontSize:16}}>→</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{width:"100%",marginTop:12,padding:"8px",background:"none",border:"1px solid #E2E8F0",borderRadius:7,fontSize:12,color:"#64748B",cursor:"pointer"}}>
          Cancel
        </button>
      </div>
    </div>
  );

  // PHASE: preview
  if(phase==="preview") return (
    <div style={{background:"#fff",borderRadius:14,overflow:"hidden",maxWidth:560,margin:"0 auto",boxShadow:"0 8px 40px rgba(0,0,0,0.12)"}}>
      <div style={{background:P,padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:3}}>{dl.label} Preview</div>
          <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>{doc.title||"Untitled"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:22,fontWeight:700,color:"#fff"}}>{fv(total)}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.7)"}}>Total</div>
        </div>
      </div>
      <div style={{padding:"16px 22px",maxHeight:480,overflowY:"auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14,paddingBottom:12,borderBottom:"1px solid #F1F5F9"}}>
          <div><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>Client</div><div style={{fontSize:13,fontWeight:600,color:"#0F172A"}}>{doc.contact||"—"}</div><div style={{fontSize:11,color:"#64748B"}}>{doc.company}</div></div>
        </div>
        {doc.intro && <div style={{fontSize:13,color:"#334155",lineHeight:1.7,padding:"10px 14px",background:P+"08",borderRadius:7,borderLeft:`2px solid ${P}`,marginBottom:14}}>{doc.intro}</div>}
        {doc.scope && (
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:"#0F172A",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:7}}>Scope of Work</div>
            {doc.scope.split("·").map((s,i)=>(
              <div key={i} style={{display:"flex",gap:7,fontSize:13,color:"#334155",marginBottom:4,alignItems:"flex-start"}}>
                <IE emoji="✓" Icon={Check} size={13} color={P} /><span>{s.trim()}</span>
              </div>
            ))}
          </div>
        )}
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12}}>
          <thead><tr style={{background:"#F8FAFC"}}>{["Description","Qty","Unit","Amount"].map(h=><th key={h} style={{padding:"6px 8px",fontSize:9,color:"#64748B",fontWeight:700,textAlign:h==="Amount"?"right":"left",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
          <tbody>{doc.lines.filter(l=>l.desc||l.price>0).map((l,i)=>(
            <tr key={l.id} style={{borderBottom:"1px solid #F8FAFC"}}>
              <td style={{padding:"7px 8px",fontSize:12,color:"#0F172A"}}>{l.desc}</td>
              <td style={{padding:"7px 8px",fontSize:11,color:"#64748B",textAlign:"center"}}>{l.qty}</td>
              <td style={{padding:"7px 8px",fontSize:11,color:"#64748B",textAlign:"center"}}>{l.unit}</td>
              <td style={{padding:"7px 8px",fontSize:12,fontWeight:500,color:"#0F172A",textAlign:"right"}}>{fv(l.qty*l.price)}</td>
            </tr>
          ))}</tbody>
        </table>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,marginBottom:14}}>
          <div style={{display:"flex",gap:24,fontSize:11,color:"#64748B"}}><span>Subtotal</span><span>{fv(sub)}</span></div>
          {doc.tax>0&&<div style={{display:"flex",gap:24,fontSize:11,color:"#64748B"}}><span>Tax ({doc.tax}%)</span><span>{fv(sub*doc.tax/100)}</span></div>}
          <div style={{display:"flex",gap:24,fontSize:15,fontWeight:700,color:P,paddingTop:4,borderTop:"1px solid #E2E8F0",marginTop:2}}><span>Total</span><span>{fv(total)}</span></div>
        </div>
        {docType==="quote" && (
          <div style={{textAlign:"center",padding:"14px",background:P+"10",borderRadius:8,border:`1px solid ${P}33`}}>
            <button onClick={()=>toast("Signature captured — invoice will auto-generate","success")} style={{padding:"10px 28px",background:P,color:"#fff",border:"none",borderRadius:7,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,margin:"0 auto"}}>
              <IE emoji="✏️" Icon={PenLine} size={14} />Accept & Sign
            </button>
            <div style={{fontSize:10,color:"#94A3B8",marginTop:5}}>Secure · Timestamped · Invoice auto-generated on sign</div>
          </div>
        )}
      </div>
      <div style={{padding:"12px 22px",borderTop:"1px solid #F1F5F9",display:"flex",gap:7}}>
        <button onClick={()=>setPhase("build")} style={{flex:1,padding:"8px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:7,fontSize:12,cursor:"pointer"}}>← Edit with Agent</button>
        <button onClick={()=>{toast(`Sent to ${doc.contact || "client"}`); setTimeout(onClose,1200);}} style={{flex:1,padding:"8px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><IE emoji="📤" Icon={Send} size={13} />Send</button>
      </div>
    </div>
  );

  // PHASE: build
  return (
    <div style={{background:"#fff",borderRadius:14,overflow:"hidden",maxWidth:720,margin:"0 auto",boxShadow:"0 8px 40px rgba(0,0,0,0.12)",display:"flex",height:560}}>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* AGENT PANEL */}
      <div style={{width:320,display:"flex",flexDirection:"column",borderRight:"1px solid #F1F5F9",flexShrink:0}}>
        {/* Agent header */}
        <div style={{padding:"13px 14px",background:P+"10",borderBottom:"1px solid "+P+"22",display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:P+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><LkIcon m={DOC_LABELS_ICON_MAP} n={dl.icon} size={16} color={P} /></div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{dl.agentName}</div>
            <div style={{fontSize:10,color:P,display:"flex",alignItems:"center",gap:4}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:P,display:"inline-block"}} />
              <span>{vert.label} · Claude API</span>
            </div>
          </div>
        </div>
        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",gap:6,justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-end"}}>
              {m.role==="assistant"&&<div style={{width:24,height:24,borderRadius:"50%",background:P+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><LkIcon m={DOC_LABELS_ICON_MAP} n={dl.icon} size={11} color={P} /></div>}
              <div style={{maxWidth:"80%",padding:"8px 10px",borderRadius:m.role==="user"?"8px 8px 2px 8px":"8px 8px 8px 2px",background:m.role==="user"?P:"#F8FAFC",color:m.role==="user"?"#fff":"#0F172A",fontSize:12,lineHeight:1.6}}>
                {m.content}
              </div>
            </div>
          ))}
          {loading&&(
            <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:P+"22",display:"flex",alignItems:"center",justifyContent:"center"}}><LkIcon m={DOC_LABELS_ICON_MAP} n={dl.icon} size={11} color={P} /></div>
              <div style={{padding:"8px 12px",background:"#F8FAFC",borderRadius:"8px 8px 8px 2px",display:"flex",gap:3}}>
                {[0,1,2].map(j=><div key={j} style={{width:5,height:5,borderRadius:"50%",background:P,animation:`pulse 1.2s ${j*0.2}s ease-in-out infinite`}} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {/* Input */}
        <div style={{padding:"8px 10px",borderTop:"1px solid #F1F5F9",display:"flex",gap:6}}>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&send(input)} disabled={loading}
            placeholder="Reply to agent…"
            style={{flex:1,padding:"7px 9px",border:"1px solid #E2E8F0",borderRadius:6,fontSize:12,color:"#0F172A",background:"#F8FAFC"}} />
          <button onClick={()=>send(input)} disabled={loading||!input.trim()} style={{padding:"7px 12px",background:input.trim()&&!loading?P:"#E2E8F0",color:input.trim()&&!loading?"#fff":"#94A3B8",border:"none",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {loading?"…":"Send"}
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW (LIVE) */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:11,color:"#64748B"}}>
            {doc.title||<span style={{color:"#CBD5E1"}}>Document builds as you answer…</span>}
          </div>
          <div style={{display:"flex",gap:5}}>
            <button onClick={()=>setPhase("preview")} disabled={!doc.title} style={{fontSize:10,padding:"4px 10px",background:doc.title?P+"15":"#F1F5F9",color:doc.title?P:"#94A3B8",border:`1px solid ${doc.title?P+"44":"#E2E8F0"}`,borderRadius:5,cursor:"pointer",fontWeight:600}}>
              Preview →
            </button>
            <button onClick={onClose} style={{fontSize:10,padding:"4px 8px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:5,cursor:"pointer",color:"#64748B",display:"flex",alignItems:"center"}}><IE emoji="✕" Icon={X} size={12} /></button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
          {!doc.title && (
            <div style={{textAlign:"center",padding:"40px 20px",color:"#CBD5E1"}}>
              <div style={{marginBottom:8}}><LkIcon m={DOC_LABELS_ICON_MAP} n={dl.icon} size={24} color="#CBD5E1" /></div>
              <div style={{fontSize:12}}>Answer the agent's questions.<br/>Your {dl.label.toLowerCase()} builds here.</div>
            </div>
          )}
          {doc.title && (
            <div>
              <div style={{background:P,borderRadius:8,padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between"}}>
                <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{doc.title}</div>
                <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{fv(total)}</div>
              </div>
              {doc.contact&&<div style={{fontSize:12,color:"#64748B",marginBottom:8}}>For: <strong style={{color:"#0F172A"}}>{doc.contact}</strong>{doc.company&&" · "+doc.company}</div>}
              {doc.intro&&<div style={{fontSize:12,color:"#334155",lineHeight:1.6,padding:"8px 10px",background:P+"08",borderRadius:6,borderLeft:`2px solid ${P}`,marginBottom:10}}>{doc.intro}</div>}
              {doc.scope&&(
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:5}}>Scope</div>
                  {doc.scope.split("·").filter(s=>s.trim()).map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:5,fontSize:11,color:"#334155",marginBottom:3}}>
                      <Check size={11} color={P} style={{flexShrink:0}} /><span>{s.trim()}</span>
                    </div>
                  ))}
                </div>
              )}
              {doc.lines.filter(l=>l.desc||l.price>0).length>0&&(
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:5}}>Pricing</div>
                  {doc.lines.filter(l=>l.desc||l.price>0).map(l=>(
                    <div key={l.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#334155",padding:"4px 0",borderBottom:"1px solid #F8FAFC"}}>
                      <span>{l.desc}</span>
                      <span style={{fontWeight:500,color:"#0F172A"}}>{fv(l.qty*l.price)}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:6,fontSize:14,fontWeight:700,color:P}}>{fv(total)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}
