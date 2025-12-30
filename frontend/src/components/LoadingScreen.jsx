import React from 'react'

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b1524] text-white overflow-hidden">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 1; }
          80%, 100% { transform: scale(1); opacity: 0; }
        }
        @keyframes pulse-dot {
          0% { transform: scale(0.8); }
          50% { transform: scale(1); }
          100% { transform: scale(0.8); }
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .animate-pulse-dot {
          animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
        }
      `}</style>
      
      <div className="relative flex items-center justify-center w-24 h-24 mb-8">
        {/* Pulsing Rings */}
        <div className="absolute w-full h-full bg-emerald-500/30 rounded-full animate-pulse-ring"></div>
        <div className="absolute w-full h-full bg-teal-500/30 rounded-full animate-pulse-ring" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute w-full h-full bg-emerald-400/20 rounded-full animate-pulse-ring" style={{ animationDelay: '0.8s' }}></div>
        
        {/* Center Dot/Icon */}
        <div className="relative w-6 h-6 bg-gradient-to-tr from-emerald-400 to-teal-300 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)] animate-pulse-dot"></div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent animate-pulse">
        MacroMatch
      </h2>
      <p className="mt-2 text-slate-400 text-sm font-medium tracking-wide">
        {message}
      </p>
    </div>
  )
}

export default LoadingScreen
