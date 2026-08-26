import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Trash2, RotateCw, Trophy, RefreshCcw, Check, Heart, Disc } from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import confetti from 'canvas-confetti';

const WHEEL_COLORS = [
  '#f43f5e', // rose-500
  '#ec4899', // pink-500
  '#8b5cf6', // purple-500
  '#6366f1', // indigo-500
  '#0ea5e9', // sky-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#f97316'  // orange-500
];

const PRESETS = [
  {
    name: 'What should we eat? 🍕',
    items: ['Pizza', 'Sushi', 'Burgers & Fries', 'Pasta & Garlic Bread', 'Tacos', 'Boba & Dessert']
  },
  {
    name: 'Who picks the movie? 🎬',
    items: ['Sahil (BabyGirl)', 'Asmi (Supari / Girl)', 'Coin Flip', 'Watch Ghibli Together']
  },
  {
    name: 'Weekend Activity 🛋️',
    items: ['Pillow Fort Movie Night', 'Late Night Drive', 'Cook a New Recipe', 'Cafe Date', 'Stargazing']
  },
  {
    name: 'Who gives the first massage? 💆',
    items: ['Sahil', 'Asmi', 'Both at the same time!']
  }
];

export const CustomRoulette: React.FC = () => {
  const { playSparkle, playPokeSound, playHeartPop } = useSound();
  const [items, setItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('asmi_custom_roulette_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ['Pizza', 'Sushi', 'Pasta', 'Burgers', 'Tacos', 'Boba & Ice Cream'];
  });

  const [newItemText, setNewItemText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  useEffect(() => {
    localStorage.setItem('asmi_custom_roulette_items', JSON.stringify(items));
  }, [items]);

  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) {
      showLoveWarning('Please enter a choice/option for the wheel, my love! 🎡', '🥺');
      return;
    }
    setItems((prev) => [...prev, newItemText.trim()]);
    showLoveSuccess(`Added "${newItemText.trim()}" to the wheel! ✨`, '🎡');
    setNewItemText('');
    playSparkle();
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 2) {
      showLoveWarning('The wheel needs at least 2 choices to spin, darling! 🎡', '💖');
      return;
    }
    playHeartPop();
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const loadPreset = (presetItems: string[]) => {
    setItems(presetItems);
    setSelectedWinner(null);
    playSparkle();
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (items.length < 2) {
      showLoveWarning('You need at least 2 sweet choices on the wheel to spin, darling! 🎡💖', '🥺');
      return;
    }

    setIsSpinning(true);
    setSelectedWinner(null);
    playPokeSound('poke');

    const numItems = items.length;
    const sliceAngle = 360 / numItems;
    
    // Pick a random winning index
    const winningIndex = Math.floor(Math.random() * numItems);
    
    // Calculate final rotation (multiple full spins + exact target angle)
    const extraSpins = 5 * 360; // 5 full rotations
    // The top pointer points at 270 degrees (or top 0 deg with -90 offset)
    const targetSliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const finalRotation = rotationAngle + extraSpins + (360 - targetSliceCenter);

    setRotationAngle(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const winner = items[winningIndex];
      setSelectedWinner(winner);
      playSparkle();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 4000);
  };

  const numItems = items.length;
  const sliceAngle = 360 / numItems;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          Can't Make Up Your Mind?
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif-title">
          The Decision Roulette 🎡
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm">
          Add any custom choices (food, who does what, movie choices) and let the wheel decide for you!
        </p>
      </div>

      {/* Main Grid: Wheel on Left, Items Manager on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Animated Wheel */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 shadow-xl relative overflow-hidden">
          
          {/* Top Pointer Indicator */}
          <div className="relative z-20 -mb-4 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-rose-600 drop-shadow-md" />
          </div>

          {/* Canvas / SVG Wheel */}
          <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center my-2">
            <motion.div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.15), inset 0 0 0 6px #ffffff',
                transform: `rotate(${rotationAngle}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
              }}
              className="relative overflow-hidden border-4 border-white"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {items.map((item, i) => {
                  const startAngle = i * sliceAngle;
                  const endAngle = (i + 1) * sliceAngle;

                  // Coordinates on circle
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                  const largeArc = sliceAngle > 180 ? 1 : 0;
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  const color = WHEEL_COLORS[i % WHEEL_COLORS.length];

                  // Text angle
                  const midAngle = startAngle + sliceAngle / 2;
                  const textRad = (Math.PI * midAngle) / 180;
                  const textX = 50 + 32 * Math.cos(textRad);
                  const textY = 50 + 32 * Math.sin(textRad);

                  return (
                    <g key={i}>
                      <path d={pathData} fill={color} stroke="#ffffff" strokeWidth="0.8" />
                      <text
                        x={textX}
                        y={textY}
                        fill="#ffffff"
                        fontSize={numItems > 8 ? "3.2" : numItems > 5 ? "4" : "4.8"}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                        className="drop-shadow-xs select-none"
                      >
                        {item.length > 14 ? item.slice(0, 12) + '...' : item}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </motion.div>

            {/* Center Pin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="absolute z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-rose-600 font-extrabold text-xs sm:text-sm uppercase shadow-xl flex flex-col items-center justify-center border-4 border-rose-100 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            >
              <Disc size={18} className={isSpinning ? 'animate-spin text-rose-500' : 'text-rose-500'} />
              <span>{isSpinning ? 'Spinning' : 'SPIN'}</span>
            </button>
          </div>

          {/* Winner Display Result Box */}
          <div className="w-full mt-6">
            <AnimatePresence>
              {selectedWinner ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-linear-to-r from-rose-500 via-pink-500 to-amber-500 text-white text-center shadow-lg"
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1 text-rose-100">
                    <Trophy size={14} className="text-amber-200" />
                    The Wheel Has Chosen!
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-serif-title tracking-tight">
                    🎉 {selectedWinner} 🎉
                  </h3>
                </motion.div>
              ) : (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500 font-medium">
                  {isSpinning ? 'The wheel is spinning...' : 'Press SPIN or tap the center button to roll!'}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Add Items & Presets */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Presets */}
          <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-100 shadow-md">
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Quick Presets
            </h3>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(p.items)}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-rose-50 hover:text-rose-600 border border-stone-200 text-xs font-semibold text-stone-700 transition text-left"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Add & Manage Options */}
          <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-100 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                Wheel Options ({items.length})
              </h3>
              <button
                onClick={() => setItems([])}
                className="text-[11px] text-stone-400 hover:text-rose-500 transition"
              >
                Clear All
              </button>
            </div>

            {/* Add Item Form */}
            <form onSubmit={handleAddItem} noValidate className="flex gap-2 mb-4">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add custom option (e.g. Burgers)..."
                className="flex-1 p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                required
              />
              <button
                type="submit"
                className="py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1 shrink-0"
              >
                <Plus size={14} /> Add
              </button>
            </form>

            {/* List of current items with remove buttons */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs font-medium text-stone-800 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: WHEEL_COLORS[idx % WHEEL_COLORS.length] }}
                    />
                    <span className="truncate">{item}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="text-stone-300 hover:text-rose-500 p-1 transition"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
