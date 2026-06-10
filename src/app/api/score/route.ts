import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-adapter";

export async function POST(req: NextRequest) {
  try {
    const { contact, vertical } = await req.json();
    const system = `You are KOVA's AI Lead Scoring engine. Score this contact 0–100 across 4 dimensions.
Vertical: ${vertical || "general"}.
Return ONLY valid JSON — no markdown, no extra text:
{"overall":0,"dimensions":{"fit":0,"intent":0,"timing":0,"value":0},"insight":"one sentence","action":"specific next step"}`;

    const text = await callAI({
      task: "scoring",
      system,
      messages: [{ role:"user", content: JSON.stringify(contact) }],
      maxTokens: 300,
    });

    const clean = text.replace(/```json|```/g,"").trim();
    return NextResponse.json(JSON.parse(clean));
  } catch(e:any) {
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
