import cors from 'cors';
import express from 'express';
import { conversationsRouter } from './routes/conversations.js';
import { messagesRouter } from './routes/messages.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/conversations', conversationsRouter);
  app.use('/api/messages', messagesRouter);

  app.use(errorHandler);

  return app;
}
