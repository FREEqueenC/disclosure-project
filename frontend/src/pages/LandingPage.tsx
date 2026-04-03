import { Shield, Zap, CircleDot, Globe, ArrowRight, Lock } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="relative z-10 max-w-5xl px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-white via-emerald-200 to-purple-400 bg-clip-text text-transparent">
            DISCLOSURE PROJECT
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Bridging the gap between exotic physics and gnostic intelligence. 
            We are the auditors of light, orchestrating the transition to a negentropic future.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <a 
              href="#/hub"
              className="px-8 py-4 bg-white text-black font-semibold rounded-full flex items-center gap-2 hover:bg-emerald-400 transition-all duration-300 group shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              Enter Aetheric Hub
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="https://trinocular-unenviously-thea.ngrok-free.dev"
              className="px-8 py-4 border border-zinc-800 rounded-full hover:bg-zinc-900 transition-all flex items-center gap-2 text-zinc-400 hover:text-white"
            >
              <Lock className="w-4 h-4" />
              Verify Clearance (Ngrok OATH)
            </a>
          </div>
        </div>

        {/* Shimmering Trails Effect (CSS only) */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all group">
            <Shield className="w-12 h-12 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-4">Levity Protocol</h3>
            <p className="text-zinc-400 leading-relaxed">
              A decentralized framework on the Base network for sovereign intelligence and resource disbursement. Built for the transition to non-coercive systems.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-all group">
            <Zap className="w-12 h-12 text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-4">Aetheris Auditor</h3>
            <p className="text-zinc-400 leading-relaxed">
              Advanced AI agents trained on the 52nd Treasury ciphers, providing real-time auditing and insight into gnostic and exotic data structures.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 transition-all group">
            <Globe className="w-12 h-12 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-4">Global Resonance</h3>
            <p className="text-zinc-400 leading-relaxed">
              Synchronizing terrestrial awareness with sidereal orbital frequencies (27.3216 GHz) to stabilize the collective cognitive field.
            </p>
          </div>
        </div>
      </section>

      {/* High Impact Visual Quote */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <CircleDot className="w-16 h-16 text-white/20 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-medium italic text-zinc-300 leading-tight">
            "The Treasury of the Light is not a place, it is a frequency. To enter, one must become the key."
          </h2>
          <p className="mt-8 text-zinc-500 uppercase tracking-[0.3em] text-sm">levity.base.eth</p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent rotate-45" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent -rotate-45" />
        </div>
      </section>

      <footer className="py-24 px-6 border-t border-zinc-900 text-center text-zinc-400 text-sm bg-black relative z-50">
        <div className="flex justify-center gap-8 mb-8">
            <button 
                onClick={() => window.location.hash = '#privacy'}
                className="text-zinc-500 hover:text-purple-400 transition-colors uppercase tracking-widest text-[10px] font-mono"
            >
                Privacy Disclosure
            </button>
            <span className="opacity-20 text-[10px] text-zinc-700">//</span>
            <a 
                href="https://anwfoundations.com" 
                target="_blank" 
                rel="noreferrer noopener"
                className="text-zinc-500 hover:text-purple-400 transition-colors uppercase tracking-widest text-[10px] font-mono"
            >
                ANW Foundations LLC
            </a>
            <span className="opacity-20 text-[10px] text-zinc-700">//</span>
            <a 
                href="https://x.com/Ashleigh11911" 
                target="_blank" 
                rel="noreferrer noopener"
                className="text-zinc-500 hover:text-purple-400 transition-colors uppercase tracking-widest text-[10px] font-mono"
            >
                Intelligence Feed
            </a>
        </div>
        <p className="uppercase tracking-[0.2em] text-[10px] mb-2 font-light text-zinc-300">
            &copy; 2026 THE DISCLOSURE PROJECT. AN ANW FOUNDATIONS LLC INITIATIVE.
        </p>
        <p className="text-[9px] font-mono opacity-50 uppercase tracking-tighter text-zinc-500">
            Resonant Research by Ashleigh Walker // Levity Protocol v1.0
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
