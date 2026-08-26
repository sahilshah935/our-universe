import { Router } from 'express';
import db from '../db/database.js';
import { broadcast } from '../websocket.js';

const router = Router();

// GET all milestones
router.get('/', (_req, res) => {
  const milestones = db.prepare('SELECT * FROM milestones ORDER BY date ASC, orderNum ASC').all();
  res.json(milestones);
});

// POST new milestone
router.post('/', (req, res) => {
  const { title, date, description, icon } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

  const id = 'ms_' + Date.now();
  const maxOrder = db.prepare('SELECT MAX(orderNum) as maxO FROM milestones').get() as { maxO: number | null };
  const orderNum = (maxOrder?.maxO || 0) + 1;

  const insert = db.prepare(`
    INSERT INTO milestones (id, title, date, description, icon, orderNum)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insert.run(id, title, date, description || '', icon || '🌟', orderNum);
  const created = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id);

  broadcast({ type: 'MILESTONE_CREATED', payload: created });
  res.status(201).json(created);
});

// DELETE milestone
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM milestones WHERE id = ?').run(req.params.id);
  broadcast({ type: 'MILESTONE_DELETED', payload: { id: req.params.id } });
  res.json({ success: true, id: req.params.id });
});

export default router;
