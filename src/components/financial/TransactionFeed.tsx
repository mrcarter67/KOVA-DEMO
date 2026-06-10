"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RECENT_TRANSACTIONS } from "@/lib/financial-data";

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US");
}

const FILTERS = ["All", "Income", "Expenses"] as const;
type Filter = (typeof FILTERS)[number];

export default function TransactionFeed() {
  const [filter, setFilter] = useState<Filter>("All");

  const visible = RECENT_TRANSACTIONS.filter(t =>
    filter === "All" ? true :
    filter === "Income" ? t.category === "income" : t.category === "expense"
  );

  return (
    <Card>
      <CardHeader style={{ padding: "14px 16px 8px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
          <div style={{ display:"flex", gap:4 }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize:10, padding:"3px 10px", borderRadius:99, border:"none",
                  fontWeight:600, cursor:"pointer", transition:"background 150ms",
                  background: filter === f ? "#0F172A" : "#F1F5F9",
                  color: filter === f ? "#fff" : "#64748B",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent style={{ padding: "4px 16px 14px 16px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:2, maxHeight:280, overflowY:"auto", paddingRight:4 }}>
          {visible.map(t => (
            <div
              key={t.id}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 8px", borderRadius:8, background:"#fff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
              {/* Type indicator */}
              <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:12, fontWeight:700, background: t.category === "income" ? "#F0FDF4" : "#FEF2F2", color: t.category === "income" ? "#15803D" : "#B91C1C" }}>
                {t.category === "income" ? "+" : "−"}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:11.5, fontWeight:500, color:"#0F172A", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.description}</p>
                <p style={{ fontSize:10, color:"#94A3B8", marginTop:2 }}>
                  {t.date}{t.contact ? ` · ${t.contact}` : ""}
                </p>
              </div>

              <div style={{ textAlign:"right", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
                <span style={{ fontSize:12, fontWeight:700, color: t.category === "income" ? "#15803D" : "#B91C1C" }}>
                  {t.category === "income" ? "+" : "−"}{fmt(t.amount)}
                </span>
                {t.status === "pending" && (
                  <Badge variant="warning" className="text-[9px] px-1.5 py-0">pending</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
