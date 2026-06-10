"use client";
import { useState, useRef } from "react";
import { DOC_TEMPLATES, TEMPLATE_TYPES, type DocTemplate } from "@/lib/templates";
import { VERTICAL_CONFIG } from "@/lib/data";

interface LineItem { id:string; description:string; qty:number; unit:string; price:number; }

interface DocRecord {
  id:string; type:"po"|"invoice"|"estimate"|"receipt"|"requisition";
  templateId:string; number:string; title:string;
  contact:string; company:string; email:string;
  vendor?:string; vendorContact?:string;
  status:string; created:string; dueDate:string; approvedBy?:string; approvedDate?:string;
  companyName:string; companyAddress:string;
  lines:LineItem[]; tax:number; notes:string; terms:string;
  accentColor:string; font:string;
  paidAmount?:number; paymentDate?:string;
  requisitionReason?:string; department?:string; budgetCode?:string;
  linkedQuoteId?:string; linkedPOId?:string;
}

// Status workflows per document type
const STATUS_FLOW: Record<string,{states:string[],colors:Record<string,{bg:string,c:string}>}> = {
  po: {
    states:["draft","pending_approval","approved","sent","partial_received","received","closed","cancelled"],
    colors:{draft:{bg:"#F1F5F9",c:"#64748B"},pending_approval:{bg:"#FFFBEB",c:"#B45309"},approved:{bg:"#EFF6FF",c:"#1D4ED8"},sent:{bg:"#F0FDF4",c:"#15803D"},partial_received:{bg:"#FFF7ED",c:"#C2410C"},received:{bg:"#ECFDF5",c:"#059669"},closed:{bg:"#F8FAFC",c:"#475569"},cancelled:{bg:"#FEF2F2",c:"#B91C1C"}}
  },
  invoice: {
    states:["draft","sent","viewed","partial_paid","paid","overdue","void"],
    colors:{draft:{bg:"#F1F5F9",c:"#64748B"},sent:{bg:"#EFF6FF",c:"#1D4ED8"},viewed:{bg:"#FFFBEB",c:"#B45309"},partial_paid:{bg:"#FFF7ED",c:"#C2410C"},paid:{bg:"#F0FDF4",c:"#15803D"},overdue:{bg:"#FEF2F2",c:"#B91C1C"},void:{bg:"#F8FAFC",c:"#475569"}}
  },
  estimate: {
    states:["draft","sent","accepted","rejected","expired","converted"],
    colors:{draft:{bg:"#F1F5F9",c:"#64748B"},sent:{bg:"#EFF6FF",c:"#1D4ED8"},accepted:{bg:"#F0FDF4",c:"#15803D"},rejected:{bg:"#FEF2F2",c:"#B91C1C"},expired:{bg:"#F8FAFC",c:"#475569"},converted:{bg:"#F5F3FF",c:"#7C3AED"}}
  },
  requisition: {
    states:["draft","submitted","under_review","approved","rejected","converted_to_po","closed"],
    colors:{draft:{bg:"#F1F5F9",c:"#64748B"},submitted:{bg:"#EFF6FF",c:"#1D4ED8"},under_review:{bg:"#FFFBEB",c:"#B45309"},approved:{bg:"#F0FDF4",c:"#15803D"},rejected:{bg:"#FEF2F2",c:"#B91C1C"},converted_to_po:{bg:"#F5F3FF",c:"#7C3AED"},closed:{bg:"#F8FAFC",c:"#475569"}}
  },
  receipt: {
    states:["generated","sent","acknowledged"],
    colors:{generated:{bg:"#F1F5F9",c:"#64748B"},sent:{bg:"#EFF6FF",c:"#1D4ED8"},acknowledged:{bg:"#F0FDF4",c:"#15803D"}}
  },
};

function fv(n:number){ return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function calcTotals(lines:LineItem[],tax:number){ const sub=lines.reduce((a,l)=>a+l.qty*l.price,0); return {sub,taxAmt:sub*(tax/100),total:sub+sub*(tax/100)}; }
function nextNum(type:string){ return type.toUpperCase().substring(0,3)+"-2026-"+String(Math.floor(Math.random()*900)+100); }

// ── SAMPLE DATA ──────────────────────────────────────────────────────────────
const SAMPLE_DOCS: DocRecord[] = [
  // POs
  {id:"po1",type:"po",templateId:"po-construction",number:"PO-2026-101",title:"Roofing Materials — Tampa Project",contact:"",company:"",email:"",vendor:"ABC Building Supply",vendorContact:"Dan Miller · dan@abcsupply.com",status:"approved",created:"Jun 1, 2026",dueDate:"Jun 12, 2026",approvedBy:"Michael",approvedDate:"Jun 2, 2026",companyName:"KOVA Construction LLC",companyAddress:"Tampa, FL",lines:[{id:"l1",description:"Architectural Shingles — 30yr (28 squares)",qty:28,unit:"sq",price:89},{id:"l2",description:"Synthetic Underlayment Roll",qty:6,unit:"rolls",price:145},{id:"l3",description:"Ridge Cap Shingles",qty:4,unit:"bundles",price:52},{id:"l4",description:"Galvanized Flashing — 10ft",qty:12,unit:"pcs",price:18}],tax:7,notes:"Deliver to 4200 Oak St job site. Call 30 min before arrival.",terms:"Net 15. No substitutions without approval.",accentColor:"#F59E0B",font:"Inter"},
  {id:"po2",type:"po",templateId:"po-general",number:"PO-2026-102",title:"Office Supplies — Q3",contact:"",company:"",email:"",vendor:"Staples Business",vendorContact:"orders@staples.com",status:"sent",created:"Jun 2, 2026",dueDate:"Jun 10, 2026",companyName:"KOVA LLC",companyAddress:"San Jose, CA",lines:[{id:"l1",description:"Printer Paper — Case (10 reams)",qty:3,unit:"cases",price:48},{id:"l2",description:"Ink Cartridges — Black",qty:6,unit:"pcs",price:34}],tax:9.25,notes:"Ship to main office.",terms:"Net 30.",accentColor:"#0F172A",font:"Inter"},
  // Invoices
  {id:"inv1",type:"invoice",templateId:"inv-service",number:"INV-2026-201",title:"Roof Replacement — Thompson",contact:"James Thompson",company:"Thompson Properties",email:"j.thompson@thompsonprop.com",status:"sent",created:"May 30, 2026",dueDate:"Jun 30, 2026",companyName:"KOVA Construction LLC",companyAddress:"Tampa, FL",lines:[{id:"l1",description:"Roof tear-off and disposal",qty:1,unit:"job",price:2800},{id:"l2",description:"Architectural shingles — install",qty:28,unit:"sq",price:260},{id:"l3",description:"Flashing replacement",qty:1,unit:"job",price:620}],tax:7,notes:"50% deposit received. Balance due on completion.",terms:"Net 30. Late fee 1.5%/month.",accentColor:"#3B9EFF",font:"Inter",linkedQuoteId:"q1",paidAmount:5426},
  {id:"inv2",type:"invoice",templateId:"inv-service",number:"INV-2026-202",title:"HVAC Service Call — Greenfield",contact:"Lisa Greenfield",company:"Greenfield Dental",email:"lisa@greenfielddental.com",status:"overdue",created:"May 15, 2026",dueDate:"Jun 1, 2026",companyName:"KOVA HVAC Services",companyAddress:"Tampa, FL",lines:[{id:"l1",description:"Diagnostic — commercial AC unit",qty:1,unit:"visit",price:175},{id:"l2",description:"Compressor relay replacement",qty:1,unit:"part",price:340},{id:"l3",description:"Labor — 3 hours",qty:3,unit:"hrs",price:95}],tax:7,notes:"",terms:"Net 15. Overdue.",accentColor:"#EF4444",font:"Inter"},
  // Requisitions
  {id:"req1",type:"requisition",templateId:"",number:"REQ-2026-301",title:"New Laptop — Field Team",contact:"",company:"",email:"",status:"submitted",created:"Jun 2, 2026",dueDate:"Jun 15, 2026",companyName:"KOVA LLC",companyAddress:"",lines:[{id:"l1",description:"MacBook Pro 14\" M3 — Field Use",qty:2,unit:"units",price:1999},{id:"l2",description:"AppleCare+ 3yr",qty:2,unit:"units",price:279}],tax:0,notes:"Field team needs laptops for client demos and on-site CRM access.",terms:"",accentColor:"#A78BFA",font:"Inter",requisitionReason:"Field team expansion — 2 new technicians starting June 15",department:"Operations",budgetCode:"OPS-2026-Q3"},
  {id:"req2",type:"requisition",templateId:"",number:"REQ-2026-302",title:"Safety Equipment — Job Sites",contact:"",company:"",email:"",status:"approved",created:"Jun 1, 2026",dueDate:"Jun 8, 2026",approvedBy:"Michael",approvedDate:"Jun 2, 2026",companyName:"KOVA Construction LLC",companyAddress:"",lines:[{id:"l1",description:"Hard Hats — OSHA Certified",qty:12,unit:"pcs",price:28},{id:"l2",description:"Safety Vests — Hi-Vis",qty:12,unit:"pcs",price:15},{id:"l3",description:"Safety Glasses",qty:24,unit:"pcs",price:8}],tax:0,notes:"Required for new job site starting June 10.",terms:"",accentColor:"#10B981",font:"Inter",requisitionReason:"OSHA compliance — new job site requires full PPE for all crew",department:"Field Ops",budgetCode:"SAFETY-2026"},
  // Estimates
  {id:"est1",type:"estimate",templateId:"est-construction",number:"EST-2026-401",title:"Kitchen Remodel — Garcia Residence",contact:"Maria Garcia",company:"",email:"m.garcia@gmail.com",status:"sent",created:"Jun 1, 2026",dueDate:"Jul 1, 2026",companyName:"KOVA Construction LLC",companyAddress:"Tampa, FL",lines:[{id:"l1",description:"Demo — existing kitchen",qty:1,unit:"job",price:1800},{id:"l2",description:"Cabinets — shaker style (12 units)",qty:12,unit:"units",price:420},{id:"l3",description:"Countertops — quartz",qty:42,unit:"sqft",price:85},{id:"l4",description:"Plumbing rough-in",qty:1,unit:"job",price:2200},{id:"l5",description:"Electrical — 4 circuits",qty:4,unit:"circuits",price:380},{id:"l6",description:"Tile backsplash",qty:30,unit:"sqft",price:22},{id:"l7",description:"Labor — finish work",qty:40,unit:"hrs",price:75}],tax:7,notes:"Estimate valid 30 days. Price subject to material availability.",terms:"50% deposit. 25% at rough-in. 25% at completion.",accentColor:"#F59E0B",font:"Inter"},
];

const DOC_TYPES = [
  { id:"po",          label:"Purchase Orders",  icon:"🛒", color:"#F59E0B" },
  { id:"invoice",     label:"Invoices",         icon:"📄", color:"#3B9EFF" },
  { id:"estimate",    label:"Estimates",        icon:"📊", color:"#64748B" },
  { id:"requisition", label:"Requisitions",     icon:"📝", color:"#A78BFA" },
  { id:"receipt",     label:"Receipts",         icon:"🧾", color:"#10B981" },
];

export default function DocumentCenter({ vertId }:{vertId:string}) {
  const vert = VERTICAL_CONFIG[vertId];
  const P = vert?.color||"#3B9EFF";
  const [tab, setTab]       = useState("po");
  const [view, setView]     = useState<"list"|"detail"|"create">("list");
  const [docs, setDocs]     = useState<DocRecord[]>(SAMPLE_DOCS);
  const [active, setActive] = useState<DocRecord|null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = docs.filter(d=>d.type===tab);
  const flow = STATUS_FLOW[tab] || STATUS_FLOW.po;

  const openDetail = (d:DocRecord) => { setActive(d); setView("detail"); };
  const advanceStatus = (d:DocRecord) => {
    const states = STATUS_FLOW[d.type]?.states || [];
    const idx = states.indexOf(d.status);
    if(idx < states.length-1){
      setDocs(ds=>ds.map(x=>x.id===d.id?{...x,status:states[idx+1]}:x));
      if(active?.id===d.id) setActive({...d, status:states[idx+1]});
    }
  };
  const convertReqToPO = (d:DocRecord) => {
    const po:DocRecord = {...d, id:"po"+Date.now(), type:"po", number:nextNum("po"), status:"draft", title:d.title.replace("Requisition","PO"), linkedPOId:d.id};
    setDocs(ds=>[...ds.map(x=>x.id===d.id?{...x,status:"converted_to_po"}:x), po]);
    setTab("po"); setView("list");
  };
  const createFromTemplate = (type:string) => {
    const n:DocRecord = {
      id:"doc"+Date.now(), type:type as any, templateId:"", number:nextNum(type), title:"",
      contact:"", company:"", email:"", vendor:"", vendorContact:"",
      status:"draft", created:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      dueDate:"", companyName:"", companyAddress:"",
      lines:[{id:"l1",description:"",qty:1,unit:"each",price:0}],
      tax:0, notes:"", terms:"",
      accentColor:DOC_TYPES.find(t=>t.id===type)?.color||P, font:"Inter",
      requisitionReason:"", department:"", budgetCode:"",
    };
    setActive(n); setView("create");
  };

  // Business card scanner
  async function scanCard(file:File){
    setScanning(true); setScanResult(null);
    const reader = new FileReader();
    reader.onload = async(e)=>{
      const b64 = (e.target?.result as string).split(",")[1];
      try {
        const res = await fetch("/api/card-scan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageBase64:b64,mediaType:file.type||"image/jpeg"})});
        const data = await res.json();
        setScanResult(data.contact||{});
      } catch { setScanResult({error:"Check API key."}); }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  }

  const {sub,taxAmt,total} = active ? calcTotals(active.lines,active.tax) : {sub:0,taxAmt:0,total:0};
  const typeConf = DOC_TYPES.find(t=>t.id===tab);

  // ── BUSINESS CARD SCANNER ──────────────────────────────────────────────────
  if(showScanner) return (
    <div>
      <button onClick={()=>{setShowScanner(false);setScanResult(null);}} style={{background:"none",border:"none",fontSize:12,color:"#64748B",cursor:"pointer",marginBottom:12}}>← Back</button>
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:12,padding:"20px",textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:8}}>📱</div>
        <div style={{fontSize:15,fontWeight:700,color:"#0F172A",marginBottom:16}}>Business Card Scanner</div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&scanCard(e.target.files[0])} />
        <button onClick={()=>fileRef.current?.click()} style={{padding:"10px 22px",background:"#0F172A",color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:12}}>📷 Take Photo / Upload</button>
        {scanning && <div style={{padding:"20px",color:P,fontWeight:600}}>🧠 Reading card…</div>}
        {scanResult && !scanResult.error && (
          <div style={{textAlign:"left",padding:"12px",background:"#F0FDF4",border:"1px solid #86EFAC",borderRadius:9,marginTop:10}}>
            <div style={{fontSize:11,color:"#15803D",fontWeight:700,marginBottom:6}}>✓ Extracted:</div>
            {Object.entries(scanResult).filter(([,v])=>v).map(([k,v])=>(
              <div key={k} style={{fontSize:12,marginBottom:3}}><span style={{color:"#64748B"}}>{k}: </span><strong>{String(v)}</strong></div>
            ))}
            <button onClick={()=>{alert("Added to CRM!");setShowScanner(false);}} style={{marginTop:10,padding:"8px 16px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",width:"100%"}}>✓ Add to CRM + Score</button>
          </div>
        )}
      </div>
    </div>
  );

  // ── DETAIL VIEW ────────────────────────────────────────────────────────────
  if((view==="detail"||view==="create") && active) {
    const sc = (flow.colors as any)[active.status] || {bg:"#F1F5F9",c:"#64748B"};
    const isReq = active.type==="requisition";
    const isPO = active.type==="po";
    const isInv = active.type==="invoice";
    const isEdit = view==="create";
    const remaining = isInv ? total - (active.paidAmount||0) : total;

    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <button onClick={()=>{setView("list");setActive(null);}} style={{background:"none",border:"none",fontSize:12,color:"#64748B",cursor:"pointer"}}>← {typeConf?.label}</button>
          <div style={{display:"flex",gap:5}}>
            {isEdit && <button onClick={()=>{setDocs(d=>[...d,active]);setView("list");setActive(null);}} style={{padding:"6px 14px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>Save</button>}
            {!isEdit && active.status!=="closed" && active.status!=="paid" && active.status!=="cancelled" && (
              <button onClick={()=>advanceStatus(active)} style={{padding:"6px 14px",background:P,color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {isPO && active.status==="draft"?"Submit for Approval":
                 isPO && active.status==="pending_approval"?"Approve":
                 isPO && active.status==="approved"?"Mark Sent":
                 isPO && active.status==="sent"?"Mark Received":
                 isInv && active.status==="draft"?"Send Invoice":
                 isInv && active.status==="sent"?"Mark Viewed":
                 isInv && active.status==="viewed"?"Record Payment":
                 isReq && active.status==="draft"?"Submit":
                 isReq && active.status==="submitted"?"Start Review":
                 isReq && active.status==="under_review"?"Approve":"Advance →"}
              </button>
            )}
            {isReq && active.status==="approved" && (
              <button onClick={()=>convertReqToPO(active)} style={{padding:"6px 14px",background:"#A78BFA",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>Convert to PO →</button>
            )}
          </div>
        </div>

        <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:12,overflow:"hidden"}}>
          {/* Header */}
          <div style={{background:active.accentColor,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:3}}>
                {active.type==="requisition"?"Purchase Requisition":active.type.toUpperCase()}
              </div>
              <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>{active.title||"Untitled"}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:2,fontFamily:"monospace"}}>{active.number}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:22,fontWeight:700,color:"#fff"}}>{fv(total)}</div>
              {isInv && active.paidAmount ? <div style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>Paid: {fv(active.paidAmount)} · Due: {fv(remaining)}</div> : null}
              <div style={{padding:"3px 8px",borderRadius:99,background:"rgba(255,255,255,0.2)",display:"inline-block",marginTop:4}}>
                <span style={{fontSize:10,fontWeight:600,color:"#fff"}}>{active.status.replace(/_/g," ")}</span>
              </div>
            </div>
          </div>

          <div style={{padding:"16px 18px"}}>
            {/* Status timeline */}
            <div style={{display:"flex",gap:0,marginBottom:16,overflowX:"auto"}}>
              {flow.states.filter(s=>!["cancelled","void","rejected"].includes(s)).slice(0,6).map((s,i,arr)=>{
                const isCurrent = s===active.status;
                const isPast = flow.states.indexOf(s) < flow.states.indexOf(active.status);
                const sc2 = (flow.colors as any)[s] || {bg:"#F1F5F9",c:"#64748B"};
                return (
                  <div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
                    <div style={{textAlign:"center",flex:1}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:isPast||isCurrent?sc2.c:"#E2E8F0",margin:"0 auto 3px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:700}}>{isPast?"✓":isCurrent?"●":""}</div>
                      <div style={{fontSize:8,color:isCurrent?sc2.c:"#94A3B8",fontWeight:isCurrent?700:400}}>{s.replace(/_/g," ")}</div>
                    </div>
                    {i<arr.length-1 && <div style={{width:20,height:2,background:isPast?sc2.c:"#E2E8F0",flexShrink:0}} />}
                  </div>
                );
              })}
            </div>

            {/* Details grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14,paddingBottom:12,borderBottom:"1px solid #F1F5F9"}}>
              {isPO || isReq ? (
                <>
                  <div><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>Vendor</div><div style={{fontSize:13,fontWeight:600,color:"#0F172A"}}>{active.vendor||"—"}</div><div style={{fontSize:11,color:"#64748B"}}>{active.vendorContact}</div></div>
                  <div><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{isReq?"Requested By":"Approved By"}</div><div style={{fontSize:13,fontWeight:600,color:"#0F172A"}}>{active.approvedBy||"Pending"}</div>{active.approvedDate&&<div style={{fontSize:11,color:"#64748B"}}>{active.approvedDate}</div>}</div>
                </>
              ):(
                <>
                  <div><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{isInv?"Bill To":"Client"}</div><div style={{fontSize:13,fontWeight:600,color:"#0F172A"}}>{active.contact||"—"}</div><div style={{fontSize:11,color:"#64748B"}}>{active.company}</div><div style={{fontSize:10,color:"#94A3B8"}}>{active.email}</div></div>
                  <div><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>Dates</div><div style={{fontSize:12,color:"#0F172A"}}>Created: {active.created}</div><div style={{fontSize:12,color:active.status==="overdue"?"#B91C1C":"#0F172A"}}>Due: {active.dueDate||"—"}</div></div>
                </>
              )}
            </div>

            {/* Requisition-specific fields */}
            {isReq && active.requisitionReason && (
              <div style={{padding:"10px 12px",background:"#F5F3FF",borderRadius:7,border:"1px solid #DDD6FE",marginBottom:12}}>
                <div style={{fontSize:9,color:"#7C3AED",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>Reason for Request</div>
                <div style={{fontSize:12,color:"#334155",lineHeight:1.6}}>{active.requisitionReason}</div>
                <div style={{display:"flex",gap:12,marginTop:6}}>
                  {active.department && <div style={{fontSize:10,color:"#64748B"}}>Dept: <strong>{active.department}</strong></div>}
                  {active.budgetCode && <div style={{fontSize:10,color:"#64748B"}}>Budget: <strong style={{fontFamily:"monospace"}}>{active.budgetCode}</strong></div>}
                </div>
              </div>
            )}

            {/* Invoice payment tracking */}
            {isInv && (
              <div style={{padding:"10px 12px",background:active.status==="overdue"?"#FEF2F2":"#F0FDF4",borderRadius:7,border:`1px solid ${active.status==="overdue"?"#FCA5A5":"#86EFAC"}`,marginBottom:12}}>
                <div style={{fontSize:9,color:active.status==="overdue"?"#B91C1C":"#15803D",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>Payment Status</div>
                <div style={{display:"flex",gap:20}}>
                  <div><div style={{fontSize:10,color:"#64748B"}}>Total</div><div style={{fontSize:14,fontWeight:700,color:"#0F172A"}}>{fv(total)}</div></div>
                  <div><div style={{fontSize:10,color:"#64748B"}}>Paid</div><div style={{fontSize:14,fontWeight:700,color:"#15803D"}}>{fv(active.paidAmount||0)}</div></div>
                  <div><div style={{fontSize:10,color:"#64748B"}}>Remaining</div><div style={{fontSize:14,fontWeight:700,color:remaining>0?"#B91C1C":"#15803D"}}>{fv(remaining)}</div></div>
                </div>
                {active.status==="overdue" && <div style={{fontSize:11,color:"#B91C1C",marginTop:6}}>⚠ This invoice is past due. Agent follow-up recommended.</div>}
              </div>
            )}

            {/* Line items */}
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12}}>
              <thead><tr style={{background:"#F8FAFC"}}>{["Description","Qty","Unit","Price","Total"].map(h=><th key={h} style={{padding:"7px 8px",fontSize:9,color:"#64748B",fontWeight:600,textAlign:h==="Total"||h==="Price"?"right":"left",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
              <tbody>{active.lines.filter(l=>l.description||l.price>0).map((l,i)=>(
                <tr key={l.id} style={{borderBottom:"1px solid #F8FAFC"}}>
                  <td style={{padding:"8px",fontSize:12,color:"#0F172A"}}>{l.description}</td>
                  <td style={{padding:"8px",fontSize:11,color:"#64748B",textAlign:"center"}}>{l.qty}</td>
                  <td style={{padding:"8px",fontSize:11,color:"#64748B",textAlign:"center"}}>{l.unit}</td>
                  <td style={{padding:"8px",fontSize:11,color:"#0F172A",textAlign:"right"}}>{fv(l.price)}</td>
                  <td style={{padding:"8px",fontSize:12,fontWeight:500,color:"#0F172A",textAlign:"right"}}>{fv(l.qty*l.price)}</td>
                </tr>
              ))}</tbody>
            </table>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
              <div style={{display:"flex",gap:24,fontSize:11,color:"#64748B"}}><span>Subtotal</span><span>{fv(sub)}</span></div>
              {active.tax>0&&<div style={{display:"flex",gap:24,fontSize:11,color:"#64748B"}}><span>Tax ({active.tax}%)</span><span>{fv(taxAmt)}</span></div>}
              <div style={{display:"flex",gap:24,fontSize:15,fontWeight:700,color:active.accentColor,paddingTop:4,borderTop:"1px solid #E2E8F0",marginTop:2}}><span>Total</span><span>{fv(total)}</span></div>
            </div>

            {/* Notes + Terms */}
            {active.notes && <div style={{marginTop:12,padding:"10px 12px",background:"#F8FAFC",borderRadius:7}}><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",marginBottom:3}}>Notes</div><div style={{fontSize:11,color:"#64748B",lineHeight:1.6}}>{active.notes}</div></div>}
            {active.terms && <div style={{marginTop:6,padding:"10px 12px",background:"#F8FAFC",borderRadius:7}}><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",marginBottom:3}}>Terms</div><div style={{fontSize:11,color:"#64748B",lineHeight:1.6}}>{active.terms}</div></div>}
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#0F172A"}}>Document Center</div>
          <div style={{fontSize:11,color:"#64748B",marginTop:1}}>PO · Invoices · Estimates · Requisitions · Receipts</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setShowScanner(true)} style={{padding:"7px 12px",background:P+"15",color:P,border:`1px solid ${P}44`,borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer"}}>📷 Scan Card</button>
          <button onClick={()=>createFromTemplate(tab)} style={{padding:"7px 14px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer"}}>+ New {typeConf?.label?.replace(/s$/,"")}</button>
        </div>
      </div>

      {/* Type tabs */}
      <div style={{display:"flex",gap:4,marginBottom:12,overflowX:"auto"}}>
        {DOC_TYPES.map(t=>{
          const count = docs.filter(d=>d.type===t.id).length;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:7,border:`1px solid ${tab===t.id?t.color:"#E2E8F0"}`,background:tab===t.id?t.color+"15":"#fff",color:tab===t.id?t.color:"#64748B",fontSize:11,fontWeight:tab===t.id?600:400,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
              <span>{t.icon}</span>{t.label}
              {count>0 && <span style={{fontSize:9,background:t.color+"20",color:t.color,padding:"1px 5px",borderRadius:99,fontWeight:700}}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Status filter pills */}
      <div style={{display:"flex",gap:3,marginBottom:10,overflowX:"auto"}}>
        <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"#0F172A",color:"#fff",fontWeight:600,cursor:"pointer"}}>All ({filtered.length})</span>
        {flow.states.slice(0,5).map(s=>{
          const count = filtered.filter(d=>d.status===s).length;
          const sc2 = (flow.colors as any)[s] || {bg:"#F1F5F9",c:"#64748B"};
          return count > 0 ? <span key={s} style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:sc2.bg,color:sc2.c,fontWeight:600,cursor:"pointer"}}>{s.replace(/_/g," ")} ({count})</span> : null;
        })}
      </div>

      {/* Doc list */}
      {filtered.length===0 && (
        <div style={{textAlign:"center",padding:"40px",border:"1px dashed #E2E8F0",borderRadius:10,color:"#94A3B8"}}>
          <div style={{fontSize:28,marginBottom:8}}>{typeConf?.icon}</div>
          <div style={{fontSize:13,fontWeight:600,color:"#64748B",marginBottom:4}}>No {typeConf?.label?.toLowerCase()} yet</div>
          <button onClick={()=>createFromTemplate(tab)} style={{padding:"8px 18px",background:P,color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>Create First</button>
        </div>
      )}
      {filtered.map(d=>{
        const {total:dt} = calcTotals(d.lines,d.tax);
        const sc2 = (flow.colors as any)[d.status] || {bg:"#F1F5F9",c:"#64748B"};
        const isOverdue = d.status==="overdue";
        return (
          <div key={d.id} onClick={()=>openDetail(d)} style={{background:"#fff",border:`1px solid ${isOverdue?"#FCA5A5":"#E2E8F0"}`,borderRadius:10,padding:"12px 14px",marginBottom:7,cursor:"pointer",borderLeft:`3px solid ${d.accentColor}`}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontFamily:"monospace",color:"#94A3B8"}}>{d.number}</span>
                  <span style={{fontSize:9,padding:"2px 7px",borderRadius:99,fontWeight:600,background:sc2.bg,color:sc2.c}}>{d.status.replace(/_/g," ")}</span>
                  {d.vendor && <span style={{fontSize:10,color:"#64748B"}}>→ {d.vendor}</span>}
                  {d.approvedBy && <span style={{fontSize:10,color:"#15803D"}}>✓ {d.approvedBy}</span>}
                </div>
                <div style={{fontSize:13,fontWeight:700,color:"#0F172A",marginBottom:2}}>{d.title||"Untitled"}</div>
                <div style={{fontSize:11,color:"#64748B"}}>{d.contact||d.vendor||"—"} · {d.created}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:700,color:d.accentColor}}>{fv(dt)}</div>
                <div style={{fontSize:10,color:"#94A3B8"}}>{d.lines.length} items</div>
                {d.type==="invoice" && d.paidAmount ? <div style={{fontSize:10,color:"#15803D"}}>Paid: {fv(d.paidAmount)}</div> : null}
              </div>
            </div>
          </div>
        );
      })}

      {/* Templates section */}
      {tab!=="requisition" && (
        <div style={{marginTop:16}}>
          <div style={{fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Industry Templates</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:6}}>
            {DOC_TEMPLATES.filter(t=>t.type===tab).slice(0,6).map(t=>(
              <div key={t.id} onClick={()=>createFromTemplate(tab)} style={{background:"#fff",border:`1px solid ${t.accentColor}22`,borderTop:`2px solid ${t.accentColor}`,borderRadius:8,padding:"10px 11px",cursor:"pointer"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#0F172A",marginBottom:1}}>{t.name}</div>
                <div style={{fontSize:9,color:t.accentColor,fontWeight:600}}>{t.industry}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
