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
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// Helper to calculate next occurrence of a birthday (MM-DD)
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

// Initial default state with couple's customized information
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
    bio: 'Stealing your hoodies and your heart forever ✨',
    status: 'Craving your hugs & snacks 🌸',
    statusEmoji: '🧋'
  }
];

const DEFAULT_COUNTDOWNS: Countdown[] = [
  {
    id: 'cd_asmi_bday',
    title: "Asmi's Birthday 🎂",
    targetDate: getNextBirthdayDate(10, 16), // 16 October
    category: 'Birthday',
    emoji: '👑',
    description: "Celebrating the birth of the prettiest girl in the universe!",
    createdAt: new Date().toISOString()
  },
  {
    id: 'cd_sahil_bday',
    title: "Sahil's Birthday 🎉",
    targetDate: getNextBirthdayDate(3, 9), // 09 March
    category: 'Birthday',
    emoji: '🎈',
    description: "Celebrating BabyGirl's special day!",
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_NICKNAMES: NicknameItem[] = [
  {
    id: 'nn_1',
    forPartnerId: 'partner2',
    name: 'Supari',
    tag: 'Favorite Classic',
    explanation: 'Small, spicy, cute, totally unbreakable, and packs the biggest punch of love in the whole universe.',
    bgGradient: 'from-pink-500 to-rose-600',
    addedById: 'partner1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'nn_2',
    forPartnerId: 'partner2',
    name: 'Girl',
    tag: 'Pure Royalty',
    explanation: 'The one and only girl in my life. Supreme commander of my heart and lawful owner of all my oversized hoodies.',
    bgGradient: 'from-purple-500 to-indigo-600',
    addedById: 'partner1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'nn_3',
    forPartnerId: 'partner1',
    name: 'BabyGirl',
    tag: 'Softest Boy',
    explanation: 'He may act like a tough cool developer, but deep down he is the softest BabyGirl who needs all the cuddles.',
    bgGradient: 'from-amber-500 to-rose-500',
    addedById: 'partner2',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_INSIDE_JOKES: InsideJokeItem[] = [
  {
    id: 'ij_1',
    word: 'Supari Mode',
    pronunciation: '/suːˈpɑː.ri moʊd/',
    partOfSpeech: 'noun / state of being',
    definition: 'When she crosses her arms, makes an adorable pouty face, and pretends to be mad just to get extra forehead kisses.',
    example: '"Look at her, she has activated full Supari Mode again."',
    origin: 'Born during one of our random late-night playful teasing sessions.',
    addedById: 'partner1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ij_2',
    word: 'BabyGirl Tantrum',
    pronunciation: '/ˈbeɪ.bi.ɡɜːrl ˈtæn.trəm/',
    partOfSpeech: 'noun / cute behavior',
    definition: 'When Sahil doesn’t get his cuddle quota for the day and turns into a dramatic baby.',
    example: '"5 minutes without holding my hand and he starts his BabyGirl Tantrum."',
    origin: 'Observed repeatedly on every date.',
    addedById: 'partner2',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ij_3',
    word: 'Hoodie Tax',
    pronunciation: '/ˈhʊd.i tæks/',
    partOfSpeech: 'verb / lawful theft',
    definition: 'The universal law that any hoodie belonging to Sahil will inevitably migrate to Asmi’s wardrobe and never return.',
    example: '"I had 5 black hoodies last month, but the Hoodie Tax took 4."',
    origin: 'Day 1 of our relationship.',
    addedById: 'partner1',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_COMFORT_DOORS: ComfortDoor[] = [
  {
    id: 'door_sad',
    title: "Open When You're Sad",
    subtitle: "A safe space for tears, warm hugs, and gentle reminders",
    emoji: '🥺',
    doorColor: 'from-rose-400 to-pink-500',
    letter: "Hey my love,\n\nTake a deep breath right now. Drop your shoulders and unclench your jaw.\n\nWhatever is making you feel heavy or sad today, I want you to know that it is okay to feel this way. You don't always have to be strong. You are allowed to be tired, you are allowed to cry, and you are allowed to rest.\n\nRemember that this feeling is only a passing cloud, not the whole sky. You are the strongest, most resilient, and most beautiful human I know. And no matter what happens, you are never facing this world alone.\n\nI am right here with you. Sending you the warmest, tightest hug. I love you so much.",
    memeUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
    songTitle: 'Comfort Acoustic Playlist',
    songUrl: 'https://open.spotify.com',
    unlockedCount: 0,
    authorId: 'partner1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'door_fight',
    title: "Open When We Fight / Need to Make Up",
    subtitle: "Because our love is always bigger than any disagreement",
    emoji: '🩹',
    doorColor: 'from-amber-400 to-rose-400',
    letter: "Hey,\n\nIf we just argued or had a misunderstanding, I want to say this first: I love you, and I am not going anywhere.\n\nIt is us versus the problem, never you versus me. In the heat of the moment, words can come out wrong, but my love for you has not shrunk even 1%. You are my favorite person, and your smile is worth more to me than winning any argument.\n\nLet’s take 10 minutes to cool off, get a glass of water, and come back to each other. I am ready to listen and hold your hand.",
    memeUrl: '',
    songTitle: 'Our Make-Up Song',
    songUrl: '',
    unlockedCount: 0,
    authorId: 'partner1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'door_miss',
    title: "Open When You Miss Me",
    subtitle: "Close your eyes and feel me holding your hand",
    emoji: '💌',
    doorColor: 'from-indigo-400 to-purple-500',
    letter: "My sweet baby,\n\nDistance is just a test to see how far love can travel, and ours has no boundaries.\n\nWhenever you miss me, place your hand over your chest. That heartbeat? That's me living right inside your heart. Look up at the sky — we are looking at the exact same moon and stars.\n\nI am counting down every second until I can see your beautiful face and wrap my arms around you again. Until then, remember that every thought of mine is about you.",
    memeUrl: '',
    songTitle: 'Thinking of You Song',
    songUrl: '',
    unlockedCount: 0,
    authorId: 'partner2',
    createdAt: new Date().toISOString()
  },
  {
    id: 'door_sleep',
    title: "Open When You Can't Sleep",
    subtitle: "A bedtime story and soft whispers to drift away",
    emoji: '🌙',
    doorColor: 'from-slate-700 to-indigo-900',
    letter: "Shh... close your eyes my love.\n\nLeave all of today's worries outside your pillow. You did your best today, and that is more than enough.\n\nImagine we are wrapped together in a giant fluffy blanket, listening to soft rain tapping on the window. My hand is stroking your hair, whispering how much you mean to me.\n\nDrift to sleep safely. I'll meet you in our dreams. Goodnight my darling.",
    memeUrl: '',
    songTitle: 'Soft Lullaby & Rain',
    songUrl: '',
    unlockedCount: 0,
    authorId: 'partner1',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_TIMELINE: Milestone[] = [
  {
    id: 'tl_1',
    title: 'The First DM & First Conversation 💬',
    date: '2024-02-14',
    description: 'When a simple message turned into hours of endless talking, instant butterflies, and staying up way too late.',
    icon: '💬',
    photoUrl: '',
    category: 'meeting',
    orderNum: 1
  },
  {
    id: 'tl_2',
    title: 'Our Official Beginning (13 March, 2024) 💖',
    date: '2024-03-13',
    description: 'The day we officially became us. The start of the best adventure of our entire lives.',
    icon: '✨',
    photoUrl: '',
    category: 'date',
    orderNum: 2
  },
  {
    id: 'tl_3',
    title: 'The Inside Joke That Changed Everything 😂',
    date: '2024-04-10',
    description: 'When we laughed so hard our stomachs hurt in public and realized we share the exact same weird sense of humor.',
    icon: '😂',
    photoUrl: '',
    category: 'joke',
    orderNum: 3
  },
  {
    id: 'tl_4',
    title: 'The First Silly Fight We Now Laugh About 🩹',
    date: '2024-06-15',
    description: 'A ridiculous misunderstanding that ended with both of us giggling, eating dessert, and realizing how much we care.',
    icon: '🩹',
    photoUrl: '',
    category: 'fight',
    orderNum: 4
  },
  {
    id: 'tl_5',
    title: 'Recent Cherished Memory 🌅',
    date: '2024-08-20',
    description: 'Just holding hands, talking about our future, and realizing that home is a person, not a place.',
    icon: '🏡',
    photoUrl: '',
    category: 'recent',
    orderNum: 5
  }
];

const DEFAULT_FUTURE_DREAMS: FutureDreamItem[] = [
  {
    id: 'fd_1',
    title: 'Late Night Pajama Road Trip',
    description: 'Driving through mountain roads with heated seats and singing our favorite songs at the top of our lungs.',
    emoji: '🚗',
    targetYear: '2026',
    addedById: 'partner1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'fd_2',
    title: 'Lazy Rainy Sundays in Our Own Living Room',
    description: 'Making giant stacks of pancakes, wearing matching fuzzy socks, and binging shows without looking at the clock.',
    emoji: '🥞',
    targetYear: 'Forever',
    addedById: 'partner2',
    createdAt: new Date().toISOString()
  }
];

// Unified reactive data store with LocalStorage + Firebase Firestore synchronization
class CoupleStore {
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

  constructor() {
    this.data = this.loadLocal();
    this.initFirebaseSync();
  }

  private loadLocal() {
    try {
      const raw = localStorage.getItem('asmi_couple_store_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          settings: parsed.settings || DEFAULT_SETTINGS,
          partners: parsed.partners || DEFAULT_PARTNERS,
          countdowns: parsed.countdowns || DEFAULT_COUNTDOWNS,
          memories: parsed.memories || [],
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
      localStorage.setItem('asmi_couple_store_v2', JSON.stringify(this.data));
      localStorage.setItem('asmi_partners_backup', JSON.stringify(this.data.partners));
    } catch (e) {
      console.warn('LocalStorage quota warning:', e);
    }
    this.notify();
    this.syncToFirebase();
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
      const docRef = doc(firestoreDb, 'couple_hub', 'main_data');
      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          if (remoteData) {
            // Smart merge: retain local partner avatars/edits if remote is blank
            const mergedPartners = this.data.partners.map((localP) => {
              const remoteP = remoteData.partners?.find((rp: any) => rp.id === localP.id);
              if (!remoteP) return localP;
              return {
                ...localP,
                ...remoteP,
                avatar: remoteP.avatar || localP.avatar
              };
            });

            this.data = {
              ...this.data,
              ...remoteData,
              partners: mergedPartners.length > 0 ? mergedPartners : this.data.partners
            };
            localStorage.setItem('asmi_couple_store_v2', JSON.stringify(this.data));
            this.notify();
          }
        } else {
          // Push initial data to Firestore
          setDoc(docRef, this.data);
        }
      });
    } catch (err) {
      console.warn('Firestore sync init error:', err);
    }
  }

  private async syncToFirebase() {
    if (!firestoreDb) return;
    try {
      const docRef = doc(firestoreDb, 'couple_hub', 'main_data');
      await setDoc(docRef, this.data, { merge: true });
    } catch (err) {
      console.warn('Firestore write error:', err);
    }
  }

  // --- GETTERS & ACTIONS ---

  // Site Settings (Logo & Title)
  getSettings(): SiteSettings {
    return this.data.settings || DEFAULT_SETTINGS;
  }
  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.getSettings(), ...updates };
    this.saveLocal();
    return this.data.settings;
  }

  // Partners
  getPartners(): Partner[] {
    return this.data.partners;
  }
  updatePartner(id: string, updates: Partial<Partner>): Partner {
    this.data.partners = this.data.partners.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.saveLocal();
    return this.data.partners.find((p) => p.id === id)!;
  }

  // Countdowns
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

  // Memories (Polaroid Scrapbook)
  getMemories(): Memory[] {
    return this.data.memories;
  }
  addMemory(item: Omit<Memory, 'id' | 'likes' | 'createdAt'>): Memory {
    const created: Memory = {
      ...item,
      id: 'mem_' + Date.now(),
      likes: 0,
      createdAt: new Date().toISOString()
    };
    this.data.memories = [created, ...this.data.memories];
    this.saveLocal();
    return created;
  }
  likeMemory(id: string): Memory {
    this.data.memories = this.data.memories.map((m) =>
      m.id === id ? { ...m, likes: m.likes + 1 } : m
    );
    this.saveLocal();
    return this.data.memories.find((m) => m.id === id)!;
  }
  deleteMemory(id: string) {
    this.data.memories = this.data.memories.filter((m) => m.id !== id);
    this.saveLocal();
  }

  // Nicknames
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

  // Inside Jokes Dictionary
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

  // Comfort Doors (Open-When Sanctuary)
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
  incrementDoorUnlock(id: string): ComfortDoor {
    this.data.comfortDoors = this.data.comfortDoors.map((d) =>
      d.id === id ? { ...d, unlockedCount: (d.unlockedCount || 0) + 1 } : d
    );
    this.saveLocal();
    return this.data.comfortDoors.find((d) => d.id === id)!;
  }
  deleteComfortDoor(id: string) {
    this.data.comfortDoors = this.data.comfortDoors.filter((d) => d.id !== id);
    this.saveLocal();
  }

  // Timeline & Milestones
  getTimeline(): Milestone[] {
    return this.data.timeline;
  }
  addTimelineMilestone(item: Omit<Milestone, 'id' | 'orderNum'>): Milestone {
    const created: Milestone = {
      ...item,
      id: 'tl_' + Date.now(),
      orderNum: this.data.timeline.length + 1
    };
    this.data.timeline = [...this.data.timeline, created];
    this.saveLocal();
    return created;
  }
  deleteTimelineMilestone(id: string) {
    this.data.timeline = this.data.timeline.filter((m) => m.id !== id);
    this.saveLocal();
  }

  // Future Dreams ("The Next Chapter")
  getFutureDreams(): FutureDreamItem[] {
    return this.data.futureDreams;
  }
  addFutureDream(item: Omit<FutureDreamItem, 'id' | 'createdAt'>): FutureDreamItem {
    const created: FutureDreamItem = {
      ...item,
      id: 'fd_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.data.futureDreams = [...this.data.futureDreams, created];
    this.saveLocal();
    return created;
  }
  deleteFutureDream(id: string) {
    this.data.futureDreams = this.data.futureDreams.filter((f) => f.id !== id);
    this.saveLocal();
  }

  // Bucket List
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
    this.data.bucketList = this.data.bucketList.map((item) => {
      if (item.id === id) {
        const completed = item.completed ? 0 : 1;
        return {
          ...item,
          completed,
          completedDate: completed ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return item;
    });
    this.saveLocal();
    return this.data.bucketList.find((b) => b.id === id)!;
  }
  deleteBucketItem(id: string) {
    this.data.bucketList = this.data.bucketList.filter((b) => b.id !== id);
    this.saveLocal();
  }

  // Notes & Post-Its
  getNotes(isPostIt?: boolean): Note[] {
    if (isPostIt !== undefined) {
      return this.data.notes.filter((n) => Boolean(n.isPostIt) === isPostIt);
    }
    return this.data.notes;
  }
  addNote(item: Omit<Note, 'id' | 'createdAt'>): Note {
    const created: Note = {
      ...item,
      id: 'nt_' + Date.now(),
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

  // Love Jar
  getLoveJarWishes(): LoveJarWish[] {
    return this.data.loveJar;
  }
  getRandomLoveJarWish(): LoveJarWish | null {
    if (this.data.loveJar.length === 0) return null;
    const idx = Math.floor(Math.random() * this.data.loveJar.length);
    const wish = this.data.loveJar[idx];
    wish.drawnCount = (wish.drawnCount || 0) + 1;
    this.saveLocal();
    return wish;
  }
  addLoveJarWish(item: Omit<LoveJarWish, 'id' | 'drawnCount' | 'createdAt'>): LoveJarWish {
    const created: LoveJarWish = {
      ...item,
      id: 'lj_' + Date.now(),
      drawnCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.loveJar = [created, ...this.data.loveJar];
    this.saveLocal();
    return created;
  }
}

export const coupleStore = new CoupleStore();
