"use client";

import { ProvisioningProgress } from "@/components/parent/provisioning-progress";

export default function ProvisioningPage() {
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
          <a href="/dashboard" className="text-sm text-[#e60012] font-bold hover:underline">
            ← Dashboard
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-extrabold text-[#2d2d2d] text-center mb-2">
          Setting up your game server
        </h1>
        <p className="text-gray-600 text-center mb-10">
          This usually takes about 2 minutes. Hang tight!
        </p>

        <ProvisioningProgress />
      </main>
    </div>
  );
}
