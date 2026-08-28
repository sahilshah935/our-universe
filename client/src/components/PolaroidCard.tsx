import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Trash2, Maximize2, RotateCw, Edit3, X, Sparkles, Image as ImageIcon, Upload } from 'lucide-react';
import { Memory } from '../types';
import { coupleStore } from '../services/store';
import { useLoveToast } from '../context/LoveToastContext';
import { useSound } from '../context/SoundContext';
import { uploadImage } from '../services/imageUpload';
import { SweetConfirmModal } from './SweetConfirmModal';

interface PolaroidCardProps {
  memory: Memory;
  rotation?: number;
  onDeleted?: (id: string) => void;
  onZoom?: (memory: Memory) => void;
  onUpdated?: (updated: Memory) => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  memory,
  rotation = 0,
  onDeleted,
  onZoom,
  onUpdated
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { showLoveSuccess, showLoveWarning } = useLoveToast();
  const { playSparkle } = useSound();

  // Edit states
  const [editTitle, setEditTitle] = useState(memory.title);
  const [editDate, setEditDate] = useState(memory.date || '');
  const [editLocation, setEditLocation] = useState(memory.location || '');
  const [editChapter, setEditChapter] = useState(memory.chapter || 'Cozy Dates');
  const [editDesc, setEditDesc] = useState(memory.description || '');
  const [editImageUrl, setEditImageUrl] = useState(memory.imageUrl);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(memory.title);
    setEditDate(memory.date || '');
    setEditLocation(memory.location || '');
    setEditChapter(memory.chapter || 'Cozy Dates');
    setEditDesc(memory.description || '');
    setEditImageUrl(memory.imageUrl);
    setIsEditing(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setEditImageUrl(url);
      showLoveSuccess('Photo updated to Google Drive! 📸', '✨');
    } catch (err) {
      console.error(err);
      showLoveWarning('Failed to upload photo 🥺');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await coupleStore.updateMemory(memory.id, {
      title: editTitle.trim() || memory.title,
      date: editDate || memory.date,
      location: editLocation.trim() || '',
      chapter: editChapter,
      description: editDesc.trim() || '',
      imageUrl: editImageUrl.trim() || memory.imageUrl
    });
    playSparkle();
    showLoveSuccess('Polaroid memory updated! 📸💖', '✨');
    setIsEditing(false);
    if (onUpdated) onUpdated(updated);
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
                  onClick={handleEditClick}
                  className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition shadow-xs cursor-pointer"
                  title="Edit polaroid"
                >
                  <Edit3 size={13} />
                </button>
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
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-stone-400 font-mono">{memory.chapter}</span>
                  <button
                    onClick={handleEditClick}
                    className="p-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full transition cursor-pointer"
                    title="Edit polaroid"
                  >
                    <Edit3 size={12} />
                  </button>
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

      {/* Edit Memory Modal */}
      <AnimatePresence>
        {isEditing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 text-stone-800 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <Edit3 size={12} /> Edit Memory
                </span>
                <h4 className="text-2xl font-bold font-serif-title text-stone-900">
                  Update Polaroid Memory 📸
                </h4>
              </div>

              <form onSubmit={handleSaveEdit} noValidate className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Photo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      className="flex-1 p-2.5 text-xs rounded-xl border border-stone-200"
                    />
                    <label className="py-2 px-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0">
                      <Upload size={13} /> {isUploading ? 'Uploading...' : 'Choose File'}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                  {editImageUrl && (
                    <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-rose-200">
                      <img src={editImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Chapter</label>
                    <select
                      value={editChapter}
                      onChange={(e) => setEditChapter(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-white"
                    >
                      <option value="Chapter 1: The Beginning">Chapter 1: The Beginning</option>
                      <option value="Cozy Dates">Cozy Dates</option>
                      <option value="Adventures & Trips">Adventures & Trips</option>
                      <option value="Silly Moments">Silly Moments</option>
                      <option value="Celebrations">Celebrations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Secret Story on the Back 💌
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-stone-200 font-handwriting text-base resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 px-4 bg-stone-100 text-stone-600 font-bold rounded-xl text-xs hover:bg-stone-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 py-2.5 px-4 bg-linear-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-200 hover:from-rose-600 hover:to-pink-600 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SweetConfirmModal
        isOpen={showConfirm}
        message={`Are you sure you want to remove "${memory.title}" from our scrapbook, my love? 🥺`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};
