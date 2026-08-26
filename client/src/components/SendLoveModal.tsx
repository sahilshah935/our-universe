import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSound } from '../context/SoundContext';

const TOUCH_TYPES = [
  { id: 'kiss', emoji: '💋', label: 'Blow Kiss', desc: 'Floating sweet kisses and sparkle audio' },
  { id: 'hug', emoji: '🤗', label: 'Warm Hug', desc: 'Heartfelt warm harmonic chime' },
  { id: 'poke', emoji: '👉', label: 'Playful Poke', desc: 'Little nudge: thinking of you!' },
  { id: 'miss_you', emoji: '🥺', label: 'Missing You', desc: 'I miss you so much right now' }
];

export const SendLoveModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { currentPartner, otherPartner } = useAuth();
  const { sendLovePoke } = useSocket();
  const { playSparkle } = useSound();
  const [selectedType, setSelectedType] = useState<'kiss' | 'hug' | 'poke' | 'miss_you'>('kiss');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !otherPartner) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await sendLovePoke(otherPartner.id, selectedType, customNote.trim() || undefined);
      playSparkle();
      onClose();
      setCustomNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 transition"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-500 mx-auto mb-3 flex items-center justify-center text-2xl shadow-inner">
          <Heart size={26} className="fill-rose-500" />
        </div>

        <h3 className="text-2xl font-bold text-stone-800 font-serif-title">
          Send Love Touch 💌
        </h3>
        <p className="text-stone-500 text-xs mt-1 mb-5">
          Light up {otherPartner.name}'s screen in real time with floating hearts and sound!
        </p>

        <form onSubmit={handleSend} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-2">
            {TOUCH_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id as any)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedType === t.id
                    ? 'border-rose-400 bg-rose-50/80 ring-2 ring-rose-400 shadow-sm'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-rose-50/30'
                }`}
              >
                <div className="text-2xl mb-1">{t.emoji}</div>
                <div className="text-xs font-bold text-stone-800">{t.label}</div>
                <div className="text-[10px] text-stone-400 leading-tight mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Optional Sweet Note
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Can't stop smiling thinking about you ❤️"
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2"
          >
            <Send size={16} /> Send {selectedType.toUpperCase()} To {otherPartner.name} ✨
          </button>
        </form>
      </motion.div>
    </div>
  );
};
