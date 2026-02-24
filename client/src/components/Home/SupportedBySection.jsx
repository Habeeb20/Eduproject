// SupportedBySection.tsx
import React from 'react';

// You can replace these with real logo SVGs or image imports later
// For now using colored circles + letters/symbols to match the vibe
const logos = [
  { color: 'bg-red-500', symbol: 'A', ring: 'ring-red-400/30' },
  { color: 'bg-blue-600', symbol: '📝', ring: 'ring-blue-400/30' },     // e.g. Notion-like
  { color: 'bg-blue-500', symbol: '▶', ring: 'ring-blue-400/30' },      // video/play
  { color: 'bg-gray-900', symbol: 'a', ring: 'ring-gray-400/30' },
  { color: 'bg-purple-600', symbol: 'G', ring: 'ring-purple-400/30' },  // ChatGPT-ish
  { color: 'bg-green-600', symbol: '↻', ring: 'ring-green-400/30' },
  { color: 'bg-blue-700', symbol: '□', ring: 'ring-blue-400/30' },      // Dropbox-like
  { color: 'bg-pink-600', symbol: '🤖', ring: 'ring-pink-400/30' },
];

const SupportedBySection = () => {
  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Very subtle background texture/gradient if desired */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fef3c7_0%,transparent_25%)]" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Supported by <span className="text-blue-600">premium</span> software
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mt-3 mb-10 md:mb-14 max-w-2xl">
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
          </p>

          {/* Circular layout container */}
          <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px] mx-auto mb-10 md:mb-14">
            {/* Outer thin orange ring */}
            <div className="absolute inset-4 sm:inset-6 md:inset-8 border-2 border-orange-400/60 rounded-full" />

            {/* Central gradient orb */}
            <div className="absolute inset-[20%] sm:inset-[18%] md:inset-[16%] rounded-full bg-gradient-to-br from-yellow-200 via-orange-300 to-amber-400 shadow-xl shadow-orange-300/30 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-800">∞</div>
              </div>
            </div>

            {/* Orbiting logos */}
            {logos.map((logo, index) => {
              const angle = (index * 45); // 360° / 8 = 45°
              const radius = 'translate-x-[50%] -translate-y-1/2 rotate-[var(--angle)] translate-x-[calc(var(--radius))] rotate-[-var(--angle)]';

              return (
                <div
                  key={index}
                  className="absolute top-1/2 left-1/2 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
                  style={{
                    transform: `rotate(${angle}deg) translateX(calc(50% + ${index < 4 ? '140%' : '130%'})) rotate(-${angle}deg)`,
                  }}
                >
                  <div
                    className={`w-full h-full rounded-full ${logo.color} flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-medium shadow-lg shadow-black/20 ring-2 ${logo.ring} transition-transform hover:scale-110`}
                  >
                    {logo.symbol}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <button
            className="
              px-8 py-4 bg-blue-600 hover:bg-blue-700 
              text-white font-semibold text-lg rounded-full 
              shadow-lg shadow-blue-500/30 
              transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 
              focus:outline-none focus:ring-4 focus:ring-blue-300
            "
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default SupportedBySection;