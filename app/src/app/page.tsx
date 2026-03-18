import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-violet-600">KidsClaw</div>
        <Link
          href="/signin"
          className="text-sm font-medium text-violet-600 hover:text-violet-800"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
          Educational games
          <br />
          <span className="text-violet-600">kids actually love</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          AI-powered science, math, and space exploration games designed for ages
          9-11. No app install. No login for kids. Just scan and play.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/signin"
            className="inline-flex items-center px-8 py-3 rounded-xl bg-violet-600 text-white font-semibold text-lg hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Up and running in 3 steps
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Parent signs up",
              desc: "Create your account with just an email. Magic link sign-in, no passwords to remember.",
              icon: "📧",
            },
            {
              step: "2",
              title: "Launch KidsClaw",
              desc: "Click one button. We spin up a private, secure game server just for your family in ~2 minutes.",
              icon: "🚀",
            },
            {
              step: "3",
              title: "Kids scan & play",
              desc: "Show your kid a QR code or text them a link. They open it on any phone or tablet and start playing instantly.",
              icon: "🎮",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-sm font-medium text-violet-600 mb-1">
                Step {item.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Games preview */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          A week of adventures
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          New games every day covering science, math, and space exploration.
          Each session is interactive, educational, and seriously fun.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🚀", name: "Mars Mission", topic: "Math" },
            { icon: "🔬", name: "Science Lab", topic: "Experiments" },
            { icon: "🛸", name: "Mission Design", topic: "Planning" },
            { icon: "🌌", name: "Space Trivia", topic: "Trivia" },
            { icon: "🔭", name: "Star Gazer", topic: "Astronomy" },
            { icon: "📏", name: "Space Scale", topic: "Measurement" },
            { icon: "✨", name: "What If...?", topic: "Creative" },
            { icon: "🎯", name: "More coming!", topic: "Soon" },
          ].map((game) => (
            <div
              key={game.name}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
            >
              <div className="text-3xl mb-2">{game.icon}</div>
              <div className="font-semibold text-gray-900 text-sm">
                {game.name}
              </div>
              <div className="text-xs text-gray-500">{game.topic}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        <p>KidsClaw &mdash; Safe, fun, educational AI games for kids.</p>
        <p>Copyright © 2026 Last Myle LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
