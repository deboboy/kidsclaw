"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { buildPlayUrl } from "@/lib/tokens";

interface AddKidModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, phone: string) => Promise<{ token: string; name: string } | null>;
}

export function AddKidModal({ open, onClose, onAdd }: AddKidModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ token: string; name: string } | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const kid = await onAdd(name, phone);
    if (kid) {
      setResult(kid);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setResult(null);
    setCopied(false);
    onClose();
  };

  const playUrl = result ? buildPlayUrl(result.token) : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(playUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          {!result ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add a Kid
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kid&apos;s name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We&apos;ll text the play link to this number.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Kid"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {result.name} is ready to play!
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Share this QR code or link with {result.name} to start playing.
              </p>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl border-2 border-violet-100">
                  <QRCodeSVG
                    value={playUrl}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#5b21b6"
                    level="M"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Play link:</p>
                <p className="text-sm font-mono text-gray-800 break-all">
                  {playUrl}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyLink}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
