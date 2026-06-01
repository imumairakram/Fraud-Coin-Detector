import { useState, useEffect, useRef } from 'react';

// ─── Risk Level Helpers ──────────────────────────────────
function getRiskLevel(score) {
  if (score <= 25) return { label: 'Safe', color: 'emerald', icon: 'bi bi-shield-fill-check', gradient: 'from-emerald-500 to-green-400', textColor: 'text-emerald-400', bgClass: 'severity-low' };
  if (score <= 50) return { label: 'Warning', color: 'amber', icon: 'bi bi-exclamation-triangle-fill', gradient: 'from-amber-500 to-yellow-400', textColor: 'text-amber-400', bgClass: 'severity-medium' };
  if (score <= 75) return { label: 'High Risk', color: 'orange', icon: 'bi bi-exclamation-octagon-fill', gradient: 'from-orange-500 to-red-400', textColor: 'text-orange-400', bgClass: 'severity-high' };
  return { label: 'Critical', color: 'red', icon: 'bi bi-patch-exclamation-fill', gradient: 'from-red-600 to-rose-500', textColor: 'text-red-400', bgClass: 'severity-critical' };
}

function getSeverityClass(severity) {
  const map = { critical: 'severity-critical', high: 'severity-high', medium: 'severity-medium', low: 'severity-low' };
  return map[severity?.toLowerCase()] || 'severity-low';
}

// ─── Animated Counter ────────────────────────────────────
function AnimatedScore({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = Math.min(Math.max(target, 0), 100);
    const duration = 1500;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * end));
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    };

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target]);

  return <span>{count}</span>;
}

// ─── Finding Card ────────────────────────────────────────
function FindingCard({ finding, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass-card rounded-xl overflow-hidden animate-fade-in-up"
      style={{ opacity: 0, animationDelay: `${0.1 * (index + 1)}s`, animationFillMode: 'forwards' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${getSeverityClass(finding.severity)}`}>
          {finding.severity || 'Info'}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm leading-snug">{finding.title}</h4>
        </div>
        <svg
          className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 mt-0.5 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pl-[4.5rem]">
          <p className="text-slate-400 text-sm leading-relaxed">{finding.description}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Report Component ───────────────────────────────
export default function AnalysisReport({ result, onReset }) {
  // Parse the nested response from the backend
  const aiAnalysis = result?.aiAnalysis ?? result ?? {};
  const etherscanData = result?.etherscanData ?? {};

  const score = aiAnalysis?.riskScore ?? 0;
  const risk = getRiskLevel(score);

  const contractInfo = aiAnalysis?.contractInfo ?? {};
  const summary = aiAnalysis?.summary ?? '';
  const findings = aiAnalysis?.findings ?? [];
  const recommendations = aiAnalysis?.recommendations ?? [];
  const contractAddress = result?.address ?? '';

  // Merge etherscan data into contract info display
  const displayInfo = {
    ...(etherscanData.contractName && { 'Contract Name': etherscanData.contractName }),
    ...(contractInfo.tokenName && { 'Token Name': contractInfo.tokenName }),
    ...(contractInfo.tokenSymbol && { 'Symbol': contractInfo.tokenSymbol }),
    ...(etherscanData.compiler && { 'Compiler': etherscanData.compiler }),
    ...(etherscanData.tokenSupply && etherscanData.tokenSupply !== 'N/A' && { 'Total Supply': etherscanData.tokenSupply }),
    'Has Mint': contractInfo.hasMintFunction ? (
      <span className="text-amber-400 flex items-center gap-1.5"><i className="bi bi-exclamation-triangle-fill"></i> Yes</span>
    ) : (
      <span className="text-emerald-400 flex items-center gap-1.5"><i className="bi bi-check-circle-fill"></i> No</span>
    ),
    'Has Pause': contractInfo.hasPauseFunction ? (
      <span className="text-amber-400 flex items-center gap-1.5"><i className="bi bi-exclamation-triangle-fill"></i> Yes</span>
    ) : (
      <span className="text-emerald-400 flex items-center gap-1.5"><i className="bi bi-check-circle-fill"></i> No</span>
    ),
    'Has Blacklist': contractInfo.hasBlacklist ? (
      <span className="text-amber-400 flex items-center gap-1.5"><i className="bi bi-exclamation-triangle-fill"></i> Yes</span>
    ) : (
      <span className="text-emerald-400 flex items-center gap-1.5"><i className="bi bi-check-circle-fill"></i> No</span>
    ),
    'Proxy Contract': contractInfo.hasProxy ? (
      <span className="text-amber-400 flex items-center gap-1.5"><i className="bi bi-exclamation-triangle-fill"></i> Yes</span>
    ) : (
      <span className="text-emerald-400 flex items-center gap-1.5"><i className="bi bi-check-circle-fill"></i> No</span>
    ),
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">

      {/* ── Risk Score Header ─────────────────────────── */}
      <div className="glass-strong rounded-3xl p-8 text-center animate-fade-in-up stagger-1 relative overflow-hidden"
           style={{ opacity: 0 }}>
        {/* Background glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${risk.gradient} opacity-[0.04]`} />

        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-4 font-medium">Risk Assessment</p>

          {/* Large score circle */}
          <div className="flex justify-center mb-6">
            <div className={`relative w-36 h-36 rounded-full flex items-center justify-center
                            bg-gradient-to-br ${risk.gradient} p-[3px]`}>
              <div className="w-full h-full rounded-full bg-navy-950 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black ${risk.textColor}`}>
                  <AnimatedScore target={score} />
                </span>
                <span className="text-xs text-slate-500 font-medium mt-0.5">/100</span>
              </div>
            </div>
          </div>

          {/* Risk label */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <i className={`text-3xl ${risk.icon}`}></i>
            <span className={`text-2xl font-bold ${risk.textColor}`}>{risk.label}</span>
          </div>

          {/* Risk gauge */}
          <div className="max-w-sm mx-auto">
            <div className="risk-gauge">
              <div
                className="risk-gauge-marker"
                style={{ left: `${score}%`, color: score <= 25 ? '#34d399' : score <= 50 ? '#fbbf24' : score <= 75 ? '#f97316' : '#ef4444' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-medium uppercase tracking-wider">
              <span>Safe</span>
              <span>Warning</span>
              <span>High Risk</span>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contract Info Grid ────────────────────────── */}
      {Object.keys(displayInfo).length > 0 && (
        <div className="animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
          <h3 className="text-sm uppercase tracking-[0.15em] text-slate-400 font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Contract Information
            {contractAddress && (
              <span className="ml-auto text-xs font-mono text-slate-600 truncate max-w-[200px]" title={contractAddress}>
                {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
              </span>
            )}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(displayInfo).map(([key, value]) => (
              <div key={key} className="glass-card rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-medium">{key}</p>
                <div className="text-sm text-white font-semibold truncate" title={typeof value === 'string' ? value : ''}>
                  {value || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Summary ────────────────────────────────── */}
      {summary && (
        <div className="animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
          <h3 className="text-sm uppercase tracking-[0.15em] text-slate-400 font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            AI Analysis Summary
          </h3>
          <div className="glass-card rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-cyan-500 rounded-l-xl" />
            <p className="text-slate-300 leading-relaxed pl-4 whitespace-pre-line">{summary}</p>
          </div>
        </div>
      )}

      {/* ── Findings ──────────────────────────────────── */}
      {findings.length > 0 && (
        <div className="animate-fade-in-up stagger-4" style={{ opacity: 0 }}>
          <h3 className="text-sm uppercase tracking-[0.15em] text-slate-400 font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Findings
            <span className="ml-auto text-xs font-mono text-slate-600">{findings.length} found</span>
          </h3>
          <div className="space-y-2">
            {findings.map((finding, i) => (
              <FindingCard key={i} finding={finding} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recommendations ───────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
          <h3 className="text-sm uppercase tracking-[0.15em] text-slate-400 font-semibold mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            Recommendations
          </h3>
          <div className="glass-card rounded-xl p-5 space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 animate-fade-in-up"
                   style={{ opacity: 0, animationDelay: `${0.1 * (i + 1)}s`, animationFillMode: 'forwards' }}>
                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{typeof rec === 'string' ? rec : rec.text ?? rec.description ?? JSON.stringify(rec)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Scan Another ──────────────────────────────── */}
      <div className="text-center pt-4 animate-fade-in-up stagger-6" style={{ opacity: 0 }}>
        <button
          onClick={onReset}
          className="group px-8 py-3 rounded-2xl glass-strong text-sm font-semibold text-slate-300
                     hover:text-white hover:border-cyan-400/30 transition-all duration-300
                     hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 transition-transform group-hover:-rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Scan Another Contract
          </span>
        </button>
      </div>
    </div>
  );
}
