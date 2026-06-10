import { NextResponse } from "next/server";

interface RouteCheck { name:string; path:string; status:"pass"|"fail"; ms:number; preview?:string; error?:string; }

async function checkRoute(name:string, path:string, payload:any): Promise<RouteCheck> {
  const start = Date.now();
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${base}${path}`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload),
      signal:AbortSignal.timeout(8000),
    });
    const data = await res.json();
    const ms = Date.now()-start;
    if(data.error) return {name,path,status:"fail",ms,error:data.error};
    const preview = data.message||data.report||data.answer||data.personalized||
      (data.overall ? `Score: ${data.overall}/100` : null) ||
      JSON.stringify(data).slice(0,80);
    return {name,path,status:"pass",ms,preview};
  } catch(e:any) {
    return {name,path,status:"fail",ms:Date.now()-start,error:e.message};
  }
}

export async function GET() {
  const sampleContact = {name:"Marcus Rodriguez",company:"Storm Shield Roofing",vertical:"construction",title:"Owner"};

  const [score,report,query,personalize,agent,atlas,quoteAgent,financial,erp] = await Promise.allSettled([
    checkRoute("Lead Scoring","/api/score",{contact:sampleContact,vertical:"construction"}),
    checkRoute("Intelligence Report","/api/report",{contacts:[sampleContact],deals:[{title:"Roof Job",value:11200,stage:"Contract Signed"}],vertical:"construction",companyName:"Storm Shield Roofing"}),
    checkRoute("NL Query","/api/query",{question:"Who should I call today?",contacts:[sampleContact],deals:[],vertical:"construction"}),
    checkRoute("Personalize","/api/personalize",{content:"Follow up on the roofing estimate.",contact:sampleContact,vertical:"construction"}),
    checkRoute("Atrium Agents","/api/agents",{agentId:"maven",messages:[{role:"user",content:"Hi, I run a roofing company in Tampa."}],vertical:"construction"}),
    checkRoute("Atlas Onboarding","/api/atlas",{messages:[{role:"user",content:"Help me set up my sales pipeline."}],vertical:"construction"}),
    checkRoute("Quote Agent","/api/quote-agent",{messages:[{role:"user",content:"I need to quote a roof replacement."}],docType:"quote",vertical:"construction"}),
    checkRoute("Financial Atlas","/api/financial",{messages:[{role:"user",content:"How is my cash flow?"}],analysisType:"chat",financialData:{revenue:102400,expenses:71200}}),
    checkRoute("ERP Estimator","/api/erp-agent",{agentType:"estimator",messages:[{role:"user",content:"Estimate a commercial HVAC job."}]}),
  ]);

  const results = [score,report,query,personalize,agent,atlas,quoteAgent,financial,erp].map(r=>
    r.status==="fulfilled" ? r.value : {name:"Unknown",path:"",status:"fail" as const,ms:0,error:"Promise rejected"}
  );

  const passing = results.filter(r=>r.status==="pass").length;
  const failing = results.filter(r=>r.status==="fail").length;
  const apiKey = !!process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    summary: { total:results.length, passing, failing, apiKeySet:apiKey },
    demoReady: failing===0 && apiKey,
    results,
  });
}
