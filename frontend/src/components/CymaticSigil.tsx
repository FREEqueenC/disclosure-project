import React, { useEffect, useRef, useMemo } from 'react';

interface CymaticSigilProps {
    name: string;
    hebrew?: string;
    size?: number;
    color?: string;
}

export const hebrewGematria: Record<string, number> = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80,
    'צ': 90, 'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
    'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90
};

export const hashName = (name: string, hebrew?: string): number => {
    let sum = 0;
    const target = hebrew || name;
    for (let i = 0; i < target.length; i++) {
        const char = target[i];
        if (hebrewGematria[char]) sum += hebrewGematria[char];
        else sum += target.charCodeAt(i);
    }
    return Math.floor(sum * 1.618033);
};

export const getCymaticModes = (hash: number) => {
    const nMode = (hash % 5) + 2;
    const mMode = ((hash >> 2) % 5) + 3 + nMode;
    return { nMode, mMode };
};

const CymaticSigil: React.FC<CymaticSigilProps> = ({ name, hebrew, size = 120, color = 'rgba(168, 85, 247, 0.8)' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    const { hash, n, m } = useMemo(() => {
        const h = hashName(name, hebrew);
        const { nMode, mMode } = getCymaticModes(h);
        return { hash: h, n: nMode, m: mMode };
    }, [name, hebrew]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = size;
        const height = size;
        canvas.width = width;
        canvas.height = height;

        let frame = 0;

        const draw = () => {
            frame++;
            ctx.clearRect(0, 0, width, height);

            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;
            
            // Add a time component to the "thickness" threshold for vibration
            const threshold = 0.15 + Math.sin(frame * 0.1) * 0.02;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const px = (x / width) * 2 - 1;
                    const py = (y / height) * 2 - 1;
                    
                    if (px*px + py*py > 0.95) continue;

                    // Chladni equation with slight time drift for resonance feel
                    const val = Math.cos(n * Math.PI * px) * Math.cos(m * Math.PI * py) - 
                                Math.cos(m * Math.PI * px) * Math.cos(n * Math.PI * py);
                    
                    if (Math.abs(val) < threshold) {
                        const idx = (y * width + x) * 4;
                        let r = 168, g = 85, b = 247;
                        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                        if (rgbMatch) {
                            r = parseInt(rgbMatch[1]);
                            g = parseInt(rgbMatch[2]);
                            b = parseInt(rgbMatch[3]);
                        }
                        
                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                        // Frequency Pulse Alpha
                        data[idx + 3] = Math.max(0, 255 - Math.abs(val)*1000);
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);

            // Ring Glow
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(width/2, height/2, width/2 - 4, 0, 2*Math.PI);
            ctx.stroke();
            ctx.shadowBlur = 0;

            animationRef.current = requestAnimationFrame(draw);
        };

        animationRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationRef.current);
    }, [n, m, size, color]);

    return (
        <div className="relative flex items-center justify-center group cursor-pointer">
            <canvas 
                ref={canvasRef} 
                className="rounded-full transition-transform group-hover:scale-105 duration-500" 
                style={{ filter: `drop-shadow(0 0 10px ${color})` }}
            />
            <div className="absolute opacity-0 group-hover:opacity-100 bg-black/95 text-[9px] font-mono text-zinc-300 px-3 py-2 rounded-sm top-full mt-3 whitespace-nowrap z-50 pointer-events-none border border-white/5 backdrop-blur-xl">
                <div className="text-emerald-400 font-bold mb-1 tracking-widest uppercase">{name}</div>
                <div className="flex justify-between gap-4">
                    <span>AEON_WEIGHT: {hash}</span>
                    <span>MODES: [{n}:{m}]</span>
                </div>
                {hebrew && <div className="text-right mt-1 text-purple-400 font-sans text-xs">{hebrew}</div>}
            </div>
        </div>
    );
};

export default CymaticSigil;