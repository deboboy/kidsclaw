import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, kids } from "@/lib/db/schema";
import { buildPlayUrl } from "@/lib/tokens";
import { eq, and } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [family] = await db()
    .select()
    .from(families)
    .where(eq(families.userId, session.user.id));

  if (!family) {
    return NextResponse.json({ error: "No family" }, { status: 404 });
  }

  const [kid] = await db()
    .select()
    .from(kids)
    .where(and(eq(kids.id, id), eq(kids.familyId, family.id)));

  if (!kid) {
    return NextResponse.json({ error: "Kid not found" }, { status: 404 });
  }

  if (!kid.phone) {
    return NextResponse.json(
      { error: "No phone number for this kid" },
      { status: 400 }
    );
  }

  const playUrl = buildPlayUrl(kid.token);

  // Send SMS via Twilio
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    return NextResponse.json(
      { error: "SMS not configured" },
      { status: 503 }
    );
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const res = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: kid.phone,
      From: process.env.TWILIO_PHONE_NUMBER,
      Body: `Hey ${kid.name}! Your KidsClaw games are ready! Tap here to play: ${playUrl}`,
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
