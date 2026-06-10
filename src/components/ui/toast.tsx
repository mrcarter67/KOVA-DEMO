"use client";
import { useState, useCallback } from "react";
import { Check, Info, AlertTriangle, X } from "lucide-react";

export type ToastVariant = "success" | "info" | "warning" | "error";

interface ToastItem { id: number; message: string; variant: ToastVariant; }

const STYLES: Record<ToastVariant, { bg:string; border:string; iconColor:string; text:string }> = {
  success: { bg:"#F0FDF4", border:"#86EFAC",  iconColor:"#15803D", text:"#15803D" },
  info:    { bg:"#EFF6FF", border:"#BFDBFE",  iconColor:"#1D4ED8", text:"#1D4ED8" },
  warning: { bg:"#FFFBEB", border:"#FDE68A",  iconColor:"#B45309", text:"#92400E" },
  error:   { bg:"#FEF2F2", border:"#FCA5A5",  iconColor:"#B91C1C", text:"#B91C1C" },
};
const ICONS = { success: Check, info: Info, warning: AlertTriangle, error: X };

export function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss:(id:number)=>void }) {
  return (
    <div style={{position:"fixed",top:16,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>
      {toasts.map(t => {
        const s = STYLES[t.variant];
        const Icon = ICONS[t.variant];
        return (
          <div key={t.id} className="toast-enter"
            style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:9,minWidth:250,maxWidth:340,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",pointerEvents:"auto"}}>
            <Icon size={15} style={{color:s.iconColor,flexShrink:0}} />
            <span style={{fontSize:13,color:s.text,fontWeight:500,flex:1,lineHeight:1.4}}>{t.message}</span>
            <button onClick={()=>onDismiss(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:s.iconColor,padding:0,fontSize:16,opacity:0.6,lineHeight:1,flexShrink:0}}>×</button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toast, toasts, dismiss };
}
