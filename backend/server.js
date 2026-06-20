import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes, { customerAuthRouter } from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In development: allow all localhost/127.0.0.1 origins (any port).
// In production: only allow CLIENT_URL and ADMIN_URL from .env.
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: function (origin, callback) {
    // Requests with no origin (server-to-server, curl, Postman, etc.) → always allow
    if (!origin) return callback(null, true);

    // Development: allow any localhost / 127.0.0.1 port
    if (!isProduction) {
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
    }

    // Production: allow explicitly listed origins from .env, ignoring trailing slashes
    const cleanOrigin = origin.replace(/\/$/, '');
    const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : '';
    const adminUrl = process.env.ADMIN_URL ? process.env.ADMIN_URL.replace(/\/$/, '') : '';

    if (cleanOrigin === clientUrl || cleanOrigin === adminUrl) {
      return callback(null, true);
    }

    // Also allow any Cloudflare Pages branch deployments for these specific projects
    if (
      cleanOrigin.endsWith('.pricedekho-customer.pages.dev') ||
      cleanOrigin.endsWith('.pricedekho-admin.pages.dev') ||
      cleanOrigin === 'https://pricedekho-customer.pages.dev' ||
      cleanOrigin === 'https://pricedekho-admin.pages.dev'
    ) {
      return callback(null, true);
    }

    // Everything else → blocked
    console.log(`[CORS Blocked] Origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
}));
// ──────────────────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', authRoutes);   // /api/admin/login
app.use('/api/admin', adminRoutes);  // /api/admin/products
app.use('/api/auth', customerAuthRouter); // /api/auth/register, /api/auth/login
app.use('/api/settings', settingsRoutes); // /api/settings

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API running' });
});

// Basic test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Global error handler – catches anything thrown by routes/middleware
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
