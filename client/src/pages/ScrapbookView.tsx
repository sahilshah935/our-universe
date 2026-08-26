import React, { useState, useEffect } from 'react';
import { Memory } from '../types';
import { coupleStore } from '../services/store';
import { uploadImage } from '../services/imageUpload';
import { PolaroidCard } from '../components/PolaroidCard';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { Plus, Camera, X, Upload, Heart, Sparkles, Image as ImageIcon, Calendar, MapPin, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const CHAPTERS = [
  { id: 'All', label: '✨ All Moments' },
  { id: 'Chapter 1: The Beginning', label: '🌱 The Beginning' },
  { id: 'Cozy Dates', label: '☕ Cozy Dates' },
  { id: 'Adventures & Trips', label: '✈️ Adventures' },
  { id: 'Silly Moments', label: '😂 Silly Moments' },
  { id: 'Celebrations', label: '🎉 Celebrations' }
];

export const ScrapbookView: React.FC = () => {
  const { currentPartner } = useAuth();
  const { playSparkle } = useSound();
  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const [memories, setMemories] = useState<Memory[]>(() => coupleStore.getMemories());
  const [activeChapter, setActiveChapter] = useState('All');
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [zoomedMemory, setZoomedMemory] = useState<Memory | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [chapter, setChapter] = useState('Cozy Dates');
  const [mood, setMood] = useState('Magical ✨');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setMemories(coupleStore.getMemories());
    });
    return unsubscribe;
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      showLoveSuccess('Photo loaded beautifully! 📸', '✨');
    } catch (err) {
      console.error('File upload failed:', err);
      showLoveWarning('Failed to upload photo, please try again my love! 🥺');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploading) {
      showLoveWarning('Photo is still uploading, please wait a moment darling! ⏳', '📸');
      return;
    }

    if (!imageUrl || !imageUrl.trim()) {
      showLoveWarning('Please pick or upload a cute photo first, darling! 📷', '🥺');
      return;
    }

    if (!title.trim()) {
      showLoveWarning('Please give this beautiful memory a title, my love! 💖', '✨');
      return;
    }

    const authorId = currentPartner?.id || 'partner1';

    coupleStore.addMemory({
      title: title.trim(),
      description: description.trim() || undefined,
      date: date || new Date().toISOString().split('T')[0],
      location: location.trim() || undefined,
      chapter,
      mood: mood.trim() || 'Happy ✨',
      imageUrl: imageUrl.trim(),
      authorId,
      pinned: 0
    });

    setMemories(coupleStore.getMemories());
    playSparkle();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showLoveSuccess('Memory pinned to our scrapbook forever! 📌❤️', '🎉');
    setIsAddingMemory(false);

    // Reset form
    setTitle('');
    setDescription('');
    setLocation('');
    setImageUrl('');
    setMood('Magical ✨');
  };

  const filteredMemories = memories.filter(
    (m) => activeChapter === 'All' || m.chapter === activeChapter
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Aesthetic Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-rose-100/90 via-pink-50/80 to-amber-50/90 border border-rose-200/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Background decorative glows */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 shadow-xs text-rose-600 text-xs font-extrabold uppercase tracking-wider mb-2 border border-rose-200/60">
            <Camera size={13} className="text-rose-500" />
            Our Polaroid Scrapbook 📸
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 font-serif-title tracking-tight">
            Our Memory Lane 💕
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Flip any polaroid to read our secret handwritten love stories, and organize special moments by chapters.
          </p>
        </div>

        {/* Add Memory Button */}
        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsAddingMemory(true)}
          className="relative z-10 py-3 px-5 rounded-2xl bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-200 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Polaroid Memory 📸</span>
        </motion.button>
      </div>

      {/* Chapters Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CHAPTERS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChapter(ch.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeChapter === ch.id
                ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 scale-102'
                : 'bg-white/90 text-stone-700 hover:bg-rose-50 border border-rose-100 hover:text-rose-600 shadow-xs'
            }`}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Polaroid Gallery Grid */}
      {filteredMemories.length === 0 ? (
        <div className="py-16 px-6 text-center bg-linear-to-b from-white/90 via-rose-50/40 to-pink-50/60 rounded-3xl border-2 border-dashed border-rose-200 shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-500 mx-auto mb-3 flex items-center justify-center text-3xl shadow-inner">
            📸
          </div>
          <h3 className="text-xl font-bold text-stone-800 font-serif-title mb-1">
            No polaroids in this chapter yet
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mb-5 max-w-md mx-auto">
            Pin your favorite memories, late-night dates, and silly photos into our couple scrapbook!
          </p>
          <button
            onClick={() => setIsAddingMemory(true)}
            className="py-2.5 px-5 rounded-xl bg-linear-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-200 hover:scale-105 transition cursor-pointer"
          >
            + Pin Our First Polaroid 📌
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pt-2">
          {filteredMemories.map((mem, index) => {
            const rot = (index % 4) * 1.5 - 2;
            return (
              <PolaroidCard
                key={mem.id}
                memory={mem}
                rotation={rot}
                onDeleted={() => {
                  coupleStore.deleteMemory(mem.id);
                  setMemories(coupleStore.getMemories());
                }}
                onLiked={(updated) => {
                  coupleStore.likeMemory(mem.id);
                  setMemories(coupleStore.getMemories());
                }}
                onZoom={(m) => setZoomedMemory(m)}
              />
            );
          })}
        </div>
      )}

      {/* Add Memory Modal */}
      <AnimatePresence>
        {isAddingMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsAddingMemory(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <Heart size={12} className="fill-rose-500 text-rose-500" />
                  New Polaroid Memory
                </div>
                <h3 className="text-2xl font-bold text-stone-900 font-serif-title">
                  Pin To Scrapbook 📌
                </h3>
                <p className="text-stone-500 text-xs mt-1">
                  Upload a cute photo and write a heartfelt secret story for the back.
                </p>
              </div>

              <form onSubmit={handleCreateMemory} noValidate className="space-y-4">
                {/* Photo Upload or URL */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
                    <ImageIcon size={13} className="text-rose-500" /> Photo Upload or Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image link or click Choose File..."
                      className="flex-1 p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-stone-50/50"
                    />
                    <label className="py-2.5 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shrink-0 shadow-xs">
                      <Upload size={14} />
                      {isUploading ? 'Uploading...' : 'Choose File'}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="mt-3 w-full h-40 rounded-2xl overflow-hidden border-2 border-rose-200 shadow-sm relative group">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded-lg backdrop-blur-xs">
                        Photo Loaded ✨
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Memory Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Sunset Croissants 🥐"
                      className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
                      <Calendar size={12} className="text-rose-500" /> Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Chapter</label>
                    <select
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="Chapter 1: The Beginning">Chapter 1: The Beginning</option>
                      <option value="Cozy Dates">Cozy Dates</option>
                      <option value="Adventures & Trips">Adventures & Trips</option>
                      <option value="Silly Moments">Silly Moments</option>
                      <option value="Celebrations">Celebrations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
                      <MapPin size={12} className="text-rose-500" /> Location / Cafe
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Sunset Pier 🌊"
                      className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
                    <Smile size={12} className="text-rose-500" /> Mood Tag
                  </label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g. Magical ✨, Romantic 🍷, Silly 😂"
                    className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Secret Story on the Back (Handwritten Note) 💌
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Pour your heart out about what made this moment so special..."
                    className="w-full p-3 text-sm rounded-2xl border border-stone-200 resize-none font-handwriting text-lg bg-rose-50/30 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {isUploading ? 'Uploading Photo... ⏳' : 'Pin to Scrapbook 📌'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox Zoom */}
      <AnimatePresence>
        {zoomedMemory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setZoomedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white rounded-3xl p-4 overflow-hidden shadow-2xl border border-rose-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomedMemory(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black transition z-10 cursor-pointer"
              >
                <X size={18} />
              </button>
              <img
                src={zoomedMemory.imageUrl}
                alt={zoomedMemory.title}
                className="w-full max-h-[70vh] object-contain rounded-2xl"
              />
              <div className="p-4 text-center">
                <h3 className="text-xl font-bold font-serif-title text-stone-900">{zoomedMemory.title}</h3>
                <p className="text-xs text-stone-500 mt-1">
                  {zoomedMemory.date} &bull; {zoomedMemory.location || 'Special Place'} &bull; {zoomedMemory.mood}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
