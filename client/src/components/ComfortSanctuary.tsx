import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Sparkles, Key, Lock, Music, Image, Volume2, X, Send, ShieldAlert, Award } from 'lucide-react';
import { ComfortDoor } from '../types';
import { coupleStore } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { uploadMedia } from '../services/firebase';
import confetti from 'canvas-confetti';

export const ComfortSanctuary: React.FC = () => {
  const { currentPartner, otherPartner } = useAuth();
  const { playSparkle, playPokeSound, playHeartPop } = useSound();
  const [doors, setDoors] = useState<ComfortDoor[]>(() => coupleStore.getComfortDoors());
  const [openedDoor, setOpenedDoor] = useState<ComfortDoor | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [emoji, setEmoji] = useState('🥺');
  const [doorColor, setDoorColor] = useState('from-rose-400 to-pink-500');
  const [letter, setLetter] = useState('');
  const [memeUrl, setMemeUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setDoors(coupleStore.getComfortDoors());
    });
    return unsubscribe;
  }, []);

  const handleOpenDoor = (door: ComfortDoor) => {
    coupleStore.incrementDoorUnlock(door.id);
    setOpenedDoor(door);
    playPokeSound('hug');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadMedia(file);
      setMemeUrl(url);
      showLoveSuccess('Attached photo/meme successfully! 📸', '✨');
    } catch (err) {
      console.error(err);
      showLoveWarning('Failed to upload photo, my love! 🥺');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateDoor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showLoveWarning("Please enter a door theme title (e.g. Open When You're Sad)! 🚪", '🥺');
      return;
    }
    if (!letter.trim()) {
      showLoveWarning('Please write a comforting letter for when this door is opened, my love! 💌', '💖');
      return;
    }
    if (!currentPartner) return;

    coupleStore.addComfortDoor({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      emoji,
      doorColor,
      letter: letter.trim(),
      memeUrl: memeUrl.trim() || undefined,
      songTitle: songTitle.trim() || undefined,
      songUrl: songUrl.trim() || undefined,
      authorId: currentPartner.id
    });

    playSparkle();
    confetti({ particleCount: 50, spread: 70 });
    showLoveSuccess('Comfort door created with love! 🚪❤️', '✨');
    setTitle('');
    setSubtitle('');
    setLetter('');
    setMemeUrl('');
    setSongTitle('');
    setSongUrl('');
    setIsCreating(false);
  };

  const handleDeleteDoor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this comfort door?')) {
      playHeartPop();
      coupleStore.deleteComfortDoor(id);
      if (openedDoor?.id === id) setOpenedDoor(null);
    }
  };

  const DOOR_COLORS = [
    { label: 'Rose Pink', val: 'from-rose-400 to-pink-500' },
    { label: 'Warm Amber', val: 'from-amber-400 to-rose-400' },
    { label: 'Lavender Dusk', val: 'from-indigo-400 to-purple-500' },
    { label: 'Starlight Midnight', val: 'from-slate-700 to-indigo-900' },
    { label: 'Mint Fresh', val: 'from-emerald-400 to-teal-500' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-linear-to-r from-rose-500 via-pink-500 to-indigo-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <Key size={13} />
            Your Private Comfort Sanctuary
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-serif-title mb-2">
            Open-When Doors 🚪
          </h2>
          <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
            Whenever you need warmth, reassurance, laughter, or a reminder that you are deeply loved,
            open one of these private doors.
          </p>

          <button
            onClick={() => setIsCreating(true)}
            className="mt-6 py-3 px-6 rounded-2xl bg-white text-rose-600 font-extrabold text-xs shadow-lg hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Build A New Comfort Door
          </button>
        </div>
      </div>

      {/* The Doors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {doors.map((door, idx) => (
          <motion.div
            key={door.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.07 }}
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => handleOpenDoor(door)}
            className="relative cursor-pointer rounded-3xl overflow-hidden shadow-lg border border-white/60 bg-white group flex flex-col justify-between"
          >
            {/* Door Exterior Top */}
            <div className={`p-6 sm:p-8 bg-linear-to-br ${door.doorColor} text-white relative min-h-[160px] flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-4xl block animate-bounce">{door.emoji}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-xs">
                  Door #{idx + 1}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif-title leading-snug">
                  {door.title}
                </h3>
                {door.subtitle && (
                  <p className="text-xs text-white/80 line-clamp-1 mt-1 font-medium">
                    {door.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Door Handle & Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <Key size={14} /> Tap to Unlock & Read
              </span>
              <span className="text-[11px] text-stone-400">
                Opened {door.unlockedCount} times
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Opened Door Letter Modal */}
      <AnimatePresence>
        {openedDoor && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setOpenedDoor(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-rose-200 my-auto text-stone-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpenedDoor(null)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50"
              >
                <X size={20} />
              </button>

              {/* Door Header Graphic */}
              <div className="text-center mb-6 border-b border-rose-100 pb-5">
                <span className="text-5xl block mb-2">{openedDoor.emoji}</span>
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
                  Comfort Message For You
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif-title mt-2">
                  {openedDoor.title}
                </h3>
              </div>

              {/* Comfort Letter Body */}
              <div className="p-6 bg-rose-50/40 rounded-2xl border border-rose-100 mb-6">
                <p className="text-stone-800 text-base sm:text-lg font-handwriting text-2xl leading-relaxed whitespace-pre-line">
                  {openedDoor.letter}
                </p>
              </div>

              {/* Attached Photo/Meme if any */}
              {openedDoor.memeUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-stone-200 max-h-64 bg-stone-100">
                  <img
                    src={openedDoor.memeUrl}
                    alt="Comfort memory"
                    className="w-full h-full object-contain max-h-64 mx-auto"
                  />
                </div>
              )}

              {/* Attached Song / Playlist */}
              {openedDoor.songTitle && (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <Music size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                        Comfort Song For You
                      </span>
                      <h4 className="text-sm font-bold text-stone-800">{openedDoor.songTitle}</h4>
                    </div>
                  </div>
                  {openedDoor.songUrl && (
                    <a
                      href={openedDoor.songUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                    >
                      Listen 🎵
                    </a>
                  )}
                </div>
              )}

              {/* Virtual Warm Hug Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    playPokeSound('hug');
                    confetti({ particleCount: 50, spread: 60 });
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition flex items-center gap-2"
                >
                  <Heart size={15} className="fill-white" /> Take A Virtual Hug 🤗
                </button>

                <button
                  onClick={(e) => handleDeleteDoor(openedDoor.id, e)}
                  className="text-stone-300 hover:text-rose-500 text-xs transition"
                >
                  Delete this door
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create New Comfort Door Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 my-auto"
            >
              <button
                onClick={() => setIsCreating(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 mx-auto mb-2 flex items-center justify-center text-xl shadow-inner">
                  <Key size={22} />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 font-serif-title">
                  Build A New Comfort Door 🚪
                </h3>
                <p className="text-stone-500 text-xs mt-1">
                  Write a letter your love can open in specific moments of need.
                </p>
              </div>

              <form onSubmit={handleCreateDoor} noValidate className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Emoji</label>
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 text-center text-xl"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Door Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Open when you're overwhelmed"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Door Color Theme</label>
                  <div className="flex gap-2">
                    {DOOR_COLORS.map((c) => (
                      <button
                        key={c.val}
                        type="button"
                        onClick={() => setDoorColor(c.val)}
                        className={`w-7 h-7 rounded-full bg-linear-to-r ${c.val} border-2 ${
                          doorColor === c.val ? 'ring-2 ring-rose-500 scale-110' : 'opacity-70'
                        } transition`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Heartfelt Letter / Comfort Message
                  </label>
                  <textarea
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    placeholder="Write with all your warmth and care..."
                    className="w-full p-3 text-sm rounded-xl border border-stone-200 font-handwriting text-lg resize-none"
                    rows={5}
                    required
                  />
                </div>

                {/* Optional Meme / Photo */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Attach Cute Photo / Meme (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-rose-50 file:text-rose-700 file:font-semibold"
                  />
                  {isUploading && <span className="text-[11px] text-stone-400">Uploading image...</span>}
                </div>

                {/* Optional Song */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Song Name</label>
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="e.g. Best Part"
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Song URL</label>
                    <input
                      type="url"
                      value={songUrl}
                      onChange={(e) => setSongUrl(e.target.value)}
                      placeholder="https://open.spotify.com/..."
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !title || !letter}
                  className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-200 transition"
                >
                  Create & Lock Door 🚪✨
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
