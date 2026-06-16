'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';

interface CaptureSphereTransitionProps {
  cardRect: DOMRect;
  onComplete: () => void;
}

type AnimationState = 'centering' | 'glowing' | 'shaking' | 'opening' | 'flash';

export function CaptureSphereTransition({ cardRect, onComplete }: CaptureSphereTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<AnimationState>('centering');

  // Calculate coordinates to center the card in the viewport
  const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 - cardRect.left - cardRect.width / 2 : 0;
  const targetY = typeof window !== 'undefined' ? window.innerHeight / 2 - cardRect.top - cardRect.height / 2 : 0;

  useEffect(() => {
    if (shouldReduceMotion) {
      // Immediate transition for reduced motion users
      const timer = setTimeout(() => {
        onComplete();
      }, 200);
      return () => clearTimeout(timer);
    }

    // Animation timeline coordination
    const glowTimer = setTimeout(() => setPhase('glowing'), 400);
    const shakeTimer = setTimeout(() => setPhase('shaking'), 650);
    const openTimer = setTimeout(() => setPhase('opening'), 950);
    const flashTimer = setTimeout(() => setPhase('flash'), 1100);
    const completeTimer = setTimeout(() => onComplete(), 1300);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(shakeTimer);
      clearTimeout(openTimer);
      clearTimeout(flashTimer);
      clearTimeout(completeTimer);
    };
  }, [shouldReduceMotion, onComplete]);

  if (shouldReduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex items-center justify-center"
      >
        <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-blue-500 animate-spin" />
      </motion.div>
    );
  }

  // Centering container animation
  const containerVariants = {
    centering: {
      x: targetX,
      y: targetY,
      width: 160,
      height: 160,
      borderRadius: '80px',
      rotate: 360,
      transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
    },
    shaking: {
      x: targetX,
      y: targetY,
      width: 160,
      height: 160,
      borderRadius: '80px',
      rotate: [360, 345, 375, 345, 375, 360],
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Background dimmer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
      />

      {/* Floating morphing card/sphere */}
      {phase !== 'opening' && phase !== 'flash' && (
        <motion.div
          initial={{
            x: 0,
            y: 0,
            width: cardRect.width,
            height: cardRect.height,
            borderRadius: '24px',
          }}
          animate={phase === 'centering' ? 'centering' : 'shaking'}
          variants={containerVariants}
          className="fixed bg-white dark:bg-slate-900 border-4 border-slate-950 shadow-2xl overflow-hidden flex flex-col justify-between"
          style={{
            top: cardRect.top,
            left: cardRect.left,
          }}
        >
          {/* Morphing overlay details (turns card into Capture Sphere design) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="absolute inset-0 flex flex-col pointer-events-none"
          >
            {/* Top Half (Indigo) */}
            <div className="flex-1 bg-indigo-600 w-full" />
            {/* Center Band (Black) */}
            <div className="h-4 bg-slate-950 w-full" />
            {/* Bottom Half (Slate-800) */}
            <div className="flex-1 bg-slate-800 w-full" />

            {/* Glowing Release Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
                <motion.div
                  animate={
                    phase === 'glowing'
                      ? { scale: [1, 1.15, 1], backgroundColor: ['#06b6d4', '#22d3ee', '#06b6d4'] }
                      : phase === 'shaking'
                      ? { scale: [1, 1.2, 1], backgroundColor: ['#06b6d4', '#a855f7', '#06b6d4'] }
                      : {}
                  }
                  transition={{ duration: 0.35, repeat: phase === 'shaking' ? Infinity : 0 }}
                  className="w-6 h-6 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Split Opening Animation (renders top and bottom hemispheres sliding apart) */}
      {phase === 'opening' && (
        <div
          className="fixed"
          style={{
            top: `calc(50vh - 80px)`,
            left: `calc(50vw - 80px)`,
            width: 160,
            height: 160,
          }}
        >
          {/* Top Hemisphere */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: -180, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-0 left-0 w-full h-[80px] bg-indigo-600 rounded-t-full border-4 border-b-2 border-slate-950 overflow-hidden flex items-end justify-center"
          >
            {/* Half button */}
            <div className="w-12 h-6 rounded-b-full bg-slate-950 flex justify-center items-start">
              <div className="w-6 h-3 rounded-b-full bg-cyan-400 border border-slate-950" />
            </div>
          </motion.div>

          {/* Bottom Hemisphere */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: 180, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 w-full h-[80px] bg-slate-800 rounded-b-full border-4 border-t-2 border-slate-950 overflow-hidden flex items-start justify-center"
          >
            {/* Half button */}
            <div className="w-12 h-6 rounded-t-full bg-slate-950 flex justify-center items-end">
              <div className="w-6 h-3 rounded-t-full bg-cyan-400 border border-slate-950" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Screen White Flash */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-white"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CaptureSphereTransition;
