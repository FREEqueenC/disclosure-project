import React from 'react';
import { Shield, Database, FileSearch, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans flex flex-col">
      {/* Header */}
      <header className="h-20 border-b border-zinc-900 flex items-center px-8 justify-between z-50 relative bg-black/50 backdrop-blur-md">
        <div className="text-xl font-bold tracking-[0.2em]">
          DISCLOSURE <span className="text-emerald-500">//</span> PROJECT
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-20 px-6">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-block border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-mono mb-8 uppercase tracking-widest">
              Intelligence & File Analysis Terminal
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-zinc-100">
              Disseminating Truth from Narrative.
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
              An AI-powered workspace designed to cross-reference declassified documents, whistleblower testimonies, and UAP intelligence to identify truth and expose false narratives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="#/workspace"
                className="px-8 py-4 bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-2 hover:bg-emerald-500 transition-all duration-300"
              >
                Enter Workspace
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-[#050505] border-t border-zinc-900">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800">
              <FileSearch className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-zinc-200">AI File Analysis</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Upload declassified PDFs, reports, and data. Our AI extracts entities, summarizes findings, and cross-references known intelligence databases.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800">
              <Shield className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-zinc-200">Narrative Dissemination</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Evaluate testimonies against established facts to identify disinformation campaigns, contradictions, and verified phenomena.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800">
              <Database className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-zinc-200">Categorized Intel</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Dedicated workspaces for UAP/NHI encounters, advanced physics, black budget programs, and official government releases.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-8 border-t border-zinc-900 text-center text-zinc-500 text-xs bg-black">
        <div className="flex justify-center gap-6 mb-6">
            <button onClick={() => window.location.hash = '#privacy'} className="hover:text-emerald-400 transition-colors uppercase tracking-widest font-mono">
                Privacy
            </button>
            <a href="https://anwfoundations.com" target="_blank" rel="noreferrer noopener" className="hover:text-emerald-400 transition-colors uppercase tracking-widest font-mono">
                ANW Foundations
            </a>
        </div>
        <p className="uppercase tracking-[0.2em] font-light">
            &copy; 2026 THE DISCLOSURE PROJECT.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;