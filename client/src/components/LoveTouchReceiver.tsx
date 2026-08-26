import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X, Send } from 'lucide-react';
import { PokeEvent } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { listenToLoveTouch, sendRealtimeLoveTouch } from '../services/firebase';
import confetti from 'canvas-confetti';

export const LoveTouchReceiver: React.FC = () => {
  const { currentPartner, otherPartner } = useAuth();
  const { playPokeSound, playSparkle } = useSound();
  const [activeTouch, setActiveTouch] = useState<PokeEvent | null>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  useEffect(() => {
    const unsubscribe = listenToLoveTouch((event) => {
      // Only process if meant for current partner and not self-sent
      if (currentPartner && event.targetPartnerId === currentPartner.id) {
        handleIncomingTouch(event);
      }
    });
    return unsubscribe;
  }, [currentPartner]);

  const handleIncomingTouch = (event: PokeEvent) => {
    setActiveTouch(event);
    playPokeSound(event.pokeType as any);
    playSparkle();

    // Trigger full screen confetti
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#ff4d6d', '#ff758f', '#ff85a1', '#f72585', '#7209b7']
    });

    // Spawn floating emoji particles across the screen
    const emojiMap: Record<string, string> = {
      kiss: '💋',
      hug: '🫂',
      poke: '👉',
      miss_you: '🥺'
    };
    const emoji = emojiMap[event.pokeType] || '💖';

    const newParticles = Array.from({ length: 18 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 85 + 5,
      y: Math.random() * 70 + 15,
      emoji: i % 2 === 0 ? emoji : '💖'
    }));
    setParticles(newParticles);

    // Auto-clear particles after 6 seconds
    setTimeout(() => {
      setParticles([]);
    }, 6000);
  };

  const handleSendBack = async (type: 'kiss' | 'hug') => {
    if (!currentPartner || !otherPartner) return;
    const returnEvent = {
      targetPartnerId: otherPartner.id,
      senderId: currentPartner.id,
      senderName: currentPartner.name,
      pokeType: type,
      message: type === 'kiss' ? 'Sending a million sweet kisses right back at you! 💋❤️' : 'Wrapping you in the tightest hug forever! 🫂💖',
      timestamp: new Date().toISOString()
    };
    await sendRealtimeLoveTouch(returnEvent as any);
    playPokeSound(type);
    playSparkle();
    confetti({ particleCount: 50, spread: 70 });
    setActiveTouch(null);
  };

  return (
    <>
      {/* Floating Emojis across screen */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.3, y: 30 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.4, 1.2, 0.8],
              y: -80,
              rotate: [0, -15, 15, 0]
            }}
            transition={{ duration: 4.5, ease: 'easeOut' }}
            className="fixed pointer-events-none z-50 text-4xl select-none"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Romantic Love Touch Popup Modal */}
      <AnimatePresence>
        {activeTouch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative max-w-sm w-full bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-rose-300 dark:border-rose-500/40 text-center overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-16 -left-16 w-36 h-36 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={() => setActiveTouch(null)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-rose-50 dark:hover:bg-stone-800 transition"
              >
                <X size={18} />
              </button>

              {/* Sender & Touch Icon */}
              <div className="relative inline-block mb-3">
                <div className="w-18 h-18 rounded-3xl bg-linear-to-tr from-rose-400 to-pink-500 text-white mx-auto flex items-center justify-center text-4xl shadow-lg shadow-rose-200 dark:shadow-none animate-bounce">
                  {activeTouch.pokeType === 'kiss' && '💋'}
                  {activeTouch.pokeType === 'hug' && '🫂'}
                  {activeTouch.pokeType === 'poke' && '👉'}
                  {activeTouch.pokeType === 'miss_you' && '🥺'}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-stone-900 rounded-full shadow">
                  <Heart size={14} className="fill-rose-500 text-rose-500" />
                </div>
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-extrabold uppercase tracking-wider mb-2">
                Incoming Love Touch ✨
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-800 dark:text-stone-100 font-serif-title mb-2">
                {activeTouch.senderName || 'Your Love'} sent you a {activeTouch.pokeType === 'kiss' ? 'Kiss 💋' : activeTouch.pokeType === 'hug' ? 'Warm Hug 🫂' : activeTouch.pokeType === 'poke' ? 'Playful Poke 👉' : 'Cute Love Touch 🥺'}!
              </h3>

              {activeTouch.message ? (
                <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-stone-800/80 border border-rose-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-handwriting text-xl mb-5 leading-relaxed">
                  "{activeTouch.message}"
                </div>
              ) : (
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-5 italic">
                  Thinking about you with endless love right now ❤️
                </p>
              )}

              {/* Quick Love Responses */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSendBack('kiss')}
                  className="flex-1 py-2.5 px-3 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-200 transition flex items-center justify-center gap-1.5"
                >
                  <span>💋 Kiss Back</span>
                </button>
                <button
                  onClick={() => handleSendBack('hug')}
                  className="flex-1 py-2.5 px-3 bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-200 transition flex items-center justify-center gap-1.5"
                >
                  <span>🫂 Hug Back</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
