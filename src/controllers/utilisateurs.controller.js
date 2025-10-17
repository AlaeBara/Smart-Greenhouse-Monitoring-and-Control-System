import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Utilisateur from '../models/utilisateur.model.js';
import { apiResponse } from '../utils/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req, res) => {
  const { nom, email, mot_de_passe } = req.body;
  const existing = await Utilisateur.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email déjà utilisé' });
  }
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(mot_de_passe, salt);
  const user = await Utilisateur.create({ nom, email, mot_de_passe: hashed });
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
  return apiResponse(res, { token }, 'Connexion réussie');
};

export const getProfile = async (req, res) => {
  const user = await Utilisateur.findById(req.userId).select('-mot_de_passe');
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  return apiResponse(res, user, 'Profil utilisateur');
};