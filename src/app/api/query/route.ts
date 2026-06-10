import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-adapter";

export async function POST(req: NextRequest) {
  try {
    const { question, contacts, deals, vertical } = await req.json();
    const system = `You are KOVA's data query agent for a ${vertical} business. Answer questions about their CRM data directly and specifically. Reference real names. Be concise.`;
    const text = await callAI({
      task: "query",
      system,
      messages: [{ role:"user", content: `Data: ${JSON.stringify({contacts:contacts?.slice(0,8),deals:deals?.slice(0,8)})}. Question: ${question}` }],
      maxTokens: 400,
    });
    return NextResponse.json({ answer: text });
  } catch(e:any) {
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
