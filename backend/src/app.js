import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();

// Helmet security headers (configured to allow cross-origin resource access for public uploads)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mount public static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// --- SERVE FRONTEND (Added for Unified Architecture) ---
const frontendPath = path.join(__dirname, '../../');
app.use(express.static(frontendPath));

// Route /admin to admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin.html'));
});


// CORS configuration (no wildcard * in production)
const allowedOrigin = (process.env.CORS_ORIGIN || 'http://localhost:5500').replace(/['\"]/g, '');
app.use(cors({
  origin: (origin, callback) => {
    // Allow request if origin matches env configuration, or if it is a local fetch (no origin)
    if (!origin || origin === allowedOrigin || allowedOrigin === '*') {
      callback(null, true);
    } else {
      callback(new Error('CORS xətası: Mənbəyə icazə verilmir.'));
    }
  },
  credentials: true
}));

// Cookie Parser is required for secure HTTP-only cookie sessions
app.use(cookieParser());

// Body parsers with payload restrictions
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api', apiRouter); // Public routes

// Undefined API handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Müvafiq API tapılmadı.' }
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR HANDLER:', err);

  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Do not expose raw database/system issues in production
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: isProduction ? 'Daxili server xətası baş verdi.' : err.message
    }
  });
});

export default app;
