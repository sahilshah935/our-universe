import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, CheckCircle2, AlertCircle, X, Save, Sparkles, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { getCloudinaryConfig, saveCloudinaryConfig, isCloudinaryConfigured, CloudinaryConfig } from '../services/cloudinary';
import { useLoveToast } from '../context/LoveToastContext';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';

export const CloudinaryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { showLoveWarning, showLoveSuccess } = useLoveToast();
  const { playSparkle } = useSound();

  const [cloudName, setCloudName] = useState('');
  const [uploadPreset, setUploadPreset] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getCloudinaryConfig();
      setCloudName(cfg.cloudName || '');
      setUploadPreset(cfg.uploadPreset || '');
      setIsConnected(isCloudinaryConfigured());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cloudName.trim() || !uploadPreset.trim()) {
      showLoveWarning('Please enter both your Cloud Name and Upload Preset, my love! ☁️', '🥺');
      return;
    }

    setIsSaving(true);
    const newConfig: CloudinaryConfig = {
      cloudName: cloudName.trim(),
      uploadPreset: uploadPreset.trim()
    };

    saveCloudinaryConfig(newConfig);
    setIsConnected(true);
    setIsSaving(false);

    playSparkle();
    confetti({ particleCount: 50, spread: 60 });
    showLoveSuccess('Cloudinary Connected! All photos will now be stored permanently in HD 📸✨', '🎉');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-200 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 mx-auto mb-3 flex items-center justify-center text-2xl shadow-inner">
            <ImageIcon size={28} className="text-sky-500" />
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-extrabold uppercase tracking-wider mb-2">
            Cloudinary HD Media Hosting
          </div>
          <h3 className="text-2xl font-bold text-stone-900 font-serif-title">
            Cloudinary Photo Storage ☁️📸
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto leading-relaxed">
            25GB Free forever media storage for all polaroids, couple selfies, and custom avatars with high-speed CDN.
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
            <span>{isConnected ? 'Cloudinary Active & Connected' : 'Cloudinary Not Configured'}</span>
          </div>
        </div>

        <form onSubmit={handleSave} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Cloud Name
            </label>
            <input
              type="text"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              placeholder="e.g. duo-universe or your cloud name"
              className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Upload Preset (Unsigned)
            </label>
            <input
              type="text"
              value={uploadPreset}
              onChange={(e) => setUploadPreset(e.target.value)}
              placeholder="e.g. our_universe or ml_default"
              className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-200/80 text-[11px] text-stone-600 leading-relaxed space-y-1.5">
            <div className="font-bold text-sky-800 flex items-center gap-1">
              <Sparkles size={14} className="text-sky-600" />
              How to get your Cloudinary details (1 Minute Setup):
            </div>
            <p>
              1. Sign in to <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="underline font-bold text-sky-700">Cloudinary.com</a>.
            </p>
            <p>
              2. Copy your <strong>Cloud Name</strong> from the dashboard.
            </p>
            <p>
              3. Go to <strong>Settings ⚙️</strong> &gt; <strong>Upload</strong> &gt; Scroll down to <strong>Upload Presets</strong> &gt; Click <strong>Add Upload Preset</strong> &gt; Set Signing Mode to <strong>Unsigned</strong> &gt; Click Save.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 px-4 bg-linear-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-sky-200 transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <Save size={16} /> Save & Connect Cloudinary
          </button>
        </form>
      </motion.div>
    </div>
  );
};
