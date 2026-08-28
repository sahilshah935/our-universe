import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Star, Edit3, HardDrive, FolderHeart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConnected } from '../services/firebase';
import { isGoogleDriveConfigured } from '../services/googleDrive';
import { coupleStore, SiteSettings } from '../services/store';
import { motion } from 'framer-motion';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLoveModal: () => void;
  onOpenProfile: () => void;
  onOpenLoveJar: () => void;
  onOpenFirebaseModal: () => void;
  onOpenLogoModal: () => void;
  onOpenR2Modal: () => void;
  onOpenCloudinaryModal: () => void;
  onOpenGoogleDriveModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLoveModal,
  onOpenProfile,
  onOpenLoveJar,
  onOpenFirebaseModal,
  onOpenLogoModal,
  onOpenGoogleDriveModal
}) => {
  const { currentPartner, otherPartner, switchPartner } = useAuth();
  const firebaseConnected = isFirebaseConnected();
  const driveConnected = isGoogleDriveConfigured();
  const [settings, setSettings] = useState<SiteSettings>(() => coupleStore.getSettings());

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setSettings(coupleStore.getSettings());
    });
    return unsubscribe;
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-rose-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Couple Brand (Real-Time Customizable) */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.08 }}
              className={`w-10 h-10 rounded-2xl bg-linear-to-tr ${settings.themeGradient || 'from-rose-500 to-pink-500'} flex items-center justify-center text-white shadow-md shadow-rose-200 cursor-pointer overflow-hidden relative group shrink-0`}
              onClick={onOpenLogoModal}
              title="Click to customize logo"
            >
              {settings.logoType === 'image' && settings.logoImageUrl ? (
                <img src={settings.logoImageUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl select-none">{settings.logoEmoji || '💖'}</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                <Edit3 size={13} />
              </div>
            </motion.div>
            
            <div>
              <div className="cursor-pointer" onClick={onOpenLogoModal} title="Click to customize title">
                <span className="text-lg sm:text-xl font-extrabold font-serif-title text-stone-900 tracking-tight flex items-center gap-1.5 leading-tight">
                  {settings.title || 'Us'} <span className="text-rose-500">&bull;</span> {settings.subtitle || 'Couple Hub'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <button
                  type="button"
                  onClick={onOpenGoogleDriveModal}
                  className="flex items-center gap-1.5 text-[11px] text-stone-600 font-bold hover:text-emerald-600 transition cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-xs"
                  title="Configure Google Drive Photo Storage"
                >
                  <FolderHeart size={13} className="text-emerald-500 fill-emerald-100" />
                  <span className="text-emerald-700">Google Drive Connected 📁</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Pills */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenLoveModal}
              className="px-3.5 py-1.5 rounded-full bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-rose-200 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Heart size={13} className="fill-white" /> Send Love Touch
            </button>

            <button
              onClick={onOpenLoveJar}
              className="px-3 py-1.5 rounded-full bg-white/80 hover:bg-rose-50 border border-rose-200 text-stone-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Star size={14} className="text-amber-500 fill-amber-400" /> Origami Love Jar
            </button>
          </div>

          {/* Persona Switcher & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Switch Button */}
            {otherPartner && (
              <div className="flex items-center gap-1 bg-rose-100/70 p-1 rounded-full border border-rose-200">
                <button
                  onClick={() => switchPartner('partner1')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    currentPartner?.id === 'partner1'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Switch to Sahil (BabyGirl)"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Sahil <span className="text-[10px] opacity-75 font-normal">BabyGirl</span>
                </button>
                <button
                  onClick={() => switchPartner('partner2')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    currentPartner?.id === 'partner2'
                      ? 'bg-white text-pink-700 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Switch to Asmi (Supari / Girl)"
                >
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  Asmi <span className="text-[10px] opacity-75 font-normal">Supari / Girl</span>
                </button>
              </div>
            )}

            {/* Profile Avatar Button */}
            <button
              onClick={onOpenProfile}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-rose-400 shadow-sm hover:scale-105 transition shrink-0 cursor-pointer"
              title="Edit Profile"
            >
              <img
                src={currentPartner?.avatar}
                alt={currentPartner?.name}
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 border-t border-rose-100/60 no-scrollbar">
          {[
            { id: 'dashboard', label: '🏠 Dashboard' },
            { id: 'scrapbook', label: '📸 Polaroid Scrapbook' },
            { id: 'comfort', label: '🚪 Comfort Doors' },
            { id: 'nicknames', label: '🏷️ Nickname Wall' },
            { id: 'insidejokes', label: '📖 Inside Jokes' },
            { id: 'timeline', label: '🗺️ Our Story' },
            { id: 'journal', label: '💌 Love Journal' },
            { id: 'bucketlist', label: '✨ Bucket List' },
            { id: 'roulette', label: '🎡 Decision Roulette' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-rose-500 text-white shadow-xs shadow-rose-200'
                  : 'text-stone-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
