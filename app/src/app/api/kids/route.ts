import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, kids } from "@/lib/db/schema";
import { generateKidToken } from "@/lib/tokens";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [family] = await db()
    .select()
    .from(families)
    .where(eq(families.userId, session.user.id));

  if (!family) {
    return NextResponse.json({ kids: [] });
  }

  const kidsList = await db()
    .select()
    .from(kids)
    .where(eq(kids.familyId, family.id));

  return NextResponse.json({ kids: kidsList });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [family] = await db()
    .select()
    .from(families)
    .where(eq(families.userId, session.user.id));

  if (!family) {
    return NextResponse.json({ error: "No family found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, phone } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const token = generateKidToken();
  const avatarSeed = Math.random().toString(36).substring(2, 10);

  const [kid] = await db()
    .insert(kids)
    .values({
      familyId: family.id,
      name: name.trim(),
      token,
      phone: phone || null,
      avatarSeed,
    })
    .returning();

  return NextResponse.json({ kid });
}
