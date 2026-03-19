"use client";

import { useState } from "react";
import Link from "next/link";

export default function FeedbackPage() {
  const [role, setRole] = useState<"parent" | "kid">("parent");
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, rating: rating || undefined, message, email: email || undefined }),
    });
    if (res.ok) {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-extrabold text-[#2d2d2d] mb-2">
            Thank you!
          </h1>
          <p className="text-gray-600 mb-6">
            Your feedback helps us make KidsClaw better for everyone.
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-2.5 rounded-full bg-[#e60012] text-white font-bold hover:bg-[#c7000f] transition-colors"
          >
            Back to KidsClaw
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3 max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#e60012] rounded-lg flex items-center justify-center text-white font-extrabold text-xs">
              KC
            </div>
            <span className="text-lg font-extrabold text-[#2d2d2d]">KidsClaw</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-extrabold text-[#2d2d2d] mb-2">
          Share Your Feedback
        </h1>
        <p className="text-gray-600 text-sm mb-8">
          We&apos;d love to hear from you! Parents and kids are both welcome to share their thoughts.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          {/* Role toggle */}
          <div>
            <label className="block text-sm font-bold text-[#2d2d2d] mb-2">
              I am a...
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("parent")}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-colors ${
                  role === "parent"
                    ? "bg-[#e60012] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setRole("kid")}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-colors ${
                  role === "kid"
                    ? "bg-[#e60012] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Kid
              </button>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-bold text-[#2d2d2d] mb-2">
              How would you rate KidsClaw?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    star <= rating ? "" : "opacity-30"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold text-[#2d2d2d] mb-2">
              {role === "kid"
                ? "What do you think about the games?"
                : "How can we improve KidsClaw?"}
            </label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                role === "kid"
                  ? "Tell us what you liked, what was hard, or what games you want!"
                  : "Share your experience, suggestions, or anything we should know..."
              }
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e60012] text-[#2d2d2d] text-sm resize-none"
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm font-bold text-[#2d2d2d] mb-1">
              Email <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="So we can follow up with you"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e60012] text-[#2d2d2d] text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full py-3 rounded-full bg-[#e60012] text-white font-bold hover:bg-[#c7000f] disabled:opacity-50 transition-colors"
          >
            {loading ? "Sending..." : "Send Feedback"}
          </button>
        </form>
      </main>
    </div>
  );
}
