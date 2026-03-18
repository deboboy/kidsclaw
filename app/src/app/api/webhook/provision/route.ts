import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { instances, provisionEvents } from "@/lib/db/schema";
import { decrypt } from "@/lib/crypto";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-provision-secret");
  const instanceId = req.headers.get("x-instance-id");

  if (!secret || !instanceId) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  // Validate the provision secret
  const [instance] = await db()
    .select()
    .from(instances)
    .where(eq(instances.id, instanceId));

  if (!instance || !instance.provisionSecret) {
    return NextResponse.json({ error: "Invalid instance" }, { status: 404 });
  }

  try {
    const decryptedSecret = decrypt(instance.provisionSecret);
    if (decryptedSecret !== secret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }

  const body = await req.json();
  const { step, message } = body;

  if (!step || !message) {
    return NextResponse.json(
      { error: "Missing step or message" },
      { status: 400 }
    );
  }

  // Map steps to instance status
  const statusMap: Record<string, string> = {
    system_setup: "installing",
    install_node: "installing",
    install_openclaw: "installing",
    configure_openclaw: "configuring",
    deploy_games: "configuring",
    firewall_caddy: "configuring",
    ready: "ready",
  };

  const newStatus = statusMap[step] || instance.status;

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
      status: newStatus as typeof instance.status,
      provisionStep: step,
      updatedAt: new Date(),
    })
    .where(eq(instances.id, instanceId));

  return NextResponse.json({ ok: true });
}
