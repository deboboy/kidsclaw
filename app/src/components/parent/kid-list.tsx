"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { buildPlayUrl } from "@/lib/tokens";

interface Kid {
  id: string;
  name: string;
  token: string;
  phone: string | null;
  active: boolean;
  avatarSeed: string | null;
}

interface KidListProps {
  kids: Kid[];
  onAddKid: () => void;
  onToggleActive: (id: string, active: boolean) => void;
  onRegenerateToken: (id: string) => void;
  onSendLink: (id: string) => void;
}

export function KidList({
  kids,
  onAddKid,
  onToggleActive,
  onRegenerateToken,
  onSendLink,
}: KidListProps) {
  const activeKids = kids.filter((k) => k.active);
  const inactiveKids = kids.filter((k) => !k.active);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-[#2d2d2d]">Kids</h2>
        <button
          onClick={onAddKid}
          className="px-4 py-2 rounded-full bg-[#e60012] text-white text-sm font-bold hover:bg-[#c7000f] transition-colors"
        >
          + Add Kid
        </button>
      </div>

      {kids.length === 0 && (
        <p className="text-sm text-gray-500 py-4 text-center">
          No kids added yet. Add a kid to get them playing!
        </p>
      )}

      <div className="space-y-3">
        {activeKids.map((kid) => (
          <KidCard
            key={kid.id}
            kid={kid}
            onToggleActive={onToggleActive}
            onRegenerateToken={onRegenerateToken}
            onSendLink={onSendLink}
          />
        ))}
        {inactiveKids.map((kid) => (
          <KidCard
            key={kid.id}
            kid={kid}
            onToggleActive={onToggleActive}
            onRegenerateToken={onRegenerateToken}
            onSendLink={onSendLink}
          />
        ))}
      </div>
    </div>
  );
}

function KidCard({
  kid,
  onToggleActive,
  onRegenerateToken,
  onSendLink,
}: {
  kid: Kid;
  onToggleActive: (id: string, active: boolean) => void;
  onRegenerateToken: (id: string) => void;
  onSendLink: (id: string) => void;
}) {
  const playUrl = buildPlayUrl(kid.token);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(playUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`border rounded-xl p-4 ${
        kid.active ? "border-gray-200" : "border-gray-100 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-lg">
            {kid.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{kid.name}</p>
            <p className="text-xs text-gray-500">
              {kid.active ? "Active" : "Deactivated"}
              {kid.phone && ` · ${kid.phone}`}
            </p>
          </div>
        </div>
      </div>

      {kid.active && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-[#e60012] hover:bg-red-50"
            >
              {showQR ? "Hide QR" : "Show QR"}
            </button>
            <button
              onClick={copyLink}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
            {kid.phone && (
              <button
                onClick={() => onSendLink(kid.id)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Send SMS
              </button>
            )}
            <button
              onClick={() => onRegenerateToken(kid.id)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              New Link
            </button>
            <button
              onClick={() => onToggleActive(kid.id, false)}
              className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Deactivate
            </button>
          </div>

          {showQR && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="bg-white p-4 rounded-xl border-2 border-red-100">
                <QRCodeSVG
                  value={playUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#e60012"
                  level="M"
                />
              </div>
              <p className="text-xs text-gray-500 text-center break-all max-w-xs">
                {playUrl}
              </p>
            </div>
          )}
        </>
      )}

      {!kid.active && (
        <div className="mt-3">
          <button
            onClick={() => onToggleActive(kid.id, true)}
            className="px-3 py-1.5 rounded-lg border border-green-200 text-xs font-medium text-green-600 hover:bg-green-50"
          >
            Reactivate
          </button>
        </div>
      )}
    </div>
  );
}
