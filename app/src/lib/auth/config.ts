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
            <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 0;">
              <div style="background: #e60012; padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: white; border-radius: 8px; padding: 6px 10px;">
                      <span style="color: #e60012; font-weight: 800; font-size: 18px;">KC</span>
                    </td>
                    <td style="padding-left: 10px;">
                      <span style="color: white; font-weight: 800; font-size: 22px;">KidsClaw</span>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="padding: 32px 24px; background: white;">
                <p style="color: #2d2d2d; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                  Click the button below to sign in to your account.
                </p>
                <a href="${url}" style="display: inline-block; background: #e60012; color: white; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 16px;">
                  Sign In
                </a>
                <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
                  If you didn't request this, you can safely ignore this email.
                </p>
              </div>
              <div style="background: #2d2d2d; padding: 16px 24px; text-align: center; border-radius: 0 0 8px 8px;">
                <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
                  KidsClaw — Safe, fun, educational AI games for kids.
                </p>
              </div>
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
