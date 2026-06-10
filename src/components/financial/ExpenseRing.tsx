"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EXPENSE_CATEGORIES } from "@/lib/financial-data";

const TOTAL = EXPENSE_CATEGORIES.reduce((s, e) => s + e.amount, 0);
const R = 52, CX = 68, CY = 68, CIRC = 2 * Math.PI * R;

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US");
}

export default function ExpenseRing() {
  const [hovered, setHovered] = useState<string | null>(null);

  let offset = 0;
  const segments = EXPENSE_CATEGORIES.map(cat => {
    const pct  = cat.amount / TOTAL;
    const dash = pct * CIRC;
    const seg  = { ...cat, dash, offset, pct };
    offset += dash;
    return seg;
  });

  const active = hovered ? EXPENSE_CATEGORIES.find(c => c.label === hovered) : null;

  return (
    <Card>
      <CardHeader style={{ padding: "14px 16px 8px 16px" }}>
        <CardTitle className="text-sm font-semibold">Expense Breakdown</CardTitle>
        <p style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>Monthly · {fmt(TOTAL)} total</p>
      </CardHeader>
      <CardContent style={{ padding: "0 16px 14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {/* Donut */}
          <div style={{ position:"relative", flexShrink:0, width:136, height:136 }}>
            <svg width={136} height={136} viewBox="0 0 136 136">
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F1F5F9" strokeWidth={16} />
              {segments.map((s) => (
                <circle
                  key={s.label}
                  cx={CX} cy={CY} r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hovered === s.label ? 20 : 16}
                  strokeDasharray={`${s.dash - 1.5} ${CIRC - s.dash + 1.5}`}
                  strokeDashoffset={-s.offset + CIRC / 4}
                  style={{ transition: "stroke-width 150ms ease", cursor: "pointer" }}
                  onMouseEnter={() => setHovered(s.label)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </svg>
            {/* Center text */}
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
              {active ? (
                <>
                  <span style={{ fontSize:11, fontWeight:700, color:"#0F172A" }}>{fmt(active.amount)}</span>
                  <span style={{ fontSize:9, color:"#94A3B8", textAlign:"center", lineHeight:1.3, padding:"0 8px" }}>{active.label}</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize:12, fontWeight:700, color:"#0F172A" }}>{fmt(TOTAL)}</span>
                  <span style={{ fontSize:9, color:"#94A3B8" }}>total / mo</span>
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:8 }}>
            {EXPENSE_CATEGORIES.map(cat => {
              const pct = ((cat.amount / TOTAL) * 100).toFixed(0);
              const isH = hovered === cat.label;
              return (
                <div
                  key={cat.label}
                  style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", opacity: hovered && !isH ? 0.45 : 1, transition: "opacity 150ms" }}
                  onMouseEnter={() => setHovered(cat.label)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span style={{ width:10, height:10, borderRadius:"50%", flexShrink:0, background: cat.color }} />
                  <span style={{ fontSize:11, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{cat.label}</span>
                  <span style={{ fontSize:10, color:"#94A3B8" }}>{pct}%</span>
                  <span style={{ fontSize:9, fontWeight:600, marginLeft:2, color: cat.change >= 0 ? "#EF4444" : "#10B981" }}>
                    {cat.change >= 0 ? "▲" : "▼"}{Math.abs(cat.change)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
