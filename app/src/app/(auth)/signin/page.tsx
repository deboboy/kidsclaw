"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const searchParams = useSearchParams();
  const isVerify = searchParams.get("verify") === "true";

  if (isVerify || sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-6">📬</div>
          <h1 className="text-2xl font-extrabold text-[#2d2d2d] mb-2">
            Check your email
          </h1>
          <p className="text-gray-600">
            We sent a magic link to{" "}
            <span className="font-bold text-[#2d2d2d]">{email || "your email"}</span>.
            Click it to sign in.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Didn&apos;t get it? Check your spam folder or{" "}
            <button
              onClick={() => setSent(false)}
              className="text-[#e60012] font-bold hover:underline"
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, redirect: false });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#e60012] rounded-xl flex items-center justify-center text-white font-extrabold text-lg">
              KC
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-[#2d2d2d]">
            KidsClaw
          </h1>
          <p className="text-gray-600 mt-1">
            Sign in or create your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 p-8"
        >
          <label
            htmlFor="email"
            className="block text-sm font-bold text-[#2d2d2d] mb-2"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="parent@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent text-[#2d2d2d]"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 rounded-full bg-[#e60012] text-white font-bold hover:bg-[#c7000f] disabled:opacity-50 transition-colors"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
          <p className="mt-4 text-xs text-gray-500 text-center">
            No password needed. We&apos;ll email you a secure sign-in link.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
