import React, { useState, useEffect } from 'react';
import { Memory } from '../types';
import { coupleStore } from '../services/store';
import { uploadImage } from '../services/imageUpload';
import { PolaroidCard } from '../components/PolaroidCard';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { Plus, Camera, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const CHAPTERS = [
  'All',
  'Chapter 1: The Beginning',
  'Cozy Dates',
  'Adventures & Trips',
  'Silly Moments',
  'Celebrations'
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
  const [mood, setMood] = useState('Happy ✨');
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
    setMood('Happy ✨');
  };

  const filteredMemories = memories.filter(
    (m) => activeChapter === 'All' || m.chapter === activeChapter
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Camera size={13} />
            Shared Scrapbook
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-800 dark:text-stone-100 font-serif-title">
            Our Memory Lane 📸
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            Flip polaroids to read our secret handwritten stories, and organize moments by chapters.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsAddingMemory(true)}
          className="py-2.5 px-4 rounded-xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none transition flex items-center gap-1.5 shrink-0"
        >
          <Plus size={15} /> Add New Polaroid
        </button>
      </div>

      {/* Chapters Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CHAPTERS.map((ch) => (
          <button
            key={ch}
            onClick={() => setActiveChapter(ch)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeChapter === ch
                ? 'bg-stone-800 dark:bg-rose-600 text-white shadow-xs'
                : 'bg-white/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700 hover:bg-rose-50 dark:hover:bg-stone-700'
            }`}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Polaroid Grid Gallery */}
      {filteredMemories.length === 0 ? (
        <div className="py-16 text-center bg-white/40 dark:bg-stone-800/40 rounded-3xl border-2 border-dashed border-rose-200 dark:border-stone-700">
          <div className="text-4xl mb-2">📸</div>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">
            No memories in this chapter yet.
          </p>
          <button
            onClick={() => setIsAddingMemory(true)}
            className="mt-3 text-rose-500 font-bold text-xs hover:underline"
          >
            + Add our first polaroid memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pt-4">
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
              className="relative max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 dark:border-stone-700 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsAddingMemory(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-rose-50 dark:hover:bg-stone-800"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
                  New Polaroid Memory
                </div>
                <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 font-serif-title">
                  Pin To Scrapbook 📌
                </h3>
                <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
                  Upload a photo and write a secret story for the back.
                </p>
              </div>

              <form onSubmit={handleCreateMemory} noValidate className="space-y-4">
                {/* Photo Upload or URL */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Photo Upload or Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Upload photo or paste URL..."
                      className="flex-1 p-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    <label className="py-2.5 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1 shrink-0">
                      <Upload size={14} />
                      {isUploading ? 'Uploading...' : 'Choose File'}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="mt-2 w-full h-36 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">Memory Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Rainy Cafe Croissants"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">Chapter</label>
                    <select
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-stone-100"
                    >
                      <option value="Chapter 1: The Beginning">Chapter 1: The Beginning</option>
                      <option value="Cozy Dates">Cozy Dates</option>
                      <option value="Adventures & Trips">Adventures & Trips</option>
                      <option value="Silly Moments">Silly Moments</option>
                      <option value="Celebrations">Celebrations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">Location / Cafe</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Sunset Pier"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">Mood Tag</label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g. Magical ✨, Romantic 🍷, Silly 😂"
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Secret Story on the Back
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write what happened, how you felt, or little inside jokes from this moment..."
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 resize-none font-handwriting text-base"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-md shadow-rose-200 dark:shadow-none transition flex items-center justify-center gap-2 cursor-pointer"
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
              className="relative max-w-2xl w-full bg-white dark:bg-stone-900 rounded-3xl p-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomedMemory(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black transition z-10"
              >
                <X size={18} />
              </button>
              <img
                src={zoomedMemory.imageUrl}
                alt={zoomedMemory.title}
                className="w-full max-h-[70vh] object-contain rounded-2xl"
              />
              <div className="p-4 text-center">
                <h3 className="text-xl font-bold font-serif-title dark:text-white">{zoomedMemory.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
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
