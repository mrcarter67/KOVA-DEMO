"use client";
import { useState } from "react";

const VERTICALS = [
  { id:"real_estate",         label:"Real Estate",           icon:"🏠" },
  { id:"construction",        label:"Construction & Trades",  icon:"🔨" },
  { id:"healthcare",          label:"Healthcare",             icon:"🏥" },
  { id:"professional_services",label:"Professional Services", icon:"💼" },
  { id:"manufacturing",       label:"Manufacturing",          icon:"🏭" },
  { id:"home_services",       label:"Home Services",          icon:"🛠️" },
  { id:"restaurant",          label:"Restaurant & Hospitality",icon:"🍽️" },
  { id:"retail",              label:"Retail",                 icon:"🛍️" },
  { id:"technology",          label:"Technology",             icon:"💻" },
  { id:"fitness",             label:"Fitness & Wellness",     icon:"💪" },
  { id:"beauty",              label:"Beauty & Salon",         icon:"✂️" },
  { id:"auto",                label:"Auto Services",          icon:"🚗" },
];

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    color: "#64748B",
    features: ["1 user","Up to 100 contacts","1 vertical","20 AI scores/month","Maven agent only"],
    cta: "Start Free",
  },
  {
    id: "growth",
    name: "Growth",
    price: "$97",
    period: "/month",
    color: "#00C896",
    badge: "MOST POPULAR",
    features: ["5 users","Unlimited contacts","All 12 verticals","Unlimited AI scoring","All 8 Atrium agents","Agent-guided quoting","Financial hub"],
    cta: "Start Growth",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$297",
    period: "/month",
    color: "#3B9EFF",
    features: ["Unlimited users","Unlimited contacts","All 12 verticals","All 8 agents + ERP","Private AI (Llama 4)","Custom branding","Priority support"],
    cta: "Start Pro",
  },
];

export default function BetaSignup() {
  const [step, setStep] = useState<"landing"|"form"|"success">("landing");
  const [selectedTier, setSelectedTier] = useState("growth");
  const [selectedVertical, setSelectedVertical] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    firstName:"", lastName:"", email:"", company:"", phone:"", role:"",
  });

  const updateForm = (k:string, v:string) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!form.email || !form.company || !selectedVertical) {
      setError("Please fill in your email, company name, and select your industry.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/beta-signup", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, vertical:selectedVertical, tier:selectedTier }),
      });
      const data = await res.json();
      if (data.success) { setResult(data); setStep("success"); }
      else setError(data.error || "Something went wrong. Please try again.");
    } catch { setError("Connection error. Please try again."); }
    setLoading(false);
  };

  const tier = TIERS.find(t=>t.id===selectedTier)!;

  // ── LANDING ────────────────────────────────────────────────────────────────
  if (step === "landing") return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#0B1628",minHeight:"100vh",color:"#F1F5F9"}}>
      {/* Header */}
      <div style={{padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#00C896,#3B9EFF)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#fff"}}>K</div>
          <span style={{fontWeight:700,fontSize:16,color:"#F1F5F9"}}>KOVA</span>
          <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"rgba(0,200,150,0.15)",color:"#00C896",fontWeight:600}}>BETA</span>
        </div>
        <button onClick={()=>setStep("form")} style={{padding:"8px 18px",background:"#00C896",color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
          Get Early Access →
        </button>
      </div>

      {/* Hero */}
      <div style={{maxWidth:860,margin:"0 auto",padding:"60px 24px 40px",textAlign:"center"}}>
        <div style={{fontSize:11,letterSpacing:"3px",color:"#00C896",textTransform:"uppercase",marginBottom:14,fontWeight:600}}>
          Atrium × KOVA Beta Program
        </div>
        <h1 style={{fontSize:42,fontWeight:800,lineHeight:1.15,margin:"0 0 18px",color:"#F1F5F9"}}>
          Your business finally gets<br />
          <span style={{background:"linear-gradient(135deg,#00C896,#3B9EFF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>a real marketing and CRM team.</span>
        </h1>
        <p style={{fontSize:17,color:"#94A3B8",lineHeight:1.7,maxWidth:580,margin:"0 auto 36px"}}>
          8 AI marketing specialists plus an AI-native CRM that guides your quoting, estimating, and invoicing — built for small businesses that have been left behind.
        </p>
        <button onClick={()=>setStep("form")} style={{padding:"14px 36px",background:"linear-gradient(135deg,#00C896,#059669)",color:"#fff",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 24px rgba(0,200,150,0.4)"}}>
          Join the Beta — It's Free to Start
        </button>
        <div style={{fontSize:12,color:"#475569",marginTop:10}}>No credit card required · Set up in minutes · Cancel anytime</div>
      </div>

      {/* Features row */}
      <div style={{maxWidth:900,margin:"0 auto",padding:"0 24px 60px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {[
          ["🧠 8 AI Agents","Maven, Iris, Dash, Poppy, Sage, Echo, Stella, and Atlas — each one a specialist that works your business every day."],
          ["📋 Quotes That Close","Tell the agent what the project is. Quote builds itself. E-sign. Payment. Invoice auto-generated."],
          ["📊 Daily Intelligence","Atlas writes your Monday briefing. Flags what's growing, what's at risk, and exactly what to do."],
        ].map(([title,desc])=>(
          <div key={title as string} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"20px"}}>
            <div style={{fontSize:20,marginBottom:8}}>{(title as string).split(" ")[0]}</div>
            <div style={{fontSize:13,fontWeight:600,color:"#F1F5F9",marginBottom:6}}>{(title as string).slice(3)}</div>
            <div style={{fontSize:12,color:"#64748B",lineHeight:1.6}}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div style={{maxWidth:960,margin:"0 auto",padding:"0 24px 80px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:24,fontWeight:700,color:"#F1F5F9"}}>Beta Pricing</div>
          <div style={{fontSize:13,color:"#64748B",marginTop:6}}>Lock in beta rates — pricing increases at full launch</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {TIERS.map(t=>(
            <div key={t.id} onClick={()=>{setSelectedTier(t.id);setStep("form");}} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${t.id===selectedTier?t.color:"rgba(255,255,255,0.08)"}`,borderRadius:14,padding:"24px",cursor:"pointer",position:"relative",transition:"all 0.2s"}}>
              {t.badge && <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",fontSize:9,fontWeight:700,background:t.color,color:"#fff",padding:"3px 10px",borderRadius:99}}>{t.badge}</div>}
              <div style={{fontSize:12,fontWeight:600,color:t.color,marginBottom:6}}>{t.name}</div>
              <div style={{fontSize:28,fontWeight:800,color:"#F1F5F9"}}>{t.price}<span style={{fontSize:13,color:"#64748B",fontWeight:400}}>{t.period}</span></div>
              <div style={{height:1,background:"rgba(255,255,255,0.07)",margin:"14px 0"}} />
              {t.features.map(f=>(
                <div key={f} style={{display:"flex",gap:6,fontSize:12,color:"#94A3B8",marginBottom:6,alignItems:"center"}}>
                  <span style={{color:t.color}}>✓</span>{f}
                </div>
              ))}
              <button style={{width:"100%",marginTop:16,padding:"10px",background:t.id==="growth"?t.color:"transparent",border:`1px solid ${t.color}`,borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",color:t.id==="growth"?"#fff":t.color}}>
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── FORM ───────────────────────────────────────────────────────────────────
  if (step === "form") return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#0B1628",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:520,background:"#0F172A",borderRadius:16,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{background:"linear-gradient(135deg,#00C89618,#3B9EFF10)",padding:"24px 28px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:11,color:"#00C896",fontWeight:600,textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>
            {TIERS.find(t=>t.id===selectedTier)?.badge || selectedTier.toUpperCase()} TIER
          </div>
          <div style={{fontSize:20,fontWeight:700,color:"#F1F5F9"}}>Get Early Access to KOVA</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>Join the beta · First 50 companies get locked-in pricing</div>
        </div>

        <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:14}}>
          {/* Tier selector */}
          <div>
            <label style={{fontSize:11,color:"#64748B",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:7}}>Plan</label>
            <div style={{display:"flex",gap:6}}>
              {TIERS.map(t=>(
                <button key={t.id} onClick={()=>setSelectedTier(t.id)} style={{flex:1,padding:"7px 4px",borderRadius:7,border:`1px solid ${selectedTier===t.id?t.color:"rgba(255,255,255,0.1)"}`,background:selectedTier===t.id?t.color+"18":"transparent",color:selectedTier===t.id?t.color:"#64748B",fontSize:11,fontWeight:selectedTier===t.id?700:400,cursor:"pointer"}}>
                  {t.name} {t.id==="free"?"· $0":t.id==="growth"?"· $97":"· $297"}
                </button>
              ))}
            </div>
          </div>

          {/* Name row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["firstName","First name"],["lastName","Last name"]].map(([k,pl])=>(
              <div key={k}>
                <input value={(form as any)[k]} onChange={e=>updateForm(k,e.target.value)} placeholder={pl}
                  style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:13,color:"#F1F5F9",outline:"none"}} />
              </div>
            ))}
          </div>

          {/* Email */}
          <input value={form.email} onChange={e=>updateForm("email",e.target.value)} placeholder="Work email *" type="email"
            style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:13,color:"#F1F5F9",outline:"none"}} />

          {/* Company + Role */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <input value={form.company} onChange={e=>updateForm("company",e.target.value)} placeholder="Company name *"
              style={{padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:13,color:"#F1F5F9",outline:"none"}} />
            <input value={form.role} onChange={e=>updateForm("role",e.target.value)} placeholder="Your role"
              style={{padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:13,color:"#F1F5F9",outline:"none"}} />
          </div>

          {/* Vertical */}
          <div>
            <label style={{fontSize:11,color:"#64748B",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:7}}>Your Industry *</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
              {VERTICALS.map(v=>(
                <button key={v.id} onClick={()=>setSelectedVertical(v.id)} style={{padding:"7px 6px",borderRadius:7,border:`1px solid ${selectedVertical===v.id?"#00C896":"rgba(255,255,255,0.08)"}`,background:selectedVertical===v.id?"rgba(0,200,150,0.12)":"transparent",color:selectedVertical===v.id?"#00C896":"#64748B",fontSize:10,fontWeight:selectedVertical===v.id?600:400,cursor:"pointer",textAlign:"center"}}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{padding:"9px 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:7,fontSize:12,color:"#FCA5A5"}}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{padding:"13px",background:loading?"#334155":"linear-gradient(135deg,#00C896,#059669)",color:"#fff",border:"none",borderRadius:9,fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",marginTop:4}}>
            {loading ? "Submitting…" : `Request ${TIERS.find(t=>t.id===selectedTier)?.name} Access →`}
          </button>
          <div style={{fontSize:11,color:"#475569",textAlign:"center"}}>No credit card required · Onboarding within 24 hours</div>
        </div>
      </div>
    </div>
  );

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#0B1628",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{maxWidth:480,textAlign:"center"}}>
        <div style={{width:64,height:64,background:"linear-gradient(135deg,#00C896,#059669)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 20px"}}>✓</div>
        <h1 style={{fontSize:26,fontWeight:700,color:"#F1F5F9",marginBottom:10}}>You're in.</h1>
        <p style={{fontSize:15,color:"#94A3B8",lineHeight:1.7,marginBottom:24}}>
          Welcome to the KOVA beta, <strong style={{color:"#F1F5F9"}}>{form.firstName || form.company}</strong>. Your spot is confirmed. We'll have you set up and your agents running within 24 hours.
        </p>
        <div style={{background:"rgba(0,200,150,0.08)",border:"1px solid rgba(0,200,150,0.2)",borderRadius:12,padding:"16px 20px",marginBottom:24}}>
          <div style={{fontSize:11,color:"#00C896",fontWeight:700,marginBottom:6}}>Your Registration ID</div>
          <div style={{fontSize:18,fontFamily:"monospace",color:"#F1F5F9",fontWeight:700}}>{result?.id}</div>
          <div style={{fontSize:11,color:"#475569",marginTop:4}}>{form.email}</div>
        </div>
        <div style={{fontSize:13,color:"#64748B"}}>Questions? Email us at <a href="mailto:hello@kovahq.com" style={{color:"#00C896"}}>hello@kovahq.com</a></div>
        <button onClick={()=>{window.location.href="/";}} style={{marginTop:20,padding:"10px 24px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#94A3B8",fontSize:12,cursor:"pointer"}}>
          See the Platform →
        </button>
      </div>
    </div>
  );
}
