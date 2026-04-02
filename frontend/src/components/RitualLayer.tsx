import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Hammer, X, Sparkles, Wand2 } from 'lucide-react';
import CymaticSigil from './CymaticSigil';
import DynamicSeal from './DynamicSeal';
import geniusesData from '../data/72_geniuses.json';
import './RitualLayer.css';

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
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none" />
        </div>
    );
};

export default RitualLayer;