import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, instances } from "@/lib/db/schema";
import { deleteServer } from "@/lib/hetzner/client";
import { eq } from "drizzle-orm";

export async function POST() {
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

  const [existing] = await db()
    .select()
    .from(instances)
    .where(eq(instances.familyId, family.id));

  if (!existing || existing.status !== "error") {
    return NextResponse.json(
      { error: "No failed instance to retry" },
      { status: 400 }
    );
  }

  // Clean up old server if it exists
  if (existing.hetznerServerId) {
    await deleteServer(existing.hetznerServerId).catch(() => {});
  }

  // Delete old instance
  await db().delete(instances).where(eq(instances.id, existing.id));

  // Create new instance
  const [instance] = await db()
    .insert(instances)
    .values({
      familyId: family.id,
      status: "pending",
    })
    .returning();

  // Trigger provisioning via the provision endpoint's logic
  // For now, just return — the user can click Launch again from dashboard
  return NextResponse.json({ instance });
}
