"use client";

import { useState } from "react";

interface Game {
  id: string;
  name: string;
  day: number;
  icon: string;
  topic: string;
}

interface GameSelectorProps {
  games: Game[];
  onSelect: (game: Game) => void;
}

export function GameSelector({ games, onSelect }: GameSelectorProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white text-center mb-6 drop-shadow-lg">
        Pick a Game!
      </h2>

      {/* Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {games.map((game, index) => (
          <button
            key={game.id}
            onClick={() => {
              setSelected(index);
              onSelect(game);
            }}
            className={`flex-shrink-0 w-36 snap-center rounded-2xl p-5 text-center transition-all transform ${
              selected === index
                ? "bg-white/20 backdrop-blur-sm scale-105 ring-2 ring-white/50"
                : "bg-white/10 backdrop-blur-sm hover:bg-white/15"
            }`}
          >
            <div className="text-5xl mb-3">{game.icon}</div>
            <div className="text-white font-bold text-sm">{game.name}</div>
            <div className="text-white/60 text-xs mt-1">{game.topic}</div>
            <div className="text-white/40 text-xs mt-1">Day {game.day}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
