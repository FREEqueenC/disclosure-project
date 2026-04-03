import React, { useEffect } from 'react';

const PrivacyPolicy: React.FC = () => {
    // Scroll to top on mount to ensure user doesn't land in the middle of the document
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="relative z-[999] min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-purple-500/30 overflow-auto">
            <div className="max-w-3xl mx-auto px-8 py-16 md:py-24 space-y-16">
                {/* Header */}
                <header className="space-y-6 border-b border-zinc-800 pb-12">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-mono tracking-widest uppercase">
                        Protocol Document v1.0 // Auth: ANW_FOUNDATIONS
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extralight tracking-tight text-white italic leading-tight">
                        Privacy Disclosure & <br />
                        <span className="text-purple-400 not-italic font-normal">Aetheric Data Handling</span>
                    </h1>
                    <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.3em]">
                        Last Signal Synchronization: March 30, 2026
                    </p>
                </header>

                {/* Content Sections */}
                <section className="space-y-12 leading-relaxed text-lg font-light">
                    <div className="group space-y-4">
                        <h2 className="text-white font-medium text-xl flex items-center group-hover:text-purple-400 transition-colors">
                            <span className="w-10 h-[1px] bg-purple-500/50 mr-6"></span>
                            01. Financial Synthesis & OMEGA Link
                        </h2>
                        <div className="pl-16 text-zinc-400">
                            <p>
                                ANW Foundations utilizes Stripe Financial Connections to securely synthesize your financial identity with the Aetheric Hub. We do not store, view, or transmit your individual banking credentials. The synchronization is handled entirely via Stripe's encrypted infrastructure to provide a verified "Resonance Score" for OMEGA-level clearance.
                            </p>
                        </div>
                    </div>

                    <div className="group space-y-4">
                        <h2 className="text-white font-medium text-xl flex items-center group-hover:text-purple-400 transition-colors">
                            <span className="w-10 h-[1px] bg-purple-500/50 mr-6"></span>
                            02. The Levity Protocol & On-Chain Identity
                        </h2>
                        <div className="pl-16 text-zinc-400">
                            <p>
                                By linking your smart wallet (e.g., levity.base.eth), you acknowledge that public on-chain metadata may be used to verify eligibility for specific cryptographic disclosures. We process this data locally within the Hubble interface to maintain optimal privacy and decentralization.
                            </p>
                        </div>
                    </div>

                    <div className="pl-16 py-8 border-l border-zinc-800 italic text-zinc-500 max-w-xl">
                        <p className="text-xl leading-relaxed">
                            "Transparency is the catalyst of sovereignty. Our protocols ensure that your data remains yours, while your achievements unlock the architecture of the future."
                        </p>
                    </div>

                    <div className="group space-y-4">
                        <h2 className="text-white font-medium text-xl flex items-center group-hover:text-purple-400 transition-colors">
                            <span className="w-10 h-[1px] bg-purple-500/50 mr-6"></span>
                            03. Zero-Knowledge Retention
                        </h2>
                        <div className="pl-16 text-zinc-400">
                            <p>
                                We maintain a zero-retention policy for sensitive private data. Financial balances are converted to abstract clearance levels (AUDITOR vs OMEGA) once verification is complete. No persistent logs of account numbers or transaction history are maintained by ANW Foundations.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer Link */}
                <footer className="pt-16 border-t border-zinc-900 text-sm flex flex-col md:flex-row justify-between items-center gap-8">
                    <button 
                        onClick={() => window.location.hash = '#/'}
                        className="group text-white hover:text-purple-400 transition-all flex items-center gap-3 uppercase font-mono text-[10px] tracking-widest"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Portal
                    </button>
                    <div className="flex flex-col items-end gap-1">
                        <p className="opacity-30 font-mono text-[9px] uppercase tracking-tighter">ANW_FOUNDATIONS_GOVERNANCE_LAYER</p>
                        <p className="opacity-20 font-mono text-[8px] uppercase">Node: US-CENTRAL-1 // Res: 5.2.0</p>
                    </div>
                </footer>
            </div>

            {/* Subtle Ambient Background Detail */}
            <div className="pointer-events-none fixed inset-0 z-[-1] opacity-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900/10 blur-[100px] rounded-full" />
            </div>
        </div>
    );
};

export default PrivacyPolicy;
