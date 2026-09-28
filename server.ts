import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes.js';
import { getDatabase } from './server/db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Catch-all for unhandled /api routes (prevents serving index.html for API 404s)
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

async function startServer() {
  // Ensure database is initialized
  try {
    await getDatabase();
    console.log('SQLite database initialized successfully');
  } catch (dbErr) {
    console.error('Database initialization error:', dbErr);
  }

  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

  if (!isProduction) {
    // Vite Dev Server middleware mode for local development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Running in DEVELOPMENT mode with Vite middleware');
  } else {
    // Production static serving for built Vite assets
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Fallback all SPA routes to index.html
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Running in PRODUCTION mode serving static files from ${distPath}`);
  }

  // Global Error Handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScamBait Cyber Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
