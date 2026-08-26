import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'couple_hub.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance and durability
db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nickname TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT NOT NULL,
      themeColor TEXT NOT NULL,
      bio TEXT,
      status TEXT,
      statusEmoji TEXT,
      lastPokeAt TEXT,
      pin TEXT DEFAULT '1234'
    );

    CREATE TABLE IF NOT EXISTS countdowns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      targetDate TEXT NOT NULL,
      category TEXT NOT NULL,
      emoji TEXT NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      location TEXT,
      chapter TEXT NOT NULL,
      mood TEXT,
      imageUrl TEXT NOT NULL,
      authorId TEXT NOT NULL,
      pinned INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT NOT NULL,
      tag TEXT NOT NULL,
      authorId TEXT NOT NULL,
      isLocked INTEGER DEFAULT 0,
      unlockAt TEXT,
      isPostIt INTEGER DEFAULT 0,
      color TEXT DEFAULT 'yellow',
      posX REAL DEFAULT 0,
      posY REAL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bucket_list (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completedDate TEXT,
      completedPhotoUrl TEXT,
      addedById TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_questions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      question TEXT NOT NULL,
      partner1Answer TEXT,
      partner2Answer TEXT,
      revealed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS love_jar (
      id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      category TEXT NOT NULL,
      authorId TEXT NOT NULL,
      drawnCount INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      icon TEXT NOT NULL,
      orderNum INTEGER NOT NULL
    );
  `);

  // Seed default partners if empty
  const partnerCount = db.prepare('SELECT COUNT(*) as count FROM partners').get() as { count: number };
  if (partnerCount.count === 0) {
    const insertPartner = db.prepare(`
      INSERT INTO partners (id, name, nickname, role, avatar, themeColor, bio, status, statusEmoji, pin)
      VALUES (@id, @name, @nickname, @role, @avatar, @themeColor, @bio, @status, @statusEmoji, @pin)
    `);

    insertPartner.run({
      id: 'partner1',
      name: 'Sahil',
      nickname: 'Bubu / Handsome',
      role: 'Dev Guy & Professional Cuddler',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      themeColor: '#4f46e5',
      bio: 'Coding your happiness one day at a time ❤️',
      status: 'Thinking about our next date 💭',
      statusEmoji: '☕',
      pin: '1234'
    });

    insertPartner.run({
      id: 'partner2',
      name: 'Asmi',
      nickname: 'Dudu / Cutie Pie',
      role: 'Chief Happiness Officer & Princess',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      themeColor: '#ec4899',
      bio: 'Stealing your hoodies and your heart forever ✨',
      status: 'Craving Boba & your hugs 🧋',
      statusEmoji: '🌸',
      pin: '1234'
    });
  }

  // Seed Milestones
  const milestoneCount = db.prepare('SELECT COUNT(*) as count FROM milestones').get() as { count: number };
  if (milestoneCount.count === 0) {
    const insertMilestone = db.prepare(`
      INSERT INTO milestones (id, title, date, description, icon, orderNum)
      VALUES (@id, @title, @date, @description, @icon, @orderNum)
    `);

    const milestones = [
      { id: 'm1', title: 'First Conversation', date: '2024-02-14', description: 'When a simple "Hey" turned into hours of endless late-night chats.', icon: '💬', orderNum: 1 },
      { id: 'm2', title: 'Our First Official Date', date: '2024-03-01', description: 'That cozy cafe where we forgot the time and drank cold coffee.', icon: '☕', orderNum: 2 },
      { id: 'm3', title: 'Said "I Love You"', date: '2024-05-20', description: 'Under the starlit sky, the easiest words ever spoken.', icon: '💖', orderNum: 3 },
      { id: 'm4', title: 'First Trip Together', date: '2024-08-15', description: 'Mountains, music playlists, and unforgettable sunsets.', icon: '✈️', orderNum: 4 },
      { id: 'm5', title: '1 Year Anniversary', date: '2025-02-14', description: '365 days of laughter, warmth, and growing together.', icon: '🥂', orderNum: 5 },
      { id: 'm6', title: 'Building Our Future', date: '2026-08-26', description: 'Every single day getting closer to forever.', icon: '🏡', orderNum: 6 }
    ];
    for (const m of milestones) insertMilestone.run(m);
  }

  // Seed Countdowns
  const countCountdowns = db.prepare('SELECT COUNT(*) as count FROM countdowns').get() as { count: number };
  if (countCountdowns.count === 0) {
    const insertCountdown = db.prepare(`
      INSERT INTO countdowns (id, title, targetDate, category, emoji, description, createdAt)
      VALUES (@id, @title, @targetDate, @category, @emoji, @description, @createdAt)
    `);

    const now = new Date();
    const nextWeekend = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T19:00:00';
    const nextTrip = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:00:00';
    const anniversary = new Date(now.getFullYear() + (now.getMonth() > 1 ? 1 : 0), 1, 14, 0, 0, 0).toISOString();

    insertCountdown.run({
      id: 'cd1',
      title: 'Our Next Cozy Dinner Date',
      targetDate: nextWeekend,
      category: 'Date Night',
      emoji: '🍝',
      description: 'Candlelight, pasta, and unlimited dessert!',
      createdAt: new Date().toISOString()
    });

    insertCountdown.run({
      id: 'cd2',
      title: 'Weekend Getaway Trip',
      targetDate: nextTrip,
      category: 'Travel',
      emoji: '🏖️',
      description: 'Beach breeze, cozy cabin, and road trip snacks.',
      createdAt: new Date().toISOString()
    });

    insertCountdown.run({
      id: 'cd3',
      title: 'Valentine Anniversary',
      targetDate: anniversary,
      category: 'Anniversary',
      emoji: '💍',
      description: 'Celebrating the day we became us.',
      createdAt: new Date().toISOString()
    });
  }

  // Seed Memories / Scrapbook
  const memoryCount = db.prepare('SELECT COUNT(*) as count FROM memories').get() as { count: number };
  if (memoryCount.count === 0) {
    const insertMemory = db.prepare(`
      INSERT INTO memories (id, title, description, date, location, chapter, mood, imageUrl, authorId, pinned, likes, createdAt)
      VALUES (@id, @title, @description, @date, @location, @chapter, @mood, @imageUrl, @authorId, @pinned, @likes, @createdAt)
    `);

    const memories = [
      {
        id: 'mem1',
        title: 'The First Sunset We Shared',
        description: 'You rested your head on my shoulder and the sky turned into pastel cotton candy.',
        date: '2024-03-15',
        location: 'Sunset Point Pier',
        chapter: 'Chapter 1: The Beginning',
        mood: 'Magical 🌅',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
        authorId: 'partner1',
        pinned: 1,
        likes: 12,
        createdAt: new Date().toISOString()
      },
      {
        id: 'mem2',
        title: 'Rainy Cafe & Warm Croissants',
        description: 'Pouring rain outside, sharing headphones, listening to our favorite indie songs.',
        date: '2024-06-22',
        location: 'Cafe Roastery',
        chapter: 'Cozy Dates',
        mood: 'Warm & Cozy ☕',
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
        authorId: 'partner2',
        pinned: 1,
        likes: 8,
        createdAt: new Date().toISOString()
      },
      {
        id: 'mem3',
        title: 'Stargazing On The Car Hood',
        description: 'Hot cocoa in thermal mugs, pointing at constellations, making quiet wishes.',
        date: '2024-10-05',
        location: 'Pine Hills Overlook',
        chapter: 'Adventures & Trips',
        mood: 'Dreamy ✨',
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800',
        authorId: 'partner1',
        pinned: 0,
        likes: 15,
        createdAt: new Date().toISOString()
      },
      {
        id: 'mem4',
        title: 'Baking Disasters & Laughs',
        description: 'Flour everywhere on our noses, burnt cookies, but the best belly laughs ever.',
        date: '2024-12-18',
        location: 'Our Kitchen',
        chapter: 'Silly Moments',
        mood: 'Playful 😂',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
        authorId: 'partner2',
        pinned: 0,
        likes: 9,
        createdAt: new Date().toISOString()
      }
    ];
    for (const m of memories) insertMemory.run(m);
  }

  // Seed Notes / Time Capsules
  const noteCount = db.prepare('SELECT COUNT(*) as count FROM notes').get() as { count: number };
  if (noteCount.count === 0) {
    const insertNote = db.prepare(`
      INSERT INTO notes (id, title, content, tag, authorId, isLocked, unlockAt, isPostIt, color, posX, posY, createdAt)
      VALUES (@id, @title, @content, @tag, @authorId, @isLocked, @unlockAt, @isPostIt, @color, @posX, @posY, @createdAt)
    `);

    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // Post-It Notes on Fridge
    insertNote.run({
      id: 'p1',
      title: null,
      content: 'Don’t forget to drink water today my sweet girl! I packed your favorite gummies 🍬',
      tag: 'Sticky Note',
      authorId: 'partner1',
      isLocked: 0,
      unlockAt: null,
      isPostIt: 1,
      color: 'yellow',
      posX: 25,
      posY: 40,
      createdAt: new Date().toISOString()
    });

    insertNote.run({
      id: 'p2',
      title: null,
      content: 'You looked so handsome in that jacket yesterday! Can’t wait for our weekend movie night 🥰',
      tag: 'Sticky Note',
      authorId: 'partner2',
      isLocked: 0,
      unlockAt: null,
      isPostIt: 1,
      color: 'pink',
      posX: 320,
      posY: 80,
      createdAt: new Date().toISOString()
    });

    insertNote.run({
      id: 'p3',
      title: null,
      content: 'I love you to the moon and beyond, in every universe 🚀✨',
      tag: 'Sticky Note',
      authorId: 'partner1',
      isLocked: 0,
      unlockAt: null,
      isPostIt: 1,
      color: 'purple',
      posX: 180,
      posY: 220,
      createdAt: new Date().toISOString()
    });

    // Journal Entry
    insertNote.run({
      id: 'n1',
      title: 'Why You Are My Safe Harbor',
      content: 'Whenever the world gets loud or chaotic, coming home to your voice melts all the stress away. You have this quiet way of making everything feel gentle and right. Thank you for being you.',
      tag: 'Why I Love You',
      authorId: 'partner1',
      isLocked: 0,
      unlockAt: null,
      isPostIt: 0,
      color: 'rose',
      posX: 0,
      posY: 0,
      createdAt: new Date().toISOString()
    });

    // Time Capsule Note
    insertNote.run({
      id: 'tc1',
      title: 'Secret Time Capsule: Open in 2 Weeks!',
      content: 'Surprise! If you are reading this, the time has finally arrived. I have planned a secret surprise date for us this Saturday at 6 PM. Dress cute and don’t ask questions! 💌',
      tag: 'Surprise / Time Capsule',
      authorId: 'partner1',
      isLocked: 1,
      unlockAt: futureDate,
      isPostIt: 0,
      color: 'amber',
      posX: 0,
      posY: 0,
      createdAt: new Date().toISOString()
    });
  }

  // Seed Bucket List
  const bucketCount = db.prepare('SELECT COUNT(*) as count FROM bucket_list').get() as { count: number };
  if (bucketCount.count === 0) {
    const insertBucket = db.prepare(`
      INSERT INTO bucket_list (id, title, category, completed, completedDate, completedPhotoUrl, addedById, createdAt)
      VALUES (@id, @title, @category, @completed, @completedDate, @completedPhotoUrl, @addedById, @createdAt)
    `);

    const bucketItems = [
      { id: 'b1', title: 'Watch Northern Lights from a glass igloo', category: 'Travel ✈️', completed: 0, completedDate: null, completedPhotoUrl: null, addedById: 'partner2', createdAt: new Date().toISOString() },
      { id: 'b2', title: 'Take a pottery class and make matching mugs', category: 'Activities 🎨', completed: 1, completedDate: '2024-07-12', completedPhotoUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=400', addedById: 'partner1', createdAt: new Date().toISOString() },
      { id: 'b3', title: 'Cook a 4-course Italian dinner from scratch', category: 'Foodie 🍝', completed: 1, completedDate: '2024-11-20', completedPhotoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400', addedById: 'partner2', createdAt: new Date().toISOString() },
      { id: 'b4', title: 'Camp under the stars in a national park', category: 'Adventure 🏕️', completed: 0, completedDate: null, completedPhotoUrl: null, addedById: 'partner1', createdAt: new Date().toISOString() },
      { id: 'b5', title: 'Adopt a furry pet together', category: 'Future Dreams 🐾', completed: 0, completedDate: null, completedPhotoUrl: null, addedById: 'partner2', createdAt: new Date().toISOString() },
      { id: 'b6', title: 'Build our own dream living room pillow fort', category: 'Cozy Days 🛋️', completed: 0, completedDate: null, completedPhotoUrl: null, addedById: 'partner1', createdAt: new Date().toISOString() }
    ];
    for (const b of bucketItems) insertBucket.run(b);
  }

  // Seed Love Jar
  const jarCount = db.prepare('SELECT COUNT(*) as count FROM love_jar').get() as { count: number };
  if (jarCount.count === 0) {
    const insertJar = db.prepare(`
      INSERT INTO love_jar (id, message, category, authorId, drawnCount, createdAt)
      VALUES (@id, @message, @category, @authorId, @drawnCount, @createdAt)
    `);

    const wishes = [
      { id: 'j1', message: 'The way your eyes crinkle when you genuinely laugh is the most beautiful thing in the world.', category: 'Compliment', authorId: 'partner1', drawnCount: 2, createdAt: new Date().toISOString() },
      { id: 'j2', message: 'Thank you for always making sure I eat well and for making me warm tea when I am tired.', category: 'Gratitude', authorId: 'partner2', drawnCount: 1, createdAt: new Date().toISOString() },
      { id: 'j3', message: 'I love how passionate you get when you talk about things you love.', category: 'Compliment', authorId: 'partner1', drawnCount: 4, createdAt: new Date().toISOString() },
      { id: 'j4', message: 'No matter how tough today was, remember you are capable of amazing things and I am always by your side.', category: 'Encouragement', authorId: 'partner1', drawnCount: 3, createdAt: new Date().toISOString() },
      { id: 'j5', message: 'You give the warmest, safest hugs in the universe.', category: 'Love', authorId: 'partner2', drawnCount: 5, createdAt: new Date().toISOString() },
      { id: 'j6', message: 'I will always choose you, over and over, without pause or doubt.', category: 'Promise', authorId: 'partner1', drawnCount: 0, createdAt: new Date().toISOString() }
    ];
    for (const j of wishes) insertJar.run(j);
  }

  // Seed Daily Question
  const todayStr = new Date().toISOString().split('T')[0];
  const qCheck = db.prepare('SELECT * FROM daily_questions WHERE date = ?').get(todayStr);
  if (!qCheck) {
    db.prepare(`
      INSERT INTO daily_questions (id, date, question, partner1Answer, partner2Answer, revealed)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'q_today',
      todayStr,
      'What is one tiny moment with me this week that brought a smile to your face?',
      'When you randomly started dancing while making breakfast yesterday morning!',
      'When you reached for my hand while crossing the street without even thinking.',
      1
    );
  }
}

export default db;
