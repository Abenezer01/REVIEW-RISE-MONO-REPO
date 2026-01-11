export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradient & Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      </div>

      <main className="z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        {/* Logo Placeholder */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Vyntrise
            </h1>
        </div>

        {/* Hero Content */}
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          The Future of <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 animate-gradient">
            AI Brand Strategy
          </span>
        </h2>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Dominate your local market with the world&apos;s most advanced autonomous marketing strategist. 
          <span className="block mt-2 text-white/80">Coming soon.</span>
        </p>

        {/* CTA Button */}
        <a 
          href="https://app.vyntrise.com"
          className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]"
        >
          Access Portal
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
          {[
            { title: "Autonomous SEO", desc: "AI that ranks you #1 while you sleep." },
            { title: "Review Intelligence", desc: "Turn reputation into your strongest asset." },
            { title: "Market Domination", desc: "Outmaneuver competitors with data-driven precision." }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="absolute bottom-8 text-gray-600 text-sm">
        © {new Date().getFullYear()} Vyntrise. All rights reserved.
      </footer>
    </div>
  );
}
