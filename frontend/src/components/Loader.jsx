import { useState, useEffect } from 'react';

const phases = [
  { text: 'Connecting to blockchain...', icon: 'bi bi-link-45deg text-cyan-400' },
  { text: 'Fetching contract data...', icon: 'bi bi-broadcast text-violet-400' },
  { text: 'Decompiling bytecode...', icon: 'bi bi-braces text-emerald-400' },
  { text: 'AI agent analyzing code...', icon: 'bi bi-cpu text-violet-400' },
  { text: 'Scanning for vulnerabilities...', icon: 'bi bi-shield-lock-fill text-amber-400' },
  { text: 'Generating risk report...', icon: 'bi bi-bar-chart-fill text-emerald-400' },
];

export default function Loader() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % phases.length);
    }, 2500);

    return () => clearInterval(phaseInterval);
  }, []);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
      {/* Scanning animation */}
      <div className="relative mb-10">
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-emerald-500 opacity-20 blur-xl animate-pulse" 
             style={{ width: '160px', height: '160px', margin: '-20px' }} />
        
        {/* Rotating ring */}
        <div className="w-[120px] h-[120px] rounded-full border-2 border-transparent relative">
          <div className="absolute inset-0 rounded-full animate-spin-slow"
               style={{
                 background: 'conic-gradient(from 0deg, transparent 0%, #22d3ee 25%, #a78bfa 50%, #34d399 75%, transparent 100%)',
                 mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px))',
                 WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px))',
               }}
          />
          
          {/* Center shield icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl animate-float flex items-center justify-center">
              <i className={phases[currentPhase].icon}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Phase text */}
      <div className="text-center space-y-3">
        <p className="text-lg font-medium text-white transition-all duration-500"
           key={currentPhase}>
          {phases[currentPhase].text}
        </p>
        
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {phases.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentPhase
                  ? 'w-8 bg-gradient-to-r from-cyan-400 to-violet-400'
                  : idx < currentPhase
                  ? 'w-1.5 bg-cyan-400/60'
                  : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
        </div>
        
        <p className="text-sm text-slate-500 font-mono">
          Processing{dots}
        </p>
      </div>

      {/* Subtle info text */}
      <p className="mt-8 text-xs text-slate-600 max-w-md text-center leading-relaxed">
        Our AI agent is performing deep analysis of the smart contract, 
        checking for common fraud patterns, honeypot mechanisms, and security vulnerabilities.
      </p>
    </div>
  );
}
