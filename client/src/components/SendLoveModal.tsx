import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { sendRealtimeLoveTouch } from '../services/firebase';
import confetti from 'canvas-confetti';

const TOUCH_TYPES = [
  { id: 'kiss', emoji: '💋', label: 'Sweet Kiss', desc: 'Blowing tender kisses across the screen' },
  { id: 'hug', emoji: '🫂', label: 'Warm Tight Hug', desc: 'Wrapping you in the warmest embrace' },
  { id: 'poke', emoji: '👉', label: 'Playful Poke', desc: 'Little nudge: thinking about you!' },
  { id: 'miss_you', emoji: '🥺', label: 'Miss You So Much', desc: 'Craving your presence & cuddles' }
];

export const SendLoveModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { currentPartner, otherPartner } = useAuth();
  const { sendLovePoke } = useSocket();
  const { playSparkle, playPokeSound } = useSound();
  const { showLoveSuccess } = useLoveToast();
  const [selectedType, setSelectedType] = useState<'kiss' | 'hug' | 'poke' | 'miss_you'>('kiss');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !otherPartner || !currentPartner) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const event = {
        targetPartnerId: otherPartner.id,
        senderId: currentPartner.id,
        senderName: currentPartner.name,
        pokeType: selectedType,
        message: customNote.trim() || undefined,
        timestamp: new Date().toISOString()
      };

      // Send to both WebSocket and Firestore Cloud
      await sendLovePoke(otherPartner.id, selectedType, customNote.trim() || undefined);
      await sendRealtimeLoveTouch(event as any);

      playPokeSound(selectedType);
      playSparkle();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      showLoveSuccess(`${TOUCH_TYPES.find(t => t.id === selectedType)?.emoji} Sent love touch to ${otherPartner.name}!`, '💖');
      
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
          <Heart size={26} className="fill-rose-500 text-rose-500 animate-pulse" />
        </div>

        <h3 className="text-2xl font-bold text-stone-800 font-serif-title">
          Send Love Touch 💌
        </h3>
        <p className="text-stone-500 text-xs mt-1 mb-5">
          Light up {otherPartner.name}'s screen in real time with floating hearts and sweet sounds!
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
              Optional Sweet Message
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
