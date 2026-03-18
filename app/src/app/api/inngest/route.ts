import { serve } from "inngest/next";
import { inngest } from "@/lib/provisioning/inngest";
import { provisionInstance } from "@/lib/provisioning/steps";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [provisionInstance],
});
