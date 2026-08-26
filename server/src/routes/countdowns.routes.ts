import { Router } from 'express';
import db from '../db/database.js';
import { broadcast } from '../websocket.js';

const router = Router();

// GET all countdowns
router.get('/', (_req, res) => {
  const countdowns = db.prepare('SELECT * FROM countdowns ORDER BY targetDate ASC').all();
  res.json(countdowns);
});

// POST create countdown
router.post('/', (req, res) => {
  const { title, targetDate, category, emoji, description } = req.body;
  if (!title || !targetDate) {
    return res.status(400).json({ error: 'Title and targetDate are required' });
  }
  const id = 'cd_' + Date.now();
  const createdAt = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO countdowns (id, title, targetDate, category, emoji, description, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(id, title, targetDate, category || 'Date Night', emoji || '💖', description || '', createdAt);
  const created = db.prepare('SELECT * FROM countdowns WHERE id = ?').get(id);

  broadcast({ type: 'COUNTDOWN_CREATED', payload: created });
  res.status(201).json(created);
});

// PUT update countdown
router.put('/:id', (req, res) => {
  const { title, targetDate, category, emoji, description } = req.body;
  const update = db.prepare(`
    UPDATE countdowns
    SET title = COALESCE(@title, title),
        targetDate = COALESCE(@targetDate, targetDate),
        category = COALESCE(@category, category),
        emoji = COALESCE(@emoji, emoji),
        description = COALESCE(@description, description)
    WHERE id = @id
  `);

  update.run({ id: req.params.id, title, targetDate, category, emoji, description });
  const updated = db.prepare('SELECT * FROM countdowns WHERE id = ?').get(req.params.id);

  broadcast({ type: 'COUNTDOWN_UPDATED', payload: updated });
  res.json(updated);
});

// DELETE countdown
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM countdowns WHERE id = ?').run(req.params.id);
  broadcast({ type: 'COUNTDOWN_DELETED', payload: { id: req.params.id } });
  res.json({ success: true, id: req.params.id });
});

export default router;
