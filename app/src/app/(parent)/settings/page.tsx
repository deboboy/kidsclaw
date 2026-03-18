"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [destroying, setDestroying] = useState(false);

  if (status === "unauthenticated") {
    router.push("/signin");
    return null;
  }

  const handleDestroyInstance = async () => {
    if (!confirm("Are you sure? This will delete your game server and all kids will lose access.")) {
      return;
    }
    setDestroying(true);
    await fetch("/api/instances", { method: "DELETE" });
    setDestroying(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold text-violet-600">KidsClaw</div>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Dashboard
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Account</h2>
          <p className="text-sm text-gray-600 mb-4">{session?.user?.email}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Destroy your game server. This will remove your VPS and all kids
            will lose access to games.
          </p>
          <button
            onClick={handleDestroyInstance}
            disabled={destroying}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {destroying ? "Destroying..." : "Destroy Server"}
          </button>
        </div>
      </main>
    </div>
  );
}
