import { Router } from 'express';
import db from '../db/database.js';
import { broadcast } from '../websocket.js';

const router = Router();

// GET all partners
router.get('/', (_req, res) => {
  const partners = db.prepare('SELECT id, name, nickname, role, avatar, themeColor, bio, status, statusEmoji, lastPokeAt, pin FROM partners').all();
  res.json(partners);
});

// GET single partner
router.get('/:id', (req, res) => {
  const partner = db.prepare('SELECT id, name, nickname, role, avatar, themeColor, bio, status, statusEmoji, lastPokeAt, pin FROM partners WHERE id = ?').get(req.params.id);
  if (!partner) return res.status(404).json({ error: 'Partner not found' });
  res.json(partner);
});

// UPDATE partner profile
router.put('/:id', (req, res) => {
  const { name, nickname, role, avatar, themeColor, bio, status, statusEmoji, pin } = req.body;
  const update = db.prepare(`
    UPDATE partners 
    SET name = COALESCE(@name, name),
        nickname = COALESCE(@nickname, nickname),
        role = COALESCE(@role, role),
        avatar = COALESCE(@avatar, avatar),
        themeColor = COALESCE(@themeColor, themeColor),
        bio = COALESCE(@bio, bio),
        status = COALESCE(@status, status),
        statusEmoji = COALESCE(@statusEmoji, statusEmoji),
        pin = COALESCE(@pin, pin)
    WHERE id = @id
  `);

  update.run({ id: req.params.id, name, nickname, role, avatar, themeColor, bio, status, statusEmoji, pin });
  const updated = db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
  
  broadcast({
    type: 'PARTNER_UPDATED',
    payload: updated
  });

  res.json(updated);
});

// POKE / SEND KISS / SEND HUG
router.post('/:id/poke', (req, res) => {
  const { senderId, pokeType, message } = req.body; // pokeType: 'kiss' | 'hug' | 'poke' | 'miss_you'
  const now = new Date().toISOString();

  db.prepare('UPDATE partners SET lastPokeAt = ? WHERE id = ?').run(now, req.params.id);

  const sender = db.prepare('SELECT name, nickname FROM partners WHERE id = ?').get(senderId) as { name: string; nickname: string } | undefined;

  broadcast({
    type: 'LOVE_POKE',
    payload: {
      targetPartnerId: req.params.id,
      senderId,
      senderName: sender?.name || 'Your Love',
      pokeType: pokeType || 'kiss',
      message: message || (pokeType === 'hug' ? 'sent you a tight warm hug! 🤗' : pokeType === 'miss_you' ? 'is missing you so much right now 🥺' : 'blew you a sweet kiss! 💋'),
      timestamp: now
    }
  });

  res.json({ success: true, timestamp: now });
});

export default router;
