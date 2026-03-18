import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, instances } from "@/lib/db/schema";
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
    return NextResponse.json({ instance: null });
  }

  const [instance] = await db()
    .select()
    .from(instances)
    .where(eq(instances.familyId, family.id));

  return NextResponse.json({ instance: instance || null });
}
