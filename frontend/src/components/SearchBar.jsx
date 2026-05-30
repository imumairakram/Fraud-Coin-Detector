import { useState } from 'react';

export default function SearchBar({ onSearch, isLoading }) {
  const [address, setAddress] = useState('');
  const [validationError, setValidationError] = useState('');

  const exampleAddresses = [
    { name: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
    { name: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    { name: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  ];

  const validateInput = (input) => {
    if (!input) return 'Please enter a contract address or transaction hash';
    if (!input.startsWith('0x')) return 'Input must start with 0x';
    const isAddress = input.length === 42 && /^0x[0-9a-fA-F]{40}$/.test(input);
    const isTxHash = input.length === 66 && /^0x[0-9a-fA-F]{64}$/.test(input);
    if (!isAddress && !isTxHash) {
      if (input.length !== 42 && input.length !== 66) return 'Enter a contract address (42 chars) or transaction hash (66 chars)';
      return 'Input contains invalid characters';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = address.trim();
    const error = validateInput(trimmed);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    onSearch(trimmed);
  };

  const handleExampleClick = (addr) => {
    setAddress(addr);
    setValidationError('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up stagger-2" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Glassmorphic container */}
        <div className="glass-strong rounded-2xl p-1.5 gradient-border animate-pulse-glow">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              {/* Subtle inner icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Enter contract address or transaction hash (0x...)"
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] rounded-xl text-white placeholder-slate-500 
                           border border-transparent focus:border-cyan-400/30 focus:bg-white/[0.05]
                           outline-none transition-all duration-300 text-sm sm:text-base font-mono
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-4 rounded-xl font-semibold text-sm sm:text-base
                         bg-gradient-to-r from-cyan-500 via-violet-500 to-emerald-500
                         hover:from-cyan-400 hover:via-violet-400 hover:to-emerald-400
                         text-white shadow-lg shadow-violet-500/20
                         transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.02]
                         active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:scale-100 whitespace-nowrap"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Analyze
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="mt-3 flex items-center gap-2 text-rose-400 text-sm animate-fade-in-up pl-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationError}
          </div>
        )}
      </form>

      {/* Example addresses */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest">Try a popular contract</p>
        <div className="flex flex-wrap justify-center gap-2">
          {exampleAddresses.map(({ name, address: addr }) => (
            <button
              key={name}
              onClick={() => handleExampleClick(addr)}
              disabled={isLoading}
              className="group px-4 py-2 rounded-full glass text-xs font-medium text-slate-400
                         hover:text-cyan-300 hover:border-cyan-400/30 transition-all duration-300
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="mr-1.5 text-slate-600 group-hover:text-cyan-500 transition-colors">●</span>
              {name}
              <span className="ml-1.5 text-slate-600 font-mono">
                {addr.slice(0, 6)}...{addr.slice(-4)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
