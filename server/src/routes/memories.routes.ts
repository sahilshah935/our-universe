import { Router } from 'express';
import db from '../db/database.js';
import { broadcast } from '../websocket.js';

const router = Router();

// GET all memories
router.get('/', (req, res) => {
  const { chapter } = req.query;
  let query = 'SELECT * FROM memories';
  let params: any[] = [];

  if (chapter && chapter !== 'All') {
    query += ' WHERE chapter = ?';
    params.push(chapter);
  }

  query += ' ORDER BY pinned DESC, date DESC';
  const memories = db.prepare(query).all(...params);
  res.json(memories);
});

// POST new memory
router.post('/', (req, res) => {
  const { title, description, date, location, chapter, mood, imageUrl, authorId, pinned } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ error: 'Title and image are required' });
  }

  const id = 'mem_' + Date.now();
  const createdAt = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO memories (id, title, description, date, location, chapter, mood, imageUrl, authorId, pinned, likes, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `);

  insert.run(
    id,
    title,
    description || '',
    date || new Date().toISOString().split('T')[0],
    location || '',
    chapter || 'Chapter 1: The Beginning',
    mood || 'Happy ✨',
    imageUrl,
    authorId || 'partner1',
    pinned ? 1 : 0,
    createdAt
  );

  const created = db.prepare('SELECT * FROM memories WHERE id = ?').get(id);
  broadcast({ type: 'MEMORY_CREATED', payload: created });
  res.status(201).json(created);
});

// PUT update memory
router.put('/:id', (req, res) => {
  const { title, description, date, location, chapter, mood, imageUrl, pinned } = req.body;
  const update = db.prepare(`
    UPDATE memories
    SET title = COALESCE(@title, title),
        description = COALESCE(@description, description),
        date = COALESCE(@date, date),
        location = COALESCE(@location, location),
        chapter = COALESCE(@chapter, chapter),
        mood = COALESCE(@mood, mood),
        imageUrl = COALESCE(@imageUrl, imageUrl),
        pinned = COALESCE(@pinned, pinned)
    WHERE id = @id
  `);

  update.run({ id: req.params.id, title, description, date, location, chapter, mood, imageUrl, pinned });
  const updated = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id);
  broadcast({ type: 'MEMORY_UPDATED', payload: updated });
  res.json(updated);
});

// POST like memory
router.post('/:id/like', (req, res) => {
  db.prepare('UPDATE memories SET likes = likes + 1 WHERE id = ?').run(req.params.id);
  const updated = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id);
  broadcast({ type: 'MEMORY_LIKED', payload: updated });
  res.json(updated);
});

// DELETE memory
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM memories WHERE id = ?').run(req.params.id);
  broadcast({ type: 'MEMORY_DELETED', payload: { id: req.params.id } });
  res.json({ success: true, id: req.params.id });
});

export default router;
