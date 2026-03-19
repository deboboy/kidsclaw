"use client";

import { useEffect, useState } from "react";

interface ProgressEvent {
  step: string;
  message: string;
  timestamp?: string;
}

const STEPS = [
  { key: "create_server", label: "Creating server", icon: "🖥️", fact: "A single Hetzner server can process thousands of chat messages per second!" },
  { key: "system_setup", label: "System setup", icon: "⚙️", fact: "The International Space Station orbits Earth every 90 minutes at 17,500 mph!" },
  { key: "install_node", label: "Installing Node.js", icon: "📦", fact: "Mars has the tallest mountain in the solar system — Olympus Mons at 72,000 feet!" },
  { key: "install_openclaw", label: "Installing OpenClaw", icon: "🤖", fact: "There are more stars in the universe than grains of sand on all of Earth's beaches!" },
  { key: "configure_openclaw", label: "Configuring games", icon: "🎮", fact: "A day on Venus is longer than a year on Venus. Mind blown!" },
  { key: "deploy_games", label: "Loading game library", icon: "📚", fact: "Saturn's density is so low, it would float if you could put it in a giant bathtub!" },
  { key: "firewall_caddy", label: "Securing connection", icon: "🔒", fact: "Light from the Sun takes about 8 minutes to reach Earth!" },
  { key: "ready", label: "Ready to play!", icon: "🎉", fact: "" },
];

export function ProvisioningProgress() {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("create_server");
  const [status, setStatus] = useState<"provisioning" | "ready" | "error">(
    "provisioning"
  );
  const [error, setError] = useState<string | null>(null);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource("/api/instances/progress");

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "progress") {
        setEvents((prev) => [...prev, data]);
        setCurrentStep(data.step);
        const stepIdx = STEPS.findIndex((s) => s.key === data.step);
        if (stepIdx >= 0) setFactIndex(stepIdx);
      } else if (data.type === "complete") {
        if (data.status === "ready") {
          setStatus("ready");
          setCurrentStep("ready");
        } else {
          setStatus("error");
          setError(data.error);
        }
        eventSource.close();
      } else if (data.type === "status") {
        if (data.status === "ready") {
          setStatus("ready");
          setCurrentStep("ready");
          eventSource.close();
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="max-w-lg mx-auto">
      {/* Space fact */}
      {status === "provisioning" && STEPS[factIndex]?.fact && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 text-center">
          <p className="text-sm text-[#e60012] font-bold">
            Did you know?
          </p>
          <p className="text-sm text-gray-700 mt-1">
            {STEPS[factIndex].fact}
          </p>
        </div>
      )}

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all ${
                  isComplete
                    ? "bg-green-100"
                    : isCurrent
                    ? "bg-red-50 ring-2 ring-[#e60012] ring-offset-2"
                    : "bg-gray-100"
                }`}
              >
                {isComplete ? "✓" : step.icon}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-bold ${
                    isComplete
                      ? "text-green-700"
                      : isCurrent
                      ? "text-[#2d2d2d]"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && status === "provisioning" && step.key !== "ready" && (
                  <div className="mt-1 h-1.5 bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#e60012] rounded-full animate-pulse w-2/3" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status messages */}
      {status === "ready" && (
        <div className="mt-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-extrabold text-[#2d2d2d]">
            KidsClaw is ready!
          </h2>
          <p className="text-gray-600 mt-2">
            Your game server is up and running. Head back to the dashboard to
            add your kids.
          </p>
          <a
            href="/dashboard"
            className="inline-block mt-4 px-6 py-2.5 rounded-full bg-[#e60012] text-white font-bold hover:bg-[#c7000f]"
          >
            Go to Dashboard
          </a>
        </div>
      )}

      {status === "error" && (
        <div className="mt-8 text-center">
          <div className="text-5xl mb-4">😟</div>
          <h2 className="text-xl font-extrabold text-[#2d2d2d]">
            Something went wrong
          </h2>
          <p className="text-red-600 text-sm mt-2">
            {error || "Server setup failed. Please try again."}
          </p>
          <a
            href="/dashboard"
            className="inline-block mt-4 px-6 py-2.5 rounded-full bg-[#e60012] text-white font-bold hover:bg-[#c7000f]"
          >
            Back to Dashboard
          </a>
        </div>
      )}
    </div>
  );
}
