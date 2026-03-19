"use client";

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
  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <h2 className="text-xl font-extrabold text-white text-center mb-5">
        Choose Your Game
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelect(game)}
            className="bg-white/10 rounded-2xl p-4 text-center transition-all hover:bg-[#e60012]/20 hover:scale-[1.03] active:scale-[0.98] border border-white/10 hover:border-[#e60012]/40"
          >
            <div className="text-4xl mb-2">{game.icon}</div>
            <div className="text-white font-extrabold text-sm leading-tight">
              {game.name}
            </div>
            <div className="text-white/50 text-xs mt-1">{game.topic}</div>
            <div className="mt-2 inline-block bg-[#e60012]/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-[#ff6b6b]">
              Day {game.day}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
