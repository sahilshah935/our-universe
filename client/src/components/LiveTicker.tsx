import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface LiveTickerProps {
  startDate?: string;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ startDate = '2024-03-13T00:00:00' }) => {
  const [timeTogether, setTimeTogether] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDate).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);

      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      const startD = new Date(startDate);
      const nowD = new Date();

      let years = nowD.getFullYear() - startD.getFullYear();
      let months = nowD.getMonth() - startD.getMonth();
      let days = nowD.getDate() - startD.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonthLastDay = new Date(nowD.getFullYear(), nowD.getMonth(), 0).getDate();
        days += prevMonthLastDay;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const hours = nowD.getHours();
      const minutes = nowD.getMinutes();
      const seconds = nowD.getSeconds();

      setTimeTogether({
        years: Math.max(0, years),
        months: Math.max(0, months),
        days: Math.max(0, days),
        hours,
        minutes,
        seconds,
        totalDays
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  const StatBox = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className="flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-rose-100/90 shadow-xs relative overflow-hidden group min-w-0 flex-1"
    >
      <div className={`text-lg sm:text-3xl font-extrabold tracking-tight font-mono ${color}`}>
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 mt-0.5">
        {label}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-300 to-pink-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-rose-100/90 via-pink-50/80 to-amber-100/80 p-4 sm:p-8 border border-rose-200/80 shadow-xl backdrop-blur-xl">
      {/* Decorative background blurs */}
      <div className="absolute -top-12 -left-12 w-44 h-44 bg-rose-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 border border-rose-200/50">
            <Heart size={13} className="fill-rose-500 text-rose-500 animate-pulse" />
            Loving You Since 13 March, 2024
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-800 font-serif-title flex items-center justify-center md:justify-start gap-2">
            Every Second With You ✨
          </h2>
          <p className="text-stone-600 text-xs sm:text-base mt-1 max-w-md">
            Together for <span className="font-bold text-rose-600 font-mono">{timeTogether.totalDays}</span> beautiful days and counting.
          </p>
        </div>

        {/* Live Ticker Digits */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 w-full md:w-auto">
          <StatBox value={timeTogether.years} label="Years" color="text-rose-600" />
          <StatBox value={timeTogether.months} label="Months" color="text-pink-600" />
          <StatBox value={timeTogether.days} label="Days" color="text-purple-600" />
          <StatBox value={timeTogether.hours} label="Hours" color="text-amber-600" />
          <StatBox value={timeTogether.minutes} label="Mins" color="text-emerald-600" />
          <StatBox value={timeTogether.seconds} label="Secs" color="text-rose-500" />
        </div>
      </div>
    </div>
  );
};
