import { inngest } from "./inngest";
import { db } from "@/lib/db";
import { instances, provisionEvents, families } from "@/lib/db/schema";
import { createServer, deleteServer } from "@/lib/hetzner/client";
import { buildCloudInitScript } from "@/lib/hetzner/cloud-init";
import { encrypt } from "@/lib/crypto";
import { generateProvisionSecret } from "@/lib/tokens";
import { eq } from "drizzle-orm";

const PROVISION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const provisionInstance = inngest.createFunction(
  {
    id: "provision-instance",
    retries: 0,
    triggers: [{ event: "instance/provision.requested" }],
  },
  async ({ event, step }: { event: { data: { instanceId: string; familyId: string } }; step: any }) => {
    const { instanceId, familyId } = event.data;

    // Step 1: Generate provision secret and create Hetzner server
    const serverInfo = await step.run("create-server", async () => {
      const provisionSecret = generateProvisionSecret();
      const encryptedSecret = encrypt(provisionSecret);

      // Get family for subdomain
      const [family] = await db()
        .select()
        .from(families)
        .where(eq(families.id, familyId));

      const subdomain = familyId.split("-")[0]; // Use first segment of UUID

      const webhookUrl = `${process.env.AUTH_URL}/api/webhook/provision`;
      const userData = buildCloudInitScript({
        webhookUrl,
        provisionSecret,
        instanceId,
        subdomain,
      });

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
        .where(eq(instances.id, instanceId));

      await db().insert(provisionEvents).values({
        instanceId,
        step: "create_server",
        message: `Server created (IP: ${server.public_net.ipv4.ip})`,
      });

      return {
        serverId: String(server.id),
        ip: server.public_net.ipv4.ip,
        subdomain,
      };
    });

    // Step 2: Wait for provision to complete (cloud-init reports back via webhook)
    // We poll the instance status until it's "ready" or "error"
    const result = await step.run("wait-for-provision", async () => {
      const startTime = Date.now();

      while (Date.now() - startTime < PROVISION_TIMEOUT_MS) {
        const [instance] = await db()
          .select()
          .from(instances)
          .where(eq(instances.id, instanceId));

        if (instance?.status === "ready") {
          return { success: true };
        }
        if (instance?.status === "error") {
          return { success: false, error: instance.provisionError };
        }

        // Wait 5 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      // Timeout: mark as error
      await db()
        .update(instances)
        .set({
          status: "error",
          provisionError: "Provisioning timed out after 5 minutes",
          updatedAt: new Date(),
        })
        .where(eq(instances.id, instanceId));

      return { success: false, error: "timeout" };
    });

    // Step 3: Handle failure - clean up server if needed
    if (!result.success) {
      await step.run("cleanup-failed", async () => {
        if (serverInfo.serverId) {
          await deleteServer(serverInfo.serverId).catch(() => {});
        }
      });
    }

    return result;
  }
);
