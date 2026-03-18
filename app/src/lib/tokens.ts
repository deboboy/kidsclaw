import { nanoid } from "nanoid";

/** Generate a 22-char nanoid (~131 bits entropy) for kid tokens */
export function generateKidToken(): string {
  return nanoid(22);
}

/** Generate a provision secret for webhook auth */
export function generateProvisionSecret(): string {
  return nanoid(32);
}

/** Build the play URL for a kid token */
export function buildPlayUrl(token: string): string {
  const base = process.env.AUTH_URL || "https://kidsclaw.club";
  return `${base}/play/${token}`;
}
