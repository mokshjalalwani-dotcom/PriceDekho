import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import logger from './utils/logger.js';

// Fix for MongoDB Atlas ECONNREFUSED SRV errors on some Windows environments
dns.setServers(['8.8.8.8', '8.8.4.4']);

import connectDB from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes, { customerAuthRouter } from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import subCategoryRoutes from './routes/subCategoryRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import syncRoutes from './routes/sync.routes.js';
import { initSyncScheduler } from './jobs/syncScheduler.job.js';
import { initReservationExpiryJob } from './jobs/reservationExpiry.job.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Connect to Database
connectDB();

// Initialize schedulers
initSyncScheduler();
initReservationExpiryJob();

const app = express();

app.set('trust proxy', 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In development: allow all localhost/127.0.0.1 origins (any port).
// In production: only allow CLIENT_URL and ADMIN_URL from .env.
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  'https://pricedekho-customer.pages.dev',
  'https://www.satguru.shop',
  'https://satguru.shop',
  'https://pricedekho-admin.pages.dev',
  'https://main.pricedekho-admin.pages.dev'
];

app.use((req, res, next) => {
  // Temporary logging for debugging incoming request origin
  if (req.headers.origin) {
    console.log(`[CORS Check] Incoming Request Origin: ${req.headers.origin} | Path: ${req.path}`);
  }
  next();
});

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

    if (
      cleanOrigin === clientUrl || 
      cleanOrigin === adminUrl ||
      allowedOrigins.includes(cleanOrigin)
    ) {
      return callback(null, true);
    }

    // Also allow any Cloudflare Pages branch deployments for these specific projects
    if (
      cleanOrigin.endsWith('.pricedekho-customer.pages.dev') ||
      cleanOrigin.endsWith('.pricedekho-admin.pages.dev')
    ) {
      return callback(null, true);
    }

    // Everything else → blocked
    console.log(`[CORS Blocked] Origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
// ──────────────────────────────────────────────────────────────────────────────

app.use(helmet({ crossOriginResourcePolicy: false })); // Apply security headers (allow image loads)
app.use(compression()); // Compress responses for performance

app.use(express.json({ limit: '2mb' })); // Strict limit for payloads
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

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
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/admin/sync', syncRoutes);

// Health check route (Task 4 implementation)
app.get('/api/health', async (req, res) => {
  try {
    // Check DB Connection
    const dbState = mongoose.connection.readyState;
    const isDbConnected = dbState === 1;
    if (!isDbConnected) throw new Error('Database not connected');
    
    res.status(200).json({ status: 'ok', message: 'System healthy', dbState });
  } catch (err) {
    logger.error(`Health check failed: ${err.message}`);
    res.status(503).json({ status: 'error', message: err.message });
  }
});

// Basic test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Global error handler – catches anything thrown by routes/middleware
app.use((err, req, res, next) => {
  logger.error(`[Global Error] ${err.message}`, { stack: err.stack, path: req.path });
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
