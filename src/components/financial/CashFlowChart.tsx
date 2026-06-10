"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CASH_FLOW_WEEKS } from "@/lib/financial-data";

function fmt(n: number) {
  return n >= 1000 ? "$" + (n / 1000).toFixed(0) + "k" : "$" + n;
}

export default function CashFlowChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = Math.max(...CASH_FLOW_WEEKS.flatMap(w => [w.inflow, w.outflow]));
  const BW = 18, GAP = 8, GRP = BW * 2 + GAP + 12, H = 100;

  return (
    <Card>
      <CardHeader style={{ padding: "14px 16px 8px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <CardTitle className="text-sm font-semibold">Cash Flow</CardTitle>
            <p style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>Weekly inflow vs outflow</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:10, color:"#94A3B8" }}>
            <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ display:"inline-block", width:10, height:10, borderRadius:2, background:"#00C896" }} />In</span>
            <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ display:"inline-block", width:10, height:10, borderRadius:2, background:"#FCA5A5" }} />Out</span>
          </div>
        </div>
      </CardHeader>
      <CardContent style={{ padding: "0 16px 14px 16px" }}>
        <svg width="100%" viewBox={`0 0 ${CASH_FLOW_WEEKS.length * GRP + 8} ${H + 28}`} className="overflow-visible">
          {CASH_FLOW_WEEKS.map((w, i) => {
            const inH  = (w.inflow  / maxVal) * H;
            const outH = (w.outflow / maxVal) * H;
            const x    = i * GRP + 4;
            const net  = w.inflow - w.outflow;
            const isH  = hovered === i;

            return (
              <g key={w.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                {/* Inflow */}
                <rect x={x} y={H - inH} width={BW} height={inH} rx={3}
                  fill={isH ? "#00B085" : "#00C896"}
                  className="transition-colors duration-150"
                />
                {/* Outflow */}
                <rect x={x + BW + GAP} y={H - outH} width={BW} height={outH} rx={3}
                  fill={isH ? "#DC2626" : "#FCA5A5"}
                  className="transition-colors duration-150"
                />
                {/* Label */}
                <text x={x + BW + GAP / 2} y={H + 14} textAnchor="middle" fontSize={8.5} fill="#94A3B8">{w.label}</text>

                {/* Tooltip */}
                {isH && (
                  <g>
                    <rect x={x - 6} y={H - Math.max(inH, outH) - 54} width={86} height={50} rx={5} fill="#0F172A" />
                    <text x={x + 37} y={H - Math.max(inH, outH) - 37} textAnchor="middle" fontSize={10} fill="#F1F5F9" fontWeight={700}>{w.label}</text>
                    <text x={x + 37} y={H - Math.max(inH, outH) - 24} textAnchor="middle" fontSize={9} fill="#00C896">In: {fmt(w.inflow)}</text>
                    <text x={x + 37} y={H - Math.max(inH, outH) - 13} textAnchor="middle" fontSize={9} fill="#FCA5A5">Out: {fmt(w.outflow)}</text>
                    <text x={x + 37} y={H - Math.max(inH, outH) - 2}  textAnchor="middle" fontSize={9} fill={net >= 0 ? "#00C896" : "#EF4444"}>
                      Net: {net >= 0 ? "+" : ""}{fmt(net)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
