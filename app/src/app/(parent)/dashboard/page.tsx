"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { InstanceCard } from "@/components/parent/instance-card";
import { KidList } from "@/components/parent/kid-list";
import { AddKidModal } from "@/components/parent/add-kid-modal";
import { signOut } from "next-auth/react";

interface Instance {
  id: string;
  status: string;
  ipv4: string | null;
  subdomain: string | null;
  provisionStep: string | null;
  provisionError: string | null;
}

interface Kid {
  id: string;
  name: string;
  token: string;
  phone: string | null;
  active: boolean;
  avatarSeed: string | null;
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [launching, setLaunching] = useState(false);
  const [showAddKid, setShowAddKid] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [instRes, kidsRes] = await Promise.all([
      fetch("/api/instances/status"),
      fetch("/api/kids"),
    ]);
    const instData = await instRes.json();
    const kidsData = await kidsRes.json();
    // Treat "destroyed" as no instance — show Launch button
    const inst = instData.instance;
    setInstance(inst?.status === "destroyed" ? null : inst);
    setKids(kidsData.kids || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/signin");
      return;
    }
    if (authStatus === "authenticated") {
      fetchData();
    }
  }, [authStatus, router, fetchData]);

  const handleLaunch = async () => {
    setLaunching(true);
    const res = await fetch("/api/instances/provision", { method: "POST" });
    const data = await res.json();
    if (data.instance) {
      setInstance(data.instance);
      router.push("/dashboard/provisioning");
    }
    setLaunching(false);
  };

  const handleRetry = async () => {
    const res = await fetch("/api/instances/retry", { method: "POST" });
    const data = await res.json();
    if (data.instance) {
      setInstance(data.instance);
      router.push("/dashboard/provisioning");
    }
  };

  const handleDestroy = async () => {
    if (!confirm("Are you sure? This will shut down your game server and kids will lose access until you launch again.")) {
      return;
    }
    await fetch("/api/instances", { method: "DELETE" });
    setInstance(null);
    setKids([]);
    fetchData();
  };

  const handleAddKid = async (name: string, phone: string) => {
    const res = await fetch("/api/kids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone: phone || undefined }),
    });
    const data = await res.json();
    if (data.kid) {
      setKids((prev) => [...prev, data.kid]);
      return { token: data.kid.token, name: data.kid.name };
    }
    return null;
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    if (active) {
      await fetch(`/api/kids/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
    } else {
      await fetch(`/api/kids/${id}`, { method: "DELETE" });
    }
    fetchData();
  };

  const handleRegenerateToken = async (id: string) => {
    await fetch(`/api/kids/${id}/regenerate-token`, { method: "POST" });
    fetchData();
  };

  const handleSendLink = async (id: string) => {
    await fetch(`/api/kids/${id}/send-link`, { method: "POST" });
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#e60012] rounded-lg flex items-center justify-center text-white font-extrabold text-xs">
              KC
            </div>
            <span className="text-lg font-extrabold text-[#2d2d2d]">KidsClaw</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-[#e60012] font-bold hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-extrabold text-[#2d2d2d]">Dashboard</h1>

        <InstanceCard
          instance={instance}
          onLaunch={handleLaunch}
          onRetry={handleRetry}
          onDestroy={handleDestroy}
          launching={launching}
        />

        {instance?.status === "ready" && (
          <KidList
            kids={kids}
            onAddKid={() => setShowAddKid(true)}
            onToggleActive={handleToggleActive}
            onRegenerateToken={handleRegenerateToken}
            onSendLink={handleSendLink}
          />
        )}

        <AddKidModal
          open={showAddKid}
          onClose={() => setShowAddKid(false)}
          onAdd={handleAddKid}
        />
      </main>
    </div>
  );
}
