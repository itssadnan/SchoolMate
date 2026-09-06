import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { tenantMiddleware } from './middleware/tenant';
import apiRoutes from './routes/api';

const app = express();

// Enable CORS for frontend Vite dev server (usually localhost:5173) and any origin
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-code'],
  })
);

app.use(express.json());

// Multi-tenant resolution middleware
app.use(tenantMiddleware);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    platform: 'SchoolMate Multi-Tenant SIS & LMS',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount v1 API
app.use('/api/v1', apiRoutes);

// Global 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(ENV.PORT, () => {
  console.log(`🚀 SchoolMate Unified API running on http://localhost:${ENV.PORT}`);
  console.log(`📚 Multi-Tenant Engine Active with internal SQL storage`);
});
