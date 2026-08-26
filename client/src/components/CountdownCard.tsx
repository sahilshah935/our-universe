import React, { useState, useEffect } from 'react';
import { Countdown } from '../types';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trash2, Sparkles, Heart } from 'lucide-react';
import { api } from '../services/api';

interface CountdownCardProps {
  countdown: Countdown;
  onDeleted?: (id: string) => void;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ countdown, onDeleted }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete countdown for "${countdown.title}"?`)) {
      await api.deleteCountdown(countdown.id);
      if (onDeleted) onDeleted(countdown.id);
    }
  };

  const formattedDate = new Date(countdown.targetDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${
        timeLeft.isExpired
          ? 'bg-rose-50/90 border-rose-300 shadow-md'
          : 'bg-white/80 backdrop-blur-md border-rose-100 shadow-md hover:shadow-xl'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-100 to-pink-200 flex items-center justify-center text-2xl shadow-inner">
            {countdown.emoji || '💖'}
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-700 uppercase tracking-wider mb-1">
              {countdown.category}
            </span>
            <h3 className="text-base font-bold text-stone-800 line-clamp-1">{countdown.title}</h3>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="text-stone-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition"
          title="Delete countdown"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {countdown.description && (
        <p className="text-stone-500 text-xs mb-3 italic">
          "{countdown.description}"
        </p>
      )}

      {/* Countdown Timer Display */}
      {timeLeft.isExpired ? (
        <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl text-white text-center font-bold text-sm shadow-md flex items-center justify-center gap-2">
          <Sparkles size={16} />
          Today is the Day! Enjoy every second 🎉
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1.5 text-center mt-2">
          <div className="bg-stone-50/90 border border-stone-200/50 rounded-xl py-2 px-1">
            <span className="block text-lg sm:text-xl font-extrabold text-stone-800 font-mono">
              {timeLeft.days}
            </span>
            <span className="text-[10px] font-medium text-stone-400 uppercase">Days</span>
          </div>
          <div className="bg-stone-50/90 border border-stone-200/50 rounded-xl py-2 px-1">
            <span className="block text-lg sm:text-xl font-extrabold text-stone-800 font-mono">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-medium text-stone-400 uppercase">Hours</span>
          </div>
          <div className="bg-stone-50/90 border border-stone-200/50 rounded-xl py-2 px-1">
            <span className="block text-lg sm:text-xl font-extrabold text-stone-800 font-mono">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-medium text-stone-400 uppercase">Mins</span>
          </div>
          <div className="bg-rose-50/90 border border-rose-200/60 rounded-xl py-2 px-1">
            <span className="block text-lg sm:text-xl font-extrabold text-rose-600 font-mono">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-medium text-rose-500 uppercase">Secs</span>
          </div>
        </div>
      )}

      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formattedDate}
        </span>
        <span className="flex items-center gap-1 font-medium text-rose-500">
          <Clock size={12} />
          {timeLeft.isExpired ? 'Completed' : `${timeLeft.days} days left`}
        </span>
      </div>
    </motion.div>
  );
};
