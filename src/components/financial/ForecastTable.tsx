"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FORECAST_DEALS } from "@/lib/financial-data";

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US");
}

function probColor(p: number) {
  if (p >= 70) return "success";
  if (p >= 45) return "warning";
  return "outline";
}

const weighted = FORECAST_DEALS.reduce((s, d) => s + d.value * (d.probability / 100), 0);
const total    = FORECAST_DEALS.reduce((s, d) => s + d.value, 0);

export default function ForecastTable() {
  return (
    <Card>
      <CardHeader style={{ padding: "14px 16px 8px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <CardTitle className="text-sm font-semibold">Pipeline Forecast</CardTitle>
            <p style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>
              {FORECAST_DEALS.length} open deals · <span style={{ fontWeight:600, color:"#00C896" }}>{fmt(weighted)}</span> weighted
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#0F172A", margin:0 }}>{fmt(total)}</p>
            <p style={{ fontSize:10, color:"#94A3B8" }}>total pipeline</p>
          </div>
        </div>
      </CardHeader>
      <CardContent style={{ padding: "4px 16px 14px 16px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {FORECAST_DEALS.map(d => (
            <div
              key={d.name}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, background:"#fff", cursor:"default" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
              {/* Probability side bar */}
              <div style={{ width:3, alignSelf:"stretch", borderRadius:99, flexShrink:0, background: d.probability >= 70 ? "#00C896" : d.probability >= 45 ? "#F59E0B" : "#E2E8F0" }} />

              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#0F172A", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</p>
                <p style={{ fontSize:10, color:"#94A3B8", marginTop:1 }}>{d.contact} · closes {d.closeDate}</p>
              </div>

              <Badge variant={probColor(d.probability) as any} className="text-[10px] flex-shrink-0">
                {d.probability}%
              </Badge>

              <div style={{ textAlign:"right", flexShrink:0 }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#0F172A", margin:0 }}>{fmt(d.value)}</p>
                <p style={{ fontSize:10, color:"#94A3B8" }}>{fmt(Math.round(d.value * d.probability / 100))}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
