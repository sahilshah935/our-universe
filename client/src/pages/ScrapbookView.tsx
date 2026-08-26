import React, { useState, useEffect } from 'react';
import { Memory } from '../types';
import { coupleStore } from '../services/store';
import { uploadMedia } from '../services/firebase';
import { PolaroidCard } from '../components/PolaroidCard';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
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
      const url = await uploadMedia(file);
      setImageUrl(url);
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl || !currentPartner) return;

    coupleStore.addMemory({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      location: location.trim() || undefined,
      chapter,
      mood: mood.trim() || 'Happy ✨',
      imageUrl,
      authorId: currentPartner.id,
      pinned: 0
    });

    playSparkle();
    confetti({ particleCount: 50, spread: 60 });
    setIsAddingMemory(false);

    // Reset form
    setTitle('');
    setDescription('');
    setLocation('');
    setImageUrl('');
  };

  const filteredMemories = memories.filter(
    (m) => activeChapter === 'All' || m.chapter === activeChapter
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Camera size={13} />
            Shared Scrapbook
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-800 font-serif-title">
            Our Memory Lane 📸
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Flip polaroids to read our secret handwritten stories, and organize moments by chapters.
          </p>
        </div>

        <button
          onClick={() => setIsAddingMemory(true)}
          className="py-3 px-5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-rose-200 transition flex items-center gap-2"
        >
          <Plus size={16} /> Add Polaroid Memory
        </button>
      </div>

      {/* Chapter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CHAPTERS.map((ch) => (
          <button
            key={ch}
            onClick={() => setActiveChapter(ch)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeChapter === ch
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-white/80 hover:bg-rose-50 text-stone-600 border border-stone-200/60'
            }`}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Polaroid Wall Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white/50 rounded-3xl border-2 border-dashed border-rose-200">
            <p className="text-stone-400 text-sm italic">
              No polaroids in this chapter yet. Click "Add Polaroid Memory" to preserve a new photo! ✨
            </p>
          </div>
        ) : (
          filteredMemories.map((memory, idx) => (
            <PolaroidCard
              key={memory.id}
              memory={memory}
              rotation={(idx % 2 === 0 ? 1 : -1) * ((idx % 3) + 1.5)}
              onDeleted={(id) => coupleStore.deleteMemory(id)}
              onLiked={(m) => coupleStore.likeMemory(m.id)}
              onZoom={(m) => setZoomedMemory(m)}
            />
          ))
        )}
      </div>

      {/* Add Memory Modal */}
      <AnimatePresence>
        {isAddingMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setIsAddingMemory(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 transition"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 mx-auto mb-2 flex items-center justify-center text-xl shadow-inner">
                  <Camera size={22} />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 font-serif-title">
                  Stick A Polaroid Photo 📸
                </h3>
                <p className="text-stone-500 text-xs mt-1">
                  Upload a photo from your phone/laptop and write your secret caption.
                </p>
              </div>

              <form onSubmit={handleCreateMemory} className="space-y-4">
                {/* Photo Upload or URL */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Photo Upload or Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Upload photo or paste URL..."
                      className="flex-1 p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      required
                    />
                    <label className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1 shrink-0">
                      <Upload size={14} />
                      {isUploading ? 'Uploading...' : 'Choose File'}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="mt-2 w-full h-36 rounded-xl overflow-hidden border border-stone-200">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
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
                      placeholder="e.g. Rainy Cafe Croissants"
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Chapter</label>
                    <select
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                    >
                      <option value="Chapter 1: The Beginning">Chapter 1: The Beginning</option>
                      <option value="Cozy Dates">Cozy Dates</option>
                      <option value="Adventures & Trips">Adventures & Trips</option>
                      <option value="Silly Moments">Silly Moments</option>
                      <option value="Celebrations">Celebrations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Location / Cafe</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Sunset Pier"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Mood Tag</label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g. Magical ✨, Romantic 🍷, Silly 😂"
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Secret Story on the Back
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write what happened, how you felt, or little inside jokes from this moment..."
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 resize-none font-handwriting text-base"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !title || !imageUrl}
                  className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-md shadow-rose-200 transition"
                >
                  Pin to Scrapbook 📌
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
              className="relative max-w-3xl w-full bg-white rounded-3xl p-6 shadow-2xl overflow-hidden text-stone-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomedMemory(null)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100"
              >
                <X size={20} />
              </button>

              <div className="max-h-[60vh] overflow-hidden rounded-2xl mb-4 bg-stone-100">
                <img
                  src={zoomedMemory.imageUrl}
                  alt={zoomedMemory.title}
                  className="w-full h-full object-contain max-h-[60vh] mx-auto"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-3">
                <div>
                  <h3 className="text-2xl font-bold font-serif-title">{zoomedMemory.title}</h3>
                  <span className="text-xs text-rose-500 font-semibold">{zoomedMemory.chapter}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span>📅 {zoomedMemory.date}</span>
                  {zoomedMemory.location && <span>📍 {zoomedMemory.location}</span>}
                </div>
              </div>

              {zoomedMemory.description && (
                <p className="text-sm font-handwriting text-xl text-stone-700 leading-relaxed">
                  "{zoomedMemory.description}"
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
