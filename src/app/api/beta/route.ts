import { NextRequest, NextResponse } from "next/server";

const AT_BASE_URL = (base: string, table: string) =>
  `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, industry } = body;

    if (!name || !email || !company || !industry) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const key   = process.env.AIRTABLE_API_KEY;
    const base  = process.env.AIRTABLE_BASE_ID;
    const table = process.env.AIRTABLE_TABLE_NAME ?? "Signups";

    if (!key || !base) {
      return NextResponse.json({
        ok: true,
        position: Math.floor(Math.random() * 80) + 12,
      });
    }

    const url     = AT_BASE_URL(base, table);
    const headers = {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    };

    // Duplicate check before inserting
    const checkRes = await fetch(
      `${url}?filterByFormula=LOWER({Email})="${email.trim().toLowerCase()}"&maxRecords=1`,
      { headers }
    );
    const checkData = await checkRes.json();
    if (checkData.records?.length) {
      return NextResponse.json({ error: "This email is already on the list" }, { status: 409 });
    }

    // Count existing records to assign a waitlist position
    const countRes = await fetch(`${url}?fields[]=Email`, { headers });
    const countData = await countRes.json();
    const position = (countData.records?.length ?? 0) + 1;

    // Write the new record
    const insertRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        fields: {
          Name:     name.trim(),
          Email:    email.trim().toLowerCase(),
          Company:  company.trim(),
          Industry: industry,
          JoinedAt: new Date().toISOString(),
          Position: position,
        },
      }),
    });

    if (!insertRes.ok) {
      console.error("Airtable error:", await insertRes.text());
      return NextResponse.json({ error: "Failed to save — try again" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, position });
  } catch {
    return NextResponse.json({ error: "Server error — try again" }, { status: 500 });
  }
}
