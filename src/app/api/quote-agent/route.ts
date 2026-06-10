import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-adapter";

export async function POST(req: NextRequest) {
  const { messages, currentQuote, docType="quote", vertical, brandVoice } = await req.json();
  const SYSTEM: Record<string,string> = {
    quote:`You are KOVA's Quoting Agent. Help build a professional proposal. Ask one question at a time. Vertical: ${vertical||"general"}. Brand voice: ${brandVoice||"professional"}. After collecting info include: <quote_update>{"title":"","contact":"","company":"","intro":"","scope":"","lines":[{"id":"l1","desc":"","qty":1,"unit":"job","price":0}]}</quote_update>`,
    estimate:`You are KOVA's Estimating Agent. Walk through: type of work → labor → materials → markup → total. Vertical: ${vertical||"general"}. Include: <quote_update>{"title":"","scope":"","lines":[{"id":"l1","desc":"","qty":1,"unit":"hrs","price":0}]}</quote_update>`,
    invoice:`You are KOVA's Invoice Agent. A quote was just signed. Pre-fill the invoice. Ask: confirm amount and client → payment terms → any adjustments? Include: <quote_update>{"title":"","contact":"","terms":"","lines":[]}</quote_update>`,
  };
  try {
    const full = await callAI({ task:docType as any, system:SYSTEM[docType]||SYSTEM.quote, messages, maxTokens:600 });
    const match = full.match(/<quote_update>([\s\S]*?)<\/quote_update>/);
    let update = null;
    if(match){ try{ update = JSON.parse(match[1]); }catch{} }
    const display = full.replace(/<quote_update>[\s\S]*?<\/quote_update>/g,"").trim();
    return NextResponse.json({ message:display, quoteUpdate:update });
  } catch(e:any){ return NextResponse.json({ error:e.message },{status:500}); }
}
