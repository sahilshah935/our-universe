import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, X } from 'lucide-react';

interface SweetConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SweetConfirmModal: React.FC<SweetConfirmModalProps> = ({
  isOpen,
  title = 'Are you sure, my love? 🥺',
  message,
  confirmText = 'Yes, remove it',
  cancelText = 'Keep it ❤️',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 10 }}
        className="relative max-w-sm w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-200 text-center"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 transition"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-500 mx-auto mb-3 flex items-center justify-center text-2xl shadow-inner">
          <Heart size={26} className="fill-rose-500 text-rose-500 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-stone-800 font-serif-title mb-1">
          {title}
        </h3>
        <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-200 transition"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
