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

const app = express();
const PORT = process.env.PORT || 3000;

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
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });