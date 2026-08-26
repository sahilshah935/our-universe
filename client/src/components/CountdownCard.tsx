import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Heart } from 'lucide-react';
import { Countdown } from '../types';
import { api } from '../services/api';
import { SweetConfirmModal } from './SweetConfirmModal';

interface CountdownCardProps {
  countdown: Countdown;
  onDeleted?: (id: string) => void;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ countdown, onDeleted }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  const [showConfirm, setShowConfirm] = useState(false);

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

  const confirmDelete = async () => {
    await api.deleteCountdown(countdown.id);
    if (onDeleted) onDeleted(countdown.id);
    setShowConfirm(false);
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

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-stone-400 hover:text-rose-500 rounded-full hover:bg-rose-50"
            title="Delete countdown"
          >
            <Trash2 size={16} />
          </button>
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

      <SweetConfirmModal
        isOpen={showConfirm}
        message={`Are you sure you want to remove the countdown for "${countdown.title}", my love?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
