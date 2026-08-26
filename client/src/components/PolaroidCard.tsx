import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Trash2, Maximize2, RotateCw } from 'lucide-react';
import { Memory } from '../types';
import { coupleStore } from '../services/store';
import { useLoveToast } from '../context/LoveToastContext';
import { SweetConfirmModal } from './SweetConfirmModal';

interface PolaroidCardProps {
  memory: Memory;
  rotation?: number;
  onDeleted?: (id: string) => void;
  onZoom?: (memory: Memory) => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  memory,
  rotation = 0,
  onDeleted,
  onZoom
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showLoveSuccess } = useLoveToast();

  const confirmDelete = () => {
    coupleStore.deleteMemory(memory.id);
    if (onDeleted) onDeleted(memory.id);
    setShowConfirm(false);
    showLoveSuccess('Memory removed from scrapbook 🗑️', '✨');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: rotation }}
        animate={{ opacity: 1, scale: 1, rotate: rotation }}
        whileHover={{ y: -8, rotate: 0, scale: 1.03, transition: { duration: 0.2 } }}
        className="relative cursor-pointer select-none perspective-1000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Washi Tape Header */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape rotate-[-2deg] z-20 opacity-90 rounded-xs shadow-xs pointer-events-none" />

        {/* Polaroid Container */}
        <div
          className={`polaroid-frame rounded-2xl bg-white border border-rose-100/80 transition-transform duration-500 transform-gpu relative shadow-lg hover:shadow-xl ${
            memory.pinned ? 'ring-2 ring-rose-400 shadow-rose-200' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* FRONT: Photo & Caption */}
          <div className="backface-hidden p-3.5 pb-4">
            {/* Photo View */}
            <div className="relative aspect-4/3 w-full bg-stone-100 rounded-xl overflow-hidden mb-3.5 group shadow-inner">
              <img
                src={memory.imageUrl}
                alt={memory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Action Overlays */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                {onZoom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onZoom(memory);
                    }}
                    className="p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition shadow-xs cursor-pointer"
                    title="Zoom in"
                  >
                    <Maximize2 size={13} />
                  </button>
                )}
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition shadow-xs cursor-pointer"
                  title="Remove polaroid"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Mood Badge */}
              {memory.mood && (
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-rose-600 shadow-xs">
                  {memory.mood}
                </span>
              )}
            </div>

            {/* Handwritten Title & Footer */}
            <div className="space-y-1">
              <h4 className="font-handwriting text-2xl text-stone-800 tracking-wide line-clamp-1 leading-tight font-bold">
                {memory.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-stone-500 font-sans">
                <span className="flex items-center gap-1">
                  <Calendar size={11} className="text-rose-400" /> {memory.date}
                </span>
                {memory.location && (
                  <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                    <MapPin size={11} className="text-rose-400" /> {memory.location}
                  </span>
                )}
              </div>
            </div>

            {/* Flip Indicator */}
            <div className="mt-2.5 pt-2 border-t border-rose-100/60 flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <RotateCw size={11} className="text-rose-400" /> Flip to read secret note
              </span>
              <span className="text-rose-400 font-mono text-[10px]">{memory.chapter}</span>
            </div>
          </div>

          {/* BACK: Handwritten Secret Story */}
          <div
            className="absolute inset-0 backface-hidden p-5 flex flex-col justify-between rounded-2xl bg-[#fdfbf7] text-stone-800 shadow-xl border border-rose-200"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-rose-200/50 pb-2 mb-3">
                <span className="text-xs font-bold text-rose-500 font-serif-title uppercase tracking-wider">
                  Secret Note 💌
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 font-mono">{memory.chapter}</span>
                  <button
                    onClick={handleDeleteClick}
                    className="p-1 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-full transition cursor-pointer"
                    title="Remove polaroid"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="font-handwriting text-xl text-stone-700 leading-relaxed overflow-y-auto max-h-[160px] pr-1">
                {memory.description || 'A moment we will cherish forever in our universe.'}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200 text-right">
              <span className="text-sm font-handwriting text-rose-600 font-bold">
                — {memory.authorId === 'partner1' ? 'Sahil' : 'Asmi'} ❤️
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <SweetConfirmModal
        isOpen={showConfirm}
        message={`Are you sure you want to remove "${memory.title}" from our scrapbook, my love? 🥺`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
