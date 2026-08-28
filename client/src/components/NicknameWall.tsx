import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Sparkles, Trash2, Tag, Quote, Smile, Edit3, X } from 'lucide-react';
import { NicknameItem } from '../types';
import { coupleStore } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import confetti from 'canvas-confetti';

export const NicknameWall: React.FC = () => {
  const { currentPartner } = useAuth();
  const { playSparkle, playHeartPop } = useSound();
  const [nicknames, setNicknames] = useState<NicknameItem[]>(() => coupleStore.getNicknames());
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<NicknameItem | null>(null);

  // Form State
  const [forPartner, setForPartner] = useState<'partner1' | 'partner2' | 'both'>('partner2');
  const [name, setName] = useState('');
  const [tag, setTag] = useState('Cute & Sweet');
  const [explanation, setExplanation] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-pink-500 to-rose-600');

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setNicknames(coupleStore.getNicknames());
    });
    return unsubscribe;
  }, []);

  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showLoveWarning('Please enter the cute nickname first, my love! 🏷️', '🥺');
      return;
    }
    if (!explanation.trim()) {
      showLoveWarning('Please write a cute little story/explanation for this nickname! 💖', '✨');
      return;
    }
    if (!currentPartner) return;

    coupleStore.addNickname({
      forPartnerId: forPartner,
      name: name.trim(),
      tag: tag.trim() || 'Special Name',
      explanation: explanation.trim(),
      bgGradient: selectedGradient,
      addedById: currentPartner.id
    });

    playSparkle();
    confetti({ particleCount: 50, spread: 60 });
    showLoveSuccess('Nickname added to our wall with love! 💖🎉', '✨');
    setName('');
    setExplanation('');
    setIsAdding(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    coupleStore.updateNickname(editingItem.id, {
      forPartnerId: forPartner,
      name: name.trim() || editingItem.name,
      tag: tag.trim() || editingItem.tag,
      explanation: explanation.trim() || editingItem.explanation,
      bgGradient: selectedGradient
    });
    playSparkle();
    showLoveSuccess('Nickname updated! 💖✨', '🎉');
    setEditingItem(null);
  };

  const startEdit = (item: NicknameItem) => {
    setEditingItem(item);
    setName(item.name);
    setForPartner(item.forPartnerId as any);
    setTag(item.tag);
    setExplanation(item.explanation);
    setSelectedGradient(item.bgGradient || 'from-pink-500 to-rose-600');
  };

  const handleDelete = (id: string) => {
    playHeartPop();
    coupleStore.deleteNickname(id);
    showLoveSuccess('Nickname removed from wall', '🗑️');
  };

  const GRADIENTS = [
    { label: 'Rose Pink', val: 'from-pink-500 to-rose-600' },
    { label: 'Purple Lavender', val: 'from-purple-500 to-indigo-600' },
    { label: 'Amber Warmth', val: 'from-amber-500 to-rose-500' },
    { label: 'Matcha Emerald', val: 'from-emerald-500 to-teal-600' },
    { label: 'Sunset Glow', val: 'from-orange-500 to-pink-500' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={13} />
            What We Call Each Other
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-800 font-serif-title">
            The Nickname Wall 🏷️
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Big styled titles with the funny, sweet, and intimate stories behind our nicknames.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setExplanation('');
            setTag('Cute & Sweet');
            setIsAdding(true);
          }}
          className="py-3 px-5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-rose-200 transition flex items-center gap-2 cursor-pointer hover:scale-105"
        >
          <Plus size={16} /> Add New Nickname
        </button>
      </div>

      {/* Nicknames Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nicknames.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="relative rounded-3xl overflow-hidden shadow-xl border border-white/60 bg-white flex flex-col justify-between group"
          >
            {/* Top Stylized Big Title Banner */}
            <div className={`p-6 sm:p-8 bg-linear-to-br ${item.bgGradient} text-white relative overflow-hidden`}>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
                  {item.tag}
                </span>
                <span className="text-xs font-medium text-white/80 bg-black/15 px-2.5 py-0.5 rounded-full">
                  For {item.forPartnerId === 'partner1' ? 'Sahil' : item.forPartnerId === 'partner2' ? 'Asmi' : 'Both of Us'}
                </span>
              </div>

              <h3 className="text-3xl sm:text-5xl font-extrabold font-serif-title tracking-tight leading-none my-2 drop-shadow-sm">
                "{item.name}"
              </h3>
            </div>

            {/* Explanation Body */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="relative">
                <Quote className="text-rose-200 w-8 h-8 mb-1 -ml-1 opacity-60" />
                <p className="text-stone-700 text-sm sm:text-base font-handwriting text-xl leading-relaxed">
                  {item.explanation}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1 font-medium text-rose-500">
                  <Heart size={13} className="fill-rose-500" />
                  Added by {item.addedById === 'partner1' ? 'Sahil' : 'Asmi'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-1.5 text-stone-400 hover:text-amber-500 rounded-lg transition hover:bg-amber-50 cursor-pointer"
                    title="Edit nickname"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg transition hover:bg-rose-50 cursor-pointer"
                    title="Delete nickname"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add / Edit Nickname Modal */}
      <AnimatePresence>
        {(isAdding || editingItem) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200"
            >
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingItem(null);
                }}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 mx-auto mb-2 flex items-center justify-center text-xl shadow-inner">
                  {editingItem ? <Edit3 size={22} /> : <Smile size={22} />}
                </div>
                <h3 className="text-2xl font-bold text-stone-800 font-serif-title">
                  {editingItem ? 'Edit Nickname 🏷️' : 'Add Cute Nickname 💖'}
                </h3>
                <p className="text-stone-500 text-xs mt-1">
                  {editingItem ? 'Update the title or cute story behind this nickname.' : 'Add a new pet name or silly title to our wall!'}
                </p>
              </div>

              <form onSubmit={editingItem ? handleSaveEdit : handleAdd} noValidate className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nickname</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Cutie Pie / Supari"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Who is this for?</label>
                    <select
                      value={forPartner}
                      onChange={(e) => setForPartner(e.target.value as any)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="partner2">For Asmi</option>
                      <option value="partner1">For Sahil</option>
                      <option value="both">For Both of Us</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Tag / Vibe</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. Favorite Classic, Drama Queen, Soft Boy"
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Color Theme</label>
                  <div className="flex gap-2">
                    {GRADIENTS.map((g) => (
                      <button
                        key={g.val}
                        type="button"
                        onClick={() => setSelectedGradient(g.val)}
                        className={`w-8 h-8 rounded-full bg-linear-to-r ${g.val} border-2 cursor-pointer ${
                          selectedGradient === g.val ? 'ring-2 ring-rose-500 scale-110 shadow-xs' : 'opacity-70'
                        } transition`}
                        title={g.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Cute / Funny Explanation
                  </label>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Why this nickname? What's the story behind it?"
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 font-handwriting text-lg resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
                    rows={3}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-200 transition cursor-pointer"
                >
                  {editingItem ? 'Save Nickname Changes ✨' : 'Pin To Nickname Wall ✨'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
