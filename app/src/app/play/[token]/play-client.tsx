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
  subdomain: string;
  games: Game[];
}

export function PlayClient({ kidName, subdomain, games }: PlayClientProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  if (selectedGame) {
    return (
      <div className="h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 flex flex-col">
        {/* Back button */}
        <button
          onClick={() => setSelectedGame(null)}
          className="absolute top-4 left-4 z-10 text-white/60 hover:text-white text-sm flex items-center gap-1"
        >
          ← Games
        </button>

        <WebChat
          kidName={kidName}
          gameName={selectedGame.name}
          gameIcon={selectedGame.icon}
          instanceSubdomain={subdomain}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900 flex flex-col items-center justify-center px-4 py-8">
      {/* Welcome */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
          Hey {kidName}!
        </h1>
        <p className="text-white/70 mt-2 text-lg">
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
