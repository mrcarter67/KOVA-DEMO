import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType = "image/jpeg" } = await req.json();
    const provider = process.env.AI_PROVIDER || "claude";

    // Vision tasks — Claude is significantly better, but Ollama/Llama 4 Scout supports images too
    if(provider === "claude") {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const res = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        messages: [{ role:"user", content:[
          { type:"image", source:{ type:"base64", media_type:mediaType, data:imageBase64 }},
          { type:"text", text:`Extract all contact info from this business card. Return ONLY valid JSON, no markdown:
{"firstName":"","lastName":"","company":"","title":"","phone":"","email":"","address":"","website":"","linkedin":"","notes":""}` }
        ]}],
      });
      const raw = (res.content[0] as any).text || "{}";
      let contact = {};
      try{ contact = JSON.parse(raw.trim()); }catch{}
      return NextResponse.json({ contact });
    }

    // Ollama vision (Llama 4 Scout has multimodal support)
    const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"llama4-scout",
        messages:[{ role:"user", content:[
          { type:"image_url", image_url:{ url:`data:${mediaType};base64,${imageBase64}` }},
          { type:"text", text:`Extract all contact info from this business card. Return ONLY valid JSON:
{"firstName":"","lastName":"","company":"","title":"","phone":"","email":"","address":"","website":"","linkedin":"","notes":""}` }
        ]}],
        stream:false,
      }),
    });
    const data = await res.json();
    const raw = data.message?.content || "{}";
    let contact = {};
    try{ contact = JSON.parse(raw.trim()); }catch{}
    return NextResponse.json({ contact });

  } catch(e:any){
    return NextResponse.json({ error:e.message }, { status:500 });
  }
}
