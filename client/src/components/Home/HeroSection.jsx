// HeroSection.tsx
import React from 'react';
import heroWoman from "../../assets/im.png"
const HeroSection2 = () => {
  return (
    <section className="relative bg-gray-50 overflow-hidden py-12 md:py-16 lg:py-20">
      {/* Decorative shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-8 w-6 h-6 bg-blue-500 rounded-sm rotate-45 opacity-40" />
        <div className="absolute top-28 left-20 w-5 h-5 bg-yellow-400 rounded-sm rotate-12 opacity-50" />
        <div className="absolute bottom-16 right-12 w-7 h-7 bg-blue-400 rounded-sm -rotate-12 opacity-40" />
        <div className="absolute top-1/3 right-16 w-8 h-8 bg-yellow-300 rounded-full opacity-30" />
        {/* Add more if you want */}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Top icons row - placeholder lorem */}
        <div className="flex justify-center gap-10 md:gap-16 mb-10 md:mb-12">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-500" />
          </div>
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-600" /> {/* globe-like */}
          </div>
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-orange-500" />
          </div>
        </div>

        {/* Main content - flex column on mobile, row on desktop */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {/* Text side */}
          <div className="text-center lg:text-left max-w-xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Online data analytics <br className="hidden sm:inline" />
              for biz professionals
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0">
              Make easier for all students to do learning through digital media with existing media making it easier for students to learn anywhere and anytime.
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center lg:justify-start gap-4 md:gap-6">
              <div className="flex items-center gap-2 bg-white shadow-sm rounded-full px-5 py-2.5 text-sm font-medium text-gray-800 border border-gray-200">
                <span className="text-blue-600 text-lg">✔</span> World Class
              </div>
              <div className="flex items-center gap-2 bg-white shadow-sm rounded-full px-5 py-2.5 text-sm font-medium text-gray-800 border border-gray-200">
                <span className="text-blue-600 text-lg">✔</span> Easy Learning
              </div>
              <div className="flex items-center gap-2 bg-white shadow-sm rounded-full px-5 py-2.5 text-sm font-medium text-gray-800 border border-gray-200">
                <span className="text-blue-600 text-lg">✔</span> Flexibel
              </div>
              <div className="flex items-center gap-2 bg-white shadow-sm rounded-full px-5 py-2.5 text-sm font-medium text-gray-800 border border-gray-200">
                <span className="text-blue-600 text-lg">✔</span> affordable
              </div>
            </div>
          </div>

          {/* Image side */}
          <div className="relative flex justify-center lg:justify-end w-full lg:w-1/2">
            <div className="relative">
              {/* Large colored circle behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 to-orange-200/30 rounded-full scale-110 md:scale-125 -z-10 blur-sm" />

              {/* Image container */}
              <div className="relative rounded-full overflow-hidden w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] shadow-2xl border-8 border-white">
                <img
                  src={heroWoman}
                  alt="Professional woman learning data analytics on laptop"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection2;