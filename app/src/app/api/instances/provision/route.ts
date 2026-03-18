import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, instances, provisionEvents } from "@/lib/db/schema";
import { createServer } from "@/lib/hetzner/client";
import { buildCloudInitScript } from "@/lib/hetzner/cloud-init";
import { encrypt } from "@/lib/crypto";
import { generateProvisionSecret } from "@/lib/tokens";
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

  // Generate provision secret for webhook auth
  const provisionSecret = generateProvisionSecret();
  const encryptedSecret = encrypt(provisionSecret);
  const subdomain = family.id.split("-")[0];

  // Determine the webhook URL (use AUTH_URL or VERCEL_URL)
  const baseUrl =
    process.env.AUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const webhookUrl = `${baseUrl}/api/webhook/provision`;

  // Build cloud-init script
  const userData = buildCloudInitScript({
    webhookUrl,
    provisionSecret,
    instanceId: instance.id,
    subdomain,
  });

  try {
    // Create Hetzner server with cloud-init
    const serverName = `kidsclaw-${subdomain}`;
    const server = await createServer(serverName, userData);

    // Update instance with server info
    await db()
      .update(instances)
      .set({
        hetznerServerId: String(server.id),
        ipv4: server.public_net.ipv4.ip,
        status: "creating",
        provisionSecret: encryptedSecret,
        subdomain,
        updatedAt: new Date(),
      })
      .where(eq(instances.id, instance.id));

    // Log the first provision event
    await db().insert(provisionEvents).values({
      instanceId: instance.id,
      step: "create_server",
      message: `Server created (IP: ${server.public_net.ipv4.ip})`,
    });

    return NextResponse.json({
      instance: {
        ...instance,
        hetznerServerId: String(server.id),
        ipv4: server.public_net.ipv4.ip,
        status: "creating",
        subdomain,
      },
    });
  } catch (err) {
    // Mark instance as error
    const errorMessage =
      err instanceof Error ? err.message : "Unknown provisioning error";
    await db()
      .update(instances)
      .set({
        status: "error",
        provisionError: errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(instances.id, instance.id));

    console.error("Hetzner provisioning failed:", errorMessage);
    return NextResponse.json(
      { error: "Failed to create server", details: errorMessage },
      { status: 500 }
    );
  }
}
