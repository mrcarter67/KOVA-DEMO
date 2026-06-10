import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo (persists per deployment instance)
// Replace with Vercel KV or PostgreSQL when Mauricio's backend is live
const signups: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, company, vertical, tier, phone, role } = body;

    // Validate required fields
    if (!email || !company || !vertical) {
      return NextResponse.json(
        { error: "Email, company, and vertical are required." },
        { status: 400 }
      );
    }

    // Check for duplicate
    const exists = signups.find(s => s.email === email.toLowerCase().trim());
    if (exists) {
      return NextResponse.json(
        { error: "This email is already registered for beta access.", duplicate: true },
        { status: 409 }
      );
    }

    const signup = {
      id: "KOVA-" + Date.now(),
      firstName: firstName || "",
      lastName: lastName || "",
      email: email.toLowerCase().trim(),
      company,
      vertical,
      tier: tier || "free",
      phone: phone || "",
      role: role || "",
      registeredAt: new Date().toISOString(),
      source: req.headers.get("referer") || "direct",
      status: "pending",
    };

    signups.push(signup);

    // Send webhook notification if configured
    const webhookUrl = process.env.BETA_SIGNUP_WEBHOOK;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup),
      }).catch(() => {}); // Don't fail signup if webhook fails
    }

    // Send email notification via SendGrid if configured
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const notifyEmail = process.env.BETA_NOTIFY_EMAIL || "michael@kovahq.com";
    if (sendgridKey) {
      await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sendgridKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: notifyEmail }] }],
          from: { email: "noreply@kovahq.com", name: "KOVA Beta" },
          subject: `New Beta Signup — ${company} (${vertical})`,
          content: [{
            type: "text/plain",
            value: `New signup!\n\nID: ${signup.id}\nName: ${firstName} ${lastName}\nEmail: ${email}\nCompany: ${company}\nVertical: ${vertical}\nTier: ${tier || "free"}\nRole: ${role || ""}\nTime: ${signup.registeredAt}`,
          }],
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      id: signup.id,
      message: `Welcome to KOVA beta, ${firstName || company}! We'll be in touch within 24 hours.`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET all signups — admin only
export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-key");
  if (auth !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ signups, total: signups.length });
}
