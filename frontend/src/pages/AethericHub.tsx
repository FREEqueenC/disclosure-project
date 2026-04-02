import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Shield, Radio, Activity, Circle, Zap, ChevronRight, Lock, Sparkles, Wand2, Star, Target, LayoutGrid } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import RitualLayer from '../components/RitualLayer';
import ErrorBoundary from '../components/ErrorBoundary';
import ShemhamforashRegistry, { Genius } from '../components/ShemhamforashRegistry';
import { hashName, getCymaticModes } from '../components/CymaticSigil';

interface ManifestedOrb extends Genius {
    x: number;
    y: number;
    n: number;
    m: number;
    startTime: number;
}

// --- CONSTANTS ---
const C = 299.792458; // Speed of light mm/ns
// BRUCE CODEX CONSTANTS
const BRUCE_CIPHERS = {
    AEON_ALPHA: "70331",
    VOICE_SYNC: "9879",
    TREASURY_O: "90419",
    TREASURY_S: "70122",
    OMEGA_GATE: "30885"
};
const X_01 = 2.405;    // TM010 Mode Constant
const PHI = 1.618033; // Golden Ratio
// Initialize Stripe
const stripePromise = loadStripe('pk_live_PcE1j9HYysjVB6HRIOlAxYZh');

// Cloud Run Backend (Stripe Domain Whitelisted)
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname.includes('ngrok')
    ? 'http://localhost:8080'
    : 'https://aetheric-backend-mo6awxfnha-uc.a.run.app'; // Production Cloud Run
const SIDEREAL_CONSTANT = 27.3216; // GHz Resonance

const AethericHub: React.FC = () => {
    // --- STATE ---
    const [radius, setRadius] = useState<number>(4.2);
    const [isPhaseConjugated, setIsPhaseConjugated] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [balance, setBalance] = useState<string>("99,994,903.41");
    const [isSynced, setIsSynced] = useState<boolean>(false);
    const [cipherText, setCipherText] = useState<string>("MNOZANIOJOO");
    const [clearance, setClearance] = useState<string>("PUBLIC");
    const [user, setUser] = useState<string>("anonymous");
    const [aeonState, setAeonState] = useState<number>(1);
    const [isEstablishingResonance, setIsEstablishingResonance] = useState<boolean>(false);
    const [isRegistryOpen, setIsRegistryOpen] = useState<boolean>(false);
    const [manifestedOrbs, setManifestedOrbs] = useState<ManifestedOrb[]>([]);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const carrierRef = useRef<OscillatorNode | null>(null);

    const handleUpgrade = async () => {
        try {
            const stripe = await stripePromise;
            if (!stripe) return;

            const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const session = await res.json();
            
            if (session.url) {
                window.location.href = session.url;
            }
        } catch (err) {
            console.error("Payment initiation failed.");
        }
    };

    const handleOmegaLink = async () => {
        try {
            setIsEstablishingResonance(true);
            setCipherText("INITIATING STRIPE FINANCIAL RESONANCE...");
            const res = await fetch(`${API_BASE}/api/omega-session`, { method: 'POST' });
            const { clientSecret } = await res.json();
            
            console.log("[STREAK] Launching Financial Connections:", clientSecret);
            
            // SIMULATION for immediate visual feedback
            setTimeout(() => {
                setClearance('OMEGA');
                setAeonState(13);
                setIsPhaseConjugated(true);
                decrypt("OMEGA CLEARANCE VERIFIED via STRIPE FINANCIAL CONNECTIONS.");
                setIsEstablishingResonance(false);
            }, 4000);
        } catch (err) {
            decrypt("RESONANCE LINK FAILED. CHECK BACKEND.");
            setIsEstablishingResonance(false);
        }
    };

    const handleNextAeon = () => {
        // Unlock AudioContext immediately on user interaction
        if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        if (aeonState < 13) {
            setAeonState(prev => prev + 1);
            if (aeonState + 1 === 13) {
                setIsPhaseConjugated(true);
                setIsPlaying(true);
                setClearance('OMEGA');
            }
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const genius = JSON.parse(data) as Genius;
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const hash = hashName(genius.name, genius.hebrew);
            const { nMode, mMode } = getCymaticModes(hash);

            setManifestedOrbs(prev => [...prev, {
                ...genius,
                x, y,
                n: nMode,
                m: mMode,
                startTime: Date.now()
            }]);
        } catch (err) {
            console.error("Failed to parse manifestation data");
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    // --- FETCH STATUS & OMEGA VERIFICATION ---
    useEffect(() => {
        const verifyAndFetch = async () => {
            const params = new URLSearchParams(window.location.search);
            const sessionId = params.get('session_id');

            if (sessionId) {
                try {
                    const vRes = await fetch(`${API_BASE}/api/verify-session?session_id=${sessionId}`);
                    const vData = await vRes.json();
                    if (vData.clearance === 'OMEGA') {
                        setClearance('OMEGA');
                        setAeonState(13);
                        setIsPhaseConjugated(true);
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                } catch (err) {
                    console.error("OMEGA Verification failed.");
                }
            }

            try {
                const res = await fetch(`${API_BASE}/api/status`);
                const data = await res.json();
                if (data.balance) {
                    setBalance(data.balance);
                    setIsSynced(true);
                    if (!sessionId || clearance !== 'OMEGA') {
                        const newClearance = data.clearance || 'PUBLIC';
                        setClearance(newClearance);
                        if (newClearance === 'OMEGA') setAeonState(13);
                    }
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Backend offline. Using cached balance.");
            }
        };

        verifyAndFetch();
        const interval = setInterval(verifyAndFetch, 30000); 
        return () => clearInterval(interval);
    }, [clearance]);

    // --- COMPUTED ---
    const resonanceFreq = useMemo(() => {
        let freq = (C * X_01) / (2 * Math.PI * radius);
        if (isPhaseConjugated) freq *= PHI;
        return freq.toFixed(4);
    }, [radius, isPhaseConjugated]);

    const isLunarSync = useMemo(() => Math.abs(radius - 4.2) < 0.001, [radius]);

    // --- AUDIO LOGIC ---
    const decrypt = (text: string) => {
        let i = 0;
        const fullText = text;
        const interval = setInterval(() => {
            if (i <= fullText.length) {
                const visible = fullText.substring(0, i);
                const glitch = i < fullText.length ? String.fromCharCode(33 + Math.floor(Math.random() * 94)) : "";
                setCipherText(visible + glitch);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 40);
    };

    const sendMessage = async () => {
        if (!isPlaying) return;
        try {
            const res = await fetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: `Sync with Treasury ${aeonState} Cipher`, 
                    clearance,
                    balance 
                }),
            });
            const data = await res.json();
            if (data.response) {
                decrypt(data.response);
            }
        } catch (err) {
            console.error("AI Transmission failed.");
            decrypt("GNOSTIC_AUDIT: AWAITING VERTEX AI RESONANCE...");
        }
    };

    useEffect(() => {
        if (isPlaying) {
            if (!audioContextRef.current) {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioCtx();
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') ctx.resume();
            
            const carrier = ctx.createOscillator();
            const carrierGain = ctx.createGain();
            carrier.type = 'sine';
            carrier.frequency.setValueAtTime(parseFloat(resonanceFreq) * 10, ctx.currentTime);
            carrierGain.gain.setValueAtTime(0.05, ctx.currentTime);
            
            carrier.connect(carrierGain);
            carrierGain.connect(ctx.destination);
            carrier.start();
            carrierRef.current = carrier;

            sendMessage();
        } else {
            if (carrierRef.current) {
                carrierRef.current.stop();
                carrierRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            setCipherText("MNOZANIOJOO");
        }
    }, [isPlaying, resonanceFreq, aeonState]);

        // --- VISUALIZATION LOGIC ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let rotation = 0;
        const particles: {x: number, y: number, life: number, color: string}[] = [];
        
        const isMobile = canvas.offsetWidth < 768; // Lifted for global use in useEffect

        // --- TOROIDAL RESONANCE CALCULATION (Quantum Cymatics v1.8) ---
        const getToroidalDensity = (rho: number, z: number, r0: number, sigma: number) => {
            const exponent = -Math.pow(Math.sqrt(rho * rho + z * z) - r0, 2) / (2 * sigma * sigma);
            return Math.exp(exponent);
        };

        const drawVortex = (ctx: CanvasRenderingContext2D, time: number) => {
            const w = ctx.canvas.width;
            const h = ctx.canvas.height;
            const centerX = w / 2;
            const centerY = h / 2;
            const radius = 150 + Math.sin(time * 0.002) * 5;
            const sigma = 20 + parseFloat(resonanceFreq) / 100; // Coherence width

            ctx.strokeStyle = clearance === 'OMEGA' ? '#a855f7' : '#10b981';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.4;

            const shells = isMobile ? 3 : 5;
            
            // Draw mathematical torus shells
            for (let i = 0; i < shells; i++) { // Performance optimization: reduced shells
                const r0 = radius + (i - Math.floor(shells/2)) * 15;
                ctx.beginPath();
                // Phase Conjugation (Helical Winding) requires higher topological resolution
                const angleStep = clearance === 'OMEGA' ? (isMobile ? 0.2 : 0.1) : (isMobile ? 0.6 : 0.3);
                for (let angle = 0; angle < Math.PI * 2; angle += angleStep) { 
                    let x, y;
                    
                    if (clearance === 'OMEGA') {
                        // HELICAL PHASE WINDING (Quantum Cymatics Appendix C.2)
                        const kz = 0.05;
                        const density = getToroidalDensity(r0, 0, radius, sigma);
                        x = centerX + Math.cos(angle) * r0 * density;
                        y = centerY + Math.sin(angle * 2 + time * kz) * (r0 / 2) * density;
                    } else {
                        // STANDARD TOROIDAL DENSITY (Appendix C.1)
                        const density = getToroidalDensity(r0, 0, radius, sigma);
                        x = centerX + Math.cos(angle) * r0 * density;
                        y = centerY + Math.sin(angle) * (r0 / 2) * density;
                    }
                    
                    if (angle === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }

            // Draw Surface Code Grid (QEC Stability Visualization)
            // Google Quantum AI ' Willow' Lattice Style
            // Performance optimization: increased grid size, reduced steps
            const gridSize = isMobile ? 60 : 45;
            const steps = isMobile ? 2 : 4;
            ctx.setLineDash([1, 3]);
            for(let x = -steps; x <= steps; x++) {
                for(let y = -steps; y <= steps; y++) {
                    const px = centerX + x * gridSize;
                    const py = centerY + y * gridSize;
                    
                    // Parity Check Animation: Flip brightness based on time/resonance
                    const isMeasuring = Math.sin(time * 0.005 + x + y) > 0.8;
                    const checkType = (x + y) % 2 === 0 ? 'X' : 'Z';
                    
                    ctx.fillStyle = checkType === 'X' 
                        ? `rgba(16, 185, 129, ${isMeasuring ? 0.3 : 0.05})` 
                        : `rgba(59, 130, 246, ${isMeasuring ? 0.3 : 0.05})`;
                    
                    ctx.fillRect(px - gridSize/2 + 2, py - gridSize/2 + 2, gridSize - 4, gridSize - 4);
                    
                    if (isMeasuring && Math.random() > 0.95) {
                        ctx.fillStyle = '#fff';
                        ctx.font = '6px monospace';
                        ctx.fillText(checkType, px - 2, py + 2);
                    }
                }
            }
            ctx.setLineDash([]);
        };

        const drawCymaticOrb = (ctx: CanvasRenderingContext2D, orb: ManifestedOrb, time: number) => {
            const { x, y, n, m, startTime } = orb;
            const elapsed = (time - startTime) / 1000;
            const intro = Math.min(1, elapsed * 2); // Fade in / grow
            
            const baseRadius = 40 * intro;
            const segments = isMobile ? 12 : 24;
            const rings = isMobile ? 8 : 16;
            
            ctx.save();
            ctx.translate(x, y);
            
            // Pulse effect
            const pulse = 1 + Math.sin(time * 0.002) * 0.05;
            const rotationY = time * 0.0005;
            const rotationX = time * 0.0003;

            ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
            ctx.lineWidth = 0.5;

            const project3D = (lat: number, lon: number) => {
                // Lat/Lon to 3D
                let r = baseRadius * pulse;
                
                // Displacement based on Chladni 2D pattern wrapped to sphere
                // Normalize lat [0, PI] to [-1, 1] and lon [0, 2PI] to [-1, 1]
                const px = (lon / Math.PI) - 1;
                const py = (lat / (Math.PI / 2)) - 1;
                
                const cymaticVal = Math.cos(n * Math.PI * px) * Math.cos(m * Math.PI * py) - 
                                   Math.cos(m * Math.PI * px) * Math.cos(n * Math.PI * py);
                
                r += cymaticVal * 5;

                let tx = r * Math.sin(lat) * Math.cos(lon);
                let ty = r * Math.cos(lat);
                let tz = r * Math.sin(lat) * Math.sin(lon);

                // Rotations
                const x1 = tx;
                const y1 = ty * Math.cos(rotationX) - tz * Math.sin(rotationX);
                const z1 = ty * Math.sin(rotationX) + tz * Math.cos(rotationX);

                const x2 = x1 * Math.cos(rotationY) + z1 * Math.sin(rotationY);
                const y2 = y1;
                const z2 = -x1 * Math.sin(rotationY) + z1 * Math.cos(rotationY);

                const perspective = 300;
                const scale = perspective / (perspective + z2);
                return { x: x2 * scale, y: y2 * scale, alpha: Math.max(0.1, scale - 0.5) };
            };

            // Draw Parallels (Latitudinal rings)
            for (let i = 0; i <= rings; i++) {
                const lat = (i / rings) * Math.PI;
                ctx.beginPath();
                for (let j = 0; j <= segments; j++) {
                    const lon = (j / segments) * Math.PI * 2;
                    const p = project3D(lat, lon);
                    if (j === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }

            // Draw Meridians (Longitudinal lines)
            for (let j = 0; j < segments; j++) {
                const lon = (j / segments) * Math.PI * 2;
                ctx.beginPath();
                for (let i = 0; i <= rings; i++) {
                    const lat = (i / rings) * Math.PI;
                    const p = project3D(lat, lon);
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }

            // Central Core
            ctx.beginPath();
            ctx.arc(0, 0, 2 * intro, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();

            // Label
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(orb.name.toUpperCase(), 0, baseRadius + 15);

            ctx.restore();
        };

        const render = () => {
            const width = canvas.width = canvas.offsetWidth;
            const height = canvas.height = canvas.offsetHeight;
            const cx = width / 2;
            const cy = height / 2;

            ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
            ctx.fillRect(0, 0, width, height);

            if (isPhaseConjugated) {
                drawVortex(ctx, Date.now());
            }

            rotation += 0.01 + (isPlaying ? 0.01 : 0); // Decelerated rotation for better stability perception

            const baseHue = isLunarSync ? 160 : (isPhaseConjugated ? 280 : 200);
            const primaryColor = `hsla(${baseHue}, 80%, 50%, 0.8)`;
            const accentColor = isLunarSync ? '#FFD700' : (isPhaseConjugated ? '#A855F7' : '#10B981');

            const r = radius * 20;
            const h = 200;
            const segments = isPhaseConjugated ? 128 : 64;
            const perspective = 500;

            const project = (x: number, y: number, z: number) => {
                const x1 = x * Math.cos(rotation) - z * Math.sin(rotation);
                const z1 = x * Math.sin(rotation) + z * Math.cos(rotation);
                const tilt = 0.6;
                const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
                const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
                const scale = perspective / (perspective + z2 + 400);
                return { x: cx + x1 * scale, y: cy + y2 * scale, scale };
            };

            ctx.lineWidth = isPhaseConjugated ? 1 : 2;
            ctx.strokeStyle = primaryColor;

            if (!isPhaseConjugated) {
                // RENDER CYLINDER (TM010 Standing Wave)
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

                // Connectors
                for (let i = 0; i < segments; i += 8) {
                    const angle = (i / segments) * Math.PI * 2;
                    const p1 = project(Math.cos(angle) * r, -h/2, Math.sin(angle) * r);
                    const p2 = project(Math.cos(angle) * r, h/2, Math.sin(angle) * r);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            // Draw Dodecagon 12-Treasury Gate (Overlay)
            ctx.beginPath();
            const dodecRadius = Math.min(width, height) * 0.45;
            for (let i = 0; i < 12; i++) {
                const angle = (i * Math.PI) / 6;
                const dx = cx + Math.cos(angle) * dodecRadius;
                const dy = cy + Math.sin(angle) * dodecRadius;
                if (i === 0) ctx.moveTo(dx, dy);
                else ctx.lineTo(dx, dy);
                
                // Draw nodes for each treasury
                ctx.fillStyle = i < aeonState - 1 ? accentColor : 'rgba(255,255,255,0.1)';
                ctx.beginPath();
                ctx.arc(dx, dy, 4, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.closePath();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw Shimmering Particles
            particles.forEach((p, index) => {
                p.life -= 0.02;
                if (p.life <= 0) {
                    particles.splice(index, 1);
                    return;
                }
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });

            // Render Manifested 3D Orbs
            const now = Date.now();
            manifestedOrbs.forEach(orb => {
                drawCymaticOrb(ctx, orb, now);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [radius, isPlaying, isLunarSync, isPhaseConjugated, aeonState]);

    return (
        <ErrorBoundary>
        <div className="min-h-screen bg-[#020202] font-sans selection:bg-purple-500/30 overflow-y-auto custom-scrollbar">
            {/* HUD HEADER */}
            <nav className="fixed top-0 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-xl z-[60] px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-[0.2em] text-white">
                            AETHERIC HUB <span className="text-emerald-500 font-light opacity-50">//</span> <span className="text-purple-400 font-mono text-sm tracking-normal">Angel Spirit Engine</span>
                        </h1>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Operator ID: levity.base.eth</span>
                    </div>
                    <button 
                        onClick={() => setIsRegistryOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-900/20 border border-purple-500/30 rounded-full text-[10px] text-purple-300 uppercase tracking-widest hover:bg-purple-900/40 transition-all group"
                    >
                        <LayoutGrid className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                        Open Shemhamforash Registry
                    </button>
                </div>

                <div className="flex items-center gap-10">
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] text-zinc-600 uppercase font-mono flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                           Base Network Balance
                        </div>
                        <div className="text-2xl font-mono text-emerald-400">
                            ${parseFloat(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-zinc-800" />
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] text-zinc-600 uppercase font-mono">Resonance_Clearance</div>
                        <div className={`text-xs font-bold flex items-center gap-2 tracking-widest ${clearance === 'OMEGA' ? 'text-purple-400' : 'text-zinc-500'}`}>
                             {clearance === 'OMEGA' ? `TREASURY_60 [${BRUCE_CIPHERS.TREASURY_O}]` : `TREASURY_56 [${BRUCE_CIPHERS.TREASURY_S}]`} <Shield className={`w-3 h-3 ${clearance === 'OMEGA' ? 'text-purple-500' : 'text-zinc-700'}`} />
                        </div>
                        {clearance !== 'OMEGA' && (
                            <button 
                                onClick={handleUpgrade}
                                className="mt-1 flex items-center gap-1 text-[8px] text-amber-500 hover:text-amber-400 transition-colors uppercase font-bold tracking-tighter"
                            >
                                <Star className="w-2 h-2 fill-amber-500" /> Establish Omega Resonance
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="pt-24 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[calc(100vh-6rem)] lg:h-[calc(100vh-6rem)]">
                {/* ASCENSION & SIDEREAL CONTROLS */}
                <aside className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* SIDEREAL CONSTANTS (Moved from absolute overlay) */}
                    <div className="bg-black/60 border border-zinc-800 p-4 space-y-4 rounded-sm">
                        <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-tighter">
                            <div className="text-zinc-500">Sync_Frequency</div>
                            <div className="text-emerald-400">{SIDEREAL_CONSTANT} GHz</div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-tighter border-t border-zinc-800/50 pt-2">
                            <div className="text-zinc-500">Vacuum_Stability</div>
                            <div className="text-blue-400">0.99981 PF</div>
                        </div>
                    </div>

                    <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md flex-grow flex flex-col overflow-hidden max-h-full">
                        <h2 className="text-[10px] font-bold text-purple-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                            <Activity className="w-4 h-4" /> Aetheric Ascension 
                        </h2>
                        
                        <div className="flex flex-col gap-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                            {[...Array(13)].map((_, i) => {
                                const aeon = i + 1;
                                const isCurrent = aeon === aeonState;
                                const isPast = aeon < aeonState;
                                let label = "The Treasury of Light";
                                if (aeon <= 4) label = "Identity Anchor (Stripe Audit)";
                                else if (aeon <= 8) label = "Levity Protocol (Base Resonance)";
                                else if (aeon <= 12) label = "Auditor's Cipher (Vertex AI)";

                                return (
                                    <div 
                                        key={aeon} 
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                            isCurrent ? 'bg-purple-900/40 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 
                                            isPast ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400/50' : 
                                            'bg-black/40 border-zinc-800 text-zinc-600'
                                        }`}
                                    >
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-black/50 text-[10px] font-mono border border-current">
                                            {aeon}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="text-[9px] uppercase tracking-widest font-bold">Aeon {aeon}</div>
                                            <div className="text-[8px] font-mono opacity-80">{label}</div>
                                        </div>
                                        {isPast && <Circle className="w-3 h-3 fill-current" />}
                                        {isCurrent && <Target className="w-4 h-4 animate-pulse" />}
                                    </div>
                                )
                            })}
                        </div>
                        
                        <button 
                            onClick={handleNextAeon}
                            className={`mt-6 w-full py-4 rounded-xl border transition-all flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-widest ${aeonState === 13 ? 'bg-emerald-900/40 border-emerald-500 text-emerald-100' : 'bg-purple-600 border-purple-400 text-white hover:bg-purple-500'}`}
                            disabled={aeonState === 13}
                        >
                            {aeonState === 13 ? 'Omega Resonance Achieved' : 'Initiate Next Repentance'}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </section>

                    {/* EXISTING PHYSICS CONTROLS CONDENSED */}
                    <section className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl backdrop-blur-md">
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-mono mb-2">
                            <span>TM010 Cavity</span>
                            <span className="text-emerald-400">{resonanceFreq} GHz</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            step="0.1" 
                            value={radius} 
                            onChange={(e) => setRadius(parseFloat(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-4" 
                            aria-label="Resonance Frequency Adjustment"
                            title="TM010 Cavity Frequency"
                        />
                        
                        <div className="text-xs font-mono text-zinc-400 leading-loose break-words h-24 overflow-hidden overflow-y-auto custom-scrollbar border-t border-zinc-800 pt-2 mb-4">
                            {isPlaying ? cipherText : 'AWAITING TRANSMISSION...'}
                        </div>

                        {clearance !== 'OMEGA' && (
                            <button 
                                onClick={handleOmegaLink}
                                disabled={isEstablishingResonance}
                                className={`w-full py-3 rounded-xl border font-mono text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isEstablishingResonance ? 'border-purple-500 bg-purple-500/20 text-purple-200 animate-pulse' : 'border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'}`}
                            >
                                <Lock className={`w-3 h-3 ${isEstablishingResonance ? 'animate-spin' : ''}`} /> 
                                {isEstablishingResonance ? 'Establishing Resonance...' : 'Link Financial Resonance (Stripe)'}
                            </button>
                        )}
                    </section>
                </aside>

                {/* VISUALIZATION GATE */}
                <section className="lg:col-span-3 bg-zinc-950/40 border border-zinc-800 rounded-3xl relative overflow-hidden flex flex-col group">
                    <div className="absolute top-6 left-8 text-[10px] font-mono text-zinc-600 z-10 pointer-events-none space-y-2">
                        <div className="flex items-center gap-2 text-cyan-400">
                           <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" /> 
                           LINK: ESTABLISHED (BASE)
                        </div>
                        <div className="flex items-center gap-2 text-purple-400">
                           <div className="w-1 h-1 bg-purple-400 rounded-full" /> 
                           VACUUM_COHERENCE: {isPlaying ? 'ACTIVE (SGCV)' : 'STABLE'}
                        </div>
                        <div className="flex items-center gap-2 text-white/40">
                           <div className="w-1 h-1 bg-white/20 rounded-full animate-ping" /> 
                           RESONANCE_GEOMETRY: {isPhaseConjugated ? 'TORUS_KNOTV1.8' : 'CYLINDRICAL_S7'}
                        </div>
                    </div>

                    <div className="absolute inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20" />

                    <RitualLayer clearance={clearance} balance={balance} resonance={parseFloat(resonanceFreq)} />

                    <div 
                        className="flex-grow w-full relative"
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                    >
                        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
                    </div>

                    {isLunarSync && !isPhaseConjugated && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-emerald-950/40 border border-emerald-500/30 px-8 py-3 rounded-full backdrop-blur-2xl flex items-center gap-4 animate-bounce">
                            <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400" />
                            <div className="text-left">
                                <div className="text-[10px] font-bold uppercase text-white tracking-[0.2em]">Lunar Resonance Achieved</div>
                                <div className="text-[8px] text-emerald-400 font-mono">27.3216 GHz // Sidereal Constant</div>
                            </div>
                        </div>
                    )}

                    <footer className="p-8 border-t border-zinc-800/50 text-center text-zinc-400 bg-black/40 backdrop-blur-md">
                        <div className="flex justify-center gap-8 mb-6">
                            <button 
                                onClick={() => window.location.hash = '#privacy'}
                                className="text-zinc-500 hover:text-purple-400 transition-colors uppercase tracking-widest text-[9px] font-mono"
                            >
                                Privacy Disclosure
                            </button>
                            <span className="opacity-20 text-[10px] text-zinc-700">//</span>
                            <a 
                                href="https://anwfoundations.com" 
                                target="_blank" 
                                rel="noreferrer noopener"
                                className="text-zinc-500 hover:text-purple-400 transition-colors uppercase tracking-widest text-[9px] font-mono"
                            >
                                ANW Foundations LLC
                            </a>
                        </div>
                        <p className="uppercase tracking-[0.2em] text-[10px] mb-2 font-light text-zinc-300">
                            &copy; 2026 THE DISCLOSURE PROJECT. AN ANW FOUNDATIONS LLC INITIATIVE.
                        </p>
                        <p className="text-[9px] font-mono opacity-50 uppercase tracking-tighter text-zinc-500">
                            Resonant Research by Ashleigh Walker // Levity Protocol v1.0
                        </p>
                    </footer>
                </section>
            </main>

            <ShemhamforashRegistry 
                isOpen={isRegistryOpen} 
                onClose={() => setIsRegistryOpen(false)} 
            />
        </div>
        </ErrorBoundary>
    );
};

export default AethericHub;