// PrivateClassSection.tsx
import React from 'react';

// Replace with your actual image import (young smiling man in checkered shirt holding books)
// Suggested: Use a photo similar to stock images of a confident young African man in plaid shirt with books
import privateClassGuy from '../../assets/guy.png';

const PrivateClassSection = () => {
  return (
    <section className="relative bg-[#fdfaf5] py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Subtle decorative diamonds (like in the image) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-10 w-5 h-5 bg-blue-500 rounded-sm rotate-45 opacity-60" />
        <div className="absolute top-40 left-24 w-4 h-4 bg-blue-400 rounded-sm rotate-12 opacity-50" />
        <div className="absolute bottom-20 right-16 w-6 h-6 bg-yellow-400 rounded-sm -rotate-12 opacity-70" />
        <div className="absolute top-1/4 right-20 w-5 h-5 bg-yellow-500 rounded-sm rotate-45 opacity-60" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left: Text + CTA */}
          <div className="text-center lg:text-left max-w-xl order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Specify the time <br className="hidden sm:inline" />
              and day of private <br className="hidden sm:inline lg:hidden" />
              class
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </p>

            {/* Get Started Button – matches the blue rounded style */}
            <button
              className="
                inline-block px-10 py-4 bg-blue-600 hover:bg-blue-700 
                text-white font-semibold text-lg rounded-full 
                shadow-lg shadow-blue-500/30 
                transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 
                focus:outline-none focus:ring-4 focus:ring-blue-300
              "
            >
              Get Started
            </button>
          </div>

          {/* Right: Image with circular gradient backdrop */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end w-full lg:w-1/2">
            <div className="relative">
              {/* Large semi-circle / rounded backdrop (red-orange gradient like in image) */}
              <div className="
                absolute inset-0 bg-gradient-to-br from-red-400/30 via-orange-300/40 to-yellow-200/20 
                rounded-full scale-110 md:scale-125 -z-10 blur-md
              " />

              {/* Image container – circular crop */}
              <div className="
                relative rounded-full overflow-hidden 
                w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] 
                shadow-2xl border-8 border-white
              ">
                <img
                  src={privateClassGuy}
                  alt="Smiling young man holding books for private class"
                  className="w-full h-full object-cover object-center"
                  // Optional: object-position can be adjusted if needed (e.g. object-top)
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivateClassSection;