import { db } from "@/lib/db";
import { kids, families, instances } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PlayClient } from "./play-client";

interface Game {
  id: string;
  name: string;
  day: number;
  icon: string;
  topic: string;
}

const GAMES: Game[] = [
  { id: "mars-mission", name: "Mars Mission", day: 1, icon: "🚀", topic: "Math in Space" },
  { id: "science-lab", name: "Science Lab", day: 2, icon: "🔬", topic: "Home Experiments" },
  { id: "space-mission", name: "Mission Design", day: 3, icon: "🛸", topic: "Creative Planning" },
  { id: "trivia", name: "Space Trivia", day: 4, icon: "🌌", topic: "Quick Trivia" },
  { id: "astronomy", name: "Star Gazer", day: 5, icon: "🔭", topic: "Astronomy" },
  { id: "scale-math", name: "Space Scale", day: 6, icon: "📏", topic: "Math & Measurement" },
  { id: "what-if", name: "What If...?", day: 7, icon: "✨", topic: "Creative Writing" },
];

export default async function PlayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Look up kid by token
  const [kid] = await db()
    .select()
    .from(kids)
    .where(and(eq(kids.token, token), eq(kids.active, true)));

  if (!kid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            This link doesn&apos;t work
          </h1>
          <p className="text-white/70">
            Ask your parent for a new play link!
          </p>
        </div>
      </div>
    );
  }

  // Get family instance
  const [instance] = await db()
    .select()
    .from(instances)
    .where(eq(instances.familyId, kid.familyId));

  if (!instance || instance.status !== "ready") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😴</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Your game world is sleeping!
          </h1>
          <p className="text-white/70">
            Ask your parent to check the KidsClaw dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PlayClient
      kidName={kid.name}
      subdomain={instance.subdomain || ""}
      games={GAMES}
    />
  );
}
