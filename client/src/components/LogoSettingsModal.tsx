import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, Upload, Save, Heart, Palette, Image as ImageIcon, Smile } from 'lucide-react';
import { SiteSettings } from '../types';
import { coupleStore } from '../services/store';
import { uploadMedia } from '../services/firebase';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';

const LOGO_EMOJIS = ['💖', '🧸', '👑', '✨', '🌸', '🍓', '💍', '☕', '🌟', '🍕', '🚀', '💌', '🥐', '🐱', '🐶'];

const THEME_GRADIENTS = [
  { label: 'Rose Pink', val: 'from-rose-500 to-pink-500' },
  { label: 'Purple Indigo', val: 'from-purple-500 to-indigo-600' },
  { label: 'Amber Warmth', val: 'from-amber-500 to-rose-500' },
  { label: 'Emerald Mint', val: 'from-emerald-500 to-teal-600' },
  { label: 'Sunset Glow', val: 'from-orange-500 to-pink-600' }
];

export const LogoSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { playSparkle } = useSound();
  const currentSettings = coupleStore.getSettings();

  const [title, setTitle] = useState(currentSettings.title || 'Us');
  const [subtitle, setSubtitle] = useState(currentSettings.subtitle || 'Couple Hub');
  const [logoType, setLogoType] = useState<'icon' | 'image'>(currentSettings.logoType || 'icon');
  const [logoEmoji, setLogoEmoji] = useState(currentSettings.logoEmoji || '💖');
  const [logoImageUrl, setLogoImageUrl] = useState(currentSettings.logoImageUrl || '');
  const [themeGradient, setThemeGradient] = useState(currentSettings.themeGradient || 'from-rose-500 to-pink-500');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadMedia(file);
      setLogoImageUrl(url);
      setLogoType('image');
    } catch (err) {
      console.error('Logo upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    coupleStore.updateSettings({
      title: title.trim() || 'Us',
      subtitle: subtitle.trim() || 'Couple Hub',
      logoType,
      logoEmoji,
      logoImageUrl,
      themeGradient
    });

    // Also update browser document title
    document.title = `${title} • ${subtitle}`;

    playSparkle();
    confetti({ particleCount: 50, spread: 60 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 my-auto text-stone-800"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          {/* Live Preview Box */}
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 mb-3">
            <div className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${themeGradient} flex items-center justify-center text-white text-2xl shadow-md overflow-hidden shrink-0`}>
              {logoType === 'image' && logoImageUrl ? (
                <img src={logoImageUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span>{logoEmoji}</span>
              )}
            </div>
            <div className="text-left">
              <span className="text-lg font-extrabold font-serif-title text-stone-900 leading-tight block">
                {title} <span className="text-rose-500">&bull;</span> {subtitle}
              </span>
              <span className="text-[11px] text-stone-400">Live Logo Preview</span>
            </div>
          </div>

          <h3 className="text-2xl font-bold font-serif-title">
            Customize Website Logo & Brand 🎨
          </h3>
          <p className="text-stone-500 text-xs mt-1">
            Change the logo icon, image, title, and theme color in real time.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Logo Type Selector */}
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setLogoType('icon')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                logoType === 'icon' ? 'bg-white text-rose-600 shadow-xs' : 'text-stone-600'
              }`}
            >
              <Smile size={14} /> Emoji / Icon
            </button>
            <button
              type="button"
              onClick={() => setLogoType('image')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                logoType === 'image' ? 'bg-white text-rose-600 shadow-xs' : 'text-stone-600'
              }`}
            >
              <ImageIcon size={14} /> Upload Image
            </button>
          </div>

          {/* Emoji Picker */}
          {logoType === 'icon' ? (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Choose Logo Icon
              </label>
              <div className="flex flex-wrap gap-2 text-2xl p-2 bg-stone-50 rounded-2xl border border-stone-200">
                {LOGO_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setLogoEmoji(em)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                      logoEmoji === em ? 'bg-white shadow-md ring-2 ring-rose-500 scale-115' : 'hover:bg-white/60'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Upload Custom Logo Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={logoImageUrl}
                  onChange={(e) => setLogoImageUrl(e.target.value)}
                  placeholder="Paste image URL or upload..."
                  className="flex-1 p-2 text-xs rounded-xl border border-stone-200"
                />
                <label className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1 shrink-0">
                  <Upload size={14} />
                  {isUploading ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Brand Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Us / Sahil & Asmi"
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Couple Hub / Sanctuary"
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
                required
              />
            </div>
          </div>

          {/* Theme Gradient */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1">
              <Palette size={13} /> Theme Gradient
            </label>
            <div className="flex gap-2">
              {THEME_GRADIENTS.map((g) => (
                <button
                  key={g.val}
                  type="button"
                  onClick={() => setThemeGradient(g.val)}
                  className={`w-8 h-8 rounded-full bg-linear-to-r ${g.val} border-2 ${
                    themeGradient === g.val ? 'ring-2 ring-rose-500 scale-110' : 'opacity-70'
                  } transition`}
                  title={g.label}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-200 transition flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Logo & Update Live ✨
          </button>
        </form>
      </motion.div>
    </div>
  );
};
