import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e60012] rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
              KC
            </div>
            <span className="text-lg font-extrabold text-[#2d2d2d] tracking-tight">
              KidsClaw
            </span>
          </div>
          <Link
            href="/signin"
            className="px-5 py-2 rounded-full bg-[#e60012] text-white text-sm font-bold hover:bg-[#c7000f] transition-colors"
          >
            Log in / Sign up
          </Link>
        </div>
      </nav>

      {/* Hero banner */}
      <section className="bg-[#e60012] text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span>🎮</span>
            <span>KidsClaw Online</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Educational games
            <br />
            kids actually love
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            AI-powered science, math, and space exploration for ages 9-11.
            No app install. No login for kids. Just scan and play.
          </p>
          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <Link
              href="/signin"
              className="inline-flex items-center px-8 py-3.5 rounded-full bg-white text-[#e60012] font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center px-8 py-3.5 rounded-full border-2 border-white/40 text-white font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* Game carousel banner */}
      <section className="bg-[#2d2d2d] py-6 overflow-hidden">
        <div className="flex gap-6 animate-scroll justify-center flex-wrap px-4">
          {[
            { icon: "🚀", name: "Mars Mission" },
            { icon: "🔬", name: "Science Lab" },
            { icon: "🛸", name: "Mission Design" },
            { icon: "🌌", name: "Space Trivia" },
            { icon: "🔭", name: "Star Gazer" },
            { icon: "📏", name: "Space Scale" },
            { icon: "✨", name: "What If...?" },
          ].map((game) => (
            <div
              key={game.name}
              className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5"
            >
              <span className="text-2xl">{game.icon}</span>
              <span className="text-white font-bold text-sm whitespace-nowrap">
                {game.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white">
        {/* Section header bar */}
        <div className="bg-[#f5f5f5] py-4 border-y border-gray-200">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-[#2d2d2d]">
            How KidsClaw Works
          </h2>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Parent signs up",
                desc: "Create your account with just an email. Magic link sign-in — no passwords to remember.",
                icon: "📧",
              },
              {
                step: "02",
                title: "Launch KidsClaw",
                desc: "Click one button. We spin up a private game server just for your family in about 2 minutes.",
                icon: "🖥️",
              },
              {
                step: "03",
                title: "Kids scan & play",
                desc: "Show your kid a QR code or text a link. They open it on any phone or tablet and start playing.",
                icon: "📱",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-[#e60012] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-[#e60012] mb-1">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-extrabold text-[#2d2d2d] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games section */}
      <section className="bg-white">
        <div className="bg-[#e60012] py-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-white">
            A Week of Adventures
          </h2>
          <p className="text-center text-white/80 text-sm mt-1">
            New games every day — science, math, and space exploration
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🚀", name: "Mars Mission", topic: "Math in Space", day: "Day 1" },
              { icon: "🔬", name: "Science Lab", topic: "Experiments", day: "Day 2" },
              { icon: "🛸", name: "Mission Design", topic: "Planning", day: "Day 3" },
              { icon: "🌌", name: "Space Trivia", topic: "Trivia", day: "Day 4" },
              { icon: "🔭", name: "Star Gazer", topic: "Astronomy", day: "Day 5" },
              { icon: "📏", name: "Space Scale", topic: "Measurement", day: "Day 6" },
              { icon: "✨", name: "What If...?", topic: "Creative", day: "Day 7" },
              { icon: "🎯", name: "More coming!", topic: "Stay tuned", day: "" },
            ].map((game) => (
              <div
                key={game.name}
                className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#e60012] hover:shadow-md transition-all text-center group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {game.icon}
                </div>
                <div className="font-extrabold text-[#2d2d2d] text-sm">
                  {game.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{game.topic}</div>
                {game.day && (
                  <div className="text-[10px] font-bold text-[#e60012] mt-1">
                    {game.day}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-[#2d2d2d] mb-12">
            Built for Families
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔒",
                title: "Safe & Private",
                desc: "Your own private game server. No ads, no tracking, no data shared.",
              },
              {
                icon: "🧒",
                title: "No Kid Login",
                desc: "Kids scan a QR code and play instantly. No accounts, passwords, or apps to install.",
              },
              {
                icon: "🧠",
                title: "Actually Educational",
                desc: "Real math problems, science experiments, and creative challenges — not just trivia.",
              },
              {
                icon: "👨‍👩‍👧‍👦",
                title: "Family Dashboard",
                desc: "Add kids, manage access, generate QR codes, and monitor activity all from one place.",
              },
              {
                icon: "📱",
                title: "Mobile First",
                desc: "Designed for phones and tablets. Touch-friendly interface kids love to use.",
              },
              {
                icon: "🤖",
                title: "AI Game Host",
                desc: "A friendly, patient AI that adapts to each kid's pace and encourages learning.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-gray-200"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-extrabold text-[#2d2d2d] mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#e60012] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to play?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Get your kids learning through play in under 2 minutes.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center px-8 py-3.5 rounded-full bg-white text-[#e60012] font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Sign up today!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2d2d2d] text-white py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#e60012] rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
              KC
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              KidsClaw
            </span>
          </div>
          <p className="text-center text-white/50 text-sm">
            Safe, fun, educational AI games for kids.
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <Link href="/terms" className="text-white/40 text-xs hover:text-white/60">
              Terms of Service
            </Link>
          </div>
          <p className="text-center text-white/40 text-xs mt-2">
            Copyright &copy; 2026 Last Myle LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
