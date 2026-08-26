import React, { useState, useEffect } from 'react';
import { BucketListItem } from '../types';
import { coupleStore } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { CheckCircle2, Circle, Plus, Trash2, Award, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
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

    showLoveSuccess('Goal added to our dream bucket list! Can’t wait to check it off with you ✨', '🎉');
    setNewTitle('');
    setIsAdding(false);
    playSparkle();
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove item from bucket list?')) {
      playHeartPop();
      coupleStore.deleteBucketItem(id);
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
          onClick={() => setIsAdding(!isAdding)}
          className="py-3 px-5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-rose-200 transition flex items-center gap-2"
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

      {/* Add Item Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-white border-2 border-rose-200 shadow-xl max-w-lg"
        >
          <form onSubmit={handleAdd} noValidate className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Goal / Dream</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Go on a hot air balloon ride at sunrise"
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
              >
                <option value="Travel ✈️">Travel ✈️</option>
                <option value="Foodie 🍝">Foodie 🍝</option>
                <option value="Activities 🎨">Activities 🎨</option>
                <option value="Adventure 🏕️">Adventure 🏕️</option>
                <option value="Cozy Days 🛋️">Cozy Days 🛋️</option>
                <option value="Future Dreams 🐾">Future Dreams 🐾</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="py-1.5 px-3 text-xs text-stone-500 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600"
              >
                Add To Bucket List ✨
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        {BUCKET_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white/80 hover:bg-rose-50 text-stone-600 border border-stone-200/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bucket List Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-12 px-6 rounded-3xl bg-white/60 border-2 border-dashed border-rose-200 text-center flex flex-col items-center gap-2">
          <span className="text-3xl">✨</span>
          <h4 className="font-bold text-stone-800 text-base">Your Couple Bucket List is Ready!</h4>
          <p className="text-stone-500 text-xs max-w-sm">
            Add trips, crazy adventures, recipes, or cozy moments you want to check off together.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-2 py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Add First Couple Dream 🌟
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleToggle(item.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                item.completed
                  ? 'bg-rose-50/70 border-rose-200 shadow-xs opacity-90'
                  : 'bg-white border-stone-200/80 shadow-md hover:border-rose-300'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                className="text-stone-300 hover:text-rose-500 p-1.5 transition shrink-0"
                title="Delete item"
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
