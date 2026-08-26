import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Clock, Calendar, Send, Sparkles, X, Heart } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';
import { Note } from '../types';

export const TimeCapsuleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: (note: Note) => void;
}> = ({ isOpen, onClose, onCreated }) => {
  const { currentPartner } = useAuth();
  const { playSparkle } = useSound();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Surprise / Time Capsule');
  const [unlockDate, setUnlockDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !unlockDate || !currentPartner) return;

    setIsSubmitting(true);
    try {
      const newNote = await api.createNote({
        title: title.trim() || 'Secret Time Capsule',
        content: content.trim(),
        tag,
        authorId: currentPartner.id,
        isLocked: 1,
        unlockAt: new Date(unlockDate).toISOString(),
        isPostIt: 0,
        color: 'rose'
      });

      onCreated(newNote);
      playSparkle();
      confetti({ particleCount: 50, spread: 60 });
      onClose();
    } catch (err) {
      console.error('Failed to seal time capsule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 transition"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto mb-2 flex items-center justify-center text-xl shadow-inner">
            <Lock size={20} />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 font-serif-title">
            Seal A Secret Time Capsule ⏳
          </h3>
          <p className="text-stone-500 text-xs mt-1">
            Write a letter locked with a digital wax seal until your chosen future date or anniversary.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Capsule Title / Occasion
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Open on Our 2nd Anniversary! 🥂"
              className="w-full p-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Unlock Date & Time
            </label>
            <input
              type="datetime-local"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Secret Letter Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your heartfelt message, secret plans, promises, or memories..."
              className="w-full p-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white font-handwriting text-lg resize-none"
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || !unlockDate}
            className="w-full py-3 px-4 bg-linear-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg shadow-amber-200 transition flex items-center justify-center gap-2"
          >
            <Lock size={16} /> Seal Capsule with Wax Stamp ✨
          </button>
        </form>
      </motion.div>
    </div>
  );
};
