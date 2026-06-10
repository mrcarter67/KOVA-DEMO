import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-adapter";

export async function POST(req: NextRequest) {
  try {
    const { content, contact, vertical, tone, brandVoice } = await req.json();

    const text = await callAI({
      task: "personalize",
      system: `You are KOVA's personalization engine. Rewrite the given content to feel personally written for this specific contact.
Vertical: ${vertical || "general"}.
Brand tone: ${tone || brandVoice || "professional, warm, trustworthy"}.
Rules: Keep the same message but make it feel human and specific. Reference the contact's industry, role, or context. Maximum 3 sentences unless the original is longer. Do NOT use their first name more than once.`,
      messages: [{ role: "user", content: `Contact: ${JSON.stringify(contact)}\n\nContent to personalize:\n${content}` }],
      maxTokens: 400,
    });

    return NextResponse.json({ personalized: text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
