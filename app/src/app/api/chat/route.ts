import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kids, instances } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, message, game } = body;

  if (!token || !message) {
    return NextResponse.json(
      { error: "Missing token or message" },
      { status: 400 }
    );
  }

  // Validate kid token
  const [kid] = await db()
    .select()
    .from(kids)
    .where(and(eq(kids.token, token), eq(kids.active, true)));

  if (!kid) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // Get family instance
  const [instance] = await db()
    .select()
    .from(instances)
    .where(eq(instances.familyId, kid.familyId));

  if (!instance || instance.status !== "ready" || !instance.ipv4) {
    return NextResponse.json(
      { error: "Instance not ready" },
      { status: 503 }
    );
  }

  // Try to proxy to the VPS OpenClaw instance
  try {
    const res = await fetch(`http://${instance.ipv4}:3000/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        game,
        kidName: kid.name,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // VPS not responding — fall through to fallback
  }

  // Fallback: provide a built-in game response
  const response = generateGameResponse(message, game || "Mars Mission", kid.name);
  return NextResponse.json({ response });
}

function generateGameResponse(
  message: string,
  game: string,
  kidName: string
): string {
  const msg = message.toLowerCase().trim();

  // Ready / start responses
  if (msg === "ready" || msg === "start" || msg === "yes" || msg === "let's go") {
    return getGameIntro(game, kidName);
  }

  // Game-specific responses based on game type
  switch (game) {
    case "Mars Mission":
      return getMarsResponse(msg, kidName);
    case "Science Lab":
      return getScienceResponse(msg, kidName);
    case "Space Trivia":
      return getTriviaResponse(msg, kidName);
    default:
      return getGenericResponse(msg, kidName, game);
  }
}

function getGameIntro(game: string, name: string): string {
  const intros: Record<string, string> = {
    "Mars Mission": `Awesome, ${name}! Let's blast off! 🚀\n\nTo reach Mars, a spacecraft needs to travel about 140 million miles. If your spacecraft travels at 20,000 miles per hour, how many DAYS would it take to reach Mars?\n\n💡 Hint: First find total hours, then divide by 24!`,
    "Science Lab": `Welcome to the Science Lab, ${name}! 🔬\n\nOur first experiment: Magic Milk! You'll need:\n• A shallow plate with milk\n• Food coloring (a few drops)\n• A cotton swab with dish soap\n\nWhat do you PREDICT will happen when you touch the soapy swab to the milk? 🤔`,
    "Mission Design": `Mission Control reporting in, ${name}! 🛸\n\nWe're designing a new space mission! First, pick your destination:\n\nA) Mars - The Red Planet 🔴\nB) Europa - Moon of Jupiter (might have oceans!) 🌊\nC) Titan - Moon of Saturn (has its own atmosphere!) 🌫️\n\nWhich one and WHY?`,
    "Space Trivia": `Trivia time, ${name}! 🌌\n\nQuestion 1: Which planet is known as the "Red Planet"?\n\nA) Jupiter\nB) Mars\nC) Venus\nD) Saturn\n\nWhat's your answer?`,
    "Star Gazer": `Welcome, Star Gazer ${name}! 🔭\n\nImagine you could visit any place in the solar system to observe Earth from afar. Where would you go, and what do you think Earth would look like from there?\n\n(Try the Moon, Mars, or even Saturn's rings!)`,
    "Space Scale": `Ready for some space math, ${name}? 📏\n\nThe distance from Earth to the Sun is about 93 million miles. If we made a scale model where 1 inch = 1 million miles, how many inches away would Earth be from the Sun in your model?`,
    "What If...?": `Let's imagine, ${name}! ✨\n\nYou are an astronaut who just discovered a new Earth-like planet. You've landed and stepped out of your spaceship...\n\nDescribe the FIRST thing you see, smell, or hear! Be creative! 🌍`,
  };
  return intros[game] || intros["Mars Mission"];
}

function getMarsResponse(msg: string, name: string): string {
  // Check for number answers (Mars math problems)
  const num = parseFloat(msg.replace(/[^0-9.]/g, ""));

  if (num >= 290 && num <= 292) {
    return `🎉 Great job, ${name}! That's right — about 291.67 days!\n\n140,000,000 ÷ 20,000 = 7,000 hours\n7,000 ÷ 24 = ~291.67 days\n\nThat's almost 10 months! Now here's the next challenge:\n\nA rocket needs about 8,800 pounds of fuel PER MILE. If the trip is 140 million miles, how many pounds of fuel in total? (Hint: try scientific notation! 🔢)`;
  }
  if (num >= 7000 && num <= 7001) {
    return `You found the hours — 7,000! Now divide by 24 to get the days. How many days is that? 🤔`;
  }
  if (num > 0) {
    return `Hmm, not quite ${name}! Remember:\n\n1️⃣ Total hours = 140,000,000 miles ÷ 20,000 mph\n2️⃣ Total days = Total hours ÷ 24\n\nGive it another try! You got this! 💪`;
  }

  return `Great thinking, ${name}! 🚀\n\nFor this Mars mission problem, try working through the math step by step:\n\n1️⃣ Distance: 140,000,000 miles\n2️⃣ Speed: 20,000 mph\n3️⃣ Time = Distance ÷ Speed\n\nWhat do you get for the number of hours first?`;
}

function getScienceResponse(msg: string, name: string): string {
  if (msg.includes("swirl") || msg.includes("mix") || msg.includes("move") || msg.includes("spread")) {
    return `Great observation, ${name}! 🔬\n\nThe colors swirl because the soap breaks the surface tension of the milk and reacts with the fat! It's like a mini fireworks show!\n\nNow for a science term challenge: What's the process called where plants make their own food using sunlight, water, and carbon dioxide? 🌱`;
  }
  if (msg.includes("photo") || msg.includes("synthesis")) {
    return `Yes! Photosynthesis! 🌿 Amazing, ${name}!\n\nPlants are like tiny food factories powered by sunlight!\n\nOne more: If you dissolve salt in water, and keep adding more and more salt until no more dissolves... what is that point called? (Hint: it starts with 'S') 🧪`;
  }
  if (msg.includes("satur")) {
    return `🎉 Correct! The saturation point! Great science vocabulary, ${name}!\n\nWhen a solution can't dissolve any more solute, we call it a SATURATED solution. You're a natural scientist! 🧑‍🔬`;
  }

  return `Interesting answer, ${name}! 🤔\n\nTell me more about what you think will happen! Think about what the soap might do to the milk. Will the colors stay still, or will something happen? 🎨`;
}

function getTriviaResponse(msg: string, name: string): string {
  if (msg.includes("b") || msg.includes("mars")) {
    return `Correct! It's Mars! 🔴✨ Great job, ${name}!\n\nNext question: What is the LARGEST planet in our solar system?\n\nA) Earth\nB) Uranus\nC) Jupiter\nD) Neptune`;
  }
  if (msg.includes("c") || msg.includes("jupiter")) {
    return `Jupiter is right! 🪐 It's MASSIVE — you could fit 1,300 Earths inside it!\n\nQuestion 3: What force keeps the planets in orbit around the Sun?\n\nA) Magnetism\nB) Gravity\nC) Wind\nD) Electricity`;
  }
  if (msg.includes("gravity")) {
    return `Exactly — Gravity! 🌕 Sir Isaac Newton figured that out when an apple fell on his head (well, maybe not exactly like that!)\n\nFinal question: What celestial body made of dust, ice, and rock orbits the Sun with a glowing tail?\n\nA) Asteroid\nB) Comet\nC) Meteor\nD) Nebula`;
  }

  return `Give it your best guess, ${name}! 🌟\n\nRemember, there are no wrong answers in space — only opportunities to learn something new! Which letter do you pick? (A, B, C, or D)`;
}

function getGenericResponse(msg: string, name: string, game: string): string {
  const responses = [
    `That's a really creative answer, ${name}! 🌟 Tell me more about your thinking!`,
    `Wow, ${name}! I love how you're approaching this! 🚀 What made you think of that?`,
    `Great thinking, ${name}! 💡 Can you explain a bit more? I want to hear your ideas!`,
    `Interesting, ${name}! 🤔 You're really good at ${game}! What would you try next?`,
    `Nice one, ${name}! ⭐ Keep going — you're on the right track!`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
