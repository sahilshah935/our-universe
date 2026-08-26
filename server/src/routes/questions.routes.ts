import { Router } from 'express';
import db from '../db/database.js';
import { broadcast } from '../websocket.js';

const router = Router();

const DEFAULT_QUESTIONS = [
  'What is one tiny moment with me this week that brought a smile to your face?',
  'If we had 24 hours to do whatever we wanted without any budget, where would we go?',
  'What was your exact first impression of me the very first time we spoke?',
  'What song instantly reminds you of us whenever it plays?',
  'What is your favorite cuddle position?',
  'What is one dream or goal you want us to achieve together in the next year?',
  'What is the sweetest thing I have ever done for you?',
  'If our love story was a movie, what would the genre and title be?',
  'What is a silly quirk of mine that you secretly find adorable?'
];

// GET today's question
router.get('/today', (_req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  let q = db.prepare('SELECT * FROM daily_questions WHERE date = ?').get(todayStr) as any;

  if (!q) {
    // Generate a new question for today
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const questionText = DEFAULT_QUESTIONS[dayOfYear % DEFAULT_QUESTIONS.length];
    const id = 'q_' + todayStr;

    db.prepare(`
      INSERT INTO daily_questions (id, date, question, partner1Answer, partner2Answer, revealed)
      VALUES (?, ?, ?, null, null, 0)
    `).run(id, todayStr, questionText);

    q = db.prepare('SELECT * FROM daily_questions WHERE date = ?').get(todayStr);
  }

  res.json(q);
});

// POST submit answer
router.post('/today/answer', (req, res) => {
  const { partnerId, answer } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  let q = db.prepare('SELECT * FROM daily_questions WHERE date = ?').get(todayStr) as any;
  if (!q) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const isPartner1 = partnerId === 'partner1';
  if (isPartner1) {
    db.prepare('UPDATE daily_questions SET partner1Answer = ? WHERE id = ?').run(answer, q.id);
  } else {
    db.prepare('UPDATE daily_questions SET partner2Answer = ? WHERE id = ?').run(answer, q.id);
  }

  // Check if both have answered to reveal
  const updated = db.prepare('SELECT * FROM daily_questions WHERE id = ?').get(q.id) as any;
  if (updated.partner1Answer && updated.partner2Answer) {
    db.prepare('UPDATE daily_questions SET revealed = 1 WHERE id = ?').run(q.id);
    updated.revealed = 1;
  }

  broadcast({ type: 'QUESTION_ANSWERED', payload: updated });
  res.json(updated);
});

// GET question history
router.get('/history', (_req, res) => {
  const history = db.prepare('SELECT * FROM daily_questions WHERE revealed = 1 ORDER BY date DESC').all();
  res.json(history);
});

export default router;
