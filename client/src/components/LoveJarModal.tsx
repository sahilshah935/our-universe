import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X, RefreshCw } from 'lucide-react';
import { LoveJarWish } from '../types';
import { coupleStore } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import confetti from 'canvas-confetti';

export const LoveJarModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { currentPartner } = useAuth();
  const { playSparkle, playHeartPop } = useSound();
  const [currentWish, setCurrentWish] = useState<LoveJarWish | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState('Compliment');

  const drawWish = () => {
    setIsDrawing(true);
    playHeartPop();
    const wish = coupleStore.getRandomLoveJarWish();
    setTimeout(() => {
      setCurrentWish(wish);
      setIsDrawing(false);
      playSparkle();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }, 450);
  };

  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      showLoveWarning('Please write a sweet reason or compliment to fold into the star! ⭐', '🥺');
      return;
    }
    if (!currentPartner) return;

    coupleStore.addLoveJarWish({
      message: newMessage.trim(),
      category: newCategory,
      authorId: currentPartner.id
    });

    showLoveSuccess('Origami star folded & dropped into the love jar! ⭐💖', '✨');
    setNewMessage('');
    setShowAddForm(false);
    playSparkle();
    confetti({ particleCount: 30, spread: 45 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-md w-full bg-linear-to-b from-rose-50 via-white to-pink-50 rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 overflow-hidden text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-100 transition"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            Origami Star Love Jar
          </span>
          <h3 className="text-2xl font-extrabold text-stone-800 font-serif-title">
            Reasons I Love You ✨
          </h3>
          <p className="text-stone-500 text-xs mt-1">
            Draw a folded origami star whenever you need warmth or a smile.
          </p>
        </div>

        {/* Jar Graphic & Star Reveal */}
        <div className="relative py-6 my-2 flex flex-col items-center justify-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-28 bg-white/70 backdrop-blur-md rounded-b-3xl rounded-t-lg border-2 border-rose-300 shadow-inner flex items-center justify-center relative overflow-hidden"
          >
            {/* Stars floating inside jar */}
            <span className="text-2xl absolute top-3 left-4 animate-pulse">⭐</span>
            <span className="text-xl absolute bottom-3 right-4 animate-bounce">💖</span>
            <span className="text-2xl absolute bottom-4 left-6">✨</span>
            <span className="text-3xl">🫙</span>
          </motion.div>

          {/* Drawn Note Display */}
          <div className="w-full mt-5">
            {currentWish ? (
              <motion.div
                key={currentWish.id}
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-md text-stone-800 text-left relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                    {currentWish.category}
                  </span>
                  <span className="text-[11px] text-stone-400">Drawn {currentWish.drawnCount} times</span>
                </div>
                <p className="text-sm sm:text-base font-handwriting text-lg leading-relaxed text-stone-800">
                  "{currentWish.message}"
                </p>
              </motion.div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                Tap the button below to unfold an origami star!
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-4">
          <button
            onClick={drawWish}
            disabled={isDrawing}
            className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} className={isDrawing ? 'animate-spin' : ''} />
            {isDrawing ? 'Unfolding Star...' : 'Draw An Origami Wish ⭐'}
          </button>

          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-rose-600 hover:bg-rose-100/50 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> Drop a new reason into the jar
            </button>
          ) : (
            <form onSubmit={handleAddWish} noValidate className="p-3 bg-white rounded-2xl border border-rose-200 text-left space-y-2.5 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Add a Reason or Compliment</span>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="text-xs p-1 rounded-lg border border-stone-200 bg-stone-50"
                >
                  <option value="Compliment">Compliment</option>
                  <option value="Gratitude">Gratitude</option>
                  <option value="Love">Love Reason</option>
                  <option value="Encouragement">Encouragement</option>
                  <option value="Promise">Promise</option>
                </select>
              </div>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write something sweet for when your love opens this jar..."
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 resize-none focus:outline-none focus:ring-1 focus:ring-rose-400"
                rows={2}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition"
                >
                  Save to Jar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="py-1.5 px-3 bg-stone-100 text-stone-600 rounded-lg text-xs font-semibold hover:bg-stone-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
