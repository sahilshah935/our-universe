import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Gift, Heart, Coffee, Film, Utensils, Compass, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '../context/SoundContext';

const DATE_IDEAS = [
  { id: '1', title: 'Pillow Fort & Ghibli Night', category: 'Cozy', desc: 'Build the biggest pillow fort in the living room, make popcorn, and binge studio Ghibli movies.', icon: '🛋️' },
  { id: '2', title: 'Late Night Ice Cream Drive', category: 'Spontaneous', desc: 'Jump in pajamas at 11 PM and drive to get favorite sundaes with our favorite playlist.', icon: '🍦' },
  { id: '3', title: 'Cook Homemade Pasta Together', category: 'Foodie', desc: 'Knead fresh pasta dough from scratch, pour two glasses of cider/wine, and dance in the kitchen.', icon: '🍝' },
  { id: '4', title: 'Sunset Stargazing & Hot Cocoa', category: 'Romantic', desc: 'Pack a warm blanket, a thermos of hot chocolate, and watch the stars from the car hood.', icon: '✨' },
  { id: '5', title: 'No-Phones Bookstore & Cafe Date', category: 'Wholesome', desc: 'Go to a quiet bookstore, pick a book for each other, and sip warm lattes for two hours.', icon: '📚' },
  { id: '6', title: 'Paint & Sip Each Other’s Portrait', category: 'Creative', desc: 'Get cheap canvas boards, try to paint each other’s portrait, and laugh at the hilarious results!', icon: '🎨' },
  { id: '7', title: 'DIY Spa Night & Massage', category: 'Relaxing', desc: 'Face masks, scented candles, warm towel wraps, and relaxing back rubs.', icon: '🧖' },
  { id: '8', title: 'Blindfolded Taste Test Game', category: 'Playful', desc: 'Feed each other mystery snacks while blindfolded and guess what each item is!', icon: '🍓' }
];

export const DateRoulette: React.FC = () => {
  const [selectedIdea, setSelectedIdea] = useState<typeof DATE_IDEAS[0] | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [scratchedCards, setScratchedCards] = useState<Record<string, boolean>>({});
  const { playSparkle, playPokeSound } = useSound();

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    playPokeSound('poke');

    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * DATE_IDEAS.length);
      setSelectedIdea(DATE_IDEAS[randomIdx]);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        const finalIdea = DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)];
        setSelectedIdea(finalIdea);
        setIsSpinning(false);
        playSparkle();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    }, 100);
  };

  const handleScratch = (id: string) => {
    if (scratchedCards[id]) return;
    setScratchedCards((prev) => ({ ...prev, [id]: true }));
    playSparkle();
    confetti({ particleCount: 30, spread: 45 });
  };

  return (
    <div className="space-y-8">
      {/* Date Night Roulette Wheel Section */}
      <div className="rounded-3xl bg-linear-to-br from-rose-500 via-pink-500 to-amber-500 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            Can't Decide What To Do?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-title mb-2">
            Date Night Roulette 🎡
          </h2>
          <p className="text-rose-100 text-sm mb-6">
            Spin the wheel to get an instant spontaneous date idea for tonight!
          </p>

          {/* Result Box */}
          <div className="min-h-[140px] flex items-center justify-center p-6 bg-white/95 backdrop-blur-md rounded-2xl text-stone-800 shadow-lg border border-white/50 mb-6">
            {selectedIdea ? (
              <motion.div
                key={selectedIdea.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <span className="text-4xl block mb-1">{selectedIdea.icon}</span>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-1">
                  {selectedIdea.category}
                </span>
                <h3 className="text-xl font-bold text-stone-900 mb-1">{selectedIdea.title}</h3>
                <p className="text-stone-600 text-sm">{selectedIdea.desc}</p>
              </motion.div>
            ) : (
              <div className="text-stone-400 text-sm italic flex flex-col items-center gap-2">
                <Gift size={28} className="text-rose-400 animate-bounce" />
                Press the button below to pick our next adventure!
              </div>
            )}
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="py-3 px-8 rounded-2xl bg-white text-rose-600 font-extrabold shadow-lg hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} className={isSpinning ? 'animate-spin' : ''} />
            {isSpinning ? 'Picking Magic...' : 'Spin The Wheel 🎲'}
          </button>
        </div>
      </div>

      {/* Mystery Scratch-Off Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-stone-800 font-serif-title flex items-center gap-2">
              <Gift className="text-rose-500" size={20} />
              Mystery Scratch-Off Cards 🎟️
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm">
              Scratch a card together to reveal secret surprise activities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DATE_IDEAS.slice(0, 4).map((idea) => {
            const isRevealed = scratchedCards[idea.id];

            return (
              <motion.div
                key={idea.id}
                whileHover={{ y: -4 }}
                onClick={() => handleScratch(idea.id)}
                className="relative rounded-2xl overflow-hidden border border-rose-100 shadow-md min-h-[170px] cursor-pointer"
              >
                {/* Revealed Content underneath */}
                <div className="h-full p-4 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{idea.icon}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {idea.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-800 line-clamp-1 mb-1">{idea.title}</h4>
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">{idea.desc}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-2">
                    <Heart size={12} className="fill-rose-500" /> Plan this date!
                  </span>
                </div>

                {/* Scratch Overlay */}
                <AnimatePresence>
                  {!isRevealed && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-linear-to-tr from-stone-800 via-rose-950 to-pink-900 text-white p-4 flex flex-col items-center justify-center text-center z-10 select-none group"
                    >
                      <Sparkles size={24} className="text-amber-300 mb-2 group-hover:scale-125 transition-transform" />
                      <span className="text-xs font-bold tracking-wider uppercase text-rose-200">
                        Mystery Card #{idea.id}
                      </span>
                      <span className="text-[11px] text-stone-300 mt-1 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                        Tap to Scratch ✨
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
