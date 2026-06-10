import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-adapter";

const ERP_AGENTS: Record<string, string> = {
  estimator: `You are KOVA's ERP Estimator agent. Help build accurate job estimates for manufacturing and construction businesses.
Ask about: type of work, materials needed, labor hours by trade, equipment, subcontractors, overhead allocation.
Build the estimate as you gather information. Show running totals. Suggest markup based on job type.
Return a structured estimate with all line items when complete.`,

  planner: `You are KOVA's ERP Planner agent. Build production schedules and flag bottlenecks.
Ask about: job due date, operations in sequence, work centers available, crew capacity, material lead times.
Output a day-by-day schedule. Flag any date conflicts or capacity issues immediately.
Suggest resequencing if a job is at risk of running late.`,

  buyer: `You are KOVA's ERP Buyer agent. Generate purchase orders and manage vendor selection.
Ask about: materials needed, quantities, current inventory levels, preferred vendors, required delivery date.
Suggest the most cost-effective vendor based on history. Generate PO line items.
Flag any items with long lead times that could delay production.`,

  cost: `You are KOVA's ERP Cost agent. Analyze job cost variance and explain results in plain English.
Compare actual vs estimated costs. Identify the top 3 variance drivers.
Give a plain-English explanation the business owner can act on — not accounting jargon.
Recommend what to change in the next estimate for this type of job.`,
};

export async function POST(req: NextRequest) {
  try {
    const { agentType = "estimator", messages, jobContext } = await req.json();
    const system = ERP_AGENTS[agentType] || ERP_AGENTS.estimator;

    const context = jobContext
      ? `\n\nJob context: ${JSON.stringify(jobContext)}`
      : "";

    const text = await callAI({
      task: "agent",
      system: system + context,
      messages,
      maxTokens: 800,
    });

    return NextResponse.json({ message: text, agentType });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
