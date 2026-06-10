"use client";
import { useState, useEffect } from "react";

const ROUTES = [
  { name:"Lead Scoring",      path:"/api/score",       task:"scoring",    critical:true,
    payload:{contact:{name:"Marcus Rodriguez",company:"Storm Shield Roofing",title:"Owner"},vertical:"construction"} },
  { name:"Intelligence Report",path:"/api/report",     task:"report",     critical:true,
    payload:{contacts:[{name:"Marcus Rodriguez",company:"Storm Shield Roofing"}],deals:[{title:"Roof Job",value:11200,stage:"Contract Signed"}],vertical:"construction",companyName:"Storm Shield Roofing"} },
  { name:"NL Data Query",     path:"/api/query",        task:"query",      critical:false,
    payload:{question:"Who should I call today?",contacts:[{name:"Marcus Rodriguez",score:85}],deals:[],vertical:"construction"} },
  { name:"Personalize Copy",  path:"/api/personalize",  task:"personalize",critical:false,
    payload:{content:"Following up on your roof replacement estimate.",contact:{name:"Marcus Rodriguez",title:"Owner"},vertical:"construction"} },
  { name:"Maven Agent",       path:"/api/agents",       task:"agent",      critical:true,
    payload:{agentId:"maven",messages:[{role:"user",content:"Hi, I run a roofing company in Tampa."}],vertical:"construction"} },
  { name:"Atlas Onboarding",  path:"/api/atlas",        task:"atlas",      critical:false,
    payload:{messages:[{role:"user",content:"Help me understand my pipeline."}],vertical:"construction"} },
  { name:"Quote Agent",       path:"/api/quote-agent",  task:"quoting",    critical:true,
    payload:{messages:[{role:"user",content:"I need to quote a roof replacement job."}],docType:"quote",vertical:"construction"} },
  { name:"Financial Atlas",   path:"/api/financial",    task:"financial",  critical:false,
    payload:{messages:[{role:"user",content:"How is my revenue trending?"}],analysisType:"chat",financialData:{revenue:102400,expenses:71200,cash:186400}} },
  { name:"ERP Estimator",     path:"/api/erp-agent",    task:"erp",        critical:false,
    payload:{agentType:"estimator",messages:[{role:"user",content:"Estimate an HVAC replacement."}]} },
  { name:"Beta Signup",       path:"/api/beta-signup",  task:"beta",       critical:true,
    payload:{firstName:"Test",lastName:"User",email:`test.${Date.now()}@demo.com`,company:"Test Co",vertical:"construction",tier:"free"} },
];

const DEMO_STEPS = [
  {t:"0:00",label:"Maven conversation",owner:"Austin",url:"/atrium",note:"Maven asks 3 questions, captures brand voice"},
  {t:"1:00",label:"KOVA loads branded",owner:"Carlos",url:"/dashboard",note:"Day-8 handoff — CRM opens vertical-specific"},
  {t:"2:00",label:"Vertical switcher",owner:"Carlos",url:"/dashboard",note:"RE → Healthcare → Manufacturing all load clean"},
  {t:"2:30",label:"AI lead scoring",owner:"Michael",url:"/dashboard?view=contacts",note:"Click score ring → Claude returns in < 3s"},
  {t:"3:00",label:"Quote agent demo",owner:"Austin + Carlos",url:"/dashboard?view=quotes",note:"4 questions → quote builds live on right"},
  {t:"4:30",label:"Quote preview + e-sign",owner:"Carlos",url:"/dashboard?view=quotes",note:"Branded proposal — e-sig block visible"},
  {t:"5:00",label:"Invoice auto-generates",owner:"Carlos",url:"/dashboard?view=docs",note:"Accept quote → invoice modal opens pre-filled"},
  {t:"5:30",label:"Pipeline visualization",owner:"Carlos",url:"/pipeline",note:"9 stages — animated — run simulation"},
  {t:"6:30",label:"Intelligence report",owner:"Michael",url:"/dashboard?view=reports",note:"Claude writes live briefing — specific names"},
  {t:"7:00",label:"Beta signup close",owner:"Carlos",url:"/beta",note:"Real URL — QR code ready — form submits"},
];

interface Result { name:string; status:"idle"|"running"|"pass"|"fail"; ms?:number; preview?:string; error?:string; }

export default function DemoCheck() {
  const [results, setResults] = useState<Result[]>(ROUTES.map(r=>({name:r.name,status:"idle"})));
  const [running, setRunning] = useState(false);
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [stepDone, setStepDone] = useState<Record<string,boolean>>({});

  useEffect(()=>{
    fetch("/api/health").then(r=>r.json()).then(setHealthInfo).catch(()=>{});
  },[]);

  const runAll = async () => {
    setRunning(true);
    setResults(ROUTES.map(r=>({name:r.name,status:"idle"})));

    for(let i=0;i<ROUTES.length;i++){
      const route = ROUTES[i];
      setResults(prev=>prev.map((r,j)=>j===i?{...r,status:"running"}:r));
      const start=Date.now();
      try{
        const res = await fetch(route.path,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify(route.payload),
          signal:AbortSignal.timeout(10000),
        });
        const data = await res.json();
        const ms=Date.now()-start;
        if(data.error){
          setResults(prev=>prev.map((r,j)=>j===i?{...r,status:"fail",ms,error:data.error}:r));
        } else {
          const preview = data.message||data.report||data.answer||data.personalized||
            (data.overall?`Score: ${data.overall}/100`:null)||(data.success?"Signup saved — ID: "+data.id:null)||
            JSON.stringify(data).slice(0,100)+"…";
          setResults(prev=>prev.map((r,j)=>j===i?{...r,status:"pass",ms,preview}:r));
        }
      }catch(e:any){
        setResults(prev=>prev.map((r,j)=>j===i?{...r,status:"fail",ms:Date.now()-start,error:e.message}:r));
      }
      await new Promise(r=>setTimeout(r,300));
    }
    setRunning(false);
  };

  const passing = results.filter(r=>r.status==="pass").length;
  const failing = results.filter(r=>r.status==="fail").length;
  const critFailing = ROUTES.filter((r,i)=>r.critical && results[i]?.status==="fail").length;
  const apiReady = healthInfo?.ai?.apiKeyPresent || healthInfo?.ai?.ready;
  const demoReady = passing === ROUTES.length && apiReady;

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#0B1628",minHeight:"100vh",color:"#F1F5F9",padding:"0"}}>

      {/* STATUS BANNER */}
      <div style={{background:demoReady?"#052e16":critFailing>0?"#450a0a":"#0F172A",padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{fontSize:20}}>{demoReady?"🟢":critFailing>0?"🔴":"⚪"}</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:demoReady?"#4ade80":critFailing>0?"#f87171":"#F1F5F9"}}>
                {demoReady?"DEMO READY":critFailing>0?`${critFailing} CRITICAL FAILURES`:"Run checks to verify"}
              </div>
              <div style={{fontSize:11,color:"#475569"}}>
                {demoReady?"All systems go — June 10 demo is live":`${passing} passing · ${failing} failing · ${ROUTES.filter(r=>r.critical).length} critical routes`}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{textAlign:"center",padding:"6px 12px",background:"rgba(255,255,255,0.06)",borderRadius:8}}>
              <div style={{fontSize:18,fontWeight:700,color:apiReady?"#4ade80":"#f87171"}}>{apiReady?"✓":"✗"}</div>
              <div style={{fontSize:9,color:"#475569"}}>API Key</div>
            </div>
            <div style={{textAlign:"center",padding:"6px 12px",background:"rgba(255,255,255,0.06)",borderRadius:8}}>
              <div style={{fontSize:18,fontWeight:700,color:"#60a5fa"}}>{passing}/{ROUTES.length}</div>
              <div style={{fontSize:9,color:"#475569"}}>Routes</div>
            </div>
            <button onClick={runAll} disabled={running} style={{padding:"9px 20px",background:running?"#1e293b":"#00C896",color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:running?"wait":"pointer",minWidth:140}}>
              {running?"Running checks…":"▶ Run All Checks"}
            </button>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,height:"calc(100vh - 73px)"}}>

        {/* LEFT — API Routes */}
        <div style={{padding:"16px",overflowY:"auto",borderRight:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>
            API Routes — {ROUTES.filter(r=>r.critical).length} critical
          </div>

          {/* API Key Warning */}
          {!apiReady && (
            <div style={{padding:"10px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#f87171",marginBottom:4}}>⚠ ANTHROPIC_API_KEY not set</div>
              <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>
                Vercel → your project → Settings → Environment Variables → Add ANTHROPIC_API_KEY<br/>
                Then redeploy. All AI features are off without this.
              </div>
            </div>
          )}

          {ROUTES.map((route,i)=>{
            const result = results[i];
            const s = result.status;
            const statusColor = s==="pass"?"#4ade80":s==="fail"?"#f87171":s==="running"?"#60a5fa":"#475569";
            return (
              <div key={route.path} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${s==="pass"?"rgba(74,222,128,0.2)":s==="fail"?"rgba(248,113,113,0.2)":"rgba(255,255,255,0.06)"}`,borderRadius:8,padding:"10px 12px",marginBottom:6,borderLeft:`3px solid ${statusColor}`}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:s!=="idle"?4:0}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:s==="pass"?"#052e16":s==="fail"?"#450a0a":s==="running"?"#0f172a":"#1e293b",border:`1.5px solid ${statusColor}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:statusColor,fontWeight:700,flexShrink:0}}>
                    {s==="pass"?"✓":s==="fail"?"✗":s==="running"?"…":"○"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#F1F5F9"}}>{route.name}</span>
                      {route.critical && <span style={{fontSize:9,background:"rgba(239,68,68,0.15)",color:"#f87171",padding:"1px 5px",borderRadius:3,fontWeight:700}}>CRITICAL</span>}
                      {result.ms && <span style={{fontSize:10,color:result.ms<1500?"#4ade80":result.ms<3000?"#facc15":"#f87171",marginLeft:"auto"}}>{result.ms}ms</span>}
                    </div>
                    <div style={{fontSize:10,color:"#475569",fontFamily:"monospace"}}>{route.path}</div>
                  </div>
                </div>
                {s==="pass" && result.preview && <div style={{fontSize:10,color:"#94a3b8",paddingLeft:26,lineHeight:1.5}}>{result.preview.slice(0,110)}{result.preview.length>110?"…":""}</div>}
                {s==="fail" && result.error && <div style={{fontSize:10,color:"#f87171",paddingLeft:26}}>{result.error.includes("api_key")||result.error.includes("API key")?"Set ANTHROPIC_API_KEY in Vercel environment variables":result.error.slice(0,120)}</div>}
              </div>
            );
          })}
        </div>

        {/* RIGHT — Demo Script */}
        <div style={{padding:"16px",overflowY:"auto"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>
            8-Minute Demo Script — click to check off
          </div>

          {DEMO_STEPS.map((step,i)=>{
            const done = stepDone["s"+i];
            return (
              <div key={i} onClick={()=>setStepDone(p=>({...p,["s"+i]:!p["s"+i]}))} style={{background:done?"rgba(74,222,128,0.05)":"rgba(255,255,255,0.03)",border:`1px solid ${done?"rgba(74,222,128,0.2)":"rgba(255,255,255,0.06)"}`,borderRadius:8,padding:"10px 12px",marginBottom:6,cursor:"pointer",opacity:done?0.6:1}}>
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${done?"#4ade80":"rgba(255,255,255,0.2)"}`,background:done?"#4ade80":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:done?"#052e16":"#475569",fontWeight:700,flexShrink:0,marginTop:1}}>
                    {done?"✓":""}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                      <span style={{fontSize:10,fontWeight:700,color:"#60a5fa",minWidth:36}}>{step.t}</span>
                      <span style={{fontSize:12,fontWeight:done?400:600,color:"#F1F5F9",textDecoration:done?"line-through":"none"}}>{step.label}</span>
                      <span style={{fontSize:9,color:"#475569",marginLeft:"auto"}}>{step.owner}</span>
                    </div>
                    <div style={{fontSize:11,color:"#64748b",paddingLeft:44}}>{step.note}</div>
                    <a href={step.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:9,color:"#00C896",paddingLeft:44,display:"block",marginTop:2,textDecoration:"none",fontFamily:"monospace"}}>{step.url} ↗</a>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick links */}
          <div style={{marginTop:14,padding:"12px",background:"rgba(0,200,150,0.06)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:9}}>
            <div style={{fontSize:10,fontWeight:700,color:"#00C896",marginBottom:8}}>Quick Links — Open Before Demo</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {[["CRM Dashboard","/dashboard"],["Pipeline Viz","/pipeline"],["Atrium Hub","/atrium"],["Beta Signup","/beta"],["API Status","/dashboard?view=api"],["Health Check","/api/health"]].map(([label,url])=>(
                <a key={url} href={url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#94a3b8",padding:"5px 8px",background:"rgba(255,255,255,0.04)",borderRadius:5,textDecoration:"none",display:"flex",justifyContent:"space-between"}}>
                  <span>{label}</span><span style={{color:"#475569",fontSize:10,fontFamily:"monospace"}}>{url}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
