import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import confetti from 'canvas-confetti';

export const HeartShower: React.FC = () => {
  const { activePoke, dismissPoke } = useSocket();

  useEffect(() => {
    if (activePoke) {
      // Trigger heart confetti explosion
      const end = Date.now() + 1.8 * 1000;
      const colors = ['#f43f5e', '#ec4899', '#fda4af', '#fb7185', '#ffe4e6'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => {
        dismissPoke();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activePoke, dismissPoke]);

  if (!activePoke) return null;

  const getEmoji = (type: string) => {
    switch (type) {
      case 'kiss': return '💋';
      case 'hug': return '🤗';
      case 'miss_you': return '🥺';
      default: return '💖';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-4">
        {/* Floating Heart Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => {
            const size = Math.random() * 28 + 16;
            const left = Math.random() * 100;
            const delay = Math.random() * 0.8;
            const duration = Math.random() * 2.5 + 2.5;

            return (
              <motion.div
                key={i}
                initial={{ y: '110vh', opacity: 0, scale: 0.5, x: `${left}vw` }}
                animate={{
                  y: '-20vh',
                  opacity: [0, 0.9, 0.9, 0],
                  scale: [0.5, 1.2, 1],
                  rotate: [0, (Math.random() - 0.5) * 60]
                }}
                transition={{ duration, delay, ease: 'easeOut' }}
                className="absolute text-rose-500/80"
                style={{ fontSize: `${size}px` }}
              >
                {i % 4 === 0 ? '💋' : i % 3 === 0 ? '✨' : '💖'}
              </motion.div>
            );
          })}
        </div>

        {/* Center Poke Card Alert */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: -30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="pointer-events-auto relative max-w-sm w-full bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border-2 border-rose-200 text-center"
        >
          <button
            onClick={dismissPoke}
            className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-rose-50 transition"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200 animate-bounce">
            <span className="text-3xl">{getEmoji(activePoke.pokeType)}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            Love Notification
          </div>

          <h3 className="text-xl font-bold text-stone-800 mb-1 font-serif-title">
            {activePoke.senderName}
          </h3>

          <p className="text-stone-600 text-sm mb-4 leading-relaxed font-medium">
            {activePoke.message}
          </p>

          <button
            onClick={dismissPoke}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium shadow-md shadow-rose-200 transition active:scale-98 text-sm flex items-center justify-center gap-2"
          >
            <Heart size={16} className="fill-white" />
            Send Love Back
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
