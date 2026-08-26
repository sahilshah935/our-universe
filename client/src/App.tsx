import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { HeartShower } from './components/HeartShower';
import { LoveJarModal } from './components/LoveJarModal';
import { PrintableMemoryBook } from './components/PrintableMemoryBook';
import { ProfileModal } from './components/ProfileModal';
import { SendLoveModal } from './components/SendLoveModal';
import { FirebaseSettingsModal } from './components/FirebaseSettingsModal';
import { LogoSettingsModal } from './components/LogoSettingsModal';

import { DashboardView } from './pages/DashboardView';
import { ScrapbookView } from './pages/ScrapbookView';
import { ComfortSanctuary } from './components/ComfortSanctuary';
import { NicknameWall } from './components/NicknameWall';
import { InsideJokeDictionary } from './components/InsideJokeDictionary';
import { TimelineView } from './pages/TimelineView';
import { JournalView } from './pages/JournalView';
import { BucketListView } from './pages/BucketListView';
import { DateRouletteView } from './pages/DateRouletteView';

import { coupleStore } from './services/store';
import { Memory, Milestone } from './types';
import { Heart } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentPartner, otherPartner, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal States
  const [isLoveModalOpen, setIsLoveModalOpen] = useState(false);
  const [isLoveJarOpen, setIsLoveJarOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const [allMemories, setAllMemories] = useState<Memory[]>(() => coupleStore.getMemories());
  const [allMilestones, setAllMilestones] = useState<Milestone[]>(() => coupleStore.getTimeline());

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setAllMemories(coupleStore.getMemories());
      setAllMilestones(coupleStore.getTimeline());
    });
    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 text-rose-600 gap-3">
        <Heart size={36} className="animate-ping fill-rose-500" />
        <span className="font-serif-title text-xl font-bold">Loading Cozy Couple Hub...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-rose-50 via-pink-50/30 to-amber-50/40 text-stone-800">
      {/* Real-time Love Touch & Heart Exploder */}
      <HeartShower />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLoveModal={() => setIsLoveModalOpen(true)}
        onOpenLoveJar={() => setIsLoveJarOpen(true)}
        onOpenBook={() => setIsBookOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenLoveModal={() => setIsLoveModalOpen(true)}
            onOpenLoveJar={() => setIsLoveJarOpen(true)}
          />
        )}
        {activeTab === 'scrapbook' && <ScrapbookView />}
        {activeTab === 'comfort' && <ComfortSanctuary />}
        {activeTab === 'nicknames' && <NicknameWall />}
        {activeTab === 'insidejokes' && <InsideJokeDictionary />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'journal' && <JournalView />}
        {activeTab === 'bucketlist' && <BucketListView />}
        {activeTab === 'roulette' && <DateRouletteView />}
      </main>

      {/* Modals */}
      <SendLoveModal
        isOpen={isLoveModalOpen}
        onClose={() => setIsLoveModalOpen(false)}
      />

      <LoveJarModal
        isOpen={isLoveJarOpen}
        onClose={() => setIsLoveJarOpen(false)}
      />

      <PrintableMemoryBook
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        memories={allMemories}
        milestones={allMilestones}
        partner1={currentPartner?.id === 'partner1' ? currentPartner : otherPartner}
        partner2={currentPartner?.id === 'partner2' ? currentPartner : otherPartner}
      />

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

      {/* Romantic Footer */}
      <footer className="py-6 border-t border-rose-200/50 bg-white/40 backdrop-blur-xs text-center text-xs text-stone-500">
        <div className="flex items-center justify-center gap-1.5 font-medium">
          Made with <Heart size={14} className="fill-rose-500 text-rose-500 animate-pulse" /> for Sahil (BabyGirl) & Asmi (Supari / Girl) &bull; Cozy Couple Hub
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SoundProvider>
        <SocketProvider>
          <MainApp />
        </SocketProvider>
      </SoundProvider>
    </AuthProvider>
  );
}

export default App;
