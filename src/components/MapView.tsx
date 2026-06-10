"use client";
import { useState, useEffect, useRef } from "react";
import { useToast, ToastContainer } from "@/components/ui/toast";
import { User, MapPin, X } from "lucide-react";
import { IE } from "@/lib/icon-mode";

const LOCATIONS = [
  { id:"c1", type:"company", name:"Apex Realty Group",        industry:"Residential Brokerage",  vertical:"real_estate",   lat:25.7617, lng:-80.1918, city:"Miami, FL",       revenue:"$2.41M", contacts:3, deals:4 },
  { id:"c2", type:"company", name:"Suncoast Properties",      industry:"Full-Service Brokerage", vertical:"real_estate",   lat:27.9506, lng:-82.4572, city:"Tampa, FL",       revenue:"$5.18M", contacts:5, deals:7 },
  { id:"c3", type:"company", name:"Clearwater Investments",   industry:"Investment Portfolio",   vertical:"real_estate",   lat:27.9659, lng:-82.8001, city:"Clearwater, FL",  revenue:"$12.3M", contacts:2, deals:3 },
  { id:"c4", type:"company", name:"Okafor Family Medicine",   industry:"Primary Care",           vertical:"healthcare",    lat:41.8781, lng:-87.6298, city:"Chicago, IL",     revenue:"$3.24M", contacts:2, deals:2 },
  { id:"c5", type:"company", name:"Sunrise Dental Group",     industry:"Dental Multi-Location",  vertical:"healthcare",    lat:32.7767, lng:-96.7970, city:"Dallas, TX",      revenue:"$8.47M", contacts:3, deals:3 },
  { id:"c6", type:"company", name:"Coastal Behavioral Health",industry:"Behavioral Health",      vertical:"healthcare",    lat:27.9478, lng:-82.4580, city:"Tampa, FL",       revenue:"$1.92M", contacts:2, deals:1 },
  { id:"c7", type:"company", name:"Harmon Industrial Supply", industry:"Industrial Supply",      vertical:"manufacturing", lat:41.4993, lng:-81.6944, city:"Cleveland, OH",   revenue:"$14.2M", contacts:2, deals:2 },
  { id:"c8", type:"company", name:"Pacific Fabrication Co",   industry:"Metal Fabrication",      vertical:"manufacturing", lat:45.5152, lng:-122.678, city:"Portland, OR",    revenue:"$24.8M", contacts:3, deals:4 },
  { id:"c9", type:"company", name:"Apex Composite Materials", industry:"Aerospace Composites",   vertical:"manufacturing", lat:41.7658, lng:-72.6734, city:"Hartford, CT",    revenue:"$6.84M", contacts:2, deals:1 },
  { id:"p1", type:"contact", name:"Sarah Mitchell",    industry:"Managing Broker",   vertical:"real_estate",   lat:25.78,  lng:-80.18,  city:"Miami, FL",     revenue:"$48.6K LTV", contacts:0, deals:4 },
  { id:"p2", type:"contact", name:"Marcus Jimenez",    industry:"Managing Partner", vertical:"healthcare",    lat:32.80,  lng:-96.78,  city:"Dallas, TX",    revenue:"$134K LTV",  contacts:0, deals:3 },
  { id:"p3", type:"contact", name:"Greg Harmon",       industry:"VP Procurement",   vertical:"manufacturing", lat:41.52,  lng:-81.68,  city:"Cleveland, OH", revenue:"$142.6K LTV",contacts:0, deals:2 },
  { id:"p4", type:"contact", name:"Dr. Linda Okafor",  industry:"Practice Owner",   vertical:"healthcare",    lat:41.88,  lng:-87.63,  city:"Chicago, IL",   revenue:"$42K LTV",   contacts:0, deals:2 },
  { id:"p5", type:"contact", name:"James Patel",       industry:"Purchasing Director",vertical:"manufacturing", lat:41.77,  lng:-72.67,  city:"Hartford, CT",  revenue:"$56K LTV",   contacts:0, deals:1 },
];

const VERT_COLORS: Record<string,string> = {
  real_estate:"#00C896", healthcare:"#3B9EFF", manufacturing:"#F59E0B",
};

type Loc = typeof LOCATIONS[0];

export default function MapView({ vertId, onSelectContact }:{ vertId:string; onSelectContact?:(c:Loc)=>void }) {
  const [filter, setFilter]         = useState<"all"|"company"|"contact">("all");
  const [vertFilter, setVertFilter] = useState<string>(vertId || "all");
  const [leafletReady, setLeafletReady] = useState(false);
  const [selected, setSelected]     = useState<Loc|null>(null);
  const { toast, toasts, dismiss }  = useToast();
  const mapDivRef  = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markers    = useRef<any[]>([]);

  const filtered = LOCATIONS.filter(l => {
    if (filter !== "all" && l.type !== filter) return false;
    if (vertFilter !== "all" && l.vertical !== vertFilter) return false;
    return true;
  });
  const companies = filtered.filter(l => l.type === "company");
  const contacts  = filtered.filter(l => l.type === "contact");

  useEffect(() => {
    setVertFilter(vertId || "all");
  }, [vertId]);

  // Load Leaflet CSS + JS from CDN once
  useEffect(() => {
    if ((window as any).L) { setLeafletReady(true); return; }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map once Leaflet is ready
  useEffect(() => {
    if (!leafletReady || !mapDivRef.current || leafletMap.current) return;
    const L = (window as any).L;
    const map = L.map(mapDivRef.current, { center:[39.5,-98.35], zoom:4, zoomControl:true });
    // Inject CSS to give tiles a navy-blue tint
    if (!document.getElementById("kova-tile-navy")) {
      const st = document.createElement("style");
      st.id = "kova-tile-navy";
      st.textContent = ".kova-navy-tile { filter: hue-rotate(200deg) saturate(4) brightness(0.8); }";
      document.head.appendChild(st);
    }
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { attribution:'© <a href="https://openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>', subdomains:"abcd", maxZoom:19, className:"kova-navy-tile" }
    ).addTo(map);
    // US states overlay — green fill on dark background
    fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json")
      .then(r => r.json())
      .then(data => {
        if (!leafletMap.current) return;
        L.geoJSON(data, {
          interactive: false,
          style: {
            fillColor: "#00C896",
            fillOpacity: 0.08,
            color: "#00C896",
            weight: 0.8,
            opacity: 0.4,
          }
        }).addTo(map);
      })
      .catch(() => {});
    leafletMap.current = map;
    return () => { map.remove(); leafletMap.current = null; };
  }, [leafletReady]);

  // Sync markers whenever map or filters change
  useEffect(() => {
    const L = (window as any).L;
    const map = leafletMap.current;
    if (!L || !map) return;

    const addMarkers = () => {
      markers.current.forEach(m => m.remove());
      markers.current = [];
      filtered.forEach(loc => {
        const color = VERT_COLORS[loc.vertical] || "#94A3B8";
        const isCompany = loc.type === "company";
        const marker = L.circleMarker([loc.lat, loc.lng], {
          radius: isCompany ? 11 : 7,
          fillColor: color,
          color: "rgba(255,255,255,0.55)",
          weight: 2,
          fillOpacity: 0.85,
        });
        marker.bindPopup(`
          <div style="font-family:system-ui,-apple-system,sans-serif;padding:2px;min-width:170px">
            <div style="font-size:13px;font-weight:700;color:#0F172A;margin-bottom:3px">${loc.name}</div>
            <div style="font-size:11px;color:#64748B;margin-bottom:6px">${loc.industry} · ${loc.city}</div>
            <span style="font-size:14px;font-weight:700;color:${color}">${loc.revenue}</span>
            <span style="font-size:10px;color:#94A3B8;margin-left:8px">${isCompany ? `${loc.contacts} contacts · ` : ""}${loc.deals} deals</span>
          </div>`, { maxWidth:240 });
        marker.on("click", () => setSelected(loc));
        try { marker.addTo(map); } catch { return; }
        markers.current.push(marker);
      });
    };

    // Guard: wait until the map is fully initialized before placing markers
    if ((map as any)._loaded) {
      addMarkers();
    } else {
      map.once("load", addMarkers);
    }
  }, [leafletReady, filter, vertFilter]);

  const color = selected ? VERT_COLORS[selected.vertical] || "#94A3B8" : "#94A3B8";

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#0F172A"}}>Contact & Business Map</div>
          <div style={{fontSize:11,color:"#64748B",marginTop:1}}>
            {companies.length} companies · {contacts.length} contacts · {new Set(filtered.map(l=>l.city)).size} cities
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {(["all","company","contact"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{fontSize:10,padding:"4px 10px",borderRadius:99,border:`1px solid ${filter===f?"#0F172A":"#E2E8F0"}`,background:filter===f?"#0F172A":"#F8FAFC",color:filter===f?"#fff":"#64748B",cursor:"pointer",fontWeight:filter===f?600:400,textTransform:"capitalize"}}>
              {f==="all"?"All":f==="company"?"Companies":"Contacts"}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical filter */}
      <div style={{display:"flex",gap:4,marginBottom:10}}>
        <button onClick={()=>setVertFilter("all")} style={{fontSize:10,padding:"3px 10px",borderRadius:99,border:`1px solid ${vertFilter==="all"?"#0F172A":"#E2E8F0"}`,background:vertFilter==="all"?"#0F172A":"#fff",color:vertFilter==="all"?"#fff":"#64748B",cursor:"pointer"}}>All Verticals</button>
        {([ ["real_estate","Real Estate","#00C896"], ["healthcare","Healthcare","#3B9EFF"], ["manufacturing","Manufacturing","#A78BFA"] ] as [string,string,string][]).map(([id,label,col])=>(
          <button key={id} onClick={()=>setVertFilter(id)} style={{fontSize:10,padding:"3px 10px",borderRadius:99,border:`1px solid ${vertFilter===id?col:"#E2E8F0"}`,background:vertFilter===id?col+"20":"#fff",color:vertFilter===id?col:"#64748B",cursor:"pointer",fontWeight:vertFilter===id?600:400}}>
            <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:col,marginRight:4,verticalAlign:"middle"}} />{label}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div style={{borderRadius:12,overflow:"hidden",height:400,marginBottom:12,position:"relative",background:"#0A1640"}}>
        {!leafletReady && (
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.35)",fontSize:13,zIndex:1}}>
            Loading map…
          </div>
        )}
        <div ref={mapDivRef} style={{height:"100%",width:"100%"}} />
      </div>

      {/* Selected record card */}
      {selected && (
        <div style={{background:"#fff",border:`1.5px solid ${color}44`,borderRadius:10,padding:"12px 14px",marginBottom:12,display:"flex",gap:12,alignItems:"center"}}>
          <div style={{width:40,height:40,borderRadius:selected.type==="company"?8:"50%",background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color,flexShrink:0}}>
            {selected.type==="company"?selected.name[0]:<IE emoji="👤" Icon={User} size={16} color={color} />}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:"#0F172A"}}>{selected.name}</div>
            <div style={{fontSize:11,color:"#64748B",marginTop:1}}>{selected.industry} · {selected.city}</div>
            <div style={{display:"flex",gap:8,marginTop:3}}>
              <span style={{fontSize:11,fontWeight:700,color}}>{selected.revenue}</span>
              {selected.type==="company" && <span style={{fontSize:10,color:"#94A3B8"}}>{selected.contacts} contacts</span>}
              <span style={{fontSize:10,color:"#94A3B8"}}>{selected.deals} deals</span>
            </div>
          </div>
          <div style={{display:"flex",gap:5,flexShrink:0}}>
            <button onClick={()=>onSelectContact?.(selected)} style={{fontSize:11,padding:"5px 11px",background:"#0F172A",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:600}}>
              {selected.type==="contact"?"View Contact":"View Company"}
            </button>
            <button onClick={()=>toast(`Deal created for ${selected.name}`)} style={{fontSize:11,padding:"5px 11px",background:color+"15",color,border:`1px solid ${color}44`,borderRadius:6,cursor:"pointer",fontWeight:600}}>+ Deal</button>
            <button onClick={()=>setSelected(null)} style={{fontSize:11,padding:"5px 8px",background:"#F8FAFC",color:"#94A3B8",border:"1px solid #E2E8F0",borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center"}}><IE emoji="✕" Icon={X} size={11} /></button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>
        {([ ["real_estate","Real Estate","#00C896"], ["healthcare","Healthcare","#3B9EFF"], ["manufacturing","Manufacturing","#A78BFA"] ] as [string,string,string][]).map(([id,label,col])=>(
          <div key={id} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:col,border:"1.5px solid rgba(255,255,255,0.3)"}} />
            <span style={{fontSize:11,color:"#64748B"}}>{label}</span>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:10,height:10,borderRadius:"50%",border:"2px solid #94A3B8"}} />
          <span style={{fontSize:11,color:"#64748B"}}>Company (large dot)</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:7,height:7,borderRadius:"50%",border:"2px solid #94A3B8"}} />
          <span style={{fontSize:11,color:"#64748B"}}>Contact</span>
        </div>
      </div>

      {/* City breakdown */}
      <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:9,overflow:"hidden"}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em"}}>By Location</div>
        {Object.entries(
          filtered.reduce((acc, loc) => {
            if (!acc[loc.city]) acc[loc.city] = { companies:0, contacts:0, deals:0 };
            if (loc.type==="company") { acc[loc.city].companies++; acc[loc.city].deals += loc.deals; }
            else acc[loc.city].contacts++;
            return acc;
          }, {} as Record<string,{companies:number,contacts:number,deals:number}>)
        ).sort((a,b)=>(b[1].companies+b[1].contacts)-(a[1].companies+a[1].contacts)).map(([city,data])=>(
          <div key={city}
            onClick={()=>{
              const loc = filtered.find(l=>l.city===city);
              if(loc) setSelected(loc);
            }}
            style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderBottom:"1px solid #F8FAFC",cursor:"pointer"}}
          >
            <span style={{fontSize:12,fontWeight:600,color:"#0F172A",flex:1,display:"flex",alignItems:"center",gap:4}}><IE emoji="📍" Icon={MapPin} size={11} color="#94A3B8" />{city}</span>
            {data.companies>0 && <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"#F1F5F9",color:"#64748B"}}>{data.companies} {data.companies===1?"company":"companies"}</span>}
            {data.contacts>0  && <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"#F1F5F9",color:"#64748B"}}>{data.contacts} {data.contacts===1?"contact":"contacts"}</span>}
            <span style={{fontSize:10,color:"#94A3B8"}}>{data.deals} deals</span>
          </div>
        ))}
      </div>
    </div>
  );
}
