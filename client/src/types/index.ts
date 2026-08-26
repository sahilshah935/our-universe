export interface Partner {
  id: string;
  name: string;
  nickname: string;
  role: string;
  avatar: string;
  themeColor: string;
  bio?: string;
  status?: string;
  statusEmoji?: string;
  lastPokeAt?: string;
  pin?: string;
}

export interface Countdown {
  id: string;
  title: string;
  targetDate: string;
  category: string;
  emoji: string;
  description?: string;
  createdAt: string;
}

export interface Memory {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  chapter: string;
  mood?: string;
  imageUrl: string;
  authorId: string;
  pinned: number;
  likes: number;
  createdAt: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  tag: string;
  authorId: string;
  isLocked: number;
  unlockAt?: string;
  isPostIt: number;
  color: string;
  posX?: number;
  posY?: number;
  isCurrentlyLocked?: boolean;
  createdAt: string;
}

export interface BucketListItem {
  id: string;
  title: string;
  category: string;
  completed: number;
  completedDate?: string;
  completedPhotoUrl?: string;
  addedById: string;
  createdAt: string;
}

export interface LoveJarWish {
  id: string;
  message: string;
  category: string;
  authorId: string;
  drawnCount: number;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description?: string;
  icon: string;
  photoUrl?: string;
  category?: 'meeting' | 'date' | 'joke' | 'fight' | 'recent' | 'general';
  orderNum: number;
}

export interface PokeEvent {
  targetPartnerId: string;
  senderId: string;
  senderName: string;
  pokeType: 'kiss' | 'hug' | 'poke' | 'miss_you';
  message: string;
  timestamp: string;
}

export interface NicknameItem {
  id: string;
  forPartnerId: 'partner1' | 'partner2' | 'both';
  name: string;
  explanation: string;
  tag: string;
  bgGradient: string;
  addedById: string;
  createdAt: string;
}

export interface InsideJokeItem {
  id: string;
  word: string;
  pronunciation?: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  origin?: string;
  addedById: string;
  createdAt: string;
}

export interface ComfortDoor {
  id: string;
  title: string; // e.g. "Open when you're sad"
  subtitle?: string;
  emoji: string;
  doorColor: string; // theme color
  targetPartnerId?: string;
  letter: string;
  memeUrl?: string;
  songTitle?: string;
  songUrl?: string; // Spotify / YouTube / audio link
  audioNoteUrl?: string;
  unlockedCount: number;
  authorId: string;
  createdAt: string;
}

export interface FutureDreamItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  targetYear?: string;
  addedById: string;
  createdAt: string;
}

export interface SiteSettings {
  title: string;
  subtitle: string;
  logoType: 'icon' | 'image';
  logoEmoji: string;
  logoImageUrl?: string;
  themeGradient: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL?: string;
}
