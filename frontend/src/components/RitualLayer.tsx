import React, { useRef, useEffect } from 'react';

interface RitualLayerProps {
  primaryColor: string;
  secondaryColor: string;
  mode: 'random' | 'vortex' | 'constellation';
}

class QuantumParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  radius: number;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 0.2 + 0.1;
    this.radius = Math.random() * 1.5 + 0.5;
  }

  update(w: number, h: number, mode: 'random' | 'vortex' | 'constellation') {
    if (mode === 'vortex') {
      // Orbit around the center of the screen
      const cx = w / 2;
      const cy = h / 2;
      const dx = this.x - cx;
      const dy = this.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Rotational force
      const forceX = -dy / dist;
      const forceY = dx / dist;
      
      // Pull toward center slightly
      const pullX = -dx / dist * 0.05;
      const pullY = -dy / dist * 0.05;
      
      this.vx += (forceX * 0.08 + pullX) * 0.1;
      this.vy += (forceY * 0.08 + pullY) * 0.1;
      
      // Limit speed
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 1.2) {
        this.vx = (this.vx / speed) * 1.2;
        this.vy = (this.vy / speed) * 1.2;
      }
      
      this.x += this.vx;
      this.y += this.vy;
    } else if (mode === 'constellation') {
      // Very slow drift
      this.x += this.vx * 0.3;
      this.y += this.vy * 0.3;
      
      // Boundary collision check
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
    } else {
      // Default: Drifting random walk
      this.x += this.vx;
      this.y += this.vy;
      
      // Boundary wrap
      if (this.x < 0) this.x = w;
      if (this.x > w) this.x = 0;
      if (this.y < 0) this.y = h;
      if (this.y > h) this.y = 0;
    }
  }
}

const RitualLayer: React.FC<RitualLayerProps> = ({ primaryColor, secondaryColor, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const particles: QuantumParticle[] = [];
    const count = mode === 'constellation' ? 50 : 35; // balance density vs performance

    for (let i = 0; i < count; i++) {
      particles.push(new QuantumParticle(w, h));
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      // Move and draw particles
      particles.forEach((p, i) => {
        p.update(w, h, mode);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Draw connections
        let maxConnections = mode === 'constellation' ? 4 : 2;
        let connections = 0;
        
        for (let j = i + 1; j < particles.length; j++) {
          if (connections >= maxConnections) break;
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const maxDist = mode === 'constellation' ? 140 : 100;
          
          if (dist < maxDist) {
            connections++;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Woven alpha transparency based on distance
            const alpha = (1 - dist / maxDist) * (mode === 'vortex' ? 0.08 : 0.15);
            ctx.strokeStyle = `color-mix(in srgb, ${primaryColor} ${alpha * 100}%, transparent)`;
            ctx.lineWidth = mode === 'constellation' ? 0.6 : 0.4;
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
  }, [primaryColor, secondaryColor, mode]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-transparent">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-60 pointer-events-none" />
    </div>
  );
};

export default RitualLayer;