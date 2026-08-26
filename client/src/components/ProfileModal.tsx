import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useLoveToast } from '../context/LoveToastContext';
import { uploadImage } from '../services/imageUpload';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { currentPartner, updateCurrentPartner } = useAuth();
  const { playSparkle } = useSound();
  const { showLoveWarning, showLoveSuccess } = useLoveToast();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('');
  const [statusEmoji, setStatusEmoji] = useState('💖');
  const [avatar, setAvatar] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever active partner changes or modal opens
  useEffect(() => {
    if (currentPartner && isOpen) {
      setName(currentPartner.name || '');
      setNickname(currentPartner.nickname || '');
      setRole(currentPartner.role || '');
      setBio(currentPartner.bio || '');
      setStatus(currentPartner.status || '');
      setStatusEmoji(currentPartner.statusEmoji || '💖');
      setAvatar(currentPartner.avatar || '');
    }
  }, [currentPartner, isOpen]);

  if (!isOpen || !currentPartner) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setAvatar(url);
      showLoveSuccess('Looking gorgeous! Avatar uploaded ❤️', '✨');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showLoveWarning('Oops my love, something went wrong uploading the photo 🥺');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showLoveWarning('Wait a second darling! Please tell me your lovely name 🥺', '💖');
      return;
    }

    setIsSaving(true);
    try {
      await updateCurrentPartner({
        name: name.trim(),
        nickname: nickname.trim(),
        role: role.trim(),
        bio: bio.trim(),
        status: status.trim(),
        statusEmoji: statusEmoji.trim() || '💖',
        avatar
      });
      playSparkle();
      showLoveSuccess('Profile saved with so much love! 🥰', '🎉');
      onClose();
    } catch (err) {
      console.error(err);
      showLoveWarning('Could not save changes right now, my love! 🥺');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-rose-50 transition"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
            Editing {currentPartner.id === 'partner1' ? "Sahil's Profile" : "Asmi's Profile"}
          </div>
          <h3 className="text-2xl font-bold text-stone-800 font-serif-title">
            Edit Your Profile 💖
          </h3>
          <p className="text-stone-500 text-xs mt-1">
            Personalize your couple persona, status, and avatar.
          </p>
        </div>

        <form onSubmit={handleSave} noValidate className="space-y-4">
          {/* Avatar Preview & Upload */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-rose-400 shadow-md group">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white">
                <Camera size={20} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <span className="text-[11px] text-stone-400 mt-1">
              {isUploading ? 'Uploading photo...' : 'Click avatar to upload photo'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sahil / Asmi"
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Cute Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. BabyGirl / Supari"
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Your Couple Title / Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Chief Happiness Officer & Princess"
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Emoji</label>
              <input
                type="text"
                value={statusEmoji}
                onChange={(e) => setStatusEmoji(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 text-center text-lg"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Live Status</label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g. Craving Boba & your hugs 🧋"
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Sweet Bio Quote</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a sweet quote that reminds you of us..."
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 resize-none"
              rows={2}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 px-4 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-md shadow-rose-200 transition flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Changes
          </button>
        </form>
      </motion.div>
    </div>
  );
};
