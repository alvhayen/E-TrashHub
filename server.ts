import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

import authRoutes from './backend/src/routes/auth.routes.js';
import pickupRoutes from './backend/src/routes/pickup.routes.js';
import inventoryRoutes from './backend/src/routes/inventory.routes.js';
import analyticsRoutes from './backend/src/routes/analytics.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Real Database API Routes
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/pickup', pickupRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Global Error Handler
  app.use(errorHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production configuration
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support React Router for Express v4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
