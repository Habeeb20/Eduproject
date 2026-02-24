// src/components/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import im from '../../assets/hero.png'; // Your image import

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 min-h-screen flex items-center justify-center overflow-hidden px-4 py-12 md:py-20">
      {/* Subtle animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-32 right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center z-10">
        {/* Left Column - Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="space-y-6 md:space-y-10 text-center lg:text-left"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white"
          >
            Gen-z as modern
            <br className="hidden sm:block" />
            world pillars
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-indigo-200 font-light max-w-3xl mx-auto lg:mx-0 leading-relaxed"
          >
            Cybersecurity is the practice of protecting systems and programs from digital attacks. These cyberattacks.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="
              inline-flex items-center justify-center
              px-8 py-4 md:px-10 md:py-5
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700
              text-white font-semibold text-lg md:text-xl
              rounded-full transition-all duration-300
              shadow-lg hover:shadow-indigo-500/50
            "
          >
            Get Started
          </motion.button>
        </motion.div>

        {/* Right Column - Image with Floating Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          className="relative flex justify-center lg:justify-end"
        >
          {/* Main Image Container */}
          <div className="relative rounded-3xl overflow-hidden border-4 border-purple-500/30 shadow-2xl shadow-purple-900/40 max-w-[420px] md:max-w-[480px] lg:max-w-[520px]">
            <img
              src={im}
              alt="Young woman with laptop representing Gen-Z in cybersecurity"
              className="w-full h-auto object-cover rounded-3xl"
            />

            {/* Floating testimonial bubbles */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute -top-8 -right-6 md:-top-12 md:-right-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-xl max-w-[200px] md:max-w-[260px]"
            >
              <p className="text-white text-sm md:text-base font-medium leading-snug">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit...
              </p>
              <p className="mt-2 text-purple-300 text-xs md:text-sm font-semibold">
                Jerry Wilson
              </p>
            </motion.div> */}

            {/* <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -bottom-10 -left-4 md:-bottom-14 md:-left-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-xl max-w-[180px] md:max-w-[240px]"
            >
              <p className="text-white text-sm md:text-base font-medium leading-snug">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit...
              </p>
              <p className="mt-2 text-purple-300 text-xs md:text-sm font-semibold">
                knowntobuy
              </p>
            </motion.div> */}

            {/* Decorative geometric shapes */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-16 -left-16 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-purple-500/30 to-pink-500/20 rounded-full blur-2xl"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-20 -right-20 w-40 h-40 md:w-48 md:h-48 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-full blur-3xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;