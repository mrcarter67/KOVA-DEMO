"use client";
import Atlas from "@/components/Atlas";

export default function OnboardPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#06090F", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px" }}>
      <div style={{ width:"100%", maxWidth:760 }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:28, fontWeight:800, color:"#F1F5F9", marginBottom:4 }}>KOVA Setup</div>
          <div style={{ fontSize:13, color:"#475569" }}>Complete your account configuration in 2 minutes</div>
        </div>
        <Atlas />
        <div style={{ textAlign:"center", marginTop:14 }}>
          <a href="/dashboard" style={{ fontSize:12, color:"#475569", textDecoration:"none" }}>← Skip to demo dashboard</a>
        </div>
      </div>
    </div>
  );
}
