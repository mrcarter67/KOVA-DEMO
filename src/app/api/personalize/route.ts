import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { lead, template, tone, channel } = await req.json();
    const prompt = `Rewrite this ${channel || "SMS"} message to be personalized for this specific lead.
Tone: ${tone || "professional"}
Original template: "${template}"
Lead data: ${JSON.stringify({ name: `${lead.fn} ${lead.ln}`, company: lead.co, city: lead.city, score: lead.score, notes: lead.notes })}
Write a personalized opening message using specific details from their profile. Return ONLY the message text, no quotes.`;
    const res = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    const message = (res.content[0] as any).text || template;
    return NextResponse.json({ message });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
