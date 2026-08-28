import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLoveToast } from '../context/LoveToastContext';
import { LiveTicker } from '../components/LiveTicker';
import { CountdownCard } from '../components/CountdownCard';
import { PolaroidCard } from '../components/PolaroidCard';
import { Countdown, Memory, Partner } from '../types';
import { coupleStore } from '../services/store';
import { Heart, Plus, Calendar, Star, ArrowRight, Key, BookOpen, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate
}) => {
  const { partners } = useAuth();
  const [storedPartners, setStoredPartners] = useState<Partner[]>(() => coupleStore.getPartners());
  const [countdowns, setCountdowns] = useState<Countdown[]>(() => coupleStore.getCountdowns());
  const [recentMemories, setRecentMemories] = useState<Memory[]>(() => coupleStore.getMemories());
  const [isAddingCountdown, setIsAddingCountdown] = useState(false);

  // New countdown form state
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCategory, setNewCategory] = useState('Date Night');
  const [newEmoji, setNewEmoji] = useState('💖');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setStoredPartners(coupleStore.getPartners());
      setCountdowns(coupleStore.getCountdowns());
      setRecentMemories(coupleStore.getMemories().slice(0, 4));
    });
    return unsubscribe;
  }, []);

  const partner1 = storedPartners.find((p) => p.id === 'partner1') || partners[0];
  const partner2 = storedPartners.find((p) => p.id === 'partner2') || partners[1];

  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const handleAddCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showLoveWarning('Please enter a cute title for our countdown, my love! ⏳', '💖');
      return;
    }
    if (!newDate) {
      showLoveWarning('Please pick a special date and time to count down to, darling! 📅', '✨');
      return;
    }

    coupleStore.addCountdown({
      title: newTitle.trim(),
      targetDate: new Date(newDate).toISOString(),
      category: newCategory,
      emoji: newEmoji.trim() || '💖',
      description: newDesc.trim() || undefined
    });

    showLoveSuccess('Countdown started! Counting down every second with you ⏰', '🎉');
    setNewTitle('');
    setNewDate('');
    setNewDesc('');
    setIsAddingCountdown(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Live Relationship Ticker: 13 March, 2024 */}
      <LiveTicker startDate="2024-03-13T00:00:00" />

      {/* 2. Partner Persona Glance Cards (Dynamic Live Avatars & Statuses) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Partner 1 (Sahil / BabyGirl) Card */}
        <div className="p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-indigo-100 shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-400 shrink-0 shadow-md">
            <img
              src={partner1?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
              alt={partner1?.name || 'Sahil'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">{partner1?.name || 'Sahil'}</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                {partner1?.nickname || 'BabyGirl'}
              </span>
            </div>
            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5 italic">
              "{partner1?.bio || 'Loving you since 13 March, 2024 ❤️'}"
            </p>
            <div className="mt-2 text-xs font-medium text-indigo-600 flex items-center gap-1.5">
              <span>{partner1?.statusEmoji || '☕'}</span> Status: "{partner1?.status || 'Thinking about my girl 💭'}"
            </div>
          </div>
        </div>

        {/* Partner 2 (Asmi / Supari / Girl) Card */}
        <div className="p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-pink-100 shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-pink-400 shrink-0 shadow-md">
            <img
              src={partner2?.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400'}
              alt={partner2?.name || 'Asmi'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">{partner2?.name || 'Asmi'}</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 font-bold">
                {partner2?.nickname || 'Supari / Girl'}
              </span>
            </div>
            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5 italic">
              "{partner2?.bio || 'Stealing your hoodies and your heart forever ✨'}"
            </p>
            <div className="mt-2 text-xs font-medium text-pink-600 flex items-center gap-1.5">
              <span>{partner2?.statusEmoji || '🌸'}</span> Status: "{partner2?.status || 'Craving your hugs & snacks 🧋'}"
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Countdowns Section (Asmi Bday: 16 Oct, Sahil Bday: 09 Mar) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-2xl font-extrabold text-stone-800 font-serif-title flex items-center gap-2">
              <Calendar className="text-rose-500" size={22} />
              Upcoming Moments & Countdowns ⏳
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm">
              Ticking down live to birthdays, anniversaries, and special moments.
            </p>
          </div>

          <button
            onClick={() => setIsAddingCountdown(!isAddingCountdown)}
            className="py-2 px-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-rose-200"
          >
            <Plus size={14} /> Add Countdown
          </button>
        </div>

        {/* Add Countdown Form (Aesthetic Romantic Card) */}
        <AnimatePresence>
          {isAddingCountdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="p-6 sm:p-8 rounded-3xl bg-linear-to-b from-white via-rose-50/40 to-pink-50/50 border-2 border-rose-200/90 shadow-2xl max-w-xl relative overflow-hidden"
            >
              {/* Background Ambient Glow */}
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-rose-300/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-700 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 border border-rose-200/60">
                    <Heart size={12} className="fill-rose-500 text-rose-500" />
                    New Countdown Timer ⏳
                  </div>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-serif-title">
                    Count Down to Our Next Moment 💕
                  </h4>
                  <p className="text-stone-500 text-xs mt-0.5">
                    Every second brings us closer to making more memories together.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingCountdown(false)}
                  className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-white/80 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-white/90 border border-rose-200 shadow-sm mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                    {newEmoji || '💖'}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 px-2 py-0.5 bg-rose-50 rounded-full border border-rose-100">
                      {newCategory}
                    </span>
                    <h5 className="font-bold text-stone-800 text-sm mt-0.5 font-serif-title line-clamp-1">
                      {newTitle.trim() || 'Your Countdown Title'}
                    </h5>
                    <span className="text-[11px] text-stone-400 italic block line-clamp-1 font-handwriting text-base">
                      {newDesc.trim() || "Can't wait for this special day! ❤️"}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-pink-300 block">Preview</span>
                  <span className="text-xs font-mono font-bold">00d : 00h : 00m</span>
                </div>
              </div>

              <form onSubmit={handleAddCountdown} noValidate className="space-y-4">
                {/* Title & Target Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Countdown Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Next Cozy Date Night 🥐"
                      className="w-full p-3 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
                      <Calendar size={12} className="text-rose-500" /> Target Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Category Selection Pills */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
                    Select Category
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'Birthday', label: '🎂 Birthday' },
                      { id: 'Anniversary', label: '💍 Anniversary' },
                      { id: 'Date Night', label: '🍷 Date Night' },
                      { id: 'Travel', label: '✈️ Getaway' },
                      { id: 'Special', label: '✨ Special Event' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          newCategory === cat.id
                            ? 'bg-rose-500 text-white shadow-xs shadow-rose-200'
                            : 'bg-white text-stone-600 border border-stone-200 hover:bg-rose-50 hover:text-rose-600'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji Palette Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
                    Choose Countdown Icon / Emoji
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['💖', '💍', '🎂', '🧸', '🍷', '✈️', '🏖️', '🍿', '🎡', '🥂', '🌸', '👑', '🍝', '🏡'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewEmoji(em)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition cursor-pointer shrink-0 ${
                          newEmoji === em
                            ? 'bg-rose-100 border-2 border-rose-500 scale-110 shadow-xs'
                            : 'bg-white border border-stone-200 hover:bg-rose-50'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sweet Note */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Sweet Note / Message (Optional)
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g. Can't wait to see your smile and celebrate together! ❤️"
                    className="w-full p-3 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 font-handwriting text-lg resize-none"
                    rows={2}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCountdown(false)}
                    className="py-2.5 px-4 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Sparkles size={14} /> Start Our Countdown ⏳
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdowns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {countdowns.map((cd) => (
            <CountdownCard
              key={cd.id}
              countdown={cd}
              onDeleted={(id) => coupleStore.deleteCountdown(id)}
            />
          ))}
        </div>
      </div>

      {/* 4. Scrapbook Highlights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-stone-800 font-serif-title flex items-center gap-2">
              <Heart className="text-rose-500 fill-rose-500" size={20} />
              Recent Polaroid Memories 📸
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm">
              Flip polaroids to read our secret handwritten story on the back.
            </p>
          </div>

          <button
            onClick={() => onNavigate('scrapbook')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:gap-2 transition-all"
          >
            View Scrapbook <ArrowRight size={14} />
          </button>
        </div>

        {recentMemories.length === 0 ? (
          <div className="py-12 px-6 rounded-3xl bg-white/60 border-2 border-dashed border-rose-200 text-center flex flex-col items-center gap-2">
            <span className="text-3xl">📷</span>
            <h4 className="font-bold text-stone-800 text-base">Your Polaroid Wall is Ready!</h4>
            <p className="text-stone-500 text-xs max-w-sm">
              Both Sahil and Asmi can upload photos, add handwritten stories, and organize by chapters.
            </p>
            <button
              onClick={() => onNavigate('scrapbook')}
              className="mt-2 py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Add First Polaroid Memory ✨
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {recentMemories.map((mem, idx) => (
              <PolaroidCard
                key={mem.id}
                memory={mem}
                rotation={(idx % 2 === 0 ? 1 : -1) * ((idx % 3) + 1)}
                onDeleted={(id) => coupleStore.deleteMemory(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Romantic Action Cards (Comfort Sanctuary, Nicknames, Dictionary, etc.) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('journal')}
          className="p-5 rounded-3xl bg-linear-to-br from-rose-50 to-pink-100/60 border border-rose-200/80 shadow-xs hover:shadow-md cursor-pointer transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-xl mb-3 shadow-md shadow-rose-200 group-hover:scale-110 transition">
            <Heart size={22} className="fill-white" />
          </div>
          <h4 className="text-base font-bold text-stone-800 font-serif-title">Love Journal & Fridge 💌</h4>
          <p className="text-xs text-stone-500 mt-1">
            Handwritten letters, time capsules, and colorful sticky notes on our fridge.
          </p>
        </div>

        <div
          onClick={() => onNavigate('nicknames')}
          className="p-5 rounded-3xl bg-linear-to-br from-amber-50 to-orange-100/60 border border-amber-200/80 shadow-xs hover:shadow-md cursor-pointer transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl mb-3 shadow-md shadow-amber-200 group-hover:scale-110 transition">
            <Star size={22} className="fill-white" />
          </div>
          <h4 className="text-base font-bold text-stone-800 font-serif-title">The Nickname Wall</h4>
          <p className="text-xs text-stone-500 mt-1">
            BabyGirl, Supari, and all our cute pet names styled with explanations.
          </p>
        </div>

        <div
          onClick={() => onNavigate('insidejokes')}
          className="p-5 rounded-3xl bg-linear-to-br from-purple-50 to-indigo-100/60 border border-purple-200/80 shadow-xs hover:shadow-md cursor-pointer transition group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-xl mb-3 shadow-md shadow-purple-200 group-hover:scale-110 transition">
            <BookOpen size={22} />
          </div>
          <h4 className="text-base font-bold text-stone-800 font-serif-title">Inside-Joke Dictionary</h4>
          <p className="text-xs text-stone-500 mt-1">
            Formal dictionary definitions for our private couple vocabulary.
          </p>
        </div>
      </div>
    </div>
  );
};
