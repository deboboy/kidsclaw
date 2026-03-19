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
  const num = parseFloat(msg.replace(/[^0-9.]/g, ""));

  if (num >= 290 && num <= 293) {
    return `🎉 Amazing, ${name}! That's exactly right — about 291.67 days!\n\n140,000,000 ÷ 20,000 = 7,000 hours\n7,000 ÷ 24 = ~291.67 days\n\nThat's almost 10 months in space! 🚀\n\nHere's your next challenge: You need to bring water for 4 astronauts for 30 days. Each astronaut needs 3 gallons per day. How many TOTAL gallons do you need?`;
  }
  if (num === 360) {
    return `🎉 Yes! 360 gallons! Great work, ${name}!\n\n4 astronauts × 3 gallons × 30 days = 360 gallons\n\nThat's a LOT of water! 💧\n\nLast one: How many times bigger is the distance to Mars (140 million miles) than the distance to the Moon (238,000 miles)? Round to the nearest whole number!`;
  }
  if (num >= 587 && num <= 589) {
    return `🎉 Incredible, ${name}! About 588 times farther! 🌕➡️🔴\n\n140,000,000 ÷ 238,000 ≈ 588\n\nMars is almost 600 times farther than the Moon! You crushed this mission! 🏆\n\nType "next" to try another game, or keep chatting!`;
  }

  // Supportive response — give the answer and move on
  return `Great effort, ${name}! 💪 That's a tough one!\n\nThe answer is about 291.67 days. Here's how:\n• 140,000,000 miles ÷ 20,000 mph = 7,000 hours\n• 7,000 hours ÷ 24 = ~291.67 days\n\nThat's almost 10 months! 🚀\n\nLet's try the next one: You need water for 4 astronauts for 30 days. Each needs 3 gallons per day. How many TOTAL gallons?`;
}

function getScienceResponse(msg: string, name: string): string {
  if (msg.includes("swirl") || msg.includes("mix") || msg.includes("move") || msg.includes("spread") || msg.includes("color")) {
    return `Great observation, ${name}! 🔬\n\nYes! The colors swirl and dance! The soap breaks the surface tension of the milk and reacts with the fat molecules — like a mini fireworks show! 🎆\n\nNext challenge: What's the process called where plants make their own food using sunlight, water, and carbon dioxide? 🌱`;
  }
  if (msg.includes("photo") || msg.includes("synthesis")) {
    return `Yes! Photosynthesis! 🌿 Amazing, ${name}!\n\nPlants are like tiny food factories powered by sunlight!\n\nLast one: When you dissolve salt in water and keep adding more until no more dissolves, what's that point called? (Hint: starts with 'S') 🧪`;
  }
  if (msg.includes("satur")) {
    return `🎉 Correct! The saturation point! ${name}, you're a natural scientist! 🧑‍🔬\n\nWhen no more solute can dissolve, we call it a SATURATED solution.\n\nType "next" to try another game, or keep exploring!`;
  }

  // Supportive — give context and move to the next question
  return `Good thinking, ${name}! 🤔 When the soapy swab touches the milk, the colors actually SWIRL and DANCE around! The soap breaks the surface tension and reacts with the fat in the milk.\n\nCool, right? 🎨\n\nHere's the next one: What's the process where plants make food from sunlight, water, and CO2? 🌱`;
}

function getTriviaResponse(msg: string, name: string): string {
  const m = msg.toLowerCase();

  if (m.includes("b") && !m.includes("a)") || m.includes("mars")) {
    return `Correct! It's Mars! 🔴✨ Great job, ${name}!\n\nQuestion 2: What is the LARGEST planet in our solar system?\n\nA) Earth\nB) Uranus\nC) Jupiter\nD) Neptune`;
  }
  if (m.includes("c") && !m.includes("a)") || m.includes("jupiter")) {
    return `Jupiter is right! 🪐 It's so big you could fit 1,300 Earths inside it!\n\nQuestion 3: What force keeps the planets in orbit around the Sun?\n\nA) Magnetism\nB) Gravity\nC) Wind\nD) Electricity`;
  }
  if (m.includes("gravity") || (m.includes("b") && m.includes("grav"))) {
    return `Exactly — Gravity! 🌕 It's the invisible force that holds the whole solar system together!\n\nFinal question: What's a celestial body made of dust, ice, and rock that orbits the Sun with a glowing tail?\n\nA) Asteroid\nB) Comet\nC) Meteor\nD) Nebula`;
  }
  if (m.includes("comet") || (m === "b" && msg.length < 5)) {
    return `🎉 Yes, a Comet! ${name}, you're a space trivia champion! 🏆\n\nComets have tails made of gas and dust that glow when they get close to the Sun. How cool is that?\n\nType "next" to try another game!`;
  }

  // Supportive — give the answer and move on
  return `Nice try, ${name}! 🌟 The answer is B) Mars — it's called the Red Planet because of the iron oxide (rust!) on its surface.\n\nLet's keep going! Question 2: What is the LARGEST planet in our solar system?\n\nA) Earth\nB) Uranus\nC) Jupiter\nD) Neptune`;
}

function getGenericResponse(msg: string, name: string, game: string): string {
  const responses = [
    `That's really creative, ${name}! 🌟 I love your thinking! Here's another challenge: What would you do differently if you could try again?`,
    `Wow, ${name}! 🚀 Great answer! Now tell me — what's the most surprising thing you've learned so far in ${game}?`,
    `Nice one, ${name}! 💡 You're really getting the hang of this! What would you like to explore next?`,
    `Awesome thinking, ${name}! ⭐ I can tell you're great at ${game}. What question do YOU have for me?`,
    `Love it, ${name}! 🎯 You're doing amazing. Want to try a harder challenge or keep going at this level?`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
