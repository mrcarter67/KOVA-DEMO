import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-adapter";

export async function POST(req: NextRequest) {
  try {
    const { contacts, deals, vertical, companyName } = await req.json();
    const system = `You are KOVA's Intelligence Agent. Write a sharp Monday morning briefing for ${companyName||"this business"}.
Vertical: ${vertical}. Be specific. Reference real names and numbers. 3 sections: What's Working, What Needs Attention, This Week's Priority.`;

    const text = await callAI({
      task: "report",
      system,
      messages: [{ role:"user", content: `Contacts: ${JSON.stringify(contacts?.slice(0,5))}. Deals: ${JSON.stringify(deals?.slice(0,5))}.` }],
      maxTokens: 600,
    });
    return NextResponse.json({ report: text });
  } catch(e:any) {
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
