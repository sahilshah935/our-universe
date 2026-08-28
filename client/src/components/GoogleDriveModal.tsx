import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderHeart, CheckCircle2, AlertCircle, X, Save, Sparkles, ExternalLink, HardDrive } from 'lucide-react';
import { getGoogleDriveScriptUrl, saveGoogleDriveScriptUrl, isGoogleDriveConfigured, DEFAULT_GOOGLE_DRIVE_SCRIPT_URL } from '../services/googleDrive';
import { useLoveToast } from '../context/LoveToastContext';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';

export const GoogleDriveModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { showLoveWarning, showLoveSuccess } = useLoveToast();
  const { playSparkle } = useSound();

  const [scriptUrl, setScriptUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const url = getGoogleDriveScriptUrl();
      setScriptUrl(url || DEFAULT_GOOGLE_DRIVE_SCRIPT_URL);
      setIsConnected(isGoogleDriveConfigured());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!scriptUrl.trim()) {
      showLoveWarning('Please enter your Google Apps Script Web App URL, my love! 📁', '🥺');
      return;
    }

    setIsSaving(true);
    saveGoogleDriveScriptUrl(scriptUrl.trim());
    setIsConnected(true);
    setIsSaving(false);

    playSparkle();
    confetti({ particleCount: 50, spread: 60 });
    showLoveSuccess('Google Drive Connected! All photos will now be stored in your Drive folder 📸✨', '🎉');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-200 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto mb-3 flex items-center justify-center text-2xl shadow-inner">
            <FolderHeart size={28} className="text-emerald-500" />
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold uppercase tracking-wider mb-2">
            Personal Google Drive Cloud Storage
          </div>
          <h3 className="text-2xl font-bold text-stone-900 font-serif-title">
            Google Drive Photo Storage 📁📸
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto leading-relaxed">
            All your couple polaroid memories, selfies, and avatars are automatically saved directly in your <strong>"Our Universe Memories"</strong> Google Drive folder.
          </p>
        </div>

        {/* Status Pill */}
        <div
          className={`p-3.5 rounded-2xl mb-5 flex items-center justify-between border ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-stone-50 border-stone-200 text-stone-600'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {isConnected ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="text-stone-400" />
            )}
            <span>{isConnected ? 'Google Drive Storage Active & Connected' : 'Google Drive Not Configured'}</span>
          </div>
        </div>

        <form onSubmit={handleSave} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Google Apps Script Web App URL
            </label>
            <input
              type="url"
              value={scriptUrl}
              onChange={(e) => setScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono text-[11px]"
            />
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-[11px] text-stone-600 leading-relaxed space-y-1.5">
            <div className="font-bold text-emerald-800 flex items-center gap-1">
              <Sparkles size={14} className="text-emerald-600" />
              How It Works:
            </div>
            <p>
              1. Photos uploaded by you or Asmi are sent directly to your Google Script.
            </p>
            <p>
              2. The script drops the photo into your <strong>Our Universe Memories</strong> folder in Google Drive.
            </p>
            <p>
              3. You can open your Google Drive app on your phone anytime and see all uploaded photos!
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <Save size={16} /> Save & Connect Google Drive
          </button>
        </form>
      </motion.div>
    </div>
  );
};
