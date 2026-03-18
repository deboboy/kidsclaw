import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { families, instances, provisionEvents } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [family] = await db()
    .select()
    .from(families)
    .where(eq(families.userId, session.user.id));

  if (!family) {
    return new Response("No family found", { status: 404 });
  }

  const [instance] = await db()
    .select()
    .from(instances)
    .where(eq(instances.familyId, family.id));

  if (!instance) {
    return new Response("No instance found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let lastEventId = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Send current status immediately
      sendEvent({
        type: "status",
        status: instance.status,
        step: instance.provisionStep,
      });

      // Poll for new events every 2 seconds
      const interval = setInterval(async () => {
        try {
          const events = await db()
            .select()
            .from(provisionEvents)
            .where(
              and(
                eq(provisionEvents.instanceId, instance.id),
                gt(provisionEvents.id, lastEventId)
              )
            );

          for (const event of events) {
            sendEvent({
              type: "progress",
              step: event.step,
              message: event.message,
              timestamp: event.createdAt,
            });
            lastEventId = event.id;
          }

          // Check if instance is done
          const [current] = await db()
            .select()
            .from(instances)
            .where(eq(instances.id, instance.id));

          if (
            current?.status === "ready" ||
            current?.status === "error"
          ) {
            sendEvent({
              type: "complete",
              status: current.status,
              error: current.provisionError,
            });
            clearInterval(interval);
            controller.close();
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      // Clean up after 10 minutes max
      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, 10 * 60 * 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
