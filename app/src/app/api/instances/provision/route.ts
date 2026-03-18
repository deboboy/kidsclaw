import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, instances, provisionEvents } from "@/lib/db/schema";
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

  // Run provisioning directly (skip Inngest for now)
  // Fire-and-forget — don't await so the response returns immediately
  runProvisioning(instance.id, family.id).catch((err) => {
    console.error("Provisioning failed:", err);
  });

  return NextResponse.json({ instance });
}

async function runProvisioning(instanceId: string, familyId: string) {
  const subdomain = familyId.split("-")[0];

  // Simulate provisioning steps with delays
  const steps = [
    { step: "create_server", message: "Creating server...", status: "creating" as const },
    { step: "system_setup", message: "Updating system packages...", status: "installing" as const },
    { step: "install_node", message: "Installing Node.js 22...", status: "installing" as const },
    { step: "install_openclaw", message: "Installing OpenClaw...", status: "installing" as const },
    { step: "configure_openclaw", message: "Configuring OpenClaw for KidsClaw...", status: "configuring" as const },
    { step: "deploy_games", message: "Setting up game library...", status: "configuring" as const },
    { step: "firewall_caddy", message: "Configuring firewall and web server...", status: "configuring" as const },
    { step: "ready", message: "KidsClaw is ready to play!", status: "ready" as const },
  ];

  for (const { step, message, status } of steps) {
    // Insert provision event
    await db().insert(provisionEvents).values({
      instanceId,
      step,
      message,
    });

    // Update instance status
    await db()
      .update(instances)
      .set({
        status,
        provisionStep: step,
        subdomain,
        updatedAt: new Date(),
      })
      .where(eq(instances.id, instanceId));

    // Simulate time for each step (skip delay on final step)
    if (step !== "ready") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
