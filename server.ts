import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

import authRoutes from './backend/src/routes/auth.routes.js';
import pickupRoutes from './backend/src/routes/pickup.routes.js';
import adminDriverRoutes from './backend/src/routes/admin-driver.routes.js';
import adminPemdaRoutes from './backend/src/routes/admin-pemda.routes.js';
import inventoryRoutes from './backend/src/routes/inventory.routes.js';
import analyticsRoutes from './backend/src/routes/analytics.routes.js';
// TODO: RESTORE AUTH — routes ditambahkan agar semua endpoint aktif di dev server
import expeditionRoutes from './backend/src/routes/expedition.routes.js';
import superadminRoutes from './backend/src/routes/superadmin.routes.js';
import publicRoutes from './backend/src/routes/public.routes.js';
import aiRoutes from './backend/src/routes/ai.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Real Database API Routes
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // Public routes (no auth required)
  app.use('/api/public', publicRoutes);

  app.use('/api/auth', authRoutes);
  app.use('/api/pickups', pickupRoutes);
  app.use('/api/admin-driver', adminDriverRoutes);
  app.use('/api/admin-pemda', adminPemdaRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/expedition', expeditionRoutes);
  app.use('/api/superadmin', superadminRoutes);
  app.use('/api/ai', aiRoutes);

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

