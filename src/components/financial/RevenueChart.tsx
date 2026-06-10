"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MONTHLY_REVENUE } from "@/lib/financial-data";

function fmt(n: number) {
  return n >= 1000 ? "$" + (n / 1000).toFixed(0) + "k" : "$" + n;
}

export default function RevenueChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = Math.max(...MONTHLY_REVENUE.map(m => m.revenue));
  const H = 80;

  return (
    <Card>
      <CardHeader style={{ padding: "14px 16px 8px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <CardTitle className="text-sm font-semibold text-foreground">Revenue vs Expenses</CardTitle>
          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:10, color:"#94A3B8" }}>
            <span style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ display:"inline-block", width:10, height:10, borderRadius:2, background:"#0F172A" }} />Revenue
            </span>
            <span style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ display:"inline-block", width:10, height:10, borderRadius:2, background:"#E2E8F0" }} />Expenses
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent style={{ padding: "0 16px 14px 16px" }}>
        <div className="relative">
          <svg width="100%" viewBox={`0 0 ${MONTHLY_REVENUE.length * 50} ${H + 28}`} className="overflow-visible">
            {MONTHLY_REVENUE.map((m, i) => {
              const revH  = (m.revenue  / maxVal) * H;
              const expH  = (m.expenses / maxVal) * H;
              const x     = i * 50 + 6;
              const bw    = 17;
              const isH   = hovered === i;

              return (
                <g key={m.month} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                  {/* Expense bar (behind) */}
                  <rect
                    x={x + bw + 2} y={H - expH} width={bw} height={expH}
                    rx={3}
                    fill={isH ? "#CBD5E1" : "#E2E8F0"}
                    className="transition-colors duration-150"
                    style={{ animationDelay: `${i * 60}ms` }}
                  />
                  {/* Revenue bar */}
                  <rect
                    x={x} y={H - revH} width={bw} height={revH}
                    rx={3}
                    fill={isH ? "#00C896" : "#0F172A"}
                    className="transition-colors duration-150 bar-animated"
                    style={{ animationDelay: `${i * 60}ms` }}
                  />
                  {/* Month label — centered under both bars */}
                  <text x={x + bw + 1} y={H + 14} textAnchor="middle" fontSize={8.5} fill="#94A3B8">{m.month}</text>

                  {/* Tooltip */}
                  {isH && (
                    <g>
                      <rect x={x - 2} y={H - revH - 46} width={72} height={42} rx={5} fill="#0F172A" />
                      <text x={x + 34} y={H - revH - 30} textAnchor="middle" fontSize={10} fill="#F1F5F9" fontWeight={700}>{fmt(m.revenue)}</text>
                      <text x={x + 34} y={H - revH - 17} textAnchor="middle" fontSize={9} fill="#94A3B8">Exp: {fmt(m.expenses)}</text>
                      <text x={x + 34} y={H - revH - 6}  textAnchor="middle" fontSize={9} fill={m.net >= 0 ? "#00C896" : "#EF4444"}>
                        Net: {fmt(m.net)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Summary row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:8, paddingTop:12, borderTop:"1px solid #E2E8F0" }}>
          {[
            ["YTD Revenue",  "$326.7k", "#0F172A"],
            ["YTD Expenses", "$241.5k", "#64748B"],
            ["Net Profit",   "$85.2k",  "#00C896"],
          ].map(([l, v, c]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <p style={{ color: c, fontSize:12, fontWeight:700, margin:0 }}>{v}</p>
              <p style={{ fontSize:10, color:"#94A3B8", marginTop:2 }}>{l}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
