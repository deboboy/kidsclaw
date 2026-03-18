import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, kids } from "@/lib/db/schema";
import { generateKidToken } from "@/lib/tokens";
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

  const newToken = generateKidToken();
  const [kid] = await db()
    .update(kids)
    .set({ token: newToken })
    .where(and(eq(kids.id, id), eq(kids.familyId, family.id)))
    .returning();

  if (!kid) {
    return NextResponse.json({ error: "Kid not found" }, { status: 404 });
  }

  return NextResponse.json({ kid });
}
