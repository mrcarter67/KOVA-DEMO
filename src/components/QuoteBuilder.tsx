"use client";
import { useState } from "react";
import type { Quote, QuoteLineItem } from "@/lib/types";
import { SAMPLE_QUOTES } from "@/lib/quotes";
import { VERTICAL_CONFIG } from "@/lib/data";

const FONTS = [
  { id:"Inter",    label:"Modern",   sample:"Clean & Professional" },
  { id:"Georgia",  label:"Classic",  sample:"Traditional & Trusted" },
  { id:"Merriweather", label:"Editorial", sample:"Premium & Detailed" },
  { id:"system-ui",label:"Simple",   sample:"Clean & Minimal" },
];

const ACCENTS = ["#00C896","#3B9EFF","#A78BFA","#F59E0B","#EF4444","#10B981","#EC4899","#0F172A"];

const STATUS_COLORS: Record<string,{bg:string,color:string}> = {
  draft:    {bg:"#F1F5F9", color:"#64748B"},
  sent:     {bg:"#EFF6FF", color:"#1D4ED8"},
  viewed:   {bg:"#FFFBEB", color:"#B45309"},
  accepted: {bg:"#F0FDF4", color:"#15803D"},
  declined: {bg:"#FEF2F2", color:"#B91C1C"},
};

function calcTotal(lines: QuoteLineItem[], tax: number) {
  const sub = lines.reduce((a,l)=>a+l.qty*l.price, 0);
  const taxAmt = sub*(tax/100);
  return { sub, taxAmt, total: sub+taxAmt };
}

function fmtCurrency(n: number) {
  return "$"+n.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
}

interface Props { vertId: string; onBack: ()=>void; }

export default function QuoteBuilder({ vertId, onBack }: Props) {
  const vert = VERTICAL_CONFIG[vertId];
  const P = vert?.color || "#00C896";

  const emptyQuote = (): Quote => ({
    id: "new", vertical: vertId,
    number: "Q-2026-00"+(SAMPLE_QUOTES.length+1),
    title:"", contact:"", company:"", email:"",
    status:"draft", font:"Inter", coverImage:"", accentColor: P,
    intro:"", scope:"", terms:"Net 30. 50% deposit to begin, balance on completion.",
    lines:[
      {id:"l1", description:"", qty:1, unit:"job", price:0},
    ],
    tax:0, created: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
    validUntil:"",
  });

  const [view, setView]         = useState<"list"|"builder"|"preview">("list");
  const [quotes, setQuotes]     = useState<Quote[]>(
    SAMPLE_QUOTES.filter(q=>q.vertical===vertId)
  );
  const [active, setActive]     = useState<Quote>(emptyQuote());
  const [preview, setPreview]   = useState<Quote|null>(null);

  const openNew = () => { setActive(emptyQuote()); setView("builder"); };
  const openEdit = (q: Quote) => { setActive({...q}); setView("builder"); };
  const openPreview = (q: Quote) => { setPreview(q); setView("preview"); };

  const updateLine = (id:string, field:keyof QuoteLineItem, val:any) => {
    setActive(a=>({...a, lines: a?.lines?.map(l=>l.id===id?{...l,[field]:field==="qty"||field==="price"?+val:val}:l)}));
  };
  const addLine = () => {
    setActive(a=>({...a, lines:[...(a.lines||[]),{id:"l"+Date.now(),description:"",qty:1,unit:"unit",price:0}]}));
  };
  const removeLine = (id:string) => {
    setActive(a=>({...a, lines:a?.lines?.filter(l=>l.id!==id)}));
  };
  const saveQuote = () => {
    setQuotes(qs=>{
      const idx = qs.findIndex(q=>q.id===active.id);
      if(idx>=0){ const n=[...qs]; n[idx]=active; return n; }
      return [...qs,{...active,id:"q"+Date.now()}];
    });
    setView("list");
  };
  const sendQuote = (q: Quote) => {
    setQuotes(qs=>qs.map(x=>x.id===q.id?{...x,status:"sent",sentAt:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}:x));
    alert(`Quote sent to ${q.email || q.contact}`);
  };

  const { sub, taxAmt, total } = calcTotal(active.lines||[], active.tax||0||0);

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if(view==="list") return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#0F172A"}}>Quotes & Proposals</div>
          <div style={{fontSize:11,color:"#64748B",marginTop:1}}>Branded proposals that sell. Not estimates.</div>
        </div>
        <button onClick={openNew} style={{padding:"8px 18px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
          + New Quote
        </button>
      </div>

      {quotes.length===0 && (
        <div style={{textAlign:"center",padding:"40px",border:"1px dashed #E2E8F0",borderRadius:10,color:"#94A3B8"}}>
          <div style={{fontSize:28,marginBottom:8}}>📋</div>
          <div style={{fontSize:13,fontWeight:600,color:"#64748B",marginBottom:4}}>No quotes yet</div>
          <div style={{fontSize:11,marginBottom:16}}>Create your first branded proposal</div>
          <button onClick={openNew} style={{padding:"8px 18px",background:P,color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>
            Create Quote
          </button>
        </div>
      )}

      {quotes.map(q=>{
        const {total} = calcTotal(q.lines||[]||[]||[], q.tax||0||0);
        const sc = STATUS_COLORS[q.status]||STATUS_COLORS.draft;
        return (
          <div key={q.id} style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"13px 14px",marginBottom:8,borderLeft:`3px solid ${q.accentColor}`}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:"#94A3B8",fontFamily:"monospace"}}>{q.number}</span>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,fontWeight:600,background:sc.bg,color:sc.color}}>{q.status}</span>
                  <span style={{fontSize:10,color:"#94A3B8"}}>{q.sentAt?`Sent ${q.sentAt}`:`Created ${q.created}`}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:"#0F172A",marginBottom:2}}>{q.title||"Untitled Quote"}</div>
                <div style={{fontSize:11,color:"#64748B"}}>{q.contact} · {q.company}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:700,color:q.accentColor}}>{fmtCurrency(total)}</div>
                <div style={{fontSize:10,color:"#94A3B8"}}>{q.lines||[]||[].length} line items</div>
              </div>
            </div>
            <div style={{display:"flex",gap:5,marginTop:9}}>
              <button onClick={()=>openPreview(q)} style={{flex:1,padding:"6px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",color:"#0F172A"}}>
                Preview
              </button>
              <button onClick={()=>openEdit(q)} style={{flex:1,padding:"6px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",color:"#0F172A"}}>
                Edit
              </button>
              {q.status==="draft"&&<button onClick={()=>sendQuote(q)} style={{flex:1,padding:"6px",background:"#0F172A",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",color:"#fff"}}>
                Send
              </button>}
              {q.status==="accepted"&&<div style={{flex:1,padding:"6px",background:"#F0FDF4",border:"1px solid #86EFAC",borderRadius:6,fontSize:11,fontWeight:600,color:"#15803D",textAlign:"center"}}>✓ Accepted</div>}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── BUILDER ────────────────────────────────────────────────────────────────
  if(view==="builder") return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setView("list")} style={{background:"none",border:"none",fontSize:12,color:"#64748B",cursor:"pointer"}}>← Quotes</button>
          <span style={{fontSize:13,fontWeight:600,color:"#0F172A"}}>{active.id==="new"?"New Quote":active.number}</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>openPreview(active)} style={{padding:"7px 14px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer"}}>Preview</button>
          <button onClick={saveQuote} style={{padding:"7px 14px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer"}}>Save</button>
        </div>
      </div>

      {/* Design controls */}
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Design</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:"#64748B",marginBottom:4}}>Font Style</div>
            <div style={{display:"flex",gap:4}}>
              {FONTS.map(f=>(
                <button key={f.id} onClick={()=>setActive(a=>({...a,font:f.id}))} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${active.font===f.id?active.accentColor:"#E2E8F0"}`,background:active.font===f.id?active.accentColor+"15":"#F8FAFC",color:active.font===f.id?active.accentColor:"#64748B",fontSize:10,fontWeight:active.font===f.id?600:400,cursor:"pointer",fontFamily:f.id}}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,color:"#64748B",marginBottom:4}}>Accent Color</div>
            <div style={{display:"flex",gap:4}}>
              {ACCENTS.map(c=>(
                <div key={c} onClick={()=>setActive(a=>({...a,accentColor:c}))} style={{width:20,height:20,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${active.accentColor===c?"#0F172A":"transparent"}`}} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Client info */}
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Quote Details</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          {([["title","Proposal Title","Roof Replacement — 4200 Oak St"],["contact","Client Name","John Smith"],["company","Company","Smith Properties LLC"],["email","Email","john@smith.com"],["validUntil","Valid Until","Jul 1, 2026"],["number","Quote Number","Q-2026-001"]] as const).map(([field,label,ph])=>(
            <div key={field}>
              <div style={{fontSize:10,color:"#64748B",marginBottom:3}}>{label}</div>
              <input value={(active as any)[field]} onChange={e=>setActive(a=>({...a,[field]:e.target.value}))} placeholder={ph}
                style={{width:"100%",padding:"7px 9px",border:"1px solid #E2E8F0",borderRadius:6,fontSize:12,color:"#0F172A",background:"#F8FAFC"}} />
            </div>
          ))}
        </div>
      </div>

      {/* Text content */}
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Content</div>
        {([["intro","Opening Statement","Thank you for the opportunity…"],["scope","Scope of Work","Describe what's included…"],["terms","Terms & Conditions","Net 30. 50% deposit to begin…"]] as const).map(([field,label,ph])=>(
          <div key={field} style={{marginBottom:8}}>
            <div style={{fontSize:10,color:"#64748B",marginBottom:3}}>{label}</div>
            <textarea value={(active as any)[field]} onChange={e=>setActive(a=>({...a,[field]:e.target.value}))} placeholder={ph} rows={field==="scope"?4:2}
              style={{width:"100%",padding:"7px 9px",border:"1px solid #E2E8F0",borderRadius:6,fontSize:12,color:"#0F172A",background:"#F8FAFC",resize:"vertical",fontFamily:active.font}} />
          </div>
        ))}
      </div>

      {/* Line items */}
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em"}}>Line Items</div>
          <button onClick={addLine} style={{fontSize:11,padding:"3px 10px",background:active.accentColor+"15",color:active.accentColor,border:`1px solid ${active.accentColor}44`,borderRadius:5,cursor:"pointer",fontWeight:600}}>+ Add Line</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 60px 80px 90px 24px",gap:4,marginBottom:4}}>
          {["Description","Qty","Unit","Price",""].map(h=><div key={h} style={{fontSize:9,color:"#94A3B8",fontWeight:600,padding:"0 2px"}}>{h}</div>)}
        </div>
        {(active.lines||[]).map(l=>(
          <div key={l.id} style={{display:"grid",gridTemplateColumns:"1fr 60px 80px 90px 24px",gap:4,marginBottom:4}}>
            <input value={l.description} onChange={e=>updateLine(l.id,"description",e.target.value)} placeholder="Description"
              style={{padding:"5px 7px",border:"1px solid #E2E8F0",borderRadius:5,fontSize:11,color:"#0F172A",background:"#F8FAFC"}} />
            <input value={l.qty} type="number" min="0" onChange={e=>updateLine(l.id,"qty",e.target.value)}
              style={{padding:"5px 5px",border:"1px solid #E2E8F0",borderRadius:5,fontSize:11,color:"#0F172A",background:"#F8FAFC",textAlign:"center"}} />
            <input value={l.unit} onChange={e=>updateLine(l.id,"unit",e.target.value)}
              style={{padding:"5px 5px",border:"1px solid #E2E8F0",borderRadius:5,fontSize:11,color:"#0F172A",background:"#F8FAFC",textAlign:"center"}} />
            <input value={l.price} type="number" min="0" onChange={e=>updateLine(l.id,"price",e.target.value)} placeholder="0.00"
              style={{padding:"5px 5px",border:"1px solid #E2E8F0",borderRadius:5,fontSize:11,color:"#0F172A",background:"#F8FAFC",textAlign:"right"}} />
            <button onClick={()=>removeLine(l.id)} style={{background:"none",border:"none",color:"#CBD5E1",fontSize:14,cursor:"pointer",padding:0,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
        ))}
        {/* Tax */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,paddingTop:8,borderTop:"1px solid #F1F5F9",justifyContent:"flex-end"}}>
          <span style={{fontSize:11,color:"#64748B"}}>Tax %</span>
          <input value={active.tax||0} type="number" min="0" max="30" onChange={e=>setActive(a=>({...a,tax:+e.target.value}))}
            style={{width:50,padding:"4px 6px",border:"1px solid #E2E8F0",borderRadius:5,fontSize:11,textAlign:"center"}} />
        </div>
        {/* Totals */}
        <div style={{marginTop:8,padding:"10px 0 0",borderTop:"1px solid #F1F5F9"}}>
          {([["Subtotal",fmtCurrency(sub)],active.tax||0>0?["Tax ("+active.tax||0+"%)",fmtCurrency(taxAmt)]:null,["Total",fmtCurrency(total)]] as (string[]|null)[]).filter((x):x is string[]=>x!==null).map(([l,v],i,arr)=>(
            <div key={l} style={{display:"flex",justifyContent:"flex-end",gap:40,marginBottom:4}}>
              <span style={{fontSize:i===arr.length-1?14:11,fontWeight:i===arr.length-1?700:400,color:i===arr.length-1?active.accentColor:"#64748B"}}>{l}</span>
              <span style={{fontSize:i===arr.length-1?14:11,fontWeight:i===arr.length-1?700:400,color:i===arr.length-1?active.accentColor:"#0F172A",minWidth:80,textAlign:"right"}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── PREVIEW (CLIENT VIEW) ──────────────────────────────────────────────────
  const q = preview || active;
  const {sub:ps, taxAmt:pt, total:pTotal} = calcTotal(q.lines||[]||[]||[], q.tax||0||0);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={()=>setView(preview?"list":"builder")} style={{background:"none",border:"none",fontSize:12,color:"#64748B",cursor:"pointer"}}>← {preview?"Quotes":"Edit"}</button>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>{if(preview)sendQuote(preview);}} style={{padding:"7px 14px",background:"#0F172A",color:"#fff",border:"none",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer"}}>Send to Client</button>
        </div>
      </div>

      {/* Preview wrapper */}
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:12,overflow:"hidden",fontFamily:q.font}}>
        {/* Header bar */}
        <div style={{background:q.accentColor,padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:"#fff",marginBottom:3}}>{q.title||"Proposal"}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{q.number} · Valid until {q.validUntil||"—"}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:28,fontWeight:700,color:"#fff"}}>{fmtCurrency(pTotal)}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Total Investment</div>
          </div>
        </div>

        <div style={{padding:"20px 24px"}}>
          {/* Client + date */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18,paddingBottom:18,borderBottom:"1px solid #F1F5F9"}}>
            <div>
              <div style={{fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Prepared For</div>
              <div style={{fontSize:14,fontWeight:600,color:"#0F172A"}}>{q.contact||"—"}</div>
              <div style={{fontSize:12,color:"#64748B"}}>{q.company}</div>
              <div style={{fontSize:11,color:"#94A3B8"}}>{q.email}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Date</div>
              <div style={{fontSize:13,color:"#0F172A"}}>{q.created}</div>
            </div>
          </div>

          {/* Intro */}
          {q.intro && <div style={{fontSize:13,color:"#334155",lineHeight:1.8,marginBottom:18,padding:"12px 16px",background:"#F8FAFC",borderRadius:8,borderLeft:`3px solid ${q.accentColor}`}}>{q.intro||''}</div>}

          {/* Scope */}
          {q.scope && (
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:"#0F172A",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:7}}>Scope of Work</div>
              <div style={{fontSize:13,color:"#334155",lineHeight:1.8}}>
                {q.scope||''.split("·").map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:4,alignItems:"flex-start"}}>
                    {q.scope||''.includes("·")&&<span style={{color:q.accentColor,marginTop:1,flexShrink:0}}>✓</span>}
                    <span>{s.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line items */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,fontWeight:700,color:"#0F172A",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:7}}>Investment Breakdown</div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#F8FAFC"}}>
                  {["Description","Qty","Unit","Amount"].map(h=>(
                    <th key={h} style={{padding:"8px 10px",fontSize:10,fontWeight:600,color:"#64748B",textAlign:h==="Amount"?"right":"left",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {((q.lines||[]) as any[]).filter((l:any)=>l.description||l.price>0).map((l:any,i:number)=>(
                  <tr key={l.id} style={{borderBottom:"1px solid #F1F5F9",background:i%2===0?"#fff":"#FAFAFA"}}>
                    <td style={{padding:"9px 10px",fontSize:13,color:"#0F172A"}}>{l.description}</td>
                    <td style={{padding:"9px 10px",fontSize:12,color:"#64748B",textAlign:"center"}}>{l.qty}</td>
                    <td style={{padding:"9px 10px",fontSize:12,color:"#64748B",textAlign:"center"}}>{l.unit}</td>
                    <td style={{padding:"9px 10px",fontSize:13,fontWeight:500,color:"#0F172A",textAlign:"right"}}>{fmtCurrency(l.qty*l.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{padding:"10px 10px 0",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
              <div style={{display:"flex",gap:32,fontSize:11,color:"#64748B"}}><span>Subtotal</span><span>{fmtCurrency(ps)}</span></div>
              {q.tax||0>0&&<div style={{display:"flex",gap:32,fontSize:11,color:"#64748B"}}><span>Tax ({q.tax||0}%)</span><span>{fmtCurrency(pt)}</span></div>}
              <div style={{display:"flex",gap:32,fontSize:15,fontWeight:700,color:q.accentColor,paddingTop:4,borderTop:"1px solid #E2E8F0",marginTop:2}}><span>Total</span><span>{fmtCurrency(pTotal)}</span></div>
            </div>
          </div>

          {/* Terms */}
          {q.terms &&<div style={{marginBottom:18,padding:"12px 14px",background:"#F8FAFC",borderRadius:7}}>
            <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Terms & Conditions</div>
            <div style={{fontSize:11,color:"#64748B",lineHeight:1.6}}>{q.terms||''}</div>
          </div>}

          {/* Accept CTA */}
          <div style={{textAlign:"center",padding:"14px",background:`${q.accentColor}10`,borderRadius:9,border:`1px solid ${q.accentColor}33`}}>
            <div style={{fontSize:12,color:"#64748B",marginBottom:8}}>Ready to move forward?</div>
            <button onClick={()=>alert("In production this lets the client accept digitally and triggers a KOVA deal update.")} style={{padding:"11px 32px",background:q.accentColor,color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",letterSpacing:"0.3px"}}>
              Accept This Proposal
            </button>
            <div style={{fontSize:10,color:"#94A3B8",marginTop:6}}>Valid until {q.validUntil||"—"} · Questions? Reply to this email.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
