"use client";

import { useState } from "react";
import { GameSelector } from "@/components/kid/game-selector";
import { WebChat } from "@/components/kid/webchat";

interface Game {
  id: string;
  name: string;
  day: number;
  icon: string;
  topic: string;
}

interface PlayClientProps {
  kidName: string;
  kidToken: string;
  subdomain: string;
  games: Game[];
}

export function PlayClient({ kidName, kidToken, subdomain, games }: PlayClientProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  if (selectedGame) {
    return (
      <div className="h-dvh bg-[#2d2d2d] flex flex-col overflow-hidden">
        <WebChat
          kidName={kidName}
          kidToken={kidToken}
          gameName={selectedGame.name}
          gameIcon={selectedGame.icon}
          onBack={() => setSelectedGame(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#2d2d2d] flex flex-col items-center justify-center px-4 py-8">
      {/* Header badge */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-[#e60012] rounded-xl flex items-center justify-center text-white font-extrabold text-lg">
          KC
        </div>
      </div>

      {/* Welcome */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          Hey {kidName}!
        </h1>
        <p className="text-white/60 mt-2 text-lg">
          Pick a game and let&apos;s play!
        </p>
      </div>

      {/* Game selector */}
      <GameSelector games={games} onSelect={setSelectedGame} />

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-white/30 text-xs">
          Powered by KidsClaw
        </p>
      </div>
    </div>
  );
}
