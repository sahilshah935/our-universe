import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import { LoveToastProvider } from './context/LoveToastContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { HeartShower } from './components/HeartShower';
import { ProfileModal } from './components/ProfileModal';
import { FirebaseSettingsModal } from './components/FirebaseSettingsModal';
import { LogoSettingsModal } from './components/LogoSettingsModal';
import { CloudflareR2Modal } from './components/CloudflareR2Modal';
import { CloudinaryModal } from './components/CloudinaryModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { DashboardView } from './pages/DashboardView';
import { ScrapbookView } from './pages/ScrapbookView';
import { NicknameWall } from './components/NicknameWall';
import { InsideJokeDictionary } from './components/InsideJokeDictionary';
import { RelationshipTimeline as TimelineView } from './components/RelationshipTimeline';
import { JournalView } from './pages/JournalView';
import { BucketListView } from './pages/BucketListView';
import { CustomRoulette as DateRouletteView } from './components/CustomRoulette';
import { clearBrowserCacheAndReload } from './services/cacheCleaner';
import { Heart } from 'lucide-react';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isR2ModalOpen, setIsR2ModalOpen] = useState(false);
  const [isCloudinaryModalOpen, setIsCloudinaryModalOpen] = useState(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col selection:bg-rose-200 selection:text-rose-900">
      {/* Background Interactive Ambient Shower */}
      <HeartShower />

      {/* Navigation & Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
        onOpenR2Modal={() => setIsR2ModalOpen(true)}
        onOpenCloudinaryModal={() => setIsCloudinaryModalOpen(true)}
        onOpenGoogleDriveModal={() => setIsGoogleDriveModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'scrapbook' && <ScrapbookView />}
        {activeTab === 'nicknames' && <NicknameWall />}
        {activeTab === 'insidejokes' && <InsideJokeDictionary />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'journal' && <JournalView />}
        {activeTab === 'bucketlist' && <BucketListView />}
        {activeTab === 'roulette' && <DateRouletteView />}
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <FirebaseSettingsModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      <LogoSettingsModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />

      <CloudflareR2Modal
        isOpen={isR2ModalOpen}
        onClose={() => setIsR2ModalOpen(false)}
      />

      <CloudinaryModal
        isOpen={isCloudinaryModalOpen}
        onClose={() => setIsCloudinaryModalOpen(false)}
      />

      <GoogleDriveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
      />

      {/* Romantic Footer */}
      <footer className="py-6 border-t border-rose-200/50 bg-white/40 backdrop-blur-xs text-center text-xs text-stone-500 space-y-2">
        <div className="flex items-center justify-center gap-1.5 font-medium">
          Made with <Heart size={14} className="fill-rose-500 text-rose-500 animate-pulse" /> for Sahil (BabyGirl) & Asmi (Supari / Girl) &bull; Cozy Couple Hub
        </div>
        <div>
          <button
            onClick={() => {
              if (window.confirm('Clear all local browser cache and re-sync everything fresh from the cloud? 🧹')) {
                clearBrowserCacheAndReload();
              }
            }}
            className="text-[11px] text-stone-400 hover:text-rose-500 transition underline cursor-pointer"
            title="Purge all local browser cache and re-sync from cloud"
          >
            🧹 Clear Browser Cache & Re-Sync Fresh
          </button>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SoundProvider>
        <LoveToastProvider>
          <SocketProvider>
            <MainApp />
          </SocketProvider>
        </LoveToastProvider>
      </SoundProvider>
    </AuthProvider>
  );
}

export default App;
