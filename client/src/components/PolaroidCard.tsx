import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar, Trash2, Maximize2 } from 'lucide-react';
import { Memory } from '../types';
import { api } from '../services/api';
import { useSound } from '../context/SoundContext';
import { SweetConfirmModal } from './SweetConfirmModal';

interface PolaroidCardProps {
  memory: Memory;
  rotation?: number;
  onDeleted?: (id: string) => void;
  onLiked?: (memory: Memory) => void;
  onZoom?: (memory: Memory) => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  memory,
  rotation = 0,
  onDeleted,
  onLiked,
  onZoom
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [likes, setLikes] = useState(memory.likes || 0);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { playHeartPop } = useSound();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLikedByUser) return;

    playHeartPop();
    setLikes((prev) => prev + 1);
    setIsLikedByUser(true);
    const updated = await api.likeMemory(memory.id);
    if (onLiked) onLiked(updated);
  };

  const confirmDelete = async () => {
    await api.deleteMemory(memory.id);
    if (onDeleted) onDeleted(memory.id);
    setShowConfirm(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: rotation }}
        animate={{ opacity: 1, scale: 1, rotate: rotation }}
        whileHover={{ y: -8, rotate: 0, scale: 1.03, transition: { duration: 0.2 } }}
        className="relative cursor-pointer select-none perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Washi Tape Header */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape rotate-[-2deg] z-20 opacity-85 rounded-xs" />

        {/* Polaroid Container */}
        <div
          className={`polaroid-frame rounded-md transition-transform duration-500 transform-gpu relative ${
            memory.pinned ? 'ring-2 ring-rose-400 shadow-rose-200' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* FRONT: Photo & Caption */}
          <div className="backface-hidden p-3.5 pb-5">
            {/* Photo View */}
            <div className="relative aspect-4/3 w-full bg-stone-100 rounded-sm overflow-hidden mb-3.5 group shadow-inner">
              <img
                src={memory.imageUrl}
                alt={memory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Action Overlays */}
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {onZoom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onZoom(memory);
                    }}
                    className="p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition"
                    title="Zoom in"
                  >
                    <Maximize2 size={13} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(true);
                  }}
                  className="p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition"
                  title="Remove polaroid"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Mood Badge */}
              {memory.mood && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-rose-600 shadow-xs">
                  {memory.mood}
                </span>
              )}
            </div>

            {/* Handwritten Title & Footer */}
            <div className="space-y-1">
              <h4 className="font-handwriting text-2xl text-stone-800 tracking-wide line-clamp-1 leading-tight">
                {memory.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-sans">
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> {memory.date}
                </span>
                {memory.location && (
                  <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                    <MapPin size={11} /> {memory.location}
                  </span>
                )}
              </div>
            </div>

            {/* Like Counter Button */}
            <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
              <span className="text-[10px] italic">Flip for back story ↺</span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full transition-transform active:scale-125 ${
                  isLikedByUser ? 'text-rose-500 bg-rose-50' : 'hover:text-rose-500 hover:bg-rose-50/50'
                }`}
              >
                <Heart size={14} className={isLikedByUser ? 'fill-rose-500 text-rose-500' : ''} />
                <span>{likes}</span>
              </button>
            </div>
          </div>

          {/* BACK: Handwritten Secret Story */}
          <div
            className="absolute inset-0 backface-hidden p-5 flex flex-col justify-between rounded-md bg-[#fdfbf7] text-stone-800 shadow-xl"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-rose-200/50 pb-2 mb-3">
                <span className="text-xs font-bold text-rose-500 font-serif-title uppercase tracking-wider">
                  Secret Note 💌
                </span>
                <span className="text-[10px] text-stone-400 font-mono">{memory.chapter}</span>
              </div>
              <p className="font-handwriting text-xl text-stone-700 leading-relaxed overflow-y-auto max-h-[170px] pr-1">
                {memory.description || 'A moment we will cherish forever in our universe.'}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200 text-right">
              <span className="text-xs font-handwriting text-rose-600">
                — {memory.authorId === 'partner1' ? 'Sahil' : 'Asmi'} ❤️
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <SweetConfirmModal
        isOpen={showConfirm}
        message={`Are you sure you want to remove the memory "${memory.title}" from our scrapbook, my love?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
