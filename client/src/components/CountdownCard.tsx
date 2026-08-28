import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Heart, Edit3, X, Calendar, Sparkles } from 'lucide-react';
import { Countdown } from '../types';
import { coupleStore } from '../services/store';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { SweetConfirmModal } from './SweetConfirmModal';

interface CountdownCardProps {
  countdown: Countdown;
  onDeleted?: (id: string) => void;
  onUpdated?: (updated: Countdown) => void;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ countdown, onDeleted, onUpdated }) => {
  const { playHeartPop, playSparkle } = useSound();
  const { showLoveSuccess } = useLoveToast();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [editTitle, setEditTitle] = useState(countdown.title);
  const [editDate, setEditDate] = useState(countdown.targetDate ? countdown.targetDate.slice(0, 16) : '');
  const [editCategory, setEditCategory] = useState(countdown.category || 'Date Night');
  const [editEmoji, setEditEmoji] = useState(countdown.emoji || '💖');
  const [editDesc, setEditDesc] = useState(countdown.description || '');

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(countdown.targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [countdown.targetDate]);

  const confirmDelete = () => {
    playHeartPop();
    coupleStore.deleteCountdown(countdown.id);
    if (onDeleted) onDeleted(countdown.id);
    setShowConfirm(false);
    showLoveSuccess('Countdown removed with love! ⏳', '✨');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = coupleStore.updateCountdown(countdown.id, {
      title: editTitle.trim() || countdown.title,
      targetDate: editDate ? new Date(editDate).toISOString() : countdown.targetDate,
      category: editCategory,
      emoji: editEmoji,
      description: editDesc.trim()
    });
    playSparkle();
    showLoveSuccess('Countdown updated beautifully! ⏳💖', '✨');
    setIsEditing(false);
    if (onUpdated) onUpdated(updated);
  };

  const formattedDate = new Date(countdown.targetDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="glass-panel p-5 rounded-3xl relative overflow-hidden group border border-rose-100 shadow-md hover:shadow-xl transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl p-2 rounded-2xl bg-rose-50 shadow-inner">{countdown.emoji}</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 font-mono">
                {countdown.category}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-stone-800 font-serif-title line-clamp-1">
                {countdown.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditTitle(countdown.title);
                setEditDate(countdown.targetDate ? countdown.targetDate.slice(0, 16) : '');
                setEditCategory(countdown.category || 'Date Night');
                setEditEmoji(countdown.emoji || '💖');
                setEditDesc(countdown.description || '');
                setIsEditing(true);
              }}
              className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-400 hover:text-amber-500 rounded-full hover:bg-amber-50 cursor-pointer"
              title="Edit countdown"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowConfirm(true);
              }}
              className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-400 hover:text-rose-500 rounded-full hover:bg-rose-50 cursor-pointer"
              title="Delete countdown"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {countdown.description && (
          <p className="text-xs text-stone-500 mb-3 italic line-clamp-1">"{countdown.description}"</p>
        )}

        {/* Counter Units */}
        <div className="grid grid-cols-4 gap-2 py-3 px-2 rounded-2xl bg-rose-50/50 border border-rose-100/60 text-center">
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black text-rose-600 font-mono tracking-tight">
              {timeLeft.days}
            </span>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black text-rose-600 font-mono tracking-tight">
              {timeLeft.hours}
            </span>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Hours</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black text-rose-600 font-mono tracking-tight">
              {timeLeft.minutes}
            </span>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Mins</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black text-rose-600 font-mono tracking-tight animate-pulse">
              {timeLeft.seconds}
            </span>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Secs</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 font-medium">
          <span className="flex items-center gap-1">
            <Heart size={12} className="text-rose-400 fill-rose-400" /> Target
          </span>
          <span className="font-mono text-stone-500">{formattedDate}</span>
        </div>
      </motion.div>

      {/* Edit Countdown Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-200 text-stone-800 my-auto"
            >
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <Edit3 size={12} /> Edit Countdown
                </span>
                <h4 className="text-2xl font-bold font-serif-title text-stone-900">
                  Update Countdown Timer ⏳
                </h4>
              </div>

              <form onSubmit={handleSaveEdit} noValidate className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
                      <Calendar size={12} className="text-rose-500" /> Target Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Date Night">Date Night</option>
                    <option value="Travel">Trip / Getaway</option>
                    <option value="Special">Special Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Emoji</label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {['💖', '💍', '🎂', '🧸', '🍷', '✈️', '🏖️', '🍿', '🎡', '🥂', '🌸', '👑'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEditEmoji(em)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base cursor-pointer ${
                          editEmoji === em ? 'bg-rose-100 border-2 border-rose-500' : 'border border-stone-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Sweet Note</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 font-handwriting text-base resize-none"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 px-4 bg-stone-100 text-stone-600 font-bold rounded-xl text-xs hover:bg-stone-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-linear-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-200 hover:from-rose-600 hover:to-pink-600 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SweetConfirmModal
        isOpen={showConfirm}
        message={`Are you sure you want to remove the countdown for "${countdown.title}", my love?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
