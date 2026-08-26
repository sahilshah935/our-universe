import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initDatabase } from './db/database.js';
import { initWebSocket } from './websocket.js';

import partnersRouter from './routes/partners.routes.js';
import countdownsRouter from './routes/countdowns.routes.js';
import memoriesRouter from './routes/memories.routes.js';
import notesRouter from './routes/notes.routes.js';
import bucketlistRouter from './routes/bucketlist.routes.js';
import questionsRouter from './routes/questions.routes.js';
import lovejarRouter from './routes/lovejar.routes.js';
import milestonesRouter from './routes/milestones.routes.js';
import uploadRouter from './routes/upload.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema & seed
initDatabase();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize WebSockets
initWebSocket(server);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Static uploads folder
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/partners', partnersRouter);
app.use('/api/countdowns', countdownsRouter);
app.use('/api/memories', memoriesRouter);
app.use('/api/notes', notesRouter);
app.use('/api/bucketlist', bucketlistRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/lovejar', lovejarRouter);
app.use('/api/milestones', milestonesRouter);
app.use('/api/upload', uploadRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), app: 'Cozy Couple Hub' });
});

server.listen(PORT, () => {
  console.log(`✨ Cozy Couple Hub Server running on http://localhost:${PORT}`);
});
