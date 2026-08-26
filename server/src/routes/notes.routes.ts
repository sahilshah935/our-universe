import { Router } from 'express';
import db from '../db/database.js';
import { broadcast } from '../websocket.js';

const router = Router();

// GET all notes
router.get('/', (req, res) => {
  const { isPostIt } = req.query;
  let query = 'SELECT * FROM notes';
  let params: any[] = [];

  if (isPostIt !== undefined) {
    query += ' WHERE isPostIt = ?';
    params.push(isPostIt === 'true' || isPostIt === '1' ? 1 : 0);
  }

  query += ' ORDER BY createdAt DESC';
  const notes = db.prepare(query).all(...params) as any[];

  const now = new Date().getTime();
  const processed = notes.map((n) => {
    // If locked and unlockAt is in future, mask content unless specifically authored
    const isCurrentlyLocked = n.isLocked && n.unlockAt && new Date(n.unlockAt).getTime() > now;
    return {
      ...n,
      isCurrentlyLocked: !!isCurrentlyLocked
    };
  });

  res.json(processed);
});

// POST new note or sticky post-it
router.post('/', (req, res) => {
  const { title, content, tag, authorId, isLocked, unlockAt, isPostIt, color, posX, posY } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const id = (isPostIt ? 'postit_' : 'note_') + Date.now();
  const createdAt = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO notes (id, title, content, tag, authorId, isLocked, unlockAt, isPostIt, color, posX, posY, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    title || null,
    content,
    tag || (isPostIt ? 'Sticky Note' : 'General'),
    authorId || 'partner1',
    isLocked ? 1 : 0,
    unlockAt || null,
    isPostIt ? 1 : 0,
    color || 'yellow',
    posX || 0,
    posY || 0,
    createdAt
  );

  const created = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  broadcast({ type: isPostIt ? 'POSTIT_CREATED' : 'NOTE_CREATED', payload: created });
  res.status(201).json(created);
});

// PUT update note or post-it position
router.put('/:id', (req, res) => {
  const { title, content, tag, isLocked, unlockAt, color, posX, posY } = req.body;
  const update = db.prepare(`
    UPDATE notes
    SET title = COALESCE(@title, title),
        content = COALESCE(@content, content),
        tag = COALESCE(@tag, tag),
        isLocked = COALESCE(@isLocked, isLocked),
        unlockAt = COALESCE(@unlockAt, unlockAt),
        color = COALESCE(@color, color),
        posX = COALESCE(@posX, posX),
        posY = COALESCE(@posY, posY)
    WHERE id = @id
  `);

  update.run({ id: req.params.id, title, content, tag, isLocked, unlockAt, color, posX, posY });
  const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  broadcast({ type: 'NOTE_UPDATED', payload: updated });
  res.json(updated);
});

// DELETE note
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  broadcast({ type: 'NOTE_DELETED', payload: { id: req.params.id } });
  res.json({ success: true, id: req.params.id });
});

export default router;
