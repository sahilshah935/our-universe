import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Milestone, FutureDreamItem } from '../types';
import { coupleStore } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { uploadImage } from '../services/imageUpload';
import { Sparkles, Plus, Calendar, Heart, Camera, Compass, Trash2, ArrowDown, Star, MapPin, Upload, Image as ImageIcon, X, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RelationshipTimeline: React.FC = () => {
  const { currentPartner } = useAuth();
  const { playSparkle, playHeartPop } = useSound();
  const [timeline, setTimeline] = useState<Milestone[]>(() => coupleStore.getTimeline());
  const [futureDreams, setFutureDreams] = useState<FutureDreamItem[]>(() => coupleStore.getFutureDreams());
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isAddingDream, setIsAddingDream] = useState(false);
  const [editingStep, setEditingStep] = useState<Milestone | null>(null);
  const [editingDream, setEditingDream] = useState<FutureDreamItem | null>(null);

  // Step form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💖');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dream form
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
      const url = await uploadImage(file);
      setPhotoUrl(url);
      showLoveSuccess('Story photo uploaded to Google Drive! 📸', '✨');
    } catch (err) {
      console.error(err);
      showLoveWarning('Failed to upload photo, my love! 🥺');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showLoveWarning('Please enter a milestone title for our story, darling! 🗺️', '🥺');
      return;
    }
    if (!date) {
      showLoveWarning('Please pick the special date when this moment happened, my love! 📅', '✨');
      return;
    }

    setIsSaving(true);
    try {
      coupleStore.addTimelineMilestone({
        title: title.trim(),
        date,
        description: description.trim() || '',
        icon,
        photoUrl: photoUrl.trim() || ''
      });

      playSparkle();
      confetti({ particleCount: 50, spread: 60 });
      showLoveSuccess('Story chapter pinned to our relationship timeline! 🗺️💖', '🎉');
      resetStepForm();
      setIsAddingStep(false);
    } catch (err) {
      console.error(err);
      showLoveWarning('Could not save milestone step right now 🥺');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEditStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep) return;
    coupleStore.updateTimelineMilestone(editingStep.id, {
      title: title.trim() || editingStep.title,
      date: date || editingStep.date,
      description: description.trim() || '',
      icon,
      photoUrl: photoUrl.trim() || ''
    });
    playSparkle();
    showLoveSuccess('Milestone updated! 🗺️✨', '🎉');
    setEditingStep(null);
  };

  const startEditStep = (step: Milestone) => {
    setEditingStep(step);
    setTitle(step.title);
    setDate(step.date);
    setDescription(step.description || '');
    setIcon(step.icon || '💖');
    setPhotoUrl(step.photoUrl || '');
  };

  const resetStepForm = () => {
    setTitle('');
    setDate('');
    setDescription('');
    setIcon('💖');
    setPhotoUrl('');
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
    resetDreamForm();
    setIsAddingDream(false);
  };

  const handleSaveEditDream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDream) return;
    coupleStore.updateFutureDream(editingDream.id, {
      title: dreamTitle.trim() || editingDream.title,
      description: dreamDesc.trim(),
      emoji: dreamEmoji,
      targetYear: dreamYear
    });
    playSparkle();
    showLoveSuccess('Future dream updated! 🌟✨', '🎉');
    setEditingDream(null);
  };

  const startEditDream = (dream: FutureDreamItem) => {
    setEditingDream(dream);
    setDreamTitle(dream.title);
    setDreamDesc(dream.description || '');
    setDreamEmoji(dream.emoji || '🏡');
    setDreamYear(dream.targetYear || 'Soon');
  };

  const resetDreamForm = () => {
    setDreamTitle('');
    setDreamDesc('');
    setDreamEmoji('✈️');
    setDreamYear('Soon');
  };

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          From Strangers to Mine Forever
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif-title tracking-tight">
          Our Love Story & Journey 🗺️
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
          Every conversation, inside joke, and midnight phone call brought us here.
        </p>

        <button
          type="button"
          onClick={() => {
            resetStepForm();
            setIsAddingStep(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-rose-200 transition cursor-pointer hover:scale-105"
        >
          <Plus size={16} /> Add Milestone Step
        </button>
      </div>

      {/* Vertical Aesthetic Timeline */}
      <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-1 before:bg-linear-to-b before:from-rose-400 before:via-pink-300 before:to-purple-400 before:rounded-full">
        {timeline.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="relative group"
          >
            {/* Timeline node icon */}
            <div className="absolute -left-6 sm:-left-10 top-1.5 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white border-2 border-rose-400 shadow-md flex items-center justify-center text-xs sm:text-sm z-10 group-hover:scale-115 group-hover:border-rose-600 transition">
              {step.icon || '💖'}
            </div>

            {/* Card Content */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition space-y-3 relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> {step.date}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-800 font-serif-title mt-0.5">
                    {step.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEditStep(step)}
                    className="p-1.5 text-stone-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 transition cursor-pointer"
                    title="Edit Milestone"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      playHeartPop();
                      coupleStore.deleteTimelineMilestone(step.id);
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Milestone"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {step.description && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-handwriting text-lg text-stone-700 bg-rose-50/30 p-3 rounded-2xl border border-rose-100/60">
                  "{step.description}"
                </p>
              )}

              {step.photoUrl && (
                <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-rose-200 shadow-xs">
                  <img src={step.photoUrl} alt={step.title} className="w-full h-48 object-cover hover:scale-103 transition duration-300" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* The Next Chapter & Future Dreams */}
      <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 text-white shadow-xl space-y-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-pink-300 text-xs font-bold uppercase tracking-wider mb-1 border border-white/10">
              <Compass size={13} /> The Next Chapter 🏔️
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-serif-title">
              Our Future Dreams & Plans ✨
            </h3>
            <p className="text-purple-200/80 text-xs sm:text-sm mt-1">
              Things we can't wait to experience together in the coming years.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetDreamForm();
              setIsAddingDream(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-white text-purple-950 font-bold text-xs shadow-md hover:bg-pink-100 transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus size={15} /> Add Future Dream
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {futureDreams.map((dream) => (
            <motion.div
              key={dream.id}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-2xl">{dream.emoji || '🏡'}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/30 text-pink-200 font-bold">
                    {dream.targetYear}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{dream.title}</h4>
                <p className="text-xs text-purple-100/80 leading-relaxed">{dream.description}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-300">
                <span>Dreamt by {dream.addedById === 'partner1' ? 'Sahil' : 'Asmi'}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEditDream(dream)}
                    className="hover:text-amber-300 p-1 transition cursor-pointer"
                    title="Edit dream"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      playHeartPop();
                      coupleStore.deleteFutureDream(dream.id);
                    }}
                    className="hover:text-rose-400 p-1 transition cursor-pointer"
                    title="Delete dream"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add / Edit Milestone Step Modal */}
      <AnimatePresence>
        {(isAddingStep || editingStep) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 my-auto text-stone-800"
            >
              <button
                type="button"
                onClick={() => {
                  setIsAddingStep(false);
                  setEditingStep(null);
                }}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 cursor-pointer"
              >
                <X size={20} />
              </button>

              <h3 className="text-2xl font-bold text-stone-800 font-serif-title mb-4">
                {editingStep ? 'Edit Timeline Milestone 💖' : 'Add Timeline Milestone 💖'}
              </h3>

              <form onSubmit={editingStep ? handleSaveEditStep : handleAddStep} noValidate className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. The First Date"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
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
                        className={`p-1.5 rounded-lg border cursor-pointer ${icon === em ? 'border-rose-500 bg-rose-50 shadow-xs' : 'border-stone-200'}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Why That Moment Mattered (Handwritten Note)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write what you felt and why this moment was unforgettable..."
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 font-handwriting text-lg resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
                    rows={3}
                  />
                </div>

                {/* Photo Upload or URL */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
                    <ImageIcon size={13} className="text-rose-500" /> Photo (Saved to Google Drive)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Paste image URL or click Choose File..."
                      className="flex-1 p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    <label className="py-2 px-3.5 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shrink-0 shadow-xs">
                      <Upload size={14} />
                      {isUploading ? 'Uploading...' : 'Choose File'}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                  {photoUrl && (
                    <div className="mt-2.5 w-full h-36 rounded-2xl overflow-hidden border-2 border-rose-200 relative group">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-md">
                        Photo Loaded ✨
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUploading || isSaving || !title.trim() || !date}
                  className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-rose-200 transition cursor-pointer disabled:opacity-60"
                >
                  {isUploading ? 'Uploading Photo to Google Drive... ⏳' : isSaving ? 'Saving Milestone... ✨' : editingStep ? 'Save Milestone Changes ✨' : 'Save Milestone Step ✨'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Future Dream Modal */}
      <AnimatePresence>
        {(isAddingDream || editingDream) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-200 my-auto text-stone-800"
            >
              <button
                type="button"
                onClick={() => {
                  setIsAddingDream(false);
                  setEditingDream(null);
                }}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-purple-50 cursor-pointer"
              >
                <X size={20} />
              </button>

              <h3 className="text-2xl font-bold text-stone-800 font-serif-title mb-4">
                {editingDream ? 'Edit Future Dream 🌟' : 'Add Future Dream 🌟'}
              </h3>

              <form onSubmit={editingDream ? handleSaveEditDream : handleAddDream} noValidate className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Dream Title</label>
                  <input
                    type="text"
                    value={dreamTitle}
                    onChange={(e) => setDreamTitle(e.target.value)}
                    placeholder="e.g. Road Trip across Amalfi Coast"
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Emoji</label>
                    <input
                      type="text"
                      value={dreamEmoji}
                      onChange={(e) => setDreamEmoji(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 text-center text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Target Year</label>
                    <input
                      type="text"
                      value={dreamYear}
                      onChange={(e) => setDreamYear(e.target.value)}
                      placeholder="2026 or Soon"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Description</label>
                  <textarea
                    value={dreamDesc}
                    onChange={(e) => setDreamDesc(e.target.value)}
                    placeholder="Describe how we'll spend that moment together..."
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 font-handwriting text-lg resize-none"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  {editingDream ? 'Save Dream Changes 🌟' : 'Add to Future Dreams 🌟'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
