import { useState } from 'react';
import SearchBar from './components/SearchBar';
import Loader from './components/Loader';
import AnalysisReport from './components/AnalysisReport';
import { analyzeContract } from './services/api';

// ─── Feature Cards ──────────────────────────────────────
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: 'Smart Contract Analysis',
    description: 'Deep bytecode decompilation and source code review powered by AI agents.',
    color: 'text-cyan-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Fraud Detection',
    description: 'Identifies honeypots, rug pulls, hidden mints, and malicious ownership patterns.',
    color: 'text-violet-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Risk Scoring',
    description: 'Quantified 0-100 risk score with detailed findings and actionable recommendations.',
    color: 'text-emerald-400',
  },
];

// ─── Background Particles ────────────────────────────────
function Particles() {
  const positions = [
    { className: 'particle-1', style: { top: '10%', left: '15%' } },
    { className: 'particle-2', style: { top: '20%', left: '80%' } },
    { className: 'particle-3', style: { top: '60%', left: '10%' } },
    { className: 'particle-1', style: { top: '70%', left: '85%' } },
    { className: 'particle-2', style: { top: '40%', left: '50%' } },
    { className: 'particle-3', style: { top: '80%', left: '30%' } },
    { className: 'particle-1', style: { top: '30%', left: '65%' } },
    { className: 'particle-2', style: { top: '90%', left: '70%' } },
    { className: 'particle-3', style: { top: '50%', left: '20%' } },
    { className: 'particle-1', style: { top: '15%', left: '45%' } },
    { className: 'particle-2', style: { top: '85%', left: '55%' } },
    { className: 'particle-3', style: { top: '45%', left: '90%' } },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {positions.map((p, i) => (
        <div
          key={i}
          className={`particle ${p.className}`}
          style={{ ...p.style, animationDelay: `${i * 1.2}s` }}
        />
      ))}
    </div>
  );
}

// ─── Hero Section ────────────────────────────────────────
function HeroSection() {
  return (
    <div className="text-center space-y-8 py-8">
      {/* Hero text */}
      <div className="space-y-4 animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
          <span className="gradient-text-animated">Protect Yourself</span>
          <br />
          <span className="text-white">from Crypto Fraud</span>
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          Paste any Ethereum contract address and our AI agent will analyze it for scams, 
          vulnerabilities, and malicious patterns in seconds.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
        {features.map((feature, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-6 text-center animate-fade-in-up"
            style={{ opacity: 0, animationDelay: `${0.4 + i * 0.15}s`, animationFillMode: 'forwards' }}
          >
            <div className={`${feature.color} mb-3 flex justify-center`}>{feature.icon}</div>
            <h3 className="text-white font-semibold text-sm mb-2">{feature.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────
export default function App() {
  const [contractAddress, setContractAddress] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (address) => {
    setContractAddress(address);
    setError('');
    setAnalysisResult(null);
    setIsLoading(true);

    try {
      const result = await analyzeContract(address);
      setAnalysisResult(result);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'An unexpected error occurred. Please try again.';
      // If the backend resolved a tx hash to a contract address, show that
      const resolvedAddr = err.response?.data?.address;
      if (resolvedAddr && resolvedAddr !== address) {
        setContractAddress(`${address} → ${resolvedAddr}`);
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setContractAddress('');
    setAnalysisResult(null);
    setError('');
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-grid">
      {/* Particles */}
      <Particles />

      {/* Top gradient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/8 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ──────────────────────────────────── */}
        <header className="text-center mb-12 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-center gap-3 mb-3">
            {/* Shield + Brain icon */}
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              {/* Tiny AI indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-navy-950">
                <span className="text-[8px] font-bold text-white">AI</span>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Fraud Coin Detector
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/70 font-medium">
                Agentic AI Security Scanner
              </p>
            </div>
          </div>
        </header>

        {/* ── Search Bar (always visible) ─────────────── */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* ── Error Display ───────────────────────────── */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 animate-fade-in-up">
            <div className="glass-card rounded-2xl p-5 border-red-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold text-sm mb-1">Analysis Failed</h3>
                  <p className="text-slate-400 text-sm">{error}</p>
                  {contractAddress && (
                    <p className="text-slate-600 text-xs font-mono mt-2">
                      Contract: {contractAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content Area ───────────────────────── */}
        {isLoading ? (
          <Loader />
        ) : analysisResult ? (
          <AnalysisReport result={analysisResult} onReset={handleReset} />
        ) : !error ? (
          <HeroSection />
        ) : null}

        {/* ── Footer ──────────────────────────────────── */}
        <footer className="text-center py-12 mt-8">
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-6" />
          <p className="text-xs text-slate-700">
            Built with AI Agents • Not financial advice • Always DYOR
          </p>
        </footer>
      </div>
    </div>
  );
}
