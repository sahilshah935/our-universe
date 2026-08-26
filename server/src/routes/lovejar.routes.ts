import { Router } from 'express';
import db from '../db/database.js';
import { broadcast } from '../websocket.js';

const router = Router();

// GET random love jar wish
router.get('/random', (_req, res) => {
  const wish = db.prepare('SELECT * FROM love_jar ORDER BY RANDOM() LIMIT 1').get() as any;
  if (!wish) return res.status(404).json({ error: 'Love jar is empty' });

  // Increment drawn count
  db.prepare('UPDATE love_jar SET drawnCount = drawnCount + 1 WHERE id = ?').run(wish.id);
  res.json(wish);
});

// GET all love jar wishes
router.get('/', (_req, res) => {
  const wishes = db.prepare('SELECT * FROM love_jar ORDER BY createdAt DESC').all();
  res.json(wishes);
});

// POST new wish
router.post('/', (req, res) => {
  const { message, category, authorId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const id = 'lj_' + Date.now();
  const createdAt = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO love_jar (id, message, category, authorId, drawnCount, createdAt)
    VALUES (?, ?, ?, ?, 0, ?)
  `);

  insert.run(id, message, category || 'Compliment', authorId || 'partner1', createdAt);
  const created = db.prepare('SELECT * FROM love_jar WHERE id = ?').get(id);

  broadcast({ type: 'LOVEJAR_ADDED', payload: created });
  res.status(201).json(created);
});

export default router;
