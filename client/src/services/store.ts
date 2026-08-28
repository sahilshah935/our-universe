import {
  Partner,
  Countdown,
  Memory,
  Note,
  BucketListItem,
  LoveJarWish,
  Milestone,
  NicknameItem,
  InsideJokeItem,
  ComfortDoor,
  FutureDreamItem,
  SiteSettings
} from '../types';
import { firestoreDb } from './firebase';
import {
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  collection,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { saveMediaItem, getAllMediaItems, deleteMediaItem } from './imageDb';
import { saveAllDataToR2, loadAllDataFromR2, isR2Configured } from './r2Storage';

function getNextBirthdayDate(month: number, day: number, hour = 0, min = 0): string {
  const now = new Date();
  let year = now.getFullYear();
  const bdayThisYear = new Date(year, month - 1, day, hour, min, 0);
  if (bdayThisYear.getTime() < now.getTime()) {
    year += 1;
  }
  return new Date(year, month - 1, day, hour, min, 0).toISOString();
}

const DEFAULT_SETTINGS: SiteSettings = {
  title: 'Our Universe',
  subtitle: 'Sahil & Asmi',
  logoType: 'icon',
  logoEmoji: '💖',
  logoImageUrl: '',
  themeGradient: 'from-rose-500 to-pink-500'
};

const DEFAULT_PARTNERS: Partner[] = [
  {
    id: 'partner1',
    name: 'Sahil',
    nickname: 'BabyGirl',
    role: 'Dev Guy & Professional Cuddler',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    themeColor: '#4f46e5',
    bio: 'Loving you since 13 March, 2024 ❤️',
    status: 'Thinking about my girl 💭',
    statusEmoji: '☕'
  },
  {
    id: 'partner2',
    name: 'Asmi',
    nickname: 'Supari / Girl',
    role: 'Chief Happiness Officer & Princess',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    themeColor: '#ec4899',
    bio: 'You are my universe and favorite human ✨',
    status: 'Craving Boba & your hugs 🧋',
    statusEmoji: '🌸'
  }
];

const DEFAULT_COUNTDOWNS: Countdown[] = [
  {
    id: 'cd_anniversary_2025',
    title: 'Our 1 Year Anniversary 💍',
    targetDate: '2025-03-13T00:00:00.000Z',
    category: 'Anniversary',
    emoji: '💖',
    description: '365 days of laughs, warmth, and growing together.'
  },
  {
    id: 'cd_asmi_bday',
    title: "Asmi's Birthday 🎂",
    targetDate: getNextBirthdayDate(10, 16, 0, 0),
    category: 'Birthday',
    emoji: '👑',
    description: 'Celebrating the prettiest girl in the world!'
  },
  {
    id: 'cd_sahil_bday',
    title: "Sahil's Birthday 🎈",
    targetDate: getNextBirthdayDate(3, 9, 0, 0),
    category: 'Birthday',
    emoji: '🧸',
    description: 'Spoiling my boy with extra love and treats!'
  }
];

const DEFAULT_TIMELINE: Milestone[] = [
  {
    id: 'tl_1',
    title: 'The First Spark ✨',
    date: '2024-03-13',
    description: 'The day we made it official. Everything changed for the better.',
    icon: '✨',
    photoUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'tl_2',
    title: 'First Late-Night Call 🌙',
    date: '2024-04-02',
    description: 'Talking until 4 AM without even realizing where the time went.',
    icon: '🌙'
  },
  {
    id: 'tl_3',
    title: 'Unbreakable Connection 🔐',
    date: '2024-08-15',
    description: 'Through every high and low, our bond only grew stronger.',
    icon: '🔐'
  }
];

const DEFAULT_NICKNAMES: NicknameItem[] = [
  {
    id: 'nn_1',
    forPartnerId: 'partner1',
    name: 'BabyGirl',
    tag: 'Favorite',
    explanation: 'Because he pretends to be tough but gets soft instantly around me.',
    bgGradient: 'from-pink-500 to-rose-600',
    addedById: 'partner2',
    createdAt: new Date().toISOString()
  },
  {
    id: 'nn_2',
    forPartnerId: 'partner2',
    name: 'Supari',
    tag: 'Classic',
    explanation: 'Our iconic, cute, irreplaceable inside name for her.',
    bgGradient: 'from-purple-500 to-indigo-600',
    addedById: 'partner1',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_INSIDE_JOKES: InsideJokeItem[] = [
  {
    id: 'ij_1',
    word: '5 more minutes...',
    pronunciation: '/faɪv mɔːr ˈmɪn.ɪts/',
    partOfSpeech: 'phrase',
    definition: 'A universal lie told every morning before finally getting out of bed.',
    example: '“Are you awake?” “Yes, just 5 more minutes...” *falls asleep for 2 hours*',
    origin: 'Every weekend morning together',
    addedById: 'partner1',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_COMFORT_DOORS: ComfortDoor[] = [
  {
    id: 'door_sad',
    title: "Open When You're Sad / Overwhelmed 🥺",
    subtitle: 'Take a deep breath. You are safe here.',
    emoji: '🥺',
    doorColor: 'from-rose-400 to-pink-500',
    letter: 'Hey my love,\n\nI know today feels heavy, but remember that you are never alone. I am always in your corner, cheering for you and loving you with all my heart.\n\nTake a sip of water, close your eyes, and let me wrap you in the biggest imaginary hug. Everything is going to be okay. ❤️',
    memeUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=600',
    songTitle: 'Best Part - Daniel Caesar ft. H.E.R.',
    songUrl: 'https://open.spotify.com',
    authorId: 'partner1',
    unlockedCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'door_miss',
    title: 'Open When You Miss Me So Much 🫂',
    subtitle: 'Distance is temporary, my love for you is forever.',
    emoji: '🫂',
    doorColor: 'from-amber-400 to-rose-400',
    letter: 'My sweet girl,\n\nI miss you right now too. Even when we are apart, every little thing reminds me of your smile, your laugh, and the warmth of holding your hand.\n\nSend me a quick love poke or text right now so I know you opened this! 💌',
    authorId: 'partner1',
    unlockedCount: 0,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_FUTURE_DREAMS: FutureDreamItem[] = [
  {
    id: 'fd_1',
    title: 'Our Cozy Dream Apartment 🏡',
    description: 'Big kitchen, sunset balcony, fairy lights, and endless lazy Sundays.',
    emoji: '🏡',
    targetYear: '2026',
    addedById: 'partner1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'fd_2',
    title: 'Stargazing in Switzerland 🏔️',
    description: 'Wooden cabin, hot chocolate by the fireplace, and watching snow fall together.',
    emoji: '🏔️',
    targetYear: '2027',
    addedById: 'partner2',
    createdAt: new Date().toISOString()
  }
];

function mergeLists<T extends { id: string }>(localList: T[] = [], remoteList: T[] = []): T[] {
  const map = new Map<string, T>();
  for (const item of remoteList) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of localList) {
    if (item && item.id) {
      const existing = map.get(item.id);
      map.set(item.id, existing ? { ...existing, ...item } : item);
    }
  }
  return Array.from(map.values());
}

export class CoupleStore {
  private data: {
    settings: SiteSettings;
    partners: Partner[];
    countdowns: Countdown[];
    memories: Memory[];
    notes: Note[];
    bucketList: BucketListItem[];
    loveJar: LoveJarWish[];
    timeline: Milestone[];
    nicknames: NicknameItem[];
    insideJokes: InsideJokeItem[];
    comfortDoors: ComfortDoor[];
    futureDreams: FutureDreamItem[];
  };

  private listeners: Set<() => void> = new Set();
  private isSyncingFromCloud = false;

  constructor() {
    this.data = this.loadLocal();
    this.hydrateMediaFromIndexedDB();
    this.initFirebaseSync();
    this.initR2Sync();
    this.startPeriodicSync();
  }

  private startPeriodicSync() {
    // 2-second synchronization heartbeat across devices
    setInterval(() => {
      this.pollFirebase();
    }, 2000);
  }

  private async pollFirebase() {
    if (!firestoreDb || this.isSyncingFromCloud) return;
    try {
      // 1. Dedicated memories collection
      const memsColl = collection(firestoreDb, 'couple_memories');
      const memsSnap = await getDocs(memsColl);
      if (!memsSnap.empty) {
        const cloudMemories: Memory[] = [];
        memsSnap.forEach((d) => {
          cloudMemories.push(d.data() as Memory);
        });
        if (cloudMemories.length > 0) {
          cloudMemories.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          this.data.memories = mergeLists(this.data.memories, cloudMemories);
          this.notify();
        }
      }

      // 2. Dedicated partners collection
      const partnersColl = collection(firestoreDb, 'couple_partners');
      const partnersSnap = await getDocs(partnersColl);
      if (!partnersSnap.empty) {
        const cloudPartners: Partner[] = [];
        partnersSnap.forEach((d) => {
          cloudPartners.push(d.data() as Partner);
        });
        if (cloudPartners.length > 0) {
          this.data.partners = this.data.partners.map((lp) => {
            const cp = cloudPartners.find((p) => p.id === lp.id);
            return cp ? { ...lp, ...cp, avatar: cp.avatar || lp.avatar } : lp;
          });
          this.notify();
        }
      }

      // 3. Main couple hub document
      const docRef = doc(firestoreDb, 'couple_hub', 'main_data');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const remote = snap.data() as any;
        if (remote) {
          this.applyRemoteData(remote);
        }
      }
    } catch {
      // Quiet fail
    }
  }

  private applyRemoteData(remote: any) {
    if (!remote) return;
    this.isSyncingFromCloud = true;

    // Remote partner data takes priority
    const mergedPartners = this.data.partners.map((lp) => {
      const rp = remote.partners?.find((p: any) => p.id === lp.id);
      if (!rp) return lp;
      return {
        ...lp,
        ...rp,
        avatar: rp.avatar || lp.avatar
      };
    });

    this.data = {
      settings: { ...this.data.settings, ...(remote.settings || {}) },
      partners: mergedPartners.length > 0 ? mergedPartners : this.data.partners,
      countdowns: remote.countdowns !== undefined ? mergeLists(this.data.countdowns, remote.countdowns) : this.data.countdowns,
      memories: remote.memories && remote.memories.length > 0 ? mergeLists(this.data.memories, remote.memories) : this.data.memories,
      notes: remote.notes !== undefined ? mergeLists(this.data.notes, remote.notes) : this.data.notes,
      bucketList: remote.bucketList !== undefined ? mergeLists(this.data.bucketList, remote.bucketList) : this.data.bucketList,
      loveJar: remote.loveJar !== undefined ? mergeLists(this.data.loveJar, remote.loveJar) : this.data.loveJar,
      timeline: remote.timeline !== undefined ? mergeLists(this.data.timeline, remote.timeline) : this.data.timeline,
      nicknames: remote.nicknames !== undefined ? mergeLists(this.data.nicknames, remote.nicknames) : this.data.nicknames,
      insideJokes: remote.insideJokes !== undefined ? mergeLists(this.data.insideJokes, remote.insideJokes) : this.data.insideJokes,
      comfortDoors: remote.comfortDoors !== undefined ? mergeLists(this.data.comfortDoors, remote.comfortDoors) : this.data.comfortDoors,
      futureDreams: remote.futureDreams !== undefined ? mergeLists(this.data.futureDreams, remote.futureDreams) : this.data.futureDreams
    };

    try {
      localStorage.setItem('asmi_couple_store_v3', JSON.stringify(this.data));
    } catch (e) {}

    this.notify();
    this.isSyncingFromCloud = false;
  }

  private async initR2Sync() {
    if (!isR2Configured()) return;
    try {
      const r2Data = await loadAllDataFromR2();
      if (r2Data) {
        this.applyRemoteData(r2Data);
      }
    } catch (e) {
      console.warn('R2 boot sync note:', e);
    }
  }

  private async hydrateMediaFromIndexedDB() {
    try {
      const mediaMap = await getAllMediaItems();
      let hasUpdates = false;

      // Hydrate partner avatars if local avatar is missing
      if (mediaMap['partner_avatar_partner1'] && this.data.partners[0] && !this.data.partners[0].avatar) {
        this.data.partners[0].avatar = mediaMap['partner_avatar_partner1'];
        hasUpdates = true;
      }
      if (mediaMap['partner_avatar_partner2'] && this.data.partners[1] && !this.data.partners[1].avatar) {
        this.data.partners[1].avatar = mediaMap['partner_avatar_partner2'];
        hasUpdates = true;
      }

      // Hydrate memories
      const updatedMemories = this.data.memories.map((m) => {
        if (mediaMap[m.id] && !m.imageUrl) {
          hasUpdates = true;
          return { ...m, imageUrl: mediaMap[m.id] };
        }
        return m;
      });

      if (hasUpdates) {
        this.data.memories = updatedMemories;
        this.notify();
      }
    } catch (e) {
      console.warn('Hydration warning:', e);
    }
  }

  private loadLocal() {
    try {
      const raw = localStorage.getItem('asmi_couple_store_v3');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          settings: parsed.settings || DEFAULT_SETTINGS,
          partners: parsed.partners || DEFAULT_PARTNERS,
          countdowns: parsed.countdowns || DEFAULT_COUNTDOWNS,
          memories: (parsed.memories || []).filter((m: any) => m.id !== 'mem_1' && m.id !== 'mem_2'),
          notes: parsed.notes || [],
          bucketList: parsed.bucketList || [],
          loveJar: parsed.loveJar || [],
          timeline: parsed.timeline || DEFAULT_TIMELINE,
          nicknames: parsed.nicknames || DEFAULT_NICKNAMES,
          insideJokes: parsed.insideJokes || DEFAULT_INSIDE_JOKES,
          comfortDoors: parsed.comfortDoors || DEFAULT_COMFORT_DOORS,
          futureDreams: parsed.futureDreams || DEFAULT_FUTURE_DREAMS
        };
      }
    } catch (e) {}

    return {
      settings: DEFAULT_SETTINGS,
      partners: DEFAULT_PARTNERS,
      countdowns: DEFAULT_COUNTDOWNS,
      memories: [],
      notes: [],
      bucketList: [],
      loveJar: [],
      timeline: DEFAULT_TIMELINE,
      nicknames: DEFAULT_NICKNAMES,
      insideJokes: DEFAULT_INSIDE_JOKES,
      comfortDoors: DEFAULT_COMFORT_DOORS,
      futureDreams: DEFAULT_FUTURE_DREAMS
    };
  }

  private saveLocal() {
    try {
      localStorage.setItem('asmi_couple_store_v3', JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage quota warning:', e);
    }
    this.notify();
    this.syncToFirebase();
    saveAllDataToR2(this.data);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async initFirebaseSync() {
    if (!firestoreDb) return;
    try {
      // 1. Listen to dedicated memories collection
      const memsColl = collection(firestoreDb, 'couple_memories');
      onSnapshot(memsColl, (snap) => {
        if (!snap.empty) {
          const cloudMemories: Memory[] = [];
          snap.forEach((d) => {
            cloudMemories.push(d.data() as Memory);
          });
          cloudMemories.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          this.data.memories = mergeLists(this.data.memories, cloudMemories);
          this.notify();
        }
      });

      // 2. Listen to dedicated partners collection
      const partnersColl = collection(firestoreDb, 'couple_partners');
      onSnapshot(partnersColl, (snap) => {
        if (!snap.empty) {
          const cloudPartners: Partner[] = [];
          snap.forEach((d) => {
            cloudPartners.push(d.data() as Partner);
          });
          this.data.partners = this.data.partners.map((lp) => {
            const cp = cloudPartners.find((p) => p.id === lp.id);
            return cp ? { ...lp, ...cp, avatar: cp.avatar || lp.avatar } : lp;
          });
          this.notify();
        }
      });

      // 3. Listen to main couple hub data
      const docRef = doc(firestoreDb, 'couple_hub', 'main_data');
      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const remote = docSnap.data() as any;
          if (remote) {
            this.applyRemoteData(remote);
          }
        } else {
          setDoc(docRef, this.data, { merge: true });
        }
      });
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }
  }

  private async syncToFirebase() {
    if (!firestoreDb || this.isSyncingFromCloud) return;
    try {
      const docRef = doc(firestoreDb, 'couple_hub', 'main_data');
      await setDoc(docRef, this.data, { merge: true });
    } catch (err) {
      console.warn('Firestore write note:', err);
    }
  }

  // --- GETTERS & ACTIONS ---

  // 1. Site Settings (Logo & Title)
  getSettings(): SiteSettings {
    return this.data.settings || DEFAULT_SETTINGS;
  }
  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.getSettings(), ...updates };
    this.saveLocal();
    return this.data.settings;
  }

  // 2. Partners
  getPartners(): Partner[] {
    return this.data.partners;
  }
  updatePartner(id: string, updates: Partial<Partner>): Partner {
    this.data.partners = this.data.partners.map((p) => (p.id === id ? { ...p, ...updates } : p));
    const updated = this.data.partners.find((p) => p.id === id)!;
    if (updates.avatar) {
      saveMediaItem('partner_avatar_' + id, updates.avatar);
    }
    if (firestoreDb) {
      setDoc(doc(firestoreDb, 'couple_partners', id), updated, { merge: true }).catch(() => {});
    }
    this.saveLocal();
    return updated;
  }

  // 3. Countdowns
  getCountdowns(): Countdown[] {
    return this.data.countdowns;
  }
  addCountdown(item: Omit<Countdown, 'id' | 'createdAt'>): Countdown {
    const created: Countdown = {
      ...item,
      id: 'cd_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.data.countdowns = [created, ...this.data.countdowns];
    this.saveLocal();
    return created;
  }
  deleteCountdown(id: string) {
    this.data.countdowns = this.data.countdowns.filter((c) => c.id !== id);
    this.saveLocal();
  }

  // 4. 📸 Polaroid Scrapbook (Memories)
  getMemories(): Memory[] {
    return this.data.memories;
  }
  async addMemory(item: Omit<Memory, 'id' | 'likes' | 'createdAt'>): Promise<Memory> {
    const created: Memory = {
      ...item,
      id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      likes: 0,
      createdAt: new Date().toISOString()
    };

    if (created.imageUrl) {
      saveMediaItem(created.id, created.imageUrl);
    }

    this.data.memories = [created, ...this.data.memories.filter((m) => m.id !== created.id)];
    this.saveLocal();

    // Save dedicated memory document in Firestore
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'couple_memories', created.id), created);
      } catch (err) {
        console.warn('Memory cloud sync note:', err);
      }
    }

    return created;
  }
  deleteMemory(id: string) {
    this.data.memories = this.data.memories.filter((m) => m.id !== id);
    deleteMediaItem(id);
    if (firestoreDb) {
      deleteDoc(doc(firestoreDb, 'couple_memories', id)).catch(() => {});
    }
    this.saveLocal();
  }

  // 5. 🏷️ Nickname Wall
  getNicknames(): NicknameItem[] {
    return this.data.nicknames;
  }
  addNickname(item: Omit<NicknameItem, 'id' | 'createdAt'>): NicknameItem {
    const created: NicknameItem = {
      ...item,
      id: 'nn_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.data.nicknames = [created, ...this.data.nicknames];
    this.saveLocal();
    return created;
  }
  deleteNickname(id: string) {
    this.data.nicknames = this.data.nicknames.filter((n) => n.id !== id);
    this.saveLocal();
  }

  // 6. 📖 Inside Jokes
  getInsideJokes(): InsideJokeItem[] {
    return this.data.insideJokes;
  }
  addInsideJoke(item: Omit<InsideJokeItem, 'id' | 'createdAt'>): InsideJokeItem {
    const created: InsideJokeItem = {
      ...item,
      id: 'ij_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.data.insideJokes = [created, ...this.data.insideJokes];
    this.saveLocal();
    return created;
  }
  deleteInsideJoke(id: string) {
    this.data.insideJokes = this.data.insideJokes.filter((j) => j.id !== id);
    this.saveLocal();
  }

  // 7. 🚪 Comfort Doors
  getComfortDoors(): ComfortDoor[] {
    return this.data.comfortDoors;
  }
  addComfortDoor(item: Omit<ComfortDoor, 'id' | 'unlockedCount' | 'createdAt'>): ComfortDoor {
    const created: ComfortDoor = {
      ...item,
      id: 'door_' + Date.now(),
      unlockedCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.comfortDoors = [created, ...this.data.comfortDoors];
    this.saveLocal();
    return created;
  }
  incrementDoorUnlock(id: string) {
    this.data.comfortDoors = this.data.comfortDoors.map((d) =>
      d.id === id ? { ...d, unlockedCount: (d.unlockedCount || 0) + 1 } : d
    );
    this.saveLocal();
  }
  deleteComfortDoor(id: string) {
    this.data.comfortDoors = this.data.comfortDoors.filter((d) => d.id !== id);
    this.saveLocal();
  }

  // 8. 🗺️ Our Story & Timeline
  getTimeline(): Milestone[] {
    return this.data.timeline;
  }
  addTimelineMilestone(item: Omit<Milestone, 'id'>): Milestone {
    const created: Milestone = {
      ...item,
      id: 'tl_' + Date.now()
    };
    this.data.timeline = [...this.data.timeline, created];
    this.saveLocal();
    return created;
  }
  deleteTimelineMilestone(id: string) {
    this.data.timeline = this.data.timeline.filter((m) => m.id !== id);
    this.saveLocal();
  }

  // 9. Future Dreams
  getFutureDreams(): FutureDreamItem[] {
    return this.data.futureDreams;
  }
  addFutureDream(item: Omit<FutureDreamItem, 'id' | 'createdAt'>): FutureDreamItem {
    const created: FutureDreamItem = {
      ...item,
      id: 'fd_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.data.futureDreams = [created, ...this.data.futureDreams];
    this.saveLocal();
    return created;
  }
  deleteFutureDream(id: string) {
    this.data.futureDreams = this.data.futureDreams.filter((f) => f.id !== id);
    this.saveLocal();
  }

  // 10. 💌 Love Journal (Notes)
  getNotes(postItOnly = false): Note[] {
    if (postItOnly) {
      return this.data.notes.filter((n) => Boolean(n.isPostIt));
    }
    return this.data.notes.filter((n) => !n.isPostIt);
  }
  addNote(item: Omit<Note, 'id' | 'createdAt'>): Note {
    const created: Note = {
      ...item,
      id: 'note_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.data.notes = [created, ...this.data.notes];
    this.saveLocal();
    return created;
  }
  deleteNote(id: string) {
    this.data.notes = this.data.notes.filter((n) => n.id !== id);
    this.saveLocal();
  }

  // 11. ✨ Bucket List
  getBucketList(): BucketListItem[] {
    return this.data.bucketList;
  }
  addBucketItem(item: Omit<BucketListItem, 'id' | 'completed' | 'createdAt'>): BucketListItem {
    const created: BucketListItem = {
      ...item,
      id: 'bl_' + Date.now(),
      completed: 0,
      createdAt: new Date().toISOString()
    };
    this.data.bucketList = [created, ...this.data.bucketList];
    this.saveLocal();
    return created;
  }
  toggleBucketItem(id: string): BucketListItem {
    this.data.bucketList = this.data.bucketList.map((item) =>
      item.id === id ? { ...item, completed: item.completed ? 0 : 1 } : item
    );
    this.saveLocal();
    return this.data.bucketList.find((item) => item.id === id)!;
  }
  deleteBucketItem(id: string) {
    this.data.bucketList = this.data.bucketList.filter((item) => item.id !== id);
    this.saveLocal();
  }

  // 12. ⭐ Love Jar
  getLoveJarWishes(): LoveJarWish[] {
    return this.data.loveJar;
  }
  addLoveJarWish(item: Omit<LoveJarWish, 'id' | 'createdAt'>): LoveJarWish {
    const created: LoveJarWish = {
      ...item,
      id: 'wish_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.data.loveJar = [created, ...this.data.loveJar];
    this.saveLocal();
    return created;
  }
  getRandomLoveJarWish(): LoveJarWish | null {
    if (this.data.loveJar.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.data.loveJar.length);
    return this.data.loveJar[randomIndex];
  }
}

export const coupleStore = new CoupleStore();
