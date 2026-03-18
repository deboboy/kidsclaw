import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, kids } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
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

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name) updates.name = body.name;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.active !== undefined) updates.active = body.active;

  const [kid] = await db()
    .update(kids)
    .set(updates)
    .where(and(eq(kids.id, id), eq(kids.familyId, family.id)))
    .returning();

  if (!kid) {
    return NextResponse.json({ error: "Kid not found" }, { status: 404 });
  }

  return NextResponse.json({ kid });
}

export async function DELETE(
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

  // Soft delete: deactivate the kid
  const [kid] = await db()
    .update(kids)
    .set({ active: false })
    .where(and(eq(kids.id, id), eq(kids.familyId, family.id)))
    .returning();

  if (!kid) {
    return NextResponse.json({ error: "Kid not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
