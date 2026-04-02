interface DynamicSealProps {
  type: 'alpha' | 'sigma';
  freq: number;
  size?: number;
  color?: string;
}

const DynamicSeal: React.FC<DynamicSealProps> = ({ type, freq, size = 160, color = '#fbbf24' }) => {
  // Vibration effect based on frequency
  const jitter = Math.sin(Date.now() * 0.001 * freq) * 2;
  const scale = 1 + Math.sin(Date.now() * 0.005 * freq) * 0.02;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      style={{ 
        transform: `scale(${scale}) translate(${jitter}px, ${jitter}px)`,
        transition: 'all 0.1s linear'
      }}
    >
      <defs>
        <linearGradient id={`${type}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.5 }} />
        </linearGradient>
      </defs>
      
      {/* Outer Coherence Ring */}
      <circle 
        cx="50" cy="50" r="45" 
        fill="none" 
        stroke={color} 
        strokeWidth="0.5" 
        strokeDasharray="2 2" 
        className="animate-spin-slow"
        style={{ transformOrigin: 'center' }}
      />

      {type === 'alpha' ? (
        <g>
          {/* Alpha Representation: Triangle inside Circle */}
          <path 
            d="M50 15 L85 75 L15 75 Z" 
            fill="none" 
            stroke={`url(#${type}-grad)`} 
            strokeWidth="2" 
          />
          <circle cx="50" cy="50" r="10" fill="none" stroke={color} strokeWidth="1" />
          <path d="M50 15 L50 85" stroke={color} strokeWidth="0.5" strokeDasharray="1 1" />
        </g>
      ) : (
        <g>
          {/* Sigma Representation: Winding S and Concentric Arcs */}
          <path 
            d="M30 30 Q50 10 70 30 Q90 50 70 70 Q50 90 30 70" 
            fill="none" 
            stroke={`url(#${type}-grad)`} 
            strokeWidth="3" 
          />
          <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="4 4" />
          <path d="M20 50 L80 50" stroke={color} strokeWidth="0.5" strokeDasharray="2 2" />
        </g>
      )}

      {/* Decorative Symbols */}
      <text x="50" y="95" textAnchor="middle" fill={color} fontSize="5" fontFamily="monospace" opacity="0.6">
        {type === 'alpha' ? 'Ω_ALPHA' : 'Σ_SIGMA'}
      </text>
    </svg>
  );
};

export default DynamicSeal;
