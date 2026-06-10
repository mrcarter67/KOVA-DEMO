"use client";
import { useState } from "react";
import { BarChart2, Target, RefreshCw, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IE } from "@/lib/icon-mode";

export default function Home() {
  const [hover, setHover] = useState("");
  const items: { href:string; label:string; sub:string; color:string; Icon:LucideIcon; emoji:string }[] = [
    { href:"/dashboard", label:"KOVA CRM",        sub:"Contacts · Pipeline · AI Scoring · Reports", color:"#3B9EFF", Icon:BarChart2, emoji:"📊" },
    { href:"/atrium",    label:"Atrium",           sub:"Your marketing team · 8 AI specialists",    color:"#00C8A0", Icon:Target,   emoji:"🎯" },
    { href:"/pipeline",  label:"Data Pipeline",    sub:"9-stage animated data flow",                color:"#A78BFA", Icon:RefreshCw, emoji:"🔄" },
    { href:"/onboard",   label:"Atlas Onboarding", sub:"AI-guided client setup",                    color:"#F59E0B", Icon:Zap,      emoji:"⚡" },
  ];
  return (
    <div style={{minHeight:"100vh",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:20}}>
      <div style={{maxWidth:520,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:42,fontWeight:800,color:"#F1F5F9",letterSpacing:"-1px",marginBottom:8}}>KOVA</div>
          <div style={{fontSize:14,color:"#64748B"}}>AI-Native CRM · Powered by Claude</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {items.map(item=>(
            <a key={item.href} href={item.href} style={{textDecoration:"none"}}
              onMouseEnter={()=>setHover(item.href)} onMouseLeave={()=>setHover("")}>
              <div style={{background:hover===item.href?"#1E293B":"#0D1520",border:`1px solid ${hover===item.href?item.color+"55":"#1E293B"}`,borderLeft:`3px solid ${item.color}`,borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,transition:"all .15s"}}>
                <div style={{flexShrink:0,display:"flex",alignItems:"center"}}><IE emoji={item.emoji} Icon={item.Icon} size={22} color={item.color} /></div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#F1F5F9"}}>{item.label}</div>
                  <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{item.sub}</div>
                </div>
                <div style={{marginLeft:"auto",color:item.color,fontSize:16}}>→</div>
              </div>
            </a>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"#334155"}}>kova-demof.vercel.app · Built with Claude API</div>
      </div>
    </div>
  );
}
