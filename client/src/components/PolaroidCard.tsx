import React, { useState } from 'react';
import { Memory } from '../types';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar, Sparkles, Pin, Trash2, Maximize2 } from 'lucide-react';
import { api } from '../services/api';
import { useSound } from '../context/SoundContext';

interface PolaroidCardProps {
  memory: Memory;
  onLiked?: (memory: Memory) => void;
  onDeleted?: (id: string) => void;
  onZoom?: (memory: Memory) => void;
  rotation?: number;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  memory,
  onLiked,
  onDeleted,
  onZoom,
  rotation = 0
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [likes, setLikes] = useState(memory.likes);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const { playHeartPop } = useSound();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playHeartPop();
    setLikes((prev) => prev + 1);
    setIsLikedByUser(true);
    const updated = await api.likeMemory(memory.id);
    if (onLiked) onLiked(updated);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove memory "${memory.title}" from scrapbook?`)) {
      await api.deleteMemory(memory.id);
      if (onDeleted) onDeleted(memory.id);
    }
  };

  return (
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
      >
        {/* Memory Pinned Badge */}
        {Boolean(memory.pinned) && (
          <div className="absolute top-2 right-2 z-20 bg-rose-500 text-white p-1 rounded-full shadow-md">
            <Pin size={12} className="rotate-45" />
          </div>
        )}

        {!isFlipped ? (
          // Front of Polaroid
          <div>
            <div className="relative aspect-4/3 overflow-hidden rounded-sm bg-stone-100 mb-3 group">
              <img
                src={memory.imageUrl}
                alt={memory.title}
                className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                <span className="text-[11px] text-white/90 font-medium">Click to flip 🔄</span>
                {onZoom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onZoom(memory);
                    }}
                    className="p-1.5 bg-white/80 hover:bg-white text-stone-800 rounded-full shadow-md"
                  >
                    <Maximize2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Handwritten Title & Metadata */}
            <div className="text-center px-1">
              <h4 className="text-lg font-bold text-stone-800 font-handwriting leading-snug line-clamp-1">
                {memory.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar size={11} className="text-rose-400" />
                  {memory.date}
                </span>
                {memory.location && (
                  <span className="flex items-center gap-1 max-w-[110px] truncate">
                    <MapPin size={11} className="text-pink-400 shrink-0" />
                    {memory.location}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-2.5 pt-2 border-t border-dashed border-stone-200 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold">
                {memory.mood || 'Happy ✨'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition active:scale-125 ${
                    isLikedByUser || likes > 0
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-stone-400 hover:text-rose-500'
                  }`}
                >
                  <Heart
                    size={13}
                    className={isLikedByUser || likes > 0 ? 'fill-rose-500 text-rose-500' : ''}
                  />
                  <span>{likes}</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="text-stone-300 hover:text-rose-500 p-1 transition"
                  title="Delete memory"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Back of Polaroid (Notes & Story)
          <div className="aspect-4/3 flex flex-col justify-between p-3 bg-rose-50/50 rounded-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-600 font-handwriting text-base">
                  Our Secret Story 📖
                </span>
                <span className="text-[10px] text-stone-400">Click to flip front</span>
              </div>
              <p className="text-xs text-stone-700 font-handwriting text-base leading-relaxed line-clamp-6">
                {memory.description || 'A timeless moment with you that I will cherish forever.'}
              </p>
            </div>
            <div className="pt-2 border-t border-rose-200/50 flex items-center justify-between text-[11px] text-stone-500">
              <span>Chapter: {memory.chapter}</span>
              <span className="text-rose-500 font-semibold">{memory.likes} hearts ❤️</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
