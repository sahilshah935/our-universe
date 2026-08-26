import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Note } from '../types';
import { coupleStore } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-900' },
  { id: 'pink', bg: 'bg-rose-100', border: 'border-rose-200', text: 'text-rose-900' },
  { id: 'purple', bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-900' },
  { id: 'green', bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-900' },
  { id: 'blue', bg: 'bg-sky-100', border: 'border-sky-200', text: 'text-sky-900' }
];

export const PostItBoard: React.FC = () => {
  const { currentPartner } = useAuth();
  const { playHeartPop, playSparkle } = useSound();
  const [postIts, setPostIts] = useState<Note[]>(() => coupleStore.getNotes(true));
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setPostIts(coupleStore.getNotes(true));
    });
    return unsubscribe;
  }, []);

  const handleAddPostIt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !currentPartner) return;

    coupleStore.addNote({
      content: newContent.trim(),
      tag: 'Sticky Note',
      isPostIt: 1,
      isLocked: 0,
      color: selectedColor,
      authorId: currentPartner.id,
      posX: Math.floor(Math.random() * 20) - 10,
      posY: Math.floor(Math.random() * 20) - 10
    });

    playSparkle();
    setNewContent('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    playHeartPop();
    coupleStore.deleteNote(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-stone-800 font-serif-title flex items-center gap-2">
            <span>📌</span> The Couple Fridge Board
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm">
            Leave spontaneous little love post-its, cute reminders, or doodles for each other!
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="py-2.5 px-4 rounded-xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs shadow-md shadow-rose-200 transition flex items-center gap-1.5"
        >
          <Plus size={15} /> Stick A New Love Note
        </button>
      </div>

      {/* Add New Note Card */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-white border-2 border-rose-200 shadow-xl max-w-md"
        >
          <form onSubmit={handleAddPostIt} className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-stone-700">Pick Note Color:</span>
              <div className="flex gap-2">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-6 h-6 rounded-full ${c.bg} border-2 ${
                      selectedColor === c.id ? 'ring-2 ring-rose-500 scale-110' : 'opacity-70'
                    } transition`}
                  />
                ))}
              </div>
            </div>

            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write a sweet reminder (e.g., 'Have an amazing day my girl! ❤️')..."
              className="w-full p-3 text-sm rounded-xl border border-stone-200 resize-none font-handwriting text-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-amber-50/40"
              rows={3}
              required
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="py-1.5 px-3 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Pin To Fridge 📌
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Corkboard / Fridge Grid */}
      <div className="min-h-[260px] p-6 rounded-3xl bg-amber-100/40 border-2 border-dashed border-amber-200/80 shadow-inner grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {postIts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400 text-sm italic">
            No notes on the fridge yet. Be the first to pin something sweet! ✨
          </div>
        ) : (
          postIts.map((postIt, idx) => {
            const colorObj = NOTE_COLORS.find((c) => c.id === postIt.color) || NOTE_COLORS[0];
            const rotation = (idx % 2 === 0 ? 1 : -1) * ((idx % 4) + 1);

            return (
              <motion.div
                key={postIt.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                style={{ rotate: `${rotation}deg` }}
                className={`relative p-5 rounded-md shadow-md border ${colorObj.bg} ${colorObj.border} ${colorObj.text} flex flex-col justify-between min-h-[150px] cursor-grab active:cursor-grabbing transition-shadow hover:shadow-xl`}
              >
                {/* Red Pin graphic */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 shadow-md border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-200" />
                </div>

                <p className="font-handwriting text-xl leading-relaxed mt-2 line-clamp-5">
                  "{postIt.content}"
                </p>

                <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] opacity-75 font-mono">
                  <span>{new Date(postIt.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDelete(postIt.id)}
                    className="p-1 hover:text-rose-600 transition"
                    title="Remove post-it"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
