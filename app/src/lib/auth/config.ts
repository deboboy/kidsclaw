import NextAuth from "next-auth";
import Email from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  adapter: DrizzleAdapter(db()),
  providers: [
    Email({
      server: {}, // Not used — we send via Resend in sendVerificationRequest
      from: process.env.EMAIL_FROM || "noreply@kidsclaw.club",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await getResend().emails.send({
          from: process.env.EMAIL_FROM || "noreply@kidsclaw.club",
          to: email,
          subject: "Sign in to KidsClaw",
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 8px;">🎮 KidsClaw</h1>
              <p style="color: #374151; font-size: 16px; line-height: 1.5;">
                Click the button below to sign in to your account.
              </p>
              <a href="${url}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
                Sign In
              </a>
              <p style="color: #9ca3af; font-size: 13px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          `,
        });
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin?verify=true",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
    redirect({ url, baseUrl }) {
      // After sign-in, always go to dashboard
      if (url === baseUrl || url.endsWith("/signin") || url.endsWith("/api/auth/signin")) {
        return `${baseUrl}/dashboard`;
      }
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow URLs on the same origin
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
}));
