# 💖 Us &bull; The Cozy Couple Hub

> An ultra-aesthetic, full-stack couple dashboard & memory sanctuary built for two. Designed as an intimate romantic space and an engineering showcase.

---

## 🌟 Key Features

1. **Dual Login & Persona Switcher**:
   - Personalized dashboards for **Sahil** and **Asmi** with custom avatars, nicknames, roles, theme colors, status emojis, and bios.
   - Quick one-click persona switcher on the navigation bar.
2. **Real-Time Remote Touch & Heart Showers (WebSockets)**:
   - Click **"Send Love Touch"** to blow kisses 💋, send tight hugs 🤗, playful pokes 👉, or "missing you" notes 🥺.
   - Instantly showers floating hearts and plays gentle harmonic synthesized chimes across screens in real time.
3. **"Days We've Loved" Live Ticker & Countdowns**:
   - High-precision live ticker tracking **Years, Months, Days, Hours, Minutes, and Seconds** together since Day 1.
   - Real-time ticking countdown cards for Anniversaries, Date Nights, Trips, and custom milestones.
4. **Interactive Polaroid Scrapbook**:
   - Realistic 3D tiltable polaroid photos with tape effects, mood tags, date stamps, and like counters.
   - **Click to Flip**: Flip any polaroid to read the secret handwritten story on the back.
   - Organized chapters: *The Beginning, Cozy Dates, Adventures & Trips, Silly Moments, Celebrations*.
   - Photo upload support with instant thumbnail generation and full-screen lightbox zoom.
5. **Love Journal & Time Capsules**:
   - **Love Letters**: Categorized diary notes with tags like *Why I Love You*, *Random Midnight Thoughts*, *Gratitude*, *Sorry / Hug Me*.
   - **Time Capsules**: Time-locked letters sealed with a digital wax stamp that cannot be opened until the target anniversary/date arrives!
   - **Fridge Post-It Board**: Interactive sticky notes board in 5 pastel colors.
6. **Date Night Roulette & Mystery Scratch Cards**:
   - **Spin the Roulette Wheel**: Spontaneous date idea picker when you can't decide what to do tonight!
   - **Mystery Scratch-Off Cards**: Tap/scratch surprise activity cards.
7. **Daily "Question for Us" (Double-Blind Secret Prompts)**:
   - Daily thought-provoking couple question.
   - Answers are hidden until **both** partners submit their answer, unlocking them simultaneously with confetti!
8. **Virtual Origami Love Jar**:
   - Pull sweet 3D folded origami stars with compliments, reasons for love, and promises when having a rough day.
   - Add new reasons to the jar anytime.
9. **Cozy Ambient Soundscapes & Lo-Fi Synthesizer**:
   - Ambient sound generator with gentle rain, crackling warm fireplace, and cozy cafe background noise.
10. **Printable Couple Keepsake Memory Book**:
    - Generates a printable memory book with your milestones and photo album ready for PDF export or printing.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# At root directory:
npm install
npm run install --prefix server
npm run install --prefix client
```

### 2. Start Development Mode (Both Frontend & Backend)
```bash
npm run dev
```
- Frontend runs on **`http://localhost:3000`**
- Backend runs on **`http://localhost:5000`**

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide React, Canvas Confetti, Web Audio API.
- **Backend**: Node.js, Express, TypeScript, Better-SQLite3, WebSockets (`ws`), Multer.
- **Database**: SQLite (persisted locally under `server/data/couple_hub.db`).

---

Made with ❤️ by Sahil for Asmi
