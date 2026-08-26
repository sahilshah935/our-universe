import { Router } from 'express';
import db from '../db/database.js';
import { broadcast } from '../websocket.js';

const router = Router();

// GET all bucket list items
router.get('/', (_req, res) => {
  const items = db.prepare('SELECT * FROM bucket_list ORDER BY completed ASC, createdAt DESC').all();
  res.json(items);
});

// POST new bucket list item
router.post('/', (req, res) => {
  const { title, category, addedById } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = 'bl_' + Date.now();
  const createdAt = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO bucket_list (id, title, category, completed, completedDate, completedPhotoUrl, addedById, createdAt)
    VALUES (?, ?, ?, 0, null, null, ?, ?)
  `);

  insert.run(id, title, category || 'Adventure', addedById || 'partner1', createdAt);
  const created = db.prepare('SELECT * FROM bucket_list WHERE id = ?').get(id);

  broadcast({ type: 'BUCKETLIST_CREATED', payload: created });
  res.status(201).json(created);
});

// PATCH toggle completed
router.patch('/:id/toggle', (req, res) => {
  const item = db.prepare('SELECT * FROM bucket_list WHERE id = ?').get(req.params.id) as any;
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const newCompleted = item.completed ? 0 : 1;
  const completedDate = newCompleted ? new Date().toISOString().split('T')[0] : null;

  db.prepare(`
    UPDATE bucket_list 
    SET completed = ?, completedDate = ?
    WHERE id = ?
  `).run(newCompleted, completedDate, req.params.id);

  const updated = db.prepare('SELECT * FROM bucket_list WHERE id = ?').get(req.params.id);
  broadcast({ type: 'BUCKETLIST_TOGGLED', payload: updated });
  res.json(updated);
});

// DELETE item
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM bucket_list WHERE id = ?').run(req.params.id);
  broadcast({ type: 'BUCKETLIST_DELETED', payload: { id: req.params.id } });
  res.json({ success: true, id: req.params.id });
});

export default router;
