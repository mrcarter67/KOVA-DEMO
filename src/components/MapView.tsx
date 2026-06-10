"use client";
import { useState, useEffect } from "react";
import { CONTACTS, COMPANIES, VERTICAL_CONFIG } from "@/lib/data";

// Geocoded locations for demo companies and contacts
const LOCATIONS = [
  { id:"c1", type:"company", name:"Apex Realty Group",       industry:"Residential Brokerage",  vertical:"real_estate",   lat:25.7617, lng:-80.1918, city:"Miami, FL",       revenue:"$2.4M",  contacts:3, deals:4 },
  { id:"c2", type:"company", name:"Suncoast Properties",     industry:"Full-Service Brokerage", vertical:"real_estate",   lat:27.9506, lng:-82.4572, city:"Tampa, FL",       revenue:"$5.1M",  contacts:5, deals:7 },
  { id:"c3", type:"company", name:"Clearwater Investments",  industry:"Investment Portfolio",   vertical:"real_estate",   lat:27.9659, lng:-82.8001, city:"Clearwater, FL",  revenue:"$12M",   contacts:2, deals:3 },
  { id:"c4", type:"company", name:"Okafor Family Medicine",  industry:"Primary Care",           vertical:"healthcare",    lat:41.8781, lng:-87.6298, city:"Chicago, IL",     revenue:"$3.2M",  contacts:2, deals:2 },
  { id:"c5", type:"company", name:"Sunrise Dental Group",    industry:"Dental Multi-Location",  vertical:"healthcare",    lat:32.7767, lng:-96.797,  city:"Dallas, TX",      revenue:"$8.4M",  contacts:3, deals:3 },
  { id:"c6", type:"company", name:"Coastal Behavioral Health",industry:"Behavioral Health",     vertical:"healthcare",    lat:27.9478, lng:-82.458,  city:"Tampa, FL",       revenue:"$1.9M",  contacts:2, deals:1 },
  { id:"c7", type:"company", name:"Harmon Industrial Supply", industry:"Industrial Supply",     vertical:"manufacturing", lat:41.4993, lng:-81.6944, city:"Cleveland, OH",   revenue:"$14M",   contacts:2, deals:2 },
  { id:"c8", type:"company", name:"Pacific Fabrication Co",   industry:"Metal Fabrication",     vertical:"manufacturing", lat:45.5152, lng:-122.678, city:"Portland, OR",    revenue:"$24M",   contacts:3, deals:4 },
  { id:"c9", type:"company", name:"Apex Composite Materials", industry:"Aerospace Composites",  vertical:"manufacturing", lat:41.7658, lng:-72.6734, city:"Hartford, CT",    revenue:"$6.8M",  contacts:2, deals:1 },
  // Individual contacts
  { id:"p1", type:"contact", name:"Sarah Mitchell",    industry:"Managing Broker",  vertical:"real_estate",   lat:25.78,  lng:-80.18,  city:"Miami, FL",     revenue:"$48.6K LTV", contacts:0, deals:4 },
  { id:"p2", type:"contact", name:"Marcus Jimenez",    industry:"Practice Director",vertical:"healthcare",    lat:32.80,  lng:-96.78,  city:"Dallas, TX",    revenue:"$32K LTV",   contacts:0, deals:3 },
  { id:"p3", type:"contact", name:"Greg Harmon",       industry:"VP Operations",    vertical:"manufacturing", lat:41.52,  lng:-81.68,  city:"Cleveland, OH", revenue:"$168K LTV",  contacts:0, deals:2 },
  { id:"p4", type:"contact", name:"Lisa Chen",         industry:"CFO",              vertical:"manufacturing", lat:45.53,  lng:-122.66, city:"Portland, OR",  revenue:"$72K LTV",   contacts:0, deals:4 },
  { id:"p5", type:"contact", name:"David Park",        industry:"Owner",            vertical:"real_estate",   lat:27.97,  lng:-82.46,  city:"Tampa, FL",     revenue:"$22K LTV",   contacts:0, deals:2 },
];

// US bounds for projection
const US_BOUNDS = { minLat:24.5, maxLat:49.5, minLng:-125, maxLng:-66 };

function project(lat:number, lng:number, width:number, height:number) {
  const x = ((lng - US_BOUNDS.minLng) / (US_BOUNDS.maxLng - US_BOUNDS.minLng)) * width;
  const y = ((US_BOUNDS.maxLat - lat) / (US_BOUNDS.maxLat - US_BOUNDS.minLat)) * height;
  return { x, y };
}

const VERT_COLORS: Record<string,string> = {
  real_estate:"#00C896", healthcare:"#3B9EFF", manufacturing:"#A78BFA",
};

export default function MapView({ vertId, onSelectContact }:{ vertId:string; onSelectContact?:(c:any)=>void }) {
  const [filter, setFilter]   = useState<"all"|"company"|"contact">("all");
  const [vertFilter, setVertFilter] = useState<string>("all");
  const [hoverId, setHoverId] = useState<string|null>(null);
  const [selected, setSelected] = useState<typeof LOCATIONS[0]|null>(null);
  const [mapW, setMapW] = useState(720);
  const [mapH, setMapH] = useState(420);

  const filtered = LOCATIONS.filter(l => {
    if(filter !== "all" && l.type !== filter) return false;
    if(vertFilter !== "all" && l.vertical !== vertFilter) return false;
    return true;
  });

  const companies = filtered.filter(l=>l.type==="company");
  const contacts  = filtered.filter(l=>l.type==="contact");

  const totalRevenue = companies.reduce((a,c) => {
    const num = parseFloat(c.revenue.replace(/[$M,K]/g,""));
    return a + (c.revenue.includes("M") ? num*1000000 : c.revenue.includes("K") ? num*1000 : num);
  }, 0);

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#0F172A"}}>Contact & Business Map</div>
          <div style={{fontSize:11,color:"#64748B",marginTop:1}}>{companies.length} companies · {contacts.length} contacts · across {new Set(filtered.map(l=>l.city)).size} cities</div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {(["all","company","contact"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{fontSize:10,padding:"4px 10px",borderRadius:99,border:`1px solid ${filter===f?"#0F172A":"#E2E8F0"}`,background:filter===f?"#0F172A":"#F8FAFC",color:filter===f?"#fff":"#64748B",cursor:"pointer",fontWeight:filter===f?600:400,textTransform:"capitalize"}}>{f==="all"?"All":f==="company"?"Companies":"Contacts"}</button>
          ))}
        </div>
      </div>

      {/* Vertical filter */}
      <div style={{display:"flex",gap:4,marginBottom:10}}>
        <button onClick={()=>setVertFilter("all")} style={{fontSize:10,padding:"3px 10px",borderRadius:99,border:`1px solid ${vertFilter==="all"?"#0F172A":"#E2E8F0"}`,background:vertFilter==="all"?"#0F172A":"#fff",color:vertFilter==="all"?"#fff":"#64748B",cursor:"pointer"}}>All Verticals</button>
        {[["real_estate","Real Estate","#00C896"],["healthcare","Healthcare","#3B9EFF"],["manufacturing","Manufacturing","#A78BFA"]].map(([id,label,color])=>(
          <button key={id} onClick={()=>setVertFilter(id)} style={{fontSize:10,padding:"3px 10px",borderRadius:99,border:`1px solid ${vertFilter===id?color:"#E2E8F0"}`,background:vertFilter===id?color+"15":"#fff",color:vertFilter===id?color:"#64748B",cursor:"pointer",fontWeight:vertFilter===id?600:400}}>
            <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:color,marginRight:4}} />{label}
          </button>
        ))}
      </div>

      {/* Map area */}
      <div style={{position:"relative",background:"#0F172A",borderRadius:12,overflow:"hidden",height:mapH,marginBottom:10}}>
        {/* Grid lines */}
        {[0.2,0.4,0.6,0.8].map(p=>(
          <div key={"h"+p} style={{position:"absolute",top:`${p*100}%`,left:0,right:0,height:1,background:"rgba(255,255,255,0.04)"}} />
        ))}
        {[0.2,0.4,0.6,0.8].map(p=>(
          <div key={"v"+p} style={{position:"absolute",left:`${p*100}%`,top:0,bottom:0,width:1,background:"rgba(255,255,255,0.04)"}} />
        ))}

        {/* Location dots */}
        {filtered.map(loc => {
          const {x,y} = project(loc.lat, loc.lng, mapW, mapH);
          const color = VERT_COLORS[loc.vertical] || "#64748B";
          const isCompany = loc.type === "company";
          const isHovered = hoverId === loc.id;
          const isSelected = selected?.id === loc.id;
          const size = isCompany ? (isHovered||isSelected ? 18 : 12) : (isHovered||isSelected ? 14 : 8);

          return (
            <div key={loc.id}
              onMouseEnter={()=>setHoverId(loc.id)}
              onMouseLeave={()=>setHoverId(null)}
              onClick={()=>setSelected(selected?.id===loc.id?null:loc)}
              style={{
                position:"absolute",
                left:x-size/2, top:y-size/2,
                width:size, height:size,
                borderRadius:"50%",
                background:color,
                border:`2px solid ${isSelected?"#fff":isHovered?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.2)"}`,
                cursor:"pointer",
                transition:"all 0.15s",
                zIndex:isHovered||isSelected?10:isCompany?5:1,
                boxShadow:isHovered||isSelected?`0 0 12px ${color}88`:"none",
              }}
            >
              {/* Tooltip */}
              {(isHovered || isSelected) && (
                <div style={{
                  position:"absolute",
                  bottom:size+8, left:"50%", transform:"translateX(-50%)",
                  background:"#fff", borderRadius:8, padding:"8px 12px",
                  whiteSpace:"nowrap", boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
                  zIndex:20, minWidth:180,
                }}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}} />
                    <span style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{loc.name}</span>
                  </div>
                  <div style={{fontSize:10,color:"#64748B",marginBottom:2}}>{loc.industry} · {loc.city}</div>
                  <div style={{display:"flex",gap:10,fontSize:10}}>
                    <span style={{color:color,fontWeight:700}}>{loc.revenue}</span>
                    {isCompany && <span style={{color:"#94A3B8"}}>{loc.contacts} contacts · {loc.deals} deals</span>}
                    {!isCompany && <span style={{color:"#94A3B8"}}>{loc.deals} deals</span>}
                  </div>
                  {/* Arrow */}
                  <div style={{position:"absolute",bottom:-5,left:"50%",width:10,height:10,background:"#fff",transform:"translateX(-50%) rotate(45deg)",boxShadow:"2px 2px 4px rgba(0,0,0,0.1)"}} />
                </div>
              )}

              {/* Pulse ring for companies */}
              {isCompany && !isHovered && !isSelected && (
                <div style={{position:"absolute",inset:-4,borderRadius:"50%",border:`1px solid ${color}44`,animation:"mapPulse 2s ease-in-out infinite"}} />
              )}
            </div>
          );
        })}

        {/* Map legend */}
        <div style={{position:"absolute",bottom:10,left:10,background:"rgba(15,23,42,0.9)",borderRadius:8,padding:"8px 12px",display:"flex",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#64748B",border:"2px solid rgba(255,255,255,0.3)"}} />
            <span style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>Company</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#64748B",border:"1px solid rgba(255,255,255,0.3)"}} />
            <span style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>Contact</span>
          </div>
          {Object.entries(VERT_COLORS).map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:v}} />
              <span style={{fontSize:9,color:"rgba(255,255,255,0.5)",textTransform:"capitalize"}}>{k.replace("_"," ")}</span>
            </div>
          ))}
        </div>

        {/* Stats overlay */}
        <div style={{position:"absolute",top:10,right:10,background:"rgba(15,23,42,0.9)",borderRadius:8,padding:"8px 12px"}}>
          <div style={{display:"flex",gap:12}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:700,color:"#00C896"}}>{companies.length}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>Companies</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:700,color:"#3B9EFF"}}>{contacts.length}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>Contacts</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:700,color:"#F59E0B"}}>{new Set(filtered.map(l=>l.city)).size}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>Cities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected detail card */}
      {selected && (
        <div style={{background:"#fff",border:`1px solid ${VERT_COLORS[selected.vertical]}44`,borderRadius:10,padding:"14px 16px",marginBottom:10,borderLeft:`3px solid ${VERT_COLORS[selected.vertical]}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                <span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:VERT_COLORS[selected.vertical]+"15",color:VERT_COLORS[selected.vertical],fontWeight:600,textTransform:"capitalize"}}>{selected.type}</span>
                <span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:VERT_COLORS[selected.vertical]+"15",color:VERT_COLORS[selected.vertical],fontWeight:600}}>{selected.vertical.replace("_"," ")}</span>
              </div>
              <div style={{fontSize:16,fontWeight:700,color:"#0F172A",marginBottom:2}}>{selected.name}</div>
              <div style={{fontSize:12,color:"#64748B"}}>{selected.industry} · {selected.city}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:20,fontWeight:700,color:VERT_COLORS[selected.vertical]}}>{selected.revenue}</div>
              {selected.type==="company" && <div style={{fontSize:11,color:"#94A3B8"}}>{selected.contacts} contacts · {selected.deals} deals</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginTop:10}}>
            <button style={{flex:1,padding:"7px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>{selected.type==="company"?"View Company":"View Contact"}</button>
            <button style={{flex:1,padding:"7px",background:VERT_COLORS[selected.vertical]+"15",color:VERT_COLORS[selected.vertical],border:`1px solid ${VERT_COLORS[selected.vertical]}44`,borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>Create Deal</button>
            <button onClick={()=>setSelected(null)} style={{padding:"7px 12px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:6,fontSize:11,color:"#64748B",cursor:"pointer"}}>✕</button>
          </div>
        </div>
      )}

      {/* City breakdown table */}
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:9,overflow:"hidden"}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em"}}>By Location</div>
        {Object.entries(
          filtered.reduce((acc, loc) => {
            if(!acc[loc.city]) acc[loc.city] = {companies:0,contacts:0,deals:0};
            if(loc.type==="company") { acc[loc.city].companies++; acc[loc.city].deals += loc.deals; }
            else acc[loc.city].contacts++;
            return acc;
          }, {} as Record<string,{companies:number,contacts:number,deals:number}>)
        ).sort((a,b) => (b[1].companies+b[1].contacts) - (a[1].companies+a[1].contacts)).map(([city, data]) => (
          <div key={city} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderBottom:"1px solid #F8FAFC"}}>
            <span style={{fontSize:12,fontWeight:600,color:"#0F172A",flex:1}}>📍 {city}</span>
            {data.companies>0 && <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"#F1F5F9",color:"#64748B"}}>{data.companies} {data.companies===1?"company":"companies"}</span>}
            {data.contacts>0 && <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"#F1F5F9",color:"#64748B"}}>{data.contacts} {data.contacts===1?"contact":"contacts"}</span>}
            <span style={{fontSize:10,color:"#94A3B8"}}>{data.deals} deals</span>
          </div>
        ))}
      </div>

      <style>{`@keyframes mapPulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:0;transform:scale(2)}}`}</style>
    </div>
  );
}
