import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Utilisateur from '../models/utilisateur.model.js';
import { apiResponse } from '../utils/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { getPool } from '../config/postgres.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';

export const register = async (req, res) => {
  const { nom, email, mot_de_passe } = req.body;
  const existing = await Utilisateur.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email déjà utilisé' });
  }
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(mot_de_passe, salt);
  const user = await Utilisateur.create({ nom, email, mot_de_passe: hashed });
  // Also store in Postgres (best-effort)
  try {
    const pool = getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO utilisateurs (mongo_id, nom, email, mot_de_passe, date_creation)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [String(user._id), user.nom, user.email, user.mot_de_passe, user.date_creation || new Date()]
      );
    }
  } catch (e) {
    console.error('Postgres insert (utilisateurs) failed:', e.message);
  }
  return apiResponse(res, { id: user._id, nom: user.nom, email: user.email }, 'Utilisateur créé', 201);
};

export const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;
  const user = await Utilisateur.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }
  const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
  if (!match) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }
  const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  // Set httpOnly cookie for secure storage
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  res.cookie('access_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: true, // Prevent CSRF attacks
    maxAge: maxAgeMs,
    path: '/',
  });
  return apiResponse(res, { token }, 'Connexion réussie');
};

export const getProfile = async (req, res) => {
  const user = await Utilisateur.findById(req.userId).select('-mot_de_passe');
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  return apiResponse(res, user, 'Profil utilisateur');
};

export const logout = async (_req, res) => {
  res.clearCookie('access_token', { path: '/' });
  return apiResponse(res, { ok: true }, 'Déconnexion réussie');
};