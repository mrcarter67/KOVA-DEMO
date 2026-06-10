"use client";
import { useState } from "react";
import { X, Check, Download, Send, DollarSign } from "lucide-react";
import { IE } from "@/lib/icon-mode";
import { Button } from "@/components/ui/button";
import { useToast, ToastContainer } from "@/components/ui/toast";

interface QuoteLineItem {
  id: string; description: string; qty: number; unit: string; price: number;
}

interface QuoteForInvoice {
  id: string; number: string; title: string; contact: string; company: string;
  email: string; lines: QuoteLineItem[]; tax: number; accentColor: string;
  font: string; terms: string; created: string;
}

interface Props { quote: QuoteForInvoice; onClose: () => void; }

function fmtCurrency(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcTotals(lines: QuoteLineItem[], tax: number) {
  const sub = lines.reduce((a, l) => a + l.qty * l.price, 0);
  const taxAmt = sub * (tax / 100);
  return { sub, taxAmt, total: sub + taxAmt };
}

export default function InvoiceModal({ quote: q, onClose }: Props) {
  const [status, setStatus] = useState<"draft" | "sent" | "paid">("draft");
  const [sending, setSending] = useState(false);
  const { toast, toasts, dismiss } = useToast();
  const { sub, taxAmt, total } = calcTotals(q.lines, q.tax);
  const invNumber = "INV-" + q.number.replace("Q-", "");
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setStatus("sent"); }, 1400);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <div className="bg-white rounded-2xl shadow-2xl w-full !max-w-xl overflow-hidden" style={{ maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div className="flex items-center justify-between !px-6 !py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: q.accentColor }}>
              <IE emoji="💰" Icon={DollarSign} size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{invNumber}</p>
              <p className="text-[10px] text-muted-foreground">Generated from {q.number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status === "paid" && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC]">Paid</span>
            )}
            {status === "sent" && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">Sent</span>
            )}
            {status === "draft" && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">Draft</span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <IE emoji="✕" Icon={X} size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="!p-6 !space-y-5">
          {/* Color bar */}
          <div className="rounded-xl p-5 text-white" style={{ background: q.accentColor }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-75 mb-0.5">Invoice</p>
                <p className="text-base font-bold">{invNumber}</p>
                <p className="text-xs opacity-75 mt-1">{q.title}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{fmtCurrency(total)}</p>
                <p className="text-[10px] opacity-75">Total Due</p>
              </div>
            </div>
          </div>

          {/* Bill to + dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="!p-4 rounded-lg" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Bill To</p>
              <p className="text-sm font-semibold text-foreground">{q.contact || "—"}</p>
              {q.company && <p className="text-xs text-muted-foreground">{q.company}</p>}
              {q.email && <p className="text-xs text-muted-foreground">{q.email}</p>}
            </div>
            <div className="!p-4 rounded-lg space-y-1" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Dates</p>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Issued</span><span className="font-medium">{today}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Due</span><span className="font-medium text-[#B45309]">{dueDate}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Ref</span><span className="font-medium font-mono text-[10px]">{q.number}</span></div>
            </div>
          </div>

          {/* Line items */}
          <div>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Line Items</p>
            <div className="rounded-lg overflow-hidden border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th className="text-left py-2 px-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
                    <th className="text-center py-2 px-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wide w-16">Qty</th>
                    <th className="text-right py-2 px-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wide w-24">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {q.lines.filter(l => l.description || l.price > 0).map((l, i) => (
                    <tr key={l.id} style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}>
                      <td className="py-2 px-3 text-foreground">{l.description}</td>
                      <td className="py-2 px-2 text-center text-muted-foreground">{l.qty} {l.unit}</td>
                      <td className="py-2 px-3 text-right font-medium text-foreground">{fmtCurrency(l.qty * l.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totals */}
            <div className="mt-3 space-y-1.5 pr-3">
              <div className="flex justify-end gap-10 text-xs text-muted-foreground">
                <span>Subtotal</span><span>{fmtCurrency(sub)}</span>
              </div>
              {q.tax > 0 && (
                <div className="flex justify-end gap-10 text-xs text-muted-foreground">
                  <span>Tax ({q.tax}%)</span><span>{fmtCurrency(taxAmt)}</span>
                </div>
              )}
              <div className="flex justify-end gap-10 text-sm font-bold pt-1.5 border-t border-border" style={{ color: q.accentColor }}>
                <span>Total Due</span><span>{fmtCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          {q.terms && (
            <div className="!p-4 rounded-lg text-xs text-muted-foreground" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <p className="font-semibold text-foreground text-[10px] uppercase tracking-wide mb-1">Terms</p>
              {q.terms}
            </div>
          )}

          {/* Status banners */}
          {status === "paid" && (
            <div className="flex items-center gap-2 !p-4 rounded-lg bg-[#F0FDF4] border border-[#86EFAC]">
              <IE emoji="✅" Icon={Check} size={14} className="text-[#15803D]" />
              <p className="text-xs font-semibold text-[#15803D]">Payment received — invoice marked as paid</p>
            </div>
          )}
          {status === "sent" && (
            <div className="flex items-center gap-2 !p-4 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
              <IE emoji="📤" Icon={Send} size={14} className="text-[#1D4ED8]" />
              <p className="text-xs font-semibold text-[#1D4ED8]">Invoice sent to {q.email || q.contact}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 gap-1.5 text-xs h-9" onClick={() => toast("PDF export ready in production","info")}>
              <IE emoji="⬇️" Icon={Download} size={13} />PDF
            </Button>
            {status === "draft" && (
              <Button className="flex-1 gap-1.5 text-xs h-9 bg-[#0F172A] hover:bg-[#0F172A]/90" onClick={handleSend} disabled={sending}>
                <IE emoji="📤" Icon={Send} size={13} />
                {sending ? "Sending…" : "Send Invoice"}
              </Button>
            )}
            {status !== "paid" && (
              <Button
                className="flex-1 gap-1.5 text-xs h-9 text-white"
                style={{ background: "#15803D" }}
                onClick={() => setStatus("paid")}
              >
                <IE emoji="✅" Icon={Check} size={13} />Mark Paid
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
