import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Ensure a consistent JWT secret fallback when env is missing
// Must match the controller's signing secret default
const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  // Prefer Authorization Bearer; fallback to cookie for httpOnly setup
  let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token && req.cookies) {
    token = req.cookies.access_token || null;
  }

  if (!token) return res.status(401).json({ message: 'Token manquant' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};