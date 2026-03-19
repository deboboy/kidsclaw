import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { role, rating, message, email } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  if (!role || !["parent", "kid"].includes(role)) {
    return NextResponse.json(
      { error: "Role must be parent or kid" },
      { status: 400 }
    );
  }

  await db().insert(feedback).values({
    role,
    rating: rating || null,
    message: message.trim(),
    email: email || null,
  });

  return NextResponse.json({ ok: true });
}
