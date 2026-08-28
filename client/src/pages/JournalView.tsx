import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { coupleStore } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { PostItBoard } from '../components/PostItBoard';
import { TimeCapsuleModal } from '../components/TimeCapsuleModal';
import { SweetConfirmModal } from '../components/SweetConfirmModal';
import { Heart, Lock, Unlock, Plus, Trash2, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const JournalView: React.FC = () => {
  const { currentPartner } = useAuth();
  const { playSparkle, playHeartPop } = useSound();
  const [subTab, setSubTab] = useState<'letters' | 'capsules' | 'fridge'>('letters');
  const [notes, setNotes] = useState<Note[]>(() => coupleStore.getNotes(false));
  const [isAddingLetter, setIsAddingLetter] = useState(false);
  const [editingLetter, setEditingLetter] = useState<Note | null>(null);
  const [isAddingCapsule, setIsAddingCapsule] = useState(false);

  // New letter form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Why I Love You');

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setNotes(coupleStore.getNotes(false));
    });
    return unsubscribe;
  }, []);

  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showLoveWarning('Please pour your sweet feelings into the letter first, my love! 💌', '🥺');
      return;
    }
    if (!currentPartner) return;

    coupleStore.addNote({
      title: title.trim() || undefined,
      content: content.trim(),
      tag,
      authorId: currentPartner.id,
      isLocked: 0,
      isPostIt: 0,
      color: 'rose'
    });

    playSparkle();
    showLoveSuccess('Love letter safely saved in our journal! 💌❤️', '✨');
    setIsAddingLetter(false);
    setTitle('');
    setContent('');
  };

  const handleSaveEditLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLetter) return;
    coupleStore.updateNote(editingLetter.id, {
      title: title.trim() || '',
      content: content.trim(),
      tag
    });
    playSparkle();
    showLoveSuccess('Love letter updated! 💌✨', '🎉');
    setEditingLetter(null);
    setTitle('');
    setContent('');
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      playHeartPop();
      coupleStore.deleteNote(deletingId);
      setDeletingId(null);
    }
  };

  const letters = notes.filter((n) => !n.isLocked);
  const capsules = notes.filter((n) => Boolean(n.isLocked));

  return (
    <div className="space-y-8 pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Heart size={13} className="fill-rose-500 text-rose-500" />
            Secret Notes & Letters
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-800 font-serif-title">
            Love Journal & Time Capsules 💌
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Leave long heartfelt letters, time-locked future surprises, and post-its for each other.
          </p>
        </div>

        {/* Sub-tab Switchers */}
        <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/60">
          <button
            onClick={() => setSubTab('letters')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              subTab === 'letters' ? 'bg-white text-rose-600 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            💌 Love Letters
          </button>
          <button
            onClick={() => setSubTab('capsules')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              subTab === 'capsules' ? 'bg-white text-amber-600 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ⏳ Time Capsules
          </button>
          <button
            onClick={() => setSubTab('fridge')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              subTab === 'fridge' ? 'bg-white text-purple-600 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            📌 Fridge Notes
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: LOVE LETTERS */}
      {subTab === 'letters' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-stone-500 text-xs sm:text-sm">
              All love letters and notes written for each other.
            </p>

            <button
              onClick={() => setIsAddingLetter(true)}
              className="py-2.5 px-4 rounded-xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition flex items-center gap-1.5 shrink-0"
            >
              <Plus size={15} /> Write Love Letter
            </button>
          </div>

          {/* Add / Edit Letter Modal */}
          <AnimatePresence>
            {(isAddingLetter || editingLetter) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200"
                >
                  <button
                    onClick={() => {
                      setIsAddingLetter(false);
                      setEditingLetter(null);
                    }}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 cursor-pointer"
                  >
                    <X size={18} />
                  </button>

                  <h3 className="text-xl font-bold text-stone-800 font-serif-title mb-4">
                    {editingLetter ? 'Edit Love Journal Entry ✍️' : 'Write A Love Journal Entry ✍️'}
                  </h3>

                  <form onSubmit={editingLetter ? handleSaveEditLetter : handleCreateLetter} noValidate className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Why You Make Me Smile"
                          className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Category Tag</label>
                        <select
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                        >
                          <option value="Why I Love You">Why I Love You</option>
                          <option value="Random Midnight Thoughts">Random Midnight Thoughts</option>
                          <option value="Gratitude">Gratitude</option>
                          <option value="Sorry / Hug Me">Sorry / Hug Me</option>
                          <option value="Promises">Promises</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Letter Content</label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Pour your heart out..."
                        className="w-full p-3 text-sm rounded-xl border border-stone-200 resize-none font-handwriting text-lg bg-rose-50/20"
                        rows={6}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!content.trim()}
                      className="w-full py-2.5 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      {editingLetter ? 'Save Letter Changes ✨' : 'Save to Love Journal 💌'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Letter Cards Grid */}
          {letters.length === 0 ? (
            <div className="py-12 text-center bg-white/50 rounded-3xl border-2 border-dashed border-rose-200">
              <p className="text-stone-400 text-sm italic">
                No letters written yet. Surprise your partner with a sweet letter! 💌
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {letters.map((letter) => (
                <motion.div
                  key={letter.id}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-rose-100 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                        {letter.tag}
                      </span>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {new Date(letter.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {letter.title && (
                      <h4 className="text-lg font-bold text-stone-800 font-serif-title mb-2">
                        {letter.title}
                      </h4>
                    )}

                    <p className="text-sm font-handwriting text-xl text-stone-700 leading-relaxed whitespace-pre-line">
                      "{letter.content}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                    <span>Written by {letter.authorId === 'partner1' ? 'Sahil' : 'Asmi'} ❤️</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingLetter(letter);
                          setTitle(letter.title || '');
                          setContent(letter.content);
                          setTag(letter.tag || 'Why I Love You');
                        }}
                        className="hover:text-amber-500 p-1 text-stone-400 hover:bg-amber-50 rounded-md transition cursor-pointer"
                        title="Edit letter"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(letter.id)}
                        className="hover:text-rose-500 p-1 text-stone-400 hover:bg-rose-50 rounded-md transition cursor-pointer"
                        title="Delete letter"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: TIME CAPSULES */}
      {subTab === 'capsules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-stone-500 text-xs sm:text-sm">
              Letters sealed with digital wax stamps. They can only be read once their unlock date arrives!
            </p>
            <button
              onClick={() => setIsAddingCapsule(true)}
              className="py-2.5 px-4 rounded-xl bg-linear-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-amber-200 transition flex items-center gap-1.5"
            >
              <Lock size={15} /> Seal New Time Capsule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capsules.map((capsule) => {
              const unlockTime = capsule.unlockAt ? new Date(capsule.unlockAt).getTime() : 0;
              const now = Date.now();
              const isLocked = unlockTime > now;

              return (
                <motion.div
                  key={capsule.id}
                  whileHover={{ y: -4 }}
                  className={`p-6 rounded-3xl border shadow-md transition-all ${
                    isLocked
                      ? 'bg-linear-to-br from-amber-50/90 via-stone-50/80 to-rose-50/80 border-amber-200'
                      : 'bg-white border-rose-200 shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isLocked ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
                      {isLocked ? 'Sealed Time Capsule' : 'Unlocked & Revealed 🎉'}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      Opens: {capsule.unlockAt ? new Date(capsule.unlockAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-stone-800 font-serif-title mb-2">
                    {capsule.title || 'Secret Future Letter'}
                  </h4>

                  {isLocked ? (
                    <div className="py-8 text-center bg-amber-100/40 rounded-2xl border border-dashed border-amber-300">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-700 mx-auto mb-2 flex items-center justify-center text-xl">
                        🔒
                      </div>
                      <p className="text-xs font-bold text-amber-900">
                        This letter is sealed until {capsule.unlockAt ? new Date(capsule.unlockAt).toLocaleString() : ''}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-1">No peeking early! 🤫</p>
                    </div>
                  ) : (
                    <p className="text-sm font-handwriting text-xl text-stone-800 leading-relaxed whitespace-pre-line bg-rose-50/30 p-4 rounded-2xl border border-rose-100">
                      "{capsule.content}"
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                    <span>Written with love by {capsule.authorId === 'partner1' ? 'Sahil' : 'Asmi'}</span>
                    <button
                      onClick={() => handleDelete(capsule.id)}
                      className="hover:text-rose-500 p-1 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <TimeCapsuleModal
            isOpen={isAddingCapsule}
            onClose={() => setIsAddingCapsule(false)}
            onCreated={(note) => coupleStore.addNote(note)}
          />
        </div>
      )}

      {/* SUB-TAB 3: POST-IT BOARD */}
      {subTab === 'fridge' && <PostItBoard />}

      <SweetConfirmModal
        isOpen={deletingId !== null}
        message="Are you sure you want to remove this love letter from our journal, my love?"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
