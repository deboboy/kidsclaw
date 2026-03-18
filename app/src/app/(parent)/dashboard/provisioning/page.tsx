"use client";

import { ProvisioningProgress } from "@/components/parent/provisioning-progress";

export default function ProvisioningPage() {
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
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
