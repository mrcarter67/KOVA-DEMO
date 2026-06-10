import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json();
    const res = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system,
      messages,
    });
    const text = (res.content[0] as any).text || "";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, text: "Sorry, something went wrong." }, { status: 500 });
  }
}
