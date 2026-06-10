import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-adapter";

export async function POST(req: NextRequest) {
  try {
    const { messages, businessContext, vertical, tenantConfig } = await req.json();

    const context = businessContext
      ? `\n\nBusiness context:\n${JSON.stringify(businessContext, null, 2)}`
      : "";

    const config = tenantConfig
      ? `\n\nTenant config:\n${JSON.stringify(tenantConfig, null, 2)}`
      : "";

    const text = await callAI({
      task: "atlas",
      system: `You are Atlas, the KOVA onboarding agent and data intelligence specialist. You help small business owners get their CRM set up and understand their data.

Your two modes:
1. ONBOARDING — guide a new client through setting up their CRM. Ask about their pipeline stages, typical deal size, main products/services, and how they currently track customers. Build their Carbon Foundation config from the conversation.
2. INTELLIGENCE — analyze their data and give honest, specific insights. Reference real names and numbers. No generic advice.

Vertical: ${vertical || "general"}.${context}${config}

Be direct. Be specific. One question at a time in onboarding mode. In intelligence mode, lead with the most important finding.`,
      messages,
      maxTokens: 700,
    });

    return NextResponse.json({ message: text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
