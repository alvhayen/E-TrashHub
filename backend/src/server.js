// CATATAN: File ini adalah server standalone untuk development terpisah.
// Dalam setup monorepo ini, gunakan 'npm run dev' di root yang menjalankan server.ts.
// Jangan jalankan file ini bersamaan dengan server.ts.
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes.js';
import pickupRoutes from './routes/pickup.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';
import publicRoutes from './routes/public.routes.js';
import expeditionRoutes from './routes/expedition.routes.js';
import aiRoutes from './routes/ai.routes.js';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Public routes (no auth required)
app.use('/api/public', publicRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/expedition', expeditionRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, prisma };
