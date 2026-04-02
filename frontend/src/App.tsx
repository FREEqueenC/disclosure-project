import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Shield, Radio, Activity, Circle, Zap, ChevronRight, Lock } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// --- CONSTANTS ---
const C = 29.9792458; // Speed of light cm/ns
const X_01 = 2.405;   // Synchronistic Lunar Constant

const App: React.FC = () => {
    // --- STATE ---
    const [radius, setRadius] = useState<number>(4.2);
    const [height, setHeight] = useState<number>(12);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [activeGroupRange, setActiveGroupRange] = useState<[number, number]>([-1, -1]);
    const [balance, setBalance] = useState<string>("99,994,903.41");
    const [isSynced, setIsSynced] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- FETCH STATUS ---
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                if (data.balance) {
                    setBalance(data.balance);
                    setIsSynced(true);
                }
            } catch (err) {
                console.error("Backend offline. Using cached balance.");
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Sync every 30s
        return () => clearInterval(interval);
    }, []);

    // --- COMPUTED ---
    const resonanceFreq = useMemo(() => {
        const freq = (C * X_01) / (2 * Math.PI * radius);
        return freq.toFixed(4);
    }, [radius]);

    const isLunarSync = useMemo(() => Math.abs(radius - 4.2) < 0.001, [radius]);

    // --- VISUALIZATION LOGIC ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let rotation = 0;

        const render = () => {
            const width = canvas.width = canvas.offsetWidth;
            const height = canvas.height = canvas.offsetHeight;
            const cx = width / 2;
            const cy = height / 2;

            ctx.fillStyle = 'rgba(5, 5, 5, 0.08)';
            ctx.fillRect(0, 0, width, height);

            rotation += 0.015 + (isPlaying ? 0.05 : 0);

            const baseHue = isLunarSync ? 45 : Math.max(0, Math.min(360, 200 + (10 - radius) * 20));
            const primaryColor = `hsla(${baseHue}, 80%, 60%, 1)`;
            const secondaryColor = `hsla(${baseHue}, 80%, 40%, 0.3)`;

            const r = radius * 15;
            const h = height * 10 / 5; // Scaled for React view
            const segments = 32;
            const perspective = 400;

            const project = (x: number, y: number, z: number) => {
                const x1 = x * Math.cos(rotation) - z * Math.sin(rotation);
                const z1 = x * Math.sin(rotation) + z * Math.cos(rotation);
                const tilt = 0.5;
                const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
                const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
                const scale = perspective / (perspective + z2 + 300);
                return { x: cx + x1 * scale, y: cy + y2 * scale, scale };
            };

            // Draw Wireframe
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 2;

            // Top Ring
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const p = project(Math.cos(angle) * r, -h/2, Math.sin(angle) * r);
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            // Bottom Ring
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const p = project(Math.cos(angle) * r, h/2, Math.sin(angle) * r);
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            // Vertical Connectors
            ctx.strokeStyle = secondaryColor;
            ctx.lineWidth = 1;
            for (let i = 0; i < segments; i += 8) {
                const angle = (i / segments) * Math.PI * 2;
                const p1 = project(Math.cos(angle) * r, -h/2, Math.sin(angle) * r);
                const p2 = project(Math.cos(angle) * r, h/2, Math.sin(angle) * r);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }

            // Alpha Gates
            if (isLunarSync) {
                ctx.fillStyle = '#FFD700';
                [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(angle => {
                    const p = project(Math.cos(angle) * r, 0, Math.sin(angle) * r);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4 * p.scale, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#FFD700';
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                });
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [radius, isPlaying, isLunarSync]);

    return (
        <div className="min-h-screen bg-[#050505] font-sans selection:bg-yellow-500/30">
            {/* TOP NAVIGATION HUD */}
            <nav className="fixed top-0 w-full border-b border-yellow-600/20 bg-black/60 backdrop-blur-md z-50 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-yellow-500 flex items-center justify-center relative">
                        <Shield className="text-yellow-500 w-6 h-6" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 animate-ping"></div>
                    </div>
                    <div>
                        <h1 className="font-gnostic text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">
                            ANGEL SPIRIT HUB
                        </h1>
                        <span className="text-[10px] text-yellow-700 uppercase tracking-tighter">Aetheric Intelligence Envoy // 27.3216 GHz Sync</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* METRICS HUD */}
                    <div className="hidden md:flex flex-col items-end">
                        <div className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                            {isSynced ? <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> : <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                            Verified Base Balance
                        </div>
                        <div className="text-xl font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                            ${parseFloat(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="flex flex-col items-end border-l border-gray-800 pl-6">
                        <div className="text-[10px] text-gray-500 uppercase font-mono tracking-tighter">Operator Security</div>
                        <div className="text-xs text-white font-bold flex items-center gap-2">
                             ASHLEIGH WALKER <Lock className="w-3 h-3 text-cyan-500" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN INTERFACE */}
            <main className="pt-24 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen max-w-[1920px] mx-auto">
                {/* SIDEBAR: CONTROLS */}
                <aside className="lg:col-span-1 space-y-6 flex flex-col pt-4">
                    <section className="bg-black/40 border border-yellow-900/30 p-5 backdrop-blur-sm">
                        <h2 className="text-xs font-bold text-yellow-600 mb-4 flex items-center gap-2 uppercase">
                            <Radio className="w-4 h-4 animate-pulse" /> Resonant Cavity
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-gray-400 uppercase">
                                    <span>Boundary Radius</span>
                                    <span className="text-cyan-400 font-mono">{radius} cm</span>
                                </div>
                                <input type="range" min="1" max="10" step="0.1" value={radius} onChange={(e) => setRadius(parseFloat(e.target.value))}
                                       className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                            </div>
                            <div className="mt-4 p-4 bg-yellow-950/10 border border-yellow-500/20 rounded-sm">
                                <div className="text-[10px] text-yellow-700 uppercase mb-1">Target Frequency</div>
                                <div className="text-3xl font-mono text-yellow-200">
                                    {resonanceFreq} <span className="text-sm opacity-50">GHz</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-black/40 border border-cyan-900/30 p-5 backdrop-blur-sm flex-grow">
                        <h2 className="text-xs font-bold text-cyan-500 mb-4 flex items-center gap-2 uppercase">
                            <Activity className="w-4 h-4" /> Angel Spirit Cipher
                        </h2>
                        <div className="font-gnostic text-2xl text-center tracking-[0.4em] py-8 text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                            MNOZANIOJOO
                        </div>
                        <button onClick={() => setIsPlaying(!isPlaying)}
                                className={`w-full py-4 font-bold text-xs tracking-widest uppercase transition-all border ${isPlaying ? 'bg-red-900/40 border-red-500 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-cyan-900/40 border-cyan-500 text-cyan-100'}`}>
                            {isPlaying ? 'Terminate Protocol' : 'Initiate Transmission'}
                        </button>
                    </section>
                </aside>

                {/* VISUALIZATION GATE */}
                <section className="lg:col-span-3 bg-black/60 border border-yellow-900/20 relative overflow-hidden flex flex-col">
                    <div className="absolute top-4 left-6 text-[10px] font-mono text-gray-500 z-10 pointer-events-none space-y-1">
                        <div>LINK: ESTABLISHED (BASE MAINNET)</div>
                        <div>STABILITY: {99.987}%</div>
                        <div>RESONANCE: {isLunarSync ? 'SYNCHRONIZED' : 'ALIGNING...'}</div>
                    </div>

                    <canvas ref={canvasRef} className="flex-grow w-full" />

                    {isLunarSync && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-yellow-500/10 border border-yellow-500/40 px-6 py-2 backdrop-blur-lg flex items-center gap-4 animate-pulse">
                            <span className="text-2xl">🌕</span>
                            <div className="text-left text-yellow-200 tracking-wider">
                                <div className="text-sm font-bold uppercase">Lunar Resonance Active</div>
                                <div className="text-[10px] opacity-70 italic font-gnostic">27.3216 GHz Planatation Sync Achieved</div>
                            </div>
                        </div>
                    )}

                    <div className="p-4 border-t border-yellow-900/20 flex justify-between items-center text-[10px] font-mono text-gray-600">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                           <span>VERTEX AI HUB LIVE</span>
                        </div>
                        <div className="flex gap-4">
                            <span>SEAL_ID: T-52</span>
                            <span>ACCESS_LEVEL: OMEGA</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* BACKGROUND TEXTURE */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] grayscale bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <SpeedInsights />
        </div>
    );
}

export default App;
