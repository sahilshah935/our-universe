import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Milestone, FutureDreamItem } from '../types';
import { coupleStore } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { uploadMedia } from '../services/firebase';
import { Sparkles, Plus, Calendar, Heart, Camera, Compass, Trash2, ArrowDown, Star, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RelationshipTimeline: React.FC = () => {
  const { currentPartner } = useAuth();
  const { playSparkle, playHeartPop } = useSound();
  const [timeline, setTimeline] = useState<Milestone[]>(() => coupleStore.getTimeline());
  const [futureDreams, setFutureDreams] = useState<FutureDreamItem[]>(() => coupleStore.getFutureDreams());
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isAddingDream, setIsAddingDream] = useState(false);

  // New step form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💖');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // New dream form
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamDesc, setDreamDesc] = useState('');
  const [dreamEmoji, setDreamEmoji] = useState('✈️');
  const [dreamYear, setDreamYear] = useState('Soon');

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setTimeline(coupleStore.getTimeline());
      setFutureDreams(coupleStore.getFutureDreams());
    });
    return unsubscribe;
  }, []);

  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadMedia(file);
      setPhotoUrl(url);
      showLoveSuccess('Story photo uploaded! 📸', '✨');
    } catch (err) {
      console.error(err);
      showLoveWarning('Failed to upload photo, my love! 🥺');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showLoveWarning('Please enter a milestone title for our story, darling! 🗺️', '🥺');
      return;
    }
    if (!date) {
      showLoveWarning('Please pick the special date when this moment happened, my love! 📅', '✨');
      return;
    }
    if (!currentPartner) return;

    coupleStore.addTimelineMilestone({
      title: title.trim(),
      date,
      description: description.trim(),
      icon,
      photoUrl: photoUrl || undefined
    });

    playSparkle();
    confetti({ particleCount: 50, spread: 60 });
    showLoveSuccess('Story chapter pinned to our relationship timeline! 🗺️💖', '🎉');
    setTitle('');
    setDate('');
    setDescription('');
    setPhotoUrl('');
    setIsAddingStep(false);
  };

  const handleAddDream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamTitle.trim()) {
      showLoveWarning('Please write your future dream for us, my love! 🌟', '🥺');
      return;
    }
    if (!currentPartner) return;

    coupleStore.addFutureDream({
      title: dreamTitle.trim(),
      description: dreamDesc.trim(),
      emoji: dreamEmoji,
      targetYear: dreamYear,
      addedById: currentPartner.id
    });

    playSparkle();
    showLoveSuccess('Future dream added to "The Next Chapter"! 🌟✨', '💖');
    setDreamTitle('');
    setDreamDesc('');
    setIsAddingDream(false);
  };

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          From Strangers to Mine Forever
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-serif-title">
          Our Love Story Timeline 🗺️
        </h2>
        <p className="text-stone-500 text-sm sm:text-base leading-relaxed">
          A scrolling journey through every turning point, first conversation, inside joke, and sweet memory.
        </p>

        <button
          onClick={() => setIsAddingStep(true)}
          className="mt-4 py-2.5 px-5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition inline-flex items-center gap-1.5"
        >
          <Plus size={15} /> Add Milestone Step
        </button>
      </div>

      {/* Vertical Timeline Steps */}
      <div className="relative pl-6 sm:pl-10 border-l-3 border-dashed border-rose-300 space-y-12 my-8">
        {timeline.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="relative group"
          >
            {/* Step Marker Badge */}
            <div className="absolute -left-[41px] sm:-left-[57px] top-1.5 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-xl sm:text-2xl shadow-lg ring-4 ring-white">
              {step.icon || '💖'}
            </div>

            {/* Step Card Content */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-md border border-rose-100 shadow-md hover:shadow-xl transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold font-mono text-rose-600 bg-rose-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <Calendar size={13} />
                  {new Date(step.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-xs font-bold text-stone-400">Step #{idx + 1}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif-title mb-2">
                {step.title}
              </h3>

              {step.description && (
                <p className="text-stone-700 text-sm sm:text-base font-handwriting text-xl leading-relaxed mb-4">
                  "{step.description}"
                </p>
              )}

              {/* Photo if attached */}
              {step.photoUrl && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-stone-200 max-h-72">
                  <img src={step.photoUrl} alt={step.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => {
                    playHeartPop();
                    coupleStore.deleteTimelineMilestone(step.id);
                  }}
                  className="text-stone-300 hover:text-rose-500 text-xs transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* SECTION 2: THE NEXT CHAPTER (FUTURE DREAMS) */}
      <div className="p-8 sm:p-10 rounded-3xl bg-linear-to-br from-purple-900 via-indigo-900 to-rose-950 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider text-rose-200 mb-1">
                <Star size={13} className="fill-amber-300 text-amber-300" />
                The Next Chapter
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold font-serif-title">
                What We’re Excited For Together ✨
              </h3>
              <p className="text-purple-200 text-xs sm:text-sm mt-1">
                Future trips, spontaneous cozy Sundays, and forever memories we haven’t made yet.
              </p>
            </div>

            <button
              onClick={() => setIsAddingDream(true)}
              className="py-2.5 px-4 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-rose-50 transition flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} /> Add Future Dream
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {futureDreams.map((dream) => (
              <motion.div
                key={dream.id}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{dream.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-rose-200">
                      {dream.targetYear || 'Future'}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{dream.title}</h4>
                  <p className="text-xs text-purple-100/80 leading-relaxed">{dream.description}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-300">
                  <span>Dreamt by {dream.addedById === 'partner1' ? 'Sahil' : 'Asmi'}</span>
                  <button
                    onClick={() => {
                      playHeartPop();
                      coupleStore.deleteFutureDream(dream.id);
                    }}
                    className="hover:text-rose-400 p-1 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Milestone Step Modal */}
      <AnimatePresence>
        {isAddingStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 my-auto"
            >
              <button
                onClick={() => setIsAddingStep(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50"
              >
                ✕
              </button>

              <h3 className="text-2xl font-bold text-stone-800 font-serif-title mb-4">
                Add Timeline Milestone 💖
              </h3>

              <form onSubmit={handleAddStep} noValidate className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. The First Date"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Emoji Icon</label>
                  <div className="flex gap-2 text-xl">
                    {['💬', '☕', '😂', '🩹', '🏡', '✈️', '💍', '✨'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setIcon(em)}
                        className={`p-1.5 rounded-lg border ${icon === em ? 'border-rose-500 bg-rose-50' : 'border-stone-200'}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Why That Moment Mattered (In your natural voice)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write what you felt and why this moment was unforgettable..."
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 font-handwriting text-lg resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Upload Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full text-xs"
                  />
                  {isUploading && <span className="text-[11px] text-stone-400">Uploading photo...</span>}
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !title || !date}
                  className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Save Milestone Step ✨
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Future Dream Modal */}
      <AnimatePresence>
        {isAddingDream && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 text-stone-800"
            >
              <button
                onClick={() => setIsAddingDream(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50"
              >
                ✕
              </button>

              <h3 className="text-xl font-bold font-serif-title mb-4">Add Future Dream ✨</h3>

              <form onSubmit={handleAddDream} noValidate className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Emoji</label>
                    <input
                      type="text"
                      value={dreamEmoji}
                      onChange={(e) => setDreamEmoji(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-stone-200 text-center text-xl"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Dream Title</label>
                    <input
                      type="text"
                      value={dreamTitle}
                      onChange={(e) => setDreamTitle(e.target.value)}
                      placeholder="e.g. Build our dream home with a garden"
                      className="w-full p-2 text-xs rounded-xl border border-stone-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Timeframe / Year</label>
                  <input
                    type="text"
                    value={dreamYear}
                    onChange={(e) => setDreamYear(e.target.value)}
                    placeholder="e.g. 2026 / Next Summer / Forever"
                    className="w-full p-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Description</label>
                  <textarea
                    value={dreamDesc}
                    onChange={(e) => setDreamDesc(e.target.value)}
                    placeholder="Describe how we will celebrate it..."
                    className="w-full p-2 text-xs rounded-xl border border-stone-200 resize-none"
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Pin to The Next Chapter 🌟
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
