"use client";

interface InstanceCardProps {
  instance: {
    id: string;
    status: string;
    ipv4: string | null;
    subdomain: string | null;
    provisionStep: string | null;
    provisionError: string | null;
  } | null;
  onLaunch: () => void;
  onRetry: () => void;
  launching: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  creating: "bg-blue-100 text-blue-800",
  installing: "bg-blue-100 text-blue-800",
  configuring: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  destroyed: "bg-gray-100 text-gray-800",
};

export function InstanceCard({
  instance,
  onLaunch,
  onRetry,
  launching,
}: InstanceCardProps) {
  if (!instance) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Launch KidsClaw
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Set up your family&apos;s private game server. Takes about 2 minutes.
          Your kids will be playing in no time!
        </p>
        <button
          onClick={onLaunch}
          disabled={launching}
          className="px-8 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-lg shadow-violet-200"
        >
          {launching ? "Launching..." : "Launch KidsClaw"}
        </button>
      </div>
    );
  }

  const isProvisioning = ["pending", "creating", "installing", "configuring"].includes(
    instance.status
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Game Server</h2>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[instance.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {instance.status}
        </span>
      </div>

      {instance.status === "ready" && (
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            Your KidsClaw server is running and ready for your kids to play!
          </p>
          {instance.subdomain && (
            <p className="font-mono text-xs bg-gray-50 px-3 py-2 rounded-lg">
              {instance.subdomain}.play.kidsclaw.club
            </p>
          )}
        </div>
      )}

      {isProvisioning && (
        <div className="text-sm text-gray-600">
          <p>Setting up your game server... This takes about 2 minutes.</p>
          <a
            href="/dashboard/provisioning"
            className="inline-block mt-3 text-violet-600 font-medium hover:underline"
          >
            View progress →
          </a>
        </div>
      )}

      {instance.status === "error" && (
        <div className="space-y-3">
          <p className="text-sm text-red-600">
            {instance.provisionError || "Something went wrong during setup."}
          </p>
          <button
            onClick={onRetry}
            className="px-6 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
