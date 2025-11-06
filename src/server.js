import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandlers.js';
import { csrfProtection, issueCsrfToken } from './middlewares/csrf.js';
import os from 'os';

const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to get your local network IP
function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Security & middleware
app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
    ].filter(Boolean);
    // Allow same-origin or non-browser requests (no origin header)
    if (!origin || allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes

// CSRF token issuing endpoint
app.get('/api/csrf-token', issueCsrfToken);

// Apply CSRF protection for state-changing requests
app.use(csrfProtection);

app.use('/api', apiRouter);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server after DB connection
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      const localIp = getLocalIp();
      console.log(`✅ Server running successfully!`);
      console.log(`→ Local:   http://localhost:${PORT}`);
      console.log(`→ Network: http://${localIp}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  });

  