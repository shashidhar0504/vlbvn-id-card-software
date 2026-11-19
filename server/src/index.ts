import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PORT, UPLOAD_DIR, GENERATED_DIR } from './config.js';
import { initDatabase } from './db/index.js';

import authRouter from './routes/auth.js';
import applicationsRouter from './routes/applications.js';
import membersRouter from './routes/members.js';
import templatesRouter from './routes/templates.js';
import emailsRouter from './routes/emails.js';
import settingsRouter from './routes/settings.js';
import publicRouter from './routes/public.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload directories exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR, { recursive: true });

// Static assets for uploads (dynamic /tmp/uploads + repo static template fallback)
app.use('/uploads', express.static(UPLOAD_DIR));
const staticUploadsFallback = path.resolve(process.cwd(), 'uploads');
if (staticUploadsFallback !== UPLOAD_DIR && fs.existsSync(staticUploadsFallback)) {
  app.use('/uploads', express.static(staticUploadsFallback));
}

// Lazy database initialization for Vercel Serverless environment
let dbInitPromise: Promise<void> | null = null;
async function ensureDbInit() {
  if (!dbInitPromise) {
    dbInitPromise = initDatabase();
  }
  return dbInitPromise;
}

app.use(async (_req, _res, next) => {
  try {
    await ensureDbInit();
    next();
  } catch (err) {
    next(err);
  }
});

// Download direct helper route (forces browser download with clean filename)
app.get('/api/download/card/:format/:id', (req, res) => {
  const { format, id } = req.params;
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `VLBVN_Card_${safeId}.${format.toLowerCase()}`;
  const filePath = path.join(GENERATED_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found or not yet generated.' });
  }

  res.download(filePath, `VLBVN_Membership_Card_${safeId}.${format.toLowerCase()}`);
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/members', membersRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/emails', emailsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/public', publicRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'VLBVN Digital Membership & ID Card Management API'
  });
});

// Client static serving (if client/dist exists)
const clientDistPath = path.resolve(process.cwd(), '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred.'
  });
});

async function startServer() {
  try {
    await ensureDbInit();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  VLBVN Membership System running on http://localhost:${PORT}`);
      console.log(`  Uploads directory: ${UPLOAD_DIR}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal error during startup:', err);
    process.exit(1);
  }
}

// In local environment, start HTTP server directly; on Vercel, app is exported as serverless handler
if (!process.env.VERCEL) {
  startServer();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  (module.exports as any).default = app;
}

export default app;
