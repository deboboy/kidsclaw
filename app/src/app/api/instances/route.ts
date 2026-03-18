import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, instances } from "@/lib/db/schema";
import { deleteServer } from "@/lib/hetzner/client";
import { eq } from "drizzle-orm";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [family] = await db()
    .select()
    .from(families)
    .where(eq(families.userId, session.user.id));

  if (!family) {
    return NextResponse.json({ error: "No family" }, { status: 404 });
  }

  const [instance] = await db()
    .select()
    .from(instances)
    .where(eq(instances.familyId, family.id));

  if (!instance) {
    return NextResponse.json({ error: "No instance" }, { status: 404 });
  }

  // Delete server from Hetzner
  if (instance.hetznerServerId) {
    await deleteServer(instance.hetznerServerId).catch(() => {});
  }

  // Mark as destroyed
  await db()
    .update(instances)
    .set({ status: "destroyed", updatedAt: new Date() })
    .where(eq(instances.id, instance.id));

  return NextResponse.json({ ok: true });
}
