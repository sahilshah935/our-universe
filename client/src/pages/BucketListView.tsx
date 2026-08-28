import React, { useState, useEffect } from 'react';
import { BucketListItem } from '../types';
import { coupleStore } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { CheckCircle2, Circle, Plus, Trash2, Award, Trophy, Edit3, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SweetConfirmModal } from '../components/SweetConfirmModal';
import confetti from 'canvas-confetti';

const BUCKET_CATEGORIES = [
  'All',
  'Travel ✈️',
  'Foodie 🍝',
  'Activities 🎨',
  'Adventure 🏕️',
  'Cozy Days 🛋️',
  'Future Dreams 🐾'
];

export const BucketListView: React.FC = () => {
  const { currentPartner } = useAuth();
  const { playSparkle, playHeartPop } = useSound();
  const [items, setItems] = useState<BucketListItem[]>(() => coupleStore.getBucketList());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Travel ✈️');

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setItems(coupleStore.getBucketList());
    });
    return unsubscribe;
  }, []);

  const handleToggle = (id: string) => {
    const updated = coupleStore.toggleBucketItem(id);
    if (updated.completed) {
      playSparkle();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      playHeartPop();
    }
  };

  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showLoveWarning('Please enter a dream or goal for our couple bucket list, my love! 🌟', '🥺');
      return;
    }
    if (!currentPartner) return;

    coupleStore.addBucketItem({
      title: newTitle.trim(),
      category: newCategory,
      addedById: currentPartner.id
    });

    showLoveSuccess('Goal added to our dream bucket list! ✨', '🎉');
    setNewTitle('');
    setIsAdding(false);
    playSparkle();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    coupleStore.updateBucketItem(editingItem.id, {
      title: newTitle.trim() || editingItem.title,
      category: newCategory
    });
    playSparkle();
    showLoveSuccess('Bucket list item updated! ✨', '🎉');
    setEditingItem(null);
    setNewTitle('');
  };

  const startEdit = (item: BucketListItem) => {
    setEditingItem(item);
    setNewTitle(item.title);
    setNewCategory(item.category || 'Travel ✈️');
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      playHeartPop();
      coupleStore.deleteBucketItem(deletingId);
      setDeletingId(null);
      showLoveSuccess('Bucket item removed', '🗑️');
    }
  };

  const filteredItems = items.filter(
    (item) => selectedCategory === 'All' || item.category.toLowerCase().includes(selectedCategory.split(' ')[0].toLowerCase())
  );

  const completedCount = items.filter((i) => Boolean(i.completed)).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy size={13} />
            Our Couple Goals
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-800 font-serif-title">
            Our Dream Bucket List ✨
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Everything we want to experience, explore, eat, and accomplish together!
          </p>
        </div>

        <button
          onClick={() => {
            setNewTitle('');
            setIsAdding(!isAdding);
          }}
          className="py-3 px-5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-rose-200 transition flex items-center gap-2 cursor-pointer hover:scale-105"
        >
          <Plus size={16} /> Add Bucket List Item
        </button>
      </div>

      {/* Progress Bar Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Award className="text-amber-200" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-100">
              Couple Progress Meter
            </span>
          </div>
          <h3 className="text-2xl font-bold font-serif-title">
            {completedCount} of {totalCount} Dreams Completed! 🎉
          </h3>
          <p className="text-rose-100 text-xs mt-1">
            Keep creating unforgettable moments together one checkmark at a time.
          </p>
        </div>

        {/* Line Progress */}
        <div className="w-full sm:w-64 bg-white/20 p-2 rounded-2xl backdrop-blur-md relative z-10">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500 rounded-full shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {BUCKET_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 scale-102'
                : 'bg-white/90 text-stone-700 hover:bg-rose-50 border border-rose-100 hover:text-rose-600 shadow-xs'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add / Edit Item Modal */}
      <AnimatePresence>
        {(isAdding || editingItem) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-rose-200 shadow-2xl max-w-md w-full relative"
            >
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingItem(null);
                }}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-bold text-stone-800 font-serif-title mb-4">
                {editingItem ? 'Edit Bucket List Item ✨' : 'Add Bucket List Dream 🌟'}
              </h3>

              <form onSubmit={editingItem ? handleSaveEdit : handleAdd} noValidate className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Goal / Dream</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Go on a hot air balloon ride at sunrise"
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="Travel ✈️">Travel ✈️</option>
                    <option value="Foodie 🍝">Foodie 🍝</option>
                    <option value="Activities 🎨">Activities 🎨</option>
                    <option value="Adventure 🏕️">Adventure 🏕️</option>
                    <option value="Cozy Days 🛋️">Cozy Days 🛋️</option>
                    <option value="Future Dreams 🐾">Future Dreams 🐾</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingItem(null);
                    }}
                    className="py-2 px-3.5 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles size={14} /> {editingItem ? 'Save Changes' : 'Add to List'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grid of Items */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white/50 rounded-3xl border-2 border-dashed border-rose-200">
          <p className="text-stone-400 text-sm italic">
            No goals found in this category. Add our first adventure! ✨
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                item.completed
                  ? 'bg-rose-50/70 border-rose-200 shadow-xs opacity-90'
                  : 'bg-white border-stone-200/80 shadow-md hover:border-rose-300'
              }`}
            >
              <div
                onClick={() => handleToggle(item.id)}
                className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
              >
                <button
                  type="button"
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition ${
                    item.completed ? 'text-rose-500' : 'text-stone-300 hover:text-rose-400'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 size={24} className="fill-rose-100" />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>

                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                    {item.category}
                  </span>
                  <h4
                    className={`text-sm sm:text-base font-bold text-stone-800 line-clamp-2 ${
                      item.completed ? 'line-through text-stone-400' : ''
                    }`}
                  >
                    {item.title}
                  </h4>
                  {item.completed && item.completedDate && (
                    <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                      ✓ Completed on {item.completedDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(item);
                  }}
                  className="text-stone-300 hover:text-amber-500 p-1.5 transition rounded-lg hover:bg-amber-50 cursor-pointer"
                  title="Edit item"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="text-stone-300 hover:text-rose-500 p-1.5 transition rounded-lg hover:bg-rose-50 cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sweet Confirm Modal */}
      <SweetConfirmModal
        isOpen={deletingId !== null}
        message="Are you sure you want to remove this dream item from our bucket list, my love?"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
