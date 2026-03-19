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
              <h2 className="text-xl font-extrabold text-[#2d2d2d] mb-4">
                Add a Kid
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2d2d2d] mb-1">
                    Kid&apos;s name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e60012] text-[#2d2d2d]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2d2d2d] mb-1">
                    Phone number{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e60012] text-[#2d2d2d]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We&apos;ll text the play link to this number.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-full bg-[#e60012] text-white font-bold hover:bg-[#c7000f] disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Kid"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-extrabold text-[#2d2d2d] mb-2">
                {result.name} is ready to play!
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Share this QR code or link with {result.name} to start playing.
              </p>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl border-2 border-red-100">
                  <QRCodeSVG
                    value={playUrl}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#e60012"
                    level="M"
                  />
                </div>
              </div>

              <div className="bg-[#f5f5f5] rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Play link:</p>
                <p className="text-sm font-mono text-[#2d2d2d] break-all">
                  {playUrl}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyLink}
                  className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-full bg-[#e60012] text-white font-bold hover:bg-[#c7000f]"
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
