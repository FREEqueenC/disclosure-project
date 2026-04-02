import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Hammer, X, Sparkles, Wand2 } from 'lucide-react';
import CymaticSigil from './CymaticSigil';
import DynamicSeal from './DynamicSeal';
import geniusesData from '../data/72_geniuses.json';
import './RitualLayer.css';

// Import local seals
import alphaSeal from '../assets/seals/alpha.png';
import sigmaSeal from '../assets/seals/sigma.png';

interface Manifestation {
    id: string;
    type: 'alpha' | 'sigma' | 'shem';
    name?: string;
    hebrew?: string;
    imageUrl?: string;
    color: string;
    x: number;
    y: number;
}

interface RitualLayerProps {
    clearance: string;
    balance: string;
    resonance: number;
}

// --- QUANTUM PARTICLE SYSTEM ---
class Particle {
    x: number; y: number; vx: number; vy: number; life: number; color: string;
    constructor(w: number, h: number, color: string) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.life = Math.random() * 0.5 + 0.2;
        this.color = color;
    }
    update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
    }
}

const RitualLayer: React.FC<RitualLayerProps> = ({ clearance, balance, resonance }: RitualLayerProps) => {
    const [manifestations, setManifestations] = useState<Manifestation[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const draggingId = useRef<string | null>(null);
    const offset = useRef({ x: 0, y: 0 });

    // --- PARTICLE VORTEX EFFECT ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = window.innerWidth;
        let h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;

        const particles: Particle[] = [];
        const count = clearance === 'OMEGA' ? 40 : 20; // Performance optimization
        const color = clearance === 'OMEGA' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(168, 85, 247, 0.1)';

        for (let i = 0; i < count; i++) {
            particles.push(new Particle(w, h, color));
        }

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.beginPath();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = color;

            particles.forEach((p: Particle, i: number) => {
                p.update(w, h);
                
                // Draw particle with glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Draw connections to nearby particles for "web" feel
                let connections = 0;
                for (let j = i + 1; j < particles.length; j++) {
                    if (connections >= 3) break; // Performance optimization
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        connections++;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(${clearance === 'OMEGA' ? '52, 211, 153' : '168, 85, 247'}, ${0.1 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });
            animationId = requestAnimationFrame(animate);
        };

        animate();
        
        const handleResize = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w;
            canvas.height = h;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, [clearance]);

    const invokeSeal = (type: 'alpha' | 'sigma' | 'shem') => {
        let name: string | undefined;
        let hebrew: string | undefined;
        let imageUrl: string | undefined;
        let color = type === 'alpha' ? 'rgba(234, 179, 8, 0.8)' : (type === 'sigma' ? 'rgba(34, 211, 238, 0.8)' : 'rgba(168, 85, 247, 0.8)');

        if (type === 'shem') {
            const genius = geniusesData[Math.floor(Math.random() * geniusesData.length)];
            name = genius.name;
            hebrew = genius.hebrew;
        }

        const hasBalance = parseFloat(balance.replace(/,/g, '')) > 1000000;
        const isOmega = clearance === 'OMEGA' || hasBalance;

        if (name === 'Vehuiah' || name === 'Jeliel') {
            if (!isOmega) {
                alert(`ACCESS DENIED: ${name} Resonance requires OMEGA Clearance or 1M+ LEV Stakes.`);
                return;
            }
            color = name === 'Vehuiah' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(234, 179, 8, 0.8)';
        }
        
        const newManifestation: Manifestation = {
            id: Math.random().toString(36).substr(2, 9),
            type, name, hebrew, imageUrl, color,
            x: window.innerWidth / 2 - 100,
            y: window.innerHeight / 2 - 100,
        };
        setManifestations(prev => [...prev, newManifestation]);
    };

    const removeManifestation = (id: string) => {
        setManifestations(prev => prev.filter(m => m.id !== id));
    };

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        draggingId.current = id;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!draggingId.current) return;
        setManifestations((prev: Manifestation[]) => prev.map((m: Manifestation) => {
            if (m.id === draggingId.current) {
                return { ...m, x: e.clientX - offset.current.x, y: e.clientY - offset.current.y };
            }
            return m;
        }));
    }, []);

    const handleMouseUp = () => { draggingId.current = null; };

    return (
        <div 
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
            onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        >
            <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none" />

            <div className="absolute bottom-24 right-6 pointer-events-auto space-y-4">
                <div className="bg-black/90 border border-yellow-500/20 p-4 backdrop-blur-3xl rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                    <h3 className="text-[9px] font-bold text-yellow-600/80 mb-3 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Sparkles className="w-3 h-3 animate-pulse" /> Ritual_Invoker
                    </h3>
                    <div className="flex gap-4">
                        <button onClick={() => invokeSeal('alpha')} title="Invoke Alpha Resonance" aria-label="Invoke Alpha Resonance" className="group relative w-12 h-12 border border-white/5 hover:border-yellow-500/40 bg-white/5 flex items-center justify-center transition-all">
                             <img src={alphaSeal} alt="A" className="w-8 h-8 opacity-40 group-hover:opacity-100 invert" />
                        </button>
                        <button onClick={() => invokeSeal('sigma')} title="Invoke Sigma Resonance" aria-label="Invoke Sigma Resonance" className="group relative w-12 h-12 border border-white/5 hover:border-cyan-500/40 bg-white/5 flex items-center justify-center transition-all">
                             <img src={sigmaSeal} alt="S" className="w-8 h-8 opacity-40 group-hover:opacity-100 invert" />
                        </button>
                        <button onClick={() => invokeSeal('shem')} title="Invoke Shemhamforash Sync" aria-label="Invoke Shemhamforash Sync" className="group relative w-12 h-12 border border-white/5 hover:border-purple-500/40 bg-white/5 flex items-center justify-center transition-all">
                             <Wand2 className="w-5 h-5 text-purple-400 opacity-40 group-hover:opacity-100" />
                        </button>
                    </div>
                </div>
            </div>

            {manifestations.map((m: Manifestation) => (
                <div
                    key={m.id}
                    className="absolute pointer-events-auto cursor-grab active:cursor-grabbing group ritual-manifestation"
                    style={{ left: m.x, top: m.y }}
                    onMouseDown={(e: React.MouseEvent) => handleMouseDown(e, m.id)}
                >
                    <div className="relative p-4 holographic-seal rounded-full">
                        {m.type === 'shem' && m.name ? (
                            <CymaticSigil name={m.name} hebrew={m.hebrew} size={160} color={m.color} />
                        ) : (
                            <DynamicSeal type={m.type as 'alpha' | 'sigma'} freq={resonance} color={m.color} />
                        )}
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); removeManifestation(m.id); }} title="Dismiss Resonance" aria-label="Dismiss Resonance" className="p-1.5 bg-black/80 border border-white/10 text-white rounded-full hover:bg-red-900/40 transition-colors">
                                <X className="w-2 h-2" />
                            </button>
                        </div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all">
                            <div className="text-[8px] font-mono px-2 py-1 border bg-black/90 border-white/10 text-cyan-400/80 whitespace-nowrap backdrop-blur-md">
                                {m.type === 'shem' ? `SYNC: ${m.name?.toUpperCase()}` : `${m.type.toUpperCase()}_STABLE`}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RitualLayer;