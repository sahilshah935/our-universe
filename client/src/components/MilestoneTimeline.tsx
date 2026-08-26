import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Milestone } from '../types';
import { api } from '../services/api';
import { Sparkles, Plus, Calendar, Heart, CheckCircle2 } from 'lucide-react';
import { useSound } from '../context/SoundContext';

export const MilestoneTimeline: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💖');
  const { playSparkle } = useSound();

  const fetchMilestones = async () => {
    try {
      const data = await api.getMilestones();
      setMilestones(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    playSparkle();
    const created = await api.createMilestone({
      title,
      date,
      description,
      icon
    });

    setMilestones((prev) => [...prev, created]);
    setTitle('');
    setDate('');
    setDescription('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={13} />
            Our Love Story Roadmap
          </span>
          <h3 className="text-2xl font-extrabold text-stone-800 font-serif-title">
            Our Chapters & Milestones 🗺️
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm">
            From the first day we spoke to all the unforgettable memories we are building.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="py-2.5 px-4 rounded-xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-rose-200 transition flex items-center gap-1.5"
        >
          <Plus size={15} /> Add Milestone
        </button>
      </div>

      {/* Add Milestone Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-white border-2 border-rose-200 shadow-xl max-w-lg"
        >
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. First Road Trip"
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

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Emoji Icon</label>
              <div className="flex gap-2 text-xl">
                {['💖', '✈️', '☕', '🏡', '💍', '🚗', '🎂', '🌟'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={`p-1.5 rounded-lg border ${icon === em ? 'border-rose-500 bg-rose-50' : 'border-stone-200'}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Story / Note</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What made this moment special..."
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 resize-none"
                rows={2}
              />
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
                Save Milestone
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Timeline Steps */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-dashed border-rose-300 space-y-8 my-6">
        {milestones.map((milestone, idx) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative group"
          >
            {/* Timeline Marker Icon */}
            <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-linear-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center text-lg sm:text-xl shadow-md ring-4 ring-rose-100">
              {milestone.icon}
            </div>

            {/* Milestone Content Card */}
            <div className="p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-rose-100 shadow-sm hover:shadow-lg transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h4 className="text-base sm:text-lg font-bold text-stone-800 font-serif-title">
                  {milestone.title}
                </h4>
                <span className="text-xs font-bold text-rose-600 font-mono flex items-center gap-1 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  <Calendar size={12} />
                  {new Date(milestone.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {milestone.description && (
                <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
                  {milestone.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
