import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-adapter";

export async function POST(req: NextRequest) {
  try {
    const { messages, financialData, analysisType = "chat" } = await req.json();

    const SYSTEMS: Record<string, string> = {
      chat: `You are Atlas, KOVA's financial intelligence agent — the CFO of the AI team.
You have access to this business's real financial data. Be specific. Reference real numbers.
Speak like a CFO who knows this business intimately — not a generic chatbot.
Explain what's happening, why it matters, and exactly what to do.
Flag both opportunities (uptakes) and risks (downtakes). Max 4 sentences unless asked for detail.
Financial data: ${JSON.stringify(financialData || {})}`,

      forecast: `You are Atlas, KOVA's financial forecasting agent.
Based on the financial data provided, project the next 90 days.
Consider: current revenue trend, seasonality for this vertical, pipeline probability, AR collection rate.
Output: 3-month revenue projection with confidence range, top 3 risks, top 3 opportunities.
Be specific with numbers.
Financial data: ${JSON.stringify(financialData || {})}`,

      analyze: `You are Atlas, KOVA's financial analysis agent.
Perform a complete financial health check on this business.
Cover: gross margin trend, cash runway, AR aging risk, expense categories out of control, and growth signals.
Rate each area: Green (good), Amber (watch), Red (act now).
Financial data: ${JSON.stringify(financialData || {})}`,
    };

    const text = await callAI({
      task: "report",
      system: SYSTEMS[analysisType] || SYSTEMS.chat,
      messages,
      maxTokens: 700,
    });

    return NextResponse.json({ message: text, analysisType });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
