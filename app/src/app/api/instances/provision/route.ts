import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, instances } from "@/lib/db/schema";
import { inngest } from "@/lib/provisioning/inngest";
import { eq } from "drizzle-orm";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create family
  let [family] = await db()
    .select()
    .from(families)
    .where(eq(families.userId, session.user.id));

  if (!family) {
    const [newFamily] = await db()
      .insert(families)
      .values({
        userId: session.user.id,
        name: session.user.name || session.user.email || "My Family",
      })
      .returning();
    family = newFamily;
  }

  // Check for existing instance
  const [existing] = await db()
    .select()
    .from(instances)
    .where(eq(instances.familyId, family.id));

  if (existing && existing.status !== "error" && existing.status !== "destroyed") {
    return NextResponse.json(
      { error: "Instance already exists", instance: existing },
      { status: 409 }
    );
  }

  // If previous failed instance, clean up
  if (existing) {
    await db().delete(instances).where(eq(instances.id, existing.id));
  }

  // Create new instance record
  const [instance] = await db()
    .insert(instances)
    .values({
      familyId: family.id,
      status: "pending",
    })
    .returning();

  // Trigger Inngest provisioning workflow
  await inngest.send({
    name: "instance/provision.requested",
    data: {
      instanceId: instance.id,
      familyId: family.id,
    },
  });

  return NextResponse.json({ instance });
}
